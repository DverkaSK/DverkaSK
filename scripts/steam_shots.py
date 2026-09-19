"""Collects my MineStickman screenshots from Steam into cards/steam-shots.json for the dverka.sk photo album.

Steam sends no CORS headers, so the page can't read the profile itself: this script scrapes the public
screenshots page of the profile (filtered by game) and the page reads the JSON from raw.githubusercontent.
Images are hotlinked straight from Steam's CDN.
"""
import json
import os
import re
import time
import urllib.request

PROFILE = 'https://steamcommunity.com/profiles/76561198305206516'
APP_ID = 749120  # MineStickman
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'cards')
PAGE = PROFILE + '/screenshots/?appid={app}&sort=newestfirst&browsefilter=myfiles&view=grid&p={p}&l=english'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (dverka.sk album)'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('utf-8', 'replace')


def list_shots():
    shots, seen = [], set()
    for p in range(1, 50):
        page = get(PAGE.format(app=APP_ID, p=p))
        fresh = 0
        for tile in re.split(r'(?=<a href="https://steamcommunity\.com/sharedfiles/filedetails/\?id=)', page)[1:]:
            m = re.search(r'data-publishedfileid="(\d+)"', tile)
            img = re.search(r"background-image: url\('([^'?]+)", tile)
            aspect = re.search(r'data-desired-aspect="([\d.]+)"', tile)
            if not m or not img or m.group(1) in seen:
                continue
            seen.add(m.group(1))
            fresh += 1
            shots.append({'id': m.group(1), 'img': img.group(1), 'aspect': round(float(aspect.group(1)), 3) if aspect else 1.78})
        if not fresh:
            break
        time.sleep(1)
    return shots


def main():
    shots = list_shots()
    if not shots:
        print('Steam returned no screenshots, keeping the previous steam-shots.json')
        return
    path = os.path.join(OUT_DIR, 'steam-shots.json')
    # the number in an image URL changes on every request while the hash stays, so compare by hash:
    # otherwise the Action would commit a "new" album every run
    key = lambda s: (s['id'], s['img'].rstrip('/').rsplit('/', 1)[-1])
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            if [key(s) for s in json.load(f).get('shots', [])] == [key(s) for s in shots]:
                print('Steam screenshots unchanged')
                return
    os.makedirs(OUT_DIR, exist_ok=True)
    data = {'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'profile': PROFILE, 'app': APP_ID, 'shots': shots}
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f'Generated steam-shots.json: {len(shots)} screenshots')


if __name__ == '__main__':
    main()
