import pathlib, base64
a = pathlib.Path('a-draw.js').read_text(encoding='utf-8')
# the scalloped hem: fill first, then ink on top
a = a.replace("  L(sc, 4); flat(sc.concat([[1262, 690], [378, 690]]), '#f3ecdd');", "  flat(sc.concat([[1262, 690], [378, 690]]), '#f3ecdd'); L(sc, 4);")
head = pathlib.Path('head.html').read_text(encoding='utf-8')
troll = 'data:image/png;base64,' + base64.b64encode(pathlib.Path('../trollface.png').read_bytes()).decode()
js = "const TROLL_PNG = '" + troll + "';\n" + a + '\n' + pathlib.Path('b-chars.js').read_text(encoding='utf-8') + '\n' + pathlib.Path('c-main.js').read_text(encoding='utf-8')
out = head + '\n<script>\n' + js + '\n</script>\n'
pathlib.Path('../masyanya.html').write_text(out, encoding='utf-8', newline='\n')
pathlib.Path('../masyanya-preview.html').write_text('<!doctype html><html><head><meta charset="utf-8"></head><body>' + out + '</body></html>', encoding='utf-8', newline='\n')
print('built', len(out))
