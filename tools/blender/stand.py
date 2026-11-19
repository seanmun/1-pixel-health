# Stand a long hand-held tool (spear, hoe) upright for carrying: the handle is
# turned to run up the Z axis through the origin, and optionally lengthened,
# since generated tools come out with stubby handles.
#   blender -b --python tools/blender/stand.py -- <in.blend> <out.blend> <spear|hoe> <head_fraction> <handle_stretch>
# spear: head at -X in the source. hoe: head at +X, blade pointing -Y.
import bpy, sys
import numpy as np
from mathutils import Matrix
a = sys.argv[sys.argv.index('--') + 1:]
kind, head, k = a[2], float(a[3]), float(a[4])
bpy.ops.wm.open_mainfile(filepath=a[0])
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
me = ob.data
me.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
R = {'spear': ((0, 0, 1), (0, 1, 0), (-1, 0, 0)), 'hoe': ((0, -1, 0), (0, 0, -1), (1, 0, 0))}[kind]
me.transform(Matrix(R).to_4x4())
co = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
z0, z1 = co[:, 2].min(), co[:, 2].max()
split = z1 - (z1 - z0) * head
low = co[:, 2] < split
co[low, 2] = split - (split - co[low, 2]) * k
# Centre the handle (its lower half) on the origin.
h = co[co[:, 2] < co[:, 2].min() + (split - co[:, 2].min()) * 0.5]
co[:, 0] -= (h[:, 0].max() + h[:, 0].min()) / 2; co[:, 1] -= (h[:, 1].max() + h[:, 1].min()) / 2
me.vertices.foreach_set('co', co.reshape(-1)); me.update()
print('STOOD', kind, 'x', co[:, 0].min(), co[:, 0].max(), 'y', co[:, 1].min(), co[:, 1].max(), 'z', co[:, 2].min(), co[:, 2].max())
bpy.ops.wm.save_as_mainfile(filepath=a[1])
