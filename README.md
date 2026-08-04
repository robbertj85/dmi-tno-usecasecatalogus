# DMI Use Cases Catalogus

Webapp voor de use-case catalogus van het DMI-Ecosysteem: 39 use cases uit vier
domeincatalogi (mobiliteit, energie, klimaatadaptatie, gezondheid & welzijn),
doorzoekbaar en gefilterd, met een matrix die laat zien waar de domeinen elkaar
raken.

Zusterapplicatie van `tno-methodieken` en gebouwd op dezelfde stack: Next.js 16
(App Router), React 19, Tailwind v4 (CSS-first), shadcn `base-nova` op Base UI,
IBM Plex.

## Ontwikkelen

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

## Data

De catalogus wordt **gegenereerd** uit de vier Word-brondocumenten in de root
van dit project:

| Document | Domein | Use cases |
|---|---|---|
| `Use cases catalogus - mobility domain V2 _schoon.docx` | Mobiliteit | 17 |
| `Use cases catalogus -energy domain concept 3_schoon.docx` | Energie | 13 |
| `Use Cases DMI health V1_1.docx` | Gezondheid & Welzijn | 5 |
| `Use cases catalogus - klimaatadaptatie domein concept 1_DRAFT.docx` | Klimaatadaptatie | 4 |

Na een nieuwe versie van een document:

```bash
npm run extract
```

Dat draait `scripts/extract-usecases.py` (vereist `python-docx`) en herschrijft
`src/data/usecases.ts`. Het script rapporteert de aantallen per domein en welke
beleidsdomeinen buiten de canonieke 8 vielen, zodat je kunt zien dat er niets
stilzwijgend is weggevallen.

De brondocumenten staan in `.gitignore` en horen niet in de repo.

### Bestanden

| Bestand | Rol |
|---|---|
| `src/data/usecases.ts` | **Gegenereerd** — niet met de hand aanpassen |
| `src/data/types.ts` | Datamodel (`UseCase`, `Thema`, `Bron`, …) |
| `src/data/taxonomy.ts` | Labels en kleuren per domein, niveau en beleidsdomein — handmatig onderhouden |
| `src/lib/filters.ts` | Eén filterpredicaat, gedeeld door de kaarten- en matrixweergave |
| `scripts/extract-usecases.py` | Word → TypeScript |

## Beeld

**Kaartillustraties** (`src/components/usecase-artwork.tsx`) — een
procedureel domeinmotief per kaart: stroomlijnen voor mobiliteit, een
netwerkraster voor energie, contourbanden voor klimaatadaptatie en
celstructuren voor gezondheid. Geseed op de use-case-id, dus elke kaart is
uniek maar herkenbaar van zijn domein. Deterministisch via `src/lib/seed.ts`
(FNV-1a + mulberry32) — nooit `Math.random()` — zodat server en browser
hetzelfde tekenen en een use case zijn illustratie behoudt tussen builds.

**De 8 domeinen** (`src/components/domeinen-figuur.tsx`) — de figuur uit de
brondocumenten nagetekend als SVG: een centrale knoop met acht satellieten in
de ordening van het origineel (Wonen op twaalf uur) en de kleuren uit het
origineel (`#002484` / `#C15308`). Op een use-casepagina lichten alleen de
beleidsdomeinen op die aan dat vraagstuk raken, elk in zijn eigen DMI-kleur;
de rest blijft de originele navy contour. Op `/over` staat de volledige versie
met de DMI-visie in de kern.

**Graafweergave** (`src/components/relatie-graaf.tsx`) — dezelfde data als de
matrix, maar als bipartiete graaf in 3D: 39 benoemde use cases verbonden met de
beleidsdomeinen die ze raken. Slepen draait, shift+slepen verschuift, scrollen
zoomt. Eigen force-layout in `src/lib/force-graph.ts` — geen 3D-dependency.
Labels worden geplaatst met een greedy botsingscontrole (hubs eerst, daarna de
best verbonden use cases); een weggelaten label komt terug bij hover.

## Routes

| Route | Inhoud |
|---|---|
| `/` | Catalogus: filters + kaarten- of matrixweergave. Filterstatus staat in de querystring, dus elke gefilterde weergave is een deelbare link. |
| `/usecase/[slug]` | Volledige uitwerking van één use case (statisch gegenereerd voor alle 39). |
| `/over` | Uitgangspunt, het format, de 8 beleidsdomeinen en de bronstatus per document. |
