# Reduce a tree: the trunk and branches are separated from the foliage and each
# is reduced to its own triangle budget, so millions of tiny leaves cannot
# starve the trunk of detail.
#   blender -b --python tools/blender/decimate_tree.py -- <raw.glb> <out.blend> <trunk_tris> <leaf_tris>
import bpy, sys, time
import numpy as np
a = sys.argv[sys.argv.index('--') + 1:]
src, out, trunk_target, leaf_target = a[0], a[1], int(a[2]), int(a[3])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
me = ob.data
print('IMPORTED verts', len(me.vertices), 'faces', len(me.polygons))

# Tell wood from foliage by colour: sample the (blurred) colour texture at each
# face and call it foliage where green dominates. Meshy trees are one welded
# surface, so connectivity cannot separate them.
img = max((i for i in bpy.data.images if i.colorspace_settings.name == 'sRGB' and i.size[0] > 0), key=lambda i: i.size[0])
W, H = img.size
px = np.empty(W * H * 4, dtype=np.float32); img.pixels.foreach_get(px)
px = px.reshape(H, W, 4)[:, :, :3]
k = max(1, W // 512)
px = px[: H // k * k, : W // k * k].reshape(H // k, k, W // k, k, 3).mean(axis=(1, 3))
uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers.active.data.foreach_get('uv', uv)
uv = uv.reshape(-1, 3, 2).mean(axis=1)  # glTF meshes are all triangles
ix = np.clip((uv[:, 0] % 1.0 * px.shape[1]).astype(int), 0, px.shape[1] - 1)
iy = np.clip((uv[:, 1] % 1.0 * px.shape[0]).astype(int), 0, px.shape[0] - 1)
c = px[iy, ix]
fsel = ~((c[:, 1] > c[:, 0] * 1.04) & (c[:, 1] > c[:, 2]))  # True = wood
print('WOOD faces', int(fsel.sum()), 'of', len(fsel), round(100 * fsel.mean(), 1), '%')
if not 0.002 < fsel.mean() < 0.9:
    raise SystemExit('wood/foliage split looks wrong; aborting')
# Split by giving wood faces a second material slot, then separating by material.
wood_mat = me.materials[0].copy(); wood_mat.name = 'WOOD'
me.materials.append(wood_mat)
me.polygons.foreach_set('material_index', fsel.astype(np.int32))
me.update()
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='MATERIAL')
bpy.ops.object.mode_set(mode='OBJECT')
parts = [o for o in bpy.data.objects if o.type == 'MESH']
def is_wood(o):
    idx = np.zeros(len(o.data.polygons), dtype=np.int32); o.data.polygons.foreach_get('material_index', idx)
    return o.data.materials[int(idx[0])].name.startswith('WOOD')
trunk = [o for o in parts if is_wood(o)][0]
leaves = [o for o in parts if o is not trunk][0]
main_mat = [m for m in bpy.data.materials if not m.name.startswith('WOOD')][0]
for o, target in ((trunk, trunk_target), (leaves, leaf_target)):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    if o is trunk:
        # Weld UV seams on the wood so it reduces cleanly instead of tearing.
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.object.mode_set(mode='OBJECT')
    o.data.calc_loop_triangles(); n = len(o.data.loop_triangles)
    t = time.time()
    if n > target:
        m = o.modifiers.new('dec', 'DECIMATE'); m.ratio = target / n
        bpy.ops.object.modifier_apply(modifier='dec')
    o.data.calc_loop_triangles()
    print('DECIMATED', 'trunk' if o is trunk else 'leaves', n, '->', len(o.data.loop_triangles), round(time.time() - t), 's')
    if o is leaves and len(o.data.loop_triangles) > target * 1.2:
        # Reduction stalls on loose leaf fragments. Thin them instead: keep a
        # random share of the leaf triangles and enlarge each one about its own
        # centre so the canopy stays as full.
        keep = target / len(o.data.loop_triangles)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_mode(type='FACE')
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_random(ratio=1 - keep, seed=7)
        bpy.ops.mesh.delete(type='FACE')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.quads_convert_to_tris()
        bpy.ops.mesh.edge_split(type='EDGE')  # give every triangle its own corners
        bpy.ops.object.mode_set(mode='OBJECT')
        m2 = o.data
        co = np.empty(len(m2.vertices) * 3, dtype=np.float32); m2.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
        fv = np.empty(len(m2.polygons) * 3, dtype=np.int32); m2.polygons.foreach_get('vertices', fv); fv = fv.reshape(-1, 3)
        centre = co[fv].mean(axis=1, keepdims=True)
        grow = min(2.0, (1 / keep) ** 0.4)
        co[fv.reshape(-1)] = (centre + (co[fv] - centre) * grow).reshape(-1, 3)
        m2.vertices.foreach_set('co', co.reshape(-1)); m2.update()
        print('THINNED leaves to', len(m2.polygons), 'grow', round(grow, 2))
    o.data.materials.clear(); o.data.materials.append(main_mat)  # back to one shared material
bpy.ops.object.select_all(action='DESELECT'); trunk.select_set(True); leaves.select_set(True)
bpy.context.view_layer.objects.active = trunk
bpy.ops.object.join()
main_mat.use_backface_culling = False  # leaves are seen from both sides
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=out)
