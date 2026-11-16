import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Shared low-poly geometry + a material cache, so the thousands of little
 * parts in the world reuse a handful of GPU resources. One kit per world.
 */
export const createKit = () => {
  const geo = {
    box: new BoxGeometry(1, 1, 1),
    cone: new ConeGeometry(0.5, 1, 7),
    // 4-sided pyramid with a unit-square footprint (pre-rotated so x/z scale = width/depth)
    roof: new ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4),
    cyl: new CylinderGeometry(0.5, 0.5, 1, 8),
    taper: new CylinderGeometry(0.3, 0.5, 1, 10),
    ball: new IcosahedronGeometry(0.5, 1),
    rock: new DodecahedronGeometry(0.5, 0),
  };
  const extra: BufferGeometry[] = [];
  const lit = new Map<string, MeshLambertMaterial>();
  const glow = new Map<string, MeshBasicMaterial>();
  const rows = new Map<number, BufferGeometry>();

  /** Flat-shaded, lit material for a hex colour (cached). */
  const mat = (color: string): MeshLambertMaterial => {
    let m = lit.get(color);
    if (!m) {
      m = new MeshLambertMaterial({ color, flatShading: true });
      lit.set(color, m);
    }
    return m;
  };

  /** Unlit "emissive" material for fire, windows, toxic pools (cached). */
  const glowMat = (color: string): MeshBasicMaterial => {
    let m = glow.get(color);
    if (!m) {
      m = new MeshBasicMaterial({ color });
      glow.set(color, m);
    }
    return m;
  };

  /** n crop rows running along x, filling a unit square footprint, unit height. */
  const rowsGeo = (n: number): BufferGeometry => {
    let g = rows.get(n);
    if (!g) {
      const parts: BufferGeometry[] = [];
      for (let i = 0; i < n; i++) {
        const b = new BoxGeometry(1, 1, 0.6 / n);
        b.translate(0, 0.5, -0.5 + (i + 0.5) / n);
        parts.push(b);
      }
      g = mergeGeometries(parts);
      parts.forEach((b) => b.dispose());
      rows.set(n, g);
      extra.push(g);
    }
    return g;
  };

  /** Add a mesh to `parent`. pos is the part's centre; s its size; r its rotation. */
  const part = (
    parent: Object3D,
    geometry: BufferGeometry,
    material: Material | string,
    pos: [number, number, number],
    s: [number, number, number],
    r?: [number, number, number]
  ): Mesh => {
    const mesh = new Mesh(geometry, typeof material === 'string' ? mat(material) : material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    if (r) mesh.rotation.set(r[0], r[1], r[2]);
    parent.add(mesh);
    return mesh;
  };

  const dispose = () => {
    Object.values(geo).forEach((g) => g.dispose());
    extra.forEach((g) => g.dispose());
    lit.forEach((m) => m.dispose());
    glow.forEach((m) => m.dispose());
  };

  return { geo, mat, glowMat, rowsGeo, part, dispose };
};

export type Kit = ReturnType<typeof createKit>;

/** Small deterministic PRNG so the world is identical on every load. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
