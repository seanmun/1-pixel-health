import { Group, Mesh, Object3D, Vector3 } from 'three';
import { Kit, mulberry32 } from './kit';
import { progressAtYear, yearAtProgress } from '../../../utils/timeScale';
import { iceAt } from '../../../data/vitals';
import { ModelId } from './models';

/** Length of the whole walk in world units (metres, roughly). */
export const WORLD_LEN = 1000;
/** Half-width of the diet road. */
export const ROAD_HALF = 2.6;

/** World x for a given year. */
export const xAtYear = (year: number) => progressAtYear(year) * WORLD_LEN;
/** Year at a given world x (clamped to the timeline). */
export const yearAtX = (x: number) => yearAtProgress(x / WORLD_LEN);

export type EmitterKind = 'smoke' | 'steam' | 'spray' | 'vapour';
export interface Emitter {
  pos: Vector3;
  kind: EmitterKind;
  seed: number;
}

export interface Scenery {
  group: Group;
  /** Every placed prop with its world x, for cheap visibility culling. */
  items: { x: number; reach: number; obj: Object3D }[];
  emitters: Emitter[];
  flames: Mesh[];
  spinners: { obj: Object3D; speed: number; x: number }[];
  /** Placeholders that a finished model replaces once it has loaded. */
  slots: { id: ModelId; obj: Group }[];
}

const SEED_OIL = '#8B3DE4';

/**
 * Procedurally lays out the whole 300,000-year roadside: camps and megafauna,
 * the ice age, the first fields, villages and cities, then factories,
 * monocrops, seed-oil plants and the power grid. Deterministic.
 */
export const buildScenery = (kit: Kit): Scenery => {
  const { geo: G, part: P, glowMat, rowsGeo } = kit;
  const rng = mulberry32(300000);
  const rand = (a: number, b: number) => a + rng() * (b - a);
  const pick = <T,>(xs: T[]): T => xs[Math.floor(rng() * xs.length)];

  const group = new Group();
  const items: Scenery['items'] = [];
  const flames: Mesh[] = [];
  const spinners: Scenery['spinners'] = [];
  const markers: { obj: Object3D; kind: EmitterKind }[] = [];
  const slots: Scenery['slots'] = [];

  const place = (
    x: number,
    z: number,
    build: (g: Group) => void,
    opts: { rotY?: number; reach?: number; scale?: number; model?: ModelId } = {}
  ) => {
    const g = new Group();
    build(g);
    g.position.set(x, 0, z);
    if (opts.rotY) g.rotation.y = opts.rotY;
    if (opts.scale) g.scale.setScalar(opts.scale);
    group.add(g);
    items.push({ x, reach: opts.reach ?? 6, obj: g });
    if (opts.model) slots.push({ id: opts.model, obj: g });
    return g;
  };
  const emit = (g: Group, kind: EmitterKind, x: number, y: number, z: number) => {
    const o = new Object3D();
    o.position.set(x, y, z);
    g.add(o);
    markers.push({ obj: o, kind });
  };

  // ---- Plants & terrain -------------------------------------------------
  const acacia = (g: Group) => {
    const h = rand(2.2, 3.4);
    const w = rand(3, 4.6);
    P(g, G.cyl, '#5b4030', [0, h / 2, 0], [0.28, h, 0.28]);
    P(g, G.ball, pick(['#61803c', '#6c8a3e']), [0, h + 0.3, 0], [w, 0.9, w]);
  };
  const leafy = (g: Group) => {
    const h = rand(1.6, 2.6);
    const w = rand(2.2, 3);
    P(g, G.cyl, '#5b4030', [0, h / 2, 0], [0.32, h, 0.32]);
    P(g, G.ball, pick(['#3f7d46', '#4c8a3f', '#35703f']), [0, h + w * 0.35, 0], [w, w, w]);
  };
  const pine = (g: Group, snowy: boolean) => {
    P(g, G.cyl, '#4a3526', [0, 0.6, 0], [0.3, 1.2, 0.3]);
    for (let i = 0; i < 3; i++) {
      const w = 2.4 - i * 0.6;
      const color = snowy && i > 0 ? '#e4edf5' : snowy ? '#7f9c93' : '#2f5d46';
      P(g, G.cone, color, [0, 1.7 + i * 1.0, 0], [w, 1.5, w]);
    }
  };
  /** Unit-sized (1 m tall); `placeRock` sizes and turns it, so the finished model matches. */
  const rock = (g: Group, snowy: boolean) => {
    P(g, G.rock, snowy ? '#c9d3dc' : '#6d6a66', [0, 0.375, 0], [1.75, 1, 1.25]);
  };
  const placeRock = (x: number, z: number, snowy: boolean, s = rand(0.5, 1.5)) =>
    place(x, z, (g) => rock(g, snowy), { model: 'rock', scale: s * 0.8, rotY: rng() * 3 });
  const grass = (g: Group) => {
    for (let i = 0; i < 3; i++)
      P(g, G.cone, '#8a9a4e', [rand(-0.3, 0.3), 0.3, rand(-0.3, 0.3)], [0.16, 0.6, 0.16]);
  };
  const berryBush = (g: Group) => {
    P(g, G.ball, '#3d6b3a', [0, 0.5, 0], [1.3, 1.1, 1.3]);
    for (let i = 0; i < 6; i++) {
      const a = rng() * Math.PI * 2;
      P(g, G.ball, '#c0304a', [Math.cos(a) * 0.5, rand(0.4, 0.9), Math.sin(a) * 0.5], [0.14, 0.14, 0.14]);
    }
  };
  const glacier = (g: Group) => {
    P(g, G.rock, '#cfe6f5', [0, 2, 0], [rand(10, 16), rand(5, 8), 8], [0, rng(), 0]);
    P(g, G.rock, '#e9f4fb', [rand(-4, 4), 3.4, 1], [6, 4, 5], [0, rng(), 0.2]);
  };
  const mountain = (g: Group, h: number, w: number, snowy: boolean) => {
    P(g, G.cone, '#2c3148', [0, h / 2, 0], [w, h, w]);
    if (snowy) P(g, G.cone, '#dfe8f2', [0, h * 0.79, 0], [w * 0.44, h * 0.44, w * 0.44]);
  };
  const field = (g: Group, len: number, depth: number, n: number, crop: string, h: number) => {
    P(g, G.box, '#4d3b28', [0, 0.04, 0], [len, 0.08, depth]);
    P(g, rowsGeo(n), crop, [0, 0.08, 0], [len, h, depth]);
  };

  // ---- Animals -----------------------------------------------------------
  const quadruped = (
    g: Group,
    o: { len: number; h: number; w: number; leg: number; color: string; head: number; headColor?: string }
  ) => {
    P(g, G.box, o.color, [0, o.leg + o.h / 2, 0], [o.len, o.h, o.w]);
    const t = Math.max(0.1, o.w * 0.28);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        P(g, G.cyl, o.headColor ?? o.color, [sx * o.len * 0.36, o.leg / 2, sz * o.w * 0.3], [t, o.leg, t]);
    P(g, G.box, o.headColor ?? o.color, [o.len / 2 + o.head * 0.35, o.leg + o.h * 0.85, 0], [o.head, o.head, o.head * 0.8]);
  };
  const mammoth = (g: Group) => {
    quadruped(g, { len: 2.6, h: 1.7, w: 1.4, leg: 1.3, color: '#5a4334', head: 1.2 });
    P(g, G.ball, '#5a4334', [0.4, 3.1, 0], [1.6, 1, 1.3]);
    P(g, G.cyl, '#4d392c', [2.25, 1.5, 0], [0.3, 1.7, 0.3]);
    for (const sz of [-0.4, 0.4])
      P(g, G.cyl, '#efe6d0', [2.5, 1.5, sz], [0.12, 1.4, 0.12], [0, 0, -1.0]);
  };
  const antelope = (g: Group) => {
    quadruped(g, { len: 1.3, h: 0.5, w: 0.4, leg: 0.8, color: '#b08a5a', head: 0.35 });
    for (const sz of [-0.1, 0.1]) P(g, G.cone, '#3b2f25', [0.8, 1.75, sz], [0.06, 0.5, 0.06]);
  };
  const reindeer = (g: Group) => {
    quadruped(g, { len: 1.6, h: 0.6, w: 0.5, leg: 0.75, color: '#7d7468', head: 0.4, headColor: '#5c544b' });
    for (const sz of [-0.15, 0.15]) P(g, G.cone, '#4a3a2c', [0.95, 1.7, sz], [0.08, 0.7, 0.08], [0, 0, 0.3]);
  };
  const bison = (g: Group) => {
    quadruped(g, { len: 2.5, h: 1.0, w: 0.8, leg: 0.7, color: '#4a3324', head: 0.7 });
    P(g, G.ball, '#3d2a1e', [0.7, 1.55, 0], [1.2, 0.8, 0.9]);
  };
  const cow = (g: Group) =>
    quadruped(g, { len: 1.8, h: 0.9, w: 0.7, leg: 0.7, color: pick(['#e9e3d5', '#7a5236']), head: 0.5 });
  const sheep = (g: Group) =>
    quadruped(g, { len: 1, h: 0.6, w: 0.6, leg: 0.35, color: '#efefe6', head: 0.3, headColor: '#3a3a3a' });
  const goat = (g: Group) => {
    quadruped(g, { len: 1, h: 0.45, w: 0.4, leg: 0.45, color: '#a48a68', head: 0.28, headColor: '#5c4a38' });
    for (const sz of [-0.08, 0.08]) P(g, G.cone, '#6b5a48', [0.55, 1.05, sz], [0.06, 0.3, 0.06], [0, 0, 0.5]);
  };
  const placeCow = (x: number, z: number) => place(x, z, cow, { model: 'cow', rotY: rng() * 6 });
  const placeSheep = (x: number, z: number) => place(x, z, sheep, { model: 'sheep', rotY: rng() * 6 });
  const placeGoat = (x: number, z: number) => place(x, z, goat, { model: 'goat', rotY: rng() * 6 });

  // ---- Food & how it was prepared ----------------------------------------
  // The fire is three props on one spot — hearth, flames, spit — so the hearth
  // and spit can be swapped for finished models without losing the flames.
  /** Stone ring and logs. */
  const campfire = (g: Group) => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      P(g, G.rock, '#55524f', [Math.cos(a) * 0.65, 0.1, Math.sin(a) * 0.65], [0.35, 0.25, 0.35]);
    }
    P(g, G.cyl, '#4a3526', [0, 0.15, 0], [0.16, 1.1, 0.16], [0, 0, 1.4]);
    P(g, G.cyl, '#4a3526', [0, 0.15, 0], [0.16, 1.1, 0.16], [1.4, 0, 0]);
  };
  const fire = (g: Group) => {
    flames.push(P(g, G.cone, glowMat('#ff7a1f'), [0, 0.6, 0], [0.75, 1.2, 0.75]));
    flames.push(P(g, G.cone, glowMat('#ffd34d'), [0, 0.45, 0], [0.4, 0.75, 0.4]));
    emit(g, 'smoke', 0, 1.4, 0);
  };
  /** Two forked posts and a crossbar with a haunch of meat; stands over the fire. */
  const spitRoast = (g: Group) => {
    for (const sx of [-1, 1]) P(g, G.cyl, '#5b4030', [sx, 0.65, 0], [0.08, 1.3, 0.08]);
    P(g, G.cyl, '#5b4030', [0, 1.25, 0], [0.05, 2.2, 0.05], [0, 0, Math.PI / 2]);
    P(g, G.cyl, '#8a3b2a', [0, 1.25, 0], [0.38, 0.95, 0.38], [0, 0, Math.PI / 2]);
  };
  /** Strips of meat and fish air-drying — the oldest preservation method. */
  const dryingRack = (g: Group) => {
    for (const sx of [-1.1, 1.1]) P(g, G.cyl, '#5b4030', [sx, 0.9, 0], [0.09, 1.8, 0.09]);
    P(g, G.cyl, '#5b4030', [0, 1.75, 0], [0.06, 2.5, 0.06], [0, 0, Math.PI / 2]);
    for (let i = 0; i < 6; i++)
      P(g, G.box, i % 3 === 2 ? '#b98a6a' : '#9c3b30', [-0.9 + i * 0.36, 1.4, 0], [0.18, 0.6, 0.05]);
  };
  const spearRack = (g: Group) => {
    for (let i = 0; i < 3; i++) {
      P(g, G.cyl, '#6b4a2e', [i * 0.25, 1.05, 0], [0.05, 2.2, 0.05], [0.25 - i * 0.25, 0, 0.12]);
      P(g, G.cone, '#8d8d93', [i * 0.25 - 0.13, 2.2, 0.27 - i * 0.27], [0.1, 0.28, 0.1]);
    }
  };
  /** Clay oven with loaves — early bread. */
  // Like the campfire, the glow and smoke are a separate prop on the same
  // spot so the oven itself can be swapped for the finished model.
  const oven = (g: Group) => {
    P(g, G.ball, '#b5683f', [-0.45, 0.4, 0], [1.45, 1.5, 1.45]);
    P(g, G.box, '#2a1810', [-0.45, 0.35, 0.66], [0.5, 0.45, 0.2]);
    P(g, G.box, '#7a5a3c', [0.75, 0.45, 0.2], [0.85, 0.08, 0.6]);
    for (const sx of [0.4, 1.1]) P(g, G.box, '#5b4030', [sx, 0.22, 0.2], [0.08, 0.45, 0.5]);
    for (let i = 0; i < 3; i++) P(g, G.ball, '#d9a55a', [0.5 + i * 0.25, 0.55, 0.2], [0.26, 0.16, 0.2]);
  };
  const ovenFire = (g: Group) => {
    flames.push(P(g, G.box, glowMat('#ff8a2a'), [-0.45, 0.3, 0.6], [0.3, 0.2, 0.06]));
    emit(g, 'smoke', -0.45, 1.3, 0);
  };
  const placeOven = (x: number, z: number) => {
    place(x, z, oven, { model: 'clay-oven' });
    place(x, z, ovenFire);
  };
  /** Saddle quern with handstone — stone-ground flour. */
  const quern = (g: Group) => {
    P(g, G.rock, '#77736d', [0, 0.05, 0], [0.8, 0.12, 0.34]);
    P(g, G.rock, '#8a857d', [0, 0.12, 0], [0.16, 0.1, 0.26]);
  };
  /** Sealed clay jars — fermentation: beer, wine, pickles. */
  const pots = (g: Group) => {
    for (let i = 0; i < 3; i++) {
      const s = 0.8 + (i % 2) * 0.3;
      P(g, G.taper, '#a8562f', [i * 0.65, 0.35 * s, 0], [0.5 * s, 0.7 * s, 0.5 * s], [Math.PI, 0, 0]);
      P(g, G.cyl, '#7c3f22', [i * 0.65, 0.72 * s, 0], [0.34 * s, 0.06, 0.34 * s]);
    }
  };
  const sheaves = (g: Group) => {
    for (let i = 0; i < 3; i++) P(g, G.cone, '#d9b84a', [i * 0.55, 0.5, (i % 2) * 0.3], [0.5, 1, 0.5]);
  };
  /** Market stall: cheese, bread, amphorae of oil and wine. */
  const stall = (g: Group) => {
    for (const sx of [-1, 1]) for (const sz of [-0.6, 0.6]) P(g, G.cyl, '#5b4030', [sx, 0.85, sz], [0.08, 1.7, 0.08]);
    P(g, G.box, pick(['#b8452f', '#3f6f9a', '#b8902f']), [0, 1.75, 0], [2.4, 0.1, 1.6], [0.12, 0, 0]);
    P(g, G.box, '#7a5a3c', [0, 0.45, 0.2], [2, 0.9, 0.8]);
    P(g, G.cyl, '#f2c94c', [-0.6, 1.0, 0.25], [0.5, 0.2, 0.5]);
    P(g, G.cyl, '#f2c94c', [-0.55, 1.2, 0.25], [0.4, 0.18, 0.4]);
    for (let i = 0; i < 3; i++) P(g, G.ball, '#d9a55a', [0.1 + i * 0.35, 1.0, 0.25], [0.3, 0.2, 0.22]);
    for (let i = 0; i < 2; i++)
      P(g, G.taper, '#b5683f', [1.5 + i * 0.5, 0.45, 0.6], [0.4, 0.9, 0.4], [Math.PI, 0, 0]);
  };

  // ---- Shelter & buildings -----------------------------------------------
  const hideTent = (g: Group, fur: boolean) => {
    P(g, G.cone, fur ? '#8f7a60' : '#8b6f4e', [0, 1.2, 0], [2.9, 2.4, 2.9]);
    P(g, G.box, '#2a1f18', [0, 0.5, 1.02], [0.7, 1.0, 0.5]);
    P(g, G.cyl, '#4a3526', [0, 2.5, 0], [0.06, 0.6, 0.06], [0, 0, 0.3]);
  };
  const mudHut = (g: Group) => {
    P(g, G.cyl, '#b49a72', [0, 0.8, 0], [2.6, 1.6, 2.6]);
    P(g, G.cone, '#7a6238', [0, 2.25, 0], [3.3, 1.4, 3.3]);
    P(g, G.box, '#2a1f18', [0, 0.6, 1.28], [0.6, 1.1, 0.1]);
  };
  const house = (g: Group, w: number, h: number, d: number, wall: string, roof: string) => {
    P(g, G.box, wall, [0, h / 2, 0], [w, h, d]);
    P(g, G.roof, roof, [0, h + 0.6, 0], [w * 1.12, 1.2, d * 1.12]);
    P(g, G.box, '#2a1f18', [0, 0.6, d / 2 + 0.01], [0.6, 1.2, 0.06]);
  };
  const barn = (g: Group) => house(g, 5, 3, 4, '#8c3b2e', '#3f3632');
  const smokehouse = (g: Group) => house(g, 2.2, 1.6, 2, '#4a3f36', '#2f2a26');
  /** Screw press for olive oil and wine. */
  const olivePress = (g: Group) => {
    for (const sx of [-1, 1]) P(g, G.box, '#5b4030', [sx, 1.25, 0], [0.3, 2.5, 0.3]);
    P(g, G.box, '#5b4030', [0, 2, 0], [2.4, 0.3, 0.35]);
    P(g, G.cyl, '#6b4a2e', [0, 1.4, 0], [0.14, 1.4, 0.14]);
    P(g, G.cyl, '#b59a6a', [0, 0.55, 0], [0.9, 0.5, 0.9]);
    P(g, G.cyl, '#77736d', [0, 0.15, 0], [1.5, 0.3, 1.5]);
  };
  /** One section of dry-stone field wall. */
  const fence = (g: Group) => {
    P(g, G.box, '#77736d', [0, 0.45, 0], [2.7, 0.9, 0.45]);
  };
  /** Ox drawing a scratch plough. */
  const oxPlough = (g: Group) => {
    const ox = new Group();
    quadruped(ox, { len: 1.9, h: 0.9, w: 0.7, leg: 0.6, color: '#7a4a30', head: 0.5 });
    ox.position.x = 0.8;
    g.add(ox);
    P(g, G.cyl, '#6b4a2e', [-0.9, 0.7, 0], [0.07, 2, 0.07], [0, 0, 1.25]);
    P(g, G.cyl, '#6b4a2e', [-1.8, 0.6, 0], [0.08, 1.2, 0.08], [0, 0, -0.35]);
  };
  const granary = (g: Group) => {
    P(g, G.cyl, '#c2a878', [0, 1.3, 0], [2, 2.6, 2]);
    P(g, G.cone, '#7a6238', [0, 3.1, 0], [2.5, 1.2, 2.5]);
  };
  const windmill = (g: Group, x: number) => {
    P(g, G.taper, '#cbbfa8', [0, 2.5, 0], [2.4, 5, 2.4]);
    P(g, G.cone, '#6b4a3a', [0, 5.45, 0], [1.7, 0.9, 1.7]);
    const rotor = new Group();
    rotor.position.set(0, 4.9, 1.0);
    for (let i = 0; i < 4; i++) {
      const blade = new Group();
      blade.rotation.z = (i * Math.PI) / 2;
      P(blade, G.box, '#e8dcc0', [0, 1.6, 0], [0.4, 3, 0.06]);
      rotor.add(blade);
    }
    g.add(rotor);
    spinners.push({ obj: rotor, speed: 0.6, x });
  };
  const stoneHall = (g: Group) => {
    P(g, G.box, '#b9b0a0', [0, 0.2, 0], [6.4, 0.4, 4.4]);
    P(g, G.box, '#a59c8c', [0, 1.5, -0.3], [5.2, 2.2, 3]);
    for (let i = 0; i < 5; i++) P(g, G.cyl, '#cfc7b8', [-2.4 + i * 1.2, 1.5, 1.7], [0.36, 2.2, 0.36]);
    P(g, G.roof, '#8c5a44', [0, 3.15, 0], [6.6, 1.1, 4.6]);
  };
  const cityBlock = (g: Group) => {
    for (let i = 0; i < 3; i++) {
      const h = rand(2, 4.2);
      P(g, G.box, pick(['#b3a691', '#a3927c', '#c2b59d']), [i * 2.3 - 2.3, h / 2, rand(-0.5, 0.5)], [2.1, h, 2.6]);
      P(g, G.box, '#2a1f18', [i * 2.3 - 2.3, 0.6, 1.4], [0.5, 1.1, 0.4]);
    }
  };
  const smokestack = (g: Group, x: number, z: number, h: number, color = '#5a3a30') => {
    P(g, G.taper, color, [x, h / 2, z], [1.1, h, 1.1]);
    emit(g, 'smoke', x, h + 0.4, z);
  };
  /**
   * Brick factory, 11 m long (placements scale it down). The chimneys sit where
   * they do on the finished model so the smoke lines up after the swap.
   */
  const factory = (g: Group) => {
    const w = 11;
    P(g, G.box, '#7a4032', [0, 2, 0], [w, 4, 7]);
    for (let i = 0; i < 5; i++) {
      const x = -w / 2 + ((i + 0.5) * w) / 5;
      P(g, G.box, '#55413a', [x, 4.25, 0], [(w / 5) * 0.92, 0.6, 7], [0, 0, 0.35]);
      P(g, G.box, glowMat('#ffcf70'), [x, 2.2, 3.52], [0.7, 1, 0.05]);
    }
    smokestack(g, 5.15, -1.05, 8.5);
    smokestack(g, 5.15, 1.1, 8.5);
  };
  /** An early cannery's tins, stacked out front. */
  const tinCans = (g: Group) => {
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 4 - r; i++) P(g, G.cyl, '#c9ced6', [i * 0.5 + r * 0.25, 0.25 + r * 0.5, 0], [0.45, 0.5, 0.45]);
    P(g, G.box, '#7a5a3c', [-1.8, 0.4, 0], [1, 0.8, 0.8]);
  };
  /**
   * Seed-oil refinery: storage tanks, stacks, purple drums of oil out front,
   * and a wastewater lagoon. The documented release from solvent extraction is
   * hexane vapour to air (EPA AP-42 §9.11.1), drawn as a pale haze from the
   * vents — not coloured effluent, which the evidence does not support.
   */
  const seedOilPlant = (g: Group) => {
    P(g, G.box, '#aab0b8', [0, 2.5, 0], [9, 5, 6]);
    P(g, G.box, '#8d939c', [0, 5.3, 0], [9.4, 0.6, 6.4]);
    for (let i = 0; i < 4; i++) P(g, G.box, glowMat('#fff1b8'), [-3 + i * 2, 3.4, 3.02], [0.9, 0.5, 0.05]);
    for (let i = 0; i < 3; i++) {
      const x = 7.2 + i * 3.3;
      P(g, G.cyl, '#dfe2e6', [x, 2.75, -0.5], [3, 5.5, 3]);
      P(g, G.cyl, SEED_OIL, [x, 3.3, -0.5], [3.06, 0.9, 3.06]);
      P(g, G.ball, '#c9cdd3', [x, 5.5, -0.5], [3, 1.1, 3]);
    }
    // Stacks and vents sit where they do on the finished model.
    for (const [x, h] of [[-1.2, 11], [1.55, 8.85]] as const) smokestack(g, x, -4.45, h, '#8a8f98');
    for (const x of [-3, 0, 3]) {
      P(g, G.cyl, '#8a8f98', [x, 5.6, -1.6], [0.5, 0.9, 0.5]);
      emit(g, 'vapour', x, 6.2, -1.6);
    }
  };
  /** Purple drums of seed oil and the wastewater lagoon, out front of the refinery. */
  const oilYard = (g: Group) => {
    P(g, G.cyl, '#5d6158', [-5, 0.07, 0.6], [4.4, 0.08, 2.2]);
    for (let i = 0; i < 6; i++)
      P(g, G.cyl, SEED_OIL, [(i % 4) * 0.8 + (i > 3 ? 0.4 : 0), i > 3 ? 1.5 : 0.5, 0], [0.7, 1, 0.7]);
  };
  const car = (g: Group, x: number, z: number, color: string) => {
    P(g, G.box, color, [x, 0.45, z], [1.9, 0.5, 0.9]);
    P(g, G.box, '#1f2328', [x - 0.1, 0.85, z], [1, 0.4, 0.8]);
  };
  const placeCar = (x: number, z: number) => place(x, z, (g) => car(g, 0, 0, pick(CAR_COLORS)), { model: 'car' });
  const CAR_COLORS = ['#c0392b', '#2c6fb3', '#e6e6e6', '#3a3d44', '#d9a520'];
  /** Drive-through fast food with a glowing roadside sign. */
  const fastFood = (g: Group) => {
    P(g, G.box, '#d8362c', [0, 1.4, 0], [5, 2.8, 4]);
    P(g, G.box, '#f2c230', [0, 2.95, 0], [5.6, 0.3, 4.6]);
    P(g, G.box, glowMat('#ffe9a8'), [0, 1.5, 2.02], [3.4, 1, 0.05]);
    P(g, G.cyl, '#8a8f98', [3.8, 2.6, 2], [0.16, 5.2, 0.16]);
    P(g, G.box, glowMat('#ffc81f'), [3.8, 5.4, 2], [1.7, 1.3, 0.25]);
  };
  /** Supermarket: aisles of shelf-stable packaged food, and a car park. */
  const supermarket = (g: Group) => {
    P(g, G.box, '#dfe3e8', [0, 1.9, 0], [12, 3.8, 7]);
    P(g, G.box, '#2f6fd0', [0, 3.2, 3.52], [12, 0.9, 0.05]);
    P(g, G.box, glowMat('#bfe3ff'), [0, 1.1, 3.52], [9, 1.6, 0.05]);
    P(g, G.box, '#26272c', [0, 0.03, 6.3], [13, 0.06, 5]);
    for (let i = 0; i < 5; i++) car(g, -5 + i * 2.5, 5.4 + (i % 2) * 1.8, pick(CAR_COLORS));
  };
  const skyscraper = (g: Group, h: number) => {
    const w = rand(4, 7);
    P(g, G.box, pick(['#262b40', '#2b2f45', '#222638']), [0, h / 2, 0], [w, h, w]);
    const n = Math.floor(h / 2.2);
    for (let i = 0; i < n; i++)
      if (rng() < 0.75) P(g, G.box, glowMat('#ffd98a'), [0, 1.6 + i * 2.2, w / 2 + 0.03], [w * 0.8, 0.22, 0.03]);
  };

  // ---- Machines & energy --------------------------------------------------
  const tractor = (g: Group) => {
    P(g, G.box, '#b5332a', [0.2, 0.95, 0], [1.9, 0.7, 1]);
    P(g, G.box, '#263238', [-0.45, 1.65, 0], [0.9, 0.8, 0.9]);
    P(g, G.cyl, '#333', [0.9, 1.6, 0.3], [0.1, 0.7, 0.1]);
    for (const sz of [-0.62, 0.62]) {
      P(g, G.cyl, '#1b1b1d', [-0.5, 0.65, sz], [1.3, 0.3, 1.3], [Math.PI / 2, 0, 0]);
      P(g, G.cyl, '#1b1b1d', [0.9, 0.4, sz * 0.9], [0.8, 0.25, 0.8], [Math.PI / 2, 0, 0]);
    }
  };
  /** Tank and spray boom towed behind a tractor (its own slot, so the mist survives the model swap). */
  const sprayRig = (g: Group, boom: number) => {
    P(g, G.cyl, '#e8d44a', [-2.6, 1.0, 0], [1, 1.5, 1], [0, 0, Math.PI / 2]);
    P(g, G.box, '#b9bdc4', [-3.5, 0.95, 0], [0.08, 0.08, boom]);
    const n = Math.max(3, Math.round(boom / 1.5));
    for (let i = 0; i < n; i++) emit(g, 'spray', -3.5, 0.85, -boom / 2 + (i / (n - 1)) * boom);
  };
  const placeTractor = (x: number, z: number, boom: number) => {
    place(x, z, tractor, { model: 'tractor', reach: 8 });
    if (boom > 0) place(x, z, (g) => sprayRig(g, boom), { reach: Math.max(8, boom) });
  };
  const combine = (g: Group) => {
    P(g, G.box, '#2f7d3a', [-1, 2, 0], [6, 2.6, 3]);
    P(g, G.box, '#263238', [1.6, 3, 0], [1.4, 1.4, 2]);
    P(g, G.box, '#2f7d3a', [3.6, 0.7, 0], [1.6, 1.1, 6.8]);
    for (const sz of [-1.6, 1.6]) P(g, G.cyl, '#1b1b1d', [1, 0.9, sz], [1.8, 0.5, 1.8], [Math.PI / 2, 0, 0]);
  };
  const grainSilo = (g: Group) => {
    P(g, G.cyl, '#b9bdc4', [0, 6, 0], [6.6, 12, 6.6]);
    P(g, G.cone, '#a4a9b0', [0, 13, 0], [6.8, 2, 6.8]);
  };
  const pylon = (g: Group, wire: number) => {
    for (const sz of [-0.6, 0.6]) P(g, G.box, '#7d8590', [0, 4.5, sz * 0.7], [0.14, 9, 0.14], [sz * 0.1, 0, 0]);
    P(g, G.box, '#7d8590', [0, 7.4, 0], [0.14, 0.14, 3.4]);
    P(g, G.box, '#7d8590', [0, 8.6, 0], [0.14, 0.14, 2.2]);
    for (const z of [-1.5, 0, 1.5]) P(g, G.box, '#15161b', [wire / 2, z === 0 ? 8.5 : 7.3, z], [wire, 0.04, 0.04]);
  };
  /** Coal power station: boiler hall, stack, cooling towers, coal heap. */
  const coalPlant = (g: Group) => {
    // Stack and cooling towers sit where they do on the finished model.
    P(g, G.box, '#6d6f76', [-2.5, 2, -2.5], [8, 4, 5]);
    for (let i = 0; i < 3; i++) P(g, G.box, glowMat('#ffcf70'), [-4.9 + i * 2.4, 2.4, 0.02], [1, 1.4, 0.05]);
    smokestack(g, 2.5, -1.95, 14, '#5e5a57');
    for (const [x, z] of [[-1.3, 4], [3.9, 3.8]] as const) {
      P(g, G.taper, '#b8b4ac', [x, 2.9, z], [4.4, 5.75, 4.4]);
      emit(g, 'steam', x, 6.2, z);
    }
    P(g, G.cone, '#1c1c1f', [-6, 0.8, 3], [3, 1.6, 3]);
  };
  const windTurbine = (g: Group, x: number) => {
    P(g, G.cyl, '#eef1f4', [0, 6, 0], [0.36, 12, 0.36]);
    P(g, G.ball, '#eef1f4', [0, 12, 0.3], [0.7, 0.7, 0.9]);
    const rotor = new Group();
    rotor.position.set(0, 12, 0.6);
    for (let i = 0; i < 3; i++) {
      const blade = new Group();
      blade.rotation.z = (i * Math.PI * 2) / 3;
      P(blade, G.box, '#eef1f4', [0, 2.5, 0], [0.32, 5, 0.06]);
      rotor.add(blade);
    }
    g.add(rotor);
    spinners.push({ obj: rotor, speed: 1.3, x });
  };
  const solarArray = (g: Group) => {
    for (let i = 0; i < 4; i++) {
      P(g, G.box, '#243b7a', [i * 1.9, 0.95, 0], [1.7, 0.06, 1.2], [0.55, 0, 0]);
      P(g, G.cyl, '#8a8f98', [i * 1.9, 0.45, 0], [0.08, 0.9, 0.08]);
    }
  };

  // =========================================================================
  // Layout
  // =========================================================================
  const reserved: [number, number][] = [];
  const isReserved = (x0: number, x1 = x0) => reserved.some(([a, b]) => x1 >= a && x0 <= b);
  const reserve = (x0: number, x1: number) => reserved.push([x0, x1]);
  const NEAR = -8.5; // z of the first row of set pieces behind the road

  // ---- Hunter-gatherer camps ----------------------------------------------
  const camp = (x: number, o: { fire: boolean; fur: boolean; spears?: boolean }) => {
    reserve(x - 7, x + 7);
    // The fur (ice-age) variant has no finished model yet, so both use the hide tent.
    place(x - 4, NEAR - 2.5, (g) => hideTent(g, o.fur), { model: 'hide-tent', rotY: 0.25 });
    place(x + 4, NEAR - 3.5, (g) => hideTent(g, o.fur), { model: 'hide-tent', rotY: -0.4 });
    place(x - 1, NEAR + 2.2, dryingRack, { model: 'drying-rack' });
    if (o.spears) place(x + 2.6, NEAR + 1.6, spearRack);
    if (o.fire) {
      place(x + 1.2, NEAR + 0.3, campfire, { model: 'campfire' });
      place(x + 1.2, NEAR + 0.3, fire);
      place(x + 1.2, NEAR + 0.3, spitRoast, { model: 'spit-roast' });
    }
  };
  camp(6, { fire: true, fur: false, spears: true }); // fire was already habitual by 300k BCE
  camp(xAtYear(-250000) + 3, { fire: true, fur: false, spears: true });
  for (const y of [-200000, -150000, -100000]) camp(xAtYear(y), { fire: true, fur: false });
  for (const y of [-60000, -40000, -28000, -14000]) camp(xAtYear(y), { fire: true, fur: true, spears: true });
  // Glacial maximum: a mammoth herd beside the camp.
  {
    const x = xAtYear(-20000);
    camp(x, { fire: true, fur: true, spears: true });
    reserve(x + 7, x + 22);
    place(x + 11, NEAR - 1, mammoth, { model: 'mammoth' });
    place(x + 16, NEAR - 5, mammoth, { scale: 1.15, model: 'mammoth' });
    place(x + 19.5, NEAR + 0.5, mammoth, { scale: 0.7, model: 'mammoth' });
  }

  // ---- Farming begins ------------------------------------------------------
  const farmstead = (x: number, o: { huts: number; bake: boolean; herd: 'sheep' | 'cow' | null }) => {
    reserve(x - 10, x + 10);
    for (let i = 0; i < o.huts; i++) place(x - 7 + i * 4.2, NEAR - 3 - (i % 2) * 2.5, mudHut, { model: 'mud-hut', rotY: rand(-0.5, 0.5) });
    place(x + 4.5, NEAR + 1.2, (g) => field(g, 5, 3.2, 5, '#d2b55a', 0.5));
    place(x + 4.5, NEAR - 3, (g) => field(g, 5, 3.2, 5, '#7da348', 0.35));
    place(x - 3.5, NEAR + 2.4, sheaves, { model: 'grain-sheaves', rotY: rng() * 6 });
    place(x - 2.2, NEAR + 3.0, sheaves, { model: 'grain-sheaves', rotY: rng() * 6, scale: 0.85 });
    place(x - 1.6, NEAR + 2.9, quern, { model: 'quern', rotY: rand(-0.5, 0.5) });
    if (o.bake) {
      placeOven(x - 0.5, NEAR + 1.4);
      place(x - 6, NEAR + 2.6, pots, { model: 'ferment-jars', rotY: rng() * 6 });
    }
    if (o.herd)
      for (let i = 0; i < 3; i++) (o.herd === 'cow' ? placeCow : i === 1 ? placeGoat : placeSheep)(x + 8 + (i % 2) * 1.2, NEAR - 1 - i * 1.7);
  };
  farmstead(xAtYear(-10000) + 6, { huts: 2, bake: true, herd: null });
  farmstead(xAtYear(-8000) + 4, { huts: 3, bake: false, herd: 'sheep' });

  const village = (x: number, o: { houses: number; hall: boolean; mill: boolean; market: boolean }) => {
    reserve(x - 13, x + 13);
    for (let i = 0; i < o.houses; i++)
      place(
        x - 11 + i * 3.8,
        NEAR - 3.5 - (i % 2) * 3.5,
        (g) => house(g, 2.8, 2, 2.6, pick(['#c9b79a', '#b9a688', '#d6c8ae']), pick(['#8c5a44', '#7a6238'])),
        { model: 'village-house', rotY: rand(-0.35, 0.35) }
      );
    if (o.hall) place(x + 7, NEAR - 6, stoneHall, { model: 'stone-hall' });
    else place(x + 8, NEAR - 5, granary, { model: 'granary', rotY: rand(-0.4, 0.4) });
    if (o.mill) place(x + 11.5, NEAR - 1.5, (g) => windmill(g, x + 11.5));
    if (o.market) {
      place(x - 2, NEAR + 2.2, stall, { model: 'market-stall' });
      place(x - 4.6, NEAR + 2.4, olivePress, { model: 'olive-press' });
    }
    placeOven(x + 3, NEAR + 1.6);
    place(x - 7, NEAR + 2.6, pots, { model: 'ferment-jars', rotY: rng() * 6 });
    place(x + 7.5, NEAR + 1.8, (g) => field(g, 6, 3, 5, '#d2b55a', 0.55));
    for (let i = 0; i < 2; i++) placeCow(x - 9.6 + i * 1.6, NEAR + 1.2 - i);
    place(x - 12, NEAR + 1.4, smokehouse, { model: 'smokehouse', rotY: 0.3 });
    for (const dx of [6.15, 8.85]) place(x + dx, NEAR + 0.2, fence, { model: 'fence' });
    // Draft oxen: from about 4,000 BCE.
    if (x >= xAtYear(-4000)) place(x + 7.5, NEAR - 1.1, oxPlough, { model: 'ox-plough' });
  };
  village(xAtYear(-5000) + 4, { houses: 4, hall: false, mill: false, market: false });
  village(xAtYear(-3000), { houses: 5, hall: true, mill: false, market: false });
  // Cities & trade
  {
    const x = xAtYear(-1000) + 4;
    reserve(x - 14, x + 14);
    place(x - 8, NEAR - 6, stoneHall, { model: 'stone-hall' });
    place(x + 2, NEAR - 4, cityBlock, { model: 'city-block' });
    place(x + 10, NEAR - 6, cityBlock, { model: 'city-block' });
    place(x - 9, NEAR + 2.2, stall, { model: 'market-stall' });
    place(x - 3.5, NEAR + 2.2, stall, { model: 'market-stall' });
    place(x + 0.5, NEAR + 2.4, olivePress, { model: 'olive-press' });
    place(x + 4, NEAR + 2.6, pots, { model: 'ferment-jars', rotY: rng() * 6 });
    placeOven(x + 9, NEAR + 1.8);
  }
  village(xAtYear(1), { houses: 5, hall: true, mill: false, market: true });
  village(xAtYear(1000), { houses: 4, hall: false, mill: false, market: true });
  village(xAtYear(1250), { houses: 4, hall: false, mill: true, market: true }); // windmills: Europe from 1185
  village(xAtYear(1500) + 4, { houses: 6, hall: true, mill: true, market: true });
  {
    const x = xAtYear(1650);
    reserve(x - 9, x + 9);
    place(x - 4, NEAR - 4, barn, { model: 'barn' });
    place(x + 5, NEAR - 3, (g) => windmill(g, x + 5));
    place(x + 1.5, NEAR + 1.6, (g) => field(g, 7, 3.4, 6, '#6f9a3a', 0.9)); // maize
    for (let i = 0; i < 3; i++) placeCow(x - 7 + i * 1.5, NEAR + 1.5 + (i % 2));
  }

  // ---- Industry ------------------------------------------------------------
  const factoryAt = (x: number, w: number, cans: boolean) => {
    reserve(x - w / 2 - 3, x + w / 2 + 3);
    place(x, NEAR - 2.5, factory, { reach: 12, scale: w / 11, model: 'brick-factory' });
    if (cans) place(x + w / 2 - 2.6, NEAR + 1.8, tinCans);
  };
  factoryAt(xAtYear(1800) + 6, 8, true); // the first canneries
  factoryAt(xAtYear(1840), 9, false);
  factoryAt(xAtYear(1868), 11, true);
  {
    const x = xAtYear(1888);
    reserve(x - 9, x + 9);
    place(x, NEAR - 5.5, coalPlant, { reach: 20, model: 'coal-plant' });
  }
  const plantAt = (year: number) => {
    const x = xAtYear(year);
    reserve(x - 8, x + 9);
    place(x, NEAR - 5.5, seedOilPlant, { reach: 20, model: 'seed-oil-refinery' });
    place(x + 3, NEAR + 1.7, oilYard);
  };
  plantAt(1911); // hydrogenated cottonseed oil reaches the kitchen
  plantAt(1978);
  plantAt(2013.3);
  factoryAt(xAtYear(1930), 10, true);
  const shopAt = (year: number, kind: 'fastFood' | 'supermarket') => {
    const x = xAtYear(year);
    const hw = kind === 'fastFood' ? 5.5 : 8.5;
    reserve(x - hw, x + hw);
    if (kind === 'fastFood') {
      place(x, NEAR - 1.5, fastFood, { reach: 12, model: 'fast-food' });
      // The drive-through queue.
      placeCar(x - 2.6, NEAR + 2.3);
      placeCar(x + 2.5, NEAR + 2.3);
    } else place(x, NEAR - 3.7, supermarket, { reach: 12, model: 'supermarket' });
  };
  shopAt(1946, 'supermarket');
  shopAt(1957, 'fastFood');
  shopAt(1966, 'supermarket');
  shopAt(1992.3, 'fastFood'); // nudged clear of the 2002 supermarket
  shopAt(2002, 'supermarket');
  shopAt(2023, 'fastFood');

  // ---- Grain silos out in the monocrops, clear of the pylons and sprayers ----
  for (const y of [1897.5, 1929, 1944, 1987]) {
    const x = xAtYear(y);
    place(x, -25, grainSilo, { reach: 10, model: 'grain-silo' });
    place(x + 6.6, -26.5, grainSilo, { reach: 10, model: 'grain-silo', scale: 0.85, rotY: 1.2 });
  }

  // ---- Giant monocrops (1900 →) -------------------------------------------
  const END = WORLD_LEN + 70;
  const mono0 = xAtYear(1900);
  for (let x = mono0, i = 0; x < END; x += 24, i++) {
    const crop = Math.floor(i / 3) % 2 === 0 ? '#c9a93f' : '#6f9a3a'; // corn / soy
    place(x + 12, -39, (g) => field(g, 23.4, 44, 14, crop, 0.7), { reach: 16 });
    place(x + 12, 18, (g) => field(g, 23.4, 24, 12, crop, 0.22), { reach: 16 });
    if (!isReserved(x, x + 24)) place(x + 12, -10.5, (g) => field(g, 23.4, 11, 4, crop, 0.6), { reach: 16 });
  }
  // Sprayer rigs working the fields beside the road.
  for (const y of [1950, 1972, 1988, 2008, 2019]) {
    let x = xAtYear(y) + 3;
    while (isReserved(x - 4, x + 3)) x += 2;
    placeTractor(x, -5.8, 4.5);
    placeTractor(x + 9, -24, 12);
  }
  for (const y of [1915, 1925, 1938]) placeTractor(xAtYear(y), -22, 0);
  // Combines working the far fields: a scale cue for how big they are.
  for (const y of [1960, 1980, 1996, 2011.5]) place(xAtYear(y) + 5, -33, combine, { reach: 10, model: 'combine' });

  // ---- Power grid, skyline, renewables -------------------------------------
  for (let x = xAtYear(1890); x < END; x += 16) place(x, -19.5, (g) => pylon(g, 16), { reach: 18 });
  const sky0 = xAtYear(1925);
  for (let x = sky0; x < END; x += rand(5, 9)) {
    const growth = Math.min(1, (x - sky0) / (WORLD_LEN - sky0));
    place(x, rand(-82, -62), (g) => skyscraper(g, 6 + growth * rand(8, 30)), { reach: 10 });
  }
  for (let x = xAtYear(2004); x < END; x += 11) place(x, rand(-34, -28), (g) => windTurbine(g, x), { reach: 10 });
  for (let x = xAtYear(2010) + 3; x < END; x += 14) place(x, -16.5, solarArray, { reach: 10, scale: 1.4 });

  // ---- Backdrop mountains ---------------------------------------------------
  for (let x = -160; x < END + 140; x += rand(22, 34)) {
    const ice = iceAt(yearAtX(x));
    place(x, rand(-112, -96), (g) => mountain(g, rand(18, 36), rand(42, 64), ice > 0.25 || rng() < 0.3), { reach: 40 });
  }

  // ---- Random filler ---------------------------------------------------------
  const FARM0 = xAtYear(-9700);
  const IND0 = xAtYear(1800);
  for (let x = -55; x < END; x += 2.2) {
    const year = yearAtX(x);
    const ice = iceAt(year);
    const snowy = ice > 0.5;
    const jx = x + rand(-0.8, 0.8);
    const nearFree = !isReserved(jx - 1.5, jx + 1.5);
    const nearZ = rand(-15, -5.2);
    const farZ = rand(-48, -17);
    const frontZ = rand(4.6, 9.5);
    const r = rng();
    const r2 = rng();
    const r3 = rng();

    if (year < -9700) {
      // Pick the species up front so the placement knows which finished model to use.
      const plantTree = (z: number) => {
        const isPine = ice > 0.5 || (ice > 0.2 && rng() < 0.5);
        if (isPine) place(jx, z, (g) => pine(g, snowy), { model: 'pine', rotY: rng() * Math.PI * 2, scale: rand(0.8, 1.15) });
        else place(jx, z, acacia, { model: 'acacia', rotY: rng() * Math.PI * 2, scale: rand(0.75, 1.15) });
      };
      if (nearFree) {
        if (r < 0.28) plantTree(nearZ);
        else if (r < 0.42) {
          if (ice < 0.5) place(jx, nearZ, grass);
          else placeRock(jx, nearZ, snowy);
        } else if (r < 0.48 && ice < 0.4) place(jx, nearZ, berryBush, { model: 'berry-bush', rotY: rng() * Math.PI * 2 });
        else if (r < 0.53) {
          // Cold-steppe game through the ice age, savanna game otherwise.
          const [build, model]: [(g: Group) => void, ModelId] =
            ice > 0.5
              ? rng() < 0.55 ? [reindeer, 'reindeer'] : [mammoth, 'mammoth']
              : rng() < 0.7 ? [antelope, 'antelope'] : [bison, 'bison'];
          place(jx, nearZ - 3, build, { rotY: rng() < 0.5 ? 0 : Math.PI, model });
        }
      }
      if (r2 < 0.5) plantTree(farZ);
      else if (r2 < 0.58) placeRock(jx, farZ, snowy, rand(1.5, 3));
      else if (r2 < 0.58 + ice * 0.08) place(jx, rand(-62, -44), glacier, { reach: 12 });
      if (r3 < 0.3) {
        if (ice < 0.5 && rng() < 0.7) place(jx, frontZ, grass);
        else placeRock(jx, frontZ, snowy, rand(0.3, 0.7));
      }
    } else if (x < mono0) {
      // Farmland steadily replaces woodland; fields get larger after 1800.
      const f = Math.min(1, (x - FARM0) / (IND0 - FARM0));
      const big = x >= IND0;
      const crop = pick(['#d2b55a', '#7da348', '#c4a84f']);
      if (nearFree) {
        if (r < 0.22 * (1 - f * 0.6)) place(jx, nearZ, leafy, { model: 'broadleaf-tree', rotY: rng() * 6, scale: rand(0.6, 0.9) });
        else if (r < 0.2 + f * 0.3) place(jx, nearZ, (g) => field(g, big ? 6 : rand(3, 5), big ? 5 : rand(2.4, 3.6), big ? 7 : 4, crop, 0.45));
        else if (r < 0.26 + f * 0.3) (f >= 0.5 ? placeCow : rng() < 0.3 ? placeGoat : placeSheep)(jx, nearZ);
        else if (r < 0.3 + f * 0.32) {
          if (f < 0.25) place(jx, nearZ - 2, mudHut, { model: 'mud-hut', rotY: rand(-0.5, 0.5) });
          else place(jx, nearZ - 2, (g) => house(g, 2.6, 2, 2.4, '#c9b79a', '#8c5a44'), { model: 'village-house', rotY: rand(-0.35, 0.35) });
        }
      }
      if (r2 < 0.45 * (1 - f * 0.6)) place(jx, farZ, leafy, { model: 'broadleaf-tree', rotY: rng() * 6, scale: rand(0.6, 0.9) });
      else if (r2 < 0.3 + f * 0.45) place(jx, farZ, (g) => field(g, big ? 9 : rand(4, 7), big ? 9 : rand(3, 6), big ? 9 : 5, crop, 0.45));
      if (r3 < 0.22) place(jx, frontZ, grass);
      else if (r3 < 0.22 + f * 0.25) place(jx, frontZ + 1.5, (g) => field(g, rand(3, 5), 2.6, 5, crop, 0.18));
    } else {
      // Monocrop era: almost nothing but crop, the odd farmhouse and tree.
      if (nearFree && r < 0.03) place(jx, -17, leafy, { model: 'broadleaf-tree', rotY: rng() * 6, scale: rand(0.6, 0.9) });
      if (r2 < 0.02) place(jx, rand(-58, -46), barn, { model: 'barn', rotY: rand(-0.4, 0.4) });
    }
  }

  // Resolve emitter markers to world positions.
  group.updateMatrixWorld(true);
  const emitters: Emitter[] = markers.map((m, i) => ({
    pos: m.obj.getWorldPosition(new Vector3()),
    kind: m.kind,
    seed: (i * 0.618) % 1,
  }));

  return { group, items, emitters, flames, spinners, slots };
};
