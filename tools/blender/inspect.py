import bpy, sys
from mathutils import Vector
src = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
lo = Vector((1e9,)*3); hi = Vector((-1e9,)*3)
for o in bpy.data.objects:
    print('OBJ', o.type, o.name, 'parent', o.parent.name if o.parent else None, 'scale', tuple(round(x,3) for x in o.scale), 'rot', tuple(round(x,2) for x in o.rotation_euler))
    if o.type == 'MESH':
        me = o.data
        me.calc_loop_triangles()
        print('  verts', len(me.vertices), 'tris', len(me.loop_triangles), 'uv', [u.name for u in me.uv_layers], 'mats', [m.name for m in me.materials], 'vcol', len(me.color_attributes))
        for v in o.bound_box:
            w = o.matrix_world @ Vector(v)
            lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
print('BOUNDS lo', tuple(round(x,3) for x in lo), 'hi', tuple(round(x,3) for x in hi), 'size', tuple(round(x,3) for x in hi-lo))
for im in bpy.data.images:
    print('IMG', im.name, tuple(im.size), im.file_format, 'packed', bool(im.packed_file), im.colorspace_settings.name)
for m in bpy.data.materials:
    if m.use_nodes:
        print('MAT', m.name, [(n.type, getattr(getattr(n,'image',None),'name',None)) for n in m.node_tree.nodes])
        for l in m.node_tree.links: print('   ', l.from_node.type, l.from_socket.name, '->', l.to_node.type, l.to_socket.name)
print('ANIM', len(bpy.data.actions), 'ARM', len(bpy.data.armatures))
