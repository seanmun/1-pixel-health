import bpy, sys, math
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index('--') + 1:]
blend, out, height, rot_deg = a[0], a[1], float(a[2]), float(a[3])
bpy.ops.wm.open_mainfile(filepath=blend)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
me = ob.data
# Face +X, then scale to real height, then put the origin on the ground at the footprint centre.
me.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
me.transform(Matrix.Rotation(math.radians(rot_deg), 4, 'Z'))
zs = [v.co.z for v in me.vertices]
s = height / (max(zs) - min(zs))
me.transform(Matrix.Scale(s, 4))
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
me.transform(Matrix.Translation((-(max(xs) + min(xs)) / 2, -(max(ys) + min(ys)) / 2, -min(zs))))
me.update()
for p in me.polygons: p.use_smooth = True
sizes = {'Image_0': 2048, 'Image_1': 1024, 'Image_2': 2048}
for im in bpy.data.images:
    if im.name in sizes and im.size[0] > sizes[im.name]:
        im.scale(sizes[im.name], sizes[im.name])
xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
print('FINAL size', round(max(xs) - min(xs), 2), round(max(ys) - min(ys), 2), round(max(zs) - min(zs), 2), 'tris', len(me.polygons))
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=86,
                          export_yup=True, export_apply=True, export_animations=False, export_cameras=False, export_lights=False)
