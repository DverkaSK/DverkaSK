"""Header v3: logo + flying 1337 tape strips in different colours and directions."""
import os, math
from gen import text, W, VOID, MAG, CYAN, YEL, LIME, OUT
from gen2 import logo_block, stars, svg, pc, P, T0

def star(cx, s):
    return f'M{cx:.1f} {-s:.1f}Q{cx:.1f} 0 {cx + s:.1f} 0Q{cx:.1f} 0 {cx:.1f} {s:.1f}Q{cx:.1f} 0 {cx - s:.1f} 0Q{cx:.1f} 0 {cx:.1f} {-s:.1f}Z'

def strip(idx, yc, ang, h, band, ink, fnt, speed, dirn, t_in, word='1337', outline=False, op=1, x_off=0, L=1500):
    """One tape. Returns (defs, css, body)."""
    size = h * (.62 if band else 1)
    d, w = text(fnt, word, size, 0, 0, size * .04)
    # baseline so caps sit centred in the band
    base = size * .36
    gap = size * .55; s = size * .17
    u = w + gap * 2
    unit = f'<path id="u{idx}" d="{d} {star(w + gap, s)}"/>'
    n = int(math.ceil((L + 2 * u) / u)) + 1
    x0 = -L / 2 - u
    uses = ''.join(f'<use href="#u{idx}" x="{x0 + k * u:.1f}" y="{base:.1f}"/>' for k in range(n))
    paint = (f'fill="none" stroke="{ink}" stroke-width="2"' if outline else f'fill="{ink}"')
    dur = u / speed
    sign = -1 if dirn < 0 else 1
    css = (f'.m{idx}{{animation:m{idx} {dur:.2f}s linear infinite}}'
           f'@keyframes m{idx}{{from{{transform:translateX({0 if sign < 0 else -u:.1f}px)}}to{{transform:translateX({-u if sign < 0 else 0:.1f}px)}}}}'
           f'.i{idx}{{animation:i{idx} .7s cubic-bezier(.15,.9,.25,1) {t_in:.2f}s both}}'
           f'@keyframes i{idx}{{from{{transform:translateX({-sign * 1700}px) scaleY(.15)}}60%{{transform:translateX({sign * 30}px) scaleY(1.3)}}to{{transform:none}}}}')
    bandr = ''
    if band:
        bandr = (f'<rect x="{-L / 2}" y="{-h / 2:.1f}" width="{L}" height="{h:.1f}" fill="{band}"/>'
                 f'<rect x="{-L / 2}" y="{-h / 2:.1f}" width="{L}" height="2" fill="#fff" opacity=".35"/>'
                 f'<rect x="{-L / 2}" y="{h / 2 - 3:.1f}" width="{L}" height="3" fill="#000" opacity=".3"/>')
    body = (f'<g transform="translate({W / 2 + x_off:.0f} {yc}) rotate({ang})" opacity="{op}">'
            f'<g class="i{idx}"><g class="kick" style="animation-delay:{T0 + idx * .025:.3f}s">{bandr}'
            f'<g class="m{idx}" {paint}>{uses}</g></g></g></g>')
    return unit, css, body

KICK = f'''
.kick{{animation:kick {P}s infinite both}}
@keyframes kick{{0%,{pc(4.55)},{pc(5.0)},100%{{transform:none;filter:none}}{pc(4.6)}{{transform:translateY(-10px) scaleY(1.35);filter:brightness(1.6)}}{pc(4.75)}{{transform:translateY(4px) scaleY(.9)}}}}
.halo{{pointer-events:none}}
'''

def build(name, H, base, strips):
    defs, lg, _ = logo_block(118, W / 2, base)
    defs += (f'<radialGradient id="halo"><stop offset="0" stop-color="{VOID}" stop-opacity=".92"/><stop offset=".6" stop-color="{VOID}" stop-opacity=".6"/>'
             f'<stop offset="1" stop-color="{VOID}" stop-opacity="0"/></radialGradient>')
    css, body = KICK, ''
    for i, st in enumerate(strips):
        u, c, b = strip(i, **st)
        defs += u; css += c; body += b
    halo = f'<ellipse cx="{W / 2}" cy="{base - 42}" rx="400" ry="105" fill="url(#halo)"/>'
    out = svg(H, defs, css, stars(H, 9) + body + halo + lg)
    open(os.path.join(OUT, f'header3-{name}.svg'), 'w', encoding='utf-8').write(out)
    print(name, len(out) // 1024, 'KB')

ORANGE, PURPLE = '#ff7a00', '#9b5cff'

# E: tapes at moderate angles, crossing behind the logo
build('e', 300, 168, [
    dict(yc=70, ang=-30, h=60, band=None, ink=CYAN, fnt='unb', speed=90, dirn=1, t_in=.0, outline=True, op=.35),
    dict(yc=250, ang=22, h=56, band=None, ink=MAG, fnt='glitch', speed=110, dirn=-1, t_in=.08, outline=True, op=.35),
    dict(yc=42, ang=-6, h=34, band=YEL, ink='#000', fnt='unb', speed=260, dirn=-1, t_in=.12),
    dict(yc=268, ang=5, h=36, band=MAG, ink='#fff', fnt='unb', speed=300, dirn=1, t_in=.2),
    dict(yc=150, ang=-14, h=26, band=LIME, ink='#000', fnt='glitch', speed=380, dirn=1, t_in=.28, op=.9),
    dict(yc=190, ang=11, h=24, band=PURPLE, ink=YEL, fnt='lob', speed=340, dirn=-1, t_in=.34, op=.9),
    dict(yc=105, ang=3, h=22, band=CYAN, ink='#001a33', fnt='marck', speed=200, dirn=1, t_in=.4, op=.85),
    dict(yc=226, ang=-3, h=22, band=ORANGE, ink='#000', fnt='unb', speed=240, dirn=-1, t_in=.46, op=.85),
])

# F: steep criss-cross, faster
build('f', 300, 168, [
    dict(yc=150, ang=-62, h=50, band=None, ink=LIME, fnt='unb', speed=140, dirn=1, t_in=0, outline=True, op=.4, x_off=-300),
    dict(yc=150, ang=62, h=50, band=None, ink=MAG, fnt='unb', speed=140, dirn=-1, t_in=.05, outline=True, op=.4, x_off=300),
    dict(yc=150, ang=-24, h=38, band=YEL, ink='#000', fnt='unb', speed=420, dirn=-1, t_in=.1),
    dict(yc=150, ang=24, h=38, band=MAG, ink='#fff', fnt='unb', speed=420, dirn=1, t_in=.16),
    dict(yc=40, ang=-4, h=28, band=CYAN, ink='#001a33', fnt='glitch', speed=520, dirn=1, t_in=.22),
    dict(yc=268, ang=4, h=28, band=LIME, ink='#000', fnt='glitch', speed=520, dirn=-1, t_in=.28),
    dict(yc=150, ang=-75, h=24, band=ORANGE, ink='#000', fnt='lob', speed=300, dirn=1, t_in=.34, x_off=360),
    dict(yc=150, ang=75, h=24, band=PURPLE, ink=YEL, fnt='lob', speed=300, dirn=-1, t_in=.4, x_off=-360),
])
