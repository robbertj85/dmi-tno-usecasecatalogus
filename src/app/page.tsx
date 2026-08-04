import { Suspense } from "react";
import { Catalogus } from "@/components/catalogus";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      {/* useSearchParams needs a Suspense boundary so the shell can prerender. */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <Catalogus />
      </Suspense>
      <SiteFooter />
    </>
  );
}
