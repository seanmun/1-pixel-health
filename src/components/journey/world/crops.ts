import { Color, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Object3D, Quaternion, Vector3 } from 'three';
import { mulberry32 } from './kit';
import type { ModelId } from './models';

/** What grows in a field. `corn` is the maize model ripened to gold. */
export type CropKind = 'wheat' | 'greens' | 'maize' | 'corn' | 'soy';

/** A field waiting to be planted once the crop-row models have loaded. */
export interface CropField {
  obj: Group;
  /** The drawn stand-in rows, removed when the real plants go in. */
  rows: Mesh;
  kind: CropKind;
  len: number;
  depth: number;
  /** Low fields sit between the camera and the road, so they stay short. */
  low: boolean;
}

/** Stand-in colour, the crop-row model (built at real height), and the row spacing in metres. */
export const CROPS: Record<CropKind, { color: string; model: ModelId; far: ModelId; spacing: number; tint?: string }> = {
  wheat: { color: '#d2b55a', model: 'wheat-row', far: 'wheat-row-far', spacing: 0.5 },
  greens: { color: '#7da348', model: 'greens-row', far: 'greens-row-far', spacing: 0.75 },
  maize: { color: '#6f9a3a', model: 'maize-row', far: 'maize-row-far', spacing: 0.9 },
  corn: { color: '#c9a93f', model: 'maize-row', far: 'maize-row-far', spacing: 0.9, tint: '#f0cf7a' },
  soy: { color: '#6f9a3a', model: 'soy-row', far: 'soy-row-far', spacing: 0.75 },
};

/**
 * Only rows this close to the road (world z) are real plants. Further off the
 * same row is a few flat picture cards (tools/blender/cards.py): 12 triangles
 * instead of thousands, which is what lets a 44 m deep field be planted at all.
 */
const NEAR_BACK = -9.5;
const NEAR_FRONT = 8.5;
/** Nothing is planted nearer the camera than this: it is below the frame. */
const FRONT_LIMIT = 24;

const firstMesh = (root: Object3D): Mesh | null => {
  let found: Mesh | null = null;
  root.traverse((o) => {
    if (!found && (o as Mesh).isMesh) found = o as Mesh;
  });
  return found;
};

/**
 * Replaces a field's drawn rows with real plants: one model of a short crop
 * row, repeated end to end along every furrow. Returns the meshes it added.
 */
export const plantField = (
  field: CropField,
  models: Partial<Record<ModelId, Object3D>>,
  seed: number
): InstancedMesh[] => {
  const spec = CROPS[field.kind];
  const nearRoot = models[spec.model];
  if (!nearRoot) return [];
  const farRoot = models[spec.far];
  if (!farRoot) return [];
  const rng = mulberry32(seed * 7919 + 13);
  const tint = new Color(spec.tint ?? '#ffffff');

  const lods = [nearRoot, farRoot].map((root, i) => {
    const mesh = firstMesh(root)!;
    root.updateMatrixWorld(true);
    mesh.geometry.computeBoundingBox();
    const size = mesh.geometry.boundingBox!.getSize(new Vector3()).applyMatrix4(new Matrix4().extractRotation(mesh.matrixWorld));
    if (i === 1) {
      // The cards are cut out by their picture's transparency.
      const mat = mesh.material as MeshStandardMaterial;
      mat.alphaTest = 0.5;
      mat.transparent = false;
      mat.depthWrite = true;
      mat.side = DoubleSide;
    }
    return { mesh, base: mesh.matrixWorld.clone(), pieceLen: Math.abs(size.x), mats: [] as Matrix4[], cols: [] as Color[] };
  });

  const z0 = field.obj.position.z;
  const scale = field.low ? 0.55 : 1;
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  const m = new Matrix4();

  for (let z = -field.depth / 2 + spec.spacing / 2; z < field.depth / 2; z += spec.spacing) {
    const worldZ = z0 + z;
    const lod = worldZ > NEAR_BACK && worldZ < NEAR_FRONT ? lods[0] : lods[1];
    if (worldZ < FRONT_LIMIT) {
      const wide = 0.9 + rng() * 0.2;
      const long = scale * wide;
      const piece = lod.pieceLen * long * 0.92; // slight overlap hides the joins
      const n = Math.max(1, Math.round(field.len / piece));
      const start = -field.len / 2 + (field.len - n * piece) / 2 + piece / 2;
      for (let i = 0; i < n; i++) {
        const s = 0.85 + rng() * 0.3;
        q.setFromAxisAngle(up, (rng() < 0.5 ? 0 : Math.PI) + (rng() - 0.5) * 0.08);
        m.compose(
          new Vector3(start + i * piece + (rng() - 0.5) * 0.1, 0.06, z + (rng() - 0.5) * 0.08),
          q,
          new Vector3(long, scale * s, scale * wide)
        );
        lod.mats.push(m.clone().multiply(lod.base));
        const shade = 1.1 + rng() * 0.4; // lifted: the models photograph darker than the sunlit ground
        lod.cols.push(tint.clone().multiplyScalar(shade));
      }
    }
  }

  const out: InstancedMesh[] = [];
  for (const lod of lods) {
    if (!lod.mats.length) continue;
    const inst = new InstancedMesh(lod.mesh.geometry, lod.mesh.material, lod.mats.length);
    lod.mats.forEach((mat, i) => {
      inst.setMatrixAt(i, mat);
      inst.setColorAt(i, lod.cols[i]);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.receiveShadow = true;
    // Shadows from thousands of plants cost more than they show; only small plots cast them.
    inst.castShadow = lod.mats.length < 120;
    field.obj.add(inst);
    out.push(inst);
  }
  if (out.length) field.obj.remove(field.rows);
  return out;
};
