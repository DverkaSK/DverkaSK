"""Highlight residual light edge pixels (magenta) on fixed frames: python hl.py OUT prefix [skip] [count]"""
import csv, sys
from PIL import Image
from audit import frames, BG
from defringe import N4, N8, lum, object_runs, thin_objects, out_path

out, prefix = sys.argv[1], sys.argv[2]
skip = int(sys.argv[3]) if len(sys.argv) > 3 else 0
cnt = int(sys.argv[4]) if len(sys.argv) > 4 else 24
rows = [x for x in csv.reader(open('audit.csv', encoding='utf-8'))][1:]
names = [x[0] for x in rows if x[0].startswith(prefix) and int(x[2]) > 0][skip:skip + cnt]
S = 4
tiles = []
for n in names:
    best = None
    for f in frames(out_path(n)):
        w, h = f.size
        p = f.load()
        clear = lambda x, y: not (0 <= x < w and 0 <= y < h) or p[x, y][3] == 0
        edge = {(x, y) for y in range(h) for x in range(w) if p[x, y][3] and any(clear(x + dx, y + dy) for dx, dy in N4)}
        keep = object_runs(p, w, h, edge) | thin_objects(p, w, h, clear)
        keep = {xy for xy in keep if not (min(p[xy][:3]) >= 215 and p[xy][:3] != (255, 255, 255))}
        bad = []
        for x, y in edge - keep:
            px = p[x, y]
            if lum(px) < 150 or max(px[:3]) - min(px[:3]) > 90:
                continue
            ds = [p[x + dx, y + dy] for dx, dy in N8 if not clear(x + dx, y + dy)]
            if ds and lum(min(ds, key=lum)) < lum(px) - 60:
                bad.append((x, y))
        if best is None or len(bad) > len(best[1]):
            best = (f, bad)
    f = best[0].copy()
    for x, y in best[1]:
        f.putpixel((x, y), (255, 0, 255, 255))
    tiles.append(f.resize((f.width * S, f.height * S), Image.NEAREST))
cw = max(t.width for t in tiles) + 8
ch = max(t.height for t in tiles) + 8
cols = 6
img = Image.new("RGB", (cw * cols, ch * ((len(tiles) + cols - 1) // cols)), BG)
for i, t in enumerate(tiles):
    img.paste(t, ((i % cols) * cw, (i // cols) * ch), t)
img.save(out)
print(len(names), names)
