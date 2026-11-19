# Reduce a model to a triangle budget.
#   blender -b --python tools/blender/decimate.py -- <raw.glb> <out.blend> <tris> [weld]
# Pass "weld" for hard-surface models (buildings, vehicles): it joins the
# vertices split along texture seams so flat walls reduce without tearing open.
import bpy, sys, time
a = sys.argv[sys.argv.index('--') + 1:]
src, out, target = a[0], a[1], int(a[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
if len(a) > 3 and a[3] == 'weld':
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.object.mode_set(mode='OBJECT')
ob.data.calc_loop_triangles(); n = len(ob.data.loop_triangles)
t = time.time()
m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = target / n
bpy.ops.object.modifier_apply(modifier='dec')
ob.data.calc_loop_triangles()
print('DECIMATED', n, '->', len(ob.data.loop_triangles), 'in', round(time.time() - t), 's')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=out)
