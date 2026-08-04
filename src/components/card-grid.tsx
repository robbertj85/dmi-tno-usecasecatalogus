import { UseCaseCard } from "@/components/usecase-card";
import type { UseCase } from "@/data/types";

interface CardGridProps {
  items: UseCase[];
  query?: string;
}

export function CardGrid({ items, query }: CardGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-white/50 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Geen use cases gevonden voor deze filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((useCase) => (
        <UseCaseCard key={useCase.id} useCase={useCase} query={query} />
      ))}
    </div>
  );
}
