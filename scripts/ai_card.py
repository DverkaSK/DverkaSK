"""Generates ai-coding.svg from WakaTime stats (AI vs human line changes)."""
import base64
import json
import os
import sys
import time
import urllib.request

RANGE = 'last_7_days'
OUT = os.path.join(os.path.dirname(__file__), '..', 'ai-coding.svg')

BG, BORDER, TITLE, TEXT, MUTED = '#0d1117', '#30363d', '#58a6ff', '#c9d1d9', '#8b949e'
BOX, TRACK, AI_COLOR, HUMAN_COLOR = '#161b22', '#30363d', '#3b82f6', '#10b981'
FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif"


def fetch_stats(api_key):
    auth = 'Basic ' + base64.b64encode(api_key.encode()).decode()
    req = urllib.request.Request(f'https://wakatime.com/api/v1/users/current/stats/{RANGE}',
                                 headers={'Authorization': auth})
    # WakaTime answers 202 while stats are still being calculated
    for _ in range(6):
        with urllib.request.urlopen(req, timeout=60) as r:
            if r.status == 200:
                data = json.load(r)['data']
                if data.get('is_up_to_date', True):
                    return data
        time.sleep(20)
    return None


def short(n):
    if n >= 1_000_000:
        return f'{n / 1_000_000:.1f}M'.replace('.0M', 'M')
    if n >= 1_000:
        return f'{n / 1_000:.1f}K'.replace('.0K', 'K')
    return str(n)


def stat_box(x, label, value, share, color):
    bar_w = 142
    return f'''
  <rect x="{x}" y="58" width="168" height="76" rx="8" fill="{BOX}" stroke="{BORDER}"/>
  <text x="{x + 13}" y="80" fill="{MUTED}" font-size="12">{label}</text>
  <text x="{x + 13}" y="106" fill="{TEXT}" font-size="22" font-weight="700">{value}</text>
  <rect x="{x + 13}" y="118" width="{bar_w}" height="5" rx="2.5" fill="{TRACK}"/>
  <rect x="{x + 13}" y="118" width="{bar_w * share:.1f}" height="5" rx="2.5" fill="{color}"/>'''


def render(ai, human):
    total = ai + human
    ai_share = ai / total if total else 0
    percent = round(ai_share * 100)
    r = 40
    circ = 2 * 3.14159265 * r
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="495" height="150" viewBox="0 0 495 150" font-family="{FONT}">
  <title>AI Coding: {percent}% AI-driven</title>
  <rect x="0.5" y="0.5" width="494" height="149" rx="4.5" fill="{BG}" stroke="{BORDER}"/>
  <text x="20" y="32" fill="{TITLE}" font-size="18" font-weight="600">AI Coding</text>
  <text x="475" y="32" fill="{MUTED}" font-size="12" text-anchor="end">last 7 days</text>
  <circle cx="68" cy="96" r="{r}" fill="none" stroke="{TRACK}" stroke-width="9"/>
  <circle cx="68" cy="96" r="{r}" fill="none" stroke="{AI_COLOR}" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="{circ * ai_share:.1f} {circ:.1f}" transform="rotate(-90 68 96)"/>
  <text x="68" y="100" fill="{TEXT}" font-size="24" font-weight="700" text-anchor="middle">{percent}<tspan font-size="12" fill="{MUTED}" dy="-8">%</tspan></text>
  <text x="68" y="116" fill="{MUTED}" font-size="10" text-anchor="middle">AI-driven</text>{stat_box(128, 'AI lines', short(ai), ai_share, AI_COLOR)}{stat_box(308, 'Human lines', short(human), 1 - ai_share if total else 0, HUMAN_COLOR)}
</svg>
'''


def main():
    api_key = os.environ.get('WAKATIME_API_KEY')
    if not api_key:
        sys.exit('WAKATIME_API_KEY is not set')
    data = fetch_stats(api_key)
    if data is None:
        print('WakaTime stats are not ready yet, keeping the previous card')
        return
    ai = data.get('ai_additions', 0) + data.get('ai_deletions', 0)
    human = data.get('human_additions', 0) + data.get('human_deletions', 0)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(render(ai, human))
    print(f'AI lines: {ai}, human lines: {human}')


if __name__ == '__main__':
    main()
