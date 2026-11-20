# Re-save a finished model with its mesh data compressed (Draco), leaving the
# textures, skeleton and animation as they are. The site's loader decodes it
# with the Draco decoder in public/draco.
#   blender -b --python tools/blender/compress.py -- <in.glb> <out.glb>
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
anim = any(o.type == 'ARMATURE' for o in bpy.data.objects)
bpy.ops.export_scene.gltf(
    filepath=a[1], export_format='GLB', export_image_format='AUTO', export_yup=True,
    export_animations=anim, export_skins=anim, export_cameras=False, export_lights=False,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12, export_draco_generic_quantization=12)
