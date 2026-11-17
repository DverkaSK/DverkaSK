"""More Languages card variants: A2 (share bars), C (waffle), D (ring), E (IntelliJ code)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import proto as P  # reuses data, icons, glyph(); regenerates the first prototypes as a side effect

W, HERE, SANS, esc = P.W, P.HERE, P.SANS, P.esc
langs, all_secs, total_h = P.langs, P.all_secs, P.total_h
color = lambda n: P.COLORS.get(n, '#8b949e')
share = lambda l: l['seconds'] / all_secs * 100

BASE_CSS = f'''
    text {{ font-family: {SANS}; }}
    .name {{ font-size: 13px; font-weight: 500; }}
    .val {{ font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }}
    .pct {{ font-size: 11px; font-variant-numeric: tabular-nums; }}
    @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}'''


def shell(t, h, body, css='', title='Languages', sub=None):
    sub = sub or f'{total_h:,.0f}h total · all time'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}">
  <style>{BASE_CSS}
    .name, .val {{ fill: {t['text']}; }} .pct {{ fill: {t['muted']}; }}{css}
  </style>
  <defs><linearGradient id="acc" x1="0" x2="1"><stop offset="0" stop-color="#b07219"/><stop offset=".5" stop-color="#e38c00"/><stop offset="1" stop-color="#A97BFF"/></linearGradient>
  <clipPath id="clip"><rect width="{W}" height="{h}" rx="10"/></clipPath></defs>
  <g clip-path="url(#clip)"><rect width="{W}" height="{h}" fill="{t['bg']}"/><rect width="{W}" height="3" fill="url(#acc)"/></g>
  <rect x=".5" y=".5" width="{W - 1}" height="{h - 1}" rx="10" fill="none" stroke="{t['border']}"/>
  <text x="20" y="36" font-size="17" font-weight="700" fill="{t['title']}">{title}</text>
  <text x="{W - 20}" y="36" font-size="12" fill="{t['muted']}" text-anchor="end">{sub}</text>
  <line x1="20" y1="50" x2="{W - 20}" y2="50" stroke="{t['border']}"/>{body}
</svg>
'''


def side_list(x, y0, row_h, right=W - 20):
    out = []
    for i, l in enumerate(langs):
        y = y0 + i * row_h
        out.append(f'''
  <g class="li" style="animation-delay:{i * 60}ms">{P.glyph(l['name'], x, y - 8, 16)}
    <text x="{x + 24}" y="{y + 4}" class="name">{esc(l['name'])}</text>
    <text x="{right - 38}" y="{y + 4}" class="val" text-anchor="end">{P.hours(l['seconds'])}</text>
    <text x="{right}" y="{y + 4}" class="pct" text-anchor="end">{share(l):.0f}%</text></g>''')
    return ''.join(out)


LI_CSS = '''
    .li { animation: fade .5s ease-out both; }
    @keyframes fade { from { opacity: 0; transform: translateX(6px); } }'''


# A2: bars = share of all time, with quarter ticks
def card_a2(t):
    row_h, y0 = 30, 70
    h = y0 + row_h * len(langs) + 6
    rows = []
    for i, l in enumerate(langs):
        y = y0 + i * row_h
        bw = max(3, 200 * share(l) / 100)
        ticks = ''.join(f'<rect x="{150 + 200 * q / 4 - .5}" y="{y - 4}" width="1" height="8" fill="{t["bg"]}" opacity=".9"/>' for q in (1, 2, 3))
        rows.append(f'''
  <g>{P.glyph(l['name'], 20, y - 9)}
    <text x="48" y="{y + 4.5}" class="name">{esc(l['name'])}</text>
    <rect x="150" y="{y - 4}" width="200" height="8" rx="4" fill="{t['track']}"/>
    <rect class="bar" x="150" y="{y - 4}" width="{bw:.1f}" height="8" rx="4" fill="{color(l['name'])}" style="animation-delay:{150 + i * 70}ms"/>
    <text x="440" y="{y + 4.5}" class="val" text-anchor="end">{P.hours(l['seconds'])}</text>
    <text x="475" y="{y + 4.5}" class="pct" text-anchor="end">{share(l):.0f}%</text></g>''')
    css = '''
    .bar { transform-box: fill-box; transform-origin: left; animation: grow 1.1s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes grow { from { transform: scaleX(0); } }'''
    return shell(t, h, ''.join(rows), css)


# C: waffle 10x10, one square = 1%
def card_c(t):
    raw = [share(l) for l in langs]
    cells = [math.floor(v) for v in raw]
    for i in sorted(range(len(raw)), key=lambda i: -(raw[i] - cells[i]))[:max(0, round(sum(raw)) - sum(cells))]:
        cells[i] += 1
    cells = [max(1, c) for c in cells]
    seq = [color(l['name']) for l, c in zip(langs, cells) for _ in range(c)][:100]
    seq += [t['track']] * (100 - len(seq))
    cs, gap, gx, gy = 15, 3, 20, 66
    sq = []
    for k, c in enumerate(seq):
        col, row = k % 10, k // 10
        anim = f' class="sq" style="animation-delay:{k * 12}ms"' if c != t['track'] else ''
        sq.append(f'<rect x="{gx + col * (cs + gap)}" y="{gy + row * (cs + gap)}" width="{cs}" height="{cs}" rx="3" fill="{c}"{anim}/>')
    grid = 10 * (cs + gap) - gap
    h = gy + grid + 34
    body = ''.join(sq) + f'''
  <text x="{gx + grid / 2}" y="{gy + grid + 20}" font-size="10.5" fill="{t['muted']}" text-anchor="middle">1 square = 1% of time</text>''' \
        + side_list(gx + grid + 34, gy + 8, (grid - 2) / len(langs) + .2)
    css = LI_CSS + '''
    .sq { transform-box: fill-box; transform-origin: center; animation: pop .35s cubic-bezier(.3,1.6,.5,1) both; }
    @keyframes pop { from { transform: scale(0); } }'''
    return shell(t, h, body, css)


# D: ring
def card_d(t):
    cx, cy, r, sw = 100, 150, 66, 20
    circ = 2 * math.pi * r
    gap = 3
    segs, acc = [], 0
    for i, l in enumerate(langs):
        frac = share(l) / 100
        ln = max(1.2, circ * frac - gap)
        segs.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color(l["name"])}" stroke-width="{sw}" '
                    f'stroke-dasharray="{ln:.2f} {circ:.2f}" stroke-dashoffset="{-acc:.2f}" transform="rotate(-90 {cx} {cy})" '
                    f'class="seg" style="--len:{ln:.2f};animation-delay:{i * 90}ms"/>')
        acc += circ * frac
    rest = 1 - sum(share(l) for l in langs) / 100
    if rest > 0.002:
        segs.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{t["track"]}" stroke-width="{sw}" '
                    f'stroke-dasharray="{max(1, circ * rest - gap):.2f} {circ:.2f}" stroke-dashoffset="{-acc:.2f}" transform="rotate(-90 {cx} {cy})"/>')
    top = langs[0]
    center = f'''
  <text x="{cx}" y="{cy - 6}" font-size="24" font-weight="800" fill="{t['title']}" text-anchor="middle">{share(top):.0f}%</text>
  <text x="{cx}" y="{cy + 14}" font-size="12" fill="{t['muted']}" text-anchor="middle">{esc(top['name'])}</text>'''
    h = 260
    body = ''.join(segs) + center + side_list(200, 78, 23)
    css = LI_CSS + '''
    .seg { animation: draw .9s cubic-bezier(.3,.7,.3,1) both; }
    @keyframes draw { from { stroke-dasharray: 0 1000; } }'''
    return shell(t, h, body, css)


# E: IntelliJ editor with the data written as Java
def card_e(t):
    dark = t['bg'] == '#0d1117'
    c = dict(bg='#1e1f22', gut='#1e1f22', bar='#2b2d30', ln='#4b5059', txt='#bcbec4', kw='#cf8e6d', str='#6aab73',
             num='#2aacb8', com='#7a7e85', typ='#bcbec4', fn='#56a8f5', tab='#bcbec4', border='#393b40') if dark else \
        dict(bg='#ffffff', gut='#ffffff', bar='#f7f8fa', ln='#aeb3c2', txt='#080808', kw='#0033b3', str='#067d17',
             num='#1750eb', com='#8c8c8c', typ='#080808', fn='#00627a', tab='#080808', border='#ebecf0')
    mono = "'JetBrains Mono', Consolas, 'SF Mono', Menlo, monospace"
    name_w = max(len(l['name']) for l in langs) + 4
    bars = []
    lines = [
        f'<tspan fill="{c["com"]}">// {total_h:,.0f}h of coding since 2023, all time</tspan>',
        f'<tspan fill="{c["kw"]}">var</tspan> languages = <tspan fill="{c["typ"]}">Map</tspan>.<tspan fill="{c["fn"]}">of</tspan>(',
    ]
    for i, l in enumerate(langs):
        q = f'"{l["name"]}",'
        pad = ' ' * (name_w - len(q))
        hrs = f'{int(l["seconds"] // 3600)}'
        bar = ''
        comma = ',' if i < len(langs) - 1 else ''
        lines.append(f'    <tspan fill="{c["str"]}">{esc(q)}</tspan>{pad}<tspan fill="{c["fn"]}">hours</tspan>(<tspan fill="{c["num"]}">{hrs:>4}</tspan>){comma}'
                     f'{" " * (2 if comma else 3)}<tspan fill="{c["com"]}">// {share(l):>2.0f}%</tspan>')
        bars.append((i + 2, share(l), color(l['name'])))
    lines.append(');')
    lh, top = 19, 62
    h = top + lh * len(lines) + 14
    text = ''.join(
        f'<text x="20" y="{top + i * lh}" class="ln" text-anchor="end" style="animation-delay:{i * 90}ms">{i + 1}</text>'
        f'<text x="34" y="{top + i * lh}" class="code" style="animation-delay:{i * 90}ms" xml:space="preserve">{ln}</text>'
        for i, ln in enumerate(lines))
    caret_y = top + (len(lines) - 1) * lh
    bx = 34 + (4 + name_w + 12 + 9) * 7.22
    text += ''.join(f'<rect x="{bx:.1f}" y="{top + li * lh - 9}" width="{max(2, 70 * sh / 100):.1f}" height="9" rx="1.5" fill="{col}" class="cb" style="animation-delay:{li * 90}ms"/>' for li, sh, col in bars)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}">
  <style>
    .code, .ln, .tab {{ font-family: {mono}; font-size: 12px; }}
    .code {{ fill: {c['txt']}; animation: type .3s steps(1) both; }}
    .ln {{ fill: {c['ln']}; animation: type .3s steps(1) both; }} .cb {{ animation: type .3s steps(1) both; }}
    .caret {{ animation: blink 1s steps(1) infinite; animation-delay: {len(lines) * 90}ms; }}
    @keyframes type {{ from {{ opacity: 0; }} }}
    @keyframes blink {{ 50% {{ opacity: 0; }} }}
    @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}
  </style>
  <clipPath id="clip"><rect width="{W}" height="{h}" rx="10"/></clipPath>
  <g clip-path="url(#clip)">
    <rect width="{W}" height="{h}" fill="{c['bg']}"/>
    <rect width="{W}" height="36" fill="{c['bar']}"/>
    <rect x="12" y="6" width="150" height="30" rx="0" fill="{c['bg']}"/>
    <rect x="12" y="34" width="150" height="2" fill="#3574f0"/>
    {P.glyph('Java', 22, 13, 15)}
    <text x="44" y="25" class="tab" fill="{c['tab']}">Languages.java</text>
    <text x="148" y="25" class="tab" fill="{c['ln']}">×</text>
  </g>
  <rect x=".5" y=".5" width="{W - 1}" height="{h - 1}" rx="10" fill="none" stroke="{c['border']}"/>
  {text}
  <rect class="caret" x="{34 + 2 * 7.2}" y="{caret_y - 11}" width="1.6" height="14" fill="{c['txt']}"/>
</svg>
'''


for th, t in P.THEMES.items():
    for name, fn in (('a2', card_a2), ('c', card_c), ('d', card_d), ('e', card_e)):
        open(f'{HERE}/lang-{name}-{th}.svg', 'w', encoding='utf-8').write(fn(t))
names = ['a', 'a2', 'c', 'd', 'e']
labels = {'a': 'A · было', 'a2': 'A2 · доля от всего времени', 'c': 'C · вафля (1 квадрат = 1%)', 'd': 'D · кольцо', 'e': 'E · IntelliJ'}
col = lambda th, cls: f'<div class="c {cls}">' + ''.join(f'<h4>{labels[n]}</h4><img src="lang-{n}-{th}.svg">' for n in names) + '</div>'
open(f'{HERE}/preview2.html', 'w', encoding='utf-8').write(
    '<!doctype html><meta charset=utf-8><style>body{margin:0;display:grid;grid-template-columns:1fr 1fr;font-family:Segoe UI}'
    '.c{padding:24px;display:flex;flex-direction:column;align-items:center;gap:14px}.l{background:#fff}.d{background:#0d1117}h4{margin:6px 0 0;color:#888}</style>'
    + col('light', 'l') + col('dark', 'd'))
print({n: os.path.getsize(f'{HERE}/lang-{n}-dark.svg') for n in names})
