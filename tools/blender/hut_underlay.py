# Adds a solid cone beneath the thinned thatch so the roof is not see-through.
import bpy, sys, math
import numpy as np
blend = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.open_mainfile(filepath=blend)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
me = ob.data
M = np.array(ob.matrix_world)
co = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
w = co @ M[:3, :3].T + M[:3, 3]
H = w[:, 2].max() - w[:, 2].min(); z0 = w[:, 2].min()
mid = (w[:, :2].max(axis=0) + w[:, :2].min(axis=0)) / 2
r = np.linalg.norm(w[:, :2] - mid, axis=1); rmax = r.max()
rim = w[r > 0.9 * rmax]
z_eave = np.percentile(rim[:, 2], 60)
apex_z = w[:, 2].max() - 0.04 * H
# line from apex (r=0) to eave (r=rmax); stop at 0.92 rmax, drop a little
R = 0.92 * rmax
base_z = apex_z + (z_eave - apex_z) * 0.92 - 0.02 * H
# thatch colour texel: median-coloured face in the upper roof
img = max((i for i in bpy.data.images if i.colorspace_settings.name == 'sRGB' and i.size[0] > 0), key=lambda i: i.size[0])
W, Hh = img.size
px = np.empty(W * Hh * 4, dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(Hh, W, 4)[:, :, :3]
me.calc_loop_triangles()
uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers.active.data.foreach_get('uv', uv); uv = uv.reshape(-1, 2)
lv = np.empty(len(me.loops), dtype=np.int32); me.loops.foreach_get('vertex_index', lv)
up = (w[lv, 2] - z0) / H > 0.7
u = uv[up]
c = px[np.clip((u[:, 1] % 1 * Hh).astype(int), 0, Hh - 1), np.clip((u[:, 0] % 1 * W).astype(int), 0, W - 1)]
lum = c.mean(axis=1)
target = np.percentile(lum, 35)
best = u[np.argmin(np.abs(lum - target))]
print('UNDERLAY R', round(float(R), 3), 'base', round(float(base_z), 3), 'apex', round(float(apex_z), 3), 'uv', best, 'col', c[np.argmin(np.abs(lum - target))])
n = 28
verts = [(mid[0], mid[1], apex_z)] + [(mid[0] + R * math.cos(2 * math.pi * i / n), mid[1] + R * math.sin(2 * math.pi * i / n), base_z) for i in range(n)]
faces = [(0, 1 + i, 1 + (i + 1) % n) for i in range(n)]
cm = bpy.data.meshes.new('underlay'); cm.from_pydata(verts, [], faces); cm.update()
uvl = cm.uv_layers.new(name=me.uv_layers.active.name)
for l in uvl.data: l.uv = (float(best[0]), float(best[1]))
cm.materials.append(me.materials[0])
cone = bpy.data.objects.new('underlay', cm); bpy.context.scene.collection.objects.link(cone)
cone.matrix_world = ob.matrix_world.inverted() @ cone.matrix_world if False else cone.matrix_world
# bring mesh to world space so the join is exact
me.transform(ob.matrix_world); ob.matrix_world.identity()
bpy.ops.object.select_all(action='DESELECT'); cone.select_set(True); ob.select_set(True)
bpy.context.view_layer.objects.active = ob
bpy.ops.object.join()
bpy.ops.wm.save_mainfile()
