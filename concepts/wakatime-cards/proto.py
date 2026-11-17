"""Prototype: Languages card in two styles (A clean, B pixel), light + dark."""
import base64, io, json, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont

REPO = r'C:/Users/Admin/IdeaProjects/DverkaSK'
HERE = os.path.dirname(os.path.abspath(__file__))
W = 495

data = json.load(open(f'{REPO}/cards/wakatime.json', encoding='utf-8'))['all_time']
HIDE = {'Other', 'textmate', 'Text'}
langs = [l for l in data['languages'] if l['name'] not in HIDE][:8]
total_h = data['total_seconds'] / 3600
all_secs = sum(l['seconds'] for l in data['languages'] if l['name'] not in HIDE)

COLORS = {'Java': '#b07219', 'SQL': '#e38c00', 'YAML': '#cb171e', 'XML': '#0060ac', 'Markdown': '#083fa1',
          'Groovy': '#4298b8', 'JSON': '#8b949e', 'Python': '#3572A5', 'Kotlin': '#A97BFF', 'Go': '#00ADD8'}
ICONS = {'Java': f'{REPO}/icons/java.svg', 'SQL': f'{REPO}/icons/sql.svg', 'Python': f'{REPO}/icons/python.svg',
         'Kotlin': f'{REPO}/icons/kotlin.svg', 'Go': f'{REPO}/icons/go.svg'}
CHIPS = {'YAML': 'YML', 'XML': 'XML', 'Markdown': 'MD', 'JSON': '{ }', 'Groovy': 'GR', 'Gradle': 'GRD', 'HTML': 'HTM'}

THEMES = {
    'dark': dict(bg='#0d1117', bg2='#161b22', border='#30363d', title='#e6edf3', text='#c9d1d9', muted='#8b949e', track='#21262d'),
    'light': dict(bg='#ffffff', bg2='#f6f8fa', border='#d0d7de', title='#1f2328', text='#1f2328', muted='#656d76', track='#eaeef2'),
}


def glyph(name, x, y, size=18, pixel=False):
    if name in ICONS:
        return f'<image href="{icon(name)}" x="{x}" y="{y}" width="{size}" height="{size}"/>'
    c = COLORS.get(name, '#8b949e'); label = CHIPS.get(name, name[:2].upper())
    rx = 0 if pixel else 4
    fam = "'PS2P', monospace" if pixel else SANS
    fs = 5 if pixel else (7 if len(label) > 2 else 8)
    return (f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{rx}" fill="{c}"/>'
            f'<text x="{x + size / 2}" y="{y + size / 2 + fs * .36}" font-family="{fam}" font-size="{fs}" font-weight="700" fill="#fff" text-anchor="middle">{esc(label)}</text>')


def icon(name):
    raw = open(ICONS[name], 'rb').read()
    return 'data:image/svg+xml;base64,' + base64.b64encode(raw).decode()


def hours(s):
    return f'{int(s // 3600):,}h'


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;')


SANS = "-apple-system, 'Segoe UI', Ubuntu, 'Helvetica Neue', sans-serif"


# ---------- A: clean ----------
def card_a(t):
    top = langs[0]['seconds']
    row_h, y0 = 30, 70
    h = y0 + row_h * len(langs) + 6
    rows = []
    for i, l in enumerate(langs):
        y = y0 + i * row_h
        c = COLORS.get(l['name'], '#8b949e')
        share = l['seconds'] / all_secs * 100
        bw = max(4, 200 * l['seconds'] / top)
        rows.append(f'''
  <g class="row" style="animation-delay:{i * 70}ms">
    {glyph(l['name'], 20, y - 9)}
    <text x="48" y="{y + 4.5}" class="name">{esc(l['name'])}</text>
    <rect x="150" y="{y - 4}" width="200" height="8" rx="4" fill="{t['track']}"/>
    <rect class="bar" x="150" y="{y - 4}" width="{bw:.1f}" height="8" rx="4" fill="{c}" style="animation-delay:{150 + i * 70}ms"/>
    <text x="440" y="{y + 4.5}" class="val" text-anchor="end">{hours(l['seconds'])}</text>
    <text x="475" y="{y + 4.5}" class="pct" text-anchor="end">{share:.0f}%</text>
  </g>''')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}">
  <style>
    text {{ font-family: {SANS}; }}
    .name {{ font-size: 13px; fill: {t['text']}; font-weight: 500; }}
    .val {{ font-size: 12.5px; fill: {t['text']}; font-weight: 600; font-variant-numeric: tabular-nums; }}
    .pct {{ font-size: 11px; fill: {t['muted']}; font-variant-numeric: tabular-nums; }}
    .bar {{ transform-box: fill-box; transform-origin: left; animation: grow 1.1s cubic-bezier(.2,.8,.2,1) both; }}
    .row {{ animation: fade .5s ease-out both; }}
    @keyframes grow {{ from {{ transform: scaleX(0); }} }}
    @keyframes fade {{ from {{ opacity: 0; transform: translateY(4px); }} }}
    @media (prefers-reduced-motion: reduce) {{ .bar, .row {{ animation: none; }} }}
  </style>
  <defs><linearGradient id="acc" x1="0" x2="1"><stop offset="0" stop-color="#b07219"/><stop offset=".5" stop-color="#e38c00"/><stop offset="1" stop-color="#A97BFF"/></linearGradient>
  <clipPath id="clip"><rect width="{W}" height="{h}" rx="10"/></clipPath></defs>
  <g clip-path="url(#clip)">
    <rect width="{W}" height="{h}" fill="{t['bg']}"/>
    <rect width="{W}" height="3" fill="url(#acc)"/>
  </g>
  <rect x=".5" y=".5" width="{W - 1}" height="{h - 1}" rx="10" fill="none" stroke="{t['border']}"/>
  <text x="20" y="36" font-size="17" font-weight="700" fill="{t['title']}">Languages</text>
  <text x="{W - 20}" y="36" font-size="12" fill="{t['muted']}" text-anchor="end">{total_h:,.0f}h total · all time</text>
  <line x1="20" y1="50" x2="{W - 20}" y2="50" stroke="{t['border']}"/>{''.join(rows)}
</svg>
'''


# ---------- B: pixel ----------
def pixel_font(chars):
    f = TTFont(f'{HERE}/PressStart2P.ttf')
    opts = subset.Options(); opts.flavor = 'woff'; opts.layout_features = []
    s = subset.Subsetter(opts); s.populate(text=chars); s.subset(f)
    buf = io.BytesIO(); f.flavor = 'woff'; f.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def card_b(t, font64):
    top = langs[0]['seconds']
    row_h, y0 = 28, 72
    h = y0 + row_h * len(langs) + 8
    blocks, bx, bs, gap = 20, 150, 8, 2
    rows = []
    for i, l in enumerate(langs):
        y = y0 + i * row_h
        c = COLORS.get(l['name'], '#8b949e')
        n = max(1, round(blocks * l['seconds'] / top))
        segs = ''.join(
            f'<rect x="{bx + k * (bs + gap)}" y="{y - 8}" width="{bs}" height="{bs + 2}" fill="{c if k < n else t["track"]}"'
            + (f' class="seg" style="animation-delay:{200 + i * 60 + k * 35}ms"' if k < n else '') + '/>'
            for k in range(blocks))
        rows.append(f'''
  {glyph(l['name'], 20, y - 11, pixel=True)}
  <text x="46" y="{y + 1}" class="px">{esc(l['name'])}</text>
  {segs}
  <text x="{W - 20}" y="{y + 1}" class="px" text-anchor="end">{hours(l['seconds'])}</text>''')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" shape-rendering="crispEdges">
  <style>
    @font-face {{ font-family: 'PS2P'; src: url(data:font/woff;base64,{font64}) format('woff'); }}
    .px {{ font-family: 'PS2P', monospace; font-size: 8px; fill: {t['text']}; }}
    .ttl {{ font-family: 'PS2P', monospace; font-size: 12px; fill: {t['title']}; }}
    .sub {{ font-family: 'PS2P', monospace; font-size: 8px; fill: {t['muted']}; }}
    .seg {{ animation: pop .01s steps(1) both; }}
    @keyframes pop {{ from {{ opacity: 0; }} }}
    @media (prefers-reduced-motion: reduce) {{ .seg {{ animation: none; }} }}
  </style>
  <rect width="{W}" height="{h}" fill="{t['border']}"/>
  <rect x="2" y="2" width="{W - 4}" height="{h - 4}" fill="{t['bg']}"/>
  <rect x="2" y="2" width="{W - 4}" height="44" fill="{t['bg2']}"/>
  <rect x="2" y="46" width="{W - 4}" height="2" fill="{t['border']}"/>
  <text x="20" y="31" class="ttl">LANGUAGES</text>
  <text x="{W - 20}" y="30" class="sub" text-anchor="end">{total_h:,.0f}H TOTAL</text>{''.join(rows)}
</svg>
'''


chars = 'LANGUAGESTOH0123456789,h {}' + ''.join(l['name'] for l in langs) + ''.join(CHIPS.values())
font64 = pixel_font(''.join(sorted(set(chars))))
out = []
for th, t in THEMES.items():
    for name, svg in (('a', card_a(t)), ('b', card_b(t, font64))):
        p = f'{HERE}/lang-{name}-{th}.svg'
        open(p, 'w', encoding='utf-8').write(svg)
        out.append((name, th, os.path.getsize(p)))
print(out)
