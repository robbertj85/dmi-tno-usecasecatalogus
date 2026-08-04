"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import {
  beleidsdomeinKleur,
  beleidsdomeinLabels,
  beleidsdomeinOrder,
  domainHex,
  domainLabels,
  domainOrder,
} from "@/data/taxonomy";
import type { Beleidsdomein, UseCase } from "@/data/types";
import {
  createNodes,
  project,
  tick,
  type GraphLink,
  type GraphNode,
} from "@/lib/force-graph";

const VIEW_W = 1100;
const VIEW_H = 720;
const FOCAL = 700;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 4;

const START_YAW = 0.6;
const START_PITCH = -0.25;

/**
 * Break a use-case name over at most `maxLines` lines of roughly `perLine`
 * characters. Two short lines beat one long one here: the label keeps half the
 * horizontal footprint, which is what decides whether it survives the collision
 * pass. Names are long — median 51 characters — so a single 30-character line
 * left most of them unrecognisable.
 */
function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= perLine || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    // Anything left over is cut on the last line rather than dropped silently.
    const used = lines.join(" ").length;
    if (used < text.length - 1) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] =
        last.length > perLine - 1
          ? `${last.slice(0, perLine - 1).trimEnd()}…`
          : `${last}…`;
    }
  }
  return lines;
}

type Anchor = "start" | "middle" | "end";

interface RelatieGraafProps {
  items: UseCase[];
  query?: string;
}

/**
 * The matrix as a bipartite graph in 3D: every use case is joined to each of
 * the 8 beleidsdomeinen it touches. Use cases that share policy domains get
 * pulled together, so the clusters — and the use cases that bridge two
 * catalogues — become visible in a way the grid of counts cannot show.
 *
 * Drag to rotate, scroll or use the buttons to zoom.
 */
export function RelatieGraaf({ items, query }: RelatieGraafProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [yaw, setYaw] = useState(START_YAW);
  const [pitch, setPitch] = useState(START_PITCH);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [, force] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<{ x: number; y: number; pan: boolean } | null>(null);
  const moved = useRef(false);
  const alpha = useRef(1);

  const { nodes, links, adjacency } = useMemo(() => {
    const specs: Omit<GraphNode, "x" | "y" | "z" | "vx" | "vy" | "vz">[] = [];
    const index = new Map<string, number>();

    for (const key of beleidsdomeinOrder) {
      index.set(`d:${key}`, specs.length);
      specs.push({
        id: `d:${key}`,
        kind: "domein",
        label: beleidsdomeinLabels[key],
        color: beleidsdomeinKleur[key],
        radius: 15,
        href: `/?beleidsdomein=${key}`,
      });
    }

    for (const useCase of items) {
      index.set(`u:${useCase.id}`, specs.length);
      specs.push({
        id: `u:${useCase.id}`,
        kind: "usecase",
        label: useCase.name,
        color: domainHex[useCase.domain],
        radius: 6,
        href: query ? `/usecase/${useCase.id}?${query}` : `/usecase/${useCase.id}`,
      });
    }

    const edges: GraphLink[] = [];
    const neighbours = new Map<string, Set<string>>();
    const join = (a: string, b: string) => {
      if (!neighbours.has(a)) neighbours.set(a, new Set());
      neighbours.get(a)!.add(b);
    };

    for (const useCase of items) {
      const from = index.get(`u:${useCase.id}`)!;
      for (const key of useCase.beleidsdomeinen as Beleidsdomein[]) {
        const to = index.get(`d:${key}`);
        if (to === undefined) continue;
        edges.push({ source: from, target: to });
        join(`u:${useCase.id}`, `d:${key}`);
        join(`d:${key}`, `u:${useCase.id}`);
      }
    }

    return { nodes: createNodes(specs, 3), links: edges, adjacency: neighbours };
  }, [items, query]);

  const run = useCallback(() => {
    alpha.current = 1;
    const step = () => {
      if (alpha.current <= 0.02) {
        force((n) => n + 1);
        return;
      }
      for (let i = 0; i < 3; i++) {
        tick(nodes, links, alpha.current, { dimensions: 3 });
        alpha.current *= 0.985;
      }
      force((n) => n + 1);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [nodes, links]);

  useEffect(() => {
    run();
  }, [run]);

  // Wheel zoom needs a non-passive listener to be able to stop the page from
  // scrolling underneath the graph.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((value) =>
        Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value * (event.deltaY < 0 ? 1.12 : 0.89)))
      );
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    // Shift or the middle button pans; a plain drag rotates.
    dragging.current = {
      x: event.clientX,
      y: event.clientY,
      pan: event.shiftKey || event.button === 1,
    };
    moved.current = false;
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragging.current.x;
    const dy = event.clientY - dragging.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
    const panning = dragging.current.pan;
    dragging.current = { x: event.clientX, y: event.clientY, pan: panning };

    if (panning) {
      // The svg is drawn in viewBox units, so translate the pointer delta into
      // those units before applying it.
      const rect = svgRef.current?.getBoundingClientRect();
      const unit = rect ? VIEW_W / rect.width : 1;
      setPan((value) => ({ x: value.x + dx * unit, y: value.y + dy * unit }));
      return;
    }

    setYaw((value) => value + dx * 0.006);
    setPitch((value) => Math.max(-1.2, Math.min(1.2, value + dy * 0.006)));
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const resetView = () => {
    setYaw(START_YAW);
    setPitch(START_PITCH);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const raw = nodes.map((node) => project(node, yaw, pitch, FOCAL));

  // Fit the settled layout to the frame, then apply the zoom on top of it, so
  // the picture always starts out filling the panel.
  const projected = useMemo(() => {
    if (raw.length === 0) return raw;
    const xs = raw.map((point) => point.x);
    const ys = raw.map((point) => point.y);
    const width = Math.max(...xs) - Math.min(...xs) || 1;
    const height = Math.max(...ys) - Math.min(...ys) || 1;
    const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
    const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
    // Leave room for labels, which sit beside and above their circles.
    const fit = Math.min((VIEW_W - 260) / width, (VIEW_H - 120) / height, 2.2) * zoom;
    return raw.map((point) => ({
      ...point,
      x: (point.x - midX) * fit + pan.x,
      y: (point.y - midY) * fit + pan.y,
    }));
  }, [raw, zoom, pan]);

  const order = projected
    .map((point, index) => ({ index, depth: point.depth }))
    .sort((a, b) => b.depth - a.depth)
    .map((entry) => entry.index);

  /**
   * Label every use case, but drop the ones that would collide with a label
   * already placed. Hubs go down first and always win; the rest are placed
   * best-connected-first, so the use cases that tie the catalogues together
   * keep their names. Hovering re-instates any label that was culled.
   */
  const labels = useMemo(() => {
    const placed: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const out = new Map<
      number,
      { x: number; y: number; lines: string[]; anchor: Anchor }
    >();

    const fits = (box: (typeof placed)[number]) =>
      !placed.some(
        (other) =>
          box.x1 < other.x2 &&
          box.x2 > other.x1 &&
          box.y1 < other.y2 &&
          box.y2 > other.y1
      );

    const ranked = nodes
      .map((node, index) => ({ node, index }))
      .sort((a, b) => {
        if (a.node.kind !== b.node.kind) return a.node.kind === "domein" ? -1 : 1;
        const degree =
          (adjacency.get(b.node.id)?.size ?? 0) - (adjacency.get(a.node.id)?.size ?? 0);
        return degree !== 0 ? degree : a.node.id.localeCompare(b.node.id);
      });

    for (const { node, index } of ranked) {
      const point = projected[index];
      if (!point) continue;
      const isHub = node.kind === "domein";
      const size = isHub ? 11 : 8.5;
      const lines = isHub ? [node.label] : wrap(node.label, 32, 2);
      const width =
        Math.max(...lines.map((line) => line.length)) * size * 0.52;
      const height = lines.length * size * 1.2;
      const radius = node.radius * point.scale;

      if (isHub) {
        placed.push({
          x1: point.x - width / 2,
          y1: point.y - radius - 8 - size,
          x2: point.x + width / 2,
          y2: point.y - radius - 4,
        });
        out.set(index, {
          x: point.x,
          y: point.y - radius - 7,
          lines,
          anchor: "middle",
        });
        continue;
      }

      // Use cases label to the right, falling back to the left.
      const candidates: { x: number; anchor: Anchor; x1: number }[] = [
        { x: point.x + radius + 4, anchor: "start", x1: point.x + radius + 4 },
        { x: point.x - radius - 4, anchor: "end", x1: point.x - radius - 4 - width },
      ];
      for (const candidate of candidates) {
        const box = {
          x1: candidate.x1,
          y1: point.y - height / 2,
          x2: candidate.x1 + width,
          y2: point.y + height / 2,
        };
        if (fits(box)) {
          placed.push(box);
          out.set(index, {
            x: candidate.x,
            y: point.y,
            lines,
            anchor: candidate.anchor,
          });
          break;
        }
      }
    }

    return out;
  }, [nodes, projected, adjacency]);

  const isLit = (id: string) =>
    !hovered || hovered === id || adjacency.get(hovered)?.has(id);

  const hoveredNode = hovered ? nodes.find((node) => node.id === hovered) : null;

  const zoomBy = (factor: number) =>
    setZoom((value) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value * factor)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-muted-foreground">
          {items.length} use cases &middot; {links.length} verbindingen &middot; sleep om
          te draaien, shift+sleep om te verschuiven, scroll om te zoomen
        </span>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border border-border/60 bg-muted/30 p-0.5">
            <button
              onClick={() => zoomBy(0.82)}
              aria-label="Uitzoomen"
              className="rounded px-2 py-1 text-muted-foreground hover:bg-white hover:text-[#004B87] transition-colors cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-[10px] font-mono text-muted-foreground tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => zoomBy(1.22)}
              aria-label="Inzoomen"
              className="rounded px-2 py-1 text-muted-foreground hover:bg-white hover:text-[#004B87] transition-colors cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={resetView}
            className="inline-flex items-center gap-1 rounded border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Maximize2 className="h-3 w-3" />
            Passend
          </button>
          <button
            onClick={run}
            className="inline-flex items-center gap-1 rounded border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Herschik
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-white">
        <svg
          ref={svgRef}
          viewBox={`${-VIEW_W / 2} ${-VIEW_H / 2} ${VIEW_W} ${VIEW_H}`}
          className="w-full cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <g>
            {links.map((link, index) => {
              const a = projected[link.source];
              const b = projected[link.target];
              const lit = isLit(nodes[link.source].id) && isLit(nodes[link.target].id);
              return (
                <line
                  key={index}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={nodes[link.target].color}
                  strokeWidth={lit ? 1 : 0.5}
                  strokeOpacity={hovered ? (lit ? 0.55 : 0.04) : 0.2}
                />
              );
            })}
          </g>

          {/* Far nodes first, so near ones draw over them. */}
          {order.map((index) => {
            const node = nodes[index];
            const point = projected[index];
            const lit = isLit(node.id);
            const isHub = node.kind === "domein";
            const radius = node.radius * point.scale;
            const placedLabel = labels.get(index);
            // A culled label comes back while its node is hovered, with room
            // for the full name over three lines.
            const label =
              placedLabel ??
              (hovered === node.id
                ? {
                    x: point.x + radius + 4,
                    y: point.y,
                    lines: wrap(node.label, 34, 3),
                    anchor: "start" as Anchor,
                  }
                : null);
            const size = isHub ? 11 : 8.5;
            const lineHeight = size * 1.2;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (!moved.current) router.push(node.href);
                }}
                className="cursor-pointer"
                opacity={lit ? 1 : 0.12}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  fill={node.color}
                  stroke="#FFFFFF"
                  strokeWidth={isHub ? 2 : 1.2}
                />
                {label && (
                  <text
                    x={label.x}
                    dx={isHub ? 0 : label.anchor === "start" ? 2 : -2}
                    textAnchor={label.anchor}
                    dominantBaseline={isHub ? "auto" : "central"}
                    fontSize={size}
                    fontWeight={isHub ? 600 : 400}
                    fill={isHub ? node.color : "#334155"}
                    stroke="#FFFFFF"
                    strokeWidth={isHub ? 3 : 2.4}
                    paintOrder="stroke"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  >
                    {label.lines.map((line, lineIndex) => (
                      <tspan
                        key={lineIndex}
                        x={label.x}
                        dx={isHub ? 0 : label.anchor === "start" ? 2 : -2}
                        y={
                          label.y -
                          ((label.lines.length - 1) * lineHeight) / 2 +
                          lineIndex * lineHeight
                        }
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="font-mono uppercase tracking-wider">Legenda</span>
        {domainOrder.map((domain) => (
          <span key={domain} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: domainHex[domain] }}
            />
            {domainLabels[domain]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#004B87]" />
          Beleidsdomein
        </span>
      </div>

      <p className="min-h-[1.25rem] text-xs text-foreground/70">
        {hoveredNode
          ? `${hoveredNode.label} — ${adjacency.get(hoveredNode.id)?.size ?? 0} ${
              hoveredNode.kind === "domein" ? "use cases" : "beleidsdomeinen"
            }`
          : "Beweeg over een knoop om zijn verbindingen te zien; klik om door te gaan."}
      </p>
    </div>
  );
}
