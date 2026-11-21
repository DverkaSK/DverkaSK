"""Prototype: original Aiwan kolobok GIFs (unmodified, embedded as-is) sitting on README card roofs.

Smileys: Copyright (c) Aiwan. Kolobok Smiles - http://www.kolobok.us
"""
import base64
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SRC = OUT / "src" / "Aiwan"
SCALE = 2


def bottom_pad(path):
    """Transparent rows under the lowest opaque pixel across all frames, so the feet land on the edge."""
    im = Image.open(path)
    low = 0
    for i in range(im.n_frames):
        im.seek(i)
        box = im.convert("RGBA").getchannel("A").getbbox()
        if box:
            low = max(low, box[3])
    return im.size, im.size[1] - low


FIXED = OUT / "fixed"


def gif(name, cx, edge):
    fixed = FIXED / "Aiwan" / f"{name}.png"
    path = fixed if fixed.exists() else SRC / f"{name}.gif"
    mime = "png" if path.suffix == ".png" else "gif"
    (w, h), pad = bottom_pad(path)
    data = base64.b64encode(path.read_bytes()).decode()
    W, H = w * SCALE, h * SCALE
    return (f'<image x="{cx - W / 2:.0f}" y="{edge - H + pad * SCALE}" width="{W}" height="{H}" '
            f'style="image-rendering:pixelated" href="data:image/{mime};base64,{data}"/>')


def wrap(src, top, extras):
    svg = (ROOT / "cards" / src).read_text(encoding="utf-8")
    m = re.match(r'<svg[^>]*width="(\d+)" height="(\d+)"[^>]*>', svg)
    w, h = int(m.group(1)), int(m.group(2))
    inner = svg.replace(m.group(0), f'<svg x="0" y="{top}" width="{w}" height="{h}" viewBox="0 0 {w} {h}">', 1)
    H = top + h
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{H}" viewBox="0 0 {w} {H}">'
           f'{inner}{extras(top)}</svg>')
    (OUT / f"gif-{src}").write_text(out, encoding="utf-8")


wrap("ai-models-dark.svg", 56, lambda t: gif("light_skin/gamer1", 760, t))
wrap("playlist-dark.svg", 56, lambda t: gif("light_skin/music", 650, t) + gif("standart/dance", 720, t))

(OUT / "preview-gif.html").write_text("""<!doctype html><meta charset="utf-8"><title>koloboks preview</title>
<style>
body{background:#0d1117;margin:0;font:16px/1.5 -apple-system,'Segoe UI',sans-serif;color:#e6edf3}
article{max-width:838px;margin:40px auto;padding:0 32px}
p{margin:0 0 16px} img{max-width:100%} a{color:#4493f8}
h3{text-align:center} sub{color:#8d96a0}
</style>
<article>
<h3>📊 Coding stats</h3>
<p align="center"><a href="#"><img src="gif-ai-models-dark.svg"></a></p>
<p align="center"><a href="#"><img src="gif-playlist-dark.svg"></a></p>
<p align="center"><sub>Smileys: Copyright © Aiwan. Kolobok Smiles — <a href="http://www.kolobok.us">kolobok.us</a></sub></p>
</article>""", encoding="utf-8")
print("ok")
