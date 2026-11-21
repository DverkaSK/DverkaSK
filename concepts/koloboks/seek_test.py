"""Render player-dark.svg inline with all CSS animations frozen at T seconds: python seek_test.py T out.png"""
import subprocess, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
t, out = float(sys.argv[1]), sys.argv[2]
svg = (HERE / "player-dark.svg").read_text(encoding="utf-8")
page = HERE / "_seek.html"
page.write_text(f"""<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0d1117">{svg}
<script>document.fonts.ready.then(()=>{{for(const a of document.getAnimations()){{a.pause();a.currentTime={t * 1000};}}}});</script>""",
                encoding="utf-8")
subprocess.run([r"C:/Program Files/Google/Chrome/Application/chrome.exe", "--headless=new",
                f"--user-data-dir={Path(out).parent / 'chr_seek'}", "--hide-scrollbars", "--window-size=838,520",
                "--virtual-time-budget=1500", f"--screenshot={out}", page.as_uri()], capture_output=True)
print(out)
