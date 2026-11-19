import {
  AnimationClip,
  AnimationMixer,
  Bone,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import { Kit } from './kit';
import { vitalsAt } from '../../../data/vitals';

// What people wore and carried, by era. Colours blend between keyframes.
interface Outfit {
  year: number;
  top: string; // torso
  arms: string;
  legs: string;
  feet: string;
  item: 'spear' | 'hoe' | 'none' | 'cup';
  hat: boolean;
}

const SKIN = '#a8744f';
const OUTFITS: Outfit[] = [
  // Hides, bare limbs, a hunting spear.
  { year: -300000, top: '#7a5a3c', arms: SKIN, legs: SKIN, feet: SKIN, item: 'spear', hat: false },
  // Ice age: sewn furs head to toe.
  { year: -45000, top: '#8f7a60', arms: '#8f7a60', legs: '#6b5642', feet: '#4d3d2f', item: 'spear', hat: false },
  // First farmers: woven tunic, sandals, a hoe.
  { year: -9000, top: '#cdbb8e', arms: SKIN, legs: SKIN, feet: '#6b4a2e', item: 'hoe', hat: false },
  // Dyed wool and trousers.
  { year: -500, top: '#8c4a3a', arms: '#8c4a3a', legs: '#5b4a3a', feet: '#3b2c20', item: 'hoe', hat: false },
  // Industrial age: dark coat and hat.
  { year: 1800, top: '#30343f', arms: '#30343f', legs: '#26262c', feet: '#141416', item: 'none', hat: true },
  // T-shirt, jeans, sneakers — and a soda.
  { year: 1955, top: '#3d7fc4', arms: SKIN, legs: '#34507a', feet: '#f0f0f0', item: 'cup', hat: false },
];
// Each outfit fades in over this many years before its keyframe.
const BLEND: Record<number, number> = { [-45000]: 25000, [-9000]: 1500, [-500]: 600, 1800: 60, 1955: 15 };

const tmp = new Vector3();
const cA = new Color();
const cB = new Color();

interface FigureOptions {
  /** Size relative to the average adult man (1 = man). */
  scale: number;
  hair: string;
  /** Multiplies outfit top colour so the family doesn't match exactly. */
  tint: number;
  /** How strongly modern weight gain shows (children less so). */
  weightGain: number;
  phase: number;
  carries: boolean;
}

/**
 * A procedural low-poly walker. Faces +x. Height and girth follow vitalsAt();
 * the walk cycle is driven by distance travelled, so they only walk when the
 * world scrolls.
 */
export const createFigure = (kit: Kit, opts: FigureOptions) => {
  const { geo, part } = kit;
  const root = new Group();
  const body = new Group();
  root.add(body);

  // Per-figure materials (their colours animate with the era).
  const topMat = new MeshLambertMaterial({ flatShading: true });
  const armMat = new MeshLambertMaterial({ flatShading: true });
  const legMat = new MeshLambertMaterial({ flatShading: true });
  const footMat = new MeshLambertMaterial({ flatShading: true });
  const shadowMat = new MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const shadowGeo = new CircleGeometry(0.5, 16);
  const shadow = new Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  root.add(shadow);

  const torso = part(body, geo.box, topMat, [0, 1.22, 0], [0.26, 0.62, 0.42]);
  const belly = part(body, geo.ball, topMat, [0.1, 1.08, 0], [0.3, 0.36, 0.4]);
  part(body, geo.ball, SKIN, [0.02, 1.7, 0], [0.25, 0.28, 0.25]);
  part(body, geo.ball, opts.hair, [-0.035, 1.75, 0], [0.27, 0.25, 0.28]);
  const hat = new Group();
  hat.position.set(0.02, 1.86, 0);
  part(hat, geo.cyl, '#1c1c20', [0, 0, 0], [0.42, 0.03, 0.42]);
  part(hat, geo.cyl, '#1c1c20', [0, 0.09, 0], [0.26, 0.17, 0.26]);
  body.add(hat);

  const makeLeg = (z: number) => {
    const hip = new Group();
    hip.position.set(0, 0.92, z);
    const thigh = part(hip, geo.box, legMat, [0, -0.225, 0], [0.15, 0.45, 0.15]);
    const knee = new Group();
    knee.position.set(0, -0.45, 0);
    hip.add(knee);
    const shin = part(knee, geo.box, legMat, [0, -0.225, 0], [0.13, 0.45, 0.13]);
    part(knee, geo.box, footMat, [0.05, -0.47, 0], [0.25, 0.07, 0.13]);
    body.add(hip);
    return { hip, knee, thigh, shin };
  };
  const makeArm = (z: number) => {
    const shoulder = new Group();
    shoulder.position.set(0, 1.47, z);
    const upper = part(shoulder, geo.box, armMat, [0, -0.15, 0], [0.11, 0.3, 0.11]);
    const elbow = new Group();
    elbow.position.set(0, -0.3, 0);
    shoulder.add(elbow);
    part(elbow, geo.box, SKIN, [0, -0.14, 0], [0.1, 0.28, 0.1]);
    const hand = new Group();
    hand.position.set(0, -0.3, 0);
    elbow.add(hand);
    body.add(shoulder);
    return { shoulder, elbow, hand, upper };
  };
  const legL = makeLeg(-0.11);
  const legR = makeLeg(0.11);
  const armL = makeArm(-0.27);
  const armR = makeArm(0.27); // camera side — carries the era's tool

  // Carried items, all parented to the right hand.
  const spear = new Group();
  part(spear, geo.cyl, '#6b4a2e', [0, 0.35, 0], [0.04, 2.1, 0.04]);
  part(spear, geo.cone, '#8d8d93', [0, 1.5, 0], [0.09, 0.26, 0.09]);
  const hoe = new Group();
  part(hoe, geo.cyl, '#7a5a3c', [0, 0.3, 0], [0.04, 1.6, 0.04]);
  part(hoe, geo.box, '#55504c', [0.09, 1.06, 0], [0.22, 0.05, 0.12]);
  const cup = new Group();
  part(cup, geo.taper, '#d8362c', [0.06, 0, 0], [0.13, 0.2, 0.13], [Math.PI, 0, 0]);
  part(cup, geo.cyl, '#f4f4f4', [0.06, 0.11, 0], [0.14, 0.02, 0.14]);
  part(cup, geo.cyl, '#f4f4f4', [0.08, 0.2, 0], [0.015, 0.18, 0.015]);
  const items = { spear, hoe, cup };
  if (opts.carries) Object.values(items).forEach((g) => armR.hand.add(g));

  // ---- Finished, rigged models: one per outfit, arriving one at a time ----------
  interface Rig {
    scene: Object3D;
    mixer: AnimationMixer;
    duration: number;
    belly: Bone[];
    chest?: Bone;
    hand?: Bone;
    headTop?: Bone;
  }
  const rigs: (Rig | undefined)[] = [];
  const rigHolder = new Group();
  rigHolder.rotation.y = Math.PI / 2; // models face +Z; the walk goes +X
  root.add(rigHolder);
  // Tools and hat for the rigged figure: kept upright, moved to the hand / head.
  const carry = new Group();
  const hatHolder = new Group();
  root.add(carry, hatHolder);

  const setRig = (outfit: number, scene: Object3D, walk: AnimationClip) => {
    // Walk on the spot: drop any forward travel baked into the clip.
    const clip = walk.clone();
    for (const track of clip.tracks) {
      if (!/hips\.position$/i.test(track.name)) continue;
      for (let i = 0; i < track.values.length; i += 3) {
        track.values[i] = track.values[0];
        track.values[i + 2] = track.values[2];
      }
    }
    const bone = (name: string) => scene.getObjectByName(name) as Bone | undefined;
    scene.traverse((o) => {
      o.frustumCulled = false;
      // These textures carry colour only and read dark on the shaded side, so
      // let them glow faintly with their own colour.
      const m = (o as Mesh).material as MeshStandardMaterial | undefined;
      if (m?.isMeshStandardMaterial && m.map) {
        m.emissiveMap = m.map;
        m.emissive.set('#ffffff');
        m.emissiveIntensity = 0.3;
      }
    });
    const mixer = new AnimationMixer(scene);
    mixer.clipAction(clip).play();
    scene.visible = false;
    rigHolder.add(scene);
    rigs[outfit] = {
      scene,
      mixer,
      duration: clip.duration,
      belly: [bone('Spine02'), bone('Spine01')].filter((b): b is Bone => !!b),
      chest: bone('Spine'),
      hand: bone('RightHand'),
      headTop: bone('head_end'),
    };
    if (!carry.children.length) {
      carry.add(spear, hoe, cup);
      hatHolder.add(hat);
      hat.position.set(0, 0, 0);
      hat.visible = true;
    }
  };

  const outfitAt = (year: number) => {
    let i = 0;
    while (i < OUTFITS.length - 1 && OUTFITS[i + 1].year <= year) i++;
    const cur = OUTFITS[i];
    const next = OUTFITS[i + 1];
    // Blend toward the next outfit as its keyframe approaches.
    let t = 0;
    if (next) {
      const window = BLEND[next.year] ?? 100;
      t = Math.max(0, Math.min(1, 1 - (next.year - year) / window));
    }
    return { cur, next, t };
  };
  const setBlend = (m: MeshLambertMaterial, a: string, b: string | undefined, t: number, tint = 1) => {
    cA.set(a);
    if (b && t > 0) cA.lerp(cB.set(b), t);
    m.color.copy(cA).multiplyScalar(tint);
  };

  /** Pose the rigged model for this moment; false if none has loaded yet. */
  const updateRig = (year: number, distance: number, s: number, girth: number) => {
    const { cur, next, t } = outfitAt(year);
    const late = t >= 0.5 && !!next;
    let index = OUTFITS.indexOf(late ? next! : cur);
    while (index > 0 && !rigs[index]) index--;
    const rig = rigs[index] ?? rigs.find((r) => r);
    if (!rig) return false;
    body.visible = false;
    for (const r of rigs) if (r) r.scene.visible = r === rig;

    // The models are built at each walker's own height; only the era's height
    // change and a little all-over thickening are applied here.
    const h = v175(year);
    const wide = 1 + (girth - 1) * 0.2;
    rigHolder.scale.set(h * wide, h, h * wide);
    const cycle = distance / (1.5 * s) + opts.phase / (Math.PI * 2);
    rig.mixer.setTime((cycle - Math.floor(cycle)) * rig.duration);
    // Weight gain gathers at the waist: widen the lower spine, and undo it at
    // the chest so shoulders, arms and head keep their size.
    const b = 1 + (girth - 1) * 0.55;
    rig.belly.forEach((bone, i) => (i === 0 ? bone.scale.set(b, 1, b) : bone.scale.set(1, 1, 1)));
    rig.chest?.scale.set(1 / b, 1, 1 / b);
    shadow.scale.setScalar(0.9 * s * girth);

    rigHolder.updateWorldMatrix(true, true);
    const item = late ? next!.item : cur.item;
    carry.visible = opts.carries && item !== 'none' && !!rig.hand;
    if (rig.hand) {
      root.worldToLocal(rig.hand.getWorldPosition(tmp));
      carry.position.copy(tmp);
      carry.scale.setScalar(h);
    }
    (Object.keys(items) as (keyof typeof items)[]).forEach((k) => {
      items[k].visible = item === k;
      items[k].rotation.z = k === 'cup' ? 0 : 0.12;
    });
    hatHolder.visible = (late ? next!.hat : cur.hat) && opts.scale > 0.8 && !!rig.headTop;
    if (rig.headTop) {
      root.worldToLocal(rig.headTop.getWorldPosition(tmp));
      hatHolder.position.copy(tmp);
      hatHolder.scale.setScalar(h * 0.82);
    }
    return true;
  };
  const v175 = (year: number) => vitalsAt(year).heightCm / 175;

  const update = (year: number, distance: number) => {
    const v = vitalsAt(year);
    const s = opts.scale * (v.heightCm / 175);
    // Girth: 1 at a lean BMI of 21, ~1.46 at today's 29.4.
    const girth = 1 + Math.max(0, v.bmi - 21) * 0.055 * opts.weightGain;
    if (updateRig(year, distance, s, girth)) return;
    body.scale.setScalar(s);
    torso.scale.set(0.26 * Math.pow(girth, 1.4), 0.62, 0.42 * girth);
    const b = Math.max(0, girth - 0.98);
    belly.scale.set(0.3 + b * 0.75, 0.36 + b * 0.45, 0.4 + b * 0.75);
    belly.position.x = 0.07 + b * 0.22;
    const limb = 1 + (girth - 1) * 0.6;
    for (const leg of [legL, legR]) {
      leg.thigh.scale.set(0.15 * limb, 0.45, 0.15 * limb);
      leg.shin.scale.set(0.13 * limb, 0.45, 0.13 * limb);
    }
    armL.upper.scale.set(0.11 * limb, 0.3, 0.11 * limb);
    armR.upper.scale.set(0.11 * limb, 0.3, 0.11 * limb);
    shadow.scale.setScalar(0.9 * s * girth);

    // Walk cycle: one full cycle (two steps) per 1.5 body-lengths travelled.
    const phi = (distance * Math.PI * 2) / (1.5 * s) + opts.phase;
    const swing = 0.55 - (girth - 1) * 0.3; // heavier bodies take shorter strides
    let reach = 0;
    [legL, legR].forEach((leg, i) => {
      const p = phi + i * Math.PI;
      const thigh = Math.sin(p) * swing;
      const knee = -(0.1 + 0.8 * Math.max(0, Math.cos(p)));
      leg.hip.rotation.z = thigh;
      leg.knee.rotation.z = knee;
      reach = Math.max(reach, 0.45 * Math.cos(thigh) + 0.47 * Math.cos(thigh + knee));
    });
    // Keep the planted foot on the ground; gives a natural bob.
    body.position.y = (reach - 0.92) * s;

    const { cur, next, t } = outfitAt(year);
    const carrying = opts.carries && (t < 0.5 ? cur.item : next!.item) !== 'none';
    armL.shoulder.rotation.z = -Math.sin(phi) * 0.45;
    armL.elbow.rotation.z = 0.25;
    armR.shoulder.rotation.z = carrying ? 0.25 + Math.sin(phi) * 0.08 : Math.sin(phi) * 0.45;
    armR.elbow.rotation.z = carrying ? 0.9 : 0.25;
    // Items hang from a bent forearm; counter-rotate so they stay upright.
    const upright = -(armR.shoulder.rotation.z + armR.elbow.rotation.z);
    const item = t < 0.5 ? cur.item : next!.item;
    (Object.keys(items) as (keyof typeof items)[]).forEach((k) => {
      items[k].visible = item === k;
      items[k].rotation.z = upright + (k === 'cup' ? 0 : 0.12);
    });
    hat.visible = (t < 0.5 ? cur.hat : next!.hat) && opts.scale > 0.8;

    setBlend(topMat, cur.top, next?.top, t, opts.tint);
    setBlend(armMat, cur.arms, next?.arms, t, cur.arms === SKIN && (!next || next.arms === SKIN) ? 1 : opts.tint);
    setBlend(legMat, cur.legs, next?.legs, t);
    setBlend(footMat, cur.feet, next?.feet, t);
  };

  /**
   * Swap the drawn tools and hat for finished models. Each model stands
   * upright with its origin at its base, so it is dropped to where the drawn
   * one began.
   */
  const equip = (models: { spear?: Object3D; hoe?: Object3D; cup?: Object3D; hat?: Object3D }) => {
    const fit = (slot: Group, model: Object3D | undefined, x: number, y: number) => {
      if (!model) return;
      const m = model.clone();
      m.position.set(x, y, 0);
      slot.clear();
      slot.add(m);
    };
    fit(spear, models.spear, 0, -0.7);
    fit(hoe, models.hoe, 0, -0.5);
    fit(cup, models.cup, 0.06, -0.1);
    fit(hat, models.hat, 0, -0.1);
  };

  const dispose = () => {
    [topMat, armMat, legMat, footMat, shadowMat].forEach((m) => m.dispose());
    shadowGeo.dispose();
    for (const rig of rigs) {
      rig?.mixer.stopAllAction();
      rig?.scene.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const m = mesh.material as MeshStandardMaterial;
        m.map?.dispose();
        m.dispose();
      });
    }
  };

  return { root, update, equip, setRig, dispose };
};
