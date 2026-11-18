import bpy, sys, math
from mathutils import Vector
a = sys.argv[sys.argv.index('--') + 1:]
blend, outdir = a[0], a[1]
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'TEXTURE'
sc.render.resolution_x = 700; sc.render.resolution_y = 500
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.4
views = {'px': (3, 0, 0), 'ny': (0, -3, 0), 'top': (0, 0, 3), 'q': (2.2, -2.2, 1.2)}
for name, pos in views.items():
    cam.location = pos
    d = Vector((0, 0, 0)) - Vector(pos)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{outdir}/prev_{name}.png'
    bpy.ops.render.render(write_still=True)
