"""Header v5: every 1337 is unique and is SHOT from a corner. Volleys build a strip, the strip
gets blown apart, the next volley fires from another corner."""
import os, math, random
from fontTools.ttLib import TTFont
import gen
from gen import text, W, VOID, OUT
from gen2 import logo_block, stars, svg

FD = gen.FD
for k, f in dict(monoton='Monoton-Regular.ttf', bshade='BungeeShade-Regular.ttf', faster='FasterOne-Regular.ttf',
                 pacifico='Pacifico-Regular.ttf', rmono='RubikMonoOne-Regular.ttf', blackops='BlackOpsOne-Regular.ttf',
                 righteous='Righteous-Regular.ttf', bungee='Bungee-Regular.ttf', shrikhand='Shrikhand-Regular.ttf',
                 rampart='RampartOne-Regular.ttf', bowlby='BowlbyOne-Regular.ttf', sixcaps='SixCaps.ttf',
                 binline='BungeeInline-Regular.ttf', beastly='RubikBeastly-Regular.ttf', wet='RubikWetPaint-Regular.ttf').items():
    gen._fonts[k] = TTFont(os.path.join(FD, f))

H, BASE = 336, 192
R = random.Random(1337)

SOFT = ['#ffb38a', '#9ff0c8', '#c7b3ff', '#ffb3d9', '#a8d8ff', '#ffe9a3', '#ff8a80', '#b5f2ff', '#ffd1a8',
        '#d4ffb3', '#f7c6ff', '#9fd6ff', '#ffc4c4', '#c9f7e1', '#e3d4ff', '#fff0b3']
ACID = ['#b6ff00', '#ff00cc', '#00e5ff', '#ffe600', '#ff3b00']

def dark(c, k=.5):
    r, g, b = (int(c[i:i + 2], 16) for i in (1, 3, 5))
    return f'#{int(r * k):02x}{int(g * k):02x}{int(b * k):02x}'

_REF = {}
def ref(d):
    if d not in _REF: _REF[d] = f'g{len(_REF)}'
    return _REF[d]

GRAD = []
def grad(c1, c2):
    i = f'gr{len(GRAD)}'
    GRAD.append(f'<linearGradient id="{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>')
    return i

# ---------------------------------------------------------------- treatments: (font path id, w, size, colour, colour2) -> svg centred
def u(i, a=''): return f'<use href="#{i}" {a}/>'
def T_flat(i, w, s, c, c2):      return u(i, f'fill="{c}" stroke="#14001f" stroke-width="{s * .09:.1f}" stroke-linejoin="round" paint-order="stroke"')
def T_long(i, w, s, c, c2):      return ''.join(u(i, f'transform="translate({k} {k})" fill="{dark(c, .45)}"') for k in range(8, 0, -1)) + u(i, f'fill="{c}"')
def T_sticker(i, w, s, c, c2):   return f'<g filter="url(#ds)">' + u(i, f'fill="#fff" stroke="#fff" stroke-width="{s * .34:.1f}" stroke-linejoin="round"') + u(i, f'fill="{c}" stroke="{dark(c, .35)}" stroke-width="{s * .06:.1f}" paint-order="stroke"') + '</g>'
def T_stack(i, w, s, c, c2):     return ''.join(u(i, f'transform="translate({k * .8:.1f} {k * .8:.1f})" fill="{dark(c, .4 + k * .04)}"') for k in range(9, 0, -1)) + u(i, f'fill="#fff8ef" stroke="{dark(c, .35)}" stroke-width="1.4"')
def T_candy(i, w, s, c, c2):     return u(i, f'transform="translate(0 4)" fill="{dark(c, .45)}" stroke="{dark(c, .45)}" stroke-width="{s * .2:.1f}" stroke-linejoin="round"') + u(i, f'fill="{c}" stroke="#fff" stroke-width="{s * .2:.1f}" stroke-linejoin="round" paint-order="stroke"')
def T_chrome(i, w, s, c, c2):    return u(i, f'transform="translate(3 4)" fill="{c}"') + u(i, 'fill="url(#chrome)" stroke="#13223d" stroke-width="3" paint-order="stroke"')
def T_neon(i, w, s, c, c2):      return '<g filter="url(#glow)">' + u(i, f'fill="none" stroke="{c}" stroke-width="2.4"') + '</g>' + u(i, 'fill="none" stroke="#fff" stroke-width=".8"')
def T_outline(i, w, s, c, c2):   return u(i, f'transform="translate(4 3)" fill="none" stroke="{c2}" stroke-width="2"') + u(i, f'fill="none" stroke="{c}" stroke-width="2.4"')
def T_rgb(i, w, s, c, c2):       return u(i, 'transform="translate(-4 0)" fill="#ff00cc" opacity=".9"') + u(i, 'transform="translate(4 0)" fill="#00e5ff" opacity=".9"') + u(i, f'fill="{c}"')
def T_grad(i, w, s, c, c2):      return u(i, f'transform="translate(2 3)" fill="#000" opacity=".5"') + u(i, f'fill="url(#{grad(c, c2)})" stroke="#14001f" stroke-width="1.5" paint-order="stroke"')
def T_pop(i, w, s, c, c2):       return u(i, 'transform="translate(6 6)" fill="#000"') + u(i, f'transform="translate(3 3)" fill="{c2}"') + u(i, f'fill="{c}"')
def T_pill(i, w, s, c, c2):
    p, h = s * .4, s * 1.25
    return (f'<rect x="{-w / 2 - p:.1f}" y="{-s * .36 - h / 2 + 3:.1f}" width="{w + 2 * p:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{dark(c, .45)}"/>'
            f'<rect x="{-w / 2 - p:.1f}" y="{-s * .36 - h / 2:.1f}" width="{w + 2 * p:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{c}"/>' + u(i, 'fill="#2a1840"'))
def T_stamp(i, w, s, c, c2):
    p, h = s * .25, s * 1.15
    return (f'<rect x="{-w / 2 - p:.1f}" y="{-s * .36 - h / 2:.1f}" width="{w + 2 * p:.1f}" height="{h:.1f}" rx="4" fill="none" stroke="{c}" stroke-width="3.5" stroke-dasharray="14 2 30 3"/>'
            + u(i, f'fill="{c}" opacity=".92"'))
def T_marker(i, w, s, c, c2):
    h = s * .62
    return (f'<rect x="{-w / 2 - 6:.1f}" y="{-s * .36 - h / 2 + 4:.1f}" width="{w + 12:.1f}" height="{h:.1f}" fill="{c}" transform="skewX(-14)" opacity=".85"/>'
            + u(i, 'fill="#14001f" stroke="#fff" stroke-width="2" paint-order="stroke"'))

TREAT = dict(flat=T_flat, long=T_long, sticker=T_sticker, stack=T_stack, candy=T_candy, chrome=T_chrome, neon=T_neon,
             outline=T_outline, rgb=T_rgb, grad=T_grad, pop=T_pop, pill=T_pill, stamp=T_stamp, marker=T_marker)
THIN = {'monoton', 'bshade', 'faster', 'sixcaps', 'binline', 'rampart'}
THIN_OK = {'flat', 'neon', 'grad', 'long', 'rgb', 'pill', 'marker', 'pop'}
FONTS = ['unb', 'lob', 'glitch', 'marck', 'pang', 'marker', 'mono', 'monoton', 'bshade', 'faster', 'pacifico', 'rmono',
         'blackops', 'righteous', 'bungee', 'shrikhand', 'rampart', 'bowlby', 'sixcaps', 'binline', 'beastly', 'wet']

def make_tokens(n):
    combos = [(f, t) for f in FONTS for t in TREAT if not (f in THIN and t not in THIN_OK)]
    R.shuffle(combos)
    out, used_f, used_t = [], [], []
    while len(out) < n:
        for j, (f, t) in enumerate(combos):
            if f not in used_f[-6:] and t not in used_t[-5:]:
                break
        f, t = combos.pop(j)
        used_f.append(f); used_t.append(t)
        acid = R.random() < .18
        c = R.choice(ACID if acid else SOFT)
        c2 = R.choice([x for x in (SOFT + ACID) if x != c])
        out.append((f, t, c, c2))
    return out

def render_token(f, t, c, c2, target_w):
    d40, w40 = text(f, '1337', 40, 0, 0, 1.5)
    s = max(24, min(58, 40 * target_w / w40))
    if f == 'sixcaps': s = min(s * 1.0, 54)
    d, w = text(f, '1337', s, -0, 0, s * .04)
    # centre: x shift -w/2, baseline at +0.36s
    d, w = text(f, '1337', s, -w / 2, s * .36, s * .04)
    return TREAT[t](ref(d), w, s, c, c2), w, s

# ---------------------------------------------------------------- volleys
CORNERS = dict(tl=(-80, -80), tr=(W + 80, -80), bl=(-80, H + 80), br=(W + 80, H + 80),
               l=(-120, 160), r=(W + 120, 160), t=(420, -100), b=(420, H + 100))
TOP, BOT = 44, 294

def band(y, n, x0=82, x1=758, jit=8):
    return [(x0 + (x1 - x0) * k / (n - 1), y + R.uniform(-jit, jit)) for k in range(n)]

VOLLEYS = [  # (landing spots, source per token)
    (band(TOP, 6), ['tl'] * 6),
    (band(BOT, 6), ['br'] * 6),
    ([(60, 72), (64, 168), (60, 264), (780, 72), (776, 168), (780, 264)], ['br', 'br', 'tr', 'tl', 'bl', 'bl']),
    (band(TOP, 6)[::-1], ['r'] * 6),
    (band(BOT, 6), ['bl'] * 6),
    ([(110, TOP), (730, BOT), (300, TOP + 6), (540, BOT - 4), (540, TOP), (300, BOT)], ['br', 'tl', 'bl', 'tr', 'b', 't']),
    (band(TOP, 6)[::-1], ['tr'] * 6),
    (band(BOT, 6), ['l'] * 6),
]
START, PERIOD = .55, 2.2
SHOT_GAP, FLY = .11, .17
HOLD_AFTER_LAST = 1.35
BLAST = .38

def build():
    n_tok = sum(len(v[0]) for v in VOLLEYS)
    toks = make_tokens(n_tok)
    last_end = START + (len(VOLLEYS) - 1) * PERIOD + 6 * SHOT_GAP + FLY + HOLD_AFTER_LAST + BLAST + .2
    C = round(last_end + .1, 2)
    P = lambda t: f'{t / C * 100:.3f}%'

    defs, lg, _ = logo_block(118, W / 2, BASE)
    defs += (f'<radialGradient id="halo"><stop offset="0" stop-color="{VOID}" stop-opacity=".9"/><stop offset=".6" stop-color="{VOID}" stop-opacity=".5"/>'
             f'<stop offset="1" stop-color="{VOID}" stop-opacity="0"/></radialGradient>'
             '<filter id="ds" x="-20%" y="-30%" width="140%" height="170%"><feDropShadow dx="2" dy="4" stdDeviation="2.5" flood-color="#000" flood-opacity=".55"/></filter>'
             '<filter id="glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/>'
             '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
             '<linearGradient id="trc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>')
    css = '.bob{animation:bob 1.3s ease-in-out infinite alternate}@keyframes bob{from{transform:translateY(-2.5px) rotate(-2deg)}to{transform:translateY(2.5px) rotate(2deg)}}'
    tracers, tokens, fx = '', '', ''
    hits = []
    ti = 0
    for vi, (spots, srcs) in enumerate(VOLLEYS):
        v0 = START + vi * PERIOD
        n = len(spots)
        t_blast = v0 + (n - 1) * SHOT_GAP + FLY + HOLD_AFTER_LAST
        for k, ((lx, ly), src) in enumerate(zip(spots, srcs)):
            f, t, c, c2 = toks[ti]
            tw = R.uniform(98, 128) if t not in ('pill', 'stamp', 'marker') else R.uniform(78, 96)
            body, w, s = render_token(f, t, c, c2, tw)
            ox, oy = CORNERS[src]
            vx, vy = ox - lx, oy - ly
            th = math.degrees(math.atan2(vy, vx))
            ts = v0 + k * SHOT_GAP; th_ = ts + FLY
            hits.append(th_)
            rest = R.uniform(-9, 9)
            spin = R.choice([-1, 1]) * R.uniform(180, 540)
            ea = R.uniform(0, 2 * math.pi); ed = R.uniform(380, 650)
            ex, ey = math.cos(ea) * ed, math.sin(ea) * ed
            tb = t_blast + k * .035
            name = f't{ti}'
            def tf(x, y, sx, sy, b, op):
                return f'opacity:{op};transform:translate({x:.0f}px,{y:.0f}px) rotate({th:.1f}deg) scale({sx},{sy}) rotate({-th + b:.1f}deg)'
            kf = [(0, tf(vx, vy, 2.8, .45, spin, 0)), (ts - .001, tf(vx, vy, 2.8, .45, spin, 0)), (ts, tf(vx, vy, 2.8, .45, spin, 1)),
                  (th_, tf(0, 0, 1.55, .6, rest, 1)), (th_ + .07, tf(0, 0, .82, 1.2, rest, 1)), (th_ + .15, tf(0, 0, 1.08, .95, rest, 1)),
                  (th_ + .24, tf(0, 0, 1, 1, rest, 1)), (tb, tf(0, 0, 1, 1, rest, 1)), (tb + .07, tf(0, 0, 1.3, 1.3, rest, 1)),
                  (tb + BLAST, tf(ex, ey, .15, .15, rest + spin, 0)), (C, tf(ex, ey, .15, .15, rest + spin, 0))]
            css += f'@keyframes {name}{{' + ''.join(f'{P(tt)}{{{v}}}' for tt, v in kf) + '}'
            css += f'.{name}{{animation:{name} {C}s linear infinite}}'
            tokens += (f'<g transform="translate({lx:.0f} {ly:.0f})"><g class="{name}">'
                       f'<g class="bob" style="animation-delay:-{R.uniform(0, 1.3):.2f}s">{body}</g></g></g>')
            # tracer: tapered beam from corner to the landing spot
            L = math.hypot(vx, vy)
            tracers += (f'<g transform="translate({lx:.0f} {ly:.0f}) rotate({th + 180:.1f})"><g class="r{name}">'
                        f'<polygon points="{-L:.0f},0 0,-{s * .32:.1f} 6,0 0,{s * .32:.1f}" fill="url(#trc)"/>'
                        f'<polygon points="{-L:.0f},0 0,-{s * .12:.1f} 0,{s * .12:.1f}" fill="{c}"/></g></g>')
            css += (f'@keyframes r{name}{{0%,{P(ts - .001)}{{opacity:0;transform:scaleX(0)}}{P(ts + .02)}{{opacity:.9;transform:scaleX(.2)}}'
                    f'{P(th_)}{{opacity:1;transform:scaleX(1)}}{P(th_ + .16)},100%{{opacity:0;transform:scaleX(1) scaleY(.1)}}}}'
                    f'.r{name}{{transform-origin:0 0;animation:r{name} {C}s linear infinite}}')
            # impact: ring + sparks
            sp = ''.join(f'<line x1="{math.cos(a) * 10:.1f}" y1="{math.sin(a) * 10:.1f}" x2="{math.cos(a) * 22:.1f}" y2="{math.sin(a) * 22:.1f}"/>'
                         for a in [j * math.pi / 4 + R.uniform(-.2, .2) for j in range(8)])
            fx += (f'<g transform="translate({lx:.0f} {ly:.0f})"><g class="i{name}">'
                   f'<circle r="{w * .45:.0f}" fill="none" stroke="{c}" stroke-width="3"/>'
                   f'<g stroke="#fff" stroke-width="2.4" stroke-linecap="round" transform="scale({w / 36:.2f})">{sp}</g></g>'
                   f'<g class="b{name}"><g stroke="{c}" stroke-width="2" stroke-linecap="round" transform="scale({w / 50:.2f})">{sp}</g></g></g>')
            css += (f'@keyframes i{name}{{0%,{P(th_ - .001)}{{opacity:0;transform:scale(.2)}}{P(th_)}{{opacity:1;transform:scale(.3)}}'
                    f'{P(th_ + .28)},100%{{opacity:0;transform:scale(1.5)}}}}.i{name}{{animation:i{name} {C}s ease-out infinite}}'
                    f'@keyframes b{name}{{0%,{P(tb + .05)}{{opacity:0;transform:scale(.3)}}{P(tb + .07)}{{opacity:1;transform:scale(.5)}}'
                    f'{P(tb + .32)},100%{{opacity:0;transform:scale(2.2)}}}}.b{name}{{animation:b{name} {C}s ease-out infinite}}')
            ti += 1
    # camera jolt on every hit
    ks = {0: 'none'}
    for h in hits:
        a = R.uniform(0, 2 * math.pi)
        ks[round(h / C * 100, 3)] = f'translate({math.cos(a) * 3:.1f}px,{math.sin(a) * 3:.1f}px)'
        ks[round((h + .06) / C * 100, 3)] = 'none'
    ks[100] = 'none'
    css += '@keyframes cam{' + ''.join(f'{k}%{{transform:{v}}}' for k, v in sorted(ks.items())) + '}'
    css += f'#cam{{animation:cam {C}s steps(1) infinite}}'
    defs += ''.join(GRAD) + ''.join(f'<path id="{i}" d="{d}"/>' for d, i in _REF.items())
    halo = f'<ellipse cx="{W / 2}" cy="{BASE - 45}" rx="380" ry="95" fill="url(#halo)"/>'
    out = svg(H, defs, css, stars(H, 21) + f'<g id="cam">{halo}{tracers}{tokens}{fx}{lg}</g>')
    open(os.path.join(OUT, 'header5.svg'), 'w', encoding='utf-8').write(out)
    print('header5', len(out) // 1024, 'KB cycle', C, 'tokens', n_tok)
    for x in toks: print(' ', x)

if __name__ == "__main__":
    build()
