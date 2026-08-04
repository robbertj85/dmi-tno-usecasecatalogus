import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Pagina niet gevonden
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Deze use case bestaat niet (meer) in de catalogus.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-[#004B87] px-4 py-2 text-sm font-medium text-white hover:bg-[#003a6a] transition-colors"
          >
            Terug naar de catalogus
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
