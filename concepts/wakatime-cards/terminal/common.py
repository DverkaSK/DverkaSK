"""Shared data, icons and helpers for the 16 Languages card variants."""
import base64, json, os

REPO = r'C:/Users/Admin/IdeaProjects/DverkaSK'
HERE = os.path.dirname(os.path.abspath(__file__))
IC = os.path.join(os.path.dirname(HERE), 'cards', 'ic')
W = 495

_d = json.load(open(f'{REPO}/cards/wakatime.json', encoding='utf-8'))['all_time']
HIDE = {'Other', 'textmate', 'Text'}
ALL = [l for l in _d['languages'] if l['name'] not in HIDE]
LANGS = ALL[:8]
TOTAL = _d['total_seconds']
TOTAL_H = TOTAL / 3600
OTHERS = ALL[8:]
OTHERS_S = sum(l['seconds'] for l in OTHERS)
SINCE = _d['start'][:4]

COLORS = {'Java': '#b07219', 'SQL': '#e38c00', 'YAML': '#cb171e', 'XML': '#0060ac', 'Markdown': '#083fa1',
          'Groovy': '#4298b8', 'JSON': '#8b949e', 'Python': '#3572A5', 'Kotlin': '#A97BFF', 'Go': '#00ADD8'}
ICONS = {'Java': 'java', 'SQL': 'sql', 'Python': 'python', 'Kotlin': 'kotlin', 'Go': 'go'}
CHIPS = {'YAML': 'YML', 'XML': 'XML', 'Markdown': 'MD', 'JSON': '{ }', 'Groovy': 'GR'}

SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
MONO = "'JetBrains Mono', 'Cascadia Mono', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
SERIF = "Georgia, 'Times New Roman', serif"


def share(l):
    return l['seconds'] / TOTAL * 100


def hrs(s):
    return f'{int(s // 3600):,}h'


def num(s):
    return f'{int(s // 3600):,}'


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def col(name):
    return COLORS.get(name, '#8b949e')


def mix(c, w, k):
    a = [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(w[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * k):02x}' for x, y in zip(a, b))


def lum(c):
    r, g, b = (int(c[i:i + 2], 16) / 255 for i in (1, 3, 5))
    return .2126 * r + .7152 * g + .0722 * b


def readable(c, dark):
    """A language colour adjusted so it reads as text on a dark or light background."""
    if dark and lum(c) < .42:
        return mix(c, '#ffffff', .5)
    if not dark and lum(c) > .5:
        return mix(c, '#000000', .35)
    return c


_cache = {}


def icon_uri(name):
    if name not in _cache:
        raw = open(f'{REPO}/icons/{ICONS[name]}.svg', 'rb').read()
        _cache[name] = 'data:image/svg+xml;base64,' + base64.b64encode(raw).decode()
    return _cache[name]


def glyph(name, x, y, size=18, rx=None, font=SANS, chip_fill=None, chip_text='#fff'):
    """Real icon for languages that have one, a coloured chip with an abbreviation otherwise."""
    if name in ICONS:
        return f'<image href="{icon_uri(name)}" x="{x:.1f}" y="{y:.1f}" width="{size}" height="{size}"/>'
    label = CHIPS.get(name, name[:2].upper())
    rx = size * .22 if rx is None else rx
    fs = size * (.36 if len(label) > 2 else .44)
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{size}" height="{size}" rx="{rx:.1f}" fill="{chip_fill or col(name)}"/>'
            f'<text x="{x + size / 2:.1f}" y="{y + size / 2 + fs * .36:.1f}" font-family="{font}" font-size="{fs:.1f}" '
            f'font-weight="800" fill="{chip_text}" text-anchor="middle">{esc(label)}</text>')


def svg(h, body, css='', defs='', w=W):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<style>
text:not([font-family]) {{ font-family: {SANS}; }}
{css}
@media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}
</style>
<defs>{defs}</defs>
{body}
</svg>
'''
