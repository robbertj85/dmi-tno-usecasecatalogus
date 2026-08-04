"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Grid3x3,
  Info,
  LayoutGrid,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardGrid } from "@/components/card-grid";
import { DomainMatrix } from "@/components/domain-matrix";
import { GroupedGrid } from "@/components/grouped-grid";
import { RelatieGraaf } from "@/components/relatie-graaf";
import { FilterBar } from "@/components/filter-bar";
import { SiteHeader } from "@/components/site-header";
import { useCases } from "@/data/usecases";
import { activeFilterCount, filterUseCases } from "@/lib/filters";
import { useFilterParams } from "@/lib/use-filter-params";

export function Catalogus() {
  const { filters, view, setFilters, setView, query } = useFilterParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => filterUseCases(useCases, filters), [filters]);
  const activeCount = activeFilterCount(filters);
  // Grouping is the resting state; once the visitor narrows the set, a flat
  // grid puts the matches side by side instead of scattering them over headers.
  const isNarrowed = activeCount > 0 || filters.search.trim().length > 0;

  return (
    <div className="flex flex-col flex-1">
      <SiteHeader>
        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
          {filtered.length} van {useCases.length}
        </span>

        <div className="flex items-center rounded-md border border-border/60 p-0.5 bg-muted/30">
          <button
            onClick={() => setView("kaarten")}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              view === "kaarten"
                ? "bg-white text-[#004B87] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3 w-3" />
            <span className="hidden sm:inline">Kaarten</span>
          </button>
          <button
            onClick={() => setView("matrix")}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              view === "matrix"
                ? "bg-white text-[#004B87] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid3x3 className="h-3 w-3" />
            <span className="hidden sm:inline">Matrix</span>
          </button>
          <button
            onClick={() => setView("graaf")}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              view === "graaf"
                ? "bg-white text-[#004B87] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Share2 className="h-3 w-3" />
            <span className="hidden sm:inline">Graaf</span>
          </button>
        </div>

        <Link
          href="/over"
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-[#004B87] transition-colors"
        >
          <Info className="h-3 w-3" />
          <span className="hidden md:inline">Over</span>
        </Link>
      </SiteHeader>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-5">
            <h1 className="font-heading text-xl font-bold text-foreground mb-1">
              Use cases catalogus
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Actuele vraagstukken van steden en partners, uitgewerkt van
              maatschappelijk vraagstuk (waarom) naar benodigde
              functionaliteiten, analyses en data. Zoek wie met hetzelfde
              vraagstuk bezig is en waar domeinen elkaar raken.
            </p>
          </div>

          <div className="mb-5">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <Badge className="bg-[#004B87] text-white text-[9px] h-4 min-w-4 px-1 rounded-full">
                  {activeCount}
                </Badge>
              )}
              {filtersOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {filtersOpen && (
              <div className="mt-2 rounded-lg border border-border/60 bg-white p-4">
                <FilterBar filters={filters} onChange={setFilters} />
              </div>
            )}
          </div>

          {view === "matrix" ? (
            <DomainMatrix items={filtered} query={query} />
          ) : view === "graaf" ? (
            <RelatieGraaf items={filtered} query={query} />
          ) : isNarrowed ? (
            <CardGrid items={filtered} query={query} />
          ) : (
            <GroupedGrid items={filtered} query={query} />
          )}
        </div>
      </main>
    </div>
  );
}
