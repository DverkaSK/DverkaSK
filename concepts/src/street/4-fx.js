/* ================= PARTICLES (screen space) ================= */
const fx = $('#fx'), cx2 = fx.getContext('2d');
let FW = 0, FH = 0, DPR = 1, parts = [], ambient = [];
function fitFx() {
  DPR = Math.min(2, devicePixelRatio || 1); FW = innerWidth; FH = innerHeight;
  fx.width = FW * DPR; fx.height = FH * DPR; cx2.setTransform(DPR, 0, 0, DPR, 0, 0);
}
function toScreen(x, y) { const m = svg.getScreenCTM(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
function toWorld(sx, sy) { const m = svg.getScreenCTM().inverse(); return [m.a * sx + m.c * sy + m.e, m.b * sx + m.d * sy + m.f]; }
function worldScale() { return svg.getScreenCTM().a; }

function seedAmbient(season) {
  ambient = [];
  const n = reduce ? 0 : { winter: 110, autumn: 26, spring: 34, summer: 36 }[season];
  for (let i = 0; i < n; i++) ambient.push(newAmb(season, true));
}
function newAmb(season, anywhere) {
  const a = { k: season, x: Math.random() * FW, y: anywhere ? Math.random() * FH : -12, t: Math.random() * 100 };
  if (season === 'winter') { a.s = .8 + Math.random() * 2.4; a.vy = 18 + a.s * 14; a.vx = 6; }
  if (season === 'autumn') { a.s = 3 + Math.random() * 3; a.vy = 30 + Math.random() * 30; a.vx = 20; a.c = ['#e07b2a', '#c9452f', '#e8b23a'][i3()]; a.rot = Math.random() * 6; }
  if (season === 'spring') { a.s = 2 + Math.random() * 2; a.vy = 16 + Math.random() * 16; a.vx = 14; a.c = ['#ffc9d9', '#fff1f5', '#ffb3c7'][i3()]; a.rot = Math.random() * 6; }
  if (season === 'summer') { a.y = FH * (.45 + Math.random() * .5); a.s = 1.5 + Math.random() * 1.5; a.vy = 0; a.vx = 0; }
  return a;
}
const i3 = () => Math.floor(Math.random() * 3);

function puff(wx, wy, n = 6, col = 'rgba(230,220,255,.55)', sp = 40) {
  if (reduce) return;
  const [sx, sy] = toScreen(wx, wy), k = worldScale();
  for (let i = 0; i < n; i++) parts.push({ x: sx, y: sy, vx: (Math.random() - .5) * sp * k, vy: -Math.random() * sp * .6 * k, life: .5 + Math.random() * .3, max: .8, r: (3 + Math.random() * 4) * k, col, grow: 8 * k });
}
function heart(wx, wy) {
  const [sx, sy] = toScreen(wx, wy), k = worldScale();
  for (let i = 0; i < 3; i++) parts.push({ x: sx + (i - 1) * 12 * k, y: sy, vx: (i - 1) * 10 * k, vy: -40 * k, life: 1.1, max: 1.1, r: 7 * k, heart: true });
}
function zzz(wx, wy) {
  const [sx, sy] = toScreen(wx, wy), k = worldScale();
  parts.push({ x: sx, y: sy, vx: 10 * k, vy: -18 * k, life: 1.8, max: 1.8, r: 12 * k, z: true });
}
let smokeT = 0;
function smoke(dt, season) {
  if (reduce || season === 'summer') return;
  smokeT -= dt; if (smokeT > 0) return; smokeT = .35;
  const k = worldScale();
  CHIMNEYS.forEach(([x, y]) => { const [sx, sy] = toScreen(x, y); parts.push({ x: sx, y: sy, vx: (6 + Math.random() * 8) * k, vy: -16 * k, life: 3, max: 3, r: 5 * k, col: 'rgba(200,195,225,.18)', grow: 7 * k }); });
}

function drawFx(dt, t) {
  cx2.clearRect(0, 0, FW, FH);
  for (const a of ambient) {
    a.t += dt;
    if (a.k === 'summer') {
      a.x += Math.cos(a.t * .7) * 12 * dt; a.y += Math.sin(a.t * .9) * 10 * dt;
      const g = (Math.sin(a.t * 2.3) + 1) / 2;
      cx2.fillStyle = `rgba(255,236,140,${(.25 + g * .75).toFixed(2)})`; cx2.beginPath(); cx2.arc(a.x, a.y, a.s, 0, 7); cx2.fill();
      cx2.fillStyle = `rgba(255,236,140,${(g * .15).toFixed(2)})`; cx2.beginPath(); cx2.arc(a.x, a.y, a.s * 6, 0, 7); cx2.fill();
      continue;
    }
    a.y += a.vy * dt; a.x += (Math.sin(a.t * 1.3) * a.vx + a.vx * .3) * dt;
    if (a.y > FH + 12) Object.assign(a, newAmb(a.k, false));
    if (a.k === 'winter') { cx2.fillStyle = 'rgba(245,248,255,.85)'; cx2.beginPath(); cx2.arc(a.x, a.y, a.s, 0, 7); cx2.fill(); }
    else { a.rot += dt * 2; cx2.save(); cx2.translate(a.x, a.y); cx2.rotate(a.rot); cx2.fillStyle = a.c; cx2.beginPath(); cx2.ellipse(0, 0, a.s, a.s * .55, 0, 0, 7); cx2.fill(); cx2.restore(); }
  }
  for (const p of parts) {
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.grow) p.r += p.grow * dt;
    const a = Math.max(0, p.life / p.max);
    if (p.heart) { cx2.globalAlpha = a; cx2.fillStyle = '#ff7a8a'; heartPath(p.x, p.y, p.r); cx2.globalAlpha = 1; }
    else if (p.z) { cx2.globalAlpha = a; cx2.fillStyle = '#e8e2ff'; cx2.font = `800 ${p.r.toFixed(0)}px "M PLUS Rounded 1c", sans-serif`; cx2.fillText('z', p.x, p.y); cx2.globalAlpha = 1; }
    else if (p.line) { cx2.strokeStyle = `rgba(255,240,210,${(a * .55).toFixed(2)})`; cx2.lineWidth = 2; cx2.beginPath(); cx2.moveTo(p.x, p.y); cx2.lineTo(p.x + p.len, p.y); cx2.stroke(); }
    else { cx2.globalAlpha = a; cx2.fillStyle = p.col; cx2.beginPath(); cx2.arc(p.x, p.y, p.r, 0, 7); cx2.fill(); cx2.globalAlpha = 1; }
  }
  parts = parts.filter(p => p.life > 0);
}
function heartPath(x, y, s) {
  cx2.beginPath(); cx2.moveTo(x, y + s * .35);
  cx2.bezierCurveTo(x - s, y - s * .4, x - s * .45, y - s, x, y - s * .45);
  cx2.bezierCurveTo(x + s * .45, y - s, x + s, y - s * .4, x, y + s * .35); cx2.fill();
}
