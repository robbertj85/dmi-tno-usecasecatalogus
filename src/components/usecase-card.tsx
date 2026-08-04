import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DomainIcon } from "@/components/domain-icon";
import { UseCaseArtwork } from "@/components/usecase-artwork";
import {
  beleidsdomeinLabels,
  domainHex,
  domainLabels,
  niveauColors,
  niveauLabels,
} from "@/data/taxonomy";
import type { UseCase } from "@/data/types";

interface UseCaseCardProps {
  useCase: UseCase;
  /** Preserve the current filter state so Back returns to the same view. */
  query?: string;
  /** Set where a domein/thema header already names the card's context. */
  inGroup?: boolean;
}

export function UseCaseCard({ useCase, query, inGroup = false }: UseCaseCardProps) {
  const accent = domainHex[useCase.domain];

  return (
    <Link
      href={query ? `/usecase/${useCase.id}?${query}` : `/usecase/${useCase.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:shadow-lg hover:border-[#004B87]/40 hover:-translate-y-1"
    >
      <div className="relative h-[84px] shrink-0 overflow-hidden">
        <UseCaseArtwork
          useCase={useCase}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: accent }}
        />
        {!inGroup && (
          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-medium text-[#00355F]/60">
            <DomainIcon domain={useCase.domain} className="h-3 w-3" />
            {domainLabels[useCase.domain]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-[15px] font-semibold leading-snug text-foreground group-hover:text-[#004B87] transition-colors">
            {useCase.name}
          </h3>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#004B87] shrink-0 mt-0.5" />
        </div>

        {!inGroup && useCase.thema && (
          <p className="-mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {useCase.thema}
          </p>
        )}

        <p className="text-[13px] leading-relaxed text-foreground/65 line-clamp-3">
          {useCase.samenvatting || "Klik voor meer informatie"}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {useCase.niveaus.map((niveau) => (
            <Badge
              key={niveau}
              variant="secondary"
              className={`${niveauColors[niveau]} text-[10px] px-1.5 py-0 font-mono`}
            >
              {niveauLabels[niveau]}
            </Badge>
          ))}
          <span
            className="ml-auto flex items-center gap-1"
            title={useCase.beleidsdomeinen
              .map((key) => beleidsdomeinLabels[key])
              .join(", ")}
          >
            {useCase.beleidsdomeinen.map((key) => (
              <span
                key={key}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            ))}
            <span className="text-[10px] font-mono text-muted-foreground/70">
              {useCase.beleidsdomeinen.length}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
