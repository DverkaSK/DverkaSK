"""Spotify Wrapped-like poster style shared by every README card: tinted gradient, blurred colour blobs,
a spaced caps label, one giant number and a numbered top list with logos."""
import soundcloud_style as sc

WIDE, HALF = 838, 413  # full width of a GitHub profile README / two side by side
HEAVY = "'Segoe UI Black', 'Arial Black', 'Helvetica Neue', -apple-system, sans-serif"
BOLD = "-apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

# every name a card shows needs a logo here (icons/); mono ones are drawn on a white disc
ICONS = {
    'Java': 'java.svg', 'SQL': 'sql.svg', 'YAML': 'yaml.svg', 'XML': 'xml.svg', 'Markdown': 'markdown.svg',
    'Groovy': 'groovy.png', 'JSON': 'json.svg', 'Python': 'python.svg', 'Kotlin': 'kotlin.svg', 'Go': 'go.svg',
    'TypeScript': 'typescript.svg', 'JavaScript': 'javascript.svg', 'HTML': 'html5.svg', 'CSS': 'css3.svg',
    'Bash': 'bash.svg', 'Gradle': 'gradle.svg', 'Docker': 'docker.svg',
    'IntelliJ IDEA': 'intellij.svg', 'Claude Code': 'claude.svg', 'GoLand': 'goland.svg', 'DataGrip': 'datagrip.svg',
    'VS Code': 'vscode.svg', 'PyCharm': 'pycharm.svg', 'CLion': 'clion.svg', 'RustRover': 'rustrover.svg',
    'Warp': 'warp.svg', 'Eclipse': 'eclipse.svg',
    'Claude': 'claude.svg', 'Opus': 'claude.svg', 'Sonnet': 'claude.svg', 'Haiku': 'claude.svg', 'GPT': 'openai.svg',
    'Gemini': 'gemini.svg', 'DeepSeek': 'deepseek.svg', 'Grok': 'grok.svg', 'Qwen': 'qwen.svg', 'Kimi': 'kimi.svg',
    'OpenCode': 'opencode.svg',
}


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def mix(c, w, k):
    a = [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(w[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x + (y - x) * k):02x}' for x, y in zip(a, b))


def palette(dark):
    return dict(fg='#ffffff', mu='#ffffffa8', faint='#ffffff1f', chip='#ffffff1a', un='#ffffff40') if dark else \
        dict(fg='#1b1410', mu='#1b1410a0', faint='#1b14101c', chip='#1b141012', un='#1b141030')


def poster(w, h, tints, dark, body, title, css=''):
    """Rounded card: diagonal gradient tinted by the card's leading colour plus blurred blobs of its other colours."""
    base = tints[0]
    bg0, bg1 = (mix(base, '#000000', .9), mix(base, '#000000', .78)) if dark else \
        (mix(base, '#ffffff', .9), mix(base, '#ffffff', .78))
    # soft blobs are radial gradients, not a blur filter: a filter is re-rasterised on every animation frame,
    # which made the cards stutter while they animated in
    spots = [(.12, .95, .55), (.42, .05, .42), (.92, .95, .38), (.75, .1, .3)]
    grads = ''.join(f'<radialGradient id="b{i}"><stop offset="0" stop-color="{tints[i % len(tints)]}" stop-opacity="{o * (1 if dark else .8):.2f}"/>'
                    f'<stop offset=".45" stop-color="{tints[i % len(tints)]}" stop-opacity="{o * (.62 if dark else .5):.2f}"/>'
                    f'<stop offset="1" stop-color="{tints[i % len(tints)]}" stop-opacity="0"/></radialGradient>'
                    for i, (_, _, o) in enumerate(spots))
    blobs = ''.join(f'<circle cx="{w * x:.0f}" cy="{h * y:.0f}" r="{min(w, h) * .8:.0f}" fill="url(#b{i})"/>'
                    for i, (x, y, _) in enumerate(spots))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <title>{esc(title)}</title>
  <style>
  .pop {{ animation: pop .8s cubic-bezier(.2,1.4,.4,1) both; }}
  @keyframes pop {{ from {{ transform: scale(.7); opacity: 0; }} }}
  .row {{ animation: in .5s ease-out both; }}
  @keyframes in {{ from {{ transform: translateX(24px); opacity: 0; }} }}{css}
  @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}
  </style>
  <defs><clipPath id="cl"><rect width="{w}" height="{h}" rx="16"/></clipPath>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{bg0}"/><stop offset="1" stop-color="{bg1}"/></linearGradient>
  {grads}</defs>
  <g clip-path="url(#cl)"><rect width="{w}" height="{h}" fill="url(#bg)"/>{blobs}
{body}
  </g>
</svg>
'''


def label(x, y, text, p):
    return (f'<text x="{x}" y="{y}" font-family="{BOLD}" font-size="12.5" font-weight="800" letter-spacing="3" '
            f'fill="{p["mu"]}">{esc(text.upper())}</text>')


def hero(x, y, text, size, p, origin):
    return (f'<g class="pop" style="transform-origin:{origin}"><text x="{x}" y="{y}" font-family="{HEAVY}" font-size="{size}" '
            f'font-weight="900" fill="{p["fg"]}" letter-spacing="{-size / 30:.1f}">{esc(text)}</text></g>')


def heavy(x, y, text, size, fill, anchor='start'):
    return (f'<text x="{x}" y="{y}" font-family="{HEAVY}" font-size="{size}" font-weight="900" fill="{fill}" '
            f'text-anchor="{anchor}">{esc(text)}</text>')


def disc(name, colour, cx, cy, r):
    """The logo on a white disc; a coloured initial only while icons/ has no logo for it yet."""
    f = ICONS.get(name)
    if f:
        s = r * 1.25
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#ffffff"/>'
                f'<image href="{sc.icon_uri(f)}" x="{cx - s / 2:.1f}" y="{cy - s / 2:.1f}" width="{s:.1f}" height="{s:.1f}"/>')
    print(f'warning: no logo for {name}, add one to icons/ and poster_style.ICONS')
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{colour}"/>'
            f'<text x="{cx}" y="{cy + r * .38:.1f}" font-family="{HEAVY}" font-size="{r * 1.05:.0f}" font-weight="900" '
            f'fill="#fff" text-anchor="middle">{esc(name[0])}</text>')


def toplist(x, y, w, rows, p, step=50, fs=24, r=17, delay=.15):
    """rows: (name, value, share of the total 0..1, colour) -> rank, logo, name, value + %, thin share bar."""
    out = []
    for i, (name, value, share, c) in enumerate(rows):
        yy = y + i * step
        base = yy + fs * .38
        pc = '&lt;1%' if share < .01 else f'{share * 100:.0f}%'
        nx = x + 36 + r * 2
        bw = x + w - nx
        out.append(f'''  <g class="row" style="animation-delay:{delay + i * .08:.2f}s">
  <text x="{x}" y="{base:.1f}" font-family="{HEAVY}" font-size="{fs * 1.05:.0f}" font-weight="900" fill="{p["fg"]}" fill-opacity=".35">{i + 1}</text>
  {disc(name, c, x + 26 + r, yy, r)}
  {heavy(nx, f"{base:.1f}", name, fs, p["fg"])}
  <text x="{x + w}" y="{base:.1f}" font-family="{HEAVY}" font-size="{fs * .82:.1f}" font-weight="900" fill="{p["fg"]}" text-anchor="end">{esc(value)}<tspan font-family="{BOLD}" font-size="{max(11, fs * .5):.0f}" font-weight="700" fill="{p["mu"]}"> {pc}</tspan></text>
  <rect x="{nx}" y="{base + 8:.1f}" width="{bw}" height="4" rx="2" fill="{p["faint"]}"/>
  <rect x="{nx}" y="{base + 8:.1f}" width="{max(3, bw * share):.1f}" height="4" rx="2" fill="{c}"/></g>''')
    return '\n'.join(out)
