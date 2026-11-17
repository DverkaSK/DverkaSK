/* ================= flash-cartoon ink: wobbly outlines that "boil" ================= */
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = $('#view'), ctx = cv.getContext('2d');
const DW = 1600, DH = 900, INK = '#1a1614';
let SID = 0, BOIL = 0, AMP = 1.7;

function jit(id, i, k) { const s = Math.sin(id * 97.13 + i * 13.7 + k * 7.1 + BOIL * 31.7) * 43758.5453; return s - Math.floor(s) - .5; }
function trace(pts, closed) {
  const id = SID++, q = pts.map((p, i) => [p[0] + jit(id, i, 1) * 2 * AMP, p[1] + jit(id, i, 2) * 2 * AMP]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.beginPath();
  if (closed) {
    const s = mid(q[q.length - 1], q[0]); ctx.moveTo(s[0], s[1]);
    for (let i = 0; i < q.length; i++) { const m = mid(q[i], q[(i + 1) % q.length]); ctx.quadraticCurveTo(q[i][0], q[i][1], m[0], m[1]); }
    ctx.closePath();
  } else {
    ctx.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < q.length - 1; i++) { const m = mid(q[i], q[i + 1]); ctx.quadraticCurveTo(q[i][0], q[i][1], m[0], m[1]); }
    ctx.lineTo(q[q.length - 1][0], q[q.length - 1][1]);
  }
}
function S(pts, fill, lw = 4) {
  trace(pts, true);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function L(pts, lw = 4, col = INK) { trace(pts, false); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function ellPts(cx, cy, rx, ry, n = 14) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function E(cx, cy, rx, ry, fill, lw = 4, n) { S(ellPts(cx, cy, rx, ry, n || Math.max(8, Math.min(20, (rx + ry) / 6 | 0))), fill, lw); }
function rectPts(x, y, w, h, c = 6) { return [[x + c, y], [x + w / 2, y], [x + w - c, y], [x + w, y + c], [x + w, y + h / 2], [x + w, y + h - c], [x + w - c, y + h], [x + w / 2, y + h], [x + c, y + h], [x, y + h - c], [x, y + h / 2], [x, y + c]]; }
function R(x, y, w, h, fill, lw = 4, c) { S(rectPts(x, y, w, h, c), fill, lw); }
function flat(pts, fill) { trace(pts, true); ctx.fillStyle = fill; ctx.fill(); } // fill without ink
function blob(cx, cy, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }
function group(x, y, rot, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); fn(); ctx.restore(); }

/* ================= the room ================= */
const SNOW = Array.from({ length: 70 }, () => [Math.random(), Math.random(), .4 + Math.random() * .8]);
function drawRoom(t) {
  // wall & floor reach past the frame so any aspect ratio is covered
  ctx.fillStyle = '#efd6a0'; ctx.fillRect(-3000, -3000, 7600, 3640);
  ctx.fillStyle = '#b27a48'; ctx.fillRect(-3000, 640, 7600, 3000);
  // wallpaper squiggle-flowers
  for (let y = 40; y < 630; y += 105) for (let x = -300 + ((y / 105 | 0) % 2) * 60; x < 1900; x += 120) {
    L([[x, y + 14], [x + 4, y + 4], [x, y - 6]], 2, '#b88a55');
    blob(x, y - 8, 5, '#d98f6a'); blob(x + 6, y - 4, 4, '#d98f6a');
  }
  ctx.fillStyle = '#6e4428'; ctx.fillRect(-3000, 626, 7600, 18);
  L([[-3000, 626], [0, 627], [800, 625], [1600, 627], [4600, 626]], 4);
  for (const y of [690, 750, 820, 900]) L([[-3000, y], [0, y + 2], [800, y - 2], [1600, y + 1], [4600, y]], 3, '#8a5530');
  for (let i = 0; i < 26; i++) { const x = -300 + i * 90, y = [690, 750, 820][i % 3]; L([[x, y], [x + 3, y + ([60, 70, 80][i % 3])]], 3, '#8a5530'); }

  // окно с панельками и снегом
  R(60, 100, 320, 412, '#f4efe3', 5, 10);
  ctx.save(); trace(rectPts(82, 122, 276, 370, 6), true); ctx.clip();
  ctx.fillStyle = '#20295a'; ctx.fillRect(80, 120, 280, 380);
  blob(310, 170, 22, '#fff4cf');
  [[90, 330, 90, 170], [185, 280, 80, 220], [270, 350, 100, 150]].forEach(([x, y, w, h], i) => {
    ctx.fillStyle = ['#3a4677', '#323d6c', '#414e82'][i]; ctx.fillRect(x, y, w, h);
    for (let yy = y + 14; yy < y + h - 20; yy += 26) for (let xx = x + 10; xx < x + w - 14; xx += 22) { ctx.fillStyle = (xx * 7 + yy * 3) % 5 < 2 ? '#ffd86b' : '#27305a'; ctx.fillRect(xx, yy, 11, 13); }
  });
  ctx.fillStyle = '#eef2ff'; ctx.fillRect(80, 470, 280, 30);
  SNOW.forEach(f => { const y = 120 + ((f[1] + t * .05 * f[2]) % 1) * 380, x = 82 + ((f[0] + Math.sin(t + f[1] * 9) * .01) % 1) * 276; blob(x, y, 2 + f[2] * 1.5, '#ffffff'); });
  ctx.restore();
  L([[220, 118], [221, 300], [219, 494]], 7, '#f4efe3'); L([[80, 300], [220, 302], [360, 299]], 7, '#f4efe3');
  L([[220, 118], [221, 300], [219, 494]], 2); L([[82, 300], [220, 302], [358, 299]], 2);
  // шторы
  S([[30, 84], [120, 84], [112, 300], [128, 580], [22, 580], [40, 300]], '#6d8f58', 4);
  S([[320, 84], [410, 84], [400, 300], [418, 580], [312, 580], [330, 300]], '#6d8f58', 4);
  L([[60, 100], [55, 330], [62, 570]], 3, '#4f6d3f'); L([[360, 100], [366, 330], [358, 570]], 3, '#4f6d3f');
  L([[10, 82], [220, 80], [430, 82]], 6);
  // батарея с носками
  R(110, 530, 220, 86, '#f0ede4', 4, 12);
  for (let x = 130; x < 320; x += 22) L([[x, 538], [x + 1, 608]], 3, '#c9c4b6');
  S([[150, 520], [178, 520], [180, 575], [196, 590], [190, 604], [160, 598], [150, 575]], '#d64545', 3);

  // ковёр на стене
  R(560, 78, 520, 346, '#b3263a', 5, 10);
  R(582, 98, 476, 306, '#26397a', 4, 8);
  R(600, 114, 440, 274, '#c0303e', 4, 8);
  [[150, '#f1dfae'], [118, '#26397a'], [88, '#e38a2e'], [58, '#b3263a'], [30, '#f1dfae']].forEach(([r, c]) => S([[820, 251 - r * .72], [820 + r * 1.35, 251], [820, 251 + r * .72], [820 - r * 1.35, 251]], c, 4));
  [[650, 150], [990, 150], [650, 352], [990, 352]].forEach(([x, y]) => S([[x, y - 22], [x + 22, y], [x, y + 22], [x - 22, y]], '#f1dfae', 3));
  for (let x = 566; x < 1076; x += 12) L([[x, 424], [x + 1, 440]], 3, '#f1dfae');

  // гирлянда под потолком
  const gp = []; for (let x = 430; x <= 1210; x += 30) gp.push([x, 36 + Math.sin((x - 430) / 780 * Math.PI) * 26]);
  L(gp, 3);
  gp.forEach(([x, y], i) => { const on = Math.sin(t * 3 + i * 1.9) > -.2, c = ['#ff5252', '#ffd23f', '#5fd068', '#4fa8ff', '#e17bff'][i % 5]; if (on) blob(x, y + 12, 14, c + '44'); E(x, y + 12, 6, 8, on ? c : '#6b5a52', 3, 8); });

  // ёлка в углу
  R(1375, 596, 70, 44, '#c7423a', 4, 8); R(1400, 570, 20, 30, '#6b3f26', 3, 4);
  [[210, 90, 150], [300, 120, 170], [400, 150, 180]].forEach(([y, hw, h], k) => S([[1410, y - 40], [1410 + hw * .5, y + h * .35], [1410 + hw * .35, y + h * .38], [1410 + hw, y + h - 10], [1410 - hw, y + h - 10], [1410 - hw * .35, y + h * .38], [1410 - hw * .5, y + h * .35]], ['#3f8f4e', '#3a8548', '#357c43'][k], 4));
  [[1380, 300, '#ff5252'], [1450, 340, '#ffd23f'], [1360, 420, '#4fa8ff'], [1470, 470, '#ff5252'], [1405, 400, '#e17bff'], [1340, 520, '#ffd23f'], [1440, 540, '#4fa8ff']].forEach(([x, y, c]) => { E(x, y, 11, 11, c, 3, 10); blob(x - 3, y - 4, 3, '#ffffffaa'); });
  for (let i = 0; i < 12; i++) { const y = 230 + i * 30, x = 1410 + Math.sin(i * 2.2) * (30 + i * 9); const on = Math.sin(t * 4 + i * 2.7) > 0; blob(x, y, on ? 5 : 3, on ? '#fff7b0' : '#8a8a6a'); }
  S([[1410, 140], [1422, 166], [1450, 168], [1428, 184], [1436, 212], [1410, 196], [1384, 212], [1392, 184], [1370, 168], [1398, 166]], '#ffd23f', 3);

  // люстра-абажур и тёплый свет
  L([[820, -60], [821, 38]], 3);
  ctx.fillStyle = 'rgba(255,220,120,.10)'; ctx.beginPath(); ctx.ellipse(820, 300, 620, 420, 0, 0, 7); ctx.fill();
  S([[775, 38], [865, 38], [905, 96], [735, 96]], '#f2a33a', 4);
  E(820, 104, 16, 12, '#fff3c4', 3, 10);

  // диван
  R(450, 360, 740, 210, '#7b5638', 5, 26);
  L([[700, 372], [702, 470]], 3, '#5e3f28'); L([[940, 372], [938, 470]], 3, '#5e3f28');
  R(420, 400, 70, 200, '#6e4b30', 5, 24); R(1150, 400, 70, 200, '#6e4b30', 5, 24);
}

/* ================= the table and the feast ================= */
function drawTable(t) {
  // табуретка двачера и её тень
  flat([[250, 800], [440, 800], [430, 816], [260, 816]], 'rgba(0,0,0,.18)');
  S([[410, 545], [1230, 545], [1262, 600], [378, 600]], '#fbf7ee', 5);
  R(378, 598, 884, 100, '#f3ecdd', 5, 4);
  const sc = []; for (let x = 378; x <= 1262; x += 34) { sc.push([x, 698], [x + 17, 712]); } sc.push([1262, 698]);
  L(sc, 4); flat(sc.concat([[1262, 690], [378, 690]]), '#f3ecdd');
  for (let x = 420; x < 1240; x += 70) L([[x, 610], [x - 4, 690]], 2, '#d9ceb6');
  R(420, 712, 26, 90, '#6b4228', 4, 5); R(1196, 712, 26, 90, '#6b4228', 4, 5);
  flat([[380, 800], [1260, 800], [1240, 818], [400, 818]], 'rgba(0,0,0,.15)');
}
function drawFood(t) {
  // тазик оливье: эмалированная кастрюля с цветочком, из неё торчит ложка
  L([[845, 470], [900, 392]], 7, '#b9b9b9'); E(903, 388, 12, 7, '#cfcfcf', 3, 8);
  S([[722, 468], [878, 468], [866, 566], [734, 566]], '#f6f6f2', 5);
  E(800, 468, 80, 16, '#e8d68a', 5, 18);
  for (let i = 0; i < 18; i++) blob(740 + (i * 37) % 120, 462 + (i * 13) % 12, 3.2, ['#6fb84f', '#ef8a3c', '#fff6d6', '#d86b6b'][i % 4]);
  L([[726, 482], [800, 488], [874, 482]], 6, '#3a64c9');
  E(800, 525, 16, 14, '#e24a4a', 3, 10); S([[782, 530], [770, 548], [786, 540]], '#5fae4f', 2); S([[818, 530], [830, 548], [814, 540]], '#5fae4f', 2);
  E(716, 500, 10, 7, '#f6f6f2', 3, 8); E(884, 500, 10, 7, '#f6f6f2', 3, 8);
  // шампанское
  R(896, 440, 34, 118, '#2c5a36', 4, 12); R(903, 404, 20, 40, '#2c5a36', 4, 6); R(900, 396, 26, 20, '#e9c24a', 3, 5); R(898, 486, 30, 30, '#f3ead0', 3, 4);
  // тарелки, селёдка под шубой, мандарины, бокалы
  [[560, 580], [690, 588], [1000, 588], [1130, 578]].forEach(([x, y]) => E(x, y, 46, 12, '#ffffff', 4, 16));
  E(1010, 562, 62, 16, '#ffffff', 4, 16); S([[962, 560], [1058, 560], [1052, 538], [968, 538]], '#8e2b62', 4); L([[970, 548], [1050, 547]], 3, '#f0d8e6');
  [[575, 556], [600, 560], [588, 540], [612, 540], [625, 558]].forEach(([x, y]) => { E(x, y, 14, 13, '#ff9a2e', 3, 10); blob(x - 3, y - 5, 3, '#ffd08a'); });
  [[660, 540], [960, 532], [1150, 540]].forEach(([x, y]) => { S([[x - 12, y - 30], [x + 12, y - 30], [x + 8, y], [x - 8, y]], 'rgba(200,230,255,.55)', 3); L([[x, y], [x, y + 14]], 3); L([[x - 10, y + 16], [x + 10, y + 16]], 3); flat([[x - 10, y - 18], [x + 10, y - 18], [x + 8, y - 2], [x - 8, y - 2]], '#f2d36a'); });
}
