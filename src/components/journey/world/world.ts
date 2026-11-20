import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { createKit } from './kit';
import { createFigure, outfitIndexAt } from './figure';
import { buildScenery, ROAD_HALF, WORLD_LEN, xAtYear, yearAtX } from './scenery';
import { CROPS, plantField } from './crops';
import { createModelLoader, createWalkerLoader, ModelId, snowUniform, swapIn, WALKERS } from './models';
import { progressAtYear } from '../../../utils/timeScale';
import { getDietData, getDietColor } from '../../../utils/dietUtils';
import { iceAt } from '../../../data/vitals';
import { DietComposition } from '../../../types';

// Lanes across the road, nearest the camera first. Same order as the
// streamgraph stack, so the road reads as that chart laid flat.
const LANES: (keyof DietComposition)[] = [
  'animal',
  'vegetables',
  'fruits',
  'nuts',
  'grains',
  'seedOils',
  'processedTraditional',
  'processedModern',
];

// Ground/road strip: one column per world unit around the walkers.
const COLS = 150;
const COLS_BEHIND = 55;
const VERTS_PER_COL = 4 + LANES.length * 2;
const GROUND_FAR = -180;
const GROUND_NEAR = 45;

const VIEW_BEHIND = 60; // props are shown within [x - VIEW_BEHIND, x + VIEW_AHEAD]
const VIEW_AHEAD = 95;
// Models are fetched a little before they can be seen (the widest prop reaches 40).
const LOAD_BEHIND = VIEW_BEHIND + 45;
const LOAD_AHEAD = VIEW_AHEAD + 60;

const SNOWFLAKES = 900;
const MAX_PUFFS = 320;
const STARS = 420;

type ColorKeys = [year: number, hex: string][];
const SKY: ColorKeys = [
  [-300000, '#1b2244'],
  [-115000, '#1b2244'],
  [-24000, '#243649'],
  [-9700, '#1c2c4d'],
  [1500, '#1f2a4a'],
  [1800, '#2a2836'],
  [1950, '#35282f'],
  [2025, '#3b2a2e'],
];
const GROUND: ColorKeys = [
  [-300000, '#7f8749'],
  [-9700, '#6f8a47'],
  [-5000, '#5f8a45'],
  [1800, '#688447'],
  [1900, '#77754a'],
  [2025, '#726c4c'],
];
const SNOW_GROUND = new Color('#dfe8f0');

// Colour ramps are interpolated in journey-progress space so each era's
// colour arrives when the walkers do, not thousands of world-units early.
const prepare = (keys: ColorKeys) => keys.map(([y, hex]) => ({ p: progressAtYear(y), c: new Color(hex) }));
const sampleColor = (keys: ReturnType<typeof prepare>, year: number, out: Color) => {
  const p = progressAtYear(year);
  let i = 1;
  while (i < keys.length - 1 && keys[i].p < p) i++;
  const a = keys[i - 1];
  const b = keys[i];
  const t = Math.max(0, Math.min(1, (p - a.p) / Math.max(1e-6, b.p - a.p)));
  return out.copy(a.c).lerp(b.c, t);
};

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1) * 43758.5453);

export interface World {
  /** Journey progress in [0,1]. The walkers ease toward it. */
  setProgress: (p: number) => void;
  dispose: () => void;
}

/**
 * The walkable world. Throws if WebGL is unavailable (caller falls back).
 */
export const createWorld = (canvas: HTMLCanvasElement): World => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const kit = createKit();
  const scene = new Scene();
  const skyKeys = prepare(SKY);
  const groundKeys = prepare(GROUND);
  const sky = new Color();
  scene.background = sky;
  const fog = new Fog(0x000000, 38, 175);
  scene.fog = fog;

  const camera = new PerspectiveCamera(40, 1, 0.5, 420);
  const hemi = new HemisphereLight('#c3d0ff', '#4a3f30', 1.15);
  const sun = new DirectionalLight('#ffdcb0', 1.9);
  // The sun casts shadows inside a box that travels with the walkers.
  const SUN_DIR = [-0.5, 1, 0.8] as const;
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(window.innerWidth < 700 ? 1024 : 2048);
  sun.shadow.camera.left = -55;
  sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06;
  scene.add(hemi, sun, sun.target);

  // ---- Ground + diet road ---------------------------------------------------
  const gPos = new Float32Array(COLS * VERTS_PER_COL * 3);
  const gCol = new Float32Array(COLS * VERTS_PER_COL * 3);
  const gNor = new Float32Array(COLS * VERTS_PER_COL * 3);
  for (let i = 1; i < gNor.length; i += 3) gNor[i] = 1;
  const quadsPerCol = 2 + LANES.length;
  const gIdx = new Uint32Array((COLS - 1) * quadsPerCol * 6);
  {
    let k = 0;
    for (let c = 0; c < COLS - 1; c++) {
      for (let q = 0; q < quadsPerCol; q++) {
        // Each quad's two verts per column are ordered (far, near).
        const a = c * VERTS_PER_COL + q * 2;
        const b = a + 1;
        const a2 = a + VERTS_PER_COL;
        const b2 = b + VERTS_PER_COL;
        gIdx[k++] = a;
        gIdx[k++] = b;
        gIdx[k++] = b2;
        gIdx[k++] = a;
        gIdx[k++] = b2;
        gIdx[k++] = a2;
      }
    }
  }
  const laneColors = LANES.map((cat) => new Color(getDietColor(cat)));
  const groundGeo = new BufferGeometry();
  const gPosAttr = new BufferAttribute(gPos, 3).setUsage(DynamicDrawUsage);
  const gColAttr = new BufferAttribute(gCol, 3).setUsage(DynamicDrawUsage);
  groundGeo.setAttribute('position', gPosAttr);
  groundGeo.setAttribute('color', gColAttr);
  groundGeo.setAttribute('normal', new BufferAttribute(gNor, 3));
  groundGeo.setIndex(new BufferAttribute(gIdx, 1));
  const groundMat = new MeshLambertMaterial({ vertexColors: true });
  const ground = new Mesh(groundGeo, groundMat);
  ground.frustumCulled = false;
  ground.receiveShadow = true;
  scene.add(ground);

  const tmpColor = new Color();
  let builtCol0 = NaN;
  const rebuildGround = (col0: number) => {
    builtCol0 = col0;
    for (let c = 0; c < COLS; c++) {
      const x = col0 + c;
      const year = yearAtX(x);
      sampleColor(groundKeys, year, tmpColor).lerp(SNOW_GROUND, Math.min(1, iceAt(year) * 1.15));
      let o = c * VERTS_PER_COL * 3;
      const put = (y: number, z: number, col: Color) => {
        gPos[o] = x;
        gPos[o + 1] = y;
        gPos[o + 2] = z;
        gCol[o] = col.r;
        gCol[o + 1] = col.g;
        gCol[o + 2] = col.b;
        o += 3;
      };
      // far ground
      put(0, GROUND_FAR, tmpColor);
      put(0, -ROAD_HALF, tmpColor);
      // lanes (animal nearest the camera), each as (far edge, near edge)
      const comp = getDietData(year);
      let sum = 0;
      for (const cat of LANES) sum += comp[cat];
      let below = 0;
      for (let i = 0; i < LANES.length; i++) {
        const top = below + comp[LANES[i]] / (sum || 1);
        put(0.05, ROAD_HALF - 2 * ROAD_HALF * top, laneColors[i]);
        put(0.05, ROAD_HALF - 2 * ROAD_HALF * below, laneColors[i]);
        below = top;
      }
      // near ground
      put(0, ROAD_HALF, tmpColor);
      put(0, GROUND_NEAR, tmpColor);
    }
    gPosAttr.needsUpdate = true;
    gColAttr.needsUpdate = true;
  };

  // ---- Scenery ----------------------------------------------------------------
  const scenery = buildScenery(kit);
  scene.add(scenery.group);

  // Finished models replace their low-poly placeholders. Each is fetched only
  // when the walk comes within reach of somewhere it is used, so the page opens
  // on a few megabytes instead of the whole 300,000 years.
  let disposed = false;
  const planted: InstancedMesh[] = [];
  const unplanted = new Set(scenery.crops.map((_, i) => i));
  const slotsById = new Map<ModelId, Group[]>();
  /** Where along the road each model is used. */
  const uses = new Map<ModelId, number[]>();
  const use = (id: ModelId, x: number) => {
    const xs = uses.get(id);
    if (xs) xs.push(x);
    else uses.set(id, [x]);
  };
  for (const slot of scenery.slots) {
    use(slot.id, slot.obj.position.x);
    const list = slotsById.get(slot.id);
    if (list) list.push(slot.obj);
    else slotsById.set(slot.id, [slot.obj]);
  }
  for (const field of scenery.crops) {
    use(CROPS[field.kind].model, field.obj.position.x);
    use(CROPS[field.kind].far, field.obj.position.x);
  }
  for (let x = xAtYear(1945); x < WORLD_LEN + 50; x += 50) use('crop-duster', x);
  for (let x = xAtYear(1800); x < WORLD_LEN + 50; x += 50) use('hat', x);
  for (let x = xAtYear(1955); x < WORLD_LEN + 50; x += 50) use('soda-cup', x);
  const CARRIED = { spear: 'spear', hoe: 'hoe', 'soda-cup': 'cup', hat: 'hat' } as const;

  const loader = createModelLoader((id, model) => {
    for (const slot of slotsById.get(id) ?? []) swapIn(slot, model);
    if (id === 'crop-duster') swapIn(plane, model);
    if (id in CARRIED) for (const f of family) f.fig.equip({ [CARRIED[id as keyof typeof CARRIED]]: model });
    for (const i of unplanted) {
      const spec = CROPS[scenery.crops[i].kind];
      if (!loader.models[spec.model] || !loader.models[spec.far]) continue;
      planted.push(...plantField(scenery.crops[i], loader.models, i));
      unplanted.delete(i);
    }
    dirty = true;
  });
  // The spear and hoe are tiny and carried from the first step; the hat and cup
  // come with the stretch of road where they first appear.
  for (const id of ['spear', 'hoe'] as ModelId[]) loader.request(id);

  // ---- Walkers ------------------------------------------------------------------
  const family = [
    { fig: createFigure(kit, { scale: 1, hair: '#2a1d14', tint: 1, weightGain: 1, phase: 0, carries: true }), dx: 0, z: 0.5 },
    { fig: createFigure(kit, { scale: 0.93, hair: '#3a2416', tint: 1.18, weightGain: 0.9, phase: 2.1, carries: false }), dx: -1.35, z: -0.9 },
    { fig: createFigure(kit, { scale: 0.62, hair: '#2a1d14', tint: 0.85, weightGain: 0.7, phase: 4.0, carries: false }), dx: -0.55, z: 1.55 },
  ];
  family.forEach((f) => scene.add(f.fig.root));
  // The rigged walkers arrive one outfit at a time and replace the drawn figures.
  const requestOutfit = createWalkerLoader((who, outfit, rig, walk) => {
    if (disposed) return;
    family[WALKERS.indexOf(who)].fig.setRig(outfit, rig, walk);
    dirty = true;
  });

  // ---- Stars (fade with industrial haze) -----------------------------------------
  const starPos = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    const a = hash(i + 1) * Math.PI * 2;
    const e = 0.08 + hash(i + 500) * 1.2;
    starPos[i * 3] = Math.cos(a) * Math.cos(e) * 300;
    starPos[i * 3 + 1] = Math.sin(e) * 300;
    starPos[i * 3 + 2] = -Math.abs(Math.sin(a) * Math.cos(e)) * 300;
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3));
  const starMat = new PointsMaterial({
    color: 0xffffff,
    size: 1.6,
    sizeAttenuation: false,
    transparent: true,
    fog: false,
    depthWrite: false,
  });
  const stars = new Points(starGeo, starMat);
  stars.frustumCulled = false;
  scene.add(stars);

  // ---- Snow ---------------------------------------------------------------------
  const snowPos = new Float32Array(SNOWFLAKES * 3);
  const snowGeo = new BufferGeometry();
  const snowAttr = new BufferAttribute(snowPos, 3).setUsage(DynamicDrawUsage);
  snowGeo.setAttribute('position', snowAttr);
  const snowMat = new PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const snow = new Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  scene.add(snow);

  // ---- Smoke / steam / spray / vapour puffs --------------------------------------
  const puffMat = new MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false });
  const puffs = new InstancedMesh(kit.geo.ball, puffMat, MAX_PUFFS);
  puffs.frustumCulled = false;
  scene.add(puffs);
  const PUFF_COLORS = {
    smoke: new Color('#5f5d66'),
    steam: new Color('#c9ced6'),
    spray: new Color('#d6e86a'),
    vapour: new Color('#b9c0b0'),
  };
  const m4 = new Matrix4();
  const v3 = new Vector3();
  const s3 = new Vector3();
  const q0 = new Quaternion();

  // ---- Crop duster -------------------------------------------------------------------
  const plane = new Group();
  kit.part(plane, kit.geo.box, '#e3c53a', [0, 0, 0], [3.2, 0.6, 0.6]);
  kit.part(plane, kit.geo.box, '#e3c53a', [-0.4, 0.15, 0], [0.9, 0.1, 5.6]);
  kit.part(plane, kit.geo.box, '#c9483b', [1.5, 0.45, 0], [0.5, 0.8, 0.08]);
  kit.part(plane, kit.geo.box, '#c9483b', [1.5, 0.1, 0], [0.5, 0.08, 1.6]);
  kit.part(plane, kit.geo.box, '#222', [-1.65, 0, 0], [0.06, 1.3, 0.12]);
  scene.add(plane);

  // ---- Frame state ------------------------------------------------------------------
  let width = 0;
  let height = 0;
  let target = 0;
  let shown = 0;
  let dirty = true;
  let last = 0;
  let clock = 0;
  let raf = 0;
  let first = true;

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    dirty = true;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /** Ask for whatever is used near the walker and has not been fetched yet. */
  let loadCell = NaN;
  const loadNearby = (wx: number, year: number) => {
    const cell = Math.floor(wx / 5);
    if (cell === loadCell) return;
    loadCell = cell;
    const due: { id: ModelId; gap: number }[] = [];
    for (const [id, xs] of uses) {
      let gap = Infinity;
      for (const x of xs) if (x > wx - LOAD_BEHIND && x < wx + LOAD_AHEAD) gap = Math.min(gap, Math.abs(x - wx));
      if (gap === Infinity) continue;
      due.push({ id, gap });
      uses.delete(id);
    }
    // Nearest first, so what is on screen fills in before what is still ahead.
    due.sort((a, b) => a.gap - b.gap).forEach((d) => loader.request(d.id));
    // The outfit worn now, and the next one so the change of clothes is ready.
    const outfit = outfitIndexAt(year);
    requestOutfit(outfit);
    requestOutfit(outfit + 1);
  };

  const update = (time: number) => {
    const wx = shown * WORLD_LEN;
    const year = yearAtX(wx);
    loadNearby(wx, year);
    const ice = iceAt(year);

    // Camera: side-on tracking shot, looking a little ahead down the road.
    const portrait = camera.aspect < 0.8;
    if (portrait) {
      camera.fov = 50;
      camera.position.set(wx - 4, 11.5, 27);
      camera.lookAt(wx + 1.5, -1.2, -3);
    } else {
      camera.fov = 44;
      camera.position.set(wx - 10, 10.5, 18.5);
      camera.lookAt(wx - 2, 1.2, -6);
    }
    camera.updateProjectionMatrix();

    // Sky, fog and light follow the era and the weather.
    sampleColor(skyKeys, year, sky);
    fog.color.copy(sky);
    hemi.intensity = 1.15 + ice * 0.35;
    sun.color.set('#ffdcb0').lerp(tmpColor.set('#cfe0ff'), ice);
    const haze = Math.max(0, Math.min(1, (year - 1850) / 150));
    starMat.opacity = 0.85 * (1 - haze * 0.85) * (1 - ice * 0.5);
    stars.position.copy(camera.position);
    sun.target.position.set(wx + 12, 0, -14);
    sun.position.set(wx + 12 + SUN_DIR[0] * 90, SUN_DIR[1] * 90, -14 + SUN_DIR[2] * 90);
    snowUniform.value = Math.min(1, ice * 1.2);

    const col0 = Math.floor(wx) - COLS_BEHIND;
    if (col0 !== builtCol0) rebuildGround(col0);

    for (const it of scenery.items) {
      it.obj.visible = it.x + it.reach > wx - VIEW_BEHIND && it.x - it.reach < wx + VIEW_AHEAD;
    }

    for (const f of family) {
      f.fig.root.position.set(wx + f.dx, 0, f.z);
      f.fig.update(year, wx + f.dx);
    }

    // Idle animation.
    scenery.flames.forEach((flame, i) => {
      const s = 1 + 0.18 * Math.sin(time * 9 + i * 1.7) + 0.1 * Math.sin(time * 15.3 + i);
      flame.scale.y = (i % 2 === 0 ? 1.2 : 0.75) * s;
    });
    for (const sp of scenery.spinners) {
      if (Math.abs(sp.x - wx) < VIEW_AHEAD) sp.obj.rotation.z = -time * sp.speed;
    }

    // Snowfall, wrapped in a box around the walkers.
    snowMat.opacity = Math.min(0.95, ice * 1.1);
    snow.visible = ice > 0.02;
    if (snow.visible) {
      for (let i = 0; i < SNOWFLAKES; i++) {
        const fall = 1.4 + hash(i) * 1.6;
        snowPos[i * 3] = wx - 35 + fract(hash(i + 11) + time * 0.012 + Math.sin(time * 0.5 + i) * 0.004) * 90;
        snowPos[i * 3 + 1] = 20 - fract(hash(i + 23) + (time * fall) / 20) * 20;
        snowPos[i * 3 + 2] = -45 + hash(i + 37) * 62;
      }
      snowAttr.needsUpdate = true;
    }

    // Crop duster makes passes over the fields from the late 1940s.
    plane.visible = year > 1945;
    const px = wx + 85 - ((time * 11) % 170);
    plane.position.set(px, 7 + Math.sin(time * 0.8) * 0.6, -27);

    // Puffs.
    let n = 0;
    const addPuff = (x: number, y: number, z: number, s: number, c: Color) => {
      if (n >= MAX_PUFFS || s <= 0) return;
      m4.compose(v3.set(x, y, z), q0, s3.setScalar(s));
      puffs.setMatrixAt(n, m4);
      puffs.setColorAt(n, c);
      n++;
    };
    for (const e of scenery.emitters) {
      if (e.pos.x < wx - VIEW_BEHIND || e.pos.x > wx + VIEW_AHEAD) continue;
      if (e.kind === 'smoke' || e.kind === 'steam') {
        const big = e.kind === 'steam' ? 1.9 : e.pos.y > 4 ? 1 : 0.4;
        for (let i = 0; i < 5; i++) {
          const t = fract(time * 0.16 + i / 5 + e.seed);
          addPuff(
            e.pos.x + t * 3.2 * big + Math.sin(t * 6 + i) * 0.3,
            e.pos.y + t * 7 * big,
            e.pos.z,
            (0.7 + t * 2.4) * big * (1 - t * t * t),
            PUFF_COLORS[e.kind]
          );
        }
      } else if (e.kind === 'spray') {
        for (let i = 0; i < 3; i++) {
          const t = fract(time * 0.9 + i / 3 + e.seed);
          addPuff(e.pos.x - t * 0.7, e.pos.y - t * 0.6, e.pos.z + (hash(i + e.seed * 99) - 0.5) * t, 0.2 + t * 0.35, PUFF_COLORS.spray);
        }
      } else {
        // Solvent vapour: a thin haze drifting off the vents.
        for (let i = 0; i < 4; i++) {
          const t = fract(time * 0.12 + i / 4 + e.seed);
          addPuff(e.pos.x + t * 5, e.pos.y + t * 2.2, e.pos.z + Math.sin(t * 5 + i) * 0.5, (0.5 + t * 2) * (1 - t), PUFF_COLORS.vapour);
        }
      }
    }
    if (plane.visible) {
      for (let i = 0; i < 14; i++) {
        const t = fract(time * 0.5 + i / 14);
        addPuff(px + 1.5 + t * 16, plane.position.y - 0.4 - t * 3.2, -27 + (hash(i) - 0.5) * 4 * t, 0.4 + t * 1.3, PUFF_COLORS.spray);
      }
    }
    puffs.count = n;
    puffs.instanceMatrix.needsUpdate = true;
    if (puffs.instanceColor) puffs.instanceColor.needsUpdate = true;
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, last ? (now - last) / 1000 : 0);
    last = now;
    if (!reduceMotion) clock += dt;

    // Ease toward the scroll position so wheel "steps" become a smooth walk.
    const d = target - shown;
    if (first || reduceMotion) shown = target;
    else if (Math.abs(d) > 1e-6) shown += d * (1 - Math.exp(-dt * 9));
    const moving = Math.abs(d) > 1e-6;
    first = false;

    if (width === 0 || height === 0) return;
    if (reduceMotion && !moving && !dirty) return;
    dirty = false;
    update(clock);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    setProgress: (p: number) => {
      target = Math.max(0, Math.min(1, p));
      dirty = true;
    },
    dispose: () => {
      disposed = true;
      planted.forEach((p) => p.dispose());
      loader.dispose();
      cancelAnimationFrame(raf);
      ro.disconnect();
      family.forEach((f) => f.fig.dispose());
      groundGeo.dispose();
      groundMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      snowGeo.dispose();
      snowMat.dispose();
      puffMat.dispose();
      puffs.dispose();
      kit.dispose();
      renderer.dispose();
    },
  };
};
