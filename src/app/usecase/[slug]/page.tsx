import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UseCaseDetail } from "@/components/usecase-detail";
import { domainLabels } from "@/data/taxonomy";
import { useCases } from "@/data/usecases";

type Params = Promise<{ slug: string }>;

/** Every use case is known at build time; nothing else resolves. */
export const dynamicParams = false;

export function generateStaticParams() {
  return useCases.map((useCase) => ({ slug: useCase.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const useCase = useCases.find((item) => item.id === slug);
  if (!useCase) return { title: "Use case niet gevonden" };
  return {
    title: `${useCase.name} — DMI Use Cases Catalogus`,
    description: useCase.samenvatting,
  };
}

export default async function UseCasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const useCase = useCases.find((item) => item.id === slug);
  if (!useCase) notFound();

  return (
    <>
      <SiteHeader>
        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
          {domainLabels[useCase.domain]}
        </span>
      </SiteHeader>
      <UseCaseDetail useCase={useCase} />
      <SiteFooter />
    </>
  );
}
