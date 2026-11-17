/* ================= RENDER ================= */
const canvas = $('#view'), ctx = canvas.getContext('2d', { willReadFrequently: true });
let SC = 1, DPR = 1, backC, tableC, lettersC, LUM, TR, TG, TB;
seed = 99; const BAG0 = bagFace({ blink: false }); seed = 99; const BAG1 = bagFace({ blink: true });
/* faces are drawn after the light pass, warm-tinted but free of dither, so they always read */
function tint(c, m) { const [o, g] = mk(c.width, c.height); g.drawImage(c, 0, 0); const d = g.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) { d.data[i] *= m[0]; d.data[i + 1] *= m[1]; d.data[i + 2] *= m[2]; } g.putImageData(d, 0, 0); return o; }
const WARM = [1, .93, .82];
const FACES = { bag0: tint(BAG0, WARM), bag1: tint(BAG1, WARM) };
GUESTS.forEach(G => { if (G.face) G.lit = tint(G.face, WARM); });

const LIGHTS = [
  { x: 192, y: 16, r: 240, i: 1.15, c: [1, .86, .66] },   // люстра
  { x: 22, y: 84, r: 95, i: .6, c: [.6, .72, 1] },          // окно
  { x: 316, y: 122, r: 60, i: .55, c: [.75, 1, .85] },      // монитор
  { x: 274, y: 131, r: 38, i: .45, c: [1, .7, .4] },        // свечка
  { x: 80, y: 116, r: 40, i: .3, c: [1, .6, .55] },         // ёлка
  { x: 192, y: 196, r: 175, i: .85, c: [1, .82, .6] },      // тёплый свет спереди, на ник и Дверку
];
const AMB = { i: .3, c: [.8, .74, 1] };
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
let rip = true;
try { if (localStorage.getItem('dverka.rip') === '0') rip = false; } catch (e) {}

function resize() {
  DPR = devicePixelRatio || 1;
  const pw = innerWidth * DPR, ph = innerHeight * DPR;
  SC = Math.max(1, Math.floor(Math.min(ph / 216, pw / 330)));
  W = Math.ceil(pw / SC); H = Math.ceil(ph / SC);
  OX = Math.round((W - 384) / 2); OY = Math.round((H - 216) / 2);
  canvas.width = W; canvas.height = H;
  canvas.style.width = (W * SC / DPR) + 'px'; canvas.style.height = (H * SC / DPR) + 'px';
  ctx.imageSmoothingEnabled = false;
  Object.assign(EXT, { X0: -OX - M, Y0: -OY - M, X1: W - OX + M, Y1: H - OY + M });
  const layer = fn => { const [c, g] = mk(W + 2 * M, H + 2 * M); g.translate(OX + M, OY + M); fn(g); return c; };
  GARLAND.length = 0; TREE_LIGHTS.length = 0;
  backC = layer(drawBack); seed = 5; tableC = layer(drawTable); lettersC = layer(drawLetters);
  // light map with a little colour per light
  const n = W * H; LUM = new Float32Array(n); TR = new Float32Array(n); TG = new Float32Array(n); TB = new Float32Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let l = AMB.i, r = AMB.i * AMB.c[0], gg = AMB.i * AMB.c[1], b = AMB.i * AMB.c[2];
    const sx = x - OX, sy = y - OY;
    for (const Lg of LIGHTS) { const d = Math.hypot(sx - Lg.x, (sy - Lg.y) * 1.15); if (d < Lg.r) { const f = Math.pow(1 - d / Lg.r, 1.5) * Lg.i; l += f; r += f * Lg.c[0]; gg += f * Lg.c[1]; b += f * Lg.c[2]; } }
    const i = y * W + x; LUM[i] = l; TR[i] = r / l; TG[i] = gg / l; TB[i] = b / l;
  }
}

/* night view outside the window, animated snow */
const [NIGHT, ng] = mk(40, 60);
const BLOCKS = []; for (let i = 0; i < 5; i++) { const w = 9 + (Math.random() * 8 | 0), x = i * 9 - 3, h = 20 + (Math.random() * 28 | 0), lit = []; for (let yy = 60 - h + 3; yy < 56; yy += 4) for (let xx = x + 2; xx < x + w - 1; xx += 3) lit.push([xx, yy, Math.random() < .35]); BLOCKS.push({ x, w, h, lit }); }
const FLAKES = Array.from({ length: 34 }, () => [Math.random() * 40, Math.random() * 60, .3 + Math.random() * .7]);
let NIGHTD = null;
function drawNight(t) {
  for (let y = 0; y < 60; y++) rect(ng, 0, y, 40, 1, `rgb(${14 + y * .5 | 0},${19 + y * .4 | 0},${48 + y * .7 | 0})`);
  rect(ng, 30, 6, 4, 4, '#f3e7c9'); rect(ng, 31, 5, 2, 6, '#f3e7c9');
  BLOCKS.forEach(b => { rect(ng, b.x, 60 - b.h, b.w, b.h, '#262a3e'); rect(ng, b.x, 60 - b.h, b.w, 1, '#dfe6f7'); b.lit.forEach(([x, y, on]) => rect(ng, x, y, 2, 2, on ? '#ffcf6a' : '#181b28')); });
  rect(ng, 0, 57, 40, 3, '#cfd8ee');
  FLAKES.forEach(f => { f[1] += f[2] * .7; f[0] += Math.sin(t + f[1] * .2) * .2; if (f[1] > 60) { f[1] = 0; f[0] = Math.random() * 40; } dot(ng, f[0], f[1], '#ffffff'); });
  NIGHTD = ng.getImageData(0, 0, 40, 60).data;
}
const MON = Array.from({ length: 24 }, () => [1 + (Math.random() * 3 | 0), 6 + (Math.random() * 16 | 0), Math.random() < .2]);

/* ---- bubbles ---- */
const mb = $('#m-bubble'); let mbT = 0;
function say(text, s = 2.2) { mb.textContent = text; mb.classList.add('on'); mbT = s; }
GUESTS.forEach(G => { const b = document.createElement('div'); b.className = 'bubble small'; $('#c-bubbles').appendChild(b); G.bubble = b; });
const toCss = (sx, sy) => [sx * SC / DPR, sy * SC / DPR];

/* ---- pointer ---- */
const par = { x: 0, y: 0, tx: 0, ty: 0 }; let ptr = null, hoverSaid = 0;
canvas.addEventListener('pointermove', e => { ptr = [e.clientX, e.clientY]; par.tx = e.clientX / innerWidth * 2 - 1; par.ty = e.clientY / innerHeight * 2 - 1; });
canvas.addEventListener('pointerleave', () => { ptr = null; par.tx = par.ty = 0; });
function overDverka(cx, cy) {
  const pl = Math.round(par.x * 5), ql = Math.round(par.y * 2.5);
  const sx = cx * DPR / SC - OX - pl, sy = cy * DPR / SC - OY - ql;
  return sx > DV.x - 10 && sx < DV.x + 10 && sy > DV.y - 25 && sy < DV.y + 3;
}
const CLICK = ['Тук-тук!', 'Туда пока нельзя. Скоро!', 'Там темно… но уютно', 'Эй, щекотно!', 'Я Дверка!', 'Скрип-скрип'];
canvas.addEventListener('click', e => {
  if (!overDverka(e.clientX, e.clientY)) return;
  say(CLICK[Math.floor(Math.random() * CLICK.length)]); $('#hint').hidden = true;
  if (DV.mode !== 'jump') { DV.queue.unshift({ x: DV.x, y: DV.y }); startJump({ x: DV.x, y: DV.y }); DV.jump.h = 14; DV.jump.d = .35; }
});
document.querySelectorAll('#rip button').forEach(b => {
  b.classList.toggle('on', (b.dataset.r === '1') === rip);
  b.addEventListener('click', () => { rip = b.dataset.r === '1'; try { localStorage.setItem('dverka.rip', rip ? '1' : '0'); } catch (e) {} document.querySelectorAll('#rip button').forEach(x => x.classList.toggle('on', x === b)); });
});

/* ---- frame ---- */
let last = performance.now(), nightT = 0;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  par.x += (par.tx - par.x) * Math.min(1, dt * 4); par.y += (par.ty - par.y) * Math.min(1, dt * 4);
  DV.hover = ptr ? overDverka(ptr[0], ptr[1]) : false;
  canvas.classList.toggle('hot', DV.hover);
  if (DV.hover && now - hoverSaid > 6000) { hoverSaid = now; say('Скри-и-ип… там пока темно'); }
  updateDverka(dt);
  // guests
  GUESTS.forEach(G => {
    G.blinkT -= dt; G.t.blink = G.blinkT < 0; if (G.blinkT < -.14) G.blinkT = 2 + Math.random() * 4;
    G.actT -= dt; if (G.actT < 0) { G.t.act = G.t.act ? 0 : 1; G.actT = G.t.act ? 1.4 : 2.5 + Math.random() * 4; }
    G.t.bob = Math.sin(t * 1.6 + G.cx) > .6 ? 1 : 0;
    G.talkT -= dt; if (G.talkT < 0) { G.talkT = 7 + Math.random() * 9; G.bubble.textContent = G.lines[Math.floor(Math.random() * G.lines.length)]; G.bubble.classList.add('on'); G.bubbleT = 2.4; }
    G.bubbleT -= dt; if (G.bubbleT <= 0) G.bubble.classList.remove('on');
  });
  CAT.blinkT -= dt; CAT.blink = CAT.blinkT < 0; if (CAT.blinkT < -.15) CAT.blinkT = 2 + Math.random() * 3;
  CAT.lookT -= dt; if (CAT.lookT < 0) { CAT.look = CAT.look ? 0 : 1; CAT.lookT = 1.5 + Math.random() * 3; }

  const pb = Math.round(par.x * 1.5), pc = Math.round(par.x * 2.5), pt = Math.round(par.x * 3.5), pl = Math.round(par.x * 5);
  const qb = Math.round(par.y * 1), qt = Math.round(par.y * 1.8), ql = Math.round(par.y * 2.5);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(backC, -M + pb, -M + qb);
  ctx.save(); ctx.translate(OX + pc, OY + qb); GUESTS.forEach(G => drawGuest(ctx, G, t)); ctx.restore();
  ctx.drawImage(tableC, -M + pt, -M + qt);
  ctx.save(); ctx.translate(OX + pt, OY + qt); GUESTS.forEach(G => drawArms(ctx, G, t)); drawCat(ctx, t); ctx.restore();
  ctx.drawImage(lettersC, -M + pl, -M + ql);
  ctx.save(); ctx.translate(OX + pl, OY + ql); drawDverka(ctx, t); ctx.restore();

  // light: quantised with an ordered dither — the “рябь”
  const img = ctx.getImageData(0, 0, W, H), d = img.data, flick = 1 + Math.sin(t * 7) * .012;
  for (let y = 0; y < H; y++) {
    const by = (y & 3) * 4;
    for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4, L = LUM[i] * flick;
      const q = rip ? Math.floor(L * 5 + BAY[by + (x & 3)]) / 5 : L;
      d[j] = Math.min(255, d[j] * q * TR[i]); d[j + 1] = Math.min(255, d[j + 1] * q * TG[i]); d[j + 2] = Math.min(255, d[j + 2] * q * TB[i]);
    }
  }
  ctx.putImageData(img, 0, 0);
  ctx.save(); ctx.translate(OX + pc, OY + qb);
  GUESTS.forEach(G => { const f = G.id === 'bag' ? (G.t.blink ? FACES.bag1 : FACES.bag0) : G.lit, sh = G.id === 'troll2' && G.t.act ? (Math.floor(t * 20) % 2) : 0; ctx.drawImage(f, Math.round(G.cx - f.width / 2), Math.round(124 - f.height + G.t.bob - sh)); });
  ctx.restore();

  // things that glow on their own
  ctx.save(); ctx.translate(OX + pb, OY + qb);
  if ((nightT -= dt) < 0) { nightT = .1; drawNight(t); }
  for (let x = Math.ceil(WIN.xl); x < WIN.xr; x++) {
    const y0 = Math.ceil(WIN.tq(x)), y1 = Math.floor(WIN.bq(x)), u = (x - WIN.xl) / (WIN.xr - WIN.xl);
    for (let y = y0; y < y1; y++) { const v = (y - y0) / (y1 - y0), k = ((v * 59 | 0) * 40 + (u * 39 | 0)) * 4; ctx.fillStyle = `rgb(${NIGHTD[k]},${NIGHTD[k + 1]},${NIGHTD[k + 2]})`; ctx.fillRect(x, y, 1, 1); }
  }
  const xm = (WIN.xl + WIN.xr) / 2; line(ctx, xm, WIN.tq(xm), xm, WIN.bq(xm), '#8f8b82'); line(ctx, WIN.xl, (WIN.tq(WIN.xl) + WIN.bq(WIN.xl)) * .42, WIN.xr, (WIN.tq(WIN.xr) + WIN.bq(WIN.xr)) * .42, '#8f8b82');
  rect(ctx, 303, 112, 25, 20, '#dfe9d6'); rect(ctx, 303, 112, 25, 2, '#7a9a6a');
  const off = (t * 3 | 0) % 24; for (let i = 0; i < 8; i++) { const [x, w, pic] = MON[(i + off) % 24], y = 115 + i * 2; if (pic) { rect(ctx, 304 + x, y, 3, 2, '#9fb4c6'); rect(ctx, 308 + x, y, w - 4, 1, '#6a8a6a'); } else rect(ctx, 304 + x, y, w, 1, i % 3 ? '#4a5a4a' : '#b84a4a'); }
  const cols = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff'];
  GARLAND.forEach(([x, y, n]) => { const on = Math.sin(t * 2.4 + n * 1.7) > -.3; rect(ctx, x, y, 2, 2, on ? cols[n % 5] : '#3a3040'); if (on && rip) { dot(ctx, x - 1, y, cols[n % 5] + '66'); dot(ctx, x + 2, y + 1, cols[n % 5] + '66'); } });
  TREE_LIGHTS.forEach(([x, y, n]) => { if (Math.sin(t * 3 + n * 2.1) > -.2) dot(ctx, x, y, cols[n % 5]); });
  rect(ctx, 79, 82, 3, 3, '#ffe38a'); dot(ctx, 80, 81, '#fff6c8');
  [[183, 16], [192, 17], [201, 16]].forEach(([x, y]) => { rect(ctx, x - 1, y - 1, 3, 3, '#fff1c9'); dot(ctx, x, y - 2, '#fff8e0'); });
  ctx.restore();
  ctx.save(); ctx.translate(OX + pt, OY + qt);
  rect(ctx, 273, 131 - (Math.random() < .3 ? 1 : 0), 2, 3, '#ffcf5a'); dot(ctx, 273, 130, '#fff3c0');
  ctx.restore();

  // bubbles
  GUESTS.forEach(G => { const [x, y] = toCss(G.cx + OX + pc, 78 + OY + qb); G.bubble.style.left = x + 'px'; G.bubble.style.top = y + 'px'; });
  mbT -= dt; if (mbT <= 0) mb.classList.remove('on');
  const [mx, my] = toCss(DV.x + OX + pl, DV.y - 24 + OY + ql); mb.style.left = mx + 'px'; mb.style.top = my + 'px';
  requestAnimationFrame(frame);
}

addEventListener('resize', resize);
resize(); drawNight(0);
setTimeout(() => say('Привет! Я Дверка', 3), 600);
requestAnimationFrame(frame);
