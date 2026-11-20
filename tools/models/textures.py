# Shrink the pictures inside a finished model (.glb) without touching its mesh:
# every texture is re-saved as WebP, base colour capped at 1024 px and the
# detail maps (surface bumps, roughness) at 512 px. Needs `cwebp` on the PATH.
#   python3 tools/models/textures.py <in.glb> <out.glb>
import json, struct, subprocess, sys, tempfile, os

src, out = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
n = struct.unpack('<I', d[12:16])[0]
j = json.loads(d[20:20 + n])
bin0 = 20 + n + 8
views = j['bufferViews']
chunks = [d[bin0 + v.get('byteOffset', 0): bin0 + v.get('byteOffset', 0) + v['byteLength']] for v in views]

def size(b):
    if b[:4] == b'\x89PNG': return struct.unpack('>II', b[16:24])
    i = 2
    while i < len(b):
        m, l = b[i + 1], struct.unpack('>H', b[i + 2:i + 4])[0]
        if m in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack('>HH', b[i + 5:i + 9]); return w, h
        i += 2 + l
    raise ValueError('unreadable image')

# Which images are base colour (kept sharper) and which carry transparency.
colour = set()
for m in j.get('materials', []):
    t = m.get('pbrMetallicRoughness', {}).get('baseColorTexture')
    if t is not None:
        tex = j['textures'][t['index']]
        colour.add(tex.get('source', tex.get('extensions', {}).get('EXT_texture_webp', {}).get('source')))

tmp = tempfile.mkdtemp()
for i, im in enumerate(j.get('images', [])):
    if im.get('mimeType') == 'image/webp': continue
    b = chunks[im['bufferView']]
    w, h = size(b)
    cap = 1024 if i in colour else 512
    a, o = os.path.join(tmp, 'in'), os.path.join(tmp, 'out.webp')
    open(a, 'wb').write(b)
    cmd = ['cwebp', '-quiet', '-m', '6', '-q', '70' if i in colour else '80', '-alpha_q', '100', '-exact']
    if max(w, h) > cap: cmd += ['-resize', str(round(w * cap / max(w, h))), str(round(h * cap / max(w, h)))]
    subprocess.run(cmd + [a, '-o', o], check=True)
    chunks[im['bufferView']] = open(o, 'rb').read()
    im['mimeType'] = 'image/webp'

for t in j.get('textures', []):
    if 'source' in t:
        t.setdefault('extensions', {})['EXT_texture_webp'] = {'source': t.pop('source')}
for k in ('extensionsUsed', 'extensionsRequired'):
    if 'EXT_texture_webp' not in j.setdefault(k, []): j[k].append('EXT_texture_webp')

body = bytearray()
for v, c in zip(views, chunks):
    while len(body) % 4: body.append(0)
    v['byteOffset'] = len(body); v['byteLength'] = len(c)
    body += c
while len(body) % 4: body.append(0)
j['buffers'][0]['byteLength'] = len(body)
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
with open(out, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(body)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(body), 0x004E4942)); f.write(body)
print(os.path.basename(src), os.path.getsize(src) // 1024, '->', os.path.getsize(out) // 1024, 'KB')
