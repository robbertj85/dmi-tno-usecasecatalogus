/**
 * The "8 domeinen" diagram from the source documents, redrawn as SVG.
 *
 * A central node ringed by the eight beleidsdomeinen, in the document's own
 * clockwise arrangement (Wonen at twelve o'clock) and its own colours. On a
 * use-case page the satellites the use case actually touches are filled and
 * connected; the rest fade back, so the figure answers the format's question
 * — "welke beleidsdomeinen raken aan het vraagstuk?" — at a glance.
 */

import {
  beleidsdomeinFigureLines,
  beleidsdomeinFigureOrder,
  beleidsdomeinKleur,
  beleidsdomeinKleurTekst,
  beleidsdomeinLabels,
  dmiVisie,
  figuurBlauw,
  figuurOranje,
} from "@/data/taxonomy";
import type { Beleidsdomein } from "@/data/types";

const CX = 320;
const CY = 250;
const RING = 190;
const NODE = 52;
const CORE = 86;

function position(index: number): [number, number] {
  const angle = (Math.PI / 4) * index - Math.PI / 2;
  return [CX + Math.cos(angle) * RING, CY + Math.sin(angle) * RING];
}

/** Draw the connector between the two circle edges, not their centres. */
function connector(x: number, y: number) {
  const dx = x - CX;
  const dy = y - CY;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  return {
    x1: CX + ux * CORE,
    y1: CY + uy * CORE,
    x2: x - ux * NODE,
    y2: y - uy * NODE,
  };
}

function Lines({
  lines,
  x,
  y,
  size,
  fill,
  weight = 600,
}: {
  lines: string[];
  x: number;
  y: number;
  size: number;
  fill: string;
  weight?: number;
}) {
  const step = size * 1.15;
  const top = y - ((lines.length - 1) * step) / 2;
  return (
    <>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={top + i * step}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size}
          fontWeight={weight}
          fill={fill}
        >
          {line}
        </text>
      ))}
    </>
  );
}

interface DomeinenFiguurProps {
  /** Which satellites to light up. Omit to light all eight. */
  active?: Beleidsdomein[];
  /** Centre node text, pre-wrapped. Defaults to the DMI vision. */
  centerLines?: string[];
  centerColor?: string;
  /** Make the lit satellites link through to the filtered catalogue. */
  linked?: boolean;
  className?: string;
  title?: string;
}

export function DomeinenFiguur({
  active,
  centerLines = dmiVisie,
  centerColor = figuurOranje,
  linked = false,
  className,
  title = "De acht beleidsdomeinen rond de DMI-visie",
}: DomeinenFiguurProps) {
  const isActive = (key: Beleidsdomein) => !active || active.includes(key);

  return (
    <svg viewBox="0 0 640 500" role="img" aria-label={title} className={className}>
      {/* Connectors first, so the circles sit on top of them. */}
      {beleidsdomeinFigureOrder.map((key: Beleidsdomein, index: number) => {
        const [x, y] = position(index);
        const line = connector(x, y);
        const on = isActive(key);
        return (
          <line
            key={`c-${key}`}
            {...line}
            stroke={on ? beleidsdomeinKleur[key] : figuurBlauw}
            strokeWidth={on ? 2.5 : 1}
            strokeOpacity={on ? 0.85 : 0.18}
            strokeDasharray={on ? undefined : "3 5"}
          />
        );
      })}

      {beleidsdomeinFigureOrder.map((key: Beleidsdomein, index: number) => {
        const [x, y] = position(index);
        const on = isActive(key);
        const node = (
          <>
            <circle
              cx={x}
              cy={y}
              r={NODE}
              fill={on ? beleidsdomeinKleur[key] : "#FFFFFF"}
              stroke={on ? beleidsdomeinKleur[key] : figuurBlauw}
              strokeWidth={on ? 0 : 1.5}
              strokeOpacity={on ? 1 : 0.3}
            />
            <Lines
              lines={beleidsdomeinFigureLines[key]}
              x={x}
              y={y}
              size={13}
              fill={on ? beleidsdomeinKleurTekst[key] : figuurBlauw}
              weight={on ? 600 : 500}
            />
          </>
        );

        return linked && on ? (
          <a
            key={key}
            href={`/?beleidsdomein=${key}`}
            aria-label={`Toon use cases voor ${beleidsdomeinLabels[key]}`}
            className="cursor-pointer [&>circle]:transition-opacity hover:[&>circle]:opacity-80"
          >
            {node}
          </a>
        ) : (
          <g key={key} aria-hidden="true">
            {node}
          </g>
        );
      })}

      <circle cx={CX} cy={CY} r={CORE} fill={centerColor} />
      <Lines
        lines={centerLines}
        x={CX}
        y={CY}
        size={centerLines.length > 3 ? 14 : 16}
        fill="#FFFFFF"
        weight={700}
      />
    </svg>
  );
}
