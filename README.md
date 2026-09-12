# DMI Use Cases Catalogus

Webapp voor de use-case catalogus van het DMI-Ecosysteem: 91 use cases uit
zeven domeinen (energie, mobiliteit, circulariteit, klimaatadaptatie,
gezondheid & welzijn, veiligheid, milieu/natuur/ecologie), doorzoekbaar en
gefilterd, met een matrix die laat zien waar de domeinen elkaar raken. Het
achtste domein, ruimtelijke ordening & wonen, is in de bron geen set use cases
maar een aanpak in vijf stappen; die staat op `/over`.

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

De catalogus wordt **gegenereerd** uit het geconsolideerde TNO-rapport
*DMI Use Case catalogus alle domeinen* (TNO-2026-17923), dat als Word-bestand
in `source-docs/` staat:

| Document | Inhoud |
|---|---|
| `source-docs/TNO-2026-17923 Use cases catalogus.docx` | 91 use cases in 7 domeinen (22 thema's) + de vijf stappen voor ruimtelijke ordening & wonen |

| Domein | Use cases |
|---|---|
| Energie | 13 |
| Mobiliteit | 17 |
| Circulariteit | 19 |
| Klimaatadaptatie | 13 |
| Gezondheid & Welzijn | 5 |
| Veiligheid | 14 |
| Milieu, Natuur & Ecologie | 10 |

De vier losse domeincatalogi waar de eerste versie van de app op gebouwd was
staan ter referentie in `source-docs/archief/`; het script leest ze niet meer.

Na een nieuwe versie van het rapport:

```bash
npm run extract
```

Dat draait `scripts/extract-usecases.py` (vereist `python-docx`) en herschrijft
`src/data/usecases.ts`. Het script rapporteert de aantallen per domein, welke
beleidsdomeinen buiten de canonieke 8 vielen en welke tabellen velden missen,
zodat je kunt zien dat er niets stilzwijgend is weggevallen.

De map `source-docs/` staat in `.gitignore`; de brondocumenten horen niet in de
repo.

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
netwerkraster voor energie, contourbanden voor klimaatadaptatie,
celstructuren voor gezondheid, open lussen voor circulariteit, rimpelingen
voor veiligheid en vertakkende stengels voor milieu, natuur & ecologie. Geseed op de use-case-id, dus elke kaart is
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
matrix, maar als bipartiete graaf in 3D: 91 benoemde use cases verbonden met de
beleidsdomeinen die ze raken. Slepen draait, shift+slepen verschuift, scrollen
zoomt. Eigen force-layout in `src/lib/force-graph.ts` — geen 3D-dependency.
Labels worden geplaatst met een greedy botsingscontrole (hubs eerst, daarna de
best verbonden use cases); een weggelaten label komt terug bij hover.

## Deployment

Het project staat op Vercel maar levert voorlopig alleen preview-deployments
op. `vercel.json` zet automatische deployments van `main` uit:

```json
{ "git": { "deploymentEnabled": { "main": false } } }
```

Werken doe je dus op een branch — `preview` is daarvoor bedoeld. Elke push
daarheen levert een preview-URL op; `main` levert niets op.

Let op: Vercel maakt van de **eerste** deployment van een project altijd een
productie-deployment, ongeacht de branch en ongeacht `--target=preview`. Dat is
een bootstrap-regel die je niet kunt omzeilen; daarna gedragen branch-pushes
zich wel als preview.

Zodra `main` naar productie mag: haal het `git`-blok uit `vercel.json` (of zet
het op `true`).

## Routes

| Route | Inhoud |
|---|---|
| `/` | Catalogus: filters + kaarten- of matrixweergave. Filterstatus staat in de querystring, dus elke gefilterde weergave is een deelbare link. |
| `/usecase/[slug]` | Volledige uitwerking van één use case (statisch gegenereerd voor alle 91). |
| `/over` | Uitgangspunt, het format, de 8 beleidsdomeinen, de vijf stappen voor ruimtelijke ordening & wonen en de bron per domein. |
