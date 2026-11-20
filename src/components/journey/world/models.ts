import { AnimationClip, Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Finished models, delivered as public/models/<id>.glb (see the Objects tab
 * and src/data/objects.ts). Each is built in real-world metres, origin on the
 * ground at the centre of its footprint, facing +X. Until a model loads — or
 * if it is missing — the procedural low-poly placeholder stays in the scene.
 */
export const MODEL_IDS = [
  'mammoth',
  'hide-tent',
  'acacia',
  'antelope',
  'reindeer',
  'bison',
  'pine',
  'berry-bush',
  'rock',
  'campfire',
  'spit-roast',
  'drying-rack',
  'mud-hut',
  'clay-oven',
  'ferment-jars',
  'grain-sheaves',
  'quern',
  'sheep',
  'goat',
  'cow',
  'broadleaf-tree',
  'village-house',
  'granary',
  'stone-hall',
  'city-block',
  'market-stall',
  'olive-press',
  'ox-plough',
  'smokehouse',
  'fence',
  'barn',
  'brick-factory',
  'seed-oil-refinery',
  'coal-plant',
  'grain-silo',
  'tractor',
  'combine',
  'car',
  'fast-food',
  'supermarket',
  'windmill',
  'wind-turbine',
  'sprayer-rig',
  'solar-array',
  'skyscraper',
  'crop-duster',
  'oil-drum',
  'watermill',
  'mountain',
  'glacier',
  'grass-tuft',
  'spear-rack',
  'tin-cans',
  'spear',
  'hoe',
  'soda-cup',
  'hat',
  'pylon',
  'wheat-row',
  'greens-row',
  'maize-row',
  'soy-row',
  'wheat-row-far',
  'greens-row-far',
  'maize-row-far',
  'soy-row-far',
] as const;
export type ModelId = (typeof MODEL_IDS)[number];

/** Shared uniform: how much snow lies on upward-facing surfaces, 0..1. */
export const snowUniform = { value: 0 };

/**
 * Adds snow cover to a PBR material: surfaces facing the sky blend toward
 * white as `snowUniform` rises, so models pick up the ice-age weather.
 */
const addSnow = (material: MeshStandardMaterial) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSnow = snowUniform;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uSnow;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
          float cover = smoothstep( 0.55, 0.9, worldNormal.y ) * uSnow;
          diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.9, 0.93, 0.97 ), cover );
        }`
      );
  };
  material.customProgramCacheKey = () => 'snow';
};

export const prepare = (root: Object3D) => {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const std = m as MeshStandardMaterial;
      if (!std.isMeshStandardMaterial) continue;
      // The scene has no environment map, so metal would render black; none of
      // these organic or matte objects are metallic anyway.
      std.metalnessMap = null;
      std.metalness = 0;
      addSnow(std);
    }
  });
  return root;
};

/**
 * The models' mesh data is Draco-compressed (tools/blender/compress.py); the
 * decoder lives in public/draco and is fetched once, with the first model.
 */
let draco: DRACOLoader | null = null;
const newLoader = () => {
  draco ??= new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  return new GLTFLoader().setDRACOLoader(draco);
};

/**
 * Address of a model file. The `v` is a fingerprint of the file's contents
 * (worked out at build time in vite.config.ts), so the server can tell browsers
 * to keep each model for a year and a changed model still arrives at once.
 */
const modelUrl = (path: string) => {
  const v = __MODEL_HASHES__[path];
  return `${import.meta.env.BASE_URL}models/${path}${v ? `?v=${v}` : ''}`;
};

/**
 * Fetches finished models on demand, as the walk reaches the stretch of
 * road that uses them. `request` is safe to call repeatedly; a missing or
 * broken file is skipped so its placeholder simply stays.
 */
export const createModelLoader = (onLoad: (id: ModelId, model: Object3D) => void) => {
  const loader = newLoader();
  const asked = new Set<ModelId>();
  const models: Partial<Record<ModelId, Object3D>> = {};
  let stopped = false;
  // A few at a time, in the order asked, so what is nearest arrives first
  // instead of everything sharing the connection.
  const queue: ModelId[] = [];
  let busy = 0;
  const next = () => {
    if (stopped || busy >= 4) return;
    const id = queue.shift();
    if (!id) return;
    busy++;
    loader
      .loadAsync(modelUrl(`${id}.glb`))
      .then((gltf) => {
        const model = prepare(gltf.scene);
        if (stopped) return disposeModels({ [id]: model });
        models[id] = model;
        onLoad(id, model);
      })
      .catch(() => {
        /* keep the placeholder */
      })
      .finally(() => {
        busy--;
        next();
      });
    next();
  };
  const request = (id: ModelId) => {
    if (asked.has(id)) return;
    asked.add(id);
    queue.push(id);
    next();
  };
  const dispose = () => {
    stopped = true;
    disposeModels(models);
  };
  return { request, models, dispose };
};

/** The three walkers, each with one rigged, walking model per era outfit. */
export const WALKERS = ['man', 'woman', 'child'] as const;
export type WalkerId = (typeof WALKERS)[number];
export const OUTFIT_COUNT = 6;

/**
 * Fetches the rigged walkers (public/models/walkers/<who>-<outfit>.glb) one
 * outfit at a time: `request(outfit)` brings in all three walkers dressed for
 * that era, handing each to `onLoad` as it arrives.
 */
export const createWalkerLoader = (
  onLoad: (who: WalkerId, outfit: number, rig: Object3D, walk: AnimationClip) => void
) => {
  const loader = newLoader();
  const asked = new Set<number>();
  return (outfit: number) => {
    if (outfit < 0 || outfit >= OUTFIT_COUNT || asked.has(outfit)) return;
    asked.add(outfit);
    for (const who of WALKERS)
      loader
        .loadAsync(modelUrl(`walkers/${who}-${outfit + 1}.glb`))
        .then((gltf) => {
          if (gltf.animations[0]) onLoad(who, outfit, prepare(gltf.scene), gltf.animations[0]);
        })
        .catch(() => {
          /* keep the drawn figure */
        });
  };
};

/** Swap a placeholder group's contents for a clone of the finished model. */
export const swapIn = (slot: Group, model: Object3D) => {
  slot.clear();
  slot.add(model.clone());
};

/** Free GPU resources held by loaded models. */
export const disposeModels = (models: Partial<Record<ModelId, Object3D>>) => {
  for (const root of Object.values(models)) {
    root?.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as MeshStandardMaterial;
        std.map?.dispose();
        std.normalMap?.dispose();
        std.roughnessMap?.dispose();
        std.dispose();
      }
    });
  }
};
