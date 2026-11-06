"""Renders a Wrapped-poster player (SoundCloud-like waveforms) of 5 random tracks from a Yandex Music playlist into cards/ and the README.

It is one SVG linked to the playlist: GitHub puts gaps between stacked images, so per-track pieces never read as one card.
Yandex Music answers GitHub runners with HTTP 451, so the playlist is cached in cards/playlist.json:
  python scripts/yandex_playlist.py --sync   # run locally: refresh the cache (tracks + covers) from the public playlist
  python scripts/yandex_playlist.py          # CI: pick random tracks from the cache and render the card
The API is unofficial.
"""
import base64
import colorsys
import io
import json
import os
import random
import re
import urllib.request

from PIL import Image

import poster_style as ps
import soundcloud_style as sc

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT_DIR = os.path.join(ROOT, 'cards')
README = os.path.join(ROOT, 'README.md')
API = 'https://api.music.yandex.net'
OWNER, KIND = 'itsfunkylegend', 1002
PLAYLIST_URL = f'https://music.yandex.ru/users/{OWNER}/playlists/{KIND}'
CACHE = os.path.join(OUT_DIR, 'playlist.json')
TITLE = 'Stood the test of time'
TRACKS = 5


def fetch():
    with urllib.request.urlopen(f'{API}/users/{OWNER}/playlists/{KIND}', timeout=60) as r:
        full = json.load(r)['result']
    return [t['track'] for t in full.get('tracks', []) if t.get('track') and t['track'].get('available', True)]


def sync():
    tracks = []
    for tr in fetch():
        tracks.append(dict(
            id=tr['id'], title=tr['title'], version=tr.get('version'), durationMs=tr.get('durationMs', 0),
            artists=[dict(name=a['name']) for a in tr.get('artists', [])],
            art=cover(tr.get('coverUri') or (tr.get('albums') or [{}])[0].get('coverUri'))))
    with open(CACHE, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(tracks, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'Cached {len(tracks)} tracks into {os.path.relpath(CACHE, ROOT)}')


def cover(uri, px=84):
    if not uri:
        return None
    with urllib.request.urlopen('https://' + uri.replace('%%', '200x200'), timeout=60) as r:
        im = Image.open(io.BytesIO(r.read())).convert('RGB').resize((px, px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=72, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def accent(art):
    """The cover's most vivid frequent colour: hue buckets weighted by saturation and brightness, so a small
    bright detail can beat a large grey area. None for (near) grayscale covers."""
    if not art:
        return None
    im = Image.open(io.BytesIO(base64.b64decode(art.split(',', 1)[1]))).convert('RGB').resize((32, 32))
    buckets = {}
    for r, g, b in im.getdata():
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s < .25 or v < .2:
            continue
        w = s * v
        acc = buckets.setdefault(round(h * 18) % 18, [0, 0, 0, 0])
        acc[0] += w; acc[1] += r * w; acc[2] += g * w; acc[3] += b * w
    if not buckets:
        return None
    w, r, g, b = max(buckets.values(), key=lambda a: a[0])
    h, s, v = colorsys.rgb_to_hsv(r / w / 255, g / w / 255, b / w / 255)
    r, g, b = colorsys.hsv_to_rgb(h, max(s, .55), max(v, .7))  # lift dull averages into a poster-bright tone
    return '#' + ''.join(f'{round(c * 255):02x}' for c in (r, g, b))


def tints(arts):
    found = list(dict.fromkeys(c for c in map(accent, arts) if c))
    return found or [sc.ORANGE, sc.ORANGE_LIGHT, '#c23a00']


def duration(ms):
    s = round(ms / 1000)
    return f'{s // 60}:{s % 60:02d}'


TOP, ROW = 92, 74


def row(track, art, i, p):
    y = TOP + i * ROW
    title = sc.clip_text(track['title'] + (f" ({track['version']})" if track.get('version') else ''), 26)
    artists = sc.clip_text(', '.join(a['name'] for a in track.get('artists', [])), 36)
    picture = (f'<clipPath id="cv{i}"><rect x="58" y="{y + 6}" width="56" height="56" rx="8"/></clipPath>'
               f'<image href="{art}" x="58" y="{y + 6}" width="56" height="56" clip-path="url(#cv{i})"/>' if art else
               f'<rect x="58" y="{y + 6}" width="56" height="56" rx="8" fill="{p["chip"]}"/>')
    seed = int(track['id']) if str(track['id']).isdigit() else sum(map(ord, str(track['id'])))
    return f'''  <g class="row" style="animation-delay:{.15 + i * .08:.2f}s">
  <text x="28" y="{y + 36}" font-family="{ps.HEAVY}" font-size="25" font-weight="900" fill="{p['fg']}" fill-opacity=".35">{i + 1}</text>
  {picture}{sc.play_button(86, y + 34, 14)}
  <text x="132" y="{y + 22}" font-family="{ps.BOLD}" font-size="12" font-weight="700" fill="{p['mu']}">{sc.esc(artists)}</text>
  {ps.heavy(132, y + 42, title, 18, p['fg'])}
  {ps.heavy(ps.WIDE - 28, y + 42, duration(track.get('durationMs', 0)), 14, p['mu'], 'end')}
  {sc.wave(420, y + 26, ps.WIDE - 28 - 420 - 56, 30, seed, random.uniform(.15, .85), dict(un=p['un'], unr=p['faint']))}</g>'''


def card_svg(tracks, arts, dark):
    p = ps.palette(dark)
    body = (f'  <defs>{sc.GRADIENT_DEFS}</defs>\n  {ps.label(28, 44, "On repeat · Yandex Music", p)}\n'
            f'  {ps.heavy(26, 76, TITLE, 28, p["fg"])}\n'
            + '\n'.join(row(tr, art, i, p) for i, (tr, art) in enumerate(zip(tracks, arts))))
    return ps.poster(ps.WIDE, TOP + ROW * len(tracks) + 14, tints(arts), dark, body, TITLE)


def themed(name, alt):
    return (f'<picture><source media="(prefers-color-scheme: dark)" srcset="cards/{name}-dark.svg" />'
            f'<img src="cards/{name}-light.svg" alt="{sc.esc(alt)}" /></picture>')


def main():
    with open(CACHE, encoding='utf-8') as f:
        tracks = random.sample(json.load(f), TRACKS)
    arts = [tr.get('art') for tr in tracks]
    playlist_url = PLAYLIST_URL
    os.makedirs(OUT_DIR, exist_ok=True)
    for theme in ('dark', 'light'):
        with open(os.path.join(OUT_DIR, f'playlist-{theme}.svg'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(card_svg(tracks, arts, theme == 'dark'))
    alt = TITLE + ': ' + '; '.join(f"{', '.join(a['name'] for a in tr.get('artists', []))} — {tr['title']}" for tr in tracks)
    block = (f'<!-- playlist:start -->\n<p align="center">\n  <a href="{playlist_url}">{themed("playlist", alt)}</a>\n'
             '</p>\n<!-- playlist:end -->')
    readme = open(README, encoding='utf-8').read()
    readme, n = re.subn(r'<!-- playlist:start -->.*?<!-- playlist:end -->', lambda _: block, readme, flags=re.S)
    if n:
        with open(README, 'w', encoding='utf-8', newline='\n') as f:
            f.write(readme)
    print(f'Generated playlist player: {len(tracks)} tracks, README {"updated" if n else "has no playlist markers"}')


if __name__ == '__main__':
    import sys
    sync() if '--sync' in sys.argv else main()
