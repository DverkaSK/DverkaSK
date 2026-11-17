/* ================= crisp pixel primitives (no anti-aliasing anywhere) ================= */
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false; return [c, g]; }
function rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function dot(g, x, y, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
function poly(g, pts, col) {
  g.fillStyle = col;
  let y0 = Infinity, y1 = -Infinity; pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const yc = y + .5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
  }
}
function ell(g, cx, cy, rx, ry, col) {
  g.fillStyle = col;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    const dy = (y + .5 - cy) / ry; if (Math.abs(dy) > 1) continue;
    const w = rx * Math.sqrt(1 - dy * dy), a = Math.round(cx - w), b = Math.round(cx + w);
    if (b > a) g.fillRect(a, y, b - a, 1);
  }
}
function line(g, x0, y0, x1, y1, col) {
  g.fillStyle = col; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let n = 0; n < 999; n++) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function path(g, pts, col) { for (let i = 0; i + 1 < pts.length; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], col); }
/* smooth a polyline (Catmull-Rom) so curves come out as clean pixel arcs */
function smooth(pts, n = 6) {
  if (pts.length < 3) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(j => .5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
function curve(g, pts, col) { path(g, smooth(pts), col); }
function yAt(pts, x) { const s = smooth(pts, 10); for (let i = 0; i + 1 < s.length; i++) { const [ax, ay] = s[i], [bx, by] = s[i + 1]; if ((ax <= x && bx >= x) || (bx <= x && ax >= x)) return ay + (x - ax) / ((bx - ax) || 1) * (by - ay); } return s[s.length - 1][1]; }
/* black outline around every opaque pixel of a sprite */
function outline(c, col = '#111') {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), a = i => d.data[i * 4 + 3];
  const w = c.width, h = c.height, mark = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!a(i)) continue;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !a(i - 1) || !a(i + 1) || !a(i - w) || !a(i + w)) mark.push([x, y]);
  }
  mark.forEach(([x, y]) => dot(g, x, y, col));
}
const S = (pts, s, ox = 0, oy = 0) => pts.map(([x, y]) => [x * s + ox, y * s + oy]);

/* ================= FACES — drawn big so they read instantly ================= */
const K = '#141414';
function trollFace(mirror) {
  const W = 42, H = 39, s = W / 48;
  const [c, g] = mk(W, H);
  const head = [[9, 5], [17, 2], [26, 1], [35, 2], [42, 6], [46, 13], [47, 21], [45, 29], [40, 36], [33, 41], [25, 43], [17, 42], [10, 38], [5, 32], [2, 24], [2, 15], [5, 9]];
  poly(g, S(head, s), '#fbfbf7');
  poly(g, S([[37, 6], [42, 6], [46, 13], [47, 21], [45, 29], [42, 33], [44, 22], [43, 13]], s), '#e4e3dc');
  outline(c, K);
  const top = [[4, 21], [9, 24], [17, 26], [25, 26.5], [33, 25.5], [40, 23], [45, 18]];
  const bot = [[4, 21], [7, 27], [13, 32], [21, 35], [29, 35], [36, 32], [42, 26], [45, 18]];
  const mid = [[6, 24], [12, 28], [20, 30], [28, 30], [35, 28], [42, 23]];
  poly(g, S(smooth(top.concat(bot.slice().reverse())), s), '#ffffff');
  for (let x = 8; x < 43; x += 3.4) {
    line(g, x * s, yAt(S(top, s), x * s) + 1, x * s, yAt(S(mid, s), x * s) - 1, K);
    const x2 = x + 1.7; if (x2 < 42) line(g, x2 * s, yAt(S(mid, s), x2 * s) + 1, x2 * s, yAt(S(bot, s), x2 * s) - 1, K);
  }
  curve(g, S(top, s), K); curve(g, S(bot, s), K); curve(g, S(mid, s), K);
  // squinting eyes looking sideways
  curve(g, S([[10, 15], [13, 12], [17, 11], [21, 13]], s), K); curve(g, S([[11, 16], [16, 17], [20, 15]], s), K);
  curve(g, S([[27, 12], [31, 10], [35, 10], [39, 12]], s), K); curve(g, S([[28, 14], [33, 15], [38, 13]], s), K);
  rect(g, 17 * s, 12 * s, 2, 2, K); rect(g, 35 * s, 11 * s, 2, 2, K);
  // raised brows, wrinkles, nose, cheek folds, chin
  curve(g, S([[8, 10], [12, 7], [18, 6], [22, 9]], s), K); curve(g, S([[26, 8], [30, 5], [36, 5], [41, 8]], s), K);
  curve(g, S([[20, 3.5], [24, 2.8], [28, 3.5]], s), K);
  line(g, 23.5 * s, 11 * s, 24 * s, 13.5 * s, K);
  curve(g, S([[23, 15], [24, 18], [22, 20], [20, 19]], s), K); dot(g, 25 * s, 19 * s, K);
  line(g, 9 * s, 17 * s, 6 * s, 20.5 * s, K); line(g, 40 * s, 16 * s, 43.5 * s, 19 * s, K);
  curve(g, S([[18, 38], [25, 39.8], [31, 38]], s), K); line(g, 22 * s, 41 * s, 28 * s, 41 * s, K);
  if (!mirror) return c;
  const [m, mg] = mk(W, H); mg.translate(W, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); return m;
}
function omgFace() {
  const W = 38, H = 40; const [c, g] = mk(W, H);
  poly(g, [[8, 3], [19, 0], [30, 3], [36, 11], [37, 22], [34, 31], [27, 38], [19, 40], [11, 38], [4, 31], [1, 21], [2, 11]], '#fbfbf7');
  poly(g, [[30, 3], [36, 11], [37, 22], [34, 31], [31, 30], [33, 20], [32, 10]], '#e4e3dc');
  outline(c, K);
  [[12, 14], [26, 14]].forEach(([x, y]) => { ell(g, x, y, 6, 6.5, K); ell(g, x, y, 5, 5.5, '#ffffff'); rect(g, x, y, 1, 1, K); });
  curve(g, [[6, 6], [11, 4], [16, 6]], K); curve(g, [[22, 6], [27, 4], [32, 6]], K);
  line(g, 19, 19, 20, 22, K);
  ell(g, 19, 30, 7, 7.5, K); ell(g, 19, 32, 4.5, 3.5, '#7a1f2a'); rect(g, 15, 24, 9, 2, '#ffffff');
  line(g, 4, 25, 7, 28, K); line(g, 34, 25, 31, 28, K);
  return c;
}
function bagFace(t) {
  const W = 38, H = 42; const [c, g] = mk(W, H);
  rect(g, 1, 4, 36, 38, '#b98a55'); rect(g, 31, 4, 6, 38, '#a0744a');
  for (let x = 1; x < 37; x += 3) rect(g, x, 1 + ((x / 3) % 2) * 2, 3, 4, '#c9a06a');
  rect(g, 1, 6, 36, 2, '#caa06a');
  line(g, 7, 8, 7, 40, '#a57a4b'); line(g, 30, 8, 30, 40, '#96693f');
  for (let i = 0; i < 25; i++) dot(g, 2 + rnd() * 34, 8 + rnd() * 33, rnd() < .5 ? '#c29560' : '#a8784a');
  [[9, 14], [22, 14]].forEach(([x, y]) => { rect(g, x, y, 7, 5, '#120a06'); rect(g, x + 1, y - 1, 5, 7, '#120a06'); if (!t.blink) rect(g, x + 3, y + 2, 2, 2, '#f3efe6'); });
  rect(g, 8, 26, 22, 9, '#c0392b'); rect(g, 13, 27, 12, 2, '#f2c14e'); rect(g, 12, 29, 14, 2, '#6b3a1c'); rect(g, 13, 31, 12, 2, '#f2c14e');
  outline(c, '#2a1a0e');
  return c;
}
