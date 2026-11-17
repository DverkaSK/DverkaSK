"""Direction 1 — terminal tools: btop panel, htop meters, fastfetch, powerline prompt."""
from common import *

PAL = {
    True: dict(bg='#0f1318', panel='#0f1318', line='#3b4252', dim='#252b35', text='#d8dee9', muted='#6c7689',
               title='#e5e9f0', hi='#88c0d0', green='#a3be8c', yellow='#ebcb8b', red='#bf616a', blue='#81a1c1',
               magenta='#b48ead', cyan='#8fbcbb', sel='#88c0d0', selt='#0f1318', head='#a3be8c', headt='#0f1318'),
    False: dict(bg='#fbfaf7', panel='#fbfaf7', line='#c9ccd3', dim='#e6e8ec', text='#2e3440', muted='#7b8394',
                title='#1d222b', hi='#2f7f95', green='#4f7d3a', yellow='#a07a12', red='#b23a48', blue='#3c6ea8',
                magenta='#8a4f8f', cyan='#2a8c8a', sel='#2f7f95', selt='#ffffff', head='#4f7d3a', headt='#ffffff'),
}
FADE = '''
.row { animation: tin .35s steps(3) both; }
@keyframes tin { from { opacity: 0; } }'''


def frame(p, h, rx=8):
    return (f'<rect width="{W}" height="{h}" rx="{rx}" fill="{p["bg"]}"/>'
            f'<rect x=".5" y=".5" width="{W - 1}" height="{h - 1}" rx="{rx}" fill="none" stroke="{p["line"]}"/>')


# T1 — btop-style box: title cut into the border, block bars with a cool gradient
def t1(dark):
    p = PAL[dark]
    n = len(LANGS)
    top, rh = 34, 24
    h = top + 28 + n * rh + 34
    bx0, by0, bw0, bh0 = 12, 14, W - 24, h - 26
    cells, cw, cg = 34, 5, 1.6
    bar_x = 128
    grad = ['#5ec4d4', '#6aa8e8', '#8b8cf0', '#b07cf0', '#d679d1']
    title = 'languages'
    tx = bx0 + 18
    tw = len(title) * 7.3 + 30
    right = f'{TOTAL_H:,.0f}h · since {SINCE}'
    rw = len(right) * 6.6 + 24
    out = [f'<rect width="{W}" height="{h}" rx="8" fill="{p["bg"]}"/>',
           # box with gaps for the titles
           f'<path d="M{tx} {by0} H{bx0 + 6} Q{bx0} {by0} {bx0} {by0 + 6} V{by0 + bh0 - 6} Q{bx0} {by0 + bh0} {bx0 + 6} {by0 + bh0} '
           f'H{bx0 + bw0 - 6} Q{bx0 + bw0} {by0 + bh0} {bx0 + bw0} {by0 + bh0 - 6} V{by0 + 6} Q{bx0 + bw0} {by0} {bx0 + bw0 - 6} {by0} '
           f'H{bx0 + bw0 - 18}" fill="none" stroke="{p["line"]}" stroke-width="1.2"/>',
           f'<line x1="{tx + tw}" y1="{by0}" x2="{bx0 + bw0 - 18 - rw}" y2="{by0}" stroke="{p["line"]}" stroke-width="1.2"/>',
           f'<text x="{tx + 6}" y="{by0 + 4.5}" font-family="{MONO}" font-size="12.5" fill="{p["line"]}">┤</text>'
           f'<text x="{tx + 15}" y="{by0 + 4.5}" font-family="{MONO}" font-size="12.5" font-weight="700" fill="{p["title"]}">'
           f'<tspan fill="{p["red"]}">¹</tspan>{title}</text>'
           f'<text x="{tx + tw - 9}" y="{by0 + 4.5}" font-family="{MONO}" font-size="12.5" fill="{p["line"]}">├</text>',
           f'<text x="{bx0 + bw0 - 18 - rw + 6}" y="{by0 + 4.5}" font-family="{MONO}" font-size="11" fill="{p["line"]}">┤</text>'
           f'<text x="{bx0 + bw0 - 18 - rw + 15}" y="{by0 + 4.5}" font-family="{MONO}" font-size="11" fill="{p["muted"]}">{right}</text>'
           f'<text x="{bx0 + bw0 - 27}" y="{by0 + 4.5}" font-family="{MONO}" font-size="11" fill="{p["line"]}">├</text>',
           f'<text x="{bx0 + 18}" y="{top + 18}" font-family="{MONO}" font-size="10.5" fill="{p["muted"]}">LANG</text>'
           f'<text x="{bar_x}" y="{top + 18}" font-family="{MONO}" font-size="10.5" fill="{p["muted"]}">SHARE OF ALL TIME</text>'
           f'<text x="{W - 30}" y="{top + 18}" font-family="{MONO}" font-size="10.5" fill="{p["muted"]}" text-anchor="end">HOURS</text>']
    for i, l in enumerate(LANGS):
        y = top + 40 + i * rh
        filled = max(1, round(cells * share(l) / 100))
        segs = []
        for k in range(cells):
            gc = grad[min(len(grad) - 1, int(k / cells * len(grad)))]
            on = k < filled
            segs.append(f'<rect x="{bar_x + k * (cw + cg):.1f}" y="{y - 9}" width="{cw}" height="11" rx="1" '
                        f'fill="{gc if on else p["dim"]}"' + (f' class="cell" style="animation-delay:{i * 60 + k * 22}ms"' if on else '') + '/>')
        out.append(f'''<g class="row" style="animation-delay:{i * 60}ms">
<text x="{bx0 + 18}" y="{y}" font-family="{MONO}" font-size="12.5" fill="{p['text']}">{esc(l['name'])}</text>
{''.join(segs)}
<text x="{bar_x + cells * (cw + cg) + 8:.1f}" y="{y}" font-family="{MONO}" font-size="11.5" fill="{p['muted']}">{share(l):>2.0f}%</text>
<text x="{W - 30}" y="{y}" font-family="{MONO}" font-size="12.5" font-weight="700" fill="{p['title']}" text-anchor="end">{num(l['seconds'])}</text>
</g>''')
    yb = top + 40 + n * rh - 4
    out.append(f'<text x="{bx0 + 18}" y="{yb}" font-family="{MONO}" font-size="10.5" fill="{p["muted"]}">'
               f'+{len(OTHERS)} more · {num(OTHERS_S)}h</text>')
    css = FADE + '''
.cell { animation: on .01s steps(1) both; }
@keyframes on { from { opacity: 0; } }'''
    return svg(h, ''.join(out), css)


# T2 — htop: bracket meters on top, coloured header bar and a selected first row below
def t2(dark):
    p = PAL[dark]
    meters = LANGS[:4]
    width = 30
    out = []
    y = 28
    mh = 19
    for i, l in enumerate(meters):
        n = round(width * share(l) / 100)
        n = max(1, n)
        pct = f'{share(l):.1f}%'
        bars = '|' * n
        pad = ' ' * (width - n - len(pct))
        parts = []
        # htop colours meters in up to three colours
        a, b = int(n * .55), int(n * .85)
        parts.append(f'<tspan fill="{p["green"]}">{bars[:a]}</tspan>')
        parts.append(f'<tspan fill="{p["yellow"]}">{bars[a:b]}</tspan>')
        parts.append(f'<tspan fill="{p["red"]}">{bars[b:]}</tspan>')
        out.append(f'<text class="row" style="animation-delay:{i * 90}ms" x="18" y="{y + i * mh}" font-family="{MONO}" font-size="12.5" xml:space="preserve">'
                   f'<tspan fill="{p["hi"]}" font-weight="700">{l["name"][:8]:>8}</tspan><tspan fill="{p["title"]}" font-weight="700">[</tspan>'
                   f'{"".join(parts)}{pad}<tspan fill="{p["muted"]}">{pct}</tspan><tspan fill="{p["title"]}" font-weight="700">]</tspan></text>')
    # right column: summary like htop's "Tasks / Load average"
    sx = 340
    out.append(f'<text x="{sx}" y="{y}" font-family="{MONO}" font-size="12" xml:space="preserve"><tspan fill="{p["hi"]}" font-weight="700">Total: </tspan><tspan fill="{p["title"]}" font-weight="700">{TOTAL_H:,.0f}h</tspan></text>')
    out.append(f'<text x="{sx}" y="{y + mh}" font-family="{MONO}" font-size="12" xml:space="preserve"><tspan fill="{p["hi"]}" font-weight="700">Langs: </tspan><tspan fill="{p["title"]}" font-weight="700">{len(ALL)}</tspan></text>')
    out.append(f'<text x="{sx}" y="{y + 2 * mh}" font-family="{MONO}" font-size="12" xml:space="preserve"><tspan fill="{p["hi"]}" font-weight="700">Since: </tspan><tspan fill="{p["title"]}" font-weight="700">{SINCE}</tspan></text>')
    ty = y + 4 * mh + 6
    out.append(f'<rect x="10" y="{ty - 13}" width="{W - 20}" height="18" fill="{p["head"]}"/>'
               f'<text x="18" y="{ty}" font-family="{MONO}" font-size="12" font-weight="700" fill="{p["headt"]}" xml:space="preserve">'
               f'{"#":>2}  {"LANGUAGE":<14}{"HOURS":>8}{"SHARE":>9}   TIME+</text>')
    rows = LANGS
    rh = 18
    for i, l in enumerate(rows):
        yy = ty + (i + 1) * rh
        sel = i == 0
        if sel:
            out.append(f'<rect class="row" x="10" y="{yy - 13}" width="{W - 20}" height="18" fill="{p["sel"]}" style="animation-delay:{400}ms"/>')
        c = p['selt'] if sel else p['text']
        m = p['selt'] if sel else p['muted']
        hh = int(l['seconds'] // 3600); mm = int(l['seconds'] % 3600 // 60)
        out.append(f'<text class="row" style="animation-delay:{400 + i * 50}ms" x="18" y="{yy}" font-family="{MONO}" font-size="12" xml:space="preserve">'
                   f'<tspan fill="{m}">{i + 1:>2}</tspan>  <tspan fill="{c}" font-weight="{700 if sel else 400}">{l["name"]:<14}</tspan>'
                   f'<tspan fill="{c}" font-weight="700">{num(l["seconds"]) + "h":>8}</tspan><tspan fill="{m}">{share(l):>8.1f}%</tspan>'
                   f'<tspan fill="{m}">   {hh}:{mm:02d}</tspan></text>')
    h = ty + (len(rows) + 1) * rh + 2
    return svg(h, frame(p, h) + ''.join(out), FADE)


# T3 — fastfetch: big logo on the left, key: value lines, colour palette as the legend
def t3(dark):
    p = PAL[dark]
    top = LANGS[0]
    rh = 19
    lx = 186
    lines = []
    y = 34
    user = 'dverka@wakatime'
    lines.append(f'<text x="{lx}" y="{y}" font-family="{MONO}" font-size="13" font-weight="700"><tspan fill="{readable(col("Java"), dark)}">dverka</tspan><tspan fill="{p["text"]}">@</tspan><tspan fill="{readable(col("Java"), dark)}">wakatime</tspan></text>')
    lines.append(f'<text x="{lx}" y="{y + 12}" font-family="{MONO}" font-size="13" fill="{p["muted"]}">{"-" * len(user)}</text>')
    kv = [('Total', f'{TOTAL_H:,.0f}h since {SINCE}', None)] + [(l['name'], f'{hrs(l["seconds"])}  ({share(l):.0f}%)', l['name']) for l in LANGS]
    for i, (k, v, nm) in enumerate(kv):
        yy = y + 34 + i * rh
        kc = readable(col(nm), dark) if nm else p['hi']
        lines.append(f'<text class="row" style="animation-delay:{i * 70}ms" x="{lx}" y="{yy}" font-family="{MONO}" font-size="12.5" xml:space="preserve">'
                     f'<tspan fill="{kc}" font-weight="700">{esc(k)}</tspan><tspan fill="{p["text"]}">: {esc(v)}</tspan></text>')
    py = y + 34 + len(kv) * rh + 6
    sq = 20
    for i, l in enumerate(LANGS):
        lines.append(f'<rect class="row" style="animation-delay:{700 + i * 60}ms" x="{lx + i * sq}" y="{py - 12}" width="{sq}" height="14" fill="{col(l["name"])}"/>')
    h = py + 20
    # logo: the top language icon in a soft ring, with its share under it
    cx, cy = 92, h / 2 - 14
    logo = f'''<circle cx="{cx}" cy="{cy}" r="62" fill="{col(top['name'])}" fill-opacity="{.16 if dark else .1}"/>
<circle cx="{cx}" cy="{cy}" r="62" fill="none" stroke="{col(top['name'])}" stroke-opacity=".5" stroke-dasharray="3 5"/>
{glyph(top['name'], cx - 38, cy - 44, 76)}
<text x="{cx}" y="{cy + 84}" font-family="{MONO}" font-size="12" font-weight="700" fill="{readable(col(top['name']), dark)}" text-anchor="middle">{share(top):.0f}% Java</text>'''
    return svg(h, frame(p, h) + logo + ''.join(lines), FADE)


# T4 — powerline: each language is a prompt segment chain
def t4(dark):
    p = PAL[dark]
    rh, gap = 24, 7
    y0 = 52
    s1w, s2w = 122, 70
    out = [f'<text x="18" y="30" font-family="{MONO}" font-size="12.5" xml:space="preserve"><tspan fill="{p["green"]}" font-weight="700">❯</tspan>'
           f'<tspan fill="{p["text"]}"> wakatime</tspan><tspan fill="{p["hi"]}"> --languages</tspan><tspan fill="{p["muted"]}"> --all-time</tspan></text>']
    bx = 18 + s1w + s2w + 26
    bw = W - 18 - bx - 40
    for i, l in enumerate(LANGS):
        y = y0 + i * (rh + gap)
        c = col(l['name'])
        c2 = mix(c, '#000000', .45) if dark else mix(c, '#ffffff', .72)
        t2c = '#ffffff' if dark else mix(c, '#000000', .55)
        x1 = 18
        a = rh / 2
        seg1 = f'<path d="M{x1 + 5} {y} H{x1 + s1w} l{a * .8} {a} -{a * .8} {a} H{x1 + 5} Q{x1} {y + rh} {x1} {y + rh - 5} V{y + 5} Q{x1} {y} {x1 + 5} {y}z" fill="{c}"/>'
        seg2 = f'<path d="M{x1 + s1w} {y} H{x1 + s1w + s2w} l{a * .8} {a} -{a * .8} {a} H{x1 + s1w} l{a * .8} -{a}z" fill="{c2}"/>'
        fw = max(3, bw * share(l) / 100)
        out.append(f'''<g class="seg" style="animation-delay:{i * 70}ms">
{seg2}{seg1}
{glyph(l['name'], x1 + 7, y + 4, 16, chip_fill='#ffffff', chip_text=c) if l['name'] not in ICONS else f'<circle cx="{x1 + 15}" cy="{y + a}" r="10" fill="#ffffff"/>' + glyph(l['name'], x1 + 7, y + 4, 16)}
<text x="{x1 + 31}" y="{y + 16.5}" font-family="{MONO}" font-size="12.5" font-weight="700" fill="#ffffff">{esc(l['name'])}</text>
<text x="{x1 + s1w + s2w - 4}" y="{y + 16.5}" font-family="{MONO}" font-size="12.5" font-weight="700" fill="{t2c}" text-anchor="end">{hrs(l['seconds'])}</text>
<rect x="{bx}" y="{y + a - 2}" width="{bw}" height="4" rx="2" fill="{p['dim']}"/>
<rect class="bar" x="{bx}" y="{y + a - 2}" width="{fw:.1f}" height="4" rx="2" fill="{c}" style="animation-delay:{200 + i * 70}ms"/>
<text x="{W - 18}" y="{y + 16}" font-family="{MONO}" font-size="11.5" fill="{p['muted']}" text-anchor="end">{share(l):.0f}%</text>
</g>''')
    h = y0 + len(LANGS) * (rh + gap) + 10
    css = '''
.seg { animation: sl .45s cubic-bezier(.2,.8,.2,1) both; }
.bar { transform-box: fill-box; transform-origin: left; animation: gr 1s cubic-bezier(.2,.8,.2,1) both; }
@keyframes sl { from { opacity: 0; transform: translateX(-10px); } }
@keyframes gr { from { transform: scaleX(0); } }'''
    return svg(h, frame(p, h) + ''.join(out), css)


VARIANTS = [('t1', 'btop', t1), ('t2', 'htop', t2), ('t3', 'fastfetch', t3), ('t4', 'powerline', t4)]
