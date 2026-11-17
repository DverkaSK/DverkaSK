import pathlib

def rep(f, pairs):
    p = pathlib.Path(f); t = p.read_text(encoding='utf-8')
    for a, b in pairs:
        assert a in t, (f, a[:80]); t = t.replace(a, b)
    p.write_text(t, encoding='utf-8')

# 2-room: drop sprite guests, move the sign closer to the table
p = pathlib.Path('2-room.js'); t = p.read_text(encoding='utf-8')
if '/* ---- guests (placeholder sprites) ---- */' in t:
    t = t[:t.index('/* ---- guests (placeholder sprites) ---- */')]
t = t.replace("const NICK = 'DverkaSK', VOX = .065, NICK_Z = .95;", "const NICK = 'DverkaSK', VOX = .06, NICK_Z = .72;")
p.write_text(t, encoding='utf-8')

rep('3-mascot.js', [
 ("const ZONES = { front: { x: [-2.1, 2.1], z: [1.25, 1.85] }, mid: { x: [-1.6, 1.3], z: [-.15, .68] } };",
  "const ZONES = { front: { x: [-1.9, 1.9], z: [.98, 1.3] }, mid: { x: [-1.5, 1.2], z: [-.2, .48] } };"),
 ("const startZ = MV.zone === 'front' ? 1.28 : .66;", "const startZ = MV.zone === 'front' ? 1.0 : .48;"),
 ("DV.root.position.set(.4, 0, 1.5);", "DV.root.position.set(.4, 0, 1.15);"),
])

rep('head.html', [
 ('<div class="pix" id="pix"><span>пиксель</span><button type="button" data-p="0">крупно</button><button type="button" data-p="1">средне</button><button type="button" data-p="2">мелко</button></div>',
  '<div class="ctrl">\n  <div class="pix" id="look"><span>стиль</span><button type="button" data-s="1">дизер</button><button type="button" data-s="2">палитра</button><button type="button" data-s="3">PS1</button><button type="button" data-s="0">чисто</button></div>\n  <div class="pix" id="pix"><span>пиксель</span><button type="button" data-p="0">крупно</button><button type="button" data-p="1">средне</button><button type="button" data-p="2">мелко</button></div>\n</div>'),
 ("  .pix { position: fixed; z-index: 4; right: 16px; top: calc(12px + env(safe-area-inset-top, 0px)); display: flex; gap: 6px; align-items: center;",
  "  .ctrl { position: fixed; z-index: 4; right: 16px; top: calc(12px + env(safe-area-inset-top, 0px)); display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }\n  .pix { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end;"),
])

m = pathlib.Path('4-main.js'); t = m.read_text(encoding='utf-8')
a = t.index('  // guests: blink, sip, look around, chat now and then'); b = t.index('  mbT -= dt;')
t = t[:a] + '  updateGuests(dt, t);\n' + t[b:]
pairs = [
 ("const CAM = { x: 0, y: 2.15, z: 4.95, look: new THREE.Vector3(0, .58, -.2), px: 0, py: 0, dist: 1 };",
  "const CAM = { x: 0, y: 1.85, z: 3.9, look: new THREE.Vector3(0, .55, -.45), px: 0, py: 0, dist: 1 };"),
 ("  renderer.render(scene, camera);\n  requestAnimationFrame(frame);", "  POST.mat.uniforms.uTime.value = t % 10;\n  renderFrame();\n  requestAnimationFrame(frame);"),
 ("  canvas.style.width = (w * k / dpr) + 'px'; canvas.style.height = (h * k / dpr) + 'px';",
  "  canvas.style.width = (w * k / dpr) + 'px'; canvas.style.height = (h * k / dpr) + 'px';\n  if (POST.rt) POST.rt.dispose();\n  POST.rt = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });\n  POST.mat.uniforms.tDiffuse.value = POST.rt.texture; POST.mat.uniforms.uRes.value.set(w, h);"),
 ("/* low-res render blown up by a whole number", pathlib.Path('post.js').read_text(encoding='utf-8') + "/* low-res render blown up by a whole number"),
]
for x, y in pairs:
    assert x in t, x[:80]; t = t.replace(x, y)
m.write_text(t, encoding='utf-8')
