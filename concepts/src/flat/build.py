import pathlib
head = pathlib.Path('head.html').read_text(encoding='utf-8')
js = '\n'.join(pathlib.Path(f).read_text(encoding='utf-8') for f in ['1-tex.js', '2-room.js', '5-chars3d.js', '3-mascot.js', '4-main.js'])
js = js.replace("/* ---- boot ---- */\nif (!window.THREE) { $('#boot').textContent = 'Не удалось загрузить three.js — обнови страницу.'; }\nelse {", "/* ---- boot ---- */\n{")
body = "if (!window.THREE) {\n  document.getElementById('boot').textContent = 'Не удалось загрузить three.js ни с одного CDN — обнови страницу.';\n} else {\n" + js + "\n}"
out = head + '\n<script>\n' + body + '\n</script>\n'
pathlib.Path('../sychevalnya.html').write_text(out, encoding='utf-8', newline='\n')
pathlib.Path('../flat-preview3.html').write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + out.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js') + '</body></html>', encoding='utf-8', newline='\n')
print('built', len(out))
