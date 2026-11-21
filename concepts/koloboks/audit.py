"""Audit defringed koloboks.

python audit.py stats              -> audit.csv: per file residual light edge pixels + share of erased pixels
python audit.py sheet OUT name...  -> sheet at 4x on GitHub dark bg: original row / fixed row, 4 frames each
"""
import csv
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image

from defringe import N4, N8, SRC, all_names, lum, object_runs, out_path, thin_objects

HERE = Path(__file__).resolve().parent
BG = (13, 17, 23)


def frames(path):
    im = Image.open(path)
    out = []
    for i in range(getattr(im, "n_frames", 1)):
        im.seek(i)
        out.append(im.convert("RGBA"))
    return out


def residual(f):
    """Light edge pixels clearly lighter than their darkest neighbour, outside protected objects."""
    w, h = f.size
    p = f.load()

    def clear(x, y):
        return not (0 <= x < w and 0 <= y < h) or p[x, y][3] == 0

    edge = {(x, y) for y in range(h) for x in range(w)
            if p[x, y][3] and any(clear(x + dx, y + dy) for dx, dy in N4)}
    keep = object_runs(p, w, h, edge) | thin_objects(p, w, h, clear)
    keep = {xy for xy in keep if not (min(p[xy][:3]) >= 215 and p[xy][:3] != (255, 255, 255))}
    bad = 0
    for x, y in edge - keep:
        px = p[x, y]
        if lum(px) < 150 or max(px[:3]) - min(px[:3]) > 90:
            continue
        ds = [p[x + dx, y + dy] for dx, dy in N8 if not clear(x + dx, y + dy)]
        if ds and lum(min(ds, key=lum)) < lum(px) - 60:
            bad += 1
    return bad


def opaque(f):
    return sum(1 for a in f.getchannel("A").getdata() if a)


def stat(name):
    try:
        o = frames(SRC / f"{name}.gif")
        x = frames(out_path(name))
        res = max(residual(f) for f in x)
        res0 = max(residual(f) for f in o)
        erased = 1 - sum(map(opaque, x)) / max(1, sum(map(opaque, o)))
        return name, res0, res, round(erased, 3)
    except Exception as e:  # noqa: BLE001
        return name, -1, -1, repr(e)


def stats():
    with Pool() as pool:
        rows = sorted(pool.map(stat, all_names(), chunksize=8), key=lambda r: (-r[2] if r[2] != -1 else 1e9))
    with open(HERE / "audit.csv", "w", newline="", encoding="utf-8") as fh:
        csv.writer(fh).writerows([("name", "edge_before", "edge_after", "erased")] + rows)
    worst = [r for r in rows if r[2] > 0]
    print("files", len(rows), "with residual", len(worst), "errors", sum(r[2] == -1 for r in rows))
    for r in rows[:25]:
        print(r)
    big = sorted((r for r in rows if isinstance(r[3], float)), key=lambda r: -r[3])[:15]
    print("most erased:")
    for r in big:
        print(r)


def sheet(out, names, S=4):
    tiles = []
    for n in names:
        o, x = frames(SRC / f"{n}.gif"), frames(out_path(n))
        pick = sorted({0, len(x) // 3, 2 * len(x) // 3, len(x) - 1})
        tiles.append([[src[i] for i in pick] for src in (o, x)])
    cw = max(t[0][0].width for t in tiles) * S + 6
    ch = max(t[0][0].height for t in tiles) * S + 6
    cols = 4 * 2  # two smileys per line, 4 frames each
    per = 2
    lines = (len(tiles) + per - 1) // per
    img = Image.new("RGB", (cw * cols, ch * 2 * lines), BG)
    for k, t in enumerate(tiles):
        for row, fr in enumerate(t):
            for j, f in enumerate(fr):
                f = f.resize((f.width * S, f.height * S), Image.NEAREST)
                img.paste(f, (((k % per) * 4 + j) * cw, ((k // per) * 2 + row) * ch), f)
    img.save(out)
    print(out)


if __name__ == "__main__":
    if sys.argv[1] == "stats":
        stats()
    else:
        sheet(sys.argv[2], sys.argv[3:])
