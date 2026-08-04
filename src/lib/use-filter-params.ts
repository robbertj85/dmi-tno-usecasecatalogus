"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { beleidsdomeinOrder, domainOrder, niveauOrder } from "@/data/taxonomy";
import type { Beleidsdomein, Domain, Niveau } from "@/data/types";
import type { Filters } from "@/lib/filters";

export type View = "kaarten" | "matrix" | "graaf";

const VIEWS: View[] = ["kaarten", "matrix", "graaf"];

/**
 * Filter state lives in the query string so a filtered view — and the way back
 * from a use-case page — is a shareable link.
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: Filters = useMemo(() => {
    const one = <T extends string>(key: string, allowed: readonly T[]): T | null => {
      const value = searchParams.get(key);
      return value && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : null;
    };
    return {
      domain: one<Domain>("domein", domainOrder),
      niveau: one<Niveau>("niveau", niveauOrder),
      beleidsdomein: one<Beleidsdomein>("beleidsdomein", beleidsdomeinOrder),
      thema: searchParams.get("thema"),
      search: searchParams.get("q") ?? "",
    };
  }, [searchParams]);

  const requested = searchParams.get("view") as View | null;
  const view: View = requested && VIEWS.includes(requested) ? requested : "kaarten";

  const write = useCallback(
    (next: Filters, nextView: View) => {
      const params = new URLSearchParams();
      if (next.domain) params.set("domein", next.domain);
      if (next.niveau) params.set("niveau", next.niveau);
      if (next.beleidsdomein) params.set("beleidsdomein", next.beleidsdomein);
      if (next.thema) params.set("thema", next.thema);
      if (next.search.trim()) params.set("q", next.search);
      if (nextView !== "kaarten") params.set("view", nextView);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback((next: Filters) => write(next, view), [write, view]);
  const setView = useCallback(
    (nextView: View) => write(filters, nextView),
    [write, filters]
  );

  return { filters, view, setFilters, setView, query: searchParams.toString() };
}
