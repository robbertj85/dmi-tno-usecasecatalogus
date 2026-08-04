/**
 * Procedurally generated artwork for a use case.
 *
 * Two layers, both derived from the data — nothing is hand-placed and nothing
 * is random at runtime:
 *
 *  1. A domain motif: flow lines for mobiliteit, a lattice for energie,
 *     contour bands for klimaatadaptatie, cells for gezondheid. Seeded from
 *     the use-case id, so every card is unique but recognisably of its domein.
 *  2. A beleidsdomein fingerprint: a radar silhouette over the 8 policy
 *     domains, lit where the use case touches one, with a centre dot sized by
 *     how many niveaus it spans. Use cases working on the same vraagstuk end
 *     up with visibly matching shapes.
 */

import {
  beleidsdomeinOrder,
  domainBgLightHex,
  domainHex,
  domainInkHex,
} from "@/data/taxonomy";
import type { Beleidsdomein, Domain, UseCase } from "@/data/types";
import { r1, seeded } from "@/lib/seed";

const W = 320;
const H = 104;

// --------------------------------------------------------------------------
// Layer 1 — domain motif
// --------------------------------------------------------------------------

type Rand = ReturnType<typeof seeded>;

/** Mobiliteit — sweeping flow lines, like desire lines across a city. */
function flowLines(rand: Rand): string[] {
  const paths: string[] = [];
  const count = rand.int(4, 6);
  const drift = rand.between(-30, 30);
  for (let i = 0; i < count; i++) {
    const y = (H / (count + 1)) * (i + 1) + rand.between(-8, 8);
    const lift = drift + rand.between(-22, 22);
    const bend = rand.between(0.18, 0.42);
    paths.push(
      `M ${-14} ${r1(y - lift * 0.4)} C ${r1(W * bend)} ${r1(y + lift)}, ${r1(
        W * (1 - bend)
      )} ${r1(y - lift)}, ${W + 14} ${r1(y + lift * 0.4)}`
    );
  }
  return paths;
}

/** Energie — a network lattice: rails, risers and connection nodes. */
function lattice(rand: Rand): { paths: string[]; nodes: [number, number][] } {
  const paths: string[] = [];
  const nodes: [number, number][] = [];
  const rails = rand.int(3, 4);
  const railYs: number[] = [];
  for (let i = 0; i < rails; i++) {
    const y = (H / (rails + 1)) * (i + 1) + rand.between(-6, 6);
    railYs.push(y);
    paths.push(`M ${-10} ${r1(y)} L ${W + 10} ${r1(y)}`);
  }
  const risers = rand.int(6, 9);
  for (let i = 0; i < risers; i++) {
    const x = (W / (risers + 1)) * (i + 1) + rand.between(-12, 12);
    const from = rand.int(0, rails - 1);
    const to = Math.min(rails - 1, from + rand.int(1, 2));
    paths.push(`M ${r1(x)} ${r1(railYs[from])} L ${r1(x)} ${r1(railYs[to])}`);
    if (rand.next() > 0.45) nodes.push([r1(x), r1(railYs[to])]);
  }
  return { paths, nodes };
}

/** Klimaatadaptatie — nested contour bands, half topography half water. */
function contours(rand: Rand): string[] {
  const paths: string[] = [];
  const count = rand.int(4, 6);
  const amp = rand.between(11, 22);
  const phase = rand.between(0, Math.PI * 2);
  for (let i = 0; i < count; i++) {
    const y = (H / (count + 1)) * (i + 1);
    const segments: string[] = [`M ${-10} ${r1(y)}`];
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const x = (W / steps) * s;
      const wave = Math.sin(phase + s * 0.9 + i * 0.55) * amp;
      segments.push(`Q ${r1(x - W / steps / 2)} ${r1(y + wave)} ${r1(x)} ${r1(y)}`);
    }
    paths.push(segments.join(" "));
  }
  return paths;
}

/** Gezondheid — overlapping cells, the organic counterpart to the lattice. */
function cells(rand: Rand): { cx: number; cy: number; r: number }[] {
  const out: { cx: number; cy: number; r: number }[] = [];
  const count = rand.int(7, 10);
  for (let i = 0; i < count; i++) {
    out.push({
      cx: r1(rand.between(-10, W + 10)),
      cy: r1(rand.between(-6, H + 6)),
      r: r1(rand.between(12, 34)),
    });
  }
  return out;
}

function Motif({ domain, seed }: { domain: Domain; seed: string }) {
  const rand = seeded(`${domain}:${seed}`);
  const ink = domainInkHex[domain];

  if (domain === "mobiliteit") {
    return (
      <g stroke={ink} fill="none" strokeWidth={1.6} strokeLinecap="round" opacity={0.36}>
        {flowLines(rand).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    );
  }

  if (domain === "energie") {
    const { paths, nodes } = lattice(rand);
    return (
      <g opacity={0.3}>
        <g stroke={ink} fill="none" strokeWidth={1.2} strokeLinecap="round">
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {nodes.map(([cx, cy], i) => (
          <rect key={i} x={cx - 2.5} y={cy - 2.5} width={5} height={5} fill={ink} />
        ))}
      </g>
    );
  }

  if (domain === "klimaatadaptatie") {
    return (
      <g stroke={ink} fill="none" strokeWidth={1.3} strokeLinecap="round" opacity={0.3}>
        {contours(rand).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    );
  }

  return (
    <g stroke={ink} fill="none" strokeWidth={1.2} opacity={0.28}>
      {cells(rand).map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </g>
  );
}

// --------------------------------------------------------------------------
// Layer 2 — beleidsdomein fingerprint
// --------------------------------------------------------------------------

const OUTER = 34;
const INNER = 11;

/** Spoke angles, starting at 12 o'clock and running clockwise. */
function spoke(index: number, radius: number): [number, number] {
  const angle = (Math.PI / 4) * index - Math.PI / 2;
  return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
}

export function Fingerprint({
  beleidsdomeinen,
  niveauCount,
  color,
  className,
}: {
  beleidsdomeinen: Beleidsdomein[];
  niveauCount: number;
  color: string;
  className?: string;
}) {
  const lit = beleidsdomeinOrder.map((key: Beleidsdomein) =>
    beleidsdomeinen.includes(key)
  );

  const outline = lit
    .map((on, i) => {
      const [x, y] = spoke(i, on ? OUTER : INNER);
      return `${i === 0 ? "M" : "L"} ${r1(x)} ${r1(y)}`;
    })
    .join(" ");

  return (
    <g className={className}>
      <path d={`${outline} Z`} fill={color} fillOpacity={0.16} stroke="none" />
      <path
        d={`${outline} Z`}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {lit.map((on, i) => {
        const [x, y] = spoke(i, on ? OUTER : INNER);
        return on ? (
          <circle key={i} cx={r1(x)} cy={r1(y)} r={3.4} fill={color} />
        ) : (
          <circle
            key={i}
            cx={r1(x)}
            cy={r1(y)}
            r={1.6}
            fill={color}
            fillOpacity={0.45}
          />
        );
      })}
      {/* Centre dot: one ring per niveau the use case spans. */}
      <circle cx={50} cy={50} r={2.5 + niveauCount * 1.7} fill={color} />
      <circle cx={50} cy={50} r={2.5 + niveauCount * 1.7} fill="white" fillOpacity={0.55} />
      <circle cx={50} cy={50} r={2.2} fill={color} />
    </g>
  );
}

// --------------------------------------------------------------------------
// Composed artwork
// --------------------------------------------------------------------------

/**
 * Card artwork: the domain motif only. The beleidsdomein fingerprint used to
 * sit here too, but at card size it was an unlabelled shape nobody could
 * decode — it now lives on the detail page as a labelled figure instead
 * (see BeleidsdomeinProfiel).
 */
export function UseCaseArtwork({
  useCase,
  className,
}: {
  useCase: UseCase;
  className?: string;
}) {
  const { domain } = useCase;

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ backgroundColor: domainBgLightHex[domain] }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="presentation"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <Motif domain={domain} seed={useCase.id} />
      </svg>
    </div>
  );
}

/** Wide banner for the detail hero and the domain group headers. */
export function DomainBanner({
  domain,
  seed,
  className,
}: {
  domain: Domain;
  seed: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <Motif domain={domain} seed={seed} />
    </svg>
  );
}

/** Standalone fingerprint, e.g. beside a detail-page heading. */
export function FingerprintMark({
  useCase,
  className,
}: {
  useCase: UseCase;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" role="presentation" aria-hidden="true" className={className}>
      <Fingerprint
        beleidsdomeinen={useCase.beleidsdomeinen}
        niveauCount={useCase.niveaus.length}
        color={domainHex[useCase.domain]}
      />
    </svg>
  );
}
