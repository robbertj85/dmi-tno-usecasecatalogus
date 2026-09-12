"use client";

import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DomainIcon } from "@/components/domain-icon";
import {
  beleidsdomeinLabels,
  beleidsdomeinOrder,
  domainHex,
  domainLabels,
  domainOrder,
  niveauLabels,
  niveauOrder,
} from "@/data/taxonomy";
import { themas } from "@/data/usecases";
import type { Beleidsdomein, Domain, Niveau } from "@/data/types";
import { activeFilterCount, type Filters } from "@/lib/filters";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

/** Neutral pill used by every facet except Domein, which carries its own colour. */
const pill = (isActive: boolean) =>
  `inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
    isActive
      ? "bg-foreground text-background border-foreground"
      : "bg-transparent text-foreground border-border hover:bg-muted"
  }`;

function FacetLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
      {children}
    </span>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  // Only offer thema's that belong to the selected domein — chapters do not
  // share thema's.
  const themaOptions = themas.filter(
    (thema) => !filters.domain || thema.domain === filters.domain
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek in use cases, functionaliteiten, analyses en data..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 font-mono text-sm"
        />
      </div>

      {/* Domein */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <FacetLabel>Domein</FacetLabel>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {domainOrder.map((domain: Domain) => {
            const isActive = filters.domain === domain;
            const hex = domainHex[domain];
            return (
              <button
                key={domain}
                onClick={() =>
                  onChange({
                    ...filters,
                    domain: isActive ? null : domain,
                    // A thema belongs to one domein; clear it when the domein changes.
                    thema: null,
                  })
                }
                style={
                  isActive
                    ? { backgroundColor: hex, borderColor: hex }
                    : { color: hex, borderColor: `${hex}66` }
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  isActive ? "text-white" : "bg-transparent hover:bg-muted/60"
                }`}
              >
                <DomainIcon domain={domain} />
                {domainLabels[domain]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Niveau */}
      <div className="space-y-2">
        <FacetLabel>Niveau</FacetLabel>
        <div className="flex flex-wrap gap-1.5">
          {niveauOrder.map((niveau: Niveau) => {
            const isActive = filters.niveau === niveau;
            return (
              <button
                key={niveau}
                onClick={() =>
                  onChange({ ...filters, niveau: isActive ? null : niveau })
                }
                className={pill(isActive)}
              >
                {niveauLabels[niveau]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Beleidsdomein */}
      <div className="space-y-2">
        <FacetLabel>Beleidsdomein</FacetLabel>
        <div className="flex flex-wrap gap-1.5">
          {beleidsdomeinOrder.map((beleidsdomein: Beleidsdomein) => {
            const isActive = filters.beleidsdomein === beleidsdomein;
            return (
              <button
                key={beleidsdomein}
                onClick={() =>
                  onChange({
                    ...filters,
                    beleidsdomein: isActive ? null : beleidsdomein,
                  })
                }
                className={pill(isActive)}
              >
                {beleidsdomeinLabels[beleidsdomein]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thema — the gezondheid catalogue has no thema level, so this can be empty. */}
      <div className={`space-y-2 ${themaOptions.length ? "" : "hidden"}`}>
        <FacetLabel>Thema</FacetLabel>
        <div className="flex flex-wrap gap-1.5">
          {themaOptions.map((thema) => {
            const isActive = filters.thema === thema.name;
            return (
              <button
                key={thema.id}
                onClick={() =>
                  onChange({ ...filters, thema: isActive ? null : thema.name })
                }
                className={pill(isActive)}
              >
                {thema.name}
              </button>
            );
          })}
        </div>
      </div>

      {activeFilterCount(filters) > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              domain: null,
              niveau: null,
              beleidsdomein: null,
              thema: null,
              search: filters.search,
            })
          }
          className="text-xs text-muted-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Filters wissen
        </Button>
      )}
    </div>
  );
}
