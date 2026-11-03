"""Renders a Wrapped-poster player (SoundCloud-like waveforms) of 5 random tracks from a Yandex Music playlist into cards/ and the README.

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

import poster_style as ps
import soundcloud_style as sc

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT_DIR = os.path.join(ROOT, 'cards')
README = os.path.join(ROOT, 'README.md')
API = 'https://api.music.yandex.net'
PLAYLIST = 'Прошли проверку временем'
TITLE = 'Stood the test of time'
TRACKS = 5


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
    return ps.poster(ps.WIDE, TOP + ROW * len(tracks) + 14, [sc.ORANGE, sc.ORANGE_LIGHT, '#c23a00'], dark, body, TITLE)


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
    main()
