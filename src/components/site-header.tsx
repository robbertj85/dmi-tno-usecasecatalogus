import Link from "next/link";

interface SiteHeaderProps {
  /** Optional right-hand slot: result count, view toggle, back link. */
  children?: React.ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dmi-logo.svg" alt="DMI Ecosysteem" className="h-8 shrink-0" />
            <div className="h-6 w-px bg-border/60 shrink-0" />
            <p className="font-heading text-sm font-semibold text-[#004B87] truncate">
              Use Cases Catalogus
            </p>
          </Link>

          <div className="flex items-center gap-2 shrink-0">{children}</div>
        </div>
      </div>
    </header>
  );
}
