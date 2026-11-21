"""Playlist card: a cosy 2006-era MP3 player skin on the koloboks' 2x pixel grid.

Everything snaps to 2px "pixels" (crispEdges, Press Start 2P at 16px = its native 8px x2), so the UI
matches the kolobok sprites standing on its roof. Every element is real data or real player state.
Assets: assets/fonts (Press Start 2P subset, OFL) and assets/koloboks
(Smileys: Copyright (c) Aiwan. Kolobok Smiles - http://www.kolobok.us).
"""
import base64
import colorsys
import io
import random
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent / "assets"

W = 838
U = 2            # one sprite pixel
FS = 16          # Press Start 2P native 8px, doubled
LOOP = 60        # seconds the clock / seek bar run before looping

C = {}  # filled per card by palette()


# ---------- colour ----------
# One accent hue comes from the playing track's cover. Everything else is derived from it so the
# colours always agree: the chassis is that hue almost greyed out, the title bar is the hue itself,
# and the LCD glows in a harmonious partner hue (complement / split / triad, whichever reads best
# as a glowing phosphor). Lightness is tuned until text contrast passes WCAG thresholds.

FALLBACK_HUE = 24 / 360  # orange, for grey covers


def hx(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h % 1, max(0, min(1, l)), max(0, min(1, s)))
    return "#" + "".join(f"{round(c * 255):02x}" for c in (r, g, b))


def luminance(c):
    def ch(v):
        v = int(v, 16) / 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    return .2126 * ch(c[1:3]) + .7152 * ch(c[3:5]) + .0722 * ch(c[5:7])


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + .05) / (lb + .05)


def cover_hue(art):
    """Hue of the cover's most vivid frequent colour (saturation x brightness weighted buckets)."""
    if not art:
        return None
    im = Image.open(io.BytesIO(base64.b64decode(art.split(",", 1)[1]))).convert("RGB").resize((32, 32))
    buckets = {}
    for r, g, b in im.getdata():
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s < .25 or v < .2:
            continue
        w = s * v
        acc = buckets.setdefault(round(h * 18) % 18, [0, 0, 0, 0])
        acc[0] += w
        acc[1] += r * w
        acc[2] += g * w
        acc[3] += b * w
    if not buckets:
        return None
    w, r, g, b = max(buckets.values(), key=lambda a: a[0])
    return colorsys.rgb_to_hsv(r / w / 255, g / w / 255, b / w / 255)[0]


def hue_dist(a, b):
    d = abs(a - b) % 1
    return min(d, 1 - d)


def phosphor_score(h):
    """How nice a hue looks as glowing LCD text on near-black: amber, green, cyan, mint and pink glow;
    deep blue/violet sink into the dark and pure red reads as an error."""
    deg = h * 360 % 360
    return -min(min(abs(deg - g), 360 - abs(deg - g)) for g in (45, 120, 150, 180, 330))


def palette(tracks):
    hues = [cover_hue(t.get("art")) for t in tracks]
    a = next((h for h in hues if h is not None), FALLBACK_HUE)
    # partner hue: a harmonic offset from the accent; prefer one another cover in the list
    # actually has, then the one that glows best
    others = [h for h in hues[1:] if h is not None]

    def score(off):
        h = (a + off) % 1
        # glow quality first; a partner that another cover really has earns a 20 degree bonus
        return phosphor_score(h) + (20 if any(hue_dist(h, o) < 1 / 18 for o in others) else 0)
    p = (a + max((.5, .5 - 1 / 12, .5 + 1 / 12, 1 / 3, -1 / 3), key=score)) % 1

    c = dict(ink=hx(a, .3, .035))
    # chassis: the accent hue nearly greyed out, so the whole skin is tinted but calm
    c.update(chassis=hx(a, .13, .195), chassis2=hx(a, .13, .178), hi=hx(a, .14, .34), lo=hx(a, .16, .10),
             face=hx(a, .13, .245), btn_ico=hx(a, .2, .86))
    # title bar: the accent itself, lightness raised until the dark caption is clearly readable
    title_txt = hx(a, .85, .07)
    l = .5
    while contrast(hx(a, .92, l), title_txt) < 5 and l < .72:
        l += .01
    c.update(title_a=hx(a, .95, l + .07), title_b=hx(a, .92, l), title_c=hx(a, .9, l - .08),
             title_txt=title_txt, title_dim=hx(a, .85, .24), cur_txt=title_txt)
    c["cur_bg"] = c["title_b"]
    # LCD: partner-hue phosphor on deep tinted glass of the same hue (dark teal, dark amber...),
    # text contrast checked against the brightest (backlit) top of the glass
    lcd = hx(p, .6, .075)
    lt = .62
    while contrast(hx(p, .95, lt), hx(p, .6, .12)) < 7 and lt < .88:
        lt += .01
    c.update(lcd=lcd, lcd_ghost=hx(p, .55, .13), lcd_txt=hx(p, .95, lt), lcd_dim=hx(p, .7, lt - .2),
             list_bg=hx(p, .55, .065), list_alt=hx(p, .55, .088), list_txt=hx(p, .85, lt - .04),
             backlight=hx(p, .9, .7))
    # equalizer: phosphor at the bottom flowing into the accent at the top, along the brighter side
    # of the colour wheel so the middle never turns muddy
    c["eq"] = eq_ramp(p, a)
    c["peak"] = hx(a, .95, .86)
    c["hue_a"], c["hue_p"] = a, p
    return c


KOLOBOK_HUE = 50 / 360        # Aiwan's yellow
BODY_HUES = (25 / 360, 70 / 360)  # body, shading and outline; mouth and pupils (dark red, <25) stay


# Soft "candy" colours the koloboks can wear: (hue in degrees, saturation factor, lightness lift).
PASTELS = {
    "peach": (20, .9, .42), "apricot": (34, .92, .38), "strawberry": (350, .85, .44), "rose": (330, .8, .46),
    "lilac": (292, .72, .48), "lavender": (262, .78, .5), "baby blue": (210, .85, .46), "sky": (192, .85, .42),
    "mint": (155, .78, .44), "pistachio": (92, .72, .4),
}


def kolobok_colors(tracks, a, p, n=2):
    """Each kolobok's own pastel. Not taken from the card palette: drawn from PASTELS, preferring ones at
    least 40 degrees from both card hues and from each other so every kolobok stands out. Seeded by the
    track list, so one card always gets the same koloboks."""
    rnd = random.Random("|".join(str(t.get("id")) for t in tracks))
    pool = list(PASTELS.values())
    rnd.shuffle(pool)
    chosen = []
    for _ in range(n):
        def gap(c):
            return min(hue_dist(c[0] / 360, o) for o in (a, p, *(x[0] / 360 for x in chosen)))
        pick = next((c for c in pool if c not in chosen and gap(c) >= 1 / 9), None) or \
            max((c for c in pool if c not in chosen), key=gap)
        chosen.append(pick)
    return chosen


def recolor_kolobok(path, pastel, white_phones=False):
    """APNG bytes of a kolobok sprite dressed in `pastel` (see PASTELS): every yellow/orange/brown pixel
    is hue-rotated, its saturation softened and the body lightened, so it reads like candy while the
    drawn shading and the (now muted) outline stay in place.
    white_phones: the grey headphone pixels (band and ear cups, not the eyes) become light grey to white."""
    deg, soft, lift = pastel
    src = Image.open(path)
    shift = deg / 360 - KOLOBOK_HUE
    frames, durs = [], []
    for i in range(src.n_frames):
        src.seek(i)
        f = src.convert("RGBA")
        px = f.load()
        for y in range(f.height):
            for x in range(f.width):
                r, g, b, al = px[x, y]
                if not al:
                    continue
                if max(r, g, b) - min(r, g, b) <= 12:
                    if white_phones and (r, g, b) != (255, 255, 255) and not (8 <= x <= 19 and y >= 9):
                        k = min(1, (r + g + b) / 3 / 113)  # 0 = black plastic, 1 = lightest grey
                        v = round(255 * (.6 + .4 * k))
                        px[x, y] = (v, v, v, al)
                    continue
                h, l, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
                if sat < .15 or not BODY_HUES[0] <= h <= BODY_HUES[1]:
                    continue
                if l > .35:  # body and highlights: lighter and softer
                    l, sat = l + (1 - l) * lift, sat * soft
                else:        # outline: keeps its darkness, only the tint is muted
                    sat = sat * soft * .8
                rr, gg, bb = colorsys.hls_to_rgb((h + shift) % 1, l, sat)
                px[x, y] = (round(rr * 255), round(gg * 255), round(bb * 255), al)
        frames.append(f)
        durs.append(src.info.get("duration", 100))
    buf = io.BytesIO()
    frames[0].save(buf, "PNG", save_all=True, append_images=frames[1:], duration=durs, loop=0, disposal=1, blend=0)
    return buf.getvalue()


def eq_ramp(p, a, n=14):
    d = (a - p) % 1
    delta = max((d, d - 1), key=lambda dd: luminance(hx(p + dd / 2, .95, .58)))
    return [hx(p + delta * k / (n - 1), .95, .6 + .04 * k / (n - 1)) for k in range(n)]


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


def sprite(name, cx, base_y, data=None):
    path = ASSETS / "koloboks" / f"{name}.png"
    im = Image.open(io.BytesIO(data) if data else path)
    low = 0
    for i in range(im.n_frames):
        im.seek(i)
        box = im.convert("RGBA").getchannel("A").getbbox()
        if box:
            low = max(low, box[3])
    w, h = im.size
    data = base64.b64encode(data or path.read_bytes()).decode()
    return (f'<image x="{cx - w * U // 2}" y="{base_y - low * U}" width="{w * U}" height="{h * U}" '
            f'style="image-rendering:pixelated" href="data:image/png;base64,{data}"/>')


def font_face():
    b64 = base64.b64encode((ASSETS / "fonts" / "PressStart2P-subset.woff").read_bytes()).decode()
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


def marquee(key, x, y, w, h, pad, base, label, fill, css, defs):
    """A line of text in the box (x, y, w, h): stands still when it fits, otherwise scrolls one character
    per step like an old LCD, copies back to back so the box is never empty. `base`: baseline offset."""
    defs.append(f'<clipPath id="clip-{key}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>')
    if len(label) * FS <= w - 2 * pad:
        return text(x + pad, y + base, label, fill)
    line = label + "  *  "
    span = len(line) * FS
    css.append(f".mq-{key} {{ animation: mq-{key} {len(line) * .2:.2f}s steps({len(line)}) infinite; }}"
               f" @keyframes mq-{key} {{ to {{ transform: translateX(-{span}px); }} }}")
    copies = -(-w // span) + 1
    run = "".join(text(x + pad + k * span, y + base, line, fill) for k in range(copies))
    return f'<g clip-path="url(#clip-{key})"><g class="mq-{key}">{run}</g></g>'


def backlight(x, y, w, h, strength=.1):
    """LCD backlight: the glass glows brightest at the top and fades out downwards in 2px bands."""
    span = round(h * .7) // U
    return "".join(rect(x + 4, y + 4 + k * U, w - 8, U, C["backlight"], f' fill-opacity="{strength * (1 - k / span):.3f}"')
                   for k in range(span))


def scanlines(x, y, w, h):
    return "".join(rect(x + 4, yy, w - 8, U, "#000", ' fill-opacity=".22"') for yy in range(y + 4, y + h - 4, 4))


SHUFFLE = ("........#.",
           "##.....###",
           "..#...#.#.",
           "...#.#....",
           "....#.....",
           "...#.#....",
           "..#...#.#.",
           "##.....###",
           "........#.")
REPEAT = ("......#...",
          "########..",
          "#.....#...",
          "#.........",
          "#........#",
          ".........#",
          "...#.....#",
          "..########",
          "...#......")


def pixels(art, x, y, fill):
    """Pixel-art icon from rows of '#' and '.', one char = one 2px sprite pixel."""
    d = "".join(f"M{x + c * U} {y + r * U}h{U}v{U}h-{U}z" for r, row in enumerate(art) for c, ch in enumerate(row) if ch == "#")
    return f'<path d="{d}" fill="{fill}"/>'


def eq(x, y, w, h, css, bars=16, frames=24, fps=10):
    """Spectrum analyser: crisp segment bars revealed by a sliding cover (segments never get squashed),
    falling peak caps, and one shared groove (kick on every beat, hi-hats on the off-beats, lows louder
    than highs). All bars share one loop, so they move together like real music."""
    pitch, seg, bw = 6, 4, 8
    top, base = y + 10, y + h - 8
    n = (base - top) // pitch
    gap = (w - 20 - bars * bw) / (bars - 1)
    rnd = random.Random(7)
    out = ""
    for i in range(bars):
        bx = round(x + 10 + i * (bw + gap))
        band = i / (bars - 1)  # 0 = bass, 1 = treble
        lvl, levels = n * .4, []
        for f in range(frames):
            target = n * (.85 - .45 * band) * rnd.uniform(.55, 1)
            if f % 6 == 0 and band < .4:
                target = n * rnd.uniform(.85, 1)
            if f % 6 == 3 and band > .6:
                target = n * rnd.uniform(.6, .8)
            lvl = target if target > lvl else lvl - n * .14  # jump up fast, fall back slowly
            levels.append(max(1, min(n, round(lvl))))
        peaks, pk, hold = [], 0, 0
        for v in levels:
            if v >= pk:
                pk, hold = v, 2
            elif hold:
                hold -= 1
            else:
                pk = max(v, pk - 1)
            peaks.append(min(pk, n - 1))
        ramp = C["eq"]
        out += "".join(rect(bx, base - (k + 1) * pitch + (pitch - seg), bw, seg, ramp[min(k * len(ramp) // n, len(ramp) - 1)])
                       for k in range(n))
        cover_top = base - n * pitch
        kf = " ".join(f"{100 * f / frames:.3f}% {{ transform: scaleY({(n - v) / n:.4f}); }}" for f, v in enumerate(levels))
        pkf = " ".join(f"{100 * f / frames:.3f}% {{ transform: translateY({-v * pitch}px); }}" for f, v in enumerate(peaks))
        css.append(f".q{i} {{ transform-origin: 0 {cover_top}px; animation: q{i} {frames / fps}s steps(1) infinite; }}"
                   f" @keyframes q{i} {{ {kf} }}"
                   f" .k{i} {{ animation: k{i} {frames / fps}s steps(1) infinite; }} @keyframes k{i} {{ {pkf} }}")
        out += f'<g class="q{i}">{rect(bx - 1, cover_top, bw + 2, n * pitch, C["lcd"])}</g>'
        # peak cap: segment index v (just above the lit bar), drawn at index 0 and lifted v pitches
        out += f'<g class="k{i}">{rect(bx, base - pitch + (pitch - seg), bw, seg, C["peak"])}</g>'
    return out


# ---------- card ----------

def card_svg(tracks, playlist, dark=True):
    """The player for `tracks` (the first one is playing) from the playlist named `playlist`.
    `dark`: page theme it sits on; only the listener's headphones change (white on dark, black on light)."""

    C.clear()
    C.update(palette(tracks))
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
    parts.append(text(tx + 12, ty + 23, playlist, C["title_txt"]))
    sub_x = tx + 12 + (len(playlist) + 1) * FS
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
    lcd_line = marquee("lcd", lx + 12, dy + 10, lw - 24, 22, 2, 18, f"{artist(now)} - {now['title']}",
                       C["lcd_txt"], css, defs)
    parts.append(f'<g filter="url(#glow)">{lcd_line}</g>')
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
    parts.append(f'<g filter="url(#glow)">{text(ix, clk_y, "/ " + mmss(dur), C["lcd_dim"])}</g>')
    parts.append(backlight(lx, dy, lw, disp_h) + scanlines(lx, dy, lw, disp_h) + glare(lx, dy, lw, disp_h))

    sx = lx + lw + 8
    sw = W - P - sx
    parts.append(bevel(sx, dy, sw, disp_h, C["lcd"], up=False))
    parts.append(eq(sx, dy, sw, disp_h, css))
    parts.append(backlight(sx, dy, sw, disp_h) + scanlines(sx, dy, sw, disp_h) + glare(sx, dy, sw, disp_h))

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
    # mode toggles, both pressed and lit: the card shows 5 random tracks of an "on repeat" playlist
    for i, art in enumerate((SHUFFLE, REPEAT)):
        bx = P + 5 * 52 + 12 + i * 52
        parts.append(bevel(bx, cy, 46, ctl_h, C["face"], up=False))
        parts.append(pixels(art, bx + 13, cy + 11, C["title_b"]))
    kx = P + 7 * 52 + 22
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
        elif i % 2 == 0:  # zebra rows, like playlists of the era
            parts.append(rect(P + 6, ry, W - 2 * P - 12, row_h, C["list_alt"]))
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
        name_w = W - P - 14 - 5 * FS - 12 - (P + 90)  # up to the widest duration ("10:00")
        parts.append(marquee(f"row{i}", P + 90, ry, name_w, row_h, 2, 30, f"{artist(t)} - {t['title']}", col, css, defs))
        parts.append(text(W - P - 14, ry + 30, mmss(t["durationMs"] / 1000), col, "end"))

    parts.append(backlight(P, py, W - 2 * P, list_h, .06))

    # koloboks on the roof: the listener over the LCD, the dancer over the spectrum he dances to
    h_music, h_dance = kolobok_colors(tracks, C["hue_a"], C["hue_p"])
    parts.append(sprite("music", lx + 150, y0 + 2, recolor_kolobok(ASSETS / "koloboks" / "music.png", h_music, white_phones=dark)))
    parts.append(sprite("dance", sx + sw // 2, y0 + 2, recolor_kolobok(ASSETS / "koloboks" / "dance.png", h_dance)))

    H = y0 + body_h
    style = ("<style>" + font_face() + " " + " ".join(css) +
             " @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }</style>")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
            f'shape-rendering="crispEdges"><title>{esc(playlist)}</title>{style}<defs>{"".join(defs)}</defs>{"".join(parts)}</svg>\n')
