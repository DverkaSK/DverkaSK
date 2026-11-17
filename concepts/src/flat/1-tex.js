/* ================= PIXEL TEXTURES ================= */
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.userData = { g, c, draw };
  return t;
}
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function speckle(g, w, h, n, cols) { for (let i = 0; i < n; i++) px(g, rnd() * w | 0, rnd() * h | 0, 1, 1, cols[i % cols.length]); }

const TEX = {
  wallpaper: canvasTex(16, 16, (g) => {
    px(g, 0, 0, 16, 16, '#b49d76');
    for (let x = 0; x < 16; x += 8) px(g, x, 0, 2, 16, '#a48d67');
    [[4, 3], [12, 11]].forEach(([x, y]) => { px(g, x, y, 1, 1, '#8a5d45'); px(g, x - 1, y + 1, 3, 1, '#8a5d45'); px(g, x, y + 2, 1, 1, '#8a5d45'); px(g, x, y + 3, 1, 2, '#6f7a4a'); });
    speckle(g, 16, 16, 10, ['#bda882', '#a9926b']);
  }, [14, 7]),
  rug: canvasTex(64, 40, (g, w, h) => {
    px(g, 0, 0, w, h, '#6e1419');
    px(g, 2, 2, w - 4, h - 4, '#1f2b52');
    px(g, 4, 4, w - 8, h - 8, '#a3262b');
    for (let x = 4; x < w - 4; x += 4) { px(g, x, 3, 2, 1, '#e6d3a3'); px(g, x + 2, h - 4, 2, 1, '#e6d3a3'); }
    for (let y = 4; y < h - 4; y += 4) { px(g, 3, y, 1, 2, '#e6d3a3'); px(g, w - 4, y + 2, 1, 2, '#e6d3a3'); }
    const cx = w / 2, cy = h / 2;
    for (let r = 14; r > 0; r -= 3) {
      const col = ['#1f2b52', '#e6d3a3', '#d88a2a', '#6e1419', '#e6d3a3'][(r / 3 | 0) % 5];
      for (let i = -r; i <= r; i++) { const j = r - Math.abs(i); px(g, cx + i * 1.6 | 0, cy + j | 0, 2, 1, col); px(g, cx + i * 1.6 | 0, cy - j | 0, 2, 1, col); }
    }
    [[12, 10], [w - 13, 10], [12, h - 11], [w - 13, h - 11]].forEach(([x, y]) => { px(g, x - 3, y, 7, 1, '#e6d3a3'); px(g, x, y - 3, 1, 7, '#e6d3a3'); px(g, x - 1, y - 1, 3, 3, '#d88a2a'); });
    speckle(g, w, h, 60, ['#8e1f24', '#b6343a']);
  }),
  lino: canvasTex(32, 32, (g) => {
    for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 16) {
      const o = (y / 8) % 2 ? 8 : 0, c = ['#744a2f', '#6b432a', '#7e5436'][((x + y) / 8) % 3];
      px(g, (x + o) % 32, y, 16, 8, c); if (x + o + 16 > 32) px(g, 0, y, (x + o + 16) % 32, 8, c);
      px(g, (x + o) % 32, y, 16, 1, '#5a3822');
    }
    speckle(g, 32, 32, 40, ['#83593a', '#61402a']);
  }, [8, 6]),
  ceiling: canvasTex(32, 32, (g) => { px(g, 0, 0, 32, 32, '#cfcabd'); speckle(g, 32, 32, 30, ['#c4bfb1', '#d9d4c7']); px(g, 3, 20, 9, 1, '#b3ad9e'); px(g, 11, 21, 6, 1, '#b3ad9e'); }, [6, 4]),
  cloth: canvasTex(32, 32, (g) => {
    px(g, 0, 0, 32, 32, '#e9e4d6');
    for (let i = 0; i < 32; i += 4) { px(g, i, 0, 2, 2, '#d6cfbc'); px(g, 0, i, 2, 2, '#d6cfbc'); }
    for (let x = 6; x < 32; x += 8) for (let y = 6; y < 32; y += 8) { px(g, x, y - 1, 1, 3, '#d9d2c0'); px(g, x - 1, y, 3, 1, '#d9d2c0'); }
  }, [2, 1]),
  olivier: canvasTex(16, 16, (g) => { px(g, 0, 0, 16, 16, '#e3d18f'); speckle(g, 16, 16, 40, ['#6aa84f', '#e07b2a', '#f2e6b8', '#c9a95a', '#d97a7a']); }),
  herring: canvasTex(16, 8, (g) => { px(g, 0, 0, 16, 8, '#7d2350'); speckle(g, 16, 8, 14, ['#f2e6d8', '#9a3368', '#e8a0c0']); }),
  radiator: canvasTex(16, 16, (g) => { for (let x = 0; x < 16; x += 4) { px(g, x, 0, 3, 16, '#d8d3c7'); px(g, x + 3, 0, 1, 16, '#9c978b'); px(g, x, 0, 1, 16, '#ebe7dd'); } }, [3, 1]),
  wood: canvasTex(16, 16, (g) => { px(g, 0, 0, 16, 16, '#6b3f26'); for (let y = 0; y < 16; y += 3) px(g, 0, y, 16, 1, '#5a331f'); speckle(g, 16, 16, 12, ['#7a4b2e']); }),
  sofa: canvasTex(16, 16, (g) => { px(g, 0, 0, 16, 16, '#6b5a3c'); for (let y = 0; y < 16; y += 4) for (let x = (y / 4 % 2) * 2; x < 16; x += 4) px(g, x, y, 2, 2, '#7d6a48'); }, [4, 1]),
  beige: canvasTex(8, 8, (g) => { px(g, 0, 0, 8, 8, '#cfc6ad'); speckle(g, 8, 8, 6, ['#c2b89c']); }),
  // animated screens
  window: canvasTex(48, 64, () => {}),
  tv: canvasTex(32, 24, () => {}),
  monitor: canvasTex(32, 24, () => {}),
};

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
  WIN_BLOCKS.slice().sort((a, b) => a.depth - b.depth).forEach(b => {
    px(g, b.x, 64 - b.h, b.w, b.h, b.depth > .5 ? '#2c3149' : '#232739');
    px(g, b.x, 64 - b.h, b.w, 1, '#dfe6f7');
    b.lit.forEach(([x, y, on]) => px(g, x, y, 2, 2, on ? '#ffcf6a' : '#1a1d2c'));
  });
  px(g, 0, 60, 48, 4, '#cfd8ee');
  FLAKES.forEach(f => { f[1] += f[2] * .6; f[0] += Math.sin(t + f[1] * .2) * .15; if (f[1] > 64) { f[1] = 0; f[0] = Math.random() * 48; } px(g, f[0] | 0, f[1] | 0, 1, 1, '#ffffff'); });
  TEX.window.needsUpdate = true;
}
function drawTV(t) {
  const { g } = TEX.tv.userData;
  px(g, 0, 0, 32, 24, '#101a3a');
  for (let i = 0; i < 6; i++) { // fireworks
    const ph = (t * .6 + i * .37) % 1, cx = 5 + (i * 9) % 24, cy = 6 + (i * 5) % 10, r = ph * 7, col = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff', '#fff'][i];
    if (ph < .75) for (let a = 0; a < 8; a++) px(g, cx + Math.cos(a * .785) * r | 0, cy + Math.sin(a * .785) * r | 0, 1, 1, col);
  }
  px(g, 0, 19, 32, 5, '#1b2a5c'); px(g, 3, 20, 26, 1, '#f3e7c9'); px(g, 6, 22, 20, 1, '#9fb4ff');
  for (let y = 0; y < 24; y += 2) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, 32, 1); }
  TEX.tv.needsUpdate = true;
}
const MON_LINES = Array.from({ length: 30 }, () => [1 + (rnd() * 3 | 0), 6 + (rnd() * 22 | 0), rnd() < .2]);
function drawMonitor(t) {
  const { g } = TEX.monitor.userData;
  px(g, 0, 0, 32, 24, '#e9f0e4'); px(g, 0, 0, 32, 3, '#7a9a6a');
  const off = (t * 3 | 0) % 30;
  for (let i = 0; i < 9; i++) {
    const [x, w, pic] = MON_LINES[(i + off) % 30], y = 5 + i * 2;
    if (pic) { px(g, x, y, 4, 3, '#b7c9d6'); px(g, x + 5, y, w - 5, 1, '#789978'); }
    else px(g, x, y, w, 1, i % 3 ? '#4a5a4a' : '#b84a4a');
  }
  px(g, 30, 5 + ((t * 2 | 0) % 17), 1, 2, '#9aa89a');
  TEX.monitor.needsUpdate = true;
}

/* ================= CHARACTER SPRITES (placeholders) ================= */
function circ(g, cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }
const CW = 40, CH = 56;
function mug(g, x, y, up, steam, f) {
  px(g, x, y + up, 6, 6, '#f3efe6'); px(g, x + 6, y + 1 + up, 2, 3, '#f3efe6'); px(g, x + 1, y + up, 4, 1, '#7a3a1a');
  if (steam) { px(g, x + 1, y - 3 - (f % 3) + up, 1, 2, 'rgba(255,255,255,.55)'); px(g, x + 4, y - 4 - ((f + 1) % 3) + up, 1, 2, 'rgba(255,255,255,.45)'); }
}
function paperBag(g, x, y, w, h, base, shade, rim, f) {
  px(g, x, y, w, h, base);
  px(g, x + w - 4, y, 4, h, shade);
  px(g, x, y, w, 4, rim);
  for (let i = 0; i < w; i += 2) px(g, x + i, y - 1 + ((i / 2 + (f >> 3)) % 2), 2, 1, rim);
  px(g, x + 6, y + 5, 1, h - 6, shade); px(g, x + w - 8, y + 5, 1, h - 6, shade);
  px(g, x, y + h - 1, w, 1, shade);
}
function eyeHoles(g, x1, x2, y, blink) {
  [x1, x2].forEach(x => { px(g, x, y, 4, 3, '#1a120c'); px(g, x + 1, y - 1, 2, 1, '#1a120c'); if (!blink) px(g, x + 1, y + 1, 1, 1, '#f3efe6'); });
}
const CHARS = {
  bag: (g, s) => { // пакетоголовый: kraft fast-food bag, hoodie, tea
    circ(g, 20, 40, 15, '#34443a'); px(g, 5, 40, 30, 16, '#34443a'); px(g, 17, 33, 1, 8, '#c9c9c9'); px(g, 22, 33, 1, 8, '#c9c9c9');
    paperBag(g, 9, 5, 22, 27, '#b98a55', '#a0744a', '#caa06a', s.f);
    eyeHoles(g, 13, 23, 13, s.blink);
    px(g, 13, 21, 14, 5, '#c0392b'); px(g, 17, 22, 6, 1, '#f2c14e'); px(g, 16, 23, 8, 1, '#6b3a1c'); px(g, 17, 24, 6, 1, '#f2c14e'); px(g, 18, 21, 1, 1, '#fff3c0');
    const up = s.sip ? -7 : 0; mug(g, 30, 34, up, true, s.f); px(g, 27, 36 + up, 3, 4, '#34443a');
  },
  troll: (g, s) => { // grin mask, tracksuit with stripes
    const sh = s.laugh ? (s.f % 2) : 0;
    circ(g, 20, 41, 15, '#1d2030'); px(g, 5, 41, 30, 15, '#1d2030');
    px(g, 7, 34, 2, 22, '#e8e8e8'); px(g, 10, 33, 2, 23, '#e8e8e8'); px(g, 29, 33, 2, 23, '#e8e8e8'); px(g, 32, 34, 2, 22, '#e8e8e8');
    px(g, 18, 30, 5, 10, '#2c3044'); px(g, 20, 31, 1, 7, '#cfcfcf');
    for (let i = 0; i < 11; i++) px(g, 10 + i * 2, 3 + (i % 3), 2, 6 - (i % 3), '#17161a');
    const y0 = 7 - sh;
    px(g, 10, y0 + 1, 20, 22, '#f2f1ea'); px(g, 11, y0, 18, 1, '#f2f1ea'); px(g, 11, y0 + 23, 18, 2, '#f2f1ea'); px(g, 13, y0 + 25, 14, 1, '#f2f1ea');
    px(g, 28, y0 + 1, 2, 22, '#d9d7cc');
    px(g, 12, y0 + 4, 5, 1, '#222'); px(g, 11, y0 + 5, 1, 1, '#222'); px(g, 23, y0 + 3, 5, 1, '#222'); px(g, 28, y0 + 4, 1, 1, '#222');
    px(g, 13, y0 + 8, 4, 1, '#222'); px(g, 12, y0 + 7, 1, 1, '#222'); px(g, 17, y0 + 7, 1, 1, '#222');
    px(g, 23, y0 + 8, 4, 1, '#222'); px(g, 22, y0 + 7, 1, 1, '#222'); px(g, 27, y0 + 7, 1, 1, '#222');
    px(g, 11, y0 + 13, 18, 1, '#222'); px(g, 10, y0 + 12, 1, 1, '#222'); px(g, 29, y0 + 12, 1, 1, '#222');
    for (let x = 12; x < 29; x += 2) px(g, x, y0 + 14, 1, 3, '#222');
    px(g, 12, y0 + 17, 16, 1, '#222'); px(g, 14, y0 + 18, 12, 1, '#222');
    px(g, 16, y0 + 21, 8, 1, '#bdbbb0'); px(g, 12, y0 + 10, 2, 1, '#bdbbb0'); px(g, 26, y0 + 10, 2, 1, '#bdbbb0');
    px(g, 4, 34, 5, 6, '#1d2030'); px(g, 3, 31, 5, 5, '#e9c9a8'); // hand holding a glass
    px(g, 2, 25, 5, 7, 'rgba(191,227,255,.55)'); px(g, 2, 28, 5, 4, 'rgba(240,200,90,.8)');
  },
  bag2: (g, s) => { // white bag with a marker smile, grey snowflake sweater, mandarin
    circ(g, 20, 41, 15, '#6e7480'); px(g, 5, 41, 30, 15, '#6e7480');
    for (let x = 6; x < 34; x += 4) { px(g, x, 37, 2, 1, '#e8e8ee'); px(g, x + 2, 45, 2, 1, '#e8e8ee'); }
    [[13, 41], [26, 41]].forEach(([x, y]) => { px(g, x, y - 2, 1, 5, '#e8e8ee'); px(g, x - 2, y, 5, 1, '#e8e8ee'); });
    paperBag(g, 9, 6, 22, 26, '#ece7da', '#cfc8b6', '#f6f3ea', s.f + 5);
    eyeHoles(g, 13, 23, 13, s.blink);
    px(g, 15, 21, 1, 1, '#2a2a2a'); px(g, 16, 22, 8, 1, '#2a2a2a'); px(g, 24, 21, 1, 1, '#2a2a2a'); // :)
    px(g, 12, 9, 3, 1, '#2a2a2a'); px(g, 25, 9, 3, 1, '#2a2a2a');
    circ(g, 8, 33, 3, '#f08a1e'); px(g, 8, 29, 1, 2, '#4d7a36'); px(g, 5, 36, 6, 4, '#6e7480');
    if (s.peel) { px(g, 11, 33, 3, 2, '#f7a24a'); px(g, 12, 35, 2, 1, '#f7a24a'); }
  },
  cat: (g, s) => {
    circ(g, 20, 42, 12, '#1d1a22'); circ(g, 20, 45, 6, '#f3efe6');
    circ(g, 20, 27, 10, '#1d1a22'); px(g, 11, 16, 4, 7, '#1d1a22'); px(g, 25, 16, 4, 7, '#1d1a22'); px(g, 12, 19, 2, 3, '#d88a9a'); px(g, 26, 19, 2, 3, '#d88a9a');
    px(g, 17, 29, 7, 5, '#f3efe6');
    const lx = s.look;
    if (s.blink) { px(g, 13, 26, 4, 1, '#8fe36a'); px(g, 23, 26, 4, 1, '#8fe36a'); }
    else { px(g, 13, 24, 4, 4, '#8fe36a'); px(g, 23, 24, 4, 4, '#8fe36a'); px(g, 14 + lx, 24, 2, 4, '#111'); px(g, 24 + lx, 24, 2, 4, '#111'); px(g, 13, 24, 1, 1, '#d6ffc0'); px(g, 23, 24, 1, 1, '#d6ffc0'); }
    px(g, 19, 29, 2, 1, '#d88a9a'); px(g, 20, 30, 1, 1, '#555');
    px(g, 8, 29, 6, 1, '#bbb'); px(g, 8, 31, 6, 1, '#bbb'); px(g, 27, 29, 6, 1, '#bbb'); px(g, 27, 31, 6, 1, '#bbb');
    const tl = [0, 1, 2, 1][s.f % 4]; px(g, 30, 48 - tl, 4, 4, '#1d1a22'); px(g, 33, 43 - tl * 2, 3, 6, '#1d1a22'); px(g, 34, 39 - tl * 2, 3, 5, '#1d1a22');
    px(g, 13, 52, 5, 3, '#f3efe6'); px(g, 22, 52, 5, 3, '#f3efe6');
    px(g, 11, 15, 9, 3, '#d23b3b'); px(g, 12, 12, 7, 3, '#d23b3b'); px(g, 14, 9, 4, 3, '#d23b3b'); px(g, 17, 7, 3, 2, '#f3efe6'); px(g, 10, 17, 11, 2, '#f3efe6');
  },
};
function charTex(kind) {
  const t = canvasTex(CW, CH, () => {});
  t.userData.kind = kind; t.userData.s = { blink: false, look: 0, f: 0, sip: false, peel: false, laugh: false };
  return t;
}
function redrawChar(t) {
  const { g, kind, s } = t.userData;
  g.clearRect(0, 0, CW, CH); CHARS[kind](g, s); t.needsUpdate = true;
}
