/* ================= the nick on the floor ================= */
const NICK = 'DverkaSK', NICK_Y = 872, NICK_FS = 150;
let LETTERS = [];
function layoutNick() {
  ctx.save(); ctx.font = `${NICK_FS}px Chewy, "Comic Sans MS", cursive`;
  const ws = [...NICK].map(c => ctx.measureText(c).width), gap = 6, total = ws.reduce((a, b) => a + b, 0) + gap * (NICK.length - 1);
  let x = 800 - total / 2;
  LETTERS = [...NICK].map((c, i) => { const m = ctx.measureText(c), L0 = { c, x, w: ws[i], top: NICK_Y - (m.actualBoundingBoxAscent || NICK_FS * .7) }; x += ws[i] + gap; return L0; });
  ctx.restore();
}
function drawNick() {
  ctx.save(); ctx.font = `${NICK_FS}px Chewy, "Comic Sans MS", cursive`; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  LETTERS.forEach((l, i) => {
    const id = 500 + i, dx = jit(id, 1, 1) * 3, dy = jit(id, 2, 2) * 3, rot = jit(id, 3, 3) * .03 + (i % 2 ? .03 : -.03);
    ctx.save(); ctx.translate(l.x + l.w / 2 + dx, NICK_Y + dy); ctx.rotate(rot);
    ctx.fillStyle = '#6b3a1c'; ctx.fillText(l.c, -l.w / 2 + 7, 8);
    ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.strokeText(l.c, -l.w / 2, 0);
    ctx.fillStyle = i >= 6 ? '#ff7a4a' : '#ffcf4a'; ctx.fillText(l.c, -l.w / 2, 0);
    ctx.restore();
  });
  ctx.restore();
}

/* ================= DVERKA: the little door ================= */
const FLOOR = 892;
const DV = { x: 520, y: FLOOR, ground: FLOOR, vx: 0, face: 1, mode: 'pause', t: 1, target: 520, fast: false, queue: [], jump: null, phase: 0, open: 0, hover: false, squash: 0, say: 'Привет! Я Дверка', sayT: 3 };
const rand = (a, b) => a + Math.random() * (b - a);
function planNext() {
  if (Math.random() < .45 && LETTERS.length) {
    const dir = Math.random() < .5 ? 1 : -1, L0 = dir > 0 ? LETTERS : LETTERS.slice().reverse();
    DV.target = L0[0].x + L0[0].w / 2 - dir * 70; DV.mode = 'walk'; DV.fast = true;
    DV.queue = L0.map(l => ({ x: l.x + l.w / 2, y: l.top - 2 }));
    DV.queue.push({ x: L0[L0.length - 1].x + L0[L0.length - 1].w / 2 + dir * 80, y: FLOOR });
  } else { DV.target = rand(120, 1480); DV.mode = 'walk'; DV.fast = Math.random() < .4; DV.queue = []; }
}
function startJump(to) { const dx = to.x - DV.x; DV.jump = { x0: DV.x, y0: DV.y, x1: to.x, y1: to.y, k: 0, d: .24 + Math.abs(dx) / 900, h: 40 + Math.abs(dx) * .15 + Math.max(0, DV.y - to.y) * .5 }; DV.face = dx >= 0 ? 1 : -1; DV.mode = 'jump'; }
function tickDverka(dt) {
  DV.squash = Math.max(0, DV.squash - dt);
  DV.open += ((DV.hover ? 1 : 0) - DV.open) * Math.min(1, dt * 8);
  DV.sayT -= dt; if (DV.sayT <= 0) DV.say = null;
  if (DV.hover) return;
  if (DV.mode === 'walk') {
    const dx = DV.target - DV.x, sp = DV.fast ? 560 : 340;
    if (Math.abs(dx) < 4) { DV.x = DV.target; DV.vx = 0; DV.squash = .1; if (DV.queue.length) { DV.mode = 'hop'; DV.t = rand(.12, .4); } else { DV.mode = 'pause'; DV.t = rand(.4, 1.6); } }
    else { DV.vx += (Math.sign(dx) * Math.min(sp, Math.abs(dx) * 8) - DV.vx) * Math.min(1, dt * 12); DV.x += DV.vx * dt; DV.face = DV.vx >= 0 ? 1 : -1; DV.phase += dt * Math.abs(DV.vx) / 22; }
  } else if (DV.mode === 'hop') { DV.t -= dt; if (DV.t <= 0) startJump(DV.queue.shift()); }
  else if (DV.mode === 'jump') {
    const J = DV.jump; J.k = Math.min(1, J.k + dt / J.d);
    DV.x = J.x0 + (J.x1 - J.x0) * J.k; DV.y = J.y0 + (J.y1 - J.y0) * J.k - Math.sin(J.k * Math.PI) * J.h;
    if (J.k >= 1) { DV.y = J.y1; DV.ground = J.y1; DV.squash = .12; if (DV.queue.length) { DV.mode = 'hop'; DV.t = .05; } else { DV.mode = 'pause'; DV.t = rand(.3, 1); } }
  } else if (DV.mode === 'pause') { DV.t -= dt; if (DV.t <= 0) planNext(); }
  if (DV.mode !== 'jump') DV.ground = DV.y;
}
function drawDverka(t) {
  const run = DV.mode === 'walk' && Math.abs(DV.vx) > 30, air = DV.mode === 'jump', f = DV.hover ? 1 : DV.face;
  const step = run ? Math.sin(DV.phase * 2) : 0, sq = DV.squash > 0 ? .88 : 1;
  flat(ellPts(DV.x, DV.ground + 4, 34, 7, 12), 'rgba(0,0,0,.25)');
  group(DV.x, DV.y, (run ? .08 * f : 0), () => {
    ctx.scale(1 / Math.sqrt(sq), sq);
    const la = air ? -8 : step * 8, lb = air ? -4 : -step * 8;
    L([[-12, -18], [-14 + la, 0]], 7); L([[12, -18], [14 + lb, 0]], 7);
    E(-16 + la, 2, 11, 6, '#3a2212', 3, 8); E(16 + lb, 2, 11, 6, '#3a2212', 3, 8);
    const frame = [[-32, -14], [-32, -84], [-26, -100], [0, -108], [26, -100], [32, -84], [32, -14]];
    S(frame, '#6b3a1c', 4);
    const inner = [[-23, -20], [-23, -80], [-18, -92], [0, -98], [18, -92], [23, -80], [23, -20]];
    S(inner, '#0b0714', 0);
    if (DV.open > .05) { for (let i = 0; i < 6; i++) { const w = 2 + i * 3, yy = -70 + i * 9; blob(-w / 2, yy, 1.8, `rgba(170,150,240,${.25 + i * .1})`); blob(w / 2, yy, 1.8, `rgba(170,150,240,${.25 + i * .1})`); } blob(0, -78, 2.5, 'rgba(255,220,160,.8)'); }
    const k = 1 - DV.open * .78, hx = f > 0 ? -23 : 23;
    const leaf = inner.map(([x, y]) => [hx + (x - hx) * k, y]);
    S(leaf, '#ee9450', 4);
    if (k > .6) {
      const look = f * 2;
      [[-9, -70], [9, -70]].forEach(([ex, ey]) => { E(ex * k + hx * (1 - k), ey, 6, 8, '#ffffff', 3, 10); blob(ex * k + hx * (1 - k) + look, ey + 2, 2.8, INK); });
      blob(-15, -56, 4, '#ff8a7a88'); blob(15, -56, 4, '#ff8a7a88');
      L([[-6, -54], [0, -50], [6, -54]], 3);
      E(f > 0 ? 15 : -15, -40, 4, 4, '#ffd23f', 2, 8);
    }
    if (DV.hover) { L([[-32, -60], [-50, -76 + Math.sin(t * 14) * 6]], 6); L([[32, -60], [46, -44]], 6); }
    else { L([[-32, -60], [-44, -44 + step * 5]], 6); L([[32, -60], [44, -44 - step * 5]], 6); }
  });
}

/* ================= speech bubbles, drawn in the same ink ================= */
function bubble(x, y, text) {
  ctx.save(); ctx.font = '26px Neucha, "Comic Sans MS", cursive';
  const w = ctx.measureText(text).width + 30, h = 42, bx = Math.max(20, Math.min(DW - 20 - w, x - w / 2)), by = y - h - 22;
  S([[bx, by], [bx + w / 2, by - 2], [bx + w, by], [bx + w + 2, by + h / 2], [bx + w, by + h], [x + 12, by + h], [x, by + h + 18], [x - 4, by + h], [bx, by + h], [bx - 2, by + h / 2]], '#fffdf4', 4);
  ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 15, by + h / 2 + 1);
  ctx.restore();
}

/* ================= loop ================= */
let SC = 1, OX = 0, OY = 0, DPR = 1, pointer = null;
function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(innerWidth * DPR); cv.height = Math.round(innerHeight * DPR);
  SC = Math.min(innerWidth / DW, innerHeight / DH); OX = (innerWidth - DW * SC) / 2; OY = (innerHeight - DH * SC) / 2;
}
const toDesign = (cx, cy) => [(cx - OX) / SC, (cy - OY) / SC];
const overDverka = (x, y) => Math.abs(x - DV.x) < 44 && y > DV.y - 118 && y < DV.y + 10;
cv.addEventListener('pointermove', e => { pointer = toDesign(e.clientX, e.clientY); });
cv.addEventListener('pointerleave', () => { pointer = null; });
const CLICK = ['Тук-тук!', 'Туда пока нельзя. Скоро!', 'Там темно… но уютно', 'Эй, щекотно!', 'Я Дверка!', 'Скрип-скрип'];
cv.addEventListener('click', e => {
  const [x, y] = toDesign(e.clientX, e.clientY);
  if (!overDverka(x, y)) return;
  DV.say = CLICK[Math.random() * CLICK.length | 0]; DV.sayT = 2.2; $('#hint').hidden = true;
  if (DV.mode !== 'jump') { DV.queue.unshift({ x: DV.x, y: DV.y }); startJump({ x: DV.x, y: DV.y }); DV.jump.h = 70; DV.jump.d = .4; }
});

let last = performance.now(), hoverSaid = 0;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  BOIL = reduce ? 0 : Math.floor(t * 9) % 3;
  DV.hover = pointer ? overDverka(pointer[0], pointer[1]) : false;
  cv.classList.toggle('hot', DV.hover);
  if (DV.hover && now - hoverSaid > 6000) { hoverSaid = now; DV.say = 'Скри-и-ип… там пока темно'; DV.sayT = 2.4; }
  tickDverka(dt); tickGuests(dt);
  ctx.setTransform(SC * DPR, 0, 0, SC * DPR, OX * DPR, OY * DPR);
  SID = 0;
  drawRoom(t);
  drawGhost(t); drawTroll(t);
  drawTable(t); drawFood(t);
  drawGhostArms(t); drawTrollArms(t);
  drawDvach(t); drawDvachArm(t);
  drawCat(t);
  drawNick();
  drawDverka(t);
  const heads = { ghost: [G.ghost.x, 262], troll: [G.troll.x, 262], dvach: [G.dvach.x, 318], cat: [G.cat.x, 430] };
  for (const k in G) if (G[k].say) bubble(heads[k][0], heads[k][1], G[k].say);
  if (DV.say) bubble(DV.x, DV.y - 112, DV.say);
  requestAnimationFrame(frame);
}

addEventListener('resize', resize);
resize();
Promise.all([document.fonts.load('150px Chewy'), document.fonts.load('26px Neucha')]).catch(() => {}).then(() => { layoutNick(); requestAnimationFrame(frame); });
layoutNick();
