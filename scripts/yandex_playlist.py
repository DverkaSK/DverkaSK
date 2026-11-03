"""Renders a SoundCloud-style player of 5 random tracks from a Yandex Music playlist into cards/ and the README.

It is one SVG linked to the playlist: GitHub puts gaps between stacked images, so per-track pieces never read as one card.
Needs YANDEX_MUSIC_TOKEN (an OAuth token of the Yandex Music app). The API is unofficial.
"""
import base64
import io
import json
import os
import random
import re
import sys
import urllib.request

from PIL import Image

import soundcloud_style as sc

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT_DIR = os.path.join(ROOT, 'cards')
README = os.path.join(ROOT, 'README.md')
API = 'https://api.music.yandex.net'
PLAYLIST = 'Прошли проверку временем'
TITLE = 'Stood the test of time'
TRACKS = 5
WIDTH = 495


def api(token, path):
    req = urllib.request.Request(API + path, headers={'Authorization': 'OAuth ' + token})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)['result']


def fetch(token):
    acc = api(token, '/account/status')['account']
    pl = next(p for p in api(token, f"/users/{acc['uid']}/playlists/list") if p['title'] == PLAYLIST)
    full = api(token, f"/users/{acc['uid']}/playlists/{pl['kind']}")
    tracks = [t['track'] for t in full.get('tracks', []) if t.get('track') and t['track'].get('available', True)]
    random.shuffle(tracks)
    return f"https://music.yandex.ru/users/{acc['login']}/playlists/{pl['kind']}", tracks[:TRACKS]


def cover(uri, px=84):
    if not uri:
        return None
    with urllib.request.urlopen('https://' + uri.replace('%%', '200x200'), timeout=60) as r:
        im = Image.open(io.BytesIO(r.read())).convert('RGB').resize((px, px), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=72, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def duration(ms):
    s = round(ms / 1000)
    return f'{s // 60}:{s % 60:02d}'


HEAD, ROW = 52, 76


def row(track, art, y, i, t):
    cs = 56
    cy = y + (ROW - cs) / 2
    title = sc.clip_text(track['title'] + (f" ({track['version']})" if track.get('version') else ''), 34)
    artists = sc.clip_text(', '.join(a['name'] for a in track.get('artists', [])), 40)
    picture = (f'<clipPath id="cv{i}"><rect x="20" y="{cy}" width="{cs}" height="{cs}" rx="6"/></clipPath>'
               f'<image href="{art}" x="20" y="{cy}" width="{cs}" height="{cs}" clip-path="url(#cv{i})"/>' if art else
               f'<rect x="20" y="{cy}" width="{cs}" height="{cs}" rx="6" fill="{t["box"]}"/>')
    seed = int(track['id']) if str(track['id']).isdigit() else sum(map(ord, str(track['id'])))
    wx = 92
    return f'''  {picture}{sc.play_button(20 + cs / 2, y + ROW / 2)}
  <text x="{wx}" y="{y + 22}" fill="{t['mu']}" font-size="11.5">{sc.esc(artists)}</text>
  <text x="{wx}" y="{y + 39}" fill="{t['fg']}" font-size="14" font-weight="700">{sc.esc(title)}</text>
  <text x="{WIDTH - 20}" y="{y + 39}" fill="{t['mu']}" font-size="12" text-anchor="end">{duration(track.get('durationMs', 0))}</text>
  {sc.wave(wx, y + 46, WIDTH - 20 - wx - 44, 22, seed, random.uniform(.15, .85), t)}
'''


def card_svg(tracks, arts, t):
    h = HEAD + ROW * len(tracks) + 4
    lines = ''.join(f'<path d="M{20 if i else 0} {HEAD + ROW * i}.5H{WIDTH - (20 if i else 0)}" stroke="{t["line"]}"/>'
                    for i in range(len(tracks)))
    rows = ''.join(row(tr, art, HEAD + ROW * i, i, t) for i, (tr, art) in enumerate(zip(tracks, arts)))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{h}" viewBox="0 0 {WIDTH} {h}" font-family="{sc.FONT}">
  <defs>{sc.GRADIENT_DEFS}</defs>
  <rect x=".5" y=".5" width="{WIDTH - 1}" height="{h - 1}" rx="8" fill="{t['bg']}" stroke="{t['line']}"/>
  <text x="20" y="32" fill="{t['fg']}" font-size="17" font-weight="700">{sc.esc(TITLE)}</text>
  {lines}
{rows}</svg>
'''


def themed(name, alt):
    return (f'<picture><source media="(prefers-color-scheme: dark)" srcset="cards/{name}-dark.svg" />'
            f'<img src="cards/{name}-light.svg" alt="{sc.esc(alt)}" /></picture>')


def main():
    token = os.environ.get('YANDEX_MUSIC_TOKEN')
    if not token:
        sys.exit('YANDEX_MUSIC_TOKEN is not set')
    playlist_url, tracks = fetch(token)
    arts = [cover(tr.get('coverUri') or (tr.get('albums') or [{}])[0].get('coverUri')) for tr in tracks]
    os.makedirs(OUT_DIR, exist_ok=True)
    for theme, t in sc.THEMES.items():
        with open(os.path.join(OUT_DIR, f'playlist-{theme}.svg'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(card_svg(tracks, arts, t))
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
    main()
