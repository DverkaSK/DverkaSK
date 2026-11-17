/* ================= textures: painted in canvas, detailed enough to hide the geometry ================= */
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 3;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const col = h => new THREE.Color(h).convertSRGBToLinear();

function tex(w, h, draw, { rep, srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.userData = { g, c };
  return t;
}
function noise(g, w, h, n, a, size = 1) { for (let i = 0; i < n; i++) { const v = rnd() * 255 | 0; g.fillStyle = `rgba(${v},${v},${v},${a})`; g.fillRect(rnd() * w, rnd() * h, size, size); } }

const TEX = {
  // lacquered veneer: long grain lines, soft rays
  wood: tex(1024, 512, (g, w, h) => {
    g.fillStyle = '#6a3c22'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 1) { const k = Math.sin(y * .05 + Math.sin(y * .013) * 3) * .5 + .5; g.fillStyle = `rgba(${40 + k * 50 | 0},${20 + k * 25 | 0},${8 + k * 10 | 0},.35)`; g.fillRect(0, y, w, 1); }
    for (let i = 0; i < 260; i++) { const y = rnd() * h, len = 80 + rnd() * 500, x = rnd() * w; g.strokeStyle = `rgba(30,14,6,${.08 + rnd() * .18})`; g.lineWidth = .6 + rnd() * 1.6; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * .3, y + (rnd() - .5) * 8, x + len * .6, y + (rnd() - .5) * 8, x + len, y + (rnd() - .5) * 6); g.stroke(); }
    const gl = g.createLinearGradient(0, 0, w, 0); gl.addColorStop(0, 'rgba(255,200,150,.05)'); gl.addColorStop(.5, 'rgba(255,200,150,0)'); gl.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    noise(g, w, h, 9000, .05);
  }),
  wallpaper: tex(512, 512, (g, w, h) => {
    g.fillStyle = '#6f6a5a'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(x, 0, 30, h); }
    for (let y = 32; y < h; y += 96) for (let x = 32 + (y / 96 % 2) * 32; x < w; x += 64) {
      g.strokeStyle = 'rgba(190,175,130,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 22); g.bezierCurveTo(x + 14, y - 8, x - 14, y + 8, x, y + 22); g.stroke();
      g.fillStyle = 'rgba(170,120,90,.35)'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
    }
    noise(g, w, h, 16000, .06, 2);
    const st = g.createLinearGradient(0, 0, 0, h); st.addColorStop(0, 'rgba(0,0,0,.08)'); st.addColorStop(1, 'rgba(60,40,20,.12)'); g.fillStyle = st; g.fillRect(0, 0, w, h);
  }, { rep: [4, 2] }),
  floor: tex(512, 512, (g, w, h) => {
    for (let y = 0; y < h; y += 64) { g.fillStyle = ['#4a2e1c', '#533421', '#442a19'][(y / 64) % 3]; g.fillRect(0, y, w, 64); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y, w, 2); g.fillRect((y * 5) % w, y, 2, 64); }
    noise(g, w, h, 12000, .06, 2);
  }, { rep: [3, 3] }),
  // tiny surface roughness for plastic, so it never looks like perfect CG
  grain: tex(256, 256, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); noise(g, w, h, 30000, .35); }, { rep: [6, 6], srgb: false }),
  mousepad: tex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1c2b4a'); gr.addColorStop(1, '#0e1526'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,170,255,.25)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * .7, h * .3, 30 + i * 22, 0, 7); g.stroke(); }
    noise(g, w, h, 6000, .08);
  }),
  badge: tex(256, 48, (g, w, h) => { g.fillStyle = '#c9bea0'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a604c'; g.font = 'bold 28px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DVERKA  17"', w / 2, h / 2 + 1); }),
  turbo: tex(64, 32, (g, w, h) => { g.fillStyle = '#1a0500'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff5a1a'; g.font = 'bold 26px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('66', w / 2, h / 2 + 1); }),
  noodle: tex(256, 128, (g, w, h) => {
    g.fillStyle = '#d8312a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e'; g.fillRect(0, 40, w, 46);
    g.fillStyle = '#d8312a'; g.font = 'bold 34px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ЛАПША', w / 2, 76);
    g.fillStyle = '#fff'; g.font = 'bold 14px Arial'; g.fillText('БЫСТРОГО ПРИГОТОВЛЕНИЯ', w / 2, 108);
  }),
  floppyLabel: tex(64, 48, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8aa0c8'; for (let y = 14; y < h; y += 8) { g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); } g.fillStyle = '#2a3a8a'; g.font = '11px "Comic Sans MS", cursive'; g.fillText('warez 2', 6, 11); }),
  paper: tex(256, 320, (g, w, h) => { g.fillStyle = '#eee9dc'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,120,180,.35)'; for (let y = 30; y < h; y += 18) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); } g.fillStyle = 'rgba(40,40,90,.8)'; g.font = '16px "Comic Sans MS", cursive'; ['TODO:', '- плагин', '- сайт', '- выспаться'].forEach((s, i) => g.fillText(s, 20, 26 + (i + 1) * 36)); noise(g, w, h, 3000, .04); }),
  soft: tex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { srgb: false }),
  screen: tex(1024, 768, () => {}),
};
TEX.grain.encoding = THREE.LinearEncoding;

/* ================= what's on the monitor: an imageboard at night ================= */
const POSTS = [
  { n: '31337201', t: ['>2026', '>сидишь в сычевальне', '>на столе кружка и лапша', 'и ведь хорошо же'], pic: 1 },
  { n: '31337214', t: ['>>31337201', 'двачую, лучший вечер'] },
  { n: '31337230', t: ['анон, какой у тебя монитор?', 'у меня 17" ЭЛТ, греет лучше батареи'], pic: 2 },
  { n: '31337245', t: ['>кот ест оливье', '>ничего не могу поделать'] },
  { n: '31337262', t: ['пилю плагин для майна', 'кто со мной?'], pic: 3 },
  { n: '31337277', t: ['С наступающим, аноны'] },
  { n: '31337290', t: ['>>31337262', 'DverkaSK, ты?'] },
];
function drawScreen(t) {
  const { g, c } = TEX.screen.userData, W = c.width, H = c.height;
  g.fillStyle = '#ffffee'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#800000'; g.font = 'bold 42px Tahoma, Verdana, sans-serif'; g.textAlign = 'center'; g.fillText('/b/ — Бред', W / 2, 62);
  g.fillStyle = '#b4a098'; g.fillRect(40, 84, W - 80, 2);
  g.textAlign = 'left';
  const scroll = (t * 18) % 520;
  g.save(); g.beginPath(); g.rect(0, 96, W, H - 170); g.clip();
  let y = 110 - scroll;
  for (let rep = 0; rep < 2; rep++) POSTS.forEach((p, i) => {
    const hgt = 40 + p.t.length * 30 + (p.pic ? 40 : 0);
    g.fillStyle = i === 0 && rep === 0 ? '#ffffee' : '#f0e0d6'; g.fillRect(48, y, W - 120, hgt);
    g.font = 'bold 20px Tahoma, Verdana, sans-serif'; g.fillStyle = '#117743'; g.fillText('Аноним', 64, y + 28);
    g.font = '18px Tahoma, Verdana, sans-serif'; g.fillStyle = '#34345c'; g.fillText('15/09/26 Втр 23:4' + (i % 10) + ':0' + (i * 7 % 10) + '  №' + p.n, 160, y + 28);
    let tx = 64, ty = y + 62;
    if (p.pic) { const px0 = 64, py0 = y + 42; g.fillStyle = ['#9fb4c6', '#c9a26a', '#6aa84f'][p.pic - 1]; g.fillRect(px0, py0, 110, 80); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(px0, py0 + 80); g.lineTo(px0 + 40, py0 + 36); g.lineTo(px0 + 70, py0 + 60); g.lineTo(px0 + 110, py0 + 26); g.lineTo(px0 + 110, py0 + 80); g.fill(); tx = 196; }
    g.font = '22px Tahoma, Verdana, sans-serif';
    p.t.forEach((line, k) => { g.fillStyle = line.startsWith('>>') ? '#dd0000' : line.startsWith('>') ? '#789922' : '#800000'; g.fillText(line, tx, ty + k * 30); });
    y += hgt + 18;
  });
  g.restore();
  // reply box with a blinking cursor
  g.fillStyle = '#eeeeee'; g.fillRect(48, H - 64, W - 220, 40); g.strokeStyle = '#aaa'; g.strokeRect(48.5, H - 63.5, W - 221, 39);
  g.fillStyle = '#333'; g.font = '20px Tahoma, Verdana, sans-serif'; g.fillText('>и кот тоже тут' + (Math.floor(t * 2) % 2 ? '|' : ''), 60, H - 37);
  g.fillStyle = '#d6d6ce'; g.fillRect(W - 160, H - 64, 110, 40); g.fillStyle = '#222'; g.fillText('Отправить', W - 150, H - 37);
  // CRT: scanlines, soft vignette, a rolling brightness band
  g.fillStyle = 'rgba(0,0,0,.09)'; for (let yy = 0; yy < H; yy += 3) g.fillRect(0, yy, W, 1);
  const band = (t * 120) % (H + 200) - 100; const bg = g.createLinearGradient(0, band - 80, 0, band + 80); bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(.5, 'rgba(255,255,255,.05)'); bg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = bg; g.fillRect(0, band - 80, W, 160);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  TEX.screen.needsUpdate = true;
}
