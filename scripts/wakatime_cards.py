"""Generates WakaTime stat cards (dark and light) into the cards/ directory."""
import base64
import json
import os
import sys
import time
import urllib.request

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'cards')
FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif"
WIDTH = 495

THEMES = {
    'dark': dict(bg='#0d1117', border='#30363d', title='#58a6ff', text='#c9d1d9', muted='#8b949e',
                 box='#161b22', track='#30363d'),
    'light': dict(bg='#ffffff', border='#d0d7de', title='#0969da', text='#1f2328', muted='#656d76',
                  box='#f6f8fa', track='#d0d7de'),
}
AI_COLOR, HUMAN_COLOR = '#3b82f6', '#10b981'
FALLBACK_COLORS = ['#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#84cc16', '#f97316', '#06b6d4']

HIDDEN_LANGUAGES = {'Other', 'textmate', 'Text'}
# desktop apps tracked by WakaTime that are not dev tools, shown on a separate card
APPS = {'TelegramDesktop': 'Telegram', 'SteamClientWebHelper': 'Steam', 'ZoomMeetings': 'Zoom'}
HIDDEN_EDITORS = {'Unknown Editor'}

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


def fetch_stats(api_key, stats_range):
    auth = 'Basic ' + base64.b64encode(api_key.encode()).decode()
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


def stat_box(x, label, value, share, color, t):
    bar_w = 142
    return f'''
  <rect x="{x}" y="58" width="168" height="76" rx="8" fill="{t['box']}" stroke="{t['border']}"/>
  <text x="{x + 13}" y="80" fill="{t['muted']}" font-size="12">{label}</text>
  <text x="{x + 13}" y="106" fill="{t['text']}" font-size="22" font-weight="700">{value}</text>
  <rect x="{x + 13}" y="118" width="{bar_w}" height="5" rx="2.5" fill="{t['track']}"/>
  <rect x="{x + 13}" y="118" width="{bar_w * share:.1f}" height="5" rx="2.5" fill="{color}"/>'''


def ai_coding_card(ai, human, t):
    total = ai + human
    ai_share = ai / total if total else 0
    percent = round(ai_share * 100)
    r = 40
    circ = 2 * 3.14159265 * r
    body = f'''
  <circle cx="68" cy="96" r="{r}" fill="none" stroke="{t['track']}" stroke-width="9"/>
  <circle cx="68" cy="96" r="{r}" fill="none" stroke="{AI_COLOR}" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="{circ * ai_share:.1f} {circ:.1f}" transform="rotate(-90 68 96)"/>
  <text x="68" y="100" fill="{t['text']}" font-size="24" font-weight="700" text-anchor="middle">{percent}<tspan font-size="12" fill="{t['muted']}" dy="-8">%</tspan></text>
  <text x="68" y="116" fill="{t['muted']}" font-size="10" text-anchor="middle">AI-driven</text>''' \
        + stat_box(128, 'AI lines', short(ai), ai_share, AI_COLOR, t) \
        + stat_box(308, 'Human lines', short(human), 1 - ai_share if total else 0, HUMAN_COLOR, t)
    return frame(150, 'AI Coding', 'last 7 days', body, t)


def color_for(name, palette, i):
    return palette.get(name) or FALLBACK_COLORS[i % len(FALLBACK_COLORS)]


def time_items(entries, palette, rename=None):
    items = [(rename(e['name']) if rename else e['name'], e['total_seconds']) for e in entries]
    items = [(n, v) for n, v in items if v >= 60]
    items.sort(key=lambda x: -x[1])
    return [(n, v, hours(v), color_for(n, palette, i)) for i, (n, v) in enumerate(items)]


def build_cards(week, all_time):
    cards = {}
    if week:
        ai = week.get('ai_additions', 0) + week.get('ai_deletions', 0)
        human = week.get('human_additions', 0) + week.get('human_deletions', 0)
        cards['ai-coding'] = lambda t: ai_coding_card(ai, human, t)
        print(f'AI lines: {ai}, human lines: {human}')
    if all_time:
        lang_colors = fetch_language_colors()
        languages = [e for e in all_time.get('languages', [])
                     if e['name'] not in HIDDEN_LANGUAGES and not e['name'].startswith('Image')]
        editors = [e for e in all_time.get('editors', [])
                   if e['name'] not in APPS and e['name'] not in HIDDEN_EDITORS]
        apps = [e for e in all_time.get('editors', []) if e['name'] in APPS]
        models = sorted(all_time.get('ai_model_breakdown', []), key=lambda m: -m['lines'])
        model_items = [(m['name'], m['lines'], f"{short(m['lines'])} lines", color_for(m['name'], MODEL_COLORS, i))
                       for i, m in enumerate(models) if m['lines'] > 0]

        cards['languages'] = lambda t: breakdown_card('Languages', 'all time', time_items(languages, lang_colors), t)
        cards['editors'] = lambda t: breakdown_card('Editors & Tools', 'all time', time_items(editors, EDITOR_COLORS), t)
        if model_items:
            cards['ai-models'] = lambda t: breakdown_card('AI Models', 'lines · all time', model_items, t)
        if apps:
            cards['apps'] = lambda t: breakdown_card('Other Apps', 'all time',
                                                     time_items(apps, EDITOR_COLORS, APPS.get), t)
    return cards


def main():
    api_key = os.environ.get('WAKATIME_API_KEY')
    if not api_key:
        sys.exit('WAKATIME_API_KEY is not set')
    week = fetch_stats(api_key, 'last_7_days')
    all_time = fetch_stats(api_key, 'all_time')
    if not week or not all_time:
        print('Some WakaTime stats are not ready yet, keeping the previous cards for them')
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, render in build_cards(week, all_time).items():
        for theme, t in THEMES.items():
            with open(os.path.join(OUT_DIR, f'{name}-{theme}.svg'), 'w', encoding='utf-8', newline='\n') as f:
                f.write(render(t))
        print(f'Generated {name}')


if __name__ == '__main__':
    main()
