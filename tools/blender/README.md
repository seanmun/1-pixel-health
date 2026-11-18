# Model pipeline

Turns a raw Meshy export in `models-src/` into a web-ready `public/models/<id>.glb`.
Run from the repo root; `WORK` is any scratch folder.

```sh
# 1. What is in the file? (triangles, size, textures)
blender -b --python tools/blender/inspect.py -- models-src/<raw>.glb

# 2. Reduce to a web-friendly triangle count (slow for multi-million-triangle files)
blender -b --python tools/blender/decimate.py -- models-src/<raw>.glb $WORK/<id>.blend 70000

# 3. Render previews to see which way it faces
blender -b --python tools/blender/preview.py -- $WORK/<id>.blend $WORK

# 4. Face +X, scale to real height in metres, origin on the ground, shrink textures, export
#    args: height in metres, rotation about the vertical axis in degrees
blender -b --python tools/blender/export.py -- $WORK/<id>.blend public/models/<id>.glb 3.2 90
```

Then add the id to `MODEL_IDS` in `src/components/journey/world/models.ts`, pass
`model: '<id>'` where the placeholder is placed in `scenery.ts`, and set its status to
`done` in `src/data/objects.ts`.

`export.py` assumes Meshy's texture names (`Image_0` colour, `Image_1` roughness/metal,
`Image_2` normal).
