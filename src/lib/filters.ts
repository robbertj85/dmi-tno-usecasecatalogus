import type { Beleidsdomein, Domain, Niveau, UseCase } from "@/data/types";

export interface Filters {
  domain: Domain | null;
  niveau: Niveau | null;
  beleidsdomein: Beleidsdomein | null;
  thema: string | null;
  search: string;
}

export const emptyFilters: Filters = {
  domain: null,
  niveau: null,
  beleidsdomein: null,
  thema: null,
  search: "",
};

export function activeFilterCount(filters: Filters): number {
  return [filters.domain, filters.niveau, filters.beleidsdomein, filters.thema].filter(
    Boolean
  ).length;
}

/** Every searchable string of a use case, lowercased once per call. */
function haystack(useCase: UseCase): string {
  return [
    useCase.name,
    useCase.hoofdthema,
    useCase.thema,
    useCase.samenvatting,
    useCase.waarom,
    useCase.beleidsdomeinenRaw,
    ...useCase.functionaliteiten,
    ...useCase.analyse,
    ...useCase.benodigdeData,
    ...useCase.voorbeelden,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Single-select per facet, AND across facets — the same predicate backs both
 * the card grid and the matrix so the two views can never disagree.
 */
export function filterUseCases(items: UseCase[], filters: Filters): UseCase[] {
  const query = filters.search.trim().toLowerCase();
  return items.filter((useCase) => {
    if (filters.domain && useCase.domain !== filters.domain) return false;
    if (filters.niveau && !useCase.niveaus.includes(filters.niveau)) return false;
    if (
      filters.beleidsdomein &&
      !useCase.beleidsdomeinen.includes(filters.beleidsdomein)
    )
      return false;
    if (filters.thema && useCase.thema !== filters.thema) return false;
    if (query && !haystack(useCase).includes(query)) return false;
    return true;
  });
}
