import pathlib, re
head = pathlib.Path('head.html').read_text(encoding='utf-8')
js = '\n'.join(pathlib.Path(f).read_text(encoding='utf-8') for f in ['1-tex.js', '2-scene.js', '3-main.js'])
body = "if (!window.THREE || !THREE.EffectComposer) {\n  document.getElementById('boot').textContent = 'Не удалось загрузить three.js — обнови страницу.';\n} else {\n" + js + "\n}"
out = head + '\n<script>\n' + body + '\n</script>\n'
pathlib.Path('../sychevalnya-desk.html').write_text(out, encoding='utf-8', newline='\n')
# local preview: same page, libraries from disk
prev = out.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js')
prev = re.sub(r'https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/[a-z]+/([A-Za-z]+\.js)', r'syc/lib/\1', prev)
pathlib.Path('../desk-preview.html').write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + prev + '</body></html>', encoding='utf-8', newline='\n')
print('built', len(out))
