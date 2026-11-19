# Reduce a model whose detail is printed in the texture (window grids, solar
# cells): make a reduced copy, give it fresh texture coordinates, and repaint
# the colour onto it from the full-detail original, so straight printed lines
# stay straight. Colour only; the result gets a plain matte finish.
#   blender -b --python tools/blender/rebake.py -- <raw.glb> <out.blend> <tris> [texture_px=1024]
import bpy, sys, math
a = sys.argv[sys.argv.index('--') + 1:]
src, out, target = a[0], a[1], int(a[2]); px = int(a[3]) if len(a) > 3 else 1024
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
hi = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = hi; hi.select_set(True)
bpy.ops.object.duplicate(); lo = bpy.context.view_layer.objects.active
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.object.mode_set(mode='OBJECT')
lo.data.calc_loop_triangles(); n = len(lo.data.loop_triangles)
m = lo.modifiers.new('dec', 'DECIMATE'); m.ratio = target / n
bpy.ops.object.modifier_apply(modifier='dec')
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004)
bpy.ops.object.mode_set(mode='OBJECT')
img = bpy.data.images.new('Image_0', px, px, alpha=False)
mat = bpy.data.materials.new('baked'); mat.use_nodes = True
nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
bsdf.inputs['Roughness'].default_value = 0.75; bsdf.inputs['Metallic'].default_value = 0
lo.data.materials.clear(); lo.data.materials.append(mat)
nt.nodes.active = tex
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 1
bpy.ops.object.select_all(action='DESELECT'); hi.select_set(True); lo.select_set(True)
bpy.context.view_layer.objects.active = lo
d = max(lo.dimensions)
bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_selected_to_active=True,
                    cage_extrusion=d * 0.02, max_ray_distance=d * 0.05, margin=8)
nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
img.pack()
bpy.data.objects.remove(hi)
lo.data.calc_loop_triangles(); print('REBAKED tris', len(lo.data.loop_triangles))
bpy.ops.wm.save_as_mainfile(filepath=out)
