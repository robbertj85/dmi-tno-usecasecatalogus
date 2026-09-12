// ============================================================
// Taxonomy — labels and colours for the catalogue's facets.
//
// Hand-maintained. The generated ./usecases.ts never touches this file.
// Colours follow the DMI palette already used in the methodieken app; the
// three domains added with the consolidated report reuse the beleidsdomein
// colours below (circulariteit, veiligheid, milieu) so the two stay in step.
// ============================================================

import type { Beleidsdomein, Domain, Niveau } from "./types";

// ------------------------------------------------------------
// Domein — one per chapter of the source report
// ------------------------------------------------------------

export const domainLabels: Record<Domain, string> = {
  mobiliteit: "Mobiliteit",
  energie: "Energie",
  klimaatadaptatie: "Klimaatadaptatie",
  gezondheid: "Gezondheid & Welzijn",
  circulariteit: "Circulariteit",
  veiligheid: "Veiligheid",
  milieu_natuur_ecologie: "Milieu, Natuur & Ecologie",
};

export const domainColors: Record<Domain, string> = {
  mobiliteit: "bg-[#7ECBC0] text-[#004B87]",
  energie: "bg-[#F2A900] text-[#004B87]",
  klimaatadaptatie: "bg-[#0091B3] text-white",
  gezondheid: "bg-[#5CB85C] text-white",
  circulariteit: "bg-[#664575] text-white",
  veiligheid: "bg-[#9B4945] text-white",
  milieu_natuur_ecologie: "bg-[#4E6838] text-white",
};

export const domainHex: Record<Domain, string> = {
  mobiliteit: "#7ECBC0",
  energie: "#F2A900",
  klimaatadaptatie: "#0091B3",
  gezondheid: "#5CB85C",
  circulariteit: "#664575",
  veiligheid: "#9B4945",
  milieu_natuur_ecologie: "#4E6838",
};

/** Readable text colour on top of a solid `domainHex` fill. */
export const domainOnHex: Record<Domain, string> = {
  mobiliteit: "#00355F",
  energie: "#00355F",
  klimaatadaptatie: "#FFFFFF",
  gezondheid: "#FFFFFF",
  circulariteit: "#FFFFFF",
  veiligheid: "#FFFFFF",
  milieu_natuur_ecologie: "#FFFFFF",
};

export const domainBgLight: Record<Domain, string> = {
  mobiliteit: "bg-[#E6F5F3]",
  energie: "bg-[#FFF6E0]",
  klimaatadaptatie: "bg-[#E0F4F9]",
  gezondheid: "bg-[#E8F5E9]",
  circulariteit: "bg-[#EFE9F2]",
  veiligheid: "bg-[#F5EAE9]",
  milieu_natuur_ecologie: "bg-[#EAF0E4]",
};

/** Same tints as `domainBgLight`, for SVG fills which cannot take a class. */
export const domainBgLightHex: Record<Domain, string> = {
  mobiliteit: "#E6F5F3",
  energie: "#FFF6E0",
  klimaatadaptatie: "#E0F4F9",
  gezondheid: "#E8F5E9",
  circulariteit: "#EFE9F2",
  veiligheid: "#F5EAE9",
  milieu_natuur_ecologie: "#EAF0E4",
};

/** A darker companion to `domainHex`, for strokes that need to hold up on the tint. */
export const domainInkHex: Record<Domain, string> = {
  mobiliteit: "#2E8B7C",
  energie: "#B37F00",
  klimaatadaptatie: "#00708B",
  gezondheid: "#3D8B3D",
  circulariteit: "#4D3359",
  veiligheid: "#7A3733",
  milieu_natuur_ecologie: "#3A4F2A",
};

export const domainBorderColors: Record<Domain, string> = {
  mobiliteit: "border-[#7ECBC0]",
  energie: "border-[#F2A900]",
  klimaatadaptatie: "border-[#0091B3]",
  gezondheid: "border-[#5CB85C]",
  circulariteit: "border-[#664575]",
  veiligheid: "border-[#9B4945]",
  milieu_natuur_ecologie: "border-[#4E6838]",
};

// ------------------------------------------------------------
// Niveau — op welk niveau ligt het vraagstuk?
// ------------------------------------------------------------

export const niveauLabels: Record<Niveau, string> = {
  strategisch: "Strategisch",
  tactisch: "Tactisch",
  operationeel: "Operationeel",
};

export const niveauColors: Record<Niveau, string> = {
  strategisch: "bg-[#004B87] text-white",
  tactisch: "bg-[#4A90C4] text-white",
  operationeel: "bg-[#8C8C8C] text-white",
};

// ------------------------------------------------------------
// De 8 beleidsdomeinen
// ------------------------------------------------------------

export const beleidsdomeinLabels: Record<Beleidsdomein, string> = {
  ruimtelijke_ordening: "Ruimtelijke ordening",
  wonen: "Wonen",
  verkeer_vervoer: "Verkeer & vervoer",
  veiligheid: "Veiligheid",
  energie_klimaat: "Energie & klimaat",
  milieu_natuur_ecologie: "Milieu, natuur & ecologie",
  gezondheid_welzijn: "Gezondheid & welzijn",
  economische_vitaliteit: "Economische vitaliteit",
};

/** Compact labels for the matrix column headers. */
export const beleidsdomeinShort: Record<Beleidsdomein, string> = {
  ruimtelijke_ordening: "RO",
  wonen: "Wonen",
  verkeer_vervoer: "Verkeer",
  veiligheid: "Veiligheid",
  energie_klimaat: "Energie",
  milieu_natuur_ecologie: "Milieu",
  gezondheid_welzijn: "Gezondheid",
  economische_vitaliteit: "Economie",
};

/**
 * The clockwise arrangement of the "8 domeinen" diagram as it is drawn in the
 * source documents — Wonen at twelve o'clock, not Ruimtelijke ordening. Kept
 * separate from `beleidsdomeinOrder` (which drives lists and the matrix) so
 * the diagram stays faithful to the original.
 */
export const beleidsdomeinFigureOrder: Beleidsdomein[] = [
  "wonen",
  "ruimtelijke_ordening",
  "verkeer_vervoer",
  "veiligheid",
  "gezondheid_welzijn",
  "energie_klimaat",
  "milieu_natuur_ecologie",
  "economische_vitaliteit",
];

/** Label wrapped exactly as the document sets it inside each circle. */
export const beleidsdomeinFigureLines: Record<Beleidsdomein, string[]> = {
  wonen: ["Wonen"],
  ruimtelijke_ordening: ["Ruimtelijke", "ordening"],
  verkeer_vervoer: ["Verkeer &", "Vervoer"],
  veiligheid: ["Veiligheid"],
  gezondheid_welzijn: ["Gezondheid", "& Welzijn"],
  energie_klimaat: ["Energie &", "Klimaat"],
  milieu_natuur_ecologie: ["Milieu &", "Natuur &", "Ecologie"],
  economische_vitaliteit: ["Circulariteit", "(Economische", "vitaliteit)"],
};

/** The DMI vision, as it appears in the centre of the document's figure. */
export const dmiVisie = [
  "Slimme,",
  "duurzame",
  "verstede-",
  "lijking en",
  "mobiliteits-",
  "vernieuwing",
];

/** Colours sampled from the figure in the source documents. */
export const figuurBlauw = "#002484";
export const figuurOranje = "#C15308";

/**
 * One DMI colour per beleidsdomein, all drawn from the DMI Ecosysteem logo
 * palette. A domain lights up in its own colour when a use case touches it;
 * the ones it does not touch stay in the figure's original navy outline.
 */
export const beleidsdomeinKleur: Record<Beleidsdomein, string> = {
  wonen: "#5B6D93",
  ruimtelijke_ordening: "#004B87",
  verkeer_vervoer: "#2BB8D9",
  veiligheid: "#9B4945",
  gezondheid_welzijn: "#5CB85C",
  energie_klimaat: "#F2A900",
  milieu_natuur_ecologie: "#4E6838",
  economische_vitaliteit: "#664575",
};

/** Readable text on top of `beleidsdomeinKleur`. */
export const beleidsdomeinKleurTekst: Record<Beleidsdomein, string> = {
  wonen: "#FFFFFF",
  ruimtelijke_ordening: "#FFFFFF",
  verkeer_vervoer: "#00355F",
  veiligheid: "#FFFFFF",
  gezondheid_welzijn: "#FFFFFF",
  energie_klimaat: "#00355F",
  milieu_natuur_ecologie: "#FFFFFF",
  economische_vitaliteit: "#FFFFFF",
};

export const beleidsdomeinOrder: Beleidsdomein[] = [
  "ruimtelijke_ordening",
  "wonen",
  "verkeer_vervoer",
  "veiligheid",
  "energie_klimaat",
  "milieu_natuur_ecologie",
  "gezondheid_welzijn",
  "economische_vitaliteit",
];

/** Chapter order of the source report. */
export const domainOrder: Domain[] = [
  "energie",
  "mobiliteit",
  "circulariteit",
  "klimaatadaptatie",
  "gezondheid",
  "veiligheid",
  "milieu_natuur_ecologie",
];

export const niveauOrder: Niveau[] = ["strategisch", "tactisch", "operationeel"];

// ------------------------------------------------------------
// Bronstatus
// ------------------------------------------------------------

export const bronStatusLabels: Record<string, string> = {
  concept: "Conceptversie",
  draft: "Draft",
  definitief: "Vastgesteld",
};
