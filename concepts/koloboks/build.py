"""Prototype: ICQ-style koloboks living in the gaps between README cards."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent

OUTLINE = "#5c3a00"

DEFS = """
<defs>
  <radialGradient id="kb" cx=".38" cy=".32" r=".75">
    <stop offset="0" stop-color="#fff9b0"/><stop offset=".45" stop-color="#ffd92a"/><stop offset="1" stop-color="#f09a00"/>
  </radialGradient>
</defs>"""

STYLE = """
<style>
  .k-blink { animation: kblink 4s steps(1) infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes kblink { 0%,92%,100% { transform: scaleY(1); } 94% { transform: scaleY(.12); } }
  .k-swing { animation: kswing 1.4s steps(4) infinite alternate; }
  @keyframes kswing { from { transform: rotate(-9deg); } to { transform: rotate(9deg); } }
  .k-kick { animation: kkick .35s steps(2) infinite alternate; }
  @keyframes kkick { to { transform: translateY(-3px); } }
  .k-bob { animation: kbob .44s steps(2) infinite alternate; }
  @keyframes kbob { to { transform: translateY(-4px) rotate(-4deg); } }
  .k-type { animation: ktype .18s steps(2) infinite alternate; }
  @keyframes ktype { to { transform: translateY(-3px); } }
  .k-wave { animation: kwave .5s steps(2) infinite alternate; }
  @keyframes kwave { to { transform: rotate(-35deg); } }
  .k-dot { animation: kdot 1.2s steps(1) infinite; }
  @keyframes kdot { 0% { opacity: .25; } 33% { opacity: 1; } 66%,100% { opacity: .25; } }
  .k-note { animation: knote 2.4s steps(6) infinite; }
  @keyframes knote { from { transform: translate(0,0); opacity: 0; } 15% { opacity: 1; } to { transform: translate(14px,-30px); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>"""


def ball(cx, cy, r):
    hx, hy = cx - r * .36, cy - r * .48
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#kb)" stroke="{OUTLINE}" stroke-width="1.8"/>'
            f'<ellipse cx="{hx:.1f}" cy="{hy:.1f}" rx="{r * .34:.1f}" ry="{r * .17:.1f}" '
            f'fill="#fff" fill-opacity=".75" transform="rotate(-28 {hx:.1f} {hy:.1f})"/>')


def eyes(cx, cy, r, dy=-.15, ry=.18):
    out = '<g class="k-blink">'
    for s in (-1, 1):
        ex, ey = cx + s * r * .3, cy + r * dy
        out += (f'<ellipse cx="{ex:.1f}" cy="{ey:.1f}" rx="{r * .1:.1f}" ry="{r * ry:.1f}" fill="#1a1000"/>'
                f'<circle cx="{ex - r * .03:.1f}" cy="{ey - r * .07:.1f}" r="{r * .04:.1f}" fill="#fff"/>')
    return out + '</g>'


def hand(x, y, r=4.2):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffd92a" stroke="{OUTLINE}" stroke-width="1.5"/>'


def arm(d):
    return (f'<path d="{d}" fill="none" stroke="{OUTLINE}" stroke-width="6" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="#ffd92a" stroke-width="3" stroke-linecap="round"/>')


def place(content, x, edge, k=1.45):
    """Draw a character authored around anchor (50,60) and scale it about that anchor."""
    return (f'<svg x="{x - 50 * k:.1f}" y="{edge - 60 * k:.1f}" width="{100 * k:.1f}" height="{120 * k:.1f}" '
            f'viewBox="0 0 100 120" overflow="visible">{content}</svg>')


def foot(x, y):
    return f'<ellipse cx="{x}" cy="{y}" rx="5.5" ry="3.3" fill="#ff6a00" stroke="{OUTLINE}" stroke-width="1.4"/>'


def grin(cx, cy, r):
    return (f'<path d="M{cx - r * .5:.1f} {cy + r * .12:.1f} Q{cx} {cy + r * .85:.1f} {cx + r * .5:.1f} {cy + r * .12:.1f} Z" '
            f'fill="#7a1d00" stroke="{OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>'
            f'<path d="M{cx - r * .2:.1f} {cy + r * .5:.1f} Q{cx} {cy + r * .3:.1f} {cx + r * .2:.1f} {cy + r * .5:.1f}" fill="#ff6b6b"/>')


def typer(x, edge):
    """Peeks over a laptop lid sitting on the card's top edge; 'typing...' bubble."""
    r, cy = 17, edge - 17
    s = f'<g class="k-type" style="transform-origin:{x}px {edge}px">' + ball(x, cy, r) + eyes(x, cy, r, dy=-.12, ry=.13) + '</g>'
    s += (f'<rect x="{x - 22}" y="{edge - 14}" width="44" height="14" rx="3" fill="#cfd5dc" stroke="#4b5563" stroke-width="1.5"/>'
          f'<circle cx="{x}" cy="{edge - 7}" r="2.4" fill="#ff6a00"/>')
    s += f'<g class="k-type" style="animation-delay:.09s">{hand(x - 24, edge - 9)}</g><g class="k-type">{hand(x + 24, edge - 9)}</g>'
    bx, by = x - 84, edge - 42
    s += (f'<rect x="{bx}" y="{by}" width="50" height="22" rx="11" fill="#ffffff" stroke="#c9d1d9" stroke-width="1"/>'
          f'<path d="M{bx + 40} {by + 20} l10 6 l-3 -8 z" fill="#ffffff"/>')
    for i in range(3):
        s += f'<circle class="k-dot" style="animation-delay:{i * .4:.1f}s" cx="{bx + 14 + i * 11}" cy="{by + 11}" r="3.2" fill="#57606a"/>'
    return s


def hanger(x, edge):
    """Hangs from the card's bottom edge by both hands, swinging and kicking."""
    r, cy = 15, edge + 23
    s = f'<g class="k-swing" style="transform-origin:{x}px {edge}px">'
    s += arm(f'M{x - 9} {edge} L{x - 8} {cy - 8} M{x + 9} {edge} L{x + 8} {cy - 8}')
    s += f'<g class="k-kick">{foot(x - 7, cy + r + 1)}</g>'
    s += f'<g class="k-kick" style="animation-delay:.17s">{foot(x + 7, cy + r + 1)}</g>'
    s += ball(x, cy, r) + eyes(x, cy, r, dy=-.05) + grin(x, cy + 2, r * .9)
    s += '</g>'
    s += hand(x - 9, edge - 1, 4.6) + hand(x + 9, edge - 1, 4.6)
    return s


def listener(x, edge):
    """Stands on the card's top edge in headphones, bobbing and waving up at the hanger."""
    r, cy = 17, edge - 18
    s = ''
    for i, (nx, d) in enumerate(((x + 24, 0), (x + 30, 1.2))):
        s += (f'<g class="k-note" style="animation-delay:{d}s"><text x="{nx}" y="{edge - 10}" font-size="15" '
              f'font-family="Segoe UI Symbol, Arial" fill="#ff7a1a">{"♪♫"[i]}</text></g>')
    s += f'<g class="k-bob" style="transform-origin:{x}px {edge}px">'
    s += (f'<g class="k-wave" style="transform-origin:{x - 13}px {cy + 2}px">' +
          arm(f'M{x - 13} {cy + 2} L{x - 25} {cy - 14}') + hand(x - 26, cy - 16) + '</g>')
    s += ball(x, cy, r) + eyes(x, cy, r, dy=-.32, ry=.16)
    s += (f'<ellipse cx="{x}" cy="{cy + r * .38:.1f}" rx="{r * .17:.1f}" ry="{r * .22:.1f}" '
          f'fill="#7a1d00" stroke="{OUTLINE}" stroke-width="1.3"/>')
    s += (f'<path d="M{x - r - 1} {cy + 1} A{r + 2} {r + 2} 0 0 1 {x + r + 1} {cy + 1}" fill="none" stroke="#1f2328" stroke-width="3.2"/>'
          f'<rect x="{x - r - 5}" y="{cy - 4}" width="7" height="12" rx="3" fill="#ff6a00" stroke="#1f2328" stroke-width="1.6"/>'
          f'<rect x="{x + r - 2}" y="{cy - 4}" width="7" height="12" rx="3" fill="#ff6a00" stroke="#1f2328" stroke-width="1.6"/>')
    s += '</g>'
    s += foot(x - 7, edge - 1.5) + foot(x + 7, edge - 1.5)
    return s


def wrap(src, dst, top, bottom, extras):
    svg = (ROOT / "cards" / src).read_text(encoding="utf-8")
    m = re.match(r'<svg[^>]*width="(\d+)" height="(\d+)"[^>]*>', svg)
    w, h = int(m.group(1)), int(m.group(2))
    inner = svg.replace(m.group(0), f'<svg x="0" y="{top}" width="{w}" height="{h}" viewBox="0 0 {w} {h}">', 1)
    H = top + h + bottom
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{H}" viewBox="0 0 {w} {H}">'
           f'{STYLE}{DEFS}{inner}{extras(top, top + h)}</svg>')
    (OUT / dst).write_text(out, encoding="utf-8")


X = 600  # shared column so the two scenes line up across the gap
wrap("ai-models-dark.svg", "ai-models-dark.svg", 64, 66,
     lambda t, b: place(typer(50, 60), 740, t) + place(hanger(50, 60), X, b))
wrap("playlist-dark.svg", "playlist-dark.svg", 62, 6, lambda t, b: place(listener(50, 60), X, t))

(OUT / "preview.html").write_text("""<!doctype html><meta charset="utf-8"><title>koloboks preview</title>
<style>
body{background:#0d1117;margin:0;font:16px/1.5 -apple-system,'Segoe UI',sans-serif;color:#e6edf3}
article{max-width:838px;margin:40px auto;padding:0 32px}
p{margin:0 0 16px} img{max-width:100%}
h3{text-align:center}
</style>
<article>
<h3>📊 Coding stats</h3>
<p align="center"><a href="#"><img src="ai-models-dark.svg"></a></p>
<p align="center"><a href="#"><img src="playlist-dark.svg"></a></p>
</article>""", encoding="utf-8")
print("ok")
