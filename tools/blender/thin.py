# Thin a mass of loose blades (grass) that ordinary reduction cannot shrink:
# keep a random share of the triangles and enlarge each about its own centre so
# the clump stays as full.
#   blender -b --python tools/blender/thin.py -- <in.blend> <out.blend> <tris> <grow>
import bpy, sys
import numpy as np
a = sys.argv[sys.argv.index('--') + 1:]
target, grow = int(a[2]), float(a[3])
bpy.ops.wm.open_mainfile(filepath=a[0])
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
ob.data.calc_loop_triangles(); keep = target / len(ob.data.loop_triangles)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_mode(type='FACE')
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.mesh.select_random(ratio=1 - keep, seed=7)
bpy.ops.mesh.delete(type='FACE')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.quads_convert_to_tris()
bpy.ops.mesh.edge_split(type='EDGE')
bpy.ops.object.mode_set(mode='OBJECT')
me = ob.data
co = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
fv = np.empty(len(me.polygons) * 3, dtype=np.int32); me.polygons.foreach_get('vertices', fv); fv = fv.reshape(-1, 3)
centre = co[fv].mean(axis=1, keepdims=True)
co[fv.reshape(-1)] = (centre + (co[fv] - centre) * grow).reshape(-1, 3)
me.vertices.foreach_set('co', co.reshape(-1)); me.update()
for m in me.materials: m.use_backface_culling = False
print('THINNED to', len(me.polygons))
bpy.ops.wm.save_as_mainfile(filepath=a[1])
