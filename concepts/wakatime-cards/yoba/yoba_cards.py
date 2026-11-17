"""AI Coding card with the real YOBA face: (A) inside Apple-style rings, (B) as the circle with an 80% AI ring around it."""
import base64, io, math, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'vinyl'))
import rings as Rg  # reuses data, themes, ring() and grad()

W = Rg.W


def face_uri(name, px):
    im = Image.open(f'{HERE}/{name}.png').resize((px, px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


YOBA = face_uri('yoba', 128)


def frame(t, h, body, css, defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" font-family="{Rg.FONT}">
<style>{css}
@media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}</style><defs>{defs}</defs>
<rect x="0.5" y="0.5" width="{W - 1}" height="{h - 1}" rx="4.5" fill="{t['bg']}" stroke="{t['border']}"/>
<text x="20" y="32" fill="{t['title']}" font-size="18" font-weight="600">AI Coding</text>
<text x="{W - 20}" y="32" fill="{t['muted']}" font-size="12" text-anchor="end">last 7 days</text>{body}
</svg>
'''


BASE_CSS = '''
.arc { animation: draw 1.4s cubic-bezier(.3,.7,.2,1) both; }
@keyframes draw { from { stroke-dasharray: 0 999; } }
.row { animation: fade .5s ease-out both; }
@keyframes fade { from { opacity: 0; transform: translateY(4px); } }
.yoba { transform-box: fill-box; transform-origin: center; animation: pop .7s cubic-bezier(.3,1.6,.5,1) both .9s, laugh 2.4s ease-in-out 1.6s infinite; }
@keyframes pop { from { transform: scale(0) rotate(-90deg); } }
@keyframes laugh { 0%, 60%, 100% { transform: rotate(0); } 68% { transform: rotate(-7deg) translateY(-1px); } 76% { transform: rotate(6deg); } 84% { transform: rotate(-4deg) translateY(-1px); } 92% { transform: rotate(2deg); } }'''


# A — the Apple rings card, YOBA sitting in the middle of the rings
def card_a(theme):
    t, rc = Rg.THEMES[theme], Rg.RING[theme]
    h = 280
    cx, cy = 100, 134
    rr = [(76, 13), (60, 13), (44, 13)]
    total = Rg.AI + Rg.HU
    fr = [Rg.AI / total, Rg.HU / total, Rg.WEEK_H / Rg.WEEK_GOAL_H]
    defs = ''.join(Rg.grad(f'g{k}', rc[k], cx, cy, r) for k, (r, _) in enumerate(rr))
    rings = ''.join(Rg.ring(cx, cy, r, w, fr[k], rc[k], f'g{k}', k * .25) for k, (r, w) in enumerate(rr))
    ys = 64
    yoba = f'<image class="yoba" href="{YOBA}" x="{cx - ys / 2}" y="{cy - ys / 2}" width="{ys}" height="{ys}"/>'
    rows = [('AI lines', Rg.short(Rg.AI), f'{fr[0] * 100:.0f}% of changes'),
            ('Human lines', str(Rg.HU), f'{fr[1] * 100:.0f}% of changes'),
            ('Coding time', f'{Rg.WEEK_H:.0f}h', f'of a {Rg.WEEK_GOAL_H}h week')]
    lx = 204
    leg = ''.join(f'''<g class="row" style="animation-delay:{.3 + k * .15:.2f}s">
<text x="{lx}" y="{74 + k * 46}" fill="{t['text']}" font-size="12.5" font-weight="600">{lab}</text>
<text x="{lx}" y="{99 + k * 46}" fill="{rc[k][0]}" font-size="24" font-weight="800">{val}</text>
<text x="{lx + 10 + len(val) * 15}" y="{99 + k * 46}" fill="{t['muted']}" font-size="12">{sub}</text></g>''' for k, (lab, val, sub) in enumerate(rows))
    days = ''
    step = (W - 40) / 7
    dy = 256
    for k, d in enumerate(Rg.DAYS):
        x = 20 + step * k + step / 2
        f = d['seconds'] / 3600 / Rg.DAY_GOAL_H
        days += Rg.ring(x - 22, dy - 4, 11, 5, f, rc[2], 'gd', .6 + k * .06, .22) + \
            f'<text x="{x - 6}" y="{dy - 6}" fill="{t["text"]}" font-size="11.5" font-weight="700">{d["seconds"] / 3600:.1f}h</text>' + \
            f'<text x="{x - 6}" y="{dy + 8}" fill="{t["muted"]}" font-size="10" font-weight="600">{Rg.dt.date.fromisoformat(d["date"]).strftime("%a")}</text>'
    defs += f'<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{rc[2][0]}"/><stop offset="1" stop-color="{rc[2][1]}"/></linearGradient>'
    body = rings + yoba + leg + f'<line x1="20" y1="220" x2="{W - 20}" y2="220" stroke="{t["border"]}"/>' + days
    return frame(t, h, body, BASE_CSS, defs)


# B — YOBA is the circle; the AI share wraps around him as one thick ring, numbers on the right
def card_b(theme):
    t = Rg.THEMES[theme]
    h = 176
    cx, cy, R = 96, 102, 58
    ai = Rg.AI / (Rg.AI + Rg.HU)
    circ = 2 * math.pi * R
    AIc, HUc = '#3b82f6', '#10b981'
    track = '#30363d' if theme == 'dark' else '#d0d7de'
    ring = f'''<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{track}" stroke-width="11"/>
<circle class="arc" cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{HUc}" stroke-width="11" stroke-linecap="round" stroke-dasharray="{circ * (1 - ai) - 9:.1f} {circ:.1f}" stroke-dashoffset="{-circ * ai - 4.5:.1f}" transform="rotate(-90 {cx} {cy})"/>
<circle class="arc" cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{AIc}" stroke-width="11" stroke-linecap="round" stroke-dasharray="{circ * ai - 9:.1f} {circ:.1f}" stroke-dashoffset="-4.5" transform="rotate(-90 {cx} {cy})"/>'''
    ys = 2 * R - 22
    yoba = f'<image class="yoba" href="{YOBA}" x="{cx - ys / 2}" y="{cy - ys / 2}" width="{ys}" height="{ys}"/>'
    rx = 184
    right = f'''<g class="row" style="animation-delay:.3s">
<text x="{rx}" y="88" fill="{t['text']}" font-size="40" font-weight="800" letter-spacing="-1">{ai * 100:.0f}%<tspan font-size="14" font-weight="600" fill="{t['muted']}" letter-spacing="0"> of changed lines written by AI</tspan></text></g>
<g class="row" style="animation-delay:.45s">
<circle cx="{rx + 5}" cy="{118}" r="5" fill="{AIc}"/><text x="{rx + 16}" y="{123}" fill="{t['muted']}" font-size="13">AI lines <tspan fill="{t['text']}" font-weight="700" font-size="15">{Rg.short(Rg.AI)}</tspan></text>
<circle cx="{rx + 140}" cy="{118}" r="5" fill="{HUc}"/><text x="{rx + 151}" y="{123}" fill="{t['muted']}" font-size="13">Human lines <tspan fill="{t['text']}" font-weight="700" font-size="15">{Rg.HU}</tspan></text></g>
<text class="row" style="animation-delay:.6s" x="{rx}" y="150" fill="{t['muted']}" font-size="12">{Rg.WEEK_H:.0f}h of coding this week</text>'''
    return frame(t, h, ring + yoba + right, BASE_CSS)


for key, fn in (('a', card_a), ('b', card_b)):
    for th in Rg.THEMES:
        open(f'{HERE}/yoba-{key}-{th}.svg', 'w', encoding='utf-8').write(fn(th))
open(f'{HERE}/preview.html', 'w', encoding='utf-8').write(
    '<!doctype html><meta charset=utf-8><style>body{margin:0;font-family:Segoe UI;background:#e9ebef}'
    '.p{display:grid;grid-template-columns:1fr 1fr}h4{grid-column:1/3;margin:10px 20px 4px;color:#555}'
    '.l,.d{display:flex;justify-content:center;padding:20px}.l{background:#fff}.d{background:#0d1117}</style>'
    + ''.join(f'<div class="p"><h4>{lab}</h4><div class="l"><img src="yoba-{k}-light.svg"></div><div class="d"><img src="yoba-{k}-dark.svg"></div></div>'
              for k, lab in (('a', 'A · Йоба в кольцах Apple'), ('b', 'B · Йоба = круг, вокруг кольцо ИИ'))))
print({f: os.path.getsize(f'{HERE}/{f}') // 1024 for f in os.listdir(HERE) if f.endswith('-dark.svg')})
