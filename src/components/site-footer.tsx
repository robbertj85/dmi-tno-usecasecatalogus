import Link from "next/link";
import { domainLabels, domainOrder } from "@/data/taxonomy";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-white/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-[10px] font-mono text-muted-foreground/60 text-center">
          DMI Ecosysteem &middot; TNO &middot;{" "}
          {domainOrder.map((domain) => domainLabels[domain]).join(", ")}{" "}
          &middot;{" "}
          <Link href="/over" className="underline hover:text-[#004B87]">
            Over deze catalogus
          </Link>
        </p>
      </div>
    </footer>
  );
}
