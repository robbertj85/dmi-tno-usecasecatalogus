#!/usr/bin/env python3
"""
Extract the DMI use-case catalogue from the four source .docx files into
src/data/usecases.ts.

Run with `npm run extract` after any revision of the Word documents.

Each use case in the documents is a two-column table with a consistent
9-row schema (naam / hoofd thema / waarom / niveau / beleidsdomeinen /
functionaliteiten / analyse / data / voorbeelden). The document body is
walked in order so that every table inherits the H1/H2/H3 heading context
printed above it.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

try:
    import docx
    from docx.oxml.ns import qn
    from docx.table import Table
    from docx.text.paragraph import Paragraph
except ImportError:  # pragma: no cover
    sys.exit("python-docx is required:  pip3 install python-docx")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "usecases.ts"

# The italic placeholder text that marks the blank format table reproduced in
# the "Uitgangspunt" chapter of every document.
TEMPLATE_MARKER = "aansprekende en duidelijke naam"


# --------------------------------------------------------------------------
# Source documents
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class Source:
    filename: str
    domain: str
    status: str
    # mobility/energie nest use cases (H3) under a thema (H2); klimaatadaptatie
    # and gezondheid do not.
    has_thema_level: bool
    # gezondheid restates every use case a second time in condensed form; the
    # condensed twin supplies the one-line samenvatting.
    condensed_twins: bool = False


SOURCES = [
    Source(
        "Use cases catalogus - mobility domain V2 _schoon.docx",
        "mobiliteit",
        "definitief",
        has_thema_level=True,
    ),
    Source(
        "Use cases catalogus -energy domain concept 3_schoon.docx",
        "energie",
        "concept",
        has_thema_level=True,
    ),
    Source(
        "Use cases catalogus - klimaatadaptatie domein concept 1_DRAFT.docx",
        "klimaatadaptatie",
        "draft",
        has_thema_level=False,
    ),
    Source(
        "Use Cases DMI health V1_1.docx",
        "gezondheid",
        "definitief",
        has_thema_level=False,
        condensed_twins=True,
    ),
]


# --------------------------------------------------------------------------
# Text helpers
# --------------------------------------------------------------------------


# Word stores Symbol/Wingdings list bullets as Private Use Area code points
# ( is the Symbol-font "•"). They have no glyph in a web font and would
# render as tofu, so they are dropped rather than carried through.
PRIVATE_USE = re.compile("[\\ue000-\\uf8ff]")


def norm(text: str) -> str:
    """NFKC-normalise, drop Word's symbol-font bullets, replace nbsp."""
    return PRIVATE_USE.sub("", unicodedata.normalize("NFKC", text)).replace("\xa0", " ").strip()


def clean_heading(text: str) -> str:
    """Strip Word numbering ("2.4.2 ") and stray bold markers from a heading."""
    text = norm(text).replace("**", "")
    text = re.sub(r"^\d+(\.\d+)*\.?\s+", "", text)
    return re.sub(r"\s+", " ", text).strip(" .")


BULLETS = "•·‣▪◦-–—*"


def to_lines(cell_text: str) -> list[str]:
    """Split a cell into list items, stripping bullet glyphs and empties."""
    out: list[str] = []
    for raw in norm(cell_text).split("\n"):
        line = raw.strip().lstrip(BULLETS).strip()
        if line:
            out.append(line)
    return out


def to_prose(cell_text: str) -> str:
    return "\n".join(to_lines(cell_text))


def first_sentence(prose: str) -> str:
    """A card-sized teaser: grow by sentence until it reads as a full thought."""
    flat = " ".join(prose.split())
    if not flat:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", flat)
    teaser = ""
    for part in parts:
        teaser = f"{teaser} {part}".strip()
        if len(teaser) >= 90:
            break
    return teaser


def slugify(name: str) -> str:
    ascii_name = (
        unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    )
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_name.lower()).strip("-")
    words = slug.split("-")
    while len("-".join(words)) > 60 and len(words) > 3:
        words.pop()
    return "-".join(words)


# --------------------------------------------------------------------------
# Field label matching (labels vary in spelling and casing between documents)
# --------------------------------------------------------------------------

FIELD_PREFIXES = {
    "naam": ("use case naam", "use case name"),
    "hoofdthema": ("hoofd thema",),
    "waarom": ("beschrijving",),
    "niveau": ("niveau",),
    "beleidsdomeinen": ("relevante beleidsdomeinen",),
    "functionaliteiten": ("benodigde functionaliteiten",),
    "analyse": ("benodigde analyse",),
    "data": ("benodigde data",),
    "voorbeelden": ("voorbeeld",),
}


def read_table(table: Table) -> dict[str, str]:
    """Map a use-case table onto our canonical field keys."""
    fields: dict[str, str] = {}
    for row in table.rows:
        cells = row.cells
        label = norm(cells[0].text).replace("\n", " ").lower()
        value = cells[1].text if len(cells) > 1 else ""
        for key, prefixes in FIELD_PREFIXES.items():
            if key not in fields and any(label.startswith(p) for p in prefixes):
                fields[key] = value
                break
    return fields


# --------------------------------------------------------------------------
# Taxonomy normalisation
# --------------------------------------------------------------------------

# Keyword → one of the canonical 8 beleidsdomeinen. A single raw token may hit
# several (e.g. "Wonen en Ruimtelijke Ordening"), which is intentional.
BELEIDSDOMEIN_KEYWORDS: list[tuple[str, str]] = [
    ("ruimtelijke ordening", "ruimtelijke_ordening"),
    ("ruimtelijke ontwikkeling", "ruimtelijke_ordening"),
    ("gebouwde omgeving", "ruimtelijke_ordening"),
    (r"\bro\b", "ruimtelijke_ordening"),
    ("wonen", "wonen"),
    ("verkeer", "verkeer_vervoer"),
    ("mobiliteit", "verkeer_vervoer"),
    ("logistiek", "verkeer_vervoer"),
    ("scheepvaart", "verkeer_vervoer"),
    ("bereikbaarheid", "verkeer_vervoer"),
    ("veiligheid", "veiligheid"),
    ("energie", "energie_klimaat"),
    ("klimaat", "energie_klimaat"),
    ("laadinfra", "energie_klimaat"),
    ("laden", "energie_klimaat"),
    ("netbeheer", "energie_klimaat"),
    ("warmte", "energie_klimaat"),
    ("duurzaamheid", "energie_klimaat"),
    ("luchtkwaliteit", "energie_klimaat"),
    ("milieu", "milieu_natuur_ecologie"),
    ("natuur", "milieu_natuur_ecologie"),
    ("ecolog", "milieu_natuur_ecologie"),
    ("groen", "milieu_natuur_ecologie"),
    ("gezondheid", "gezondheid_welzijn"),
    ("welzijn", "gezondheid_welzijn"),
    ("zorg", "gezondheid_welzijn"),
    ("sociaal domein", "gezondheid_welzijn"),
    ("inclusie", "gezondheid_welzijn"),
    ("economie", "economische_vitaliteit"),
    ("economisch", "economische_vitaliteit"),
    ("circulariteit", "economische_vitaliteit"),
    ("bedrijventerrein", "economische_vitaliteit"),
    ("innovatie", "economische_vitaliteit"),
]

BELEIDSDOMEIN_ORDER = [
    "ruimtelijke_ordening",
    "wonen",
    "verkeer_vervoer",
    "veiligheid",
    "energie_klimaat",
    "milieu_natuur_ecologie",
    "gezondheid_welzijn",
    "economische_vitaliteit",
]


def split_domains(raw: str) -> list[str]:
    flat = norm(raw).replace("\n", ";")
    return [p.strip(" .()") for p in re.split(r"[;,]", flat) if p.strip(" .()")]


def parse_beleidsdomeinen(raw: str) -> tuple[list[str], list[str]]:
    """Return (canonical 8, everything else kept verbatim)."""
    canonical: list[str] = []
    overige: list[str] = []
    for token in split_domains(raw):
        low = token.lower()
        hits = [
            key
            for kw, key in BELEIDSDOMEIN_KEYWORDS
            if (re.search(kw, low) if kw.startswith(r"\b") else kw in low)
        ]
        if hits:
            for key in hits:
                if key not in canonical:
                    canonical.append(key)
        else:
            cleaned = re.sub(r"^alle\s*", "", token, flags=re.I).strip()
            if cleaned and cleaned not in overige:
                overige.append(cleaned)
    canonical.sort(key=BELEIDSDOMEIN_ORDER.index)
    return canonical, overige


NIVEAU_ORDER = ["strategisch", "tactisch", "operationeel"]


def parse_niveaus(raw: str) -> list[str]:
    low = norm(raw).lower()
    if "alle niveau" in low:
        return list(NIVEAU_ORDER)
    found = [n for n in NIVEAU_ORDER if n[:-3] in low]
    return found


# --------------------------------------------------------------------------
# Document walking
# --------------------------------------------------------------------------


@dataclass
class Extracted:
    fields: dict[str, str]
    thema: str
    heading: str
    toelichting: str = ""


@dataclass
class ThemaRecord:
    id: str
    domain: str
    name: str
    intro: str = ""
    usecase_ids: list[str] = field(default_factory=list)


def iter_blocks(document):
    for child in document.element.body.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, document)
        elif child.tag == qn("w:tbl"):
            yield Table(child, document)


def heading_level(paragraph: Paragraph) -> int | None:
    style = paragraph.style.name or ""
    if not style.startswith("Heading"):
        return None
    tail = style.split()[-1]
    return int(tail) if tail.isdigit() else 1


@dataclass
class Walked:
    tables: list[Extracted]
    thema_intros: dict[str, str]
    domain_intro: str
    # The shared "Uitgangspunt" chapter: prose, plus the blank format table
    # explaining each field. Identical in every document that carries it.
    uitgangspunt: str
    formaat: list[tuple[str, str]]


def walk(source: Source) -> Walked:
    document = docx.Document(str(ROOT / source.filename))
    headings: dict[int, str] = {}
    thema_intros: dict[str, list[str]] = {}
    domain_intro: list[str] = []
    uitgangspunt: list[str] = []
    formaat: list[tuple[str, str]] = []
    thema_closed: set[str] = set()
    tables: list[Extracted] = []
    in_domain_chapter = False
    # Prose sitting directly above a table, which is where the gezondheid
    # document (the one without any headings) puts its per-use-case framing.
    pending: list[str] = []

    for block in iter_blocks(document):
        if isinstance(block, Paragraph):
            level = heading_level(block)
            text = clean_heading(block.text)
            if level is not None:
                headings[level] = text
                for deeper in [k for k in headings if k > level]:
                    del headings[deeper]
                if level == 1:
                    in_domain_chapter = text.lower().startswith("use cases voor")
                elif level == 2 and in_domain_chapter:
                    thema_intros.setdefault(text, [])
                pending = []
                continue

            body = norm(block.text)
            if not body:
                continue
            if headings.get(1, "").lower().startswith("uitgangspunt"):
                if not body.lower().startswith("figuur"):
                    uitgangspunt.append(body)
                continue
            if not headings:
                # Headingless document: the first paragraph titles the chapter,
                # the rest introduce the table that follows.
                (domain_intro if not domain_intro and not tables else pending).append(body)
                continue
            if not in_domain_chapter:
                continue
            thema = headings.get(2)
            if thema is not None and headings.get(3) is None:
                # Only prose *above* the thema's first use-case table introduces
                # the thema; anything after it belongs to that use case.
                if thema not in thema_closed:
                    thema_intros.setdefault(thema, []).append(body)
            elif thema is None:
                domain_intro.append(body)
        else:
            fields = read_table(block)
            if "naam" not in fields:
                pending = []
                continue
            if TEMPLATE_MARKER in norm(fields["naam"]).lower():
                if not formaat:
                    formaat = [
                        (norm(row.cells[0].text).replace("\n", " / "), to_prose(row.cells[1].text))
                        for row in block.rows
                        if norm(row.cells[0].text)
                    ]
                pending = []
                continue
            # Where the document nests use cases under a thema, only the H3 is a
            # use-case title — falling back to the H2 would name the use case
            # after its thema.
            if source.has_thema_level:
                thema, heading = headings.get(2, ""), headings.get(3, "")
            else:
                thema, heading = "", headings.get(2, "")
            tables.append(
                Extracted(
                    fields=fields,
                    thema=thema,
                    heading=heading,
                    toelichting="\n".join(pending),
                )
            )
            if thema:
                # A table without its own H3 is usually preceded by a
                # pseudo-heading paragraph ("2.4.1 Implementatie van …") that
                # titles the use case rather than introducing the thema.
                intro_lines = thema_intros.get(thema)
                if not heading and intro_lines and thema not in thema_closed:
                    last = intro_lines[-1]
                    if len(last) < 120 and not last.endswith((".", ":", "?")):
                        intro_lines.pop()
                thema_closed.add(thema)
            pending = []

    return Walked(
        tables=tables,
        thema_intros={k: "\n".join(v) for k, v in thema_intros.items()},
        domain_intro="\n".join(domain_intro),
        uitgangspunt="\n".join(uitgangspunt),
        formaat=formaat,
    )


# --------------------------------------------------------------------------
# Build records
# --------------------------------------------------------------------------


def build():
    usecases: list[dict] = []
    themas: dict[tuple[str, str], ThemaRecord] = {}
    domain_intros: dict[str, str] = {}
    seen_slugs: set[str] = set()
    uitgangspunt = ""
    formaat: list[tuple[str, str]] = []

    for source in SOURCES:
        walked = walk(source)
        tables, thema_intros = walked.tables, walked.thema_intros
        domain_intros[source.domain] = walked.domain_intro
        if not uitgangspunt and walked.uitgangspunt:
            uitgangspunt = walked.uitgangspunt
        if not formaat and walked.formaat:
            formaat = walked.formaat

        if source.condensed_twins:
            half = len(tables) // 2
            detailed, condensed = tables[:half], tables[half:]
        else:
            detailed, condensed = tables, []

        for index, item in enumerate(detailed):
            fields = item.fields
            naam_cell = to_prose(fields.get("naam", ""))
            heading = item.heading

            # The heading is the authoritative name where one exists; a few naam
            # cells hold a paragraph of prose instead of a title.
            if source.has_thema_level:
                name = heading or naam_cell
            else:
                name = naam_cell or heading
            if len(name) > 110 and heading:
                name = heading
            name = name.strip(" .")

            waarom = to_prose(fields.get("waarom", ""))
            if condensed:
                samenvatting = first_sentence(to_prose(condensed[index].fields.get("waarom", "")))
            else:
                samenvatting = first_sentence(waarom)

            niveau_raw = to_prose(fields.get("niveau", ""))
            domeinen_raw = to_prose(fields.get("beleidsdomeinen", ""))
            canonical, overige = parse_beleidsdomeinen(domeinen_raw)

            slug = slugify(name)
            suffix = 2
            while slug in seen_slugs:
                slug = f"{slugify(name)}-{suffix}"
                suffix += 1
            seen_slugs.add(slug)

            thema = item.thema
            if thema:
                key = (source.domain, thema)
                if key not in themas:
                    themas[key] = ThemaRecord(
                        id=slugify(f"{source.domain}-{thema}"),
                        domain=source.domain,
                        name=thema,
                        intro=thema_intros.get(thema, ""),
                    )
                themas[key].usecase_ids.append(slug)

            usecases.append(
                {
                    "id": slug,
                    "name": name,
                    "domain": source.domain,
                    "thema": thema,
                    "hoofdthema": to_prose(fields.get("hoofdthema", "")),
                    "samenvatting": samenvatting,
                    "toelichting": item.toelichting,
                    "waarom": waarom,
                    "niveaus": parse_niveaus(niveau_raw),
                    "niveauRaw": niveau_raw,
                    "beleidsdomeinen": canonical,
                    "overigeBeleidsdomeinen": overige,
                    "beleidsdomeinenRaw": domeinen_raw,
                    "functionaliteiten": to_lines(fields.get("functionaliteiten", "")),
                    "analyse": to_lines(fields.get("analyse", "")),
                    "benodigdeData": to_lines(fields.get("data", "")),
                    "voorbeelden": to_lines(fields.get("voorbeelden", "")),
                    "bron": {"document": source.filename, "status": source.status},
                }
            )

    bronnen = [
        {
            "domain": s.domain,
            "document": s.filename,
            "status": s.status,
            "aantal": sum(1 for uc in usecases if uc["domain"] == s.domain),
        }
        for s in SOURCES
    ]
    return usecases, list(themas.values()), domain_intros, uitgangspunt, formaat, bronnen


# --------------------------------------------------------------------------
# Emit TypeScript
# --------------------------------------------------------------------------


def ts(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


HEADER = """// ============================================================
// AUTO-GENERATED — do not edit.
//
// Generated by scripts/extract-usecases.py from the four DMI use-case
// catalogue Word documents. Re-run `npm run extract` after any revision
// of those documents.
//
// Labels, colours and display taxonomy live in ./taxonomy.ts and are
// maintained by hand.
// ============================================================

import type { UseCase, Thema, Domain, Bron, FormaatVeld } from "./types";

"""


def main() -> None:
    missing = [s.filename for s in SOURCES if not (ROOT / s.filename).exists()]
    if missing:
        sys.exit("Missing source document(s):\n  " + "\n  ".join(missing))

    usecases, themas, domain_intros, uitgangspunt, formaat, bronnen = build()

    thema_json = [
        {
            "id": t.id,
            "domain": t.domain,
            "name": t.name,
            "intro": t.intro,
            "usecaseIds": t.usecase_ids,
        }
        for t in themas
    ]

    body = HEADER
    body += f"export const useCases: UseCase[] = {ts(usecases)};\n\n"
    body += f"export const themas: Thema[] = {ts(thema_json)};\n\n"
    body += (
        "export const domainIntros: Record<Domain, string> = "
        f"{ts(domain_intros)};\n\n"
    )
    body += f"export const uitgangspunt = {ts(uitgangspunt)};\n\n"
    body += (
        "export const formaat: FormaatVeld[] = "
        f"{ts([{'veld': v, 'toelichting': t} for v, t in formaat])};\n\n"
    )
    body += (
        "export const bronnen: (Bron & { domain: Domain; aantal: number })[] = "
        f"{ts(bronnen)};\n"
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="utf-8")

    # Report — the counts are the contract with the plan's verification step.
    by_domain: dict[str, int] = {}
    for uc in usecases:
        by_domain[uc["domain"]] = by_domain.get(uc["domain"], 0) + 1
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"  {len(usecases)} use cases across {len(by_domain)} domeinen")
    for domain, count in by_domain.items():
        print(f"    {domain:<18} {count}")
    print(f"  {len(themas)} thema's")
    overig = sorted({o for uc in usecases for o in uc["overigeBeleidsdomeinen"]})
    if overig:
        print("  beleidsdomeinen buiten de canonieke 8 (behouden, niet weggegooid):")
        for o in overig:
            print(f"    - {o}")
    empty = [uc["id"] for uc in usecases if not uc["beleidsdomeinen"]]
    if empty:
        print(f"  WARNING: no beleidsdomein matched for: {', '.join(empty)}")


if __name__ == "__main__":
    main()
