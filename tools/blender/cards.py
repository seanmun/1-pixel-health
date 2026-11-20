# Turn a crop-row model into a handful of flat picture cards for distant fields:
# the row is photographed from the side, the end and above, and those pictures
# go on crossed planes (two lengthways, three across, one lying flat near the
# top). 12 triangles instead of thousands; the engine cuts the cards out by the
# picture's transparency.
#   blender -b --python tools/blender/cards.py -- <in.blend> <out.glb> <height> [top_fraction]
import bpy, sys, os, math, tempfile
import numpy as np
from mathutils import Matrix
a = sys.argv[sys.argv.index('--') + 1:]
src, out, height = a[0], a[1], float(a[2])
top_frac = float(a[3]) if len(a) > 3 else 0.8
bpy.ops.wm.open_mainfile(filepath=src)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
me = ob.data
me.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
co = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
lo, hi = co.min(axis=0), co.max(axis=0)
c = (lo + hi) / 2; L, W, H = hi - lo

sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sc.display.shading.light = 'FLAT'; sc.display.shading.color_type = 'TEXTURE'
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.clip_end = 100
tmp = tempfile.mkdtemp()

def shot(name, loc, rot, w, h):
    cam.location = loc; cam.rotation_euler = rot
    cam.data.ortho_scale = max(w, h)
    sc.render.resolution_x = max(8, round(1024 * w / max(w, h))); sc.render.resolution_y = max(8, round(1024 * h / max(w, h)))
    sc.render.filepath = os.path.join(tmp, name + '.png')
    bpy.ops.render.render(write_still=True)
    return bpy.data.images.load(sc.render.filepath)

r90 = math.radians(90)
views = {
    'side': shot('side', (c[0], lo[1] - 10, c[2]), (r90, 0, 0), L, H),
    'end': shot('end', (hi[0] + 10, c[1], c[2]), (r90, 0, r90), W, H),
    'top': shot('top', (c[0], c[1], hi[2] + 10), (0, 0, 0), L, W),
}

def pixels(img, w, h):
    img.scale(w, h)
    px = np.empty(w * h * 4, dtype=np.float32); img.pixels.foreach_get(px)
    return px.reshape(h, w, 4)

N = 512
atlas = np.zeros((N, N, 4), dtype=np.float32)
atlas[N // 2:, :] = pixels(views['side'], N, N // 2)
atlas[: N // 2, : N // 2] = pixels(views['end'], N // 2, N // 2)
atlas[: N // 2, N // 2:] = pixels(views['top'], N // 2, N // 2)
# Give see-through pixels the average plant colour so cut-out edges do not darken.
solid = atlas[:, :, 3] > 0.5
atlas[~solid, :3] = atlas[solid][:, :3].mean(axis=0)
atlas[:, :, 3] = np.where(solid, 1.0, 0.0)
img = bpy.data.images.new('cards', N, N, alpha=True)
img.pixels.foreach_set(atlas.reshape(-1)); img.pack()

verts, faces, uvs = [], [], []
def quad(p, uv):
    i = len(verts); verts.extend(p); faces.append((i, i + 1, i + 2, i + 3)); uvs.extend(uv)
SIDE = [(0, 0.5), (1, 0.5), (1, 1), (0, 1)]
END = [(0, 0), (0.5, 0), (0.5, 0.5), (0, 0.5)]
TOP = [(0.5, 0), (1, 0), (1, 0.5), (0.5, 0.5)]
for dy in (-0.18, 0.18):
    y = c[1] + dy * W
    quad([(lo[0], y, lo[2]), (hi[0], y, lo[2]), (hi[0], y, hi[2]), (lo[0], y, hi[2])], SIDE)
for i in range(3):
    x = lo[0] + L * (i + 0.5) / 3
    quad([(x, lo[1], lo[2]), (x, hi[1], lo[2]), (x, hi[1], hi[2]), (x, lo[1], hi[2])], END)
z = lo[2] + H * top_frac
quad([(lo[0], lo[1], z), (hi[0], lo[1], z), (hi[0], hi[1], z), (lo[0], hi[1], z)], TOP)

s = height / H
pts = [((x - c[0]) * s, (y - c[1]) * s, (zz - lo[2]) * s) for x, y, zz in verts]
bpy.data.objects.remove(ob)
m = bpy.data.meshes.new('cards'); m.from_pydata(pts, [], faces)
uv = m.uv_layers.new(name='UVMap')
for k, l in enumerate(m.loops): uv.data[k].uv = uvs[l.vertex_index]
# Light every card as if it faced the sky, so the field shades evenly.
m.normals_split_custom_set_from_vertices([(0, 0, 1)] * len(pts))
mat = bpy.data.materials.new('cards'); mat.use_nodes = True; mat.use_backface_culling = False
nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
nt.links.new(tex.outputs['Alpha'], bsdf.inputs['Alpha'])
bsdf.inputs['Roughness'].default_value = 1.0
m.materials.append(mat)
o = bpy.data.objects.new('cards', m); sc.collection.objects.link(o)
bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
print('CARDS size', round(L * s, 2), round(W * s, 2), round(height, 2), 'tris', len(faces) * 2)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='AUTO', use_selection=True,
                          export_yup=True, export_apply=True, export_animations=False, export_cameras=False, export_lights=False)
