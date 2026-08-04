import { Suspense } from "react";
import { BarChart3, Compass, Database, HelpCircle, Lightbulb, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackToCatalogus, RelatedUseCases } from "@/components/catalogus-links";
import { DomainIcon } from "@/components/domain-icon";
import { DomeinenFiguur } from "@/components/domeinen-figuur";
import { FieldSection } from "@/components/field-section";
import { DomainBanner } from "@/components/usecase-artwork";
import {
  bronStatusLabels,
  domainBgLight,
  domainColors,
  domainHex,
  domainLabels,
  niveauColors,
  niveauLabels,
} from "@/data/taxonomy";
import { themas, useCases } from "@/data/usecases";
import type { UseCase } from "@/data/types";

interface UseCaseDetailProps {
  useCase: UseCase;
}

/** Sidebar heading: small, mono, quiet. */
function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
      {children}
    </h2>
  );
}

export function UseCaseDetail({ useCase }: UseCaseDetailProps) {
  const accent = domainHex[useCase.domain];

  const thema = themas.find(
    (item) => item.domain === useCase.domain && item.name === useCase.thema
  );

  // Other use cases in the same thema, or otherwise the same domein.
  const related = useCases
    .filter(
      (other) =>
        other.id !== useCase.id &&
        (thema
          ? thema.usecaseIds.includes(other.id)
          : other.domain === useCase.domain)
    )
    .slice(0, 4);

  return (
    <main className="flex-1">
      {/* Hero */}
      <div
        className={`relative overflow-hidden border-b border-border/60 ${domainBgLight[useCase.domain]}`}
      >
        <DomainBanner
          domain={useCase.domain}
          seed={useCase.id}
          className="absolute inset-0 h-full w-full opacity-60"
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-7">
          <div className="mb-4 h-5">
            <Suspense>
              <BackToCatalogus />
            </Suspense>
          </div>

          <div>
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {domainLabels[useCase.domain]}
                {useCase.thema && <> &middot; {useCase.thema}</>}
              </p>

              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground leading-[1.1] max-w-[22ch]">
                {useCase.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge
                  variant="secondary"
                  className={`${domainColors[useCase.domain]} text-[10px] px-1.5 py-0 font-mono gap-1`}
                >
                  <DomainIcon domain={useCase.domain} />
                  {domainLabels[useCase.domain]}
                </Badge>
                {useCase.niveaus.map((niveau) => (
                  <Badge
                    key={niveau}
                    variant="secondary"
                    className={`${niveauColors[niveau]} text-[10px] px-1.5 py-0 font-mono`}
                  >
                    {niveauLabels[niveau]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body: reading column + meta sidebar */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
          {/* Reading column, capped at a comfortable measure */}
          <div className="max-w-[68ch] space-y-9">
            {useCase.toelichting && (
              <p
                className="border-l-2 pl-4 text-[15px] leading-7 text-foreground/60 italic whitespace-pre-line"
                style={{ borderColor: accent }}
              >
                {useCase.toelichting}
              </p>
            )}

            <section>
              <div
                className="mb-3 flex items-baseline gap-2 border-l-2 pl-3"
                style={{ borderColor: accent }}
              >
                <HelpCircle
                  className="h-4 w-4 shrink-0 translate-y-0.5"
                  style={{ color: accent }}
                />
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Het vraagstuk
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  Waarom
                </span>
              </div>
              <p className="pl-3 text-[16px] sm:text-[17px] leading-7 sm:leading-8 text-foreground/85 whitespace-pre-line">
                {useCase.waarom}
              </p>
            </section>

            <FieldSection
              icon={<Wrench className="h-4 w-4" />}
              title="Benodigde functionaliteiten"
              hint="Wat"
              items={useCase.functionaliteiten}
              accent={accent}
            />
            <FieldSection
              icon={<BarChart3 className="h-4 w-4" />}
              title="Benodigde analyse"
              hint="Hoe"
              items={useCase.analyse}
              accent={accent}
            />
            <FieldSection
              icon={<Database className="h-4 w-4" />}
              title="Benodigde data / informatie"
              items={useCase.benodigdeData}
              accent={accent}
            />
            <FieldSection
              icon={<Lightbulb className="h-4 w-4" />}
              title="Voorbeelden"
              items={useCase.voorbeelden}
              accent={accent}
            />

            {/* The document's own "8 domeinen" figure, filled in for this use case. */}
            <section>
              <div
                className="mb-3 flex items-baseline gap-2 border-l-2 pl-3"
                style={{ borderColor: accent }}
              >
                <Compass
                  className="h-4 w-4 shrink-0 translate-y-0.5"
                  style={{ color: accent }}
                />
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Relevante beleidsdomeinen
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  {useCase.beleidsdomeinen.length} van 8
                </span>
              </div>

              <DomeinenFiguur
                active={useCase.beleidsdomeinen}
                centerLines={[domainLabels[useCase.domain]]}
                linked
                title={`Beleidsdomeinen die raken aan ${useCase.name}`}
                className="w-full max-w-[520px]"
              />

              {useCase.overigeBeleidsdomeinen.length > 0 && (
                <p className="mt-2 pl-3 text-[13px] text-muted-foreground">
                  Het brondocument noemt daarnaast{" "}
                  {useCase.overigeBeleidsdomeinen.join(", ")} — buiten de acht
                  beleidsdomeinen.
                </p>
              )}
            </section>

            {thema?.intro && (
              <section className="rounded-lg bg-muted/40 p-5">
                <h2 className="font-heading text-sm font-semibold text-foreground mb-2">
                  Over het thema &ldquo;{thema.name}&rdquo;
                </h2>
                <p className="text-[15px] leading-7 text-foreground/65 whitespace-pre-line">
                  {thema.intro}
                </p>
              </section>
            )}
          </div>

          {/* Meta sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-6 text-sm">
            <div>
              <MetaLabel>Niveau</MetaLabel>
              <p className="text-[13px] leading-6 text-foreground/75 whitespace-pre-line">
                {useCase.niveauRaw || "—"}
              </p>
            </div>

            <div>
              <MetaLabel>Hoofd thema</MetaLabel>
              <p className="text-[13px] leading-6 text-foreground/75">
                {useCase.hoofdthema || "—"}
              </p>
            </div>

            <div>
              <MetaLabel>Bron</MetaLabel>
              <p className="text-[11px] font-mono leading-5 text-muted-foreground break-words">
                {useCase.bron.document}
              </p>
              <p className="mt-1 text-[11px] font-mono text-muted-foreground/70">
                {bronStatusLabels[useCase.bron.status] ?? useCase.bron.status}
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-8">
            <h2 className="font-heading text-base font-semibold text-foreground mb-4">
              {thema ? "Andere use cases in dit thema" : "Andere use cases in dit domein"}
            </h2>
            <Suspense>
              <RelatedUseCases items={related} />
            </Suspense>
          </section>
        )}
      </div>
    </main>
  );
}
