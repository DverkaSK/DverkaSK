import pathlib, base64, re

flat = pathlib.Path('../flat')
head = (flat / 'head.html').read_text(encoding='utf-8')
# no style/pixel switchers here, just the scene
head = re.sub(r'<div class="ctrl">.*?\n</div>\n', '', head, flags=re.S)
head = head.replace('<canvas id="view" aria-label="Pixel diorama of a cosy Russian flat on New Year\'s Eve: friends at a table, the DverkaSK sign in the middle and a little door mascot running around"></canvas>',
                    '<canvas id="view" aria-label="A cosy Russian flat on New Year\'s Eve in an old-school 3D game look: Ghostface, a trollface guy, a bathrobe anon with a paper bag on his head and a cat at the table, the DverkaSK sign in the middle and a little door mascot running around"></canvas>')
head = head.replace('#view { position: fixed; left: 0; top: 0; display: block; image-rendering: pixelated; image-rendering: crisp-edges; }', '#view { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }')
head = head.replace('<div class="vignette"></div>', '')
head = head.replace('<title>Sychevalnya</title>', '<title>Sychevalnya</title>')

mascot = (flat / '3-mascot.js').read_text(encoding='utf-8')
# softer, higher-res face so it fits the bilinear look
mascot = mascot.replace("const FACE = canvasTex(16, 24, () => {});", "const FACE = canvasTex(32, 48, () => {});")
mascot = mascot.replace("  const { g, s } = FACE.userData;\n", "  const { g, s } = FACE.userData;\n  g.setTransform(2, 0, 0, 2, 0, 0);\n")
mascot = mascot.replace("const VOID = canvasTex(16, 24, (g) => {", "const VOID = canvasTex(16, 24, (g) => {")
assert 'g.setTransform(2, 0, 0, 2, 0, 0);' in mascot

troll = 'data:image/png;base64,' + base64.b64encode(pathlib.Path('../trollface.png').read_bytes()).decode()
js = "const TROLL_PNG = '" + troll + "';\n" + '\n'.join(pathlib.Path(f).read_text(encoding='utf-8') for f in ['1-tex.js', '2-room.js', '3-guests.js']) + '\n' + mascot + '\n' + pathlib.Path('5-main.js').read_text(encoding='utf-8')
body = "if (!window.THREE) {\n  document.getElementById('boot').textContent = 'Не удалось загрузить three.js ни с одного CDN — обнови страницу.';\n} else {\n" + js + "\n}"
out = head + '\n<script>\n' + body + '\n</script>\n'
pathlib.Path('../zastolye.html').write_text(out, encoding='utf-8', newline='\n')
pathlib.Path('../zastolye-preview.html').write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + out.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js') + '</body></html>', encoding='utf-8', newline='\n')
print('built', len(out))
