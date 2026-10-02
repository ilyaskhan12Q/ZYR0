// Parametric shape definitions: triangle mesh (for depth) + line paths
// (for the visible line art). Line paths are built on mesh edges/faces so
// hidden-line removal via the depth buffer is exact.

import type { Vec3 } from './math';

export interface LineArtGeometry {
  positions: Float32Array;
  indices: Uint32Array;
  lineVerts: Float32Array; // stride 8: p0(3), p1(3), which(1), side(1)
  lineVertCount: number;
  radius: number;
}

class Builder {
  pos: number[] = [];
  idx: number[] = [];
  lines: number[] = [];

  vertex(v: Vec3): number {
    this.pos.push(v[0], v[1], v[2]);
    return this.pos.length / 3 - 1;
  }

  tri(a: number, b: number, c: number): void {
    this.idx.push(a, b, c);
  }

  quad(a: number, b: number, c: number, d: number): void {
    this.tri(a, b, c);
    this.tri(a, c, d);
  }

  path(pts: Vec3[], closed = false): void {
    const n = pts.length;
    if (n < 2) return;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      this.segment(pts[i], pts[(i + 1) % n]);
    }
  }

  segment(p0: Vec3, p1: Vec3): void {
    // two triangles: (0,-1)(1,-1)(1,1) and (0,-1)(1,1)(0,1)
    const corners: [number, number][] = [
      [0, -1], [1, -1], [1, 1],
      [0, -1], [1, 1], [0, 1],
    ];
    for (const [which, side] of corners) {
      this.lines.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], which, side);
    }
  }

  build(radius: number): LineArtGeometry {
    return {
      positions: new Float32Array(this.pos),
      indices: new Uint32Array(this.idx),
      lineVerts: new Float32Array(this.lines),
      lineVertCount: this.lines.length / 8,
      radius,
    };
  }
}

const RAD = Math.PI / 180;

// ---------------------------------------------------------------- sphere

function sphere(): LineArtGeometry {
  const R = 1.15;
  const NLAT = 18; // 10 degree steps
  const NLNG = 36;
  const b = new Builder();
  const pt = (i: number, j: number): Vec3 => {
    const lat = (-90 + (180 * i) / NLAT) * RAD;
    const lng = ((360 * j) / NLNG) * RAD;
    return [
      R * Math.cos(lat) * Math.cos(lng),
      R * Math.cos(lat) * Math.sin(lng),
      R * Math.sin(lat),
    ];
  };
  const grid: number[][] = [];
  for (let i = 0; i <= NLAT; i++) {
    grid[i] = [];
    for (let j = 0; j <= NLNG; j++) grid[i][j] = b.vertex(pt(i, j));
  }
  for (let i = 0; i < NLAT; i++) {
    for (let j = 0; j < NLNG; j++) {
      b.quad(grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]);
    }
  }
  for (let i = 1; i < NLAT; i++) {
    const ring: Vec3[] = [];
    for (let j = 0; j < NLNG; j++) ring.push(pt(i, j));
    b.path(ring, true);
  }
  for (let j = 0; j < NLNG; j++) {
    const mer: Vec3[] = [];
    for (let i = 1; i < NLAT; i++) mer.push(pt(i, j));
    b.path(mer);
  }
  return b.build(R);
}

// ---------------------------------------------------------------- cube

function cube(): LineArtGeometry {
  const s = 0.9;
  const stripes = 8;
  const b = new Builder();
  const c: Vec3[] = [];
  for (const x of [-s, s]) for (const y of [-s, s]) for (const z of [-s, s]) c.push([x, y, z]);
  // corners ordered: 0:- - -  1:- - +  2:- + -  3:- + +  4:+ - -  5:+ - +  6:+ + -  7:+ + +
  const faces = [
    [0, 2, 3, 1], // -x
    [4, 5, 7, 6], // +x
    [0, 1, 5, 4], // -y
    [2, 6, 7, 3], // +y
    [0, 4, 6, 2], // -z
    [1, 3, 7, 5], // +z
  ];
  const vi = c.map((p) => b.vertex(p));
  for (const f of faces) b.quad(vi[f[0]], vi[f[1]], vi[f[2]], vi[f[3]]);
  const edges: [number, number][] = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, d] of edges) b.segment(c[a], c[d]);
  // stripes: verticals on side faces + grid on top/bottom
  for (let i = 0; i <= stripes; i++) {
    const p = i / stripes;
    const v = -s + 2 * s * p;
    b.segment([v, -s, -s], [v, -s, s]);
    b.segment([v, s, -s], [v, s, s]);
    b.segment([-s, v, -s], [-s, v, s]);
    b.segment([s, v, -s], [s, v, s]);
    b.segment([-s, v, s], [s, v, s]);
    b.segment([v, -s, s], [v, s, s]);
    b.segment([-s, v, -s], [s, v, -s]);
    b.segment([v, -s, -s], [v, s, -s]);
  }
  return b.build(s * Math.sqrt(3));
}

// ---------------------------------------------------------------- cylinder

function cylinder(): LineArtGeometry {
  const r = 0.8;
  const z0 = -1.2;
  const z1 = 1.2;
  const N = 36;
  const b = new Builder();
  const ang = (j: number) => (360 * j) / N * RAD;
  const pt = (j: number, z: number): Vec3 => [r * Math.cos(ang(j)), r * Math.sin(ang(j)), z];
  const bottom: number[] = [];
  const top: number[] = [];
  const cb = b.vertex([0, 0, z0]);
  const ct = b.vertex([0, 0, z1]);
  for (let j = 0; j < N; j++) {
    bottom.push(b.vertex(pt(j, z0)));
    top.push(b.vertex(pt(j, z1)));
  }
  for (let j = 0; j < N; j++) {
    const k = (j + 1) % N;
    b.quad(bottom[j], bottom[k], top[k], top[j]);
    b.tri(cb, bottom[k], bottom[j]);
    b.tri(ct, top[j], top[k]);
  }
  for (let j = 0; j < N; j++) b.segment(pt(j, z0), pt(j, z1));
  for (const z of [z0, z1]) {
    const ring: Vec3[] = [];
    for (let j = 0; j < N; j++) ring.push(pt(j, z));
    b.path(ring, true);
    for (const f of [0.66, 0.33]) {
      const inner: Vec3[] = [];
      for (let j = 0; j < N; j++) inner.push([r * f * Math.cos(ang(j)), r * f * Math.sin(ang(j)), z]);
      b.path(inner, true);
    }
  }
  return b.build(Math.hypot(r, z1));
}

// ---------------------------------------------------------------- cone

function cone(): LineArtGeometry {
  const r = 1.1;
  const h = 2.0;
  const z0 = -h / 2;
  const NR = 5; // ring levels incl. base and apex
  const N = 36;
  const b = new Builder();
  const ang = (j: number) => (360 * j) / N * RAD;
  const ringPt = (k: number, j: number): Vec3 => {
    const z = z0 + (h * k) / NR;
    const rr = r * (1 - k / NR);
    return [rr * Math.cos(ang(j)), rr * Math.sin(ang(j)), z];
  };
  const grid: number[][] = [];
  for (let k = 0; k <= NR; k++) {
    grid[k] = [];
    for (let j = 0; j < N; j++) grid[k][j] = b.vertex(ringPt(k, j));
  }
  for (let k = 0; k < NR; k++) {
    for (let j = 0; j < N; j++) {
      const m = (j + 1) % N;
      b.quad(grid[k][j], grid[k][m], grid[k + 1][m], grid[k + 1][j]);
    }
  }
  // base cap fan
  const cb = b.vertex([0, 0, z0]);
  for (let j = 0; j < N; j++) {
    const m = (j + 1) % N;
    b.tri(cb, grid[0][m], grid[0][j]);
  }
  // 12 meridians (every 30 degrees = subset of the 10-degree mesh)
  const apex: Vec3 = [0, 0, z0 + h];
  for (let j = 0; j < N; j += 3) {
    b.path([ringPt(0, j), apex]);
  }
  // rings at each mesh level (level NR is the apex point)
  for (let k = 0; k < NR; k++) {
    const ring: Vec3[] = [];
    for (let j = 0; j < N; j++) ring.push(ringPt(k, j));
    b.path(ring, true);
  }
  return b.build(Math.hypot(r, h / 2) * 1.15);
}

// ---------------------------------------------------------------- torus

function torus(): LineArtGeometry {
  const R = 1.35;
  const tr = 0.55;
  const NU = 48;
  const NV = 16;
  const b = new Builder();
  const pt = (i: number, j: number): Vec3 => {
    const u = (2 * Math.PI * i) / NU;
    const v = (2 * Math.PI * j) / NV;
    return [(R + tr * Math.cos(v)) * Math.cos(u), (R + tr * Math.cos(v)) * Math.sin(u), tr * Math.sin(v)];
  };
  const grid: number[][] = [];
  for (let i = 0; i < NU; i++) {
    grid[i] = [];
    for (let j = 0; j < NV; j++) grid[i][j] = b.vertex(pt(i, j));
  }
  for (let i = 0; i < NU; i++) {
    for (let j = 0; j < NV; j++) {
      const i2 = (i + 1) % NU;
      const j2 = (j + 1) % NV;
      b.quad(grid[i][j], grid[i2][j], grid[i2][j2], grid[i][j2]);
    }
  }
  for (let i = 0; i < NU; i += 3) {
    const ring: Vec3[] = [];
    for (let j = 0; j < NV; j++) ring.push(pt(i, j));
    b.path(ring, true);
  }
  for (let j = 0; j < NV; j += 2) {
    const ring: Vec3[] = [];
    for (let i = 0; i < NU; i++) ring.push(pt(i, j));
    b.path(ring, true);
  }
  return b.build(R + tr);
}

// ---------------------------------------------------------------- icosahedron

function icosahedron(): LineArtGeometry {
  const radius = 1.35;
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const s = radius / Math.sqrt(1 + t * t);
  const b = new Builder();
  const scaled = raw.map((p): Vec3 => [p[0] * s, p[1] * s, p[2] * s]);
  const v = scaled.map((p) => b.vertex(p));
  for (const f of faces) b.tri(v[f[0]], v[f[1]], v[f[2]]);
  const seen = new Set<string>();
  for (const [i0, i1, i2] of faces) {
    for (const [a, d] of [[i0, i1], [i1, i2], [i2, i0]]) {
      const key = a < d ? `${a}_${d}` : `${d}_${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      b.segment(scaled[a], scaled[d]);
    }
  }
  return b.build(radius);
}

// ---------------------------------------------------------------- ripple

function rippleHeight(x: number, y: number): number {
  const d = Math.hypot(x, y);
  return 0.55 * Math.sin(2.4 * d) * Math.exp(-0.28 * d) - 0.35;
}

function ripple(): LineArtGeometry {
  const b = new Builder();
  const RING_STEP = 0.1;
  const NR = 27; // up to 2.7
  const ANG_STEP = 1.5; // degrees — divides 45
  const NA = Math.round(360 / ANG_STEP);
  const pt = (ri: number, j: number): Vec3 => {
    const r = ri * RING_STEP;
    const a = (j * ANG_STEP) * RAD;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    return [x, y, rippleHeight(x, y)];
  };
  const grid: number[][] = [];
  for (let ri = 0; ri <= NR; ri++) {
    grid[ri] = [];
    for (let j = 0; j < NA; j++) grid[ri][j] = b.vertex(pt(ri, j));
  }
  for (let ri = 0; ri < NR; ri++) {
    for (let j = 0; j < NA; j++) {
      const j2 = (j + 1) % NA;
      b.quad(grid[ri][j], grid[ri][j2], grid[ri + 1][j2], grid[ri + 1][j]);
    }
  }
  // concentric rings at every second mesh ring
  for (let ri = 2; ri <= NR; ri += 2) {
    const ring: Vec3[] = [];
    for (let j = 0; j < NA; j++) ring.push(pt(ri, j));
    b.path(ring, true);
  }
  // 8 radial spokes (every 45 degrees = every 30 mesh columns)
  for (let j = 0; j < NA; j += 30) {
    const spoke: Vec3[] = [];
    for (let ri = 0; ri <= NR; ri++) spoke.push(pt(ri, j));
    b.path(spoke);
  }
  return b.build(2.9);
}

// ---------------------------------------------------------------- helix

function helix(): LineArtGeometry {
  const R = 1.0;
  const tube = 0.17;
  const turns = 3;
  const height = 2.6;
  const N = 160; // along helix
  const M = 18; // around tube (30-degree steps → spines at 0/120/240)
  const b = new Builder();
  const frame = (s: number): { c: Vec3; u: Vec3; w: Vec3; T: Vec3 } => {
    const th = 2 * Math.PI * turns * s;
    const z = -height / 2 + height * s;
    const c: Vec3 = [R * Math.cos(th), R * Math.sin(th), z];
    // d/ds of center (unnormalized tangent)
    const dth = 2 * Math.PI * turns;
    const T = normalize([-R * Math.sin(th) * dth, R * Math.cos(th) * dth, height]);
    const u: Vec3 = [Math.cos(th), Math.sin(th), 0]; // radial, perpendicular to T
    const w = normalize([
      T[1] * u[2] - T[2] * u[1],
      T[2] * u[0] - T[0] * u[2],
      T[0] * u[1] - T[1] * u[0],
    ]);
    return { c, u, w, T };
  };
  const pt = (i: number, m: number): Vec3 => {
    const { c, u, w } = frame(i / N);
    const a = (2 * Math.PI * m) / M;
    const ca = Math.cos(a) * tube;
    const sa = Math.sin(a) * tube;
    return [c[0] + u[0] * ca + w[0] * sa, c[1] + u[1] * ca + w[1] * sa, c[2] + u[2] * ca + w[2] * sa];
  };
  const grid: number[][] = [];
  for (let i = 0; i <= N; i++) {
    grid[i] = [];
    for (let m = 0; m < M; m++) grid[i][m] = b.vertex(pt(i, m));
  }
  for (let i = 0; i < N; i++) {
    for (let m = 0; m < M; m++) {
      const m2 = (m + 1) % M;
      b.quad(grid[i][m], grid[i][m2], grid[i + 1][m2], grid[i + 1][m]);
    }
  }
  // end caps
  for (const i of [0, N]) {
    const { c } = frame(i / N);
    const center = b.vertex(c);
    for (let m = 0; m < M; m++) {
      const m2 = (m + 1) % M;
      if (i === 0) b.tri(center, grid[i][m2], grid[i][m]);
      else b.tri(center, grid[i][m], grid[i][m2]);
    }
    const rim: Vec3[] = [];
    for (let m = 0; m < M; m++) rim.push(pt(i, m));
    b.path(rim, true);
  }
  // cross-section rings along the tube
  for (let i = 0; i <= N; i += 4) {
    const ring: Vec3[] = [];
    for (let m = 0; m < M; m++) ring.push(pt(i, m));
    b.path(ring, true);
  }
  // three spine lines at 0/120/240 degrees
  for (const m of [0, 6, 12]) {
    const spine: Vec3[] = [];
    for (let i = 0; i <= N; i++) spine.push(pt(i, m));
    b.path(spine);
  }
  return b.build(Math.hypot(R + tube, height / 2));
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

// ---------------------------------------------------------------- registry

export const SHAPE_NAMES = [
  'sphere',
  'cube',
  'cylinder',
  'cone',
  'torus',
  'icosahedron',
  'ripple',
  'helix',
] as const;

export type ShapeName = (typeof SHAPE_NAMES)[number];

const BUILDERS: Record<ShapeName, () => LineArtGeometry> = {
  sphere,
  cube,
  cylinder,
  cone,
  torus,
  icosahedron,
  ripple,
  helix,
};

const cache = new Map<ShapeName, LineArtGeometry>();

export function getGeometry(name: ShapeName): LineArtGeometry {
  let g = cache.get(name);
  if (!g) {
    g = BUILDERS[name]();
    cache.set(name, g);
  }
  return g;
}
