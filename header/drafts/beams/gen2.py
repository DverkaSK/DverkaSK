"""Header v2: choreographed motion. One 6 s loop, every event placed on its timeline."""
import os, random, math
from gen import glyph, text, letters, bbox, W, VOID, MAG, CYAN, YEL, LIME, NAVY, OUT

P = 6.0          # loop length, s
T0 = 1.8         # loop starts after the intro
def pc(t):       # seconds inside the loop -> keyframe %
    return f'{t / P * 100:.2f}%'

SPEC = [('unb', 'D', 1.0, 'D'), ('lob', 'v', 1.08, 'v'), ('glitch', 'e', .92, 'e'), ('pix', 'r', .42, 'r'),
        ('marck', 'k', 1.12, 'k'), ('pang', 'a', 1.0, 'a'), ('unb', 'S', 1.0, 'S'), ('mono', 'K', .56, 'K')]
ROT = dict(D=-7, v=0, e=5, r=9, k=0, a=-12, S=0, K=5)

def logo(fs, cx, base):
    items, x = [], 0
    for fn, ch, sc, kind in SPEC:
        size = fs * sc
        _, adv = glyph(fn, ch, size)
        lead = fs * .06 if kind == 'S' else (fs * .08 if kind == 'K' else 0)
        pad = size * .2 if kind == 'r' else (size * .24 + 6 if kind == 'K' else 0)
        x += lead
        items.append((fn, ch, size, kind, x + pad / 2))
        x += adv + pad
    width = x; x0 = cx - width / 2
    defs = f'''
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0" stop-color="#fff"/><stop offset=".38" stop-color="#e8f0fb"/><stop offset=".5" stop-color="#50607c"/>
 <stop offset=".56" stop-color="#e3ebf8"/><stop offset=".82" stop-color="#8ea3c1"/><stop offset="1" stop-color="#fff"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/>
 <stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rbw" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="{fs * 1.1:.0f}" spreadMethod="repeat">
 <stop offset="0" stop-color="#f3c"/><stop offset=".22" stop-color="#fe0"/><stop offset=".42" stop-color="#3d0"/>
 <stop offset=".62" stop-color="#0cf"/><stop offset=".82" stop-color="#93f"/><stop offset="1" stop-color="#f3c"/></linearGradient>'''
    parts = []
    for i, (fn, ch, size, kind, lx) in enumerate(items):
        gx = x0 + lx
        bx0, by0, bx1, by1 = bbox(fn, ch, size)
        gy = (base - fs * .36) - (by0 + by1) / 2 if kind in ('r', 'K') else base
        d, _ = glyph(fn, ch, size, gx, gy)
        ccx, ccy = gx + (bx0 + bx1) / 2, gy + (by0 + by1) / 2
        foot = gy + by1 if kind not in ('r', 'K') else gy + by1 + size * .12
        g = []
        if kind == 'D':
            defs += f'<clipPath id="cD"><path d="{d}"/></clipPath>'
            g += [f'<path d="{d}" transform="translate(4 5)" fill="rgba(10,20,60,.55)"/>',
                  f'<path d="{d}" fill="url(#chrome)" stroke="#13223d" stroke-width="3" paint-order="stroke"/>',
                  f'<g clip-path="url(#cD)"><rect class="shD" x="{gx + bx0 - 90:.0f}" y="{gy + by0 - 10:.0f}" width="70" height="{by1 - by0 + 20:.0f}" fill="url(#shine)" transform="skewX(-20)" style="transform-box:fill-box"/></g>']
        elif kind == 'v':
            g += [f'<path d="{d}" transform="translate(6 6)" fill="#5a0050"/>', f'<path d="{d}" transform="translate(3 3)" fill="#fff"/>',
                  f'<path d="{d}" fill="{MAG}"/>']
        elif kind == 'e':
            g += [f'<path d="{d}" fill="{LIME}" stroke="#000" stroke-width="4" paint-order="stroke" stroke-linejoin="round"/>']
        elif kind == 'r':
            p = size * .12; bw, bh = (bx1 - bx0) + 2 * size * .1 + 4, (by1 - by0) + 2 * p
            rx, ry = gx + bx0 - size * .1 - 2, gy + by0 - p
            g += [f'<rect x="{rx + 4:.1f}" y="{ry + 4:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="#000"/>',
                  f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{NAVY}"/>', f'<path d="{d}" fill="#fff"/>']
        elif kind == 'k':
            g += [f'<path d="{d}" transform="translate(6 6)" fill="#000"/>', f'<path d="{d}" transform="translate(3 3)" fill="{MAG}"/>',
                  f'<path d="{d}" fill="{YEL}"/>']
        elif kind == 'a':
            g += [f'<path d="{d}" fill="{CYAN}" stroke="#001a33" stroke-width="4" paint-order="stroke" stroke-linejoin="round"/>']
        elif kind == 'S':
            defs += f'<clipPath id="cS"><path d="{d}"/></clipPath>'
            h = by1 - by0
            g += [f'<path d="{d}" transform="translate(4 4)" fill="#000"/>',
                  f'<path d="{d}" fill="#000" stroke="#000" stroke-width="3"/>',
                  f'<g clip-path="url(#cS)"><g transform="translate(0 {gy + by0 - fs * 1.1:.0f})"><rect class="rb" x="{gx + bx0 - 4:.0f}" y="0" width="{bx1 - bx0 + 8:.0f}" height="{h + fs * 2.4:.0f}" fill="url(#rbw)"/></g></g>']
        elif kind == 'K':
            p = size * .12; bw = (bx1 - bx0) + 2 * p + 6; bh = fs * .56 * 1.05
            rx, ry = gx + bx0 - p - 3, ccy - bh / 2
            g += [f'<rect class="Ksh" x="{rx + 5:.1f}" y="{ry + 5:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{MAG}"/>',
                  f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{YEL}" stroke="#000" stroke-width="3"/>',
                  f'<path d="{d}" fill="#000" stroke="#000" stroke-width="1.6"/>']
            foot = ry + bh
        c = f'{ccx:.1f}px {ccy:.1f}px'
        parts.append(
            f'<g class="in in{kind}" style="animation-delay:{.15 + i * .13:.2f}s;transform-origin:{c}">'
            f'<g class="J" style="animation-delay:{T0 + i * .07:.2f}s;transform-origin:{ccx:.1f}px {foot:.1f}px">'
            f'<g class="X x{kind}" style="transform-origin:{c}">'
            f'<g transform="rotate({ROT[kind]} {ccx:.1f} {ccy:.1f})">' + ''.join(g) + '</g></g></g></g>')
    return defs, '<g id="logo">' + ''.join(parts) + '</g>', width

def logo_css():
    L = lambda t: pc(t)
    return f'''
.in{{animation:.62s cubic-bezier(.2,.9,.3,1) both}}
.inD{{animation-name:inD}}@keyframes inD{{from{{opacity:0;transform:translateX(-460px) skewX(-35deg) scaleX(1.6)}}65%{{opacity:1;transform:translateX(22px) skewX(10deg) scaleX(.9)}}82%{{transform:translateX(-6px) skewX(-3deg)}}to{{transform:none}}}}
.inv{{animation-name:inv}}@keyframes inv{{from{{opacity:0;transform:translateY(-240px) scale(.8,1.4)}}55%{{opacity:1;transform:translateY(12px) scale(1.3,.7)}}75%{{transform:translateY(-14px) scale(.95,1.08)}}to{{transform:none}}}}
.ine{{animation-name:ine;animation-timing-function:steps(1)}}@keyframes ine{{0%{{opacity:0}}15%{{opacity:1;transform:translate(18px,-6px) skewX(30deg)}}30%{{opacity:0}}45%{{opacity:1;transform:translate(-12px,4px) skewX(-20deg)}}60%{{opacity:.4;transform:translateX(6px)}}75%{{opacity:1;transform:translateX(-3px)}}to{{opacity:1;transform:none}}}}
.inr{{animation-name:inr}}@keyframes inr{{from{{opacity:0;transform:scale(5) rotate(60deg)}}60%{{opacity:1;transform:scale(.8) rotate(-6deg)}}80%{{transform:scale(1.1)}}to{{transform:none}}}}
.ink{{animation-name:ink}}@keyframes ink{{from{{opacity:0;transform:translateY(-140px) rotate(-150deg)}}60%{{opacity:1;transform:rotate(22deg)}}80%{{transform:rotate(-9deg)}}to{{transform:none}}}}
.ina{{animation-name:ina;animation-duration:.8s}}@keyframes ina{{from{{opacity:0;transform:translateX(420px) rotate(720deg)}}70%{{opacity:1;transform:translateX(-10px) rotate(-12deg)}}to{{transform:none}}}}
.inS{{animation-name:inS}}@keyframes inS{{from{{opacity:0;transform:scale(0) rotate(-30deg)}}55%{{opacity:1;transform:scale(1.4) rotate(8deg)}}78%{{transform:scale(.88)}}to{{transform:none}}}}
.inK{{animation-name:inK}}@keyframes inK{{from{{opacity:0;transform:translateY(-280px) rotate(-40deg)}}50%{{opacity:1;transform:translateY(0) rotate(10deg) scale(1.15,.85)}}70%{{transform:translateY(-22px) rotate(-6deg)}}86%{{transform:translateY(0) rotate(2deg)}}to{{transform:none}}}}

.J{{animation:J {P}s ease-in-out infinite both}}
@keyframes J{{0%,{L(.95)},100%{{transform:none}}{L(.15)}{{transform:translateY(0) scale(1.14,.86)}}{L(.42)}{{transform:translateY(-34px) scale(.9,1.12)}}{L(.66)}{{transform:translateY(0) scale(1.2,.8)}}{L(.8)}{{transform:scale(.95,1.05)}}}}

.X{{animation:{P}s ease-in-out infinite both;animation-delay:{T0}s}}
.shD{{animation:shD {P}s ease-in-out infinite {T0}s both}}
@keyframes shD{{0%,{L(1.3)}{{transform:skewX(-20deg) translateX(0)}}{L(1.9)},100%{{transform:skewX(-20deg) translateX(260px)}}}}
.xD{{animation-name:xD}}@keyframes xD{{0%,{L(1.2)},{L(1.95)},100%{{transform:none}}{L(1.45)}{{transform:scale(1.08) rotate(-3deg)}}}}
.xv{{animation-name:xv}}@keyframes xv{{0%,{L(1.6)},{L(2.3)},100%{{transform:none}}{L(1.75)}{{transform:rotate(-16deg) scale(1.1)}}{L(1.95)}{{transform:rotate(12deg)}}{L(2.12)}{{transform:rotate(-5deg)}}}}
.xe{{animation-name:xe;animation-timing-function:steps(1)}}@keyframes xe{{0%,{L(2.0)},{L(2.42)},100%{{transform:none;opacity:1}}{L(2.06)}{{transform:translate(10px,-3px) skewX(25deg)}}{L(2.13)}{{opacity:.2}}{L(2.2)}{{transform:translate(-8px,2px) skewX(-18deg) scaleY(1.2);opacity:1}}{L(2.3)}{{transform:translateX(4px) scaleY(.8)}}}}
.xr{{animation-name:xr}}@keyframes xr{{0%,{L(2.3)},100%{{transform:none}}{L(2.55)}{{transform:scaleX(-1) scale(1.15)}}{L(2.8)}{{transform:scaleX(1)}}}}
.xk{{animation-name:xk}}@keyframes xk{{0%,{L(2.65)},{L(3.45)},100%{{transform:none}}{L(2.8)}{{transform:rotate(24deg)}}{L(2.98)}{{transform:rotate(-16deg)}}{L(3.15)}{{transform:rotate(9deg)}}{L(3.3)}{{transform:rotate(-4deg)}}}}
.xa{{animation-name:xa}}@keyframes xa{{0%,{L(3.0)}{{transform:none}}{L(3.15)}{{transform:translateY(-18px) rotate(-30deg)}}{L(3.6)}{{transform:translateY(0) rotate(360deg)}},100%{{transform:rotate(360deg)}}}}
.xS{{animation-name:xS}}@keyframes xS{{0%,{L(3.4)},{L(3.85)},100%{{transform:none}}{L(3.55)}{{transform:scale(1.22) rotate(6deg)}}{L(3.7)}{{transform:scale(.94)}}}}
.rb{{animation:rb 1.4s linear infinite}}@keyframes rb{{to{{transform:translateY({-118 * 1.1:.0f}px)}}}}
.xK{{animation-name:xK;animation-timing-function:steps(1)}}@keyframes xK{{0%,{L(3.75)},{L(4.2)},100%{{transform:none}}{L(3.8)}{{transform:translate(-5px,2px) rotate(-4deg)}}{L(3.86)}{{transform:translate(5px,-3px) rotate(5deg)}}{L(3.92)}{{transform:translate(-4px,-1px)}}{L(3.98)}{{transform:translate(3px,3px) rotate(-3deg)}}{L(4.05)}{{transform:translate(-2px,0)}}}}

#shake{{animation:shk .4s steps(1) 1.35s both}}
@keyframes shk{{0%{{transform:translate(0,9px)}}20%{{transform:translate(-7px,-5px)}}40%{{transform:translate(6px,4px)}}60%{{transform:translate(-3px,-2px)}}80%{{transform:translate(2px,1px)}}100%{{transform:none}}}}
#punch{{animation:pun {P}s infinite {T0}s both}}
@keyframes pun{{0%,{L(4.5)},{L(5.1)},100%{{transform:none}}{L(4.6)}{{transform:scale(1.09) skewX(-4deg);animation-timing-function:cubic-bezier(.2,.8,.3,1)}}{L(4.75)}{{transform:scale(.97) skewX(2deg)}}}}
.gl{{opacity:0;animation:rgb {P}s steps(1) infinite {T0}s}}.gl.c{{animation-name:rgb2}}
@keyframes rgb{{0%,{L(4.55)},{L(4.95)},100%{{opacity:0;transform:none}}{L(4.6)}{{opacity:.9;transform:translate(-11px,3px)}}{L(4.7)}{{opacity:.9;transform:translate(7px,-4px)}}{L(4.8)}{{opacity:.7;transform:translate(-4px,0)}}}}
@keyframes rgb2{{0%,{L(4.55)},{L(4.95)},100%{{opacity:0;transform:none}}{L(4.6)}{{opacity:.9;transform:translate(11px,-3px)}}{L(4.7)}{{opacity:.9;transform:translate(-7px,4px)}}{L(4.8)}{{opacity:.7;transform:translate(4px,0)}}}}
.flash{{opacity:0;animation:fl .5s ease-out 1.35s forwards,fl2 {P}s infinite {T0}s}}
@keyframes fl{{0%{{opacity:.35}}to{{opacity:0}}}}
@keyframes fl2{{0%,{L(4.58)},{L(5.2)},100%{{opacity:0}}{L(4.6)}{{opacity:.22}}}}
.glow{{animation:gw {P}s ease-out infinite {T0}s}}
@keyframes gw{{0%,{L(4.55)},100%{{opacity:.35;transform:scale(1)}}{L(4.62)}{{opacity:.9;transform:scale(1.25)}}}}
.p1{{animation:par 60s linear infinite}}.p2{{animation:par 32s linear infinite}}.p3{{animation:par 14s linear infinite}}
@keyframes par{{to{{transform:translateX(-{W}px)}}}}
.tw{{animation:tw 1.8s ease-in-out infinite alternate}}@keyframes tw{{to{{opacity:.1}}}}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}
'''

def logo_block(fs, cx, base):
    defs, body, w = logo(fs, cx, base)
    defs += f'''
<filter id="tm"><feColorMatrix values="0 0 0 0 1  0 0 0 0 0  0 0 0 0 .8  0 0 0 1 0"/></filter>
<filter id="tc"><feColorMatrix values="0 0 0 0 0  0 0 0 0 .9  0 0 0 0 1  0 0 0 1 0"/></filter>
<radialGradient id="glw"><stop offset="0" stop-color="{MAG}" stop-opacity=".55"/><stop offset=".5" stop-color="#6a00ff" stop-opacity=".18"/><stop offset="1" stop-color="#6a00ff" stop-opacity="0"/></radialGradient>'''
    o = f'transform-origin:{cx:.0f}px {base - fs * .35:.0f}px'
    g = (f'<ellipse class="glow" style="{o}" cx="{cx:.0f}" cy="{base - fs * .35:.0f}" rx="{w * .62:.0f}" ry="{fs * .95:.0f}" fill="url(#glw)"/>'
         f'<g id="shake"><g id="punch" style="{o}">{body}'
         '<use href="#logo" class="gl" filter="url(#tm)" style="mix-blend-mode:screen"/>'
         '<use href="#logo" class="gl c" filter="url(#tc)" style="mix-blend-mode:screen"/></g></g>')
    return defs, g, w

def stars(h, seed=7):
    r = random.Random(seed); out = []
    for cls, n, size, op in (('p1', 45, (.5, .8), (.2, .5)), ('p2', 25, (.8, 1.2), (.4, .8)), ('p3', 10, (1.2, 1.7), (.6, 1))):
        pts = []
        for _ in range(n):
            x, y, s = r.uniform(0, W), r.uniform(0, h), r.uniform(*size)
            tw = f' class="tw" style="animation-delay:-{r.uniform(0, 3):.1f}s"' if r.random() < .3 else ''
            for dx in (0, W):
                pts.append(f'<circle cx="{x + dx:.0f}" cy="{y:.0f}" r="{s:.1f}" fill="#fff" opacity="{r.uniform(*op):.2f}"{tw}/>')
        out.append(f'<g class="{cls}">{"".join(pts)}</g>')
    return ''.join(out)

def svg(h, defs, css, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" role="img" aria-label="DverkaSK">'
            f'<title>DverkaSK</title><defs>{defs}<clipPath id="frame"><rect width="{W}" height="{h}" rx="16"/></clipPath></defs>'
            f'<style>{logo_css()}{css}</style>'
            f'<g clip-path="url(#frame)"><rect width="{W}" height="{h}" fill="{VOID}"/>{body}'
            f'<rect class="flash" width="{W}" height="{h}" fill="#fff"/></g></svg>')

LEET = ['j4v4 + k07l1n b4ck3nd d3v', 'm1n3cr4f7 plug1n5 0n 5p1g07 & m0dr1n7h', 'c0d1ng w17h 41 51nc3 2026', 'gr33tz 2 4ll c0d3rz']

def sine_kf(name, amp, rot):
    ks = []
    for j in range(9):
        ph = j / 8 * 2 * math.pi
        ks.append(f'{j / 8 * 100:.1f}%{{transform:translateY({-amp * math.cos(ph):.1f}px) rotate({rot * math.sin(ph):.1f}deg)}}')
    return f'@keyframes {name}{{{"".join(ks)}}}'

# ---------------------------------------------------------------- A: cracktro
def var_a():
    H = 300
    defs, lg, _ = logo_block(118, W / 2, 150)
    bars, cols = [], [MAG, CYAN, YEL, LIME, '#9933ff', '#ff5a00']
    for i, c in enumerate(cols):
        defs += (f'<linearGradient id="cb{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity="0"/>'
                 f'<stop offset=".45" stop-color="{c}"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></linearGradient>')
        bars.append(f'<rect class="cb" style="animation-delay:-{i * .22:.2f}s" x="0" y="-11" width="{W}" height="22" fill="url(#cb{i})"/>')
    msg = '*** DverkaSK pr3s3n75 ***     ' + '     ///     '.join(LEET) + '     ///     1337 f0r3v3r     '
    lt, tw = letters('unb', msg, 30, 0, 0, 1)
    defs += (f'<linearGradient id="cop" gradientUnits="userSpaceOnUse" x1="0" y1="-26" x2="0" y2="2">'
             f'<stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="{YEL}"/><stop offset=".6" stop-color="{MAG}"/><stop offset="1" stop-color="#5a00a0"/></linearGradient>')
    per = 1.3
    wav = ''.join(f'<g class="wv" style="animation-delay:-{(i * .065) % per:.3f}s"><path d="{d}"/></g>' for i, (ch, d, x, a) in enumerate(lt) if d)
    speed = 150; dur = (W + tw) / speed
    css = f'''
.cb{{animation:cb 2.2s ease-in-out infinite alternate}}
@keyframes cb{{from{{transform:translateY(30px)}}to{{transform:translateY(222px)}}}}
.bars{{opacity:.5;animation:bf {P}s infinite {T0}s}}
@keyframes bf{{0%,{pc(4.55)},{pc(5.3)},100%{{opacity:.5}}{pc(4.6)}{{opacity:1}}}}
.sc{{animation:sc {dur:.1f}s linear infinite -{(W * .7) / speed:.1f}s}}
@keyframes sc{{from{{transform:translateX({W}px)}}to{{transform:translateX(-{tw:.0f}px)}}}}
.wv{{transform-box:fill-box;transform-origin:center;animation:wv {per}s linear infinite}}
{sine_kf('wv', 14, 16)}
.mir{{opacity:.22}}
'''
    sc = f'<g class="sc" fill="url(#cop)" stroke="#000" stroke-width=".8">{wav}</g>'
    body = (f'{stars(H)}<g class="bars">{"".join(bars)}</g>'
            f'<rect y="{H - 74}" width="{W}" height="74" fill="#000" opacity=".6"/>'
            f'<rect y="{H - 74}" width="{W}" height="2" fill="{CYAN}" opacity=".7"/>{lg}'
            f'<g transform="translate(0 {H - 30})">{sc}</g>')
    return svg(H, defs, css, body)

# ---------------------------------------------------------------- C: stickers
def var_c():
    H = 310
    defs, lg, _ = logo_block(118, W / 2, 172)
    st = [('1337', 50, 52, 96, -11, MAG), ('j4v4', 38, 655, 78, 8, '#ff7a00'), ('k07l1n', 32, 676, 282, -6, '#9b5cff'),
          ('plug1n5', 30, 40, 262, 7, LIME), ('5p1g07', 26, 318, 58, -4, CYAN), ('m0dr1n7h', 26, 470, 290, 5, '#1bd96a'),
          ('41 // 2026', 24, 238, 295, -3, YEL)]
    defs += '<filter id="ds" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".6"/></filter>'
    out = []
    for i, (t, s, x, y, r, c) in enumerate(st):
        d, w = text('marker', t, s, 0, 0, 1)
        cx = x + w / 2; cy = y - s * .35
        o = f'transform-origin:{cx:.0f}px {cy:.0f}px'
        out.append(f'<g class="stk" style="--i:{i};animation-delay:{1.7 + i * .28:.2f}s;{o}">'
                   f'<g class="bob" style="animation-delay:-{i * .7:.1f}s;{o}">'
                   f'<g class="hop" style="animation-delay:{T0 + i * .04:.2f}s;{o}">'
                   f'<g transform="translate({x} {y}) rotate({r} {w / 2:.0f} {-s * .35:.0f})" filter="url(#ds)">'
                   f'<path d="{d}" fill="#fff" stroke="#fff" stroke-width="{s * .36:.1f}" stroke-linejoin="round"/>'
                   f'<path d="{d}" fill="{c}" stroke="#14001f" stroke-width="{s * .07:.1f}" stroke-linejoin="round" paint-order="stroke"/></g></g></g></g>')
    css = f'''
.stk{{animation:slap .42s cubic-bezier(.3,1.7,.5,1) both}}
@keyframes slap{{from{{opacity:0;transform:scale(2.6) rotate(25deg)}}55%{{opacity:1;transform:scale(.88) rotate(-4deg)}}to{{opacity:1;transform:none}}}}
.bob{{animation:bob 3s ease-in-out infinite alternate}}
@keyframes bob{{from{{transform:translateY(-4px) rotate(-2.5deg)}}to{{transform:translateY(4px) rotate(2.5deg)}}}}
.hop{{animation:hop {P}s infinite both}}
@keyframes hop{{0%,{pc(4.55)},{pc(5.2)},100%{{transform:none}}{pc(4.65)}{{transform:translateY(-16px) scale(1.15) rotate(-8deg)}}{pc(4.85)}{{transform:translateY(2px) scale(.96) rotate(3deg)}}}}
'''
    body = f'{stars(H, 11)}' + ''.join(out) + lg
    return svg(H, defs, css, body)

# ---------------------------------------------------------------- D: per-letter flip-in wordart, 2 lines per loop
def var_d():
    H = 290
    defs, lg, _ = logo_block(118, W / 2, 142)
    defs += (f'<linearGradient id="wa" gradientUnits="userSpaceOnUse" x1="0" y1="-30" x2="0" y2="4"><stop offset="0" stop-color="#fff"/><stop offset=".42" stop-color="{CYAN}"/>'
             f'<stop offset=".5" stop-color="#1a1060"/><stop offset=".6" stop-color="{MAG}"/><stop offset="1" stop-color="{YEL}"/></linearGradient>')
    half = P / 2; tot = half * len(LEET)
    out, css_l = [], []
    for li, t in enumerate(LEET):
        size = 32 if len(t) < 30 else 24
        lt, w = letters('unb', t, size, 0, 0, .5)
        x = W / 2 - w / 2
        start = T0 + li * half - 0.1  # line li appears mid-loop and on the punch
        gs = []
        n = len([1 for c in lt if c[1]])
        k = 0
        for ch, d, lx, a in lt:
            if not d: continue
            dl = start + k * (.4 / n)
            gs.append(f'<g class="fl" style="animation-delay:{dl:.2f}s"><path d="{d}" transform="translate(3 4)" fill="#000"/>'
                      f'<path d="{d}" fill="url(#wa)" stroke="#000" stroke-width="2.6" paint-order="stroke"/></g>')
            k += 1
        out.append(f'<g transform="translate({x:.1f} 246) skewX(-10)">{"".join(gs)}</g>')
    a, b, c_, e = .35 / tot * 100, .55 / tot * 100, (half - .75) / tot * 100, (half - .45) / tot * 100
    css = f'''
.fl{{transform-box:fill-box;transform-origin:50% 100%;opacity:0;animation:fl3 {tot}s infinite both}}
@keyframes fl3{{0%{{opacity:0;transform:translateY(-34px) scale(.2,1.8) rotate(-30deg)}}{a:.2f}%{{opacity:1;transform:translateY(0) scale(1.25,.75)}}{b:.2f}%{{transform:none;opacity:1}}{c_:.2f}%{{opacity:1;transform:none}}{e:.2f}%{{opacity:0;transform:translateY(20px) scale(1.4,.3)}}100%{{opacity:0}}}}
'''
    body = f'{stars(H, 5)}{lg}' + ''.join(out)
    return svg(H, defs, css, body)

if __name__ == '__main__':
    for k, fn in dict(a=var_a, c=var_c, d=var_d).items():
        s = fn()
        open(os.path.join(OUT, f'header2-{k}.svg'), 'w', encoding='utf-8').write(s)
        print(k, len(s) // 1024, 'KB')
