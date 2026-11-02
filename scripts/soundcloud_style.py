"""SoundCloud-like building blocks shared by the Other Apps card and the playlist player."""
import base64
import math
import os
import random

ICON_DIR = os.path.join(os.path.dirname(__file__), '..', 'icons')
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
ORANGE, ORANGE_LIGHT = '#ff5500', '#ff8800'
THEMES = {
    'dark': dict(bg='#0d1117', fg='#e6edf3', mu='#8b949e', line='#30363d', un='#3d444d', unr='#21262d', box='#161b22'),
    'light': dict(bg='#ffffff', fg='#1f2328', mu='#656d76', line='#d0d7de', un='#d0d7de', unr='#eaeef2', box='#f6f8fa'),
}
# gradients the waveform's played part refers to; put them into each SVG's <defs>
GRADIENT_DEFS = (f'<linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ORANGE_LIGHT}"/>'
                 f'<stop offset="1" stop-color="{ORANGE}"/></linearGradient>'
                 f'<linearGradient id="plr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{ORANGE}" stop-opacity=".5"/>'
                 f'<stop offset="1" stop-color="{ORANGE_LIGHT}" stop-opacity=".2"/></linearGradient>')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def clip_text(s, n):
    return s if len(s) <= n else s[:n - 1] + '…'


def icon_uri(file, colour=None):
    """An icon from icons/ as a data URI; mono simple-icons get recoloured through `colour`."""
    path = os.path.join(ICON_DIR, file)
    raw = open(path, 'rb').read()
    if colour and file.endswith('.svg'):
        raw = raw.replace(b'<svg ', f'<svg fill="{colour}" '.encode(), 1)
    mime = 'image/png' if file.endswith('.png') else 'image/svg+xml'
    return f'data:{mime};base64,' + base64.b64encode(raw).decode()


def wave(x, y, w, h, seed, played, t):
    """Waveform as four paths: bars above a baseline plus a pale reflection, orange up to `played` (0..1)."""
    rnd = random.Random(seed)
    n = int(w // 3)
    v = .5
    d = {'on': [], 'off': [], 'on_r': [], 'off_r': []}
    for i in range(n):
        v = .65 * v + .35 * rnd.random()
        k = max(.15, min(1, v * (.6 + .4 * math.sin(math.pi * (i + 2) / (n + 4))) * 1.5))
        top, ref = h * .72 * k, h * .28 * k
        bx = x + i * 3
        side = 'on' if i / n < played else 'off'
        d[side].append(f'M{bx:.0f} {y + h * .72 - top:.1f}h2v{top:.1f}h-2z')
        d[side + '_r'].append(f'M{bx:.0f} {y + h * .72 + 1:.1f}h2v{ref:.1f}h-2z')
    fill = {'on': 'url(#pl)', 'off': t['un'], 'on_r': 'url(#plr)', 'off_r': t['unr']}
    return ''.join(f'<path d="{"".join(p)}" fill="{fill[k]}"/>' for k, p in d.items() if p)


def play_button(cx, cy, r=15):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{ORANGE}" fill-opacity=".92"/>'
            f'<path d="M{cx - r * .27:.1f} {cy - r * .4:.1f} L{cx + r * .4:.1f} {cy} L{cx - r * .27:.1f} {cy + r * .4:.1f}z" fill="#fff"/>')
