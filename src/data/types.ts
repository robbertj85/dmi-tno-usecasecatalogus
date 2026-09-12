// ============================================================
// Types — the shape of the use-case catalogue.
//
// Mirrors the 9-row table format used throughout the source document:
// naam / hoofd thema / beschrijving (waarom) / niveau / relevante
// beleidsdomeinen / benodigde functionaliteiten (wat) / benodigde
// analyse (hoe) / benodigde data / voorbeelden.
// ============================================================

/** The domain chapters of the catalogue, one per chapter with use-case tables. */
export type Domain =
  | "energie"
  | "mobiliteit"
  | "circulariteit"
  | "klimaatadaptatie"
  | "gezondheid"
  | "veiligheid"
  | "milieu_natuur_ecologie";

/** Op welk niveau ligt het vraagstuk? */
export type Niveau = "strategisch" | "tactisch" | "operationeel";

/** De 8 beleidsdomeinen waar het DMI-Ecosysteem langs is ingedeeld. */
export type Beleidsdomein =
  | "ruimtelijke_ordening"
  | "wonen"
  | "verkeer_vervoer"
  | "veiligheid"
  | "energie_klimaat"
  | "milieu_natuur_ecologie"
  | "gezondheid_welzijn"
  | "economische_vitaliteit";

export interface Bron {
  /** Filename of the source Word document. */
  document: string;
  status: "concept" | "draft" | "definitief";
}

/** The source report itself, as read from its title page. */
export interface BronDocument extends Bron {
  titel: string;
  /** TNO report number. */
  kenmerk: string;
  datum: string;
}

/** A titled block of prose printed after a use-case table (H4/H5 sections). */
export interface VerdiepingBlok {
  kop: string;
  tekst: string[];
}

export interface UseCase {
  /** Slug, also the /usecase/[slug] route segment. */
  id: string;
  name: string;
  domain: Domain;
  /** Chapter thema (H2) the use case sits under; empty where the chapter has no thema level. */
  thema: string;
  /** The "Hoofd thema" cell — free text, as written by the authors. */
  hoofdthema: string;
  /** One-line teaser for cards and search results. */
  samenvatting: string;
  /** Framing prose printed directly above the table in the document; often empty. */
  toelichting: string;
  /** Beschrijving (maatschappelijk) vraagstuk — the Waarom. */
  waarom: string;
  niveaus: Niveau[];
  /** Original niveau cell, kept because the authors add nuance in brackets. */
  niveauRaw: string;
  beleidsdomeinen: Beleidsdomein[];
  /** Domains named in the document that fall outside the canonical 8. */
  overigeBeleidsdomeinen: string[];
  beleidsdomeinenRaw: string;
  /** Benodigde functionaliteiten (Wat). */
  functionaliteiten: string[];
  /** Benodigde analyse (Hoe). */
  analyse: string[];
  /** Benodigde data / informatie. */
  benodigdeData: string[];
  voorbeelden: string[];
  /** Prose the document adds after the table; usually empty. */
  verdieping: VerdiepingBlok[];
  bron: Bron;
}

/** One row of the blank use-case format table from the "Uitgangspunt" chapter. */
export interface FormaatVeld {
  veld: string;
  toelichting: string;
}

export interface Thema {
  id: string;
  domain: Domain;
  name: string;
  /** Introductory prose printed under the thema heading in the document. */
  intro: string;
  usecaseIds: string[];
}

export interface AanpakStap {
  naam: string;
  toelichting: string;
}

/**
 * The ruimtelijke ordening & wonen chapter: not a set of use cases but a
 * step-by-step approach in which the other domains come together.
 */
export interface Aanpak {
  intro: string;
  stappen: AanpakStap[];
}
