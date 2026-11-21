"""Prototype: playlist card as a cosy 2006-era MP3 player skin, on the koloboks' 2x pixel grid.

Everything snaps to 2px "pixels" (crispEdges, Press Start 2P at 16px = its native 8px x2), so the UI
matches the kolobok sprites standing on its roof. Every element is real data or real player state:
no filler counters, no fake bitrate.
Output: player-dark.svg + preview-player.html (GitHub dark and light backgrounds).
"""
import base64
import html
import json
import random
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FIXED = HERE / "fixed" / "Aiwan"
FONT = HERE / "fonts" / "PressStart2P-Regular.ttf"

W = 838
U = 2            # one sprite pixel
FS = 16          # Press Start 2P native 8px, doubled
sys.path.insert(0, str(ROOT / "scripts"))
from yandex_playlist import CACHE, TITLE as PLAYLIST, TRACKS  # noqa: E402  same source as the real card

LOOP = 60        # seconds the clock / seek bar run before looping

C = dict(
    ink="#07080c", chassis="#2b2e39", chassis2="#272a34", hi="#596075", lo="#15171e", face="#363b48",
    title_a="#ff8a2a", title_b="#ff6a00", title_c="#d95400", title_txt="#1c0b00", title_dim="#6e2c00",
    lcd="#061209", lcd_ghost="#0f2716", lcd_txt="#8cff74", lcd_dim="#4fae48",
    list_bg="#04090a", list_txt="#74e862", cur_bg="#ff6a00", cur_txt="#1c0b00",
    bar_a="#7dff6a", bar_b="#ffd21a", bar_c="#ff5a1a", btn_ico="#d9dde6",
)


# ---------- primitives ----------

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def mmss(sec):
    sec = round(sec)
    return f"{sec // 60}:{sec % 60:02d}"


def rect(x, y, w, h, fill, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"{extra}/>'


def stepped(x, y, w, h, steps, fill):
    """Rectangle with pixel-stepped (rounded) corners: `steps` 2px stairs per corner, clockwise."""
    s = steps * U
    pts = [(x, y + s)]
    for i in range(steps):
        pts += [(x + i * U, y + s - i * U), (x + (i + 1) * U, y + s - i * U)]
    pts += [(x + s, y), (x + w - s, y)]
    for i in range(steps):
        pts += [(x + w - s + i * U, y + i * U), (x + w - s + i * U, y + (i + 1) * U)]
    pts += [(x + w, y + s), (x + w, y + h - s)]
    for i in range(steps):
        pts += [(x + w - i * U, y + h - s + i * U), (x + w - (i + 1) * U, y + h - s + i * U)]
    pts += [(x + w - s, y + h), (x + s, y + h)]
    for i in range(steps):
        pts += [(x + s - i * U, y + h - i * U), (x + s - i * U, y + h - (i + 1) * U)]
    return f'<polygon points="{" ".join(f"{a},{b}" for a, b in pts)}" fill="{fill}"/>'


def bevel(x, y, w, h, face, up=True):
    """Raised (or sunken) panel: ink outline, 2px light top-left, 2px dark bottom-right."""
    a, b = (C["hi"], C["lo"]) if up else (C["lo"], C["hi"])
    x2, y2, w2, h2 = x + U, y + U, w - 2 * U, h - 2 * U
    return (rect(x, y, w, h, C["ink"]) + rect(x2, y2, w2, h2, b) + rect(x2, y2, w2 - U, h2 - U, a)
            + rect(x2 + U, y2 + U, w2 - 2 * U, h2 - 2 * U, face))


def text(x, y, s, fill, anchor="start", size=FS, extra=""):
    return (f'<text x="{x}" y="{y}" font-family="PS2P" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}"{extra}>{esc(s)}</text>')


def fit(s, n):
    return s if len(s) <= n else s[: n - 1].rstrip(" -,") + "…"


def sprite(name, cx, base_y):
    path = FIXED / f"{name}.png"
    im = Image.open(path)
    low = 0
    for i in range(im.n_frames):
        im.seek(i)
        box = im.convert("RGBA").getchannel("A").getbbox()
        if box:
            low = max(low, box[3])
    w, h = im.size
    data = base64.b64encode(path.read_bytes()).decode()
    return (f'<image x="{cx - w * U // 2}" y="{base_y - low * U}" width="{w * U}" height="{h * U}" '
            f'style="image-rendering:pixelated" href="data:image/png;base64,{data}"/>')


def font_face(chars):
    sub = HERE / "fonts" / "_subset.woff"
    txt = HERE / "fonts" / "_chars.txt"
    txt.write_text(chars, encoding="utf-8")
    subprocess.run([sys.executable, "-m", "fontTools.subset", str(FONT), f"--text-file={txt}",
                    "--flavor=woff", f"--output-file={sub}", "--layout-features=*"], check=True)
    b64 = base64.b64encode(sub.read_bytes()).decode()
    return f'@font-face {{ font-family: "PS2P"; src: url(data:font/woff;base64,{b64}) format("woff"); }}'


def glare(x, y, w, h):
    """Soft diagonal reflection on display glass, built from 2px stair steps."""
    out = ""
    for k in range(0, h - 8, U):
        x0 = x + 6 + round(w * .55) - k * 2
        if x0 < x + 6:
            break
        out += rect(x0, y + 4 + k, min(round(w * .22), x + w - 6 - x0), U, "#fff", ' fill-opacity=".035"')
    return out


def scanlines(x, y, w, h):
    return "".join(rect(x + 4, yy, w - 8, U, "#000", ' fill-opacity=".22"') for yy in range(y + 4, y + h - 4, 4))


# ---------- card ----------

def build(seed=None):
    rnd_pick = random.Random(seed)
    tracks = rnd_pick.sample(json.loads(Path(CACHE).read_text(encoding="utf-8")), TRACKS)
    now = tracks[0]
    dur = now["durationMs"] / 1000
    START = round(min(67, dur * .3))  # elapsed seconds of the playing track when the loop starts
    artist = lambda t: ", ".join(a["name"] for a in t["artists"])

    parts, css, defs = [], [], []
    roof = 56
    P = 8                         # inner padding of the chassis
    title_h, disp_h, ctl_h, row_h = 32, 104, 40, 44
    list_h = len(tracks) * row_h + 12
    body_h = P + title_h + 8 + disp_h + 8 + ctl_h + 8 + list_h + P
    y0 = roof

    # chassis: ink outline, bevel light/dark, brushed face; pixel-rounded corners
    parts.append(stepped(0, y0, W, body_h, 3, C["ink"]))
    parts.append(stepped(U, y0 + U, W - 2 * U, body_h - 2 * U, 2, C["lo"]))
    parts.append(stepped(U, y0 + U, W - 3 * U, body_h - 3 * U, 2, C["hi"]))
    parts.append(stepped(2 * U, y0 + 2 * U, W - 4 * U, body_h - 4 * U, 1, C["chassis"]))
    for yy in range(y0 + 8, y0 + body_h - 6, 4):  # faint brushed-metal lines
        parts.append(rect(6, yy, W - 12, U, C["chassis2"]))

    # title bar: orange bands, caption, grip stripes after it, pixel-drawn window buttons
    tx, ty, tw = P, y0 + P, W - 2 * P
    parts.append(rect(tx, ty, tw, title_h, C["ink"]))
    bands = [C["title_a"]] * 3 + [C["title_b"]] * 8 + [C["title_c"]] * 4
    for i, col in enumerate(bands):
        parts.append(rect(tx + U, ty + U + i * U, tw - 2 * U, U, col))
    parts.append(text(tx + 12, ty + 23, PLAYLIST, C["title_txt"]))
    sub_x = tx + 12 + (len(PLAYLIST) + 1) * FS
    parts.append(text(sub_x, ty + 23, "· Yandex Music", C["title_dim"]))
    gx0 = sub_x + (len("· Yandex Music") + 1) * FS
    gx1 = tx + tw - 3 * 26 - 14
    for yy in (ty + 10, ty + 15, ty + 20):  # grip lines like old skins, only in the empty part
        parts.append(rect(gx0, yy, gx1 - gx0, U, C["title_c"]) + rect(gx0, yy + U, gx1 - gx0, U, C["title_a"]))
    glyphs = {
        "min": "M5 13h10v2h-10z",
        "max": "M5 5h10v2h-10z M5 7h2v6h-2z M13 7h2v6h-2z M5 13h10v2h-10z",
        "close": ("M5 5h2v2h-2z M13 5h2v2h-2z M7 7h2v2h-2z M11 7h2v2h-2z M9 9h2v2h-2z"
                  " M7 11h2v2h-2z M11 11h2v2h-2z M5 13h2v2h-2z M13 13h2v2h-2z"),
    }
    for i, d in enumerate(glyphs.values()):
        bx = tx + tw - 26 * (3 - i) - 6
        parts.append(bevel(bx, ty + 5, 22, 22, C["face"]))
        parts.append(f'<path transform="translate({bx + 1} {ty + 6})" d="{d}" fill="{C["btn_ico"]}"/>')

    # display row: cover | LCD | spectrum
    dy = ty + title_h + 8
    parts.append(bevel(P, dy, disp_h, disp_h, C["ink"], up=False))
    parts.append(f'<image x="{P + 6}" y="{dy + 6}" width="{disp_h - 12}" height="{disp_h - 12}" '
                 f'preserveAspectRatio="xMidYMid slice" href="{now["art"]}"/>')

    lx = P + disp_h + 8
    lw = 470
    parts.append(bevel(lx, dy, lw, disp_h, C["lcd"], up=False))
    defs.append('<filter id="glow" x="-10%" y="-30%" width="120%" height="160%">'
                '<feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/>'
                '<feMergeNode in="SourceGraphic"/></feMerge></filter>')
    # marquee: "Artist - Title", one character per step like a real LCD
    label = f"{artist(now)} - {now['title']}"
    room = (lw - 28) // FS
    defs.append(f'<clipPath id="lcdclip"><rect x="{lx + 12}" y="{dy + 10}" width="{lw - 24}" height="22"/></clipPath>')
    if len(label) <= room:  # fits: stands still, like a real LCD with a short tag
        lcd_line = text(lx + 14, dy + 28, label, C["lcd_txt"])
    else:  # scrolls one character per step, copies back to back so the glass is never empty
        line = label + "  *  "
        span = len(line) * FS
        css.append(f".mq {{ animation: mq {len(line) * .2:.2f}s steps({len(line)}) infinite; }}"
                   f" @keyframes mq {{ to {{ transform: translateX(-{span}px); }} }}")
        copies = -(-(lw - 24) // span) + 1
        lcd_line = '<g class="mq">' + "".join(text(lx + 14 + k * span, dy + 28, line, C["lcd_txt"]) for k in range(copies)) + "</g>"
    parts.append(f'<g clip-path="url(#lcdclip)"><g filter="url(#glow)">{lcd_line}</g></g>')
    # clock: ghost segments + elapsed seconds ticking for real (one text per second, shown in turn)
    clk_y = dy + 80
    parts.append(text(lx + 14, clk_y, "88:88", C["lcd_ghost"], size=32))
    ticks = ""
    for k in range(LOOP):
        ticks += (f'<g class="tk" style="animation-delay:{k - LOOP}s">'
                  + text(lx + 14, clk_y, mmss(START + k).rjust(5, "0"), C["lcd_txt"], size=32) + "</g>")
    css.append(f".tk {{ opacity: 0; animation: tk {LOOP}s steps(1) infinite; }}"
               f" @keyframes tk {{ 0% {{ opacity: 1; }} {100 / LOOP - .02:.4f}% {{ opacity: 0; }} 100% {{ opacity: 0; }} }}")
    parts.append(f'<g filter="url(#glow)">{ticks}</g>')
    ix = lx + 14 + 5 * 32 + 22
    parts.append(f'<g filter="url(#glow)">{text(ix, clk_y - 22, "/ " + mmss(dur), C["lcd_dim"])}</g>')
    # mode lamps: both true for this card (5 random tracks from an "on repeat" playlist)
    parts.append(f'<g filter="url(#glow)">{text(ix, clk_y, "SHUFFLE", C["lcd_txt"], size=8)}'
                 f'{text(ix + 8 * 8 + 16, clk_y, "REPEAT", C["lcd_txt"], size=8)}</g>')
    parts.append(scanlines(lx, dy, lw, disp_h) + glare(lx, dy, lw, disp_h))

    sx = lx + lw + 8
    sw = W - P - sx
    parts.append(bevel(sx, dy, sw, disp_h, C["lcd"], up=False))
    nb, bw = 16, 10
    gap = (sw - 20 - nb * bw) / (nb - 1)
    base = dy + disp_h - 10
    rnd = random.Random(11)
    for i in range(nb):
        bx = round(sx + 10 + i * (bw + gap))
        top = 1 - i / nb * .45  # lows louder than highs, like real music
        hs = [round(rnd.uniform(.25, top), 2) for _ in range(8)]
        steps = " ".join(f"{k * 100 / 8:.1f}% {{ transform: scaleY({h}); }}" for k, h in enumerate(hs))
        css.append(f".b{i} {{ transform-origin: {bx}px {base}px; animation: b{i} {1.2 + rnd.random() * .5:.2f}s steps(1) infinite; }}"
                   f" @keyframes b{i} {{ {steps} }}")
        segs = ""
        for k, yy in enumerate(range(base - 4, dy + 12, -6)):
            col = C["bar_a"] if k < 8 else (C["bar_b"] if k < 11 else C["bar_c"])
            segs += rect(bx, yy, bw, 4, col)
        parts.append(f'<g class="b{i}">{segs}</g>')
    parts.append(scanlines(sx, dy, sw, disp_h) + glare(sx, dy, sw, disp_h))

    # controls: transport buttons + seek bar synced with the clock
    cy = dy + disp_h + 8
    icons = {
        "prev": "M0 4h4v16h-4z M20 4v16l-14-8z",
        "play": "M4 4v16l16-8z",
        "pause": "M4 4h5v16h-5z M13 4h5v16h-5z",
        "stop": "M4 4h16v16h-16z",
        "next": "M0 4v16l14-8z M16 4h4v16h-4z",
    }
    for i, (k, d) in enumerate(icons.items()):
        bx = P + i * 52
        parts.append(bevel(bx, cy, 46, ctl_h, C["face"], up=k != "play"))
        col = C["title_b"] if k == "play" else C["btn_ico"]
        parts.append(f'<path transform="translate({bx + 12} {cy + 8})" d="{d}" fill="{col}"/>')
    kx = P + 5 * 52 + 10
    kw = W - P - kx
    parts.append(bevel(kx, cy + 13, kw, 14, C["lcd"], up=False))
    inner = kw - 8
    f0 = round(inner * START / dur)
    run = round(inner * LOOP / dur)
    css.append(f".fill {{ transform-origin: {kx + 4}px 0; animation: fill {LOOP}s steps({LOOP}) infinite; }}"
               f" @keyframes fill {{ to {{ transform: scaleX({(f0 + run) / f0:.4f}); }} }}")
    css.append(f".knob {{ animation: knob {LOOP}s steps({LOOP}) infinite; }}"
               f" @keyframes knob {{ to {{ transform: translateX({run}px); }} }}")
    parts.append(f'<g class="fill">{rect(kx + 4, cy + 17, f0, 6, C["title_b"])}</g>')
    parts.append(f'<g class="knob">{bevel(kx + 4 + f0 - 8, cy + 6, 16, 28, C["face"])}'
                 f'{rect(kx + 4 + f0 - 2, cy + 12, 4, 16, C["hi"])}</g>')

    # playlist
    py = cy + ctl_h + 8
    parts.append(bevel(P, py, W - 2 * P, list_h, C["list_bg"], up=False))
    for i, t in enumerate(tracks):
        ry = py + 6 + i * row_h
        cur = i == 0
        if cur:
            parts.append(rect(P + 6, ry, W - 2 * P - 12, row_h, C["cur_bg"]))
        col = C["cur_txt"] if cur else C["list_txt"]
        if cur:  # tiny bouncing level meter instead of the number
            for j, (dly, hgt) in enumerate(((0, 14), (.15, 10), (.3, 16))):
                bx = P + 16 + j * 6
                css.append(f".m{j} {{ transform-origin: {bx}px {ry + 32}px; animation: m{j} .6s steps(1) {dly}s infinite; }}"
                           f" @keyframes m{j} {{ 0% {{ transform: scaleY(1); }} 33% {{ transform: scaleY(.45); }} 66% {{ transform: scaleY(.75); }} }}")
                parts.append(f'<g class="m{j}">{rect(bx, ry + 32 - hgt, 4, hgt, C["cur_txt"])}</g>')
        else:
            parts.append(text(P + 16, ry + 30, f"{i + 1}", col))
        parts.append(rect(P + 42, ry + 4, 36, 36, C["ink"]) +
                     f'<image x="{P + 42}" y="{ry + 4}" width="36" height="36" preserveAspectRatio="xMidYMid slice" href="{t["art"]}"/>')
        parts.append(text(P + 92, ry + 30, fit(f"{artist(t)} - {t['title']}", 40), col))
        parts.append(text(W - P - 14, ry + 30, mmss(t["durationMs"] / 1000), col, "end"))

    # koloboks on the roof: the listener over the LCD, the dancer over the spectrum he dances to
    parts.append(sprite("light_skin/music", lx + 150, y0 + 2))
    parts.append(sprite("standart/dance", sx + sw // 2, y0 + 2))

    H = y0 + body_h
    shown = "".join(html.unescape(m) for m in re.findall(r">([^<]*)</text>", "".join(parts)))
    chars = "".join(sorted(set(shown + "0123456789:/.-—…·*")))
    style = ("<style>" + font_face(chars) + " " + " ".join(css) +
             " @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }</style>")
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
           f'shape-rendering="crispEdges">{style}<defs>{"".join(defs)}</defs>{"".join(parts)}</svg>')
    (HERE / "player-dark.svg").write_text(svg, encoding="utf-8")
    (HERE / "preview-player.html").write_text("""<!doctype html><meta charset="utf-8"><title>player preview</title>
<style>body{margin:0;font:16px/1.5 -apple-system,'Segoe UI',sans-serif}
section{padding:24px 0} .dark{background:#0d1117;color:#e6edf3} .light{background:#fff;color:#1f2328}
article{max-width:838px;margin:0 auto;padding:0 32px} p{margin:0 0 16px} img{max-width:100%} h3{text-align:center}
sub{color:#8d96a0} a{color:#4493f8}</style>
<section class="dark"><article><h3>📊 Coding stats</h3>
<p align="center"><a href="#"><img src="player-dark.svg"></a></p>
<p align="center"><sub>Smileys: Copyright © Aiwan. Kolobok Smiles — <a href="http://www.kolobok.us">kolobok.us</a></sub></p>
</article></section>
<section class="light"><article>
<p align="center"><a href="#"><img src="player-dark.svg"></a></p>
</article></section>""", encoding="utf-8")
    print("ok", W, H, len(svg) // 1024, "KB")


if __name__ == "__main__":
    build(int(sys.argv[1]) if len(sys.argv) > 1 else None)
