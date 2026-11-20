# Reduce a crop-row model for use close to the road: plain reduction to a
# triangle budget, colour picture only (1K), both sides of every leaf drawn.
#   blender -b --python tools/blender/crop_near.py -- <in.blend> <out.blend> <tris>
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.open_mainfile(filepath=a[0])
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
ob.data.calc_loop_triangles(); n = len(ob.data.loop_triangles)
m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = int(a[2]) / n
bpy.ops.object.modifier_apply(modifier='dec')
ob.data.calc_loop_triangles(); print('REDEC', n, '->', len(ob.data.loop_triangles))
for mt in ob.data.materials: mt.use_backface_culling = False
# Plants this small need only their colour: drop the surface-detail maps and halve the picture.
for mt in ob.data.materials:
    nt = mt.node_tree; b = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]
    for name in ('Normal', 'Roughness', 'Metallic'):
        for l in list(b.inputs[name].links): nt.links.remove(l)
    b.inputs['Roughness'].default_value = 0.9; b.inputs['Metallic'].default_value = 0
    for l in b.inputs['Base Color'].links:
        im = l.from_node.image if l.from_node.type == 'TEX_IMAGE' else None
        if im and im.size[0] > 1024: im.scale(1024, 1024); im.pack()
bpy.ops.wm.save_as_mainfile(filepath=a[1])
