/**
 * A small force-directed layout, in 2 or 3 dimensions.
 *
 * Hand-rolled rather than pulled from a library: the graph is ~50 nodes, which
 * makes the naive O(n²) repulsion pass trivially cheap, and it keeps the app
 * free of a 3D dependency it would otherwise carry on every page.
 *
 * Starting positions come from a seeded generator, so the same catalogue always
 * settles into the same picture.
 */

import { seeded } from "@/lib/seed";

export interface GraphNode {
  id: string;
  /** Beleidsdomein hubs are heavier and pull use cases around them. */
  kind: "domein" | "usecase";
  label: string;
  color: string;
  radius: number;
  /** Extra payload for click-through. */
  href: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface GraphLink {
  source: number;
  target: number;
}

export interface GraphOptions {
  dimensions: 2 | 3;
  linkDistance?: number;
  repulsion?: number;
  spring?: number;
  centering?: number;
  damping?: number;
}

export function createNodes(
  specs: Omit<GraphNode, "x" | "y" | "z" | "vx" | "vy" | "vz">[],
  dimensions: 2 | 3
): GraphNode[] {
  return specs.map((spec) => {
    const rand = seeded(`layout:${spec.id}`);
    return {
      ...spec,
      // A sphere/disc of starting positions beats a random box: it settles faster
      // and avoids the layout unfolding from a knot.
      x: rand.between(-160, 160),
      y: rand.between(-160, 160),
      z: dimensions === 3 ? rand.between(-160, 160) : 0,
      vx: 0,
      vy: 0,
      vz: 0,
    };
  });
}

/** Advance the simulation by one step. `alpha` cools from 1 towards 0. */
export function tick(
  nodes: GraphNode[],
  links: GraphLink[],
  alpha: number,
  options: GraphOptions
) {
  const {
    dimensions,
    linkDistance = 105,
    repulsion = 3400,
    spring = 0.055,
    centering = 0.006,
    damping = 0.86,
  } = options;

  const use3d = dimensions === 3;

  // Repulsion — every node pushes every other node away.
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dz = use3d ? b.z - a.z : 0;
      let distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < 1) {
        // Coincident nodes would divide by zero; nudge them apart.
        dx = (i % 2 === 0 ? 1 : -1) * 0.5;
        dy = (j % 2 === 0 ? 1 : -1) * 0.5;
        dz = use3d ? 0.5 : 0;
        distSq = dx * dx + dy * dy + dz * dz;
      }
      const dist = Math.sqrt(distSq);
      // Hubs carry more charge, so they keep their satellites at arm's length;
      // two hubs repel hardest of all, which is what spreads the eight
      // beleidsdomeinen around the rim instead of piling them in the middle.
      const charge =
        repulsion * (a.kind === "domein" ? 3.6 : 1) * (b.kind === "domein" ? 3.6 : 1);
      const force = (charge / distSq) * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
      if (use3d) {
        a.vz -= fz;
        b.vz += fz;
      }
    }
  }

  // Springs — every edge pulls its two endpoints towards linkDistance.
  for (const link of links) {
    const a = nodes[link.source];
    const b = nodes[link.target];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = use3d ? b.z - a.z : 0;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
    const force = (dist - linkDistance) * spring * alpha;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    const fz = (dz / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
    if (use3d) {
      a.vz += fz;
      b.vz -= fz;
    }
  }

  // Centering and integration.
  for (const node of nodes) {
    node.vx -= node.x * centering * alpha;
    node.vy -= node.y * centering * alpha;
    if (use3d) node.vz -= node.z * centering * alpha;

    node.vx *= damping;
    node.vy *= damping;
    node.vz *= damping;

    node.x += node.vx;
    node.y += node.vy;
    if (use3d) node.z += node.vz;
    else node.z = 0;
  }
}

/** Rotate around Y then X, and apply a weak perspective divide. */
export function project(
  node: GraphNode,
  yaw: number,
  pitch: number,
  focal: number
): { x: number; y: number; scale: number; depth: number } {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = node.x * cosY - node.z * sinY;
  const z1 = node.x * sinY + node.z * cosY;

  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const y1 = node.y * cosX - z1 * sinX;
  const z2 = node.y * sinX + z1 * cosX;

  const scale = focal / (focal + z2);
  return { x: x1 * scale, y: y1 * scale, scale, depth: z2 };
}
