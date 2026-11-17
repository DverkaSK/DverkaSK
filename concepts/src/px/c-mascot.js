/* ================= DVERKA — the little door, hand-placed pixels ================= */
const FLOOR = 214;
const DV = { x: 150, y: FLOOR, ground: FLOOR, vx: 0, face: 1, mode: 'pause', t: .8, target: 150, fast: false, queue: [], jump: null, phase: 0, open: 0, hover: false, squash: 0, blinkT: 2, blink: 0 };
const rand = (a, b) => a + Math.random() * (b - a);

function planNext() {
  if (Math.random() < .42 && LETTER_TOPS.length) {
    const dir = Math.random() < .5 ? 1 : -1, tops = dir > 0 ? LETTER_TOPS : LETTER_TOPS.slice().reverse();
    DV.target = tops[0].x - dir * 12; DV.mode = 'walk'; DV.fast = true;
    DV.queue = tops.map(p => ({ x: p.x, y: p.y }));
    DV.queue.push({ x: tops[tops.length - 1].x + dir * 16, y: FLOOR });
  } else { DV.target = rand(40, 344); DV.mode = 'walk'; DV.fast = Math.random() < .4; DV.queue = []; }
}
function startJump(to) {
  const dx = to.x - DV.x;
  DV.jump = { x0: DV.x, y0: DV.y, x1: to.x, y1: to.y, k: 0, d: .2 + Math.abs(dx) / 240, h: 8 + Math.abs(dx) * .12 + Math.max(0, DV.y - to.y) * .4 };
  DV.face = dx >= 0 ? 1 : -1; DV.mode = 'jump';
}
function updateDverka(dt) {
  DV.blinkT -= dt; if (DV.blinkT < 0) { DV.blink = .12; DV.blinkT = 2 + Math.random() * 3; } DV.blink = Math.max(0, DV.blink - dt);
  DV.squash = Math.max(0, DV.squash - dt);
  DV.open += ((DV.hover ? 1 : 0) - DV.open) * Math.min(1, dt * 8);
  if (DV.hover) { DV.vx = 0; return; }
  if (DV.mode === 'walk') {
    const dx = DV.target - DV.x, sp = DV.fast ? 150 : 95;
    if (Math.abs(dx) < 1.5) { DV.x = DV.target; DV.vx = 0; DV.squash = .08; if (DV.queue.length) { DV.mode = 'hop'; DV.t = rand(.15, .5); } else { DV.mode = 'pause'; DV.t = rand(.4, 1.6); } }
    else { DV.vx += (Math.sign(dx) * Math.min(sp, Math.abs(dx) * 9) - DV.vx) * Math.min(1, dt * 12); DV.x += DV.vx * dt; DV.face = DV.vx >= 0 ? 1 : -1; DV.phase += dt * Math.abs(DV.vx) / 6; }
  } else if (DV.mode === 'hop') {
    DV.t -= dt; if (DV.t <= 0) startJump(DV.queue.shift());
  } else if (DV.mode === 'jump') {
    const J = DV.jump; J.k = Math.min(1, J.k + dt / J.d);
    DV.x = J.x0 + (J.x1 - J.x0) * J.k; DV.y = J.y0 + (J.y1 - J.y0) * J.k - Math.sin(J.k * Math.PI) * J.h;
    if (J.k >= 1) { DV.y = J.y1; DV.ground = J.y1; DV.squash = .1; if (DV.queue.length) { DV.mode = 'hop'; DV.t = .05; } else { DV.mode = 'pause'; DV.t = rand(.3, 1); } }
  } else if (DV.mode === 'pause') { DV.t -= dt; if (DV.t <= 0) planNext(); }
  if (DV.mode !== 'jump') DV.ground = DV.y;
}
function drawDverka(g, t) {
  const x = Math.round(DV.x), y = Math.round(DV.y), f = DV.hover ? 1 : DV.face;
  const run = DV.mode === 'walk' && Math.abs(DV.vx) > 10, air = DV.mode === 'jump';
  const step = run ? Math.floor(DV.phase) % 2 : 0, sq = DV.squash > 0 ? 1 : 0;
  const bob = run ? step : 0, top = y - 21 + bob + sq, L = x - 7;
  const D = '#4a2612', WOOD = '#e08f4f', HI = '#f5b077', SH = '#b8662f';
  rect(g, x - 6, Math.round(DV.ground) + 1, 12, 1, 'rgba(0,0,0,.35)');
  // legs
  const la = air ? -2 : (run && step ? -1 : 0), lb = air ? -1 : (run && !step ? -1 : 0);
  rect(g, x - 4, y - 3 + la, 2, 3, D); rect(g, x + 2, y - 3 + lb, 2, 3, D);
  rect(g, x - 5, y - 1 + la, 3, 1, D); rect(g, x + 2, y - 1 + lb, 3, 1, D);
  // frame
  rect(g, L + 1, top, 12, 1, D); rect(g, L, top + 1, 14, 18 - sq, D);
  // dark doorway with a faint path into the dark
  rect(g, L + 2, top + 2, 10, 15 - sq, '#07040c');
  if (DV.open > .05) { for (let i = 0; i < 5; i++) { const w = 1 + i; dot(g, x - w / 2 - .5, top + 7 + i * 2, `rgba(160,140,230,${.2 + i * .12})`); dot(g, x + w / 2, top + 7 + i * 2, `rgba(160,140,230,${.2 + i * .12})`); } dot(g, x, top + 5, 'rgba(255,220,160,.6)'); }
  // the leaf swings open on its hinge
  const lw = Math.max(2, Math.round(10 * (1 - DV.open * .8)));
  const lx = f > 0 ? L + 2 : L + 12 - lw;
  rect(g, lx, top + 2, lw, 15 - sq, WOOD);
  rect(g, lx, top + 2, 1, 15 - sq, HI); rect(g, lx + lw - 1, top + 2, 1, 15 - sq, SH);
  if (lw >= 8) {
    rect(g, L + 4, top + 12, 6, 1, SH); rect(g, L + 4, top + 12, 1, 4, SH);
    const ex1 = L + 4, ex2 = L + 8, ey = top + 5, look = f > 0 ? 1 : 0;
    if (DV.blink > 0) { rect(g, ex1, ey + 2, 2, 1, D); rect(g, ex2, ey + 2, 2, 1, D); }
    else { rect(g, ex1, ey, 2, 3, '#fffaf0'); rect(g, ex2, ey, 2, 3, '#fffaf0'); rect(g, ex1 + look, ey + 1, 1, 2, '#21140d'); rect(g, ex2 + look, ey + 1, 1, 2, '#21140d'); }
    dot(g, L + 3, top + 9, '#ff8a7a'); dot(g, L + 10, top + 9, '#ff8a7a');
    rect(g, L + 6, top + 10, 2, 1, '#6b2a24');
    rect(g, f > 0 ? L + 10 : L + 3, top + 12, 1, 2, '#ffd23a');
  } else { rect(g, lx + (f > 0 ? 0 : lw - 1), top + 5, 1, 2, '#fffaf0'); }
  // arms: wave when you hover
  if (DV.hover) { line(g, L - 1, top + 9, L - 3, top + 5 + (Math.floor(t * 8) % 2), D); line(g, L + 14, top + 9, L + 16, top + 12, D); }
  else { line(g, L - 1, top + 9, L - 2, top + 12 + (run ? step : 0), D); line(g, L + 14, top + 9, L + 15, top + 12 + (run ? 1 - step : 0), D); }
}
