"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UseCaseCard } from "@/components/usecase-card";
import type { UseCase } from "@/data/types";

/**
 * The detail page is fully static, so the filter state a visitor arrived with
 * is read from the URL in the browser rather than baked into the page.
 */
function useCatalogusQuery() {
  return useSearchParams().toString();
}

export function BackToCatalogus() {
  const query = useCatalogusQuery();
  return (
    <Link
      href={query ? `/?${query}` : "/"}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#004B87] transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Terug naar de catalogus
    </Link>
  );
}

export function RelatedUseCases({ items }: { items: UseCase[] }) {
  const query = useCatalogusQuery();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((useCase) => (
        <UseCaseCard key={useCase.id} useCase={useCase} query={query} />
      ))}
    </div>
  );
}
