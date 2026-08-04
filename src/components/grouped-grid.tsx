import { DomainBanner } from "@/components/usecase-artwork";
import { DomainIcon } from "@/components/domain-icon";
import { UseCaseCard } from "@/components/usecase-card";
import {
  domainBgLightHex,
  domainHex,
  domainInkHex,
  domainLabels,
  domainOrder,
} from "@/data/taxonomy";
import { themas } from "@/data/usecases";
import type { Domain, UseCase } from "@/data/types";

interface GroupedGridProps {
  items: UseCase[];
  query?: string;
}

/**
 * The catalogue's resting state: use cases under their domein and thema, the
 * way the four source documents are actually organised. A flat grid takes over
 * as soon as a filter narrows the set (see CardGrid).
 */
export function GroupedGrid({ items, query }: GroupedGridProps) {
  return (
    <div className="space-y-12">
      {domainOrder.map((domain: Domain) => {
        const inDomain = items.filter((useCase) => useCase.domain === domain);
        if (inDomain.length === 0) return null;

        const domainThemas = themas.filter((thema) => thema.domain === domain);
        const grouped = domainThemas
          .map((thema) => ({
            key: thema.id,
            label: thema.name,
            useCases: inDomain.filter((useCase) => useCase.thema === thema.name),
          }))
          .filter((group) => group.useCases.length > 0);

        // Documents without a thema level (gezondheid, klimaatadaptatie) list
        // their use cases straight under the domein.
        const loose = inDomain.filter((useCase) => !useCase.thema);
        if (loose.length > 0) {
          grouped.push({ key: `${domain}-overig`, label: "", useCases: loose });
        }

        return (
          <section key={domain}>
            <header
              className="relative mb-5 overflow-hidden rounded-lg border border-border/60"
              style={{ backgroundColor: domainBgLightHex[domain] }}
            >
              <DomainBanner
                domain={domain}
                seed={`header-${domain}`}
                className="absolute inset-0 h-full w-full"
              />
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: domainHex[domain] }}
              />
              <div className="relative flex flex-wrap items-center justify-between gap-2 px-5 py-5">
                <h2
                  className="font-heading text-2xl font-bold flex items-center gap-2.5"
                  style={{ color: domainInkHex[domain] }}
                >
                  <DomainIcon domain={domain} className="h-5 w-5" />
                  {domainLabels[domain]}
                </h2>
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                  {inDomain.length} use cases
                  {grouped.filter((g) => g.label).length > 0 &&
                    ` · ${grouped.filter((g) => g.label).length} thema's`}
                </span>
              </div>
            </header>

            <div className="space-y-7">
              {grouped.map((group) => (
                <div key={group.key}>
                  {group.label && (
                    <h3 className="mb-2.5 flex items-baseline gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      <span className="font-semibold text-foreground/70">
                        {group.label}
                      </span>
                      <span className="h-px flex-1 bg-border/70" />
                      <span>{group.useCases.length}</span>
                    </h3>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.useCases.map((useCase) => (
                      <UseCaseCard
                        key={useCase.id}
                        useCase={useCase}
                        query={query}
                        inGroup
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
