# Prepare a rigged, walking character from Meshy for the web: drop the helper
# sphere, shrink the texture, and export skin + walk clip as one small GLB.
#   blender -b --python tools/blender/walker.py -- <walk.glb> <out.glb> [preview.png]
import bpy, sys, math
from mathutils import Vector
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
for o in list(bpy.data.objects):
    if o.type == 'MESH' and len(o.data.materials) == 0: bpy.data.objects.remove(o)
for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)
arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
act = bpy.data.actions[0]
hips = [fc for fc in act.fcurves if 'Hips' in fc.data_path and fc.data_path.endswith('location')] if hasattr(act, 'fcurves') else []
for fc in hips:
    v = [k.co[1] for k in fc.keyframe_points]; print('HIPS loc', fc.array_index, round(min(v), 3), round(max(v), 3))
print('RANGE', act.frame_range[:])
if len(a) > 2:
    sc = bpy.context.scene; sc.frame_set(int(act.frame_range[0]) + 7)
    cam = bpy.data.cameras.new('c'); co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
    co.location = (3.2, -3.2, 1.2); d = Vector((0, 0, 0.9)) - co.location; co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sun = bpy.data.objects.new('s', bpy.data.lights.new('s', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (0.9, 0, 0.8); sc.collection.objects.link(sun)
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs[0].default_value = (0.55, 0.55, 0.55, 1)
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    sc.render.resolution_x = 360; sc.render.resolution_y = 480; sc.render.filepath = a[2]
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(co); bpy.data.objects.remove(sun)
bpy.ops.export_scene.gltf(filepath=a[1], export_format='GLB', export_image_format='JPEG', export_jpeg_quality=85,
                          export_yup=True, export_animations=True, export_skins=True, export_cameras=False, export_lights=False)
