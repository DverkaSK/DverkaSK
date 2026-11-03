"""Generates WakaTime stat cards (dark and light) into the cards/ directory."""
import json
import math
import os
import random
import sys
import time
import urllib.request

import poster_style as ps
import soundcloud_style as sc
from poster_style import BOLD, HALF, WIDE, mix

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'cards')
APPS_WIDTH = 495

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


def visible(color, t):
    """Swaps colors that would blend into the dark background (e.g. JSON's #292929) for a neutral gray."""
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5)) if len(color) == 7 else (128, 128, 128)
    luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return t['muted'] if t is THEMES['dark'] and luminance < 0.2 else color


def hrs(seconds):
    return f'{seconds / 3600:,.0f}h' if seconds >= 3600 else f'{seconds / 60:.0f}m'


def breakdown_card(title, phrase, items, t, shown=6):
    """Wrapped-style half card: total hours, then the top items with their share of the total; the rest summed up."""
    dark = t is THEMES['dark']
    p = ps.palette(dark)
    total = sum(v for _, v, _, _ in items) or 1
    rows = [(n, hrs(v), v / total, visible(c, t)) for n, v, _, c in items[:shown]]
    rest = items[shown:]
    body = (f'  {ps.label(28, 42, title + " · all time", p)}\n'
            f'  {ps.hero(24, 104, f"{total / 3600:,.0f}h", 58, p, "28px 100px")}\n'
            f'  {ps.heavy(28, 132, phrase.format(n=len(items)), 17, p["fg"])}\n'
            + ps.toplist(28, 172, HALF - 56, rows, p, step=36, fs=17, r=12)
            + (f'\n  <text x="28" y="{172 + shown * 36 + 4}" font-family="{BOLD}" font-size="12.5" font-weight="700" '
               f'fill="{p["mu"]}">+ {len(rest)} more · {hrs(sum(v for _, v, _, _ in rest))}</text>' if rest else ''))
    return ps.poster(HALF, 412, [r[3] for r in rows[:3]] or ['#7c7c86'], dark, body, title)


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
    p = ps.palette(theme == 'dark')
    total = ai + human
    week_h = sum(sec for _, sec in daily) / 3600
    frac = [ai / total if total else 0, human / total if total else 0, week_h / WEEK_GOAL_H]
    cx, cy = 104, 170
    if daily:
        d0, d1 = time.strptime(daily[0][0], '%Y-%m-%d'), time.strptime(daily[-1][0], '%Y-%m-%d')
        fmt = lambda d: f'{time.strftime("%b", d)} {d.tm_mday}'
        span = fmt(d0) + ' – ' + (str(d1.tm_mday) if d0.tm_mon == d1.tm_mon else fmt(d1))
    else:
        span = 'last 7 days'
    rings = ''.join(ring(cx, cy, r, 15, frac[k], k, k * .25) for k, r in enumerate((66, 48, 30)))
    stats = [('by AI', short(ai)), ('by me', short(human)), (f'of a {WEEK_GOAL_H}h week', f'{week_h:.0f}h')]
    chips = ''.join(f'<g class="row" style="animation-delay:{.5 + k * .12:.2f}s">'
                    f'<rect x="{214 + k * 92}" y="214" width="84" height="44" rx="10" fill="{p["chip"]}"/>'
                    f'<rect x="{214 + k * 92}" y="224" width="4" height="24" rx="2" fill="url(#rg{k})"/>'
                    f'{ps.heavy(226 + k * 92, 236, value, 17, p["fg"])}'
                    f'<text x="{226 + k * 92}" y="251" font-family="{BOLD}" font-size="10.5" font-weight="700" fill="{p["mu"]}">{esc(note)}</text></g>'
                    for k, (note, value) in enumerate(stats))
    dx, step = 560, (WIDE - 24 - 560) / 7
    days = ''.join(
        ring(dx + step * i + step / 2, 150, 13, 5, sec / 3600 / DAY_GOAL_H, 2, .6 + i * .06, .22)
        + ps.heavy(f'{dx + step * i + step / 2:.1f}', 196, f'{sec / 3600:.1f}h', 12.5, p['fg'], 'middle')
        + f'<text x="{dx + step * i + step / 2:.1f}" y="213" font-family="{BOLD}" font-size="11" font-weight="700" '
          f'fill="{p["mu"]}" text-anchor="middle">{time.strftime("%a", time.strptime(date, "%Y-%m-%d"))}</text>'
        for i, (date, sec) in enumerate(daily))
    body = (f'  <defs>{ring_gradients(theme, cx, cy, 66)}</defs>\n'
            f'  {ps.label(28, 44, "AI Coding · " + span, p)}\n  {rings}\n'
            f'  {ps.hero(206, 160, f"{frac[0] * 100:.0f}%", 92, p, "210px 150px")}\n'
            f'  {ps.heavy(214, 192, "of changed lines written by AI", 17, p["fg"])}\n'
            f'  {chips}\n  {ps.label(dx + 4, 100, "This week", p)}\n  {days}')
    css = ('\n  .arc { animation: draw 1.4s cubic-bezier(.3,.7,.2,1) both; }'
           '\n  @keyframes draw { from { stroke-dasharray: 0 999; } }')
    return ps.poster(WIDE, 290, [ring_colour(h, theme) for h in RING_HUES], theme == 'dark', body, 'AI Coding', css)


# ---------- AI Models: one band per lab, its models as chips ----------
MODEL_LAB = {'Claude': 'Anthropic', 'Opus': 'Anthropic', 'Sonnet': 'Anthropic', 'Haiku': 'Anthropic', 'GPT': 'OpenAI',
             'Gemini': 'Google', 'DeepSeek': 'DeepSeek', 'Grok': 'xAI', 'Qwen': 'Alibaba'}
LAB_COLORS = {'Anthropic': '#d97757', 'OpenAI': '#10a37f', 'Google': '#4285f4', 'DeepSeek': '#4d6bfe', 'xAI': '#6b7280',
              'Alibaba': '#615ced'}


def ai_models_card(models, t):
    """Giant all-time total on the left, numbered top list of models with logos on the right."""
    dark = t is THEMES['dark']
    p = ps.palette(dark)
    total = sum(m['lines'] for m in models) or 1
    lab = lambda m: MODEL_LAB.get(m['name'], m['name'])
    colour = lambda m: MODEL_COLORS.get(m['name']) or LAB_COLORS.get(lab(m)) or '#7c7c86'
    labs = {}
    for m in models:
        labs[lab(m)] = labs.get(lab(m), 0) + m['lines']
    top_lab, top_lines = max(labs.items(), key=lambda kv: kv[1])
    top_model = next(m for m in models if lab(m) == top_lab)
    rows = [(m['name'], short(m['lines']), m['lines'] / total, colour(m)) for m in models[:6]]
    body = (f'  {ps.label(36, 58, "AI Models · all time", p)}\n'
            f'  {ps.hero(30, 196, short(total), 118, p, "30px 200px")}\n'
            f'  {ps.heavy(36, 236, "lines written with AI", 26, p["fg"])}\n'
            f'  <rect x="36" y="282" width="250" height="56" rx="28" fill="{p["chip"]}"/>\n'
            f'  {ps.disc(top_model["name"], colour(top_model), 64, 310, 18)}\n'
            f'  <text x="92" y="305" font-family="{BOLD}" font-size="11" font-weight="800" letter-spacing="2" fill="{p["mu"]}">TOP LAB</text>\n'
            f'  {ps.heavy(92, 325, f"{top_lab} · {top_lines / total * 100:.0f}%", 18, p["fg"])}\n'
            + ps.toplist(452, 70, 354, rows, p))
    tints = list(dict.fromkeys(colour(m) for m in models[:4])) + ['#10a37f', '#4285f4']
    return ps.poster(WIDE, 380, tints, dark, body, 'AI Models')


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
  <rect x=".5" y="{y + .5}" width="{APPS_WIDTH - 1}" height="{wh}" rx="2" fill="{p['bg']}" stroke="{p['line']}"/>
  {app_artwork(name, APPS_WIDTH - wh + 1, y + 1, wh - 1)}
  {sc.play_button(40, y + 34, 22)}
  <text x="72" y="{y + 26}" font-family="{BOLD}" font-size="11.5" fill="{p['mu']}">DverkaSK</text>
  <text x="72" y="{y + 45}" font-family="{BOLD}" font-size="15" font-weight="700" fill="{p['fg']}">{esc(name)}</text>
  <rect x="{APPS_WIDTH - wh - 92}" y="{y + 14}" width="80" height="20" rx="3" fill="{p['box']}"/>
  <text x="{APPS_WIDTH - wh - 52}" y="{y + 28}" font-family="{BOLD}" font-size="11" fill="{p['mu']}" text-anchor="middle">&#9654; {hours(sec)}</text>
  {sc.wave(18, y + 62, APPS_WIDTH - wh - 34, 36, sum(map(ord, name)), sec / total, p)}
</g>""")
    h = 2 + len(shown) * (wh + gap) - gap
    if rest:
        out.append(f'<text x="4" y="{h + 18}" font-family="{BOLD}" font-size="12" fill="{p["mu"]}">'
                   f'+ {esc(", ".join(f"{n} {hours(sec)}" for n, sec in rest))}</text>')
        h += 26
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{APPS_WIDTH}" height="{h}" viewBox="0 0 {APPS_WIDTH} {h}">
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

        cards['languages'] = lambda t: breakdown_card('Languages', 'across {n} languages', time_items(languages, lang_colors), t)
        cards['editors'] = lambda t: breakdown_card('Editors & Tools', 'in {n} tools', time_items(editors, EDITOR_COLORS), t)
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
