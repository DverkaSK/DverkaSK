"""README header variants: the site logo as SVG paths + 1337 captions in different formats."""
import math, random, os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(os.path.dirname(HERE), 'fonts')
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)

_fonts = {}
def font(name):
    if name not in _fonts:
        if name == 'unb':
            f = TTFont(os.path.join(FD, 'Unbounded[wght].ttf'))
            f = instancer.instantiateVariableFont(f, {'wght': 900})
        else:
            f = TTFont(os.path.join(FD, {
                'lob': 'Lobster-Regular.ttf', 'marck': 'MarckScript-Regular.ttf', 'mono': 'PTM55FT.ttf',
                'pang': 'Pangolin-Regular.ttf', 'pix': 'PressStart2P-Regular.ttf', 'glitch': 'RubikGlitch-Regular.ttf',
                'marker': 'PermanentMarker-Regular.ttf'}[name]))
        _fonts[name] = f
    return _fonts[name]

def glyph(name, ch, size, x=0, y=0):
    """Path of one char with baseline at (x, y). Returns (d, advance)."""
    f = font(name)
    gs = f.getGlyphSet()
    gn = f.getBestCmap().get(ord(ch))
    upm = f['head'].unitsPerEm
    s = size / upm
    if gn is None:
        return '', size * .3
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    gs[gn].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    return pen.getCommands(), f['hmtx'][gn][0] * s

def text(name, s, size, x=0, y=0, ls=0):
    """Whole string as one path. Returns (d, width)."""
    ds, cx = [], x
    for ch in s:
        d, a = glyph(name, ch, size, cx, y)
        ds.append(d); cx += a + ls
    return ' '.join(ds), cx - x - ls

def letters(name, s, size, x=0, y=0, ls=0):
    out, cx = [], x
    for ch in s:
        d, a = glyph(name, ch, size, cx, y)
        out.append((ch, d, cx, a)); cx += a + ls
    return out, cx - x - ls

def bbox(name, ch, size):
    f = font(name); gs = f.getGlyphSet(); gn = f.getBestCmap()[ord(ch)]
    from fontTools.pens.boundsPen import BoundsPen
    bp = BoundsPen(gs); gs[gn].draw(bp)
    s = size / f['head'].unitsPerEm
    x0, y0, x1, y1 = bp.bounds
    return x0 * s, -y1 * s, x1 * s, -y0 * s  # svg coords relative to baseline origin

W = 840
VOID, MAG, CYAN, YEL, LIME, NAVY = '#0a0014', '#ff00cc', '#00e5ff', '#ffe600', '#b6ff00', '#000080'

# ---------------------------------------------------------------- logo
def logo(fs, cx, base):
    """The site's 8-letter logo, centred on cx, baseline at base. Returns (defs, body, width)."""
    spec = [  # (font, char, scale, kind)
        ('unb', 'D', 1.0, 'chrome'), ('lob', 'v', 1.08, 'v'), ('glitch', 'e', .92, 'e'), ('pix', 'r', .42, 'r'),
        ('marck', 'k', 1.12, 'k'), ('pang', 'a', 1.0, 'a'), ('unb', 'S', 1.0, 'rainbow'), ('mono', 'K', .56, 'K')]
    extra = {'r': fs * .42 * .2, 'K': fs * .56 * .24 + 6, 'rainbow': fs * .06, 'K_gap': fs * .08}
    # measure
    items, x = [], 0
    for fn, ch, sc, kind in spec:
        size = fs * sc
        _, adv = glyph(fn, ch, size)
        lead = extra['rainbow'] if kind == 'rainbow' else (extra['K_gap'] if kind == 'K' else 0)
        pad = extra.get(kind, 0) if kind in ('r', 'K') else 0
        x += lead
        items.append((fn, ch, size, kind, x + pad / 2, adv))
        x += adv + pad
    width = x
    x0 = cx - width / 2
    defs = f'''
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#fff"/><stop offset=".38" stop-color="#e8f0fb"/><stop offset=".5" stop-color="#50607c"/>
 <stop offset=".56" stop-color="#e3ebf8"/><stop offset=".82" stop-color="#8ea3c1"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="rainbow" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#f3c"/><stop offset=".3" stop-color="#fe0"/><stop offset=".5" stop-color="#3d0"/>
 <stop offset=".7" stop-color="#0cf"/><stop offset="1" stop-color="#93f"/></linearGradient>'''
    parts = []
    for i, (fn, ch, size, kind, lx, adv) in enumerate(items):
        gx = x0 + lx
        bx0, by0, bx1, by1 = bbox(fn, ch, size)
        ccx, ccy = gx + (bx0 + bx1) / 2, base + (by0 + by1) / 2
        if kind in ('r', 'K'):  # boxed letters sit centred on the x-height middle
            mid = base - fs * .36
            gy = mid - (by0 + by1) / 2
        else:
            gy = base
        d, _ = glyph(fn, ch, size, gx, gy)
        cy_ = gy + (by0 + by1) / 2
        g = []
        if kind == 'chrome':
            g += [f'<path d="{d}" transform="translate(4 5)" fill="rgba(10,20,60,.55)"/>',
                  f'<path d="{d}" fill="url(#chrome)" stroke="#13223d" stroke-width="3" paint-order="stroke"/>']; rot = -7
        elif kind == 'v':
            g += [f'<path d="{d}" transform="translate(6 6)" fill="#5a0050"/>', f'<path d="{d}" transform="translate(3 3)" fill="#fff"/>',
                  f'<path d="{d}" fill="{MAG}"/>']; rot = 0
        elif kind == 'e':
            g += [f'<path d="{d}" fill="{LIME}" stroke="#000" stroke-width="4" paint-order="stroke" stroke-linejoin="round"/>']; rot = 5
        elif kind == 'r':
            p = size * .12; bw, bh = (bx1 - bx0) + 2 * size * .1 + 4, (by1 - by0) + 2 * p
            rx, ry = gx + bx0 - size * .1 - 2, gy + by0 - p
            g += [f'<rect x="{rx + 4:.1f}" y="{ry + 4:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="#000"/>',
                  f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{NAVY}"/>',
                  f'<path d="{d}" fill="#fff"/>']; rot = 9
        elif kind == 'k':
            g += [f'<path d="{d}" transform="translate(6 6)" fill="#000"/>', f'<path d="{d}" transform="translate(3 3)" fill="{MAG}"/>',
                  f'<path d="{d}" fill="{YEL}"/>']; rot = 0
        elif kind == 'a':
            g += [f'<path d="{d}" fill="{CYAN}" stroke="#001a33" stroke-width="4" paint-order="stroke" stroke-linejoin="round"/>']; rot = -12
        elif kind == 'rainbow':
            g += [f'<path d="{d}" transform="translate(4 4)" fill="#000"/>',
                  f'<path d="{d}" fill="url(#rainbow)" stroke="#000" stroke-width="3" paint-order="stroke"/>']; rot = 0
        elif kind == 'K':
            p = size * .12; bw = (bx1 - bx0) + 2 * p + 6; bh = fs * .56 * 1.05
            rx, ry = gx + bx0 - p - 3, cy_ - bh / 2
            g += [f'<rect x="{rx + 5:.1f}" y="{ry + 5:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{MAG}"/>',
                  f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{YEL}" stroke="#000" stroke-width="3"/>',
                  f'<path d="{d}" fill="#000" stroke="#000" stroke-width="1.6"/>']; rot = 5
        parts.append(f'<g class="L" style="--i:{i};transform-origin:{ccx:.1f}px {cy_:.1f}px"><g transform="rotate({rot} {ccx:.1f} {cy_:.1f})">'
                     + ''.join(g) + '</g></g>')
    return defs, '<g id="logo">' + ''.join(parts) + '</g>', width

LOGO_CSS = '''
.L{animation:drop .55s cubic-bezier(.2,1.6,.4,1) both;animation-delay:calc(var(--i) * .09s + .1s)}
@keyframes drop{from{opacity:0;transform:translateY(-60px) scale(.6) rotate(-14deg)}to{opacity:1;transform:none}}
.gl{opacity:0;animation:rgb 7s steps(1) infinite 2.2s}
.gl.c{animation-name:rgb2}
@keyframes rgb{0%,86%,100%{opacity:0;transform:none}87%{opacity:.85;transform:translate(-7px,2px)}89%{opacity:.85;transform:translate(5px,-3px)}91%{opacity:0}}
@keyframes rgb2{0%,86%,100%{opacity:0;transform:none}87%{opacity:.85;transform:translate(7px,-2px)}89%{opacity:.85;transform:translate(-4px,3px)}91%{opacity:0}}
#lw{animation:jit 7s steps(1) infinite 2.2s}
@keyframes jit{0%,86%,92%,100%{transform:none}87%{transform:translateX(-6px) skewX(10deg)}89%{transform:translateX(8px)}90.5%{transform:translateX(-3px) skewX(-6deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
'''

def logo_block(fs, cx, base):
    defs, body, w = logo(fs, cx, base)
    defs += '''
<filter id="tm"><feColorMatrix values="0 0 0 0 1  0 0 0 0 0  0 0 0 0 .8  0 0 0 1 0"/></filter>
<filter id="tc"><feColorMatrix values="0 0 0 0 0  0 0 0 0 .9  0 0 0 0 1  0 0 0 1 0"/></filter>'''
    g = (f'<g id="lw">{body}</g>'
         '<use href="#logo" class="gl" filter="url(#tm)" style="mix-blend-mode:screen"/>'
         '<use href="#logo" class="gl c" filter="url(#tc)" style="mix-blend-mode:screen"/>')
    return defs, g, w

def stars(n, h, seed=7):
    r = random.Random(seed); out = []
    for i in range(n):
        x, y, s = r.uniform(0, W), r.uniform(0, h), r.choice([.6, .8, 1, 1.3])
        tw = f' class="tw" style="animation-delay:-{r.uniform(0, 4):.1f}s"' if r.random() < .35 else ''
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{s}" fill="#fff" opacity="{r.uniform(.25, .8):.2f}"{tw}/>')
    return ''.join(out)

def svg(h, defs, css, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" role="img" aria-label="{title}">'
            f'<title>{title}</title><defs>{defs}<clipPath id="frame"><rect width="{W}" height="{h}" rx="16"/></clipPath></defs>'
            f'<style>{LOGO_CSS}{css}.tw{{animation:tw 2.4s ease-in-out infinite alternate}}@keyframes tw{{to{{opacity:.05}}}}</style>'
            f'<g clip-path="url(#frame)">{body}</g></svg>')

LEET = ['j4v4 + k07l1n b4ck3nd d3v', 'm1n3cr4f7 plug1n5 0n 5p1g07 & m0dr1n7h', 'c0d1ng w17h 41 51nc3 2026', 'gr33tz 2 4ll c0d3rz']

# ---------------------------------------------------------------- A: cracktro
def var_a():
    H = 290
    defs, lg, _ = logo_block(118, W / 2, 150)
    bars, cols = [], [MAG, CYAN, YEL, LIME, '#9933ff']
    for i, c in enumerate(cols):
        defs += (f'<linearGradient id="cb{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity="0"/>'
                 f'<stop offset=".5" stop-color="{c}"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></linearGradient>')
        bars.append(f'<rect class="cb" style="animation-delay:-{i * .38:.2f}s" x="0" y="-9" width="{W}" height="18" fill="url(#cb{i})"/>')
    msg = '*** DverkaSK pr3s3n75 ***   ' + '   ///   '.join(LEET) + '   ///   1337 f0r3v3r   '
    lt, tw = letters('unb', msg, 26, 0, 0, 1)
    defs += (f'<linearGradient id="cop" gradientUnits="userSpaceOnUse" x1="0" y1="-22" x2="0" y2="2">'
             f'<stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="{YEL}"/><stop offset=".65" stop-color="{MAG}"/><stop offset="1" stop-color="#5a00a0"/></linearGradient>')
    wav = ''.join(f'<g class="wv" style="animation-delay:-{(i * .09) % 1.6:.2f}s"><path d="{d}"/></g>' for i, (ch, d, x, a) in enumerate(lt) if d)
    speed = 110
    dur = (W + tw) / speed
    css = f'''
.cb{{animation:cb 3.2s ease-in-out infinite alternate;opacity:.5}}
@keyframes cb{{from{{transform:translateY(40px)}}to{{transform:translateY(205px)}}}}
.sc{{animation:sc {dur:.1f}s linear infinite -{(W*.75)/speed:.1f}s}}
@keyframes sc{{from{{transform:translateX({W}px)}}to{{transform:translateX(-{tw:.0f}px)}}}}
.wv{{animation:wv 1.6s ease-in-out infinite}}
@keyframes wv{{0%,100%{{transform:translateY(-9px)}}50%{{transform:translateY(9px)}}}}
'''
    body = (f'<rect width="{W}" height="{H}" fill="{VOID}"/>{stars(70, H)}<g>{"".join(bars)}</g>'
            f'<rect y="{H - 62}" width="{W}" height="62" fill="#000" opacity=".55"/>'
            f'<rect y="{H - 62}" width="{W}" height="2" fill="{CYAN}" opacity=".6"/>{lg}'
            f'<g transform="translate(0 {H - 22})"><g class="sc" fill="url(#cop)" stroke="#000" stroke-width=".8">{wav}</g></g>')
    return svg(H, defs, css, body, 'DverkaSK')

# ---------------------------------------------------------------- B: NFO release
def var_b():
    H = 320
    defs, lg, _ = logo_block(108, W / 2, 128)
    rows = [('r3l34s3', 'j4v4 + k07l1n b4ck3nd'), ('pl4tf0rm', '5p1g07 // m0dr1n7h // g17hub'),
            ('5upp0r7', '41-p0w3r3d 51nc3 2026'), ('gr33tz', '2 4ll c0d3rz 0u7 7h3r3')]
    fs, lh = 17, 25
    x0, y0, bw = 150, 190, 540
    out = []
    for i, (k, v) in enumerate(rows):
        y = y0 + 22 + i * lh
        dk, wk = text('mono', k, fs, x0 + 26, y)
        dots = '.' * max(2, int((150 - wk) / (fs * .6)))
        dd, wd = text('mono', dots, fs, x0 + 26 + wk + 6, y)
        dv, _ = text('mono', v, fs, x0 + 200, y)
        out.append(f'<g class="row" style="--i:{i}"><path d="{dk}" fill="{CYAN}"/><path d="{dd}" fill="#4a3a6a"/>'
                   f'<path d="{dv}" fill="#fffbe6"/></g>')
    cur_y = y0 + 22 + (len(rows) - 1) * lh
    frame_h = len(rows) * lh + 18
    # block-shade frame like an .nfo header
    shade = []
    for j, op in enumerate([1, .6, .3]):
        shade.append(f'<rect x="{x0 - 6 - j * 8}" y="{y0 - 4}" width="6" height="{frame_h + 8}" fill="{MAG}" opacity="{op}"/>')
        shade.append(f'<rect x="{x0 + bw + j * 8}" y="{y0 - 4}" width="6" height="{frame_h + 8}" fill="{MAG}" opacity="{op}"/>')
    dt, wt = text('mono', '[ DverkaSK.nfo ]', 14, 0, 0)
    css = '''
.row{opacity:0;animation:typ .01s steps(1) both;animation-delay:calc(1.2s + var(--i) * .45s)}
@keyframes typ{to{opacity:1}}
.row path:last-child{clip-path:inset(0 100% 0 0);animation:rev .5s steps(22) both;animation-delay:calc(1.2s + var(--i) * .45s)}
@keyframes rev{to{clip-path:inset(0 0 0 0)}}
.cur{animation:bl 1s steps(1) infinite}@keyframes bl{50%{opacity:0}}
.scan{animation:scan 5s linear infinite}@keyframes scan{from{transform:translateY(0)}to{transform:translateY(320px)}}
'''
    body = (f'<rect width="{W}" height="{H}" fill="{VOID}"/>{stars(50, H, 3)}{lg}'
            f'<rect x="{x0}" y="{y0 - 4}" width="{bw}" height="{frame_h + 8}" fill="#000" opacity=".6"/>'
            f'<rect x="{x0}" y="{y0 - 4}" width="{bw}" height="2" fill="{MAG}"/><rect x="{x0}" y="{y0 + frame_h + 2}" width="{bw}" height="2" fill="{MAG}"/>'
            + ''.join(shade) +
            f'<rect x="{W / 2 - wt / 2 - 8:.0f}" y="{y0 - 14}" width="{wt + 16:.0f}" height="20" fill="{VOID}"/>'
            f'<g transform="translate({W / 2 - wt / 2:.1f} {y0 + 1})"><path d="{dt}" fill="{YEL}"/></g>'
            + ''.join(out) +
            f'<rect class="cur" x="{x0 + bw - 30}" y="{cur_y - 14}" width="10" height="17" fill="{LIME}"/>'
            f'<rect class="scan" y="-40" width="{W}" height="40" fill="#fff" opacity=".035"/>')
    return svg(H, defs, css, body, 'DverkaSK')

# ---------------------------------------------------------------- C: die-cut stickers
def var_c():
    H = 300
    defs, lg, _ = logo_block(118, W / 2, 168)
    st = [  # text, size, x, y(baseline), rot, color
        ('1337', 44, 74, 92, -11, MAG), ('j4v4', 34, 640, 70, 8, '#ff7a00'), ('k07l1n', 30, 690, 270, -6, '#9b5cff'),
        ('plug1n5', 28, 40, 250, 7, LIME), ('5p1g07', 24, 330, 56, -4, CYAN), ('m0dr1n7h', 24, 480, 275, 5, '#1bd96a'),
        ('41 // 2026', 22, 250, 285, -3, YEL)]
    defs += '<filter id="ds" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="2" dy="4" stdDeviation="2.5" flood-color="#000" flood-opacity=".55"/></filter>'
    out = []
    for i, (t, s, x, y, r, c) in enumerate(st):
        d, w = text('marker', t, s, 0, 0, 1)
        cx = x + w / 2; cy = y - s * .35
        out.append(f'<g class="stk" style="--i:{i};transform-origin:{cx:.0f}px {cy:.0f}px"><g transform="translate({x} {y}) rotate({r} {w / 2:.0f} {-s * .35:.0f})" filter="url(#ds)">'
                   f'<path d="{d}" fill="#fff" stroke="#fff" stroke-width="{s * .34:.1f}" stroke-linejoin="round"/>'
                   f'<path d="{d}" fill="{c}" stroke="#14001f" stroke-width="{s * .07:.1f}" stroke-linejoin="round" paint-order="stroke"/>'
                   f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1" transform="translate(-1 -1.5)"/></g></g>')
    css = '''
.stk{animation:slap .45s cubic-bezier(.3,1.8,.5,1) both;animation-delay:calc(1.3s + var(--i) * .22s)}
@keyframes slap{from{opacity:0;transform:scale(1.9) rotate(18deg)}60%{opacity:1}to{opacity:1;transform:none}}
'''
    body = (f'<rect width="{W}" height="{H}" fill="{VOID}"/>{stars(60, H, 11)}' + ''.join(out) + lg)
    return svg(H, defs, css, body, 'DverkaSK')

# ---------------------------------------------------------------- D: chrome wordart ticker
def var_d():
    H = 280
    defs, lg, _ = logo_block(118, W / 2, 140)
    defs += (f'<linearGradient id="wa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="{CYAN}"/>'
             f'<stop offset=".5" stop-color="#1a1060"/><stop offset=".62" stop-color="{MAG}"/><stop offset="1" stop-color="{YEL}"/></linearGradient>'
             '<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/>'
             '<stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')
    n = len(LEET); per = 3.0; tot = n * per
    out = []
    for i, t in enumerate(LEET):
        size = 30 if len(t) < 30 else 22
        d, w = text('unb', t, size, 0, 0, .5)
        x = W / 2 - w / 2
        defs += f'<clipPath id="lc{i}"><path d="{d}" transform="translate({x:.1f} 232)"/></clipPath>'
        a0 = i / n * 100; a1 = (i + 1) / n * 100
        out.append(f'<g class="ln" style="animation-delay:{i * per - tot + 1.4:.1f}s">'
                   f'<g transform="translate({x:.1f} 232) skewX(-10)"><path d="{d}" transform="translate(3 4)" fill="#000"/>'
                   f'<path d="{d}" fill="url(#wa)" stroke="#000" stroke-width="2.8" paint-order="stroke"/></g>'
                   f'<g clip-path="url(#lc{i})" transform="skewX(-10)" style="transform-origin:0 232px"><rect class="sh" x="-200" y="200" width="140" height="40" fill="url(#shine)" style="animation-delay:{i * per - tot + 1.9:.1f}s"/></g></g>')
    k = 100 / n
    css = f'''
.ln{{opacity:0;animation:cyc {tot}s infinite}}
@keyframes cyc{{0%{{opacity:0;transform:translateY(14px)}}{k * .1:.1f}%{{opacity:1;transform:none}}{k * .88:.1f}%{{opacity:1;transform:none}}{k:.1f}%,100%{{opacity:0;transform:translateY(-10px)}}}}
.sh{{animation:sh {tot}s infinite}}
@keyframes sh{{0%{{transform:translateX(0)}}{k * .5:.1f}%,100%{{transform:translateX(1100px)}}}}
'''
    body = f'<rect width="{W}" height="{H}" fill="{VOID}"/>{stars(60, H, 5)}{lg}' + ''.join(out)
    return svg(H, defs, css, body, 'DverkaSK')

if __name__ == '__main__':
    for k, fn in dict(a=var_a, b=var_b, c=var_c, d=var_d).items():
        s = fn()
        open(os.path.join(OUT, f'header-{k}.svg'), 'w', encoding='utf-8').write(s)
        print(k, len(s) // 1024, 'KB')
