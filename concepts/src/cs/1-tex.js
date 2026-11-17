/* ================= GoldSrc-ish textures: small, soft, bilinear ================= */
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function canvasTex(w, h, draw, rep, crisp) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (crisp) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  else { t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; }
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.userData = { g, c, draw };
  return t;
}
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function speckle(g, w, h, n, cols, s = 1) { for (let i = 0; i < n; i++) px(g, rnd() * w | 0, rnd() * h | 0, s, s, cols[i % cols.length]); }
function blotch(g, w, h, n, col, r0, r1) { g.fillStyle = col; for (let i = 0; i < n; i++) { g.beginPath(); g.arc(rnd() * w, rnd() * h, r0 + rnd() * (r1 - r0), 0, 7); g.fill(); } }
function flower(g, x, y, s, petal, core) { g.fillStyle = petal; for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.257) * s, y + Math.sin(a * 1.257) * s, s * .7, 0, 7); g.fill(); } g.fillStyle = core; g.beginPath(); g.arc(x, y, s * .5, 0, 7); g.fill(); }

const TEX = {
  wallpaper: canvasTex(64, 64, g => {
    px(g, 0, 0, 64, 64, '#e6d2b4'); blotch(g, 64, 64, 30, 'rgba(210,185,150,.25)', 3, 9);
    [[12, 10], [44, 26], [20, 44], [52, 56], [4, 30], [36, 2]].forEach(([x, y]) => { flower(g, x, y, 2.6, '#c48f6a', '#8a5a3c'); g.strokeStyle = '#8c9a6a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 3); g.quadraticCurveTo(x + 3, y + 7, x + 1, y + 10); g.stroke(); });
    speckle(g, 64, 64, 90, ['#dcc6a6', '#eddcc2']);
  }, [9, 4]),
  plaster: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#d9ccb3'); blotch(g, 64, 64, 60, 'rgba(180,165,140,.18)', 2, 7); blotch(g, 64, 64, 40, 'rgba(240,232,214,.25)', 1, 4); speckle(g, 64, 64, 200, ['#cbbda3', '#e4d8c2']); }, [5, 4]),
  floorWood: canvasTex(64, 64, g => { for (let y = 0; y < 64; y += 8) { px(g, 0, y, 64, 8, ['#8a5a36', '#7d5031', '#93623c'][(y / 8) % 3]); px(g, 0, y, 64, 1, '#5e3a22'); px(g, (y * 7) % 64, y, 1, 8, '#5e3a22'); } speckle(g, 64, 64, 120, ['#9c6a42', '#734828']); }, [8, 7]),
  carpet: canvasTex(128, 96, (g, w, h) => {
    px(g, 0, 0, w, h, '#2d4a7a'); px(g, 6, 6, w - 12, h - 12, '#8fb3cf'); px(g, 12, 12, w - 24, h - 24, '#3a6aa0');
    g.strokeStyle = '#e9e1cc'; g.lineWidth = 2; g.strokeRect(9, 9, w - 18, h - 18);
    const cx = w / 2, cy = h / 2;
    [[34, '#e9e1cc'], [28, '#2d4a7a'], [22, '#b9423a'], [15, '#e9e1cc'], [9, '#2d4a7a']].forEach(([r, c]) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - r * .75); g.lineTo(cx + r * 1.4, cy); g.lineTo(cx, cy + r * .75); g.lineTo(cx - r * 1.4, cy); g.fill(); });
    speckle(g, w, h, 300, ['rgba(255,255,255,.08)', 'rgba(0,0,0,.08)'], 2);
  }),
  rug: canvasTex(128, 80, (g, w, h) => {
    px(g, 0, 0, w, h, '#6e1419'); px(g, 5, 5, w - 10, h - 10, '#1f2b52'); px(g, 9, 9, w - 18, h - 18, '#a3262b');
    for (let x = 8; x < w - 8; x += 6) { px(g, x, 6, 3, 2, '#e6d3a3'); px(g, x + 3, h - 8, 3, 2, '#e6d3a3'); }
    const cx = w / 2, cy = h / 2;
    [[30, '#1f2b52'], [25, '#e6d3a3'], [20, '#d88a2a'], [14, '#6e1419'], [9, '#e6d3a3'], [4, '#1f2b52']].forEach(([r, c]) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - r * .9); g.lineTo(cx + r * 1.6, cy); g.lineTo(cx, cy + r * .9); g.lineTo(cx - r * 1.6, cy); g.fill(); });
    [[22, 18], [w - 22, 18], [22, h - 18], [w - 22, h - 18]].forEach(([x, y]) => { g.fillStyle = '#e6d3a3'; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 7, y); g.lineTo(x, y + 7); g.lineTo(x - 7, y); g.fill(); });
    speckle(g, w, h, 260, ['rgba(0,0,0,.12)', 'rgba(255,220,180,.08)'], 2);
  }),
  cloth: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#efe9dc'); for (let x = 0; x < 64; x += 8) for (let y = 0; y < 64; y += 8) { g.strokeStyle = 'rgba(190,175,150,.35)'; g.strokeRect(x + 2.5, y + 2.5, 3, 3); } speckle(g, 64, 64, 60, ['#e2dccd']); }, [3, 2]),
  olivier: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#e6d59a'); speckle(g, 64, 64, 260, ['#7fae5a', '#e2873a', '#f4ecc8', '#c9a95a', '#d98a7a'], 3); }),
  shuba: canvasTex(32, 32, g => { px(g, 0, 0, 32, 32, '#8a2a5a'); speckle(g, 32, 32, 90, ['#f2e6d8', '#a13a6e', '#e6a0c0'], 2); }),
  metal: canvasTex(32, 32, g => { const gr = g.createLinearGradient(0, 0, 32, 0); gr.addColorStop(0, '#8e949a'); gr.addColorStop(.5, '#d8dde0'); gr.addColorStop(1, '#7a8086'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); speckle(g, 32, 32, 40, ['rgba(0,0,0,.1)']); }, [3, 1]),
  wood: canvasTex(32, 32, g => { px(g, 0, 0, 32, 32, '#6b3f26'); for (let y = 0; y < 32; y += 4) px(g, 0, y, 32, 1, 'rgba(40,20,10,.35)'); speckle(g, 32, 32, 60, ['#7a4b2e', '#5a331f']); }),
  sofa: canvasTex(32, 32, g => { px(g, 0, 0, 32, 32, '#7a5a3e'); for (let y = 0; y < 32; y += 8) for (let x = (y / 8 % 2) * 4; x < 32; x += 8) px(g, x, y, 4, 4, '#8a6a4a'); speckle(g, 32, 32, 50, ['#6a4c33']); }, [4, 1]),
  radiator: canvasTex(32, 32, g => { for (let x = 0; x < 32; x += 6) { px(g, x, 0, 5, 32, '#e0dcd2'); px(g, x + 5, 0, 1, 32, '#9c978b'); } }, [3, 1]),
  beige: canvasTex(16, 16, g => { px(g, 0, 0, 16, 16, '#cfc6ad'); speckle(g, 16, 16, 20, ['#c2b89c', '#d8d0ba']); }),
  robe: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#141318'); for (let x = 0; x < 64; x += 7) { g.fillStyle = 'rgba(70,68,80,.35)'; g.fillRect(x, 0, 2, 64); } blotch(g, 64, 64, 20, 'rgba(0,0,0,.35)', 3, 8); }),
  hoodie: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#5c616e'); px(g, 0, 50, 64, 14, '#4f535f'); px(g, 20, 34, 24, 14, '#50545f'); px(g, 26, 0, 2, 22, '#d9d9d9'); px(g, 36, 0, 2, 22, '#d9d9d9'); speckle(g, 64, 64, 120, ['#666b78', '#555a66']); }),
  halat: canvasTex(64, 64, g => { px(g, 0, 0, 64, 64, '#7a2231'); for (let x = 0; x < 64; x += 8) px(g, x, 0, 3, 64, '#8f2f40'); for (let y = 0; y < 64; y += 8) px(g, 0, y, 64, 2, 'rgba(40,5,15,.35)'); speckle(g, 64, 64, 80, ['#6a1c29']); }),
  slipper: canvasTex(16, 16, g => { px(g, 0, 0, 16, 16, '#3f6ea8'); speckle(g, 16, 16, 40, ['#5c8cc6', '#2f5a8c']); }),
  bagFront: canvasTex(64, 72, g => {
    px(g, 0, 0, 64, 72, '#b98a55'); px(g, 0, 0, 64, 9, '#caa06a');
    g.fillStyle = '#8a6038'; for (let x = 0; x < 64; x += 4) g.fillRect(x, (x / 4 % 2) * 2, 4, 2);
    px(g, 10, 12, 2, 60, '#a0744a'); px(g, 52, 12, 2, 60, '#a0744a'); blotch(g, 64, 72, 14, 'rgba(150,110,70,.25)', 3, 8);
    [[14, 24], [38, 24]].forEach(([x, y]) => { g.fillStyle = '#120a06'; g.beginPath(); g.ellipse(x + 6, y + 5, 7, 6, 0, 0, 7); g.fill(); g.fillStyle = '#f3efe6'; g.beginPath(); g.arc(x + 8, y + 6, 1.8, 0, 7); g.fill(); });
    g.strokeStyle = '#2a1a0e'; g.lineWidth = 2; g.beginPath(); g.moveTo(22, 50); g.quadraticCurveTo(32, 56, 42, 50); g.stroke();
  }),
  bagSide: canvasTex(32, 36, g => { px(g, 0, 0, 32, 36, '#a88050'); px(g, 0, 0, 32, 5, '#caa06a'); px(g, 14, 6, 3, 30, '#94693f'); blotch(g, 32, 36, 8, 'rgba(90,60,30,.2)', 2, 5); }),
  bagTop: canvasTex(32, 32, g => { px(g, 0, 0, 32, 32, '#6a4a2a'); px(g, 4, 4, 24, 24, '#4a321c'); }),
  // Ghostface mask, flat with transparent surround so it sits on the hood like a mask
  ghost: canvasTex(64, 96, g => {
    g.fillStyle = '#f2f0ea'; g.beginPath(); g.moveTo(32, 3); g.bezierCurveTo(56, 3, 60, 30, 56, 50); g.bezierCurveTo(52, 72, 42, 93, 32, 93); g.bezierCurveTo(22, 93, 12, 72, 8, 50); g.bezierCurveTo(4, 30, 8, 3, 32, 3); g.fill();
    const sh = g.createLinearGradient(8, 0, 56, 0); sh.addColorStop(0, 'rgba(0,0,0,.12)'); sh.addColorStop(.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = sh; g.fill();
    g.fillStyle = '#0c0c0e';
    [[1, 20], [-1, 44]].forEach(([s, x]) => { g.beginPath(); g.moveTo(x - 8, 26); g.bezierCurveTo(x - 8, 18, x + 8, 18, x + 8, 28); g.bezierCurveTo(x + 8, 40, x + 3 * s, 46, x, 46); g.bezierCurveTo(x - 5, 46, x - 8, 36, x - 8, 26); g.fill(); });
    g.beginPath(); g.moveTo(30, 50); g.lineTo(34, 50); g.lineTo(33, 54); g.lineTo(31, 54); g.fill();
    g.beginPath(); g.ellipse(32, 72, 6.5, 14, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(120,115,110,.35)'; g.fillRect(18, 58, 6, 2); g.fillRect(40, 58, 6, 2);
  }),
  catFace: canvasTex(48, 40, g => {
    px(g, 0, 0, 48, 40, '#1d1a22'); g.fillStyle = '#f3efe6'; g.beginPath(); g.ellipse(24, 30, 11, 12, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(24, 18, 5, 8, 0, 0, 7); g.fill();
    [[12, 15], [36, 15]].forEach(([x, y]) => { g.fillStyle = '#8fe36a'; g.beginPath(); g.ellipse(x, y, 6, 5, 0, 0, 7); g.fill(); g.fillStyle = '#0d0d0d'; g.beginPath(); g.ellipse(x, y, 1.8, 4.5, 0, 0, 7); g.fill(); g.fillStyle = '#e6ffd8'; g.fillRect(x - 3, y - 3, 2, 2); });
    g.fillStyle = '#e38aa0'; g.beginPath(); g.moveTo(21, 24); g.lineTo(27, 24); g.lineTo(24, 28); g.fill();
    g.strokeStyle = '#aaa'; g.lineWidth = 1; [[0, 26], [0, 30], [48, 26], [48, 30]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x ? 34 : 14, 28); g.lineTo(x, y); g.stroke(); });
  }),
  catChest: canvasTex(32, 32, g => { px(g, 0, 0, 32, 32, '#1d1a22'); g.fillStyle = '#f3efe6'; g.beginPath(); g.ellipse(16, 22, 9, 12, 0, 0, 7); g.fill(); }),
  window: canvasTex(48, 64, () => {}, null, true),
  tv: canvasTex(32, 24, () => {}),
  monitor: canvasTex(32, 24, () => {}),
};
/* the original trollface PNG has a white background: flood-fill it away from the edges so only the face remains */
const TROLL_C = document.createElement('canvas'); TROLL_C.width = 222; TROLL_C.height = 180;
const TROLL = new THREE.CanvasTexture(TROLL_C);
TROLL.magFilter = THREE.LinearFilter; TROLL.minFilter = THREE.LinearMipmapLinearFilter;
(() => {
  const im = new Image();
  im.onload = () => {
    const g = TROLL_C.getContext('2d'), W = TROLL_C.width, H = TROLL_C.height;
    g.drawImage(im, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H), a = d.data, seen = new Uint8Array(W * H), q = [];
    const light = i => a[i * 4 + 3] < 20 || (a[i * 4] > 225 && a[i * 4 + 1] > 225 && a[i * 4 + 2] > 225);
    for (let x = 0; x < W; x++) { q.push(x, (H - 1) * W + x); } for (let y = 0; y < H; y++) { q.push(y * W, y * W + W - 1); }
    while (q.length) {
      const i = q.pop(); if (seen[i] || !light(i)) continue; seen[i] = 1; a[i * 4 + 3] = 0;
      const x = i % W, y = (i / W) | 0;
      if (x > 0) q.push(i - 1); if (x < W - 1) q.push(i + 1); if (y > 0) q.push(i - W); if (y < H - 1) q.push(i + W);
    }
    g.putImageData(d, 0, 0); TROLL.needsUpdate = true;
  };
  im.src = TROLL_PNG;
})();

/* night view out of the window: panel blocks, lit windows, snow */
const WIN_BLOCKS = [];
for (let i = 0; i < 5; i++) {
  const w = 10 + (rnd() * 8 | 0), x = i * 10 - 4 + (rnd() * 4 | 0), h = 22 + (rnd() * 26 | 0), lit = [];
  for (let yy = 64 - h + 3; yy < 60; yy += 4) for (let xx = x + 2; xx < x + w - 1; xx += 3) lit.push([xx, yy, rnd() < .35]);
  WIN_BLOCKS.push({ x, w, h, lit, depth: rnd() });
}
const FLAKES = Array.from({ length: 40 }, () => [rnd() * 48, rnd() * 64, .3 + rnd() * .7]);
function drawWindow(t) {
  const { g } = TEX.window.userData;
  for (let y = 0; y < 64; y++) { const k = y / 64; px(g, 0, y, 48, 1, `rgb(${14 + k * 30 | 0},${19 + k * 24 | 0},${48 + k * 40 | 0})`); }
  px(g, 36, 8, 5, 5, '#f3e7c9'); px(g, 37, 7, 3, 7, '#f3e7c9');
  WIN_BLOCKS.slice().sort((a, b) => a.depth - b.depth).forEach(b => { px(g, b.x, 64 - b.h, b.w, b.h, b.depth > .5 ? '#2c3149' : '#232739'); px(g, b.x, 64 - b.h, b.w, 1, '#dfe6f7'); b.lit.forEach(([x, y, on]) => px(g, x, y, 2, 2, on ? '#ffcf6a' : '#1a1d2c')); });
  px(g, 0, 60, 48, 4, '#cfd8ee');
  FLAKES.forEach(f => { f[1] += f[2] * .6; f[0] += Math.sin(t + f[1] * .2) * .15; if (f[1] > 64) { f[1] = 0; f[0] = Math.random() * 48; } px(g, f[0] | 0, f[1] | 0, 1, 1, '#ffffff'); });
  TEX.window.needsUpdate = true;
}
function drawTV(t) {
  const { g } = TEX.tv.userData;
  px(g, 0, 0, 32, 24, '#101a3a');
  for (let i = 0; i < 6; i++) { const ph = (t * .6 + i * .37) % 1, cx = 5 + (i * 9) % 24, cy = 6 + (i * 5) % 10, r = ph * 7, col = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff', '#fff'][i]; if (ph < .75) for (let a = 0; a < 8; a++) px(g, cx + Math.cos(a * .785) * r | 0, cy + Math.sin(a * .785) * r | 0, 1, 1, col); }
  px(g, 0, 19, 32, 5, '#1b2a5c'); px(g, 3, 20, 26, 1, '#f3e7c9');
  TEX.tv.needsUpdate = true;
}
const MON_LINES = Array.from({ length: 30 }, () => [1 + (rnd() * 3 | 0), 6 + (rnd() * 22 | 0), rnd() < .2]);
function drawMonitor(t) {
  const { g } = TEX.monitor.userData;
  px(g, 0, 0, 32, 24, '#e9f0e4'); px(g, 0, 0, 32, 3, '#7a9a6a');
  const off = (t * 3 | 0) % 30;
  for (let i = 0; i < 9; i++) { const [x, w, pic] = MON_LINES[(i + off) % 30], y = 5 + i * 2; if (pic) { px(g, x, y, 4, 3, '#b7c9d6'); px(g, x + 5, y, w - 5, 1, '#789978'); } else px(g, x, y, w, 1, i % 3 ? '#4a5a4a' : '#b84a4a'); }
  TEX.monitor.needsUpdate = true;
}
