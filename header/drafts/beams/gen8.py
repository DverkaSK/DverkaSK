"""Header v7: sharper, more frequent 1337 beams; 20 curated token styles, themed tapes."""
import os, math, random
import gen5  # registers the extra fonts
from gen import text, W, VOID, OUT
from gen2 import logo_block, stars, svg

H, BASE = 336, 192
R = random.Random(2026)

def dark(c, k=.5):
    r, g, b = (int(c[i:i + 2], 16) for i in (1, 3, 5))
    return f'#{int(r * k):02x}{int(g * k):02x}{int(b * k):02x}'

_REF, DEFS = {}, []
def ref(d):
    if d not in _REF: _REF[d] = f'g{len(_REF)}'
    return _REF[d]
def nid(p):
    nid.n += 1; return f'{p}{nid.n}'
nid.n = 0

def glyphs(font, s, ls=.04):
    _, w = text(font, '1337', s, 0, 0, s * ls)
    d, w = text(font, '1337', s, -w / 2, s * .36, s * ls)
    return ref(d), w

def u(i, a=''): return f'<use href="#{i}" {a}/>'
INK = '#1a0a2e'

# ---- 20 styles: f(c, c2) -> (svg, width). c = main colour, c2 = accent.
def st_chrome(c, c2):
    i, w = glyphs('unb', 30)
    return u(i, f'transform="translate(3 4)" fill="{c}"') + u(i, 'fill="url(#chrome)" stroke="#13223d" stroke-width="3" paint-order="stroke"'), w
def st_bubble(c, c2):
    i, w = glyphs('bowlby', 31)
    return (u(i, f'transform="translate(0 3)" fill="{dark(c, .4)}" stroke="{dark(c, .4)}" stroke-width="8" stroke-linejoin="round"')
            + u(i, f'fill="{c}" stroke="#fff" stroke-width="8" stroke-linejoin="round" paint-order="stroke"') + u(i, 'fill="url(#gloss)"')), w + 8
def st_neon(c, c2):
    i, w = glyphs('monoton', 34, .02)
    return f'<g filter="url(#glow)">' + u(i, f'fill="{c}"') + '</g>' + u(i, 'fill="#fff" opacity=".55"'), w
def st_extrude(c, c2):
    i, w = glyphs('bungee', 28)
    return ''.join(u(i, f'transform="translate({k} {k})" fill="{dark(c2, .55)}"') for k in range(6, 0, -1)) + u(i, f'fill="{c}" stroke="#fff" stroke-width="1.2"'), w + 6
def st_shade(c, c2):
    i, w = glyphs('bshade', 30)
    return u(i, f'fill="{c}"'), w
def st_script(c, c2):
    i, w = glyphs('pacifico', 38, .01)
    g = nid('lg'); DEFS.append(f'<linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="#fff"/><stop offset="1" stop-color="{c}"/></linearGradient>')
    return u(i, f'fill="url(#{g})" stroke="{INK}" stroke-width="4" stroke-linejoin="round" paint-order="stroke"'), w
def st_rainbow(c, c2):
    i, w = glyphs('lob', 36, .02)
    return u(i, f'transform="translate(3 3)" fill="{INK}"') + u(i, 'fill="url(#rbp)" stroke="#fff" stroke-width="1.5"'), w
def st_pill(c, c2):
    i, w = glyphs('righteous', 27)
    h, p = 36, 14
    return (f'<rect x="{-w / 2 - p:.1f}" y="{-h / 2}" width="{w + 2 * p:.1f}" height="{h}" rx="{h / 2}" fill="{c}" stroke="#fff" stroke-width="2"/>'
            + u(i, f'fill="{INK}"')), w + 2 * p
def st_sticker(c, c2):
    i, w = glyphs('shrikhand', 30, .02)
    return ('<g filter="url(#ds)">' + u(i, f'fill="#fff" stroke="#fff" stroke-width="11" stroke-linejoin="round"')
            + u(i, f'fill="{c}" stroke="{dark(c, .3)}" stroke-width="2" paint-order="stroke"') + '</g>'), w + 10
def st_glitch(c, c2):
    i, w = glyphs('glitch', 34)
    return (u(i, 'transform="translate(-4 0)" fill="#ff00cc"') + u(i, 'transform="translate(4 0)" fill="#00e5ff"')
            + u(i, f'fill="{c}" stroke="#000" stroke-width="3" paint-order="stroke"')), w + 8
def st_plate(c, c2):
    i, w = glyphs('blackops', 27)
    h, p = 36, 12
    rv = ''.join(f'<circle cx="{x:.1f}" cy="{y}" r="1.8" fill="{dark(c, .4)}"/>' for x in (-w / 2 - p + 5, w / 2 + p - 5) for y in (-h / 2 + 5, h / 2 - 5))
    return (f'<rect x="{-w / 2 - p:.1f}" y="{-h / 2}" width="{w + 2 * p:.1f}" height="{h}" rx="4" fill="{c}" stroke="{INK}" stroke-width="2.5"/>'
            + rv + u(i, f'fill="{INK}"')), w + 2 * p
def st_speed(c, c2):
    i, w = glyphs('faster', 34, .01)
    g = nid('lg'); DEFS.append(f'<linearGradient id="{g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{c2}"/><stop offset="1" stop-color="{c}"/></linearGradient>')
    return u(i, f'fill="url(#{g})"'), w
def st_hollow(c, c2):
    i, w = glyphs('unb', 30)
    return u(i, f'transform="translate(4 4)" fill="{c2}" opacity=".55"') + u(i, f'fill="none" stroke="{c}" stroke-width="2.4" stroke-linejoin="round"'), w + 4
def st_stripes(c, c2):
    i, w = glyphs('rmono', 32, -.02)
    p = nid('pt'); DEFS.append(f'<pattern id="{p}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="8" height="8" fill="{c}"/><rect width="8" height="3.5" fill="{c2}"/></pattern>')
    return u(i, f'fill="url(#{p})" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke"'), w
def st_holo(c, c2):
    i, w = glyphs('unb', 30)
    return u(i, f'transform="translate(2 3)" fill="{INK}"') + u(i, 'fill="url(#holo)" stroke="#fff" stroke-width="1.3"'), w
def st_drip(c, c2):
    i, w = glyphs('wet', 33)
    return u(i, f'fill="{c}" stroke="{INK}" stroke-width="2.5" paint-order="stroke"'), w
def st_inline(c, c2):
    i, w = glyphs('binline', 28)
    return u(i, f'transform="translate(3 3)" fill="{c2}"') + u(i, f'fill="{c}"'), w
def st_rampart(c, c2):
    i, w = glyphs('rampart', 34)
    return u(i, f'fill="{c}"'), w
def st_marker(c, c2):
    i, w = glyphs('marck', 36, .03)
    return (f'<rect x="{-w / 2 - 6:.1f}" y="-12" width="{w + 12:.1f}" height="22" fill="{c}" transform="skewX(-14)"/>'
            + u(i, f'fill="{INK}" stroke="#fff" stroke-width="2.5" paint-order="stroke"')), w + 12
def st_popshadow(c, c2):
    i, w = glyphs('righteous', 31)
    return u(i, 'transform="translate(6 6)" fill="#000"') + u(i, f'transform="translate(3 3)" fill="{c2}"') + u(i, f'fill="{c}"'), w + 6

IDLE = dict(st_chrome='hop', st_bubble='pls', st_neon='flk', st_extrude='swg', st_shade='hop', st_script='wob',
            st_rainbow='hue', st_pill='pls', st_sticker='wob', st_glitch='jit', st_plate='hng', st_speed='shk',
            st_hollow='flp', st_stripes='hue', st_holo='hue', st_drip='drp', st_inline='hop', st_rampart='swg',
            st_marker='wob', st_popshadow='hop')
IDLE_CSS = """
.i{transform-box:fill-box;transform-origin:center}
.hop{animation:hop .9s cubic-bezier(.3,0,.3,1) infinite}
@keyframes hop{0%,55%,100%{transform:none}20%{transform:translateY(-9px) scale(.94,1.08)}40%{transform:translateY(0) scale(1.12,.88)}}
.pls{animation:pls .7s ease-in-out infinite alternate}@keyframes pls{from{transform:scale(.9,1.08)}to{transform:scale(1.12,.92)}}
.flk{animation:flk 1.3s steps(1) infinite}@keyframes flk{0%,100%{opacity:1}12%{opacity:.25}16%{opacity:1}52%{opacity:.5}55%{opacity:1}58%{opacity:.15}62%{opacity:1}}
.swg{animation:swg .8s ease-in-out infinite alternate}@keyframes swg{from{transform:rotate(-11deg)}to{transform:rotate(11deg)}}
.wob{animation:wob .55s ease-in-out infinite alternate}@keyframes wob{from{transform:rotate(-6deg) scale(1.04)}to{transform:rotate(6deg) scale(.97)}}
.hue{animation:hue 1.2s linear infinite}@keyframes hue{to{filter:hue-rotate(360deg)}}
.jit{animation:jit .5s steps(1) infinite}@keyframes jit{0%,100%{transform:none}20%{transform:translate(4px,-2px) skewX(18deg)}40%{transform:translate(-5px,1px)}60%{transform:skewX(-14deg) scaleY(1.2)}80%{transform:translate(2px,2px)}}
.hng{transform-origin:50% 0;animation:hng .9s ease-in-out infinite alternate}@keyframes hng{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.shk{animation:shk2 .12s steps(1) infinite}@keyframes shk2{0%{transform:translate(-2px,1px)}50%{transform:translate(2px,-1px)}}
.flp{animation:flp 1.6s cubic-bezier(.6,0,.4,1) infinite}@keyframes flp{0%,35%{transform:scaleX(1)}55%{transform:scaleX(-1)}75%,100%{transform:scaleX(1)}}
.drp{transform-origin:50% 0;animation:drp .8s ease-in-out infinite alternate}@keyframes drp{from{transform:scaleY(.94)}to{transform:scaleY(1.16)}}
.sep{animation:sep .9s linear infinite}@keyframes sep{to{transform:rotate(360deg)}}
.wv{animation:wv .6s ease-in-out infinite alternate}@keyframes wv{from{transform:rotate(-.7deg)}to{transform:rotate(.7deg)}}
"""
STYLES = [st_chrome, st_bubble, st_neon, st_extrude, st_shade, st_script, st_rainbow, st_pill, st_sticker, st_glitch,
          st_plate, st_speed, st_hollow, st_stripes, st_holo, st_drip, st_inline, st_rampart, st_marker, st_popshadow]

THEMES = {
    'sorbet': ['#ff8a80', '#ffb38a', '#ffd1a8', '#ffe9a3', '#ffc4c4'],
    'mint': ['#9ff0c8', '#c9f7e1', '#7fe3b5', '#d4ffb3', '#b5f2ff'],
    'lav': ['#c7b3ff', '#e3d4ff', '#f7c6ff', '#ffb3d9', '#b39dff'],
    'sky': ['#a8d8ff', '#b5f2ff', '#9fd6ff', '#c4e6ff', '#d9ccff'],
    'candy': ['#ffb3d9', '#a8d8ff', '#ffe9a3', '#9ff0c8', '#c7b3ff'],
    'acid': ['#b6ff00', '#ff00cc', '#00e5ff', '#ffe600', '#ff3b00'],
}
BAND = dict(sorbet='#2a0f14', mint='#06231c', lav='#1c1033', sky='#0a1838', candy='#22102a', acid='#000000')

USED = set()
def tape_tokens(theme, n, last_style):
    pal = THEMES[theme]; accents = [c for t in THEMES.values() for c in t]
    out = []
    for _ in range(n):
        for _try in range(400):
            st = R.choice(STYLES); c = R.choice(pal)
            if st is not last_style and (st.__name__, c) not in USED:
                break
        USED.add((st.__name__, c)); last_style = st
        c2 = R.choice([a for a in accents if a != c])
        b_, w_ = st(c, c2)
        out.append((b_, w_, IDLE[st.__name__]))
    return out, last_style

# origin corner/edge, angle
GEOM = [((-60, -40), 17), ((W + 60, H + 40), 197), ((W + 60, -30), 160), ((-60, H + 30), -16), ((-80, 50), 3),
        ((W + 80, 290), 182), ((-60, -60), 30), ((W + 60, H + 60), 211), ((W + 80, 46), 178), ((-60, H + 50), -24),
        ((-70, 286), -2), ((W + 60, -50), 150), ((-60, -20), 10), ((W + 70, H + 20), 192)]
THEME_ORDER = ['sorbet', 'mint', 'lav', 'acid', 'sky', 'candy', 'sorbet', 'lav', 'mint', 'sky', 'candy', 'acid', 'lav', 'sorbet']
EXITS = ['through', 'retract', 'shut', 'shatter']

L, BH = 1150, 52
START, PERIOD = .45, .72
SHOOT, LAND, HOLD, EXIT = .14, .16, 1.05, .22

def build():
    defs, lg, _ = logo_block(118, W / 2, BASE)
    defs += (f'<radialGradient id="halo"><stop offset="0" stop-color="{VOID}" stop-opacity=".93"/><stop offset=".6" stop-color="{VOID}" stop-opacity=".6"/>'
             f'<stop offset="1" stop-color="{VOID}" stop-opacity="0"/></radialGradient>'
             '<filter id="ds" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="1.5" dy="3" stdDeviation="1.5" flood-color="#000" flood-opacity=".6"/></filter>'
             '<filter id="glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="2.5" result="b"/>'
             '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
             '<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'
             '<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity=".15"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>'
             '<linearGradient id="rbp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb3d9"/><stop offset=".25" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#9ff0c8"/><stop offset=".75" stop-color="#a8d8ff"/><stop offset="1" stop-color="#c7b3ff"/></linearGradient>'
             '<linearGradient id="holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd1f0"/><stop offset=".35" stop-color="#b5f2ff"/><stop offset=".6" stop-color="#fff4c9"/><stop offset="1" stop-color="#e3d4ff"/></linearGradient>')
    n_b = len(GEOM)
    C = round(START + (n_b - 1) * PERIOD + SHOOT + LAND + HOLD + EXIT + .5, 2)
    P = lambda t: f'{max(0, min(C, t)) / C * 100:.3f}%'
    css, beams, hits, bursts = IDLE_CSS, '', [], ''
    last = None
    for bi, ((ox, oy), ang) in enumerate(GEOM):
        theme = THEME_ORDER[bi]; band = BAND[theme]; edge = THEMES[theme][0]
        ex = EXITS[bi % 4]
        t0 = START + bi * PERIOD; tl = t0 + SHOOT; tr = tl + LAND; te = tr + HOLD
        hits.append(tl)
        name = f'b{bi}'
        toks, last = tape_tokens(theme, 11, last)
        flip = ' rotate(180)' if math.cos(math.radians(ang)) < 0 else ''
        x, items = 60, ''
        for k, (body, w, idle) in enumerate(toks):
            cx = x + w / 2
            tk = f'{name}k{k}'
            tw0 = tl + (L - cx) / 3200
            sg = R.choice([-1, 1])
            kf = [(0, 'none'), (tw0, 'none'), (tw0 + .05, f'translateY(-8px) scale(1.38) rotate({sg * 10}deg)'),
                  (tw0 + .12, f'scale(.88) rotate({-sg * 4}deg)'), (tw0 + .2, 'none')]
            if ex == 'shatter':
                a = R.uniform(0, 2 * math.pi); dd = R.uniform(280, 560)
                kf += [(te + k * .012, 'none'), (te + k * .012 + .04, 'scale(1.3)'),
                       (te + k * .012 + EXIT + .08, f'translate({math.cos(a) * dd:.0f}px,{math.sin(a) * dd:.0f}px) rotate({R.uniform(-600, 600):.0f}deg) scale(.2);opacity:0')]
            kf += [(C, kf[-1][1])]
            css += (f'@keyframes {tk}{{' + ''.join(f'{P(tt)}{{transform:{v}}}' for tt, v in kf) + '}'
                    f'.{tk}{{transform-box:fill-box;transform-origin:center;animation:{tk} {C}s linear infinite}}')
            lag = (L - cx) * .32
            sl = (L - cx) / 9000
            css += (f'@keyframes a{tk}{{0%,{P(t0)}{{transform:translateX({-lag:.0f}px) scaleX(1.5)}}{P(tl + .02)}{{transform:translateX({-lag * .15:.0f}px) scaleX(1.2)}}'
                    f'{P(tl + .09 + sl)}{{transform:translateX({lag * .12:.0f}px) scaleX(.85)}}{P(tl + .17 + sl)}{{transform:translateX({-lag * .03:.0f}px)}}{P(tl + .25 + sl)},100%{{transform:none}}}}'
                    f'.a{tk}{{animation:a{tk} {C}s linear infinite}}')
            dl, du = R.uniform(0, 1.6), R.uniform(.8, 1.25)
            items += (f'<g transform="translate({cx:.1f} 0){flip}"><g class="a{tk}"><g class="{tk}">'
                      f'<g class="i {idle}" style="animation-delay:-{dl:.2f}s;animation-duration:{du:.2f}s">{body}</g></g></g></g>')
            x += w + 12
            items += f'<g class="{name}bd" transform="translate({x + 4:.1f} 0) rotate(45)"><rect class="sep i" x="-3.5" y="-3.5" width="7" height="7" fill="{edge}"/></g>'
            x += 20
        bnd = (f'<rect x="-40" y="{-BH / 2}" width="{L + 40}" height="{BH}" fill="{band}" opacity=".94"/>'
               f'<rect x="-40" y="{-BH / 2}" width="{L + 40}" height="{BH * .42:.0f}" fill="#fff" opacity=".05"/>'
               f'<rect x="-40" y="{-BH / 2}" width="{L + 40}" height="2.5" fill="{edge}"/>'
               f'<rect x="-40" y="{BH / 2 - 2.5}" width="{L + 40}" height="2.5" fill="{edge}"/>')
        if ex == 'shatter':
            css += (f'@keyframes {name}bd{{0%,{P(te + .02)}{{opacity:1}}{P(te + .16)},100%{{opacity:0}}}}.{name}bd{{animation:{name}bd {C}s linear infinite}}')
            bnd = f'<g class="{name}bd">{bnd}</g>'
        head = (f'<g class="h{name}"><ellipse cx="{L}" cy="0" rx="110" ry="{BH * .8:.0f}" fill="{edge}" filter="url(#soft)"/>'
                f'<ellipse cx="{L}" cy="0" rx="42" ry="{BH * .3:.0f}" fill="#fff"/></g>')
        off = -L - 160
        mv = [(0, 0, f'translateX({off}px) skewX(-35deg) scale(1.3,.3)'), (t0 - .001, 0, f'translateX({off}px) skewX(-35deg) scale(1.3,.3)'),
              (t0, 1, f'translateX({off}px) skewX(-35deg) scale(1.3,.3)'),
              (tl, 1, 'translateX(32px) skewX(12deg) scale(1,1.6)'), (tl + .06, 1, 'translateX(-12px) skewX(-5deg) scale(1,.75)'),
              (tl + .11, 1, 'translateX(5px) scale(1,1.12)'), (tr, 1, 'translateX(0px) scale(1,1)'), (te, 1, 'translateX(40px) scale(1,1)')]
        if ex == 'through':
            mv += [(te + .05, 1, 'translateX(26px) scale(1,1.25)'), (te + EXIT, 1, f'translateX({L + 320}px) skewX(-35deg) scale(1.3,.3)'), (te + EXIT + .01, 0, 'translateX(0) scale(0)')]
        elif ex == 'retract':
            mv += [(te + .06, 1, 'translateX(70px) scale(1,1.2)'), (te + EXIT, 1, f'translateX({off}px) skewX(35deg) scale(1.3,.3)'), (te + EXIT + .01, 0, f'translateX({off}px)')]
        elif ex == 'shut':
            mv += [(te + .05, 1, 'translateX(44px) scale(1,1.7)'), (te + EXIT * .7, 1, 'translateX(48px) scale(1.05,.04)'), (te + EXIT, 0, 'translateX(50px) scale(1.1,0)')]
        else:
            mv += [(te + .04, 1, 'translateX(42px) scale(1,1.12)'), (te + EXIT + .12, 1, 'translateX(44px)')]
        mv += [(C, mv[-1][1], mv[-1][2])]
        css += (f'@keyframes {name}{{' + ''.join(f'{P(tt)}{{opacity:{op};transform:{tr_}}}' for tt, op, tr_ in mv) + '}'
                f'.{name}{{animation:{name} {C}s linear infinite}}'
                f'@keyframes h{name}{{0%,{P(tl)}{{opacity:1}}{P(tl + .1)},100%{{opacity:0}}}}.h{name}{{animation:h{name} {C}s linear infinite}}'
                f'@keyframes f{name}{{0%,{P(tl - .001)}{{opacity:0}}{P(tl)}{{opacity:.9}}{P(tl + .18)},100%{{opacity:0}}}}.f{name}{{animation:f{name} {C}s linear infinite}}')
        flash = f'<rect class="f{name}" x="-40" y="{-BH / 2}" width="{L + 40}" height="{BH}" fill="#fff"/>'
        beams += (f'<g transform="translate({ox} {oy}) rotate({ang})"><g class="{name}"><g class="wv" style="animation-delay:-{R.uniform(0, .6):.2f}s">'
                  f'{bnd}{items}{flash}</g>{head}</g></g>')
        ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        ins = [q for q in range(0, L, 4) if 0 <= ox + ca * q <= W and 0 <= oy + sa * q <= H]
        q = ins[-1] if ins else L * .7
        ix, iy = ox + ca * q, oy + sa * q
        sp = ''.join(f'<line x1="{math.cos(a) * 14:.1f}" y1="{math.sin(a) * 14:.1f}" x2="{math.cos(a) * (34 + R.uniform(0, 26)):.1f}" y2="{math.sin(a) * (34 + R.uniform(0, 26)):.1f}"/>'
                     for a in [j * math.pi / 7 + R.uniform(-.15, .15) for j in range(14)])
        bursts += (f'<g transform="translate({ix:.0f} {iy:.0f})"><g class="x{name}"><circle r="30" fill="none" stroke="{edge}" stroke-width="4"/>'
                   f'<circle r="16" fill="#fff"/><g stroke="#fff" stroke-width="3" stroke-linecap="round">{sp}</g>'
                   f'<g stroke="{edge}" stroke-width="2" stroke-linecap="round" transform="rotate(12) scale(1.5)">{sp}</g></g></g>')
        css += (f'@keyframes x{name}{{0%,{P(tl - .001)}{{opacity:0;transform:scale(.2)}}{P(tl)}{{opacity:1;transform:scale(.4)}}'
                f'{P(tl + .3)},100%{{opacity:0;transform:scale(1.7)}}}}.x{name}{{animation:x{name} {C}s ease-out infinite}}')
    ks = {0: 'none'}
    for h in hits:
        a = R.uniform(0, 2 * math.pi)
        ks[round(h / C * 100, 3)] = f'translate({math.cos(a) * 6:.1f}px,{math.sin(a) * 6:.1f}px)'
        ks[round((h + .04) / C * 100, 3)] = f'translate({-math.cos(a) * 3:.1f}px,{-math.sin(a) * 3:.1f}px)'
        ks[round((h + .08) / C * 100, 3)] = 'none'
    ks[100] = 'none'
    css += '@keyframes cam{' + ''.join(f'{k}%{{transform:{v}}}' for k, v in sorted(ks.items())) + '}' + f'#cam{{animation:cam {C}s steps(1) infinite}}'
    defs += ''.join(DEFS) + ''.join(f'<path id="{i}" d="{d}"/>' for d, i in _REF.items())
    halo = f'<ellipse cx="{W / 2}" cy="{BASE - 45}" rx="400" ry="100" fill="url(#halo)"/>'
    gk = {0: '.3'}
    for h_ in hits:
        gk[round(h_ / C * 100, 3)] = '1'; gk[round((h_ + .25) / C * 100, 3)] = '.3'
    gk[100] = '.3'
    css += '@keyframes hp{' + ''.join(f'{k}%{{opacity:{v}}}' for k, v in sorted(gk.items())) + '}'
    css += f'.hp{{animation:hp {C}s linear infinite}}'
    pulse = f'<ellipse class="hp" cx="{W / 2}" cy="{BASE - 45}" rx="330" ry="80" fill="url(#glw)" opacity=".3"/>'
    streaks = ''
    for j in range(16):
        y = R.uniform(0, H); ln = R.uniform(60, 200); dur = R.uniform(.5, 1.3); a = R.choice([-8, -4, 0, 4, 8, 172, 176, 180, 184, 188])
        col = R.choice(['#fff', '#ffb3d9', '#a8d8ff', '#9ff0c8', '#ffe9a3'])
        streaks += (f'<g transform="translate({W / 2:.0f} {y:.0f}) rotate({a})"><rect class="sk" x="-700" y="-.75" width="{ln:.0f}" height="1.5" fill="{col}" opacity="{R.uniform(.25, .6):.2f}" '
                    f'style="animation-duration:{dur:.2f}s;animation-delay:-{R.uniform(0, dur):.2f}s"/></g>')
    css += '.sk{animation:sk 1s linear infinite}@keyframes sk{from{transform:translateX(0)}to{transform:translateX(1400px)}}'
    out = svg(H, defs, css, stars(H, 21) + streaks + f'<g id="cam">{beams}{bursts}{halo}{pulse}{lg}</g>')
    open(os.path.join(OUT, 'header8.svg'), 'w', encoding='utf-8').write(out)
    print('header8', len(out) // 1024, 'KB cycle', C, 'unique', len(USED))

    # style sheet for review: all 20 styles side by side
    cells = ''
    for j, st in enumerate(STYLES):
        b, w = st('#ffb3d9', '#a8d8ff')
        cells += f'<g transform="translate({110 + (j % 5) * 155} {50 + (j // 5) * 62})">{b}</g>'
    sheet = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 290" width="840" height="290"><defs>{defs}{"".join(DEFS)}'
             + ''.join(f'<path id="{i}" d="{d}"/>' for d, i in _REF.items()) + f'</defs><rect width="840" height="290" fill="{BAND["candy"]}"/>{cells}</svg>')
    open(os.path.join(OUT, 'styles8.svg'), 'w', encoding='utf-8').write(sheet)

build()
