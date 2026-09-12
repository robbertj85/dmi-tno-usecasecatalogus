import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DomainIcon } from "@/components/domain-icon";
import { DomeinenFiguur } from "@/components/domeinen-figuur";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  beleidsdomeinLabels,
  beleidsdomeinOrder,
  bronStatusLabels,
  domainColors,
  domainHex,
  domainLabels,
} from "@/data/taxonomy";
import {
  bronDocument,
  bronnen,
  domainIntros,
  formaat,
  ruimtelijkeOrdeningWonen,
  themas,
  uitgangspunt,
  useCases,
} from "@/data/usecases";
import type { Domain } from "@/data/types";

export const metadata: Metadata = {
  title: "Over deze catalogus — DMI Use Cases Catalogus",
  description:
    "Uitgangspunt, format en bron van de DMI use cases catalogus voor energie, mobiliteit, circulariteit, klimaatadaptatie, gezondheid & welzijn, veiligheid en milieu, natuur & ecologie.",
};

/** The italic placeholder text in the format table is guidance, not content. */
function stripMarkers(text: string) {
  return text.replace(/\*\*/g, "");
}

export default function OverPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#004B87] transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Terug naar de catalogus
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Over deze catalogus
            </h1>
          </div>

          {/* Uitgangspunt */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Uitgangspunt
            </h2>
            {stripMarkers(uitgangspunt)
              .split("\n")
              .filter(Boolean)
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
          </section>

          {/* Format */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Het format
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Elke use case in deze catalogus is beschreven volgens hetzelfde
              format. Daardoor ontstaat een eenduidig beeld en is het zoeken naar
              samenhang en overeenkomsten eenvoudiger.
            </p>
            <dl className="rounded-lg border border-border/60 bg-white divide-y divide-border/60">
              {formaat.map((veld) => (
                <div
                  key={veld.veld}
                  className="grid gap-1 p-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
                >
                  <dt className="text-xs font-medium text-foreground">
                    {veld.veld}
                  </dt>
                  <dd className="text-xs text-muted-foreground">
                    {stripMarkers(veld.toelichting)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* De 8 beleidsdomeinen */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              De 8 beleidsdomeinen
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rond de DMI-visie liggen acht beleidsdomeinen. Elke use case is
              gekoppeld aan de domeinen die aan het vraagstuk raken; op de
              pagina van een use case is deze figuur ingevuld met alleen die
              domeinen. Dat maakt zichtbaar waar de domeinen elkaar
              overlappen — de matrixweergave op de startpagina is daarop
              gebouwd.
            </p>

            <DomeinenFiguur className="w-full" />

            <p className="text-[11px] font-mono text-muted-foreground/70">
              Figuur overgenomen uit het brondocument.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {beleidsdomeinOrder.map((beleidsdomein) => (
                <Link
                  key={beleidsdomein}
                  href={`/?beleidsdomein=${beleidsdomein}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                >
                  {beleidsdomeinLabels[beleidsdomein]}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {
                      useCases.filter((u) =>
                        u.beleidsdomeinen.includes(beleidsdomein)
                      ).length
                    }
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Ruimtelijke ordening & wonen: an approach, not a set of use cases */}
          <section id="ruimtelijke-ordening" className="space-y-3 scroll-mt-20">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Ruimtelijke ordening &amp; wonen: de vijf stappen
            </h2>
            {ruimtelijkeOrdeningWonen.intro
              .split("\n")
              .filter(Boolean)
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            <ol className="rounded-lg border border-border/60 bg-white divide-y divide-border/60">
              {ruimtelijkeOrdeningWonen.stappen.map((stap, index) => (
                <li
                  key={stap.naam}
                  className="grid gap-1 p-3 sm:grid-cols-[2.5rem_minmax(0,14rem)_1fr] sm:gap-4"
                >
                  <span className="font-heading text-xl font-bold leading-none text-[#004B87]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {stap.naam}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-pre-line">
                    {stap.toelichting}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Bron */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Bron
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              De catalogus wordt gegenereerd uit het TNO-rapport{" "}
              <span className="text-foreground">{bronDocument.titel}</span>{" "}
              ({bronDocument.kenmerk}, {bronDocument.datum}). Bij een nieuwe
              versie van het rapport wordt de catalogus opnieuw opgebouwd, zodat
              dit een levend document blijft.
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60 break-all">
              {bronDocument.document}
            </p>

            <div className="space-y-3">
              {bronnen.map((bron) => {
                const domain = bron.domain as Domain;
                const domainThemas = themas.filter((t) => t.domain === domain);
                const intro = domainIntros[domain];
                return (
                  <article
                    key={domain}
                    className="rounded-lg border-l-4 border border-border/60 bg-white p-4"
                    style={{ borderLeftColor: domainHex[domain] }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`${domainColors[domain]} text-[10px] px-1.5 py-0 font-mono gap-1`}
                      >
                        <DomainIcon domain={domain} />
                        {domainLabels[domain]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground"
                      >
                        {bronStatusLabels[bron.status] ?? bron.status}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {bron.aantal} use cases
                        {domainThemas.length > 0 &&
                          ` · ${domainThemas.length} thema's`}
                      </span>
                    </div>

                    {intro && (
                      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
                        {intro}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
