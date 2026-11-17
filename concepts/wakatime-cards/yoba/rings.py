"""AI Coding card as Apple-Watch-style activity rings, in the same GitHub frame as the other cards."""
import datetime as dt, json, math, os

REPO = r'C:/Users/Admin/IdeaProjects/DverkaSK'
HERE = os.path.dirname(os.path.abspath(__file__))
W = 495
FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
THEMES = {
    'dark': dict(bg='#0d1117', border='#30363d', title='#58a6ff', text='#e6edf3', muted='#8b949e', box='#161b22'),
    'light': dict(bg='#ffffff', border='#d0d7de', title='#0969da', text='#1f2328', muted='#656d76', box='#f6f8fa'),
}
# Apple's ring colours: Move red, Exercise green, Stand cyan (slightly deeper on white)
RING = {'dark': [('#fa114f', '#ff5c8a'), ('#7ee000', '#b7ff3d'), ('#00d7e4', '#5ff6ff')],
        'light': [('#e3003d', '#ff3b6e'), ('#4cb200', '#79d61a'), ('#00a8c0', '#1fd2e6')]}
WEEK_GOAL_H, DAY_GOAL_H = 40, 8

wk = json.load(open(f'{REPO}/cards/wakatime.json', encoding='utf-8'))['week']
AI, HU = wk['ai_lines'], wk['human_lines']
DAYS = wk['days']
WEEK_H = sum(d['seconds'] for d in DAYS) / 3600


def short(n):
    return f'{n / 1000:.1f}K'.replace('.0K', 'K') if n >= 1000 else str(n)


def ring(cx, cy, r, width, frac, c, uid, delay=0, track_op=.2):
    """One activity ring: dim track, gradient arc from 12 o'clock, overlap lap drawn again on top past 100%."""
    circ = 2 * math.pi * r
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c[0]}" stroke-opacity="{track_op}" stroke-width="{width}"/>']
    laps = [min(frac, 1.0)] + ([frac - 1.0] if frac > 1 else [])
    for k, f in enumerate(laps):
        if f <= 0.002:
            continue
        out.append(f'<circle class="arc" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="url(#{uid})" stroke-width="{width}" stroke-linecap="round" '
                   f'stroke-dasharray="{circ * f:.2f} {circ:.2f}" transform="rotate(-90 {cx} {cy})" style="animation-delay:{delay + k * .9:.2f}s"/>')
    return ''.join(out)


def grad(uid, c, cx, cy, r):
    return (f'<linearGradient id="{uid}" gradientUnits="userSpaceOnUse" x1="{cx - r}" y1="{cy - r}" x2="{cx + r}" y2="{cy + r}">'
            f'<stop offset="0" stop-color="{c[0]}"/><stop offset="1" stop-color="{c[1]}"/></linearGradient>')


def card(theme):
    t = THEMES[theme]
    rc = RING[theme]
    h = 262
    cx, cy = 96, 116
    rr = [(64, 15), (46, 15), (28, 15)]
    total = AI + HU
    fr = [AI / total, HU / total, WEEK_H / WEEK_GOAL_H]
    defs = ''.join(grad(f'g{k}', rc[k], cx, cy, r) for k, (r, _) in enumerate(rr))
    rings = ''.join(ring(cx, cy, r, w, fr[k], rc[k], f'g{k}', k * .25) for k, (r, w) in enumerate(rr))
    # legend in Apple Activity style: label, big coloured value with unit
    rows = [('AI lines', short(AI), f'{fr[0] * 100:.0f}% of changes'),
            ('Human lines', str(HU), f'{fr[1] * 100:.0f}% of changes'),
            ('Coding time', f'{WEEK_H:.0f}h', f'of a {WEEK_GOAL_H}h week')]
    lx = 192
    leg = ''
    for k, (lab, val, sub) in enumerate(rows):
        y = 60 + k * 46
        leg += f'''<g class="row" style="animation-delay:{.3 + k * .15:.2f}s">
<text x="{lx}" y="{y}" fill="{t['text']}" font-size="12.5" font-weight="600">{lab}</text>
<text x="{lx}" y="{y + 25}" fill="{rc[k][0]}" font-size="24" font-weight="800" letter-spacing="-.3">{val}</text>
<text x="{lx + 10 + len(val) * 15}" y="{y + 25}" fill="{t['muted']}" font-size="12">{sub}</text></g>'''
    # the week: one small ring per day (hours vs an 8h day) — ring colours cycle like the watch's history view
    days = ''
    dx0, dy = 20, 236
    step = (W - 20 - dx0) / 7
    for k, d in enumerate(DAYS):
        x = dx0 + step * k + step / 2
        f = d['seconds'] / 3600 / DAY_GOAL_H
        wd = dt.date.fromisoformat(d['date']).strftime('%a')[0]
        days += ring(x - 22, dy - 4, 11, 5, f, rc[2], 'gd', .6 + k * .06, .22) +             f'<text x="{x - 6}" y="{dy - 6}" fill="{t["text"]}" font-size="11.5" font-weight="700">{d["seconds"] / 3600:.1f}h</text>' +             f'<text x="{x - 6}" y="{dy + 8}" fill="{t["muted"]}" font-size="10" font-weight="600">{dt.date.fromisoformat(d["date"]).strftime("%a")}</text>'
    defs += f'<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{rc[2][0]}"/><stop offset="1" stop-color="{rc[2][1]}"/></linearGradient>'
    css = '''
.arc { animation: draw 1.4s cubic-bezier(.3,.7,.2,1) both; }
@keyframes draw { from { stroke-dasharray: 0 999; } }
.row { animation: fade .5s ease-out both; }
@keyframes fade { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" font-family="{FONT}">
<style>{css}</style><defs>{defs}</defs>
<rect x="0.5" y="0.5" width="{W - 1}" height="{h - 1}" rx="4.5" fill="{t['bg']}" stroke="{t['border']}"/>
<text x="20" y="32" fill="{t['title']}" font-size="18" font-weight="600">AI Coding</text>
<text x="{W - 20}" y="32" fill="{t['muted']}" font-size="12" text-anchor="end">last 7 days</text>
{rings}

{leg}
<line x1="20" y1="200" x2="{W - 20}" y2="200" stroke="{t['border']}"/>
{days}
</svg>
'''


for th in THEMES:
    open(f'{HERE}/rings-{th}.svg', 'w', encoding='utf-8').write(card(th))
cur = lambda th: f'file:///{REPO}/cards/ai-coding-{th}.svg'
open(f'{HERE}/rings.html', 'w', encoding='utf-8').write(
    '<!doctype html><meta charset=utf-8><style>body{margin:0;font-family:Segoe UI;background:#e9ebef}'
    '.p{display:grid;grid-template-columns:1fr 1fr}h4{grid-column:1/3;margin:10px 20px 4px;color:#555}'
    '.l,.d{display:flex;justify-content:center;padding:20px}.l{background:#fff}.d{background:#0d1117}</style>'
    f'<div class="p"><h4>сейчас</h4><div class="l"><img src="{cur("light")}"></div><div class="d"><img src="{cur("dark")}"></div></div>'
    '<div class="p"><h4>кольца активности</h4><div class="l"><img src="rings-light.svg"></div><div class="d"><img src="rings-dark.svg"></div></div>')
print('week h', round(WEEK_H, 1))
