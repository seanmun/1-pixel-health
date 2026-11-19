# Reduce a flat-sided model (tower block, solar panel) whose detail is all in
# the texture: weld the seams, then merge near-coplanar faces without crossing
# texture-island borders, so printed grids of windows or cells stay straight.
#   blender -b --python tools/blender/decimate_flat.py -- <raw.glb> <out.blend> <angle_deg> [max_tris]
import bpy, sys, math
a = sys.argv[sys.argv.index('--') + 1:]
src, out, angle = a[0], a[1], float(a[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.object.mode_set(mode='OBJECT')
m = ob.modifiers.new('dis', 'DECIMATE'); m.decimate_type = 'DISSOLVE'
m.angle_limit = math.radians(angle); m.delimit = {'UV'}
bpy.ops.object.modifier_apply(modifier='dis')
t = ob.modifiers.new('tri', 'TRIANGULATE'); bpy.ops.object.modifier_apply(modifier='tri')
ob.data.calc_loop_triangles(); n = len(ob.data.loop_triangles)
print('DISSOLVED to', n)
if len(a) > 3 and n > int(a[3]):
    c = ob.modifiers.new('dec', 'DECIMATE'); c.ratio = int(a[3]) / n
    bpy.ops.object.modifier_apply(modifier='dec')
    ob.data.calc_loop_triangles(); print('DECIMATED to', len(ob.data.loop_triangles))
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=out)
