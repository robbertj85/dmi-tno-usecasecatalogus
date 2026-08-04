"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { CardGrid } from "@/components/card-grid";
import { DomainIcon } from "@/components/domain-icon";
import {
  beleidsdomeinLabels,
  beleidsdomeinOrder,
  beleidsdomeinShort,
  domainHex,
  domainLabels,
  domainOnHex,
  domainOrder,
} from "@/data/taxonomy";
import type { Beleidsdomein, Domain, UseCase } from "@/data/types";

interface DomainMatrixProps {
  items: UseCase[];
  query?: string;
}

interface Cell {
  domain: Domain;
  beleidsdomein: Beleidsdomein;
}

/**
 * Domein × beleidsdomein. Each cell counts the use cases from that catalogue
 * that touch that policy domain — which is how you spot where two domains are
 * working on the same vraagstuk.
 */
export function DomainMatrix({ items, query }: DomainMatrixProps) {
  const [selected, setSelected] = useState<Cell | null>(null);

  const grid = useMemo(() => {
    const map = new Map<string, UseCase[]>();
    for (const useCase of items) {
      for (const beleidsdomein of useCase.beleidsdomeinen) {
        const key = `${useCase.domain}|${beleidsdomein}`;
        const bucket = map.get(key);
        if (bucket) bucket.push(useCase);
        else map.set(key, [useCase]);
      }
    }
    return map;
  }, [items]);

  const at = (domain: Domain, beleidsdomein: Beleidsdomein) =>
    grid.get(`${domain}|${beleidsdomein}`) ?? [];

  const max = Math.max(1, ...[...grid.values()].map((bucket) => bucket.length));

  const rowTotal = (domain: Domain) =>
    items.filter((u) => u.domain === domain && u.beleidsdomeinen.length > 0).length;
  const columnTotal = (beleidsdomein: Beleidsdomein) =>
    items.filter((u) => u.beleidsdomeinen.includes(beleidsdomein)).length;

  const selection = selected ? at(selected.domain, selected.beleidsdomein) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-white p-3 sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white pr-2 align-bottom">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Domein \ Beleidsdomein
                  </span>
                </th>
                {beleidsdomeinOrder.map((beleidsdomein) => (
                  <th
                    key={beleidsdomein}
                    className="px-1 pb-1 align-bottom"
                    title={beleidsdomeinLabels[beleidsdomein]}
                  >
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold text-center whitespace-nowrap">
                      {beleidsdomeinShort[beleidsdomein]}
                    </span>
                  </th>
                ))}
                <th className="pl-2 pb-1 align-bottom">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold text-center">
                    Totaal
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {domainOrder.map((domain) => (
                <tr key={domain}>
                  <th className="sticky left-0 z-10 bg-white pr-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: domainHex[domain] }}
                    >
                      <DomainIcon domain={domain} />
                      {domainLabels[domain]}
                    </span>
                  </th>

                  {beleidsdomeinOrder.map((beleidsdomein) => {
                    const bucket = at(domain, beleidsdomein);
                    const isSelected =
                      selected?.domain === domain &&
                      selected?.beleidsdomein === beleidsdomein;
                    return (
                      <td key={beleidsdomein} className="p-0">
                        <button
                          type="button"
                          disabled={bucket.length === 0}
                          onClick={() =>
                            setSelected(isSelected ? null : { domain, beleidsdomein })
                          }
                          title={`${domainLabels[domain]} × ${beleidsdomeinLabels[beleidsdomein]}: ${bucket.length}`}
                          style={
                            bucket.length
                              ? {
                                  // Tint by share of the busiest cell, with a
                                  // floor that keeps the label readable.
                                  backgroundColor: domainHex[domain],
                                  opacity: 0.45 + (0.55 * bucket.length) / max,
                                  color: domainOnHex[domain],
                                }
                              : undefined
                          }
                          className={`flex h-9 w-full min-w-11 items-center justify-center rounded text-xs font-mono font-medium transition-all ${
                            bucket.length
                              ? "cursor-pointer hover:scale-105"
                              : "bg-muted/40 text-muted-foreground/40 cursor-default"
                          } ${isSelected ? "ring-2 ring-[#004B87] ring-offset-1" : ""}`}
                        >
                          {bucket.length || "·"}
                        </button>
                      </td>
                    );
                  })}

                  <td className="pl-2">
                    <span className="block text-center text-xs font-mono text-muted-foreground">
                      {rowTotal(domain)}
                    </span>
                  </td>
                </tr>
              ))}

              <tr>
                <th className="sticky left-0 z-10 bg-white pr-3 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                    Totaal
                  </span>
                </th>
                {beleidsdomeinOrder.map((beleidsdomein) => (
                  <td key={beleidsdomein} className="pt-1">
                    <span className="block text-center text-xs font-mono text-muted-foreground">
                      {columnTotal(beleidsdomein)}
                    </span>
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Elke cel telt de use cases uit die catalogus die het betreffende
          beleidsdomein raken. Een use case telt in meerdere cellen mee; de
          totalen tellen elke use case één keer. Klik op een cel voor de use
          cases erachter.
        </p>
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {domainLabels[selected.domain]}{" "}
              <span className="text-muted-foreground font-normal">×</span>{" "}
              {beleidsdomeinLabels[selected.beleidsdomein]}
              <span className="ml-2 text-xs font-mono font-normal text-muted-foreground">
                {selection.length} use cases
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              Sluiten
            </button>
          </div>
          <CardGrid items={selection} query={query} />
        </div>
      )}
    </div>
  );
}
