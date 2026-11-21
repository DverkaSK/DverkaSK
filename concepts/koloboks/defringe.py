"""LOCAL EVALUATION ONLY: strip the white halo kolobok GIFs carry for light forum backgrounds.

The authors' licenses forbid editing/converting without permission, so outputs in fixed/ must not be
published until the author agrees. Writes animated PNG (full RGBA, keeps per-frame timing).

Halo model: an edge pixel P is the artist's anti-aliasing of a darker neighbour D into white,
P = a*D + (1-a)*white, with every channel agreeing on a. Such pixels become solid D (a >= HARD)
or vanish. Straight runs of identical edge pixels are drawn objects (keyboards, paper) and stay.

usage: python defringe.py all | <name> ...   (name relative to src/, without .gif)
"""
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
OUT = HERE / "fixed"

SPREAD = 0.2   # max disagreement between channels on the blend share
HARD = 0.42     # blend share at which the pixel is treated as outline
RUN = 4         # straight run of identical edge pixels that counts as a drawn object
PASSES = 6
THIN_SOLID = 0.25  # thin objects: light pixels darker than this share are drawing, not halo
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
N8 = N4 + ((1, 1), (1, -1), (-1, 1), (-1, -1))


def lum(c):
    return .299 * c[0] + .587 * c[1] + .114 * c[2]


def fit(px, d):
    """(blend share, channel spread) of dark colour d in px against white, or None."""
    al = []
    for v, o in zip(px[:3], d[:3]):
        if o > 235:
            if v < o - 12:
                return None
            continue
        al.append((255 - v) / (255 - o))
    if not al:
        return None
    return sum(al) / len(al), max(al) - min(al)


def share(px, d):
    """Blend share of dark colour d in px against white, or None if px is not on that line."""
    f = fit(px, d)
    return f[0] if f and f[1] <= SPREAD else None


def best_source(px, ds):
    """Darkest neighbour px is cleanly blended from (the real outline, not another halo pixel):
    (colour, share) or None."""
    best = None
    for d in ds:
        f = fit(px, d)
        if f and f[1] <= SPREAD and (best is None or lum(d) < lum(best[0])):
            best = (d[:3], f[0])
    return best


def object_runs(p, w, h, edge):
    """Edge pixels sitting in a straight run of >= RUN identical colours."""
    keep = set()
    for horiz in (True, False):
        outer, inner = (h, w) if horiz else (w, h)
        for o in range(outer):
            run = []
            for i in range(inner + 1):
                xy = (i, o) if horiz else (o, i)
                cur = p[xy][:3] if i < inner and xy in edge else None
                if run and cur is not None and cur == p[run[-1]][:3]:
                    run.append(xy)
                    continue
                if len(run) >= RUN:
                    keep.update(run)
                run = [xy] if cur is not None else []
    return keep


def thin_objects(p, w, h, clear):
    """Light edge pixels on a flat side of a thin drawn object (keyboard, plate): transparent on one side,
    a darker pixel on the other, and transparent again right behind it. Halo sits outside an outline
    that has a filled body behind it, so it never matches. Needs a straight run of >= 3 such pixels."""
    cand = set()
    for y in range(h):
        for x in range(w):
            if clear(x, y) or lum(p[x, y]) < 90:
                continue
            for dx, dy in N4:
                if clear(x - dx, y - dy) and not clear(x + dx, y + dy)                         and lum(p[x + dx, y + dy]) < lum(p[x, y]) - 25 and clear(x + 2 * dx, y + 2 * dy):
                    cand.add((x, y, abs(dx)))
                    break
    keep = set()
    for x, y, vertical_normal in cand:
        ds = [p[x + dx, y + dy] for dx, dy in N8 if not clear(x + dx, y + dy) and lum(p[x + dx, y + dy]) < lum(p[x, y]) - 25]
        src = best_source(p[x, y], ds)
        if src is None or src[1] >= THIN_SOLID:  # clearly grey/coloured part of a thin drawn object
            keep.add((x, y))
            continue
        # run along the flat side: perpendicular to the normal
        ax = (0, 1) if vertical_normal else (1, 0)
        n = 1 + sum(1 for k in (1, 2) if (x + ax[0] * k, y + ax[1] * k, vertical_normal) in cand)             + sum(1 for k in (1, 2) if (x - ax[0] * k, y - ax[1] * k, vertical_normal) in cand)
        if n >= 3:
            keep.add((x, y))
    return keep


def clean(frame):
    im = frame.copy()
    w, h = im.size
    p = im.load()

    def clear(x, y):
        return not (0 <= x < w and 0 <= y < h) or p[x, y][3] == 0

    edge0 = {(x, y) for y in range(h) for x in range(w)
             if p[x, y][3] and any(clear(x + dx, y + dy) for dx, dy in N4)}
    keep = object_runs(p, w, h, edge0) | thin_objects(p, w, h, clear)
    # near-white but not pure white is always forum anti-aliasing, even in straight runs
    keep = {xy for xy in keep if not (min(p[xy][:3]) >= 215 and p[xy][:3] != (255, 255, 255))}
    done = set()
    for _ in range(PASSES):
        hits = []
        for y in range(h):
            for x in range(w):
                if (x, y) in done or (x, y) in keep or not p[x, y][3]:
                    continue
                if not any(clear(x + dx, y + dy) or (x + dx, y + dy) in done for dx, dy in N4):
                    continue
                px = p[x, y]
                if lum(px) < 90:
                    continue
                ds = [p[x + dx, y + dy] for dx, dy in N8
                      if not clear(x + dx, y + dy) and (x + dx, y + dy) not in done]
                ds = [d for d in ds if lum(d) < lum(px) - 25]
                if not ds:
                    continue
                src = best_source(px, ds)
                if src is None or src[1] >= .97:
                    continue
                hits.append((x, y, src[0], src[1]))
        if not hits:
            break
        for x, y, d, a in hits:
            p[x, y] = (*d, 255) if a >= HARD else (0, 0, 0, 0)
            done.add((x, y))
    return im


def out_path(name):
    return OUT / f"{name}.png"


def run(name):
    try:
        src = Image.open(SRC / f"{name}.gif")
        frames, durs = [], []
        for i in range(getattr(src, "n_frames", 1)):
            src.seek(i)
            frames.append(clean(src.convert("RGBA")))
            durs.append(src.info.get("duration", 100) or 100)
        dst = out_path(name)
        dst.parent.mkdir(parents=True, exist_ok=True)
        frames[0].save(dst, save_all=True, append_images=frames[1:], duration=durs, loop=0, disposal=1, blend=0)
        return name, None
    except Exception as e:  # noqa: BLE001 - report and keep the batch going
        return name, repr(e)


def all_names():
    return sorted(str(p.relative_to(SRC).with_suffix("")).replace("\\", "/") for p in SRC.rglob("*.gif"))


if __name__ == "__main__":
    names = all_names() if sys.argv[1:] == ["all"] else sys.argv[1:]
    with Pool() as pool:
        for name, err in pool.imap_unordered(run, names, chunksize=8):
            if err:
                print("FAIL", name, err)
    print("done", len(names))
