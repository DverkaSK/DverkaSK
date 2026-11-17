"""Render an animated SVG at given times: inline it, pause every animation, seek, screenshot."""
import sys, os, subprocess
from PIL import Image
svg, times = sys.argv[1], [float(t) for t in sys.argv[2].split(',')]
src = open(svg, encoding='utf-8').read()
w, h = 840, int(src.split('height="')[1].split('"')[0])
d = os.path.dirname(os.path.abspath(svg)); base = os.path.splitext(os.path.basename(svg))[0]
chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
shots = []
for t in times:
    html = os.path.join(d, '_f.html')
    open(html, 'w', encoding='utf-8').write(f'''<!doctype html><style>body{{margin:0;background:#0d1117;overflow:hidden}}</style>{src}
<script>document.getAnimations().forEach(a=>{{a.pause();a.currentTime={t * 1000}}});
document.querySelectorAll('use').forEach(u=>{{}});</script>''')
    out = os.path.join(d, f'_{base}_{t}.png')
    subprocess.run([chrome, '--headless=new', f'--user-data-dir={d}/../chrf', f'--window-size={w},{h}', '--virtual-time-budget=800',
                    f'--screenshot={out}', 'file:///' + html.replace(os.sep, '/')], capture_output=True)
    shots.append(out)
cols = 2; rows = (len(shots) + 1) // 2
sheet = Image.new('RGB', (w * cols, h * rows), '#222')
for i, p in enumerate(shots):
    sheet.paste(Image.open(p), ((i % cols) * w, (i // cols) * h))
sheet.save(os.path.join(d, f'sheet-{base}.png'))
print('ok', len(shots))
