import { Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
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

const prepare = (root: Object3D) => {
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
 * Loads every finished model. Resolves to whichever ones exist; a missing or
 * broken file is skipped so its placeholder simply stays.
 */
export const loadModels = async (): Promise<Partial<Record<ModelId, Object3D>>> => {
  const loader = new GLTFLoader();
  const out: Partial<Record<ModelId, Object3D>> = {};
  await Promise.all(
    MODEL_IDS.map(async (id) => {
      try {
        const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${id}.glb`);
        out[id] = prepare(gltf.scene);
      } catch {
        /* keep the placeholder */
      }
    })
  );
  return out;
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
