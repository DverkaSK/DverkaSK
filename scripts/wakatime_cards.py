"""Generates WakaTime stat cards (dark and light) into the cards/ directory."""
import json
import math
import os
import random
import sys
import time
import urllib.request

import soundcloud_style as sc

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'cards')
FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif"
WIDTH = 495

THEMES = {
    'dark': dict(bg='#0d1117', border='#30363d', title='#58a6ff', text='#c9d1d9', muted='#8b949e',
                 box='#161b22', track='#30363d'),
    'light': dict(bg='#ffffff', border='#d0d7de', title='#0969da', text='#1f2328', muted='#656d76',
                  box='#f6f8fa', track='#d0d7de'),
}
FALLBACK_COLORS = ['#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#84cc16', '#f97316', '#06b6d4']

HIDDEN_LANGUAGES = {'Other', 'textmate', 'Text'}
# Everything WakaTime reports as an "editor" that is not a known dev tool lands on the Other Apps card,
# so new desktop apps show up there by themselves. APP_NAMES only prettifies process names.
DEV_TOOLS = {'IntelliJ IDEA', 'Claude Code', 'GoLand', 'DataGrip', 'Warp', 'CLion', 'VS Code', 'PyCharm', 'RustRover',
             'WebStorm', 'Cursor', 'Rider', 'PhpStorm', 'Android Studio', 'Fleet', 'Zed', 'Xcode', 'Visual Studio',
             'Sublime Text', 'Neovim', 'Vim', 'Emacs', 'Windsurf', 'Terminal', 'iTerm2', 'Windows Terminal'}
APP_NAMES = {'TelegramDesktop': 'Telegram', 'SteamClientWebHelper': 'Steam'}
HIDDEN_EDITORS = {'Unknown Editor', 'ZoomMeetings'}

EDITOR_COLORS = {
    'IntelliJ IDEA': '#2876e1', 'Claude Code': '#d97757', 'GoLand': '#bd4ffc', 'DataGrip': '#907cf2',
    'Warp': '#01a4ff', 'CLion': '#14c9a5', 'VS Code': '#027acd', 'PyCharm': '#d2ee5c',
    'RustRover': '#f46d2d', 'WebStorm': '#00c6d7', 'Cursor': '#7f8c9a',
    'Telegram': '#27a7e7', 'Steam': '#66c0f4', 'Zoom': '#0b5cff',
}
MODEL_COLORS = {
    'Claude': '#d97757', 'Opus': '#b4552d', 'Sonnet': '#e8a26a', 'Haiku': '#f2c894',
    'GPT': '#10a37f', 'Gemini': '#4285f4', 'DeepSeek': '#4d6bfe', 'Grok': '#9ca3af', 'Qwen': '#615ced',
}


def fetch_stats(auth, stats_range):
    req = urllib.request.Request(f'https://wakatime.com/api/v1/users/current/stats/{stats_range}',
                                 headers={'Authorization': auth})
    # WakaTime answers 202 while stats are still being calculated
    for _ in range(6):
        with urllib.request.urlopen(req, timeout=90) as r:
            if r.status == 200:
                data = json.load(r)['data']
                if data.get('is_up_to_date', True):
                    return data
        time.sleep(20)
    return None


def fetch_week_lines(auth):
    """AI/human line changes for the last 7 days including today.

    /stats/last_7_days ends yesterday and is recalculated once a day, while summaries are live
    (same window as the WakaTime dashboard)."""
    req = urllib.request.Request('https://wakatime.com/api/v1/users/current/summaries?range=last_7_days',
                                 headers={'Authorization': auth})
    with urllib.request.urlopen(req, timeout=90) as r:
        days = json.load(r)['data']
    total = lambda f: sum(day['grand_total'].get(f) or 0 for day in days)
    daily = [(day['range']['date'], day['grand_total'].get('total_seconds') or 0) for day in days]
    return (total('ai_additions') + total('ai_deletions'),
            total('human_additions') + total('human_deletions'), daily)


def fetch_language_colors():
    try:
        url = 'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json'
        with urllib.request.urlopen(url, timeout=30) as r:
            return {name: v['color'] for name, v in json.load(r).items() if v.get('color')}
    except Exception as e:
        print(f'Could not load language colors: {e}')
        return {}


def short(n):
    if n >= 1_000_000:
        return f'{n / 1_000_000:.1f}M'.replace('.0M', 'M')
    if n >= 1_000:
        return f'{n / 1_000:.1f}K'.replace('.0K', 'K')
    return str(n)


def hours(seconds):
    h, m = divmod(int(seconds) // 60, 60)
    return f'{h:,}h {m}m' if h else f'{m}m'


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def frame(height, title, subtitle, body, t):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" viewBox="0 0 {WIDTH} {height}" font-family="{FONT}">
  <title>{esc(title)}</title>
  <rect x="0.5" y="0.5" width="{WIDTH - 1}" height="{height - 1}" rx="4.5" fill="{t['bg']}" stroke="{t['border']}"/>
  <text x="20" y="32" fill="{t['title']}" font-size="18" font-weight="600">{esc(title)}</text>
  <text x="{WIDTH - 20}" y="32" fill="{t['muted']}" font-size="12" text-anchor="end">{esc(subtitle)}</text>{body}
</svg>
'''


def visible(color, t):
    """Swaps colors that would blend into the dark background (e.g. JSON's #292929) for a neutral gray."""
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5)) if len(color) == 7 else (128, 128, 128)
    luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return t['muted'] if t is THEMES['dark'] and luminance < 0.2 else color


def breakdown_card(title, subtitle, items, t, limit=10):
    """items: [(name, value, label, color)] sorted desc; bar shows each item's share of the total."""
    total = sum(v for _, v, _, _ in items) or 1
    shown = [(n, v, label, visible(c, t)) for n, v, label, c in items[:limit]]
    bar_x, bar_w = 20, WIDTH - 40
    body = [f'''
  <clipPath id="bar"><rect x="{bar_x}" y="48" width="{bar_w}" height="8" rx="4"/></clipPath>
  <g clip-path="url(#bar)"><rect x="{bar_x}" y="48" width="{bar_w}" height="8" fill="{t['track']}"/>''']
    x = bar_x
    for _, value, _, color in shown:
        w = bar_w * value / total
        body.append(f'<rect x="{x:.2f}" y="48" width="{w + 0.5:.2f}" height="8" fill="{color}"/>')
        x += w
    body.append('</g>')
    for i, (name, _, label, color) in enumerate(shown):
        cx = 20 if i % 2 == 0 else WIDTH // 2 + 10
        y = 84 + (i // 2) * 24
        body.append(f'''
  <circle cx="{cx + 5}" cy="{y - 4}" r="5" fill="{color}"/>
  <text x="{cx + 16}" y="{y}" fill="{t['text']}" font-size="12">{esc(name)} <tspan fill="{t['muted']}">{esc(label)}</tspan></text>''')
    height = 84 + ((len(shown) + 1) // 2 - 1) * 24 + 22
    return frame(height, title, subtitle, ''.join(body), t)


# ---------- AI Coding: activity rings ----------
# Every run picks a fresh palette: a random base hue, the other two rings roughly a third of the colour wheel away,
# fixed OKLCH lightness/chroma per theme so any combination stays soft. On the page the hues drift slowly together.
WEEK_GOAL_H, DAY_GOAL_H = 40, 8
RING_TONE = {'dark': ((.80, .105), (.89, .07)), 'light': ((.63, .14), (.73, .11))}  # (L, C) of ring / gradient end
DRIFT_STEPS, DRIFT_SECONDS = 12, 120


def oklch(L, C, h):
    """OKLCH -> sRGB hex; chroma is pulled down until the colour fits in sRGB so every hue stays equally soft."""
    while True:
        a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
        l_ = L + .3963377774 * a + .2158037573 * b
        m_ = L - .1055613458 * a - .0638541728 * b
        s_ = L - .0894841775 * a - 1.2914855480 * b
        l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
        rgb = (4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
               -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
               -.0041960863 * l - .7034186147 * m + 1.7076147010 * s)
        if all(-1e-4 <= v <= 1 + 1e-4 for v in rgb) or C <= 0:
            enc = lambda v: 12.92 * v if v <= .0031308 else 1.055 * v ** (1 / 2.4) - .055
            return '#' + ''.join(f'{round(min(1, max(0, enc(v))) * 255):02x}' for v in rgb)
        C -= .005


MUDDY = (85, 130)  # OKLCH hues that read as olive/khaki at these tones; the palette skips over them


def ring_colour(h, theme, end=False):
    """Hue h lives on a wheel without the muddy band: 360 degrees are squeezed onto the remaining arc."""
    lo, hi = MUDDY
    u = (h % 360) * (360 - (hi - lo)) / 360
    hue = u if u < lo else u + (hi - lo)
    L, C = RING_TONE[theme][1 if end else 0]
    return oklch(L, C, hue)


def random_hues():
    h0 = random.uniform(0, 360)
    hues = [h0, h0 + 120 + random.uniform(-15, 15), h0 + 240 + random.uniform(-15, 15)]
    random.shuffle(hues)
    return hues


RING_HUES = random_hues()


def ring_gradients(theme, cx, cy, r_out):
    """One gradient per ring; its stops cycle through hue-rotated copies of the palette (SMIL, works inside <img>)."""
    out = []
    for k, h in enumerate(RING_HUES):
        stops = []
        for end in (False, True):
            vals = [ring_colour(h + 360 * i / DRIFT_STEPS, theme, end) for i in range(DRIFT_STEPS + 1)]
            stops.append(f'<stop offset="{int(end)}" stop-color="{vals[0]}"><animate attributeName="stop-color" '
                         f'values="{";".join(vals)}" dur="{DRIFT_SECONDS}s" repeatCount="indefinite"/></stop>')
        out.append(f'<linearGradient id="rg{k}" gradientUnits="userSpaceOnUse" x1="{cx - r_out}" y1="{cy - r_out}" '
                   f'x2="{cx + r_out}" y2="{cy + r_out}">{"".join(stops)}</linearGradient>')
    return ''.join(out)


def ring(cx, cy, r, width, frac, k, delay=0.0, track_op=.2):
    circ = 2 * math.pi * r
    out = [f'<circle cx="{cx:.1f}" cy="{cy}" r="{r}" fill="none" stroke="url(#rg{k})" stroke-opacity="{track_op}" stroke-width="{width}"/>']
    for lap, f in enumerate([min(frac, 1.0)] + ([frac - 1.0] if frac > 1 else [])):
        if f > .002:
            out.append(f'<circle class="arc" cx="{cx:.1f}" cy="{cy}" r="{r}" fill="none" stroke="url(#rg{k})" stroke-width="{width}" '
                       f'stroke-linecap="round" stroke-dasharray="{circ * f:.2f} {circ:.2f}" transform="rotate(-90 {cx:.1f} {cy})" '
                       f'style="animation-delay:{delay + lap * .9:.2f}s"/>')
    return ''.join(out)


def ai_coding_card(ai, human, daily, t):
    theme = 'dark' if t is THEMES['dark'] else 'light'
    total = ai + human
    week_h = sum(sec for _, sec in daily) / 3600
    frac = [ai / total if total else 0, human / total if total else 0, week_h / WEEK_GOAL_H]
    h, cx, cy = 262, 96, 116
    rr = [(64, 15), (46, 15), (28, 15)]
    if daily:
        d0, d1 = time.strptime(daily[0][0], '%Y-%m-%d'), time.strptime(daily[-1][0], '%Y-%m-%d')
        fmt = lambda d: f'{time.strftime("%b", d)} {d.tm_mday}'
        span = fmt(d0) + ' – ' + (str(d1.tm_mday) if d0.tm_mon == d1.tm_mon else fmt(d1))
    else:
        span = 'last 7 days'
    logo = ''.join(
        f'<circle cx="31" cy="26" r="{r}" fill="none" stroke="url(#rg{k})" stroke-opacity=".25" stroke-width="2.4"/>'
        f'<circle cx="31" cy="26" r="{r}" fill="none" stroke="url(#rg{k})" stroke-width="2.4" stroke-linecap="round" '
        f'stroke-dasharray="{2 * math.pi * r * p:.1f} {2 * math.pi * r:.1f}" transform="rotate(-90 31 26)"/>'
        for k, (r, p) in enumerate(((9, .8), (6, .55), (3, .7))))
    pill_w = len(span) * 6.6 + 22
    head = (f'{logo}\n  <text x="48" y="31" fill="{t["text"]}" font-size="17" font-weight="700">AI Coding</text>'
            f'\n  <rect x="{WIDTH - 20 - pill_w:.0f}" y="14" width="{pill_w:.0f}" height="22" rx="11" fill="{t["box"]}" stroke="{t["border"]}"/>'
            f'\n  <text x="{WIDTH - 20 - pill_w / 2:.0f}" y="29" fill="{t["muted"]}" font-size="11.5" font-weight="600" text-anchor="middle">{esc(span)}</text>')
    rows = [('AI lines', short(ai), f'{frac[0] * 100:.0f}% of changes'),
            ('Human lines', short(human), f'{frac[1] * 100:.0f}% of changes'),
            ('Coding time', f'{week_h:.0f}h', f'of a {WEEK_GOAL_H}h week')]
    legend = ''.join(
        f'\n  <g class="row" style="animation-delay:{.3 + k * .15:.2f}s">'
        f'<text x="192" y="{60 + k * 46}" fill="{t["text"]}" font-size="12.5" font-weight="600">{label}</text>'
        f'<text x="192" y="{85 + k * 46}" fill="url(#rg{k})" font-size="24" font-weight="800">{value}</text>'
        f'<text x="{202 + len(value) * 15}" y="{85 + k * 46}" fill="{t["muted"]}" font-size="12">{note}</text></g>'
        for k, (label, value, note) in enumerate(rows))
    step = (WIDTH - 40) / 7
    days = ''.join(
        ring(20 + step * i + step / 2 - 22, 228, 11, 5, sec / 3600 / DAY_GOAL_H, 2, .6 + i * .06, .22)
        + f'<text x="{20 + step * i + step / 2 - 6:.1f}" y="226" fill="{t["text"]}" font-size="11.5" font-weight="700">{sec / 3600:.1f}h</text>'
        + f'<text x="{20 + step * i + step / 2 - 6:.1f}" y="240" fill="{t["muted"]}" font-size="10" font-weight="600">'
          f'{time.strftime("%a", time.strptime(date, "%Y-%m-%d"))}</text>'
        for i, (date, sec) in enumerate(daily))
    body = ''.join(ring(cx, cy, r, w, frac[k], k, k * .25) for k, (r, w) in enumerate(rr))
    css = ('\n  .arc { animation: draw 1.4s cubic-bezier(.3,.7,.2,1) both; }'
           '\n  @keyframes draw { from { stroke-dasharray: 0 999; } }'
           '\n  .row { animation: fade .5s ease-out both; }'
           '\n  @keyframes fade { from { opacity: 0; transform: translateY(4px); } }'
           '\n  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{h}" viewBox="0 0 {WIDTH} {h}" font-family="{FONT}">'
            f'\n  <title>AI Coding</title>\n  <style>{css}\n  </style>\n  <defs>{ring_gradients(theme, cx, cy, 64)}</defs>'
            f'\n  <rect x="0.5" y="0.5" width="{WIDTH - 1}" height="{h - 1}" rx="4.5" fill="{t["bg"]}" stroke="{t["border"]}"/>'
            f'\n  {head}\n  {body}{legend}'
            f'\n  <line x1="20" y1="200" x2="{WIDTH - 20}" y2="200" stroke="{t["border"]}"/>\n  {days}\n</svg>\n')


# ---------- AI Models: one band per lab, its models as chips ----------
HEAVY = "'Segoe UI Black', 'Arial Black', 'Helvetica Neue', -apple-system, sans-serif"
BOLD = "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
MODEL_LAB = {'Claude': 'Anthropic', 'Opus': 'Anthropic', 'Sonnet': 'Anthropic', 'Haiku': 'Anthropic', 'GPT': 'OpenAI',
             'Gemini': 'Google', 'DeepSeek': 'DeepSeek', 'Grok': 'xAI', 'Qwen': 'Alibaba'}
LAB_COLORS = {'Anthropic': '#d97757', 'OpenAI': '#10a37f', 'Google': '#4285f4', 'DeepSeek': '#4d6bfe', 'xAI': '#6b7280',
              'Alibaba': '#615ced'}
LAB_LOGOS = {'Anthropic': 'claude.svg', 'OpenAI': 'openai.svg', 'Google': 'gemini.svg', 'DeepSeek': 'deepseek.svg',
             'Alibaba': 'qwen.svg'}


def mix(c, w, k):
    a = [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(w[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * k):02x}' for x, y in zip(a, b))


def ai_models_card(models, t):
    dark = t is THEMES['dark']
    bg, fg, mu = ('#101010', '#ffffff', '#9a9a9a') if dark else ('#ffffff', '#111111', '#6b6b6b')
    total = sum(m['lines'] for m in models) or 1
    labs = {}
    for m in models:
        labs.setdefault(MODEL_LAB.get(m['name'], m['name']), []).append(m)
    order = sorted(labs.items(), key=lambda kv: -sum(m['lines'] for m in kv[1]))
    top = sum(m['lines'] for m in order[0][1])
    y, out = 54, []
    for i, (lab, items) in enumerate(order):
        lines = sum(m['lines'] for m in items)
        chips = [m for m in items if m['name'] != lab]
        bh = 88 + 40 * math.sqrt(lines / top) if chips else 26 + 92 * math.sqrt(lines / top)
        c = LAB_COLORS.get(lab) or MODEL_COLORS.get(lab) or '#7c7c86'
        fs = min(38, max(15, bh * .3))
        ty = y + ((bh - 40) / 2 + 4 if chips else bh / 2) + fs * .36
        lx = 24
        out.append(f'<g class="band" style="animation-delay:{i * 110}ms"><rect x="0" y="{y:.1f}" width="{WIDTH}" height="{bh + .6:.1f}" fill="{c}"/>')
        if lab in LAB_LOGOS:
            ls = round(fs * .78)
            out.append(f'<circle cx="{lx + ls / 2}" cy="{ty - fs * .36:.1f}" r="{ls * .72:.1f}" fill="#ffffff" fill-opacity=".92"/>'
                       f'<image href="{sc.icon_uri(LAB_LOGOS[lab])}" x="{lx}" y="{ty - fs * .36 - ls / 2:.1f}" width="{ls}" height="{ls}"/>')
            lx += ls + 16
        share = lines / total * 100
        out.append(f'<text x="{lx}" y="{ty:.1f}" font-family="{HEAVY}" font-size="{fs:.1f}" font-weight="900" fill="#ffffff">{esc(lab)}</text>'
                   f'<text x="{WIDTH - 24}" y="{ty:.1f}" font-family="{HEAVY}" font-size="{fs * .8:.1f}" font-weight="900" fill="#ffffff" text-anchor="end">'
                   f'{"&lt;1" if share < 1 else f"{share:.0f}"}%<tspan font-family="{BOLD}" font-size="{max(11, fs * .4):.1f}" font-weight="700" fill-opacity=".8"> {short(lines)}</tspan></text>')
        sx = 24
        for m in chips:
            ww = max(96, (WIDTH - 48) * m['lines'] / lines)
            out.append(f'<rect x="{sx:.1f}" y="{y + bh - 40:.1f}" width="{ww - 5:.1f}" height="24" rx="12" fill="{mix(MODEL_COLORS.get(m["name"], c), "#000000", .18)}"/>'
                       f'<text x="{sx + 12:.1f}" y="{y + bh - 23.5:.1f}" font-family="{BOLD}" font-size="12" font-weight="800" fill="#fff" xml:space="preserve">'
                       f'{esc(m["name"])}  <tspan font-weight="600" fill-opacity=".8">{short(m["lines"])}</tspan></text>')
            sx += ww
        out.append('</g>')
        y += bh
    h = int(y + 16)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{h}" viewBox="0 0 {WIDTH} {h}">
  <title>AI Models</title>
  <style>
  .band {{ animation: band .7s cubic-bezier(.2,.9,.25,1) both; }}
  @keyframes band {{ from {{ transform: translateX(-100%); }} }}
  @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}
  </style>
  <defs><clipPath id="cl"><rect width="{WIDTH}" height="{h}" rx="16"/></clipPath></defs>
  <g clip-path="url(#cl)"><rect width="{WIDTH}" height="{h}" fill="{bg}"/>
  <text x="24" y="37" font-family="{HEAVY}" font-size="21" font-weight="900" fill="{fg}">AI Models</text>
  <text x="{WIDTH - 24}" y="37" font-family="{HEAVY}" font-size="21" font-weight="900" fill="{mu}" text-anchor="end">{short(total)}<tspan font-family="{BOLD}" font-size="12" font-weight="700"> lines</tspan></text>
  {''.join(out)}</g>
</svg>
"""


# ---------- Other Apps: one SoundCloud-style embed per app ----------
APP_BRANDS = {'Telegram': ('#26A5E4', 'telegram.svg'), 'Steam': ('#1b2838', 'steam.svg')}
APPS_SHOWN = 3


def app_artwork(name, x, y, s):
    colour, icon = APP_BRANDS.get(name, (FALLBACK_COLORS[sum(map(ord, name)) % len(FALLBACK_COLORS)], None))
    gid = 'a' + ''.join(ch for ch in name if ch.isalnum())
    inner = (f'<image href="{sc.icon_uri(icon, "#ffffff")}" x="{x + s * .25:.1f}" y="{y + s * .25:.1f}" width="{s * .5:.1f}" height="{s * .5:.1f}"/>'
             if icon else f'<text x="{x + s / 2:.1f}" y="{y + s * .64:.1f}" font-family="{BOLD}" font-size="{s * .42:.0f}" font-weight="800" fill="#fff" text-anchor="middle">{esc(name[:1].upper())}</text>')
    return (f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{mix(colour, "#ffffff", .2)}"/>'
            f'<stop offset="1" stop-color="{mix(colour, "#000000", .45)}"/></linearGradient></defs>'
            f'<rect x="{x}" y="{y}" width="{s}" height="{s}" fill="url(#{gid})"/>{inner}')


def other_apps_card(apps, t):
    """apps: [(name, seconds)] sorted desc. Waveform's orange part = the app's share of all non-coding app time."""
    p = sc.THEMES['dark' if t is THEMES['dark'] else 'light']
    total = sum(sec for _, sec in apps) or 1
    shown, rest = apps[:APPS_SHOWN], apps[APPS_SHOWN:]
    wh, gap = 108, 12
    out = []
    for i, (name, sec) in enumerate(shown):
        y = 1 + i * (wh + gap)
        out.append(f"""<g>
  <rect x=".5" y="{y + .5}" width="{WIDTH - 1}" height="{wh}" rx="2" fill="{p['bg']}" stroke="{p['line']}"/>
  {app_artwork(name, WIDTH - wh + 1, y + 1, wh - 1)}
  {sc.play_button(40, y + 34, 22)}
  <text x="72" y="{y + 26}" font-family="{BOLD}" font-size="11.5" fill="{p['mu']}">DverkaSK</text>
  <text x="72" y="{y + 45}" font-family="{BOLD}" font-size="15" font-weight="700" fill="{p['fg']}">{esc(name)}</text>
  <rect x="{WIDTH - wh - 92}" y="{y + 14}" width="80" height="20" rx="3" fill="{p['box']}"/>
  <text x="{WIDTH - wh - 52}" y="{y + 28}" font-family="{BOLD}" font-size="11" fill="{p['mu']}" text-anchor="middle">&#9654; {hours(sec)}</text>
  {sc.wave(18, y + 62, WIDTH - wh - 34, 36, sum(map(ord, name)), sec / total, p)}
</g>""")
    h = 2 + len(shown) * (wh + gap) - gap
    if rest:
        out.append(f'<text x="4" y="{h + 18}" font-family="{BOLD}" font-size="12" fill="{p["mu"]}">'
                   f'+ {esc(", ".join(f"{n} {hours(sec)}" for n, sec in rest))}</text>')
        h += 26
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{h}" viewBox="0 0 {WIDTH} {h}">
  <title>Other Apps</title>
  <defs>{sc.GRADIENT_DEFS}</defs>
  {''.join(out)}
</svg>
"""


def color_for(name, palette, i):
    return palette.get(name) or FALLBACK_COLORS[i % len(FALLBACK_COLORS)]


def time_items(entries, palette, rename=None):
    items = [(rename(e['name']) if rename else e['name'], e['total_seconds']) for e in entries]
    items = [(n, v) for n, v in items if v >= 60]
    items.sort(key=lambda x: -x[1])
    return [(n, v, hours(v), color_for(n, palette, i)) for i, (n, v) in enumerate(items)]


def build_cards(week_lines, all_time):
    cards = {}
    if week_lines:
        ai, human, daily = week_lines
        cards['ai-coding'] = lambda t: ai_coding_card(ai, human, daily, t)
        print(f'AI lines: {ai}, human lines: {human}')
    if all_time:
        lang_colors = fetch_language_colors()
        languages = [e for e in all_time.get('languages', [])
                     if e['name'] not in HIDDEN_LANGUAGES and not e['name'].startswith('Image')]
        editors = [e for e in all_time.get('editors', []) if e['name'] in DEV_TOOLS]
        apps = sorted(((APP_NAMES.get(e['name'], e['name']), e['total_seconds']) for e in all_time.get('editors', [])
                       if e['name'] not in DEV_TOOLS and e['name'] not in HIDDEN_EDITORS and e['total_seconds'] >= 60),
                      key=lambda a: -a[1])
        models = sorted((m for m in all_time.get('ai_model_breakdown', []) if m['lines'] > 0), key=lambda m: -m['lines'])

        cards['languages'] = lambda t: breakdown_card('Languages', 'all time', time_items(languages, lang_colors), t)
        cards['editors'] = lambda t: breakdown_card('Editors & Tools', 'all time', time_items(editors, EDITOR_COLORS), t)
        if models:
            cards['ai-models'] = lambda t: ai_models_card(models, t)
        if apps:
            cards['apps'] = lambda t: other_apps_card(apps, t)
    return cards


def build_json(week_lines, all_time):
    """Raw numbers for the dverka.sk page: it draws them itself, so it only needs names and seconds."""
    out = {'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    if week_lines:
        ai, human, daily = week_lines
        out['week'] = {'ai_lines': ai, 'human_lines': human, 'days': [{'date': d, 'seconds': round(sec)} for d, sec in daily]}
    if all_time:
        pick = lambda entries, hide: [{'name': e['name'], 'seconds': round(e.get('total_seconds') or 0)}
                                      for e in entries if e['name'] not in hide and not e['name'].startswith('Image')
                                      and (e.get('total_seconds') or 0) >= 60]
        out['all_time'] = {
            'total_seconds': round(all_time.get('total_seconds') or 0),
            'daily_average': round(all_time.get('daily_average') or 0),
            'start': all_time.get('start'),
            'languages': pick(all_time.get('languages', []), HIDDEN_LANGUAGES),
            'editors': pick([e for e in all_time.get('editors', []) if e['name'] in DEV_TOOLS], HIDDEN_EDITORS),
            'models': [{'name': m['name'], 'lines': m['lines']}
                       for m in sorted(all_time.get('ai_model_breakdown', []), key=lambda m: -m['lines']) if m['lines'] > 0],
        }
    return out


def main():
    # API keys are write-only (plugins); reading stats needs a personal OAuth token from wakatime.com/oauth
    token = os.environ.get('WAKATIME_TOKEN')
    if not token:
        sys.exit('WAKATIME_TOKEN is not set')
    auth = 'Bearer ' + token
    week_lines = fetch_week_lines(auth)
    all_time = fetch_stats(auth, 'all_time')
    if not all_time:
        print('All-time WakaTime stats are not ready yet, keeping the previous cards for them')
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, render in build_cards(week_lines, all_time).items():
        for theme, t in THEMES.items():
            with open(os.path.join(OUT_DIR, f'{name}-{theme}.svg'), 'w', encoding='utf-8', newline='\n') as f:
                f.write(render(t))
        print(f'Generated {name}')
    data = build_json(week_lines, all_time)
    path = os.path.join(OUT_DIR, 'wakatime.json')
    if not all_time and os.path.exists(path):
        # all-time stats not ready: keep the previous all-time block, refresh the week only
        with open(path, encoding='utf-8') as f:
            prev = json.load(f)
        if 'all_time' in prev:
            data['all_time'] = prev['all_time']
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print('Generated wakatime.json')


if __name__ == '__main__':
    main()
