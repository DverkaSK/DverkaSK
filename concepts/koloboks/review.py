"""Review a defringed kolobok: frame grid at 6x on GitHub dark bg + list of light pixels left on the outer edge."""
import sys
from collections import Counter
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
BG = (13, 17, 23)
SCRATCH = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE


def frames(path):
    im = Image.open(path)
    out = []
    for i in range(im.n_frames):
        im.seek(i)
        out.append(im.convert("RGBA"))
    return out


def suspects(f):
    """Opaque, light, greyish pixels touching transparency: what reads as a white halo on dark bg."""
    w, h = f.size
    p = f.load()
    hits = Counter()
    for y in range(h):
        for x in range(w):
            r, g, b, a = p[x, y]
            if a < 128:
                continue
            lum = .299 * r + .587 * g + .114 * b
            if lum < 110 or max(r, g, b) - min(r, g, b) > 70:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < w and 0 <= ny < h) or p[nx, ny][3] < 128:
                    hits[(r, g, b)] += 1
                    break
    return hits


def main(name):
    orig = frames(HERE / "src" / "Aiwan" / f"{name}.gif")
    fixed = frames(HERE / "fixed" / f"{name.replace('/', '__')}.png")
    total = Counter()
    for f in fixed:
        total += suspects(f)
    print(name, "frames", len(fixed), "edge suspects:", sum(total.values()), total.most_common(10))
    S, cols = 6, 8
    step = max(1, len(fixed) // 16)
    pick = list(range(0, len(fixed), step))[:16]
    w, h = fixed[0].size
    rows = (len(pick) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (w * S + 8), rows * 2 * (h * S + 8)), BG)
    for k, i in enumerate(pick):
        for j, src in enumerate((orig, fixed)):
            im = src[i].resize((w * S, h * S), Image.NEAREST)
            x = (k % cols) * (w * S + 8)
            y = ((k // cols) * 2 + j) * (h * S + 8)
            sheet.paste(im, (x, y), im)
    out = SCRATCH / f"review_{name.replace('/', '__')}.png"
    sheet.save(out)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1])
