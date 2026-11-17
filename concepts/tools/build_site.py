"""Собирает сайт для хостинга из страницы артефакта (где ассеты комнаты вшиты base64).

    python build_site.py <index.html артефакта> <pc/index.html> <папка вывода>

На выходе: index.html без base64 (ассеты грузятся файлами assets/*.gz, их кеширует браузер),
assets/*.gz с обнулёнными неиспользуемыми анимациями моделей (mdlstrip), pc/index.html."""
import base64, json, os, re, shutil, sys, gzip
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mdlstrip

src_path, pc_path, out = sys.argv[1:4]
src = open(src_path, encoding='utf-8').read()
os.makedirs(os.path.join(out, 'assets'), exist_ok=True); os.makedirs(os.path.join(out, 'pc'), exist_ok=True)
a = src.index('const ASSETS = {'); b = src.index('\n};', a) + 3

def repl(m):
    key, body = m.group(1), m.group(2)
    items = re.findall(r'"[A-Za-z0-9+/=]+"|null', body)
    names = []
    for i, it in enumerate(items):
        if it == 'null': names.append('null'); continue
        name = f'assets/{key}{"_" + str(i) if body.lstrip().startswith("[") else ""}.gz'
        raw = gzip.decompress(base64.b64decode(it.strip('"')))
        stripped, _ = mdlstrip.strip(raw)
        open(os.path.join(out, name), 'wb').write(gzip.compress(stripped, 9))
        names.append(json.dumps(name))
    return f'  {key}: ' + (f'[{", ".join(names)}]' if body.lstrip().startswith('[') else names[0])

block = re.sub(r'^\s*([\w$]+):\s*(\[.*?\]|"[A-Za-z0-9+/=]+")', repl, src[a:b], flags=re.M | re.S)
site = src[:a] + block + src[b:]
g_old = re.search(r"async function gunzip\(b64\) \{.*?\n", site)
if g_old:
    site = site.replace(g_old.group(0), "async function gunzip(v) {\n"
        "  // на хостинге ассеты лежат файлами assets/*.gz (кешируются браузером), в артефакте — base64 прямо в странице\n"
        "  const body = v.startsWith('assets/') ? (await fetch(v)).body : new Blob([Uint8Array.from(atob(v), c => c.charCodeAt(0))]).stream();\n"
        "  return new Response(body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();\n}\n", 1)
# на заголовке артефакта-обёртки (<!doctype…<body>) хостингу не место — страница начинается со своего <title>
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(site)
shutil.copy(pc_path, os.path.join(out, 'pc', 'index.html'))
tot = sum(os.path.getsize(os.path.join(out, 'assets', f)) for f in os.listdir(os.path.join(out, 'assets')))
print(f'index.html {len(site) // 1024} KB, assets {tot // 1024} KB')
