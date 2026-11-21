"""Preview the real playlist card (scripts/player_card.py) for several random track picks.

python preview_palettes.py [seed ...]  -> palettes/seed-N.svg + preview-palettes.html (dark + light rows)
python preview_palettes.py --freeze T OUT.png [seed ...]  -> inline render with animations frozen at T s
"""
import json
import random
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(HERE / "player"))
from player_card import card_svg  # noqa: E402
from yandex_playlist import CACHE, TITLE, TRACKS  # noqa: E402

CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"


def cards(seeds):
    tracks = json.loads(Path(CACHE).read_text(encoding="utf-8"))
    out = HERE / "palettes"
    out.mkdir(exist_ok=True)
    files = []
    for sd in seeds:
        pick = random.Random(sd).sample(tracks, TRACKS)
        for theme in ("dark", "light"):
            (out / f"seed-{sd}-{theme}.svg").write_text(card_svg(pick, TITLE, theme == "dark"), encoding="utf-8")
        files.append(out / f"seed-{sd}-dark.svg")
    return files


def main(argv):
    if argv[:1] == ["--freeze"]:
        t, png, seeds = float(argv[1]), argv[2], [int(x) for x in argv[3:]] or [1, 2, 3, 4]
        svgs = "".join(f'<div style="display:inline-block;margin:6px">{f.read_text(encoding="utf-8")}</div>' for f in cards(seeds))
        page = HERE / "_freeze.html"
        page.write_text(f"""<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0d1117;width:1720px">{svgs}
<script>document.fonts.ready.then(()=>{{for(const a of document.getAnimations()){{a.pause();a.currentTime={t * 1000};}}}});</script>""",
                        encoding="utf-8")
        rows = (len(seeds) + 1) // 2
        subprocess.run([CHROME, "--headless=new", f"--user-data-dir={Path(png).parent / 'chr_freeze'}", "--hide-scrollbars",
                        f"--window-size=1720,{rows * 520}", "--virtual-time-budget=2000", f"--screenshot={png}", page.as_uri()],
                       capture_output=True)
        page.unlink()
        print(png)
        return
    seeds = [int(x) for x in argv] or [1, 2, 3, 4, 5, 6]
    names = [f.name for f in cards(seeds)]
    imgs = "".join(f'<p align="center"><img src="palettes/{n}"></p>' for n in names)
    imgs_light = "".join(f'<p align="center"><img src="palettes/{n.replace("-dark", "-light")}"></p>' for n in names)
    (HERE / "preview-palettes.html").write_text(f"""<!doctype html><meta charset="utf-8"><title>palettes</title>
<style>body{{margin:0;font:16px sans-serif}} .dark{{background:#0d1117}} .light{{background:#fff}}
section{{padding:20px 0}} article{{max-width:838px;margin:0 auto}} p{{margin:0 0 16px}} img{{max-width:100%}}</style>
<section class="dark"><article>{imgs}</article></section>
<section class="light"><article>{imgs_light}</article></section>""", encoding="utf-8")
    print("ok", seeds)


if __name__ == "__main__":
    main(sys.argv[1:])
