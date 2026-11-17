/* ================= THE ROOM (scene space 384×216, one-point perspective) ================= */
const BW = { x0: 64, x1: 320, y0: 18, y1: 146 }; // back wall
const M = 8; // parallax margin
let W = 384, H = 216, OX = 0, OY = 0;
const EXT = {}; // canvas corners in scene space
const WIN = {}; // window quad for the emissive pass
const GARLAND = [], TREE_LIGHTS = [];
const SEATS = [123, 169, 215, 261];

function wallTop(x) { return EXT.Y0 + (BW.y0 - EXT.Y0) * (x - EXT.X0) / (BW.x0 - EXT.X0); }
function wallBot(x) { return EXT.Y1 + (BW.y1 - EXT.Y1) * (x - EXT.X0) / (BW.x0 - EXT.X0); }

function drawBack(g) {
  const { X0, Y0, X1, Y1 } = EXT;
  // ceiling, side walls, floor
  poly(g, [[X0, Y0], [X1, Y0], [BW.x1, BW.y0], [BW.x0, BW.y0]], '#4a3b36');
  poly(g, [[X0, Y0], [BW.x0, BW.y0], [BW.x0, BW.y1], [X0, Y1]], '#a08a66');
  poly(g, [[X1, Y0], [X1, Y1], [BW.x1, BW.y1], [BW.x1, BW.y0]], '#a08a66');
  for (let i = 1; i < 9; i++) {
    const k = Math.pow(i / 9, .75);
    const xl = X0 + (BW.x0 - X0) * k, xr = X1 - (X1 - BW.x1) * k;
    line(g, xl, Y0 + (BW.y0 - Y0) * k + 1, xl, Y1 + (BW.y1 - Y1) * k - 1, '#927c5a');
    line(g, xr, Y0 + (BW.y0 - Y0) * k + 1, xr, Y1 + (BW.y1 - Y1) * k - 1, '#927c5a');
    for (let r = 1; r < 6; r++) { const yy = (Y0 + (BW.y0 - Y0) * k) + ((Y1 + (BW.y1 - Y1) * k) - (Y0 + (BW.y0 - Y0) * k)) * r / 6; dot(g, xl + 3, yy, '#7d5a44'); dot(g, xr - 3, yy, '#7d5a44'); }
  }
  poly(g, [[BW.x0, BW.y1], [BW.x1, BW.y1], [X1, Y1], [X0, Y1]], '#6e4a30');
  for (let i = 0; i <= 16; i++) line(g, BW.x0 + 16 * i, BW.y1, X0 + (X1 - X0) * i / 16, Y1, '#5b3c26');
  for (let k = 1; k < 9; k++) { const y = BW.y1 + (Y1 - BW.y1) * Math.pow(k / 9, 1.7); const f = (y - BW.y1) / (Y1 - BW.y1); line(g, BW.x0 + (X0 - BW.x0) * f, y, BW.x1 + (X1 - BW.x1) * f, y, '#63432b'); }
  // wallpaper on the back wall
  rect(g, BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0, '#b49d76');
  for (let x = BW.x0; x < BW.x1; x += 12) rect(g, x, BW.y0, 2, BW.y1 - BW.y0, '#a68f69');
  for (let y = BW.y0 + 6; y < BW.y1; y += 12) for (let x = BW.x0 + 6 + ((y / 12 | 0) % 2) * 6; x < BW.x1; x += 12) { dot(g, x, y, '#8a5d45'); rect(g, x - 1, y + 1, 3, 1, '#8a5d45'); dot(g, x, y + 2, '#6f7a4a'); }
  rect(g, BW.x0, BW.y1 - 4, BW.x1 - BW.x0, 4, '#5a3a26');
  line(g, X0, Y1 - 2, BW.x0, BW.y1 - 1, '#5a3a26'); line(g, X1, Y1 - 2, BW.x1, BW.y1 - 1, '#5a3a26');
  // ковёр на стене
  const R = { x0: 122, x1: 262, y0: 26, y1: 104 };
  rect(g, R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0, '#6e1419');
  rect(g, R.x0 + 3, R.y0 + 3, R.x1 - R.x0 - 6, R.y1 - R.y0 - 6, '#1f2b52');
  rect(g, R.x0 + 6, R.y0 + 6, R.x1 - R.x0 - 12, R.y1 - R.y0 - 12, '#a3262b');
  for (let x = R.x0 + 4; x < R.x1 - 4; x += 4) { rect(g, x, R.y0 + 4, 2, 1, '#e6d3a3'); rect(g, x + 2, R.y1 - 5, 2, 1, '#e6d3a3'); }
  for (let y = R.y0 + 6; y < R.y1 - 6; y += 4) { rect(g, R.x0 + 4, y, 1, 2, '#e6d3a3'); rect(g, R.x1 - 5, y + 2, 1, 2, '#e6d3a3'); }
  const cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
  [[30, '#1f2b52'], [25, '#e6d3a3'], [21, '#d88a2a'], [16, '#6e1419'], [12, '#e6d3a3'], [8, '#1f2b52'], [4, '#d88a2a']].forEach(([r, col]) => poly(g, [[cx, cy - r * .9], [cx + r * 1.6, cy], [cx, cy + r * .9], [cx - r * 1.6, cy]], col));
  [[R.x0 + 18, R.y0 + 16], [R.x1 - 18, R.y0 + 16], [R.x0 + 18, R.y1 - 16], [R.x1 - 18, R.y1 - 16]].forEach(([x, y]) => { poly(g, [[x, y - 6], [x + 6, y], [x, y + 6], [x - 6, y]], '#e6d3a3'); poly(g, [[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], '#d88a2a'); });
  for (let x = R.x0; x < R.x1; x += 2) rect(g, x, R.y1, 1, 2 + (x % 4 === 0), '#e6d3a3');
  // окно на левой стене
  const xl = BW.x0 - 54, xr = BW.x0 - 12;
  const tq = x => wallTop(x) + 18, bq = x => wallBot(x) - 58;
  poly(g, [[xl - 3, tq(xl - 3) - 3], [xr + 3, tq(xr + 3) - 3], [xr + 3, bq(xr + 3) + 3], [xl - 3, bq(xl - 3) + 3]], '#e8e4da');
  poly(g, [[xl, tq(xl)], [xr, tq(xr)], [xr, bq(xr)], [xl, bq(xl)]], '#0e1330');
  Object.assign(WIN, { xl, xr, tq, bq });
  const xm = (xl + xr) / 2; line(g, xm, tq(xm), xm, bq(xm), '#e8e4da'); line(g, xm + 1, tq(xm + 1), xm + 1, bq(xm + 1), '#e8e4da');
  line(g, xl, (tq(xl) + bq(xl)) * .42 + 0, xr, (tq(xr) + bq(xr)) * .42, '#e8e4da');
  poly(g, [[xl - 5, bq(xl - 5) + 3], [xr + 5, bq(xr + 5) + 3], [xr + 7, bq(xr + 7) + 7], [xl - 7, bq(xl - 7) + 8]], '#d8d3c7');
  for (let x = xl; x < xr; x += 3) { line(g, x, bq(x) + 12, x, bq(x) + 30, '#d8d3c7'); line(g, x + 1, bq(x + 1) + 12, x + 1, bq(x + 1) + 30, '#bdb8ac'); }
  rect(g, xl + 8, bq(xl + 8) + 12, 7, 4, '#c0392b');
  ell(g, xr - 6, bq(xr - 6) - 1, 3, 2, '#b8653b'); for (let i = -2; i <= 2; i++) line(g, xr - 6, bq(xr - 6) - 2, xr - 6 + i * 2, bq(xr - 6) - 8 + Math.abs(i), '#4d8a3e');
  // ёлка в углу
  const tx = 80;
  rect(g, tx - 6, 140, 12, 8, '#a8332b'); rect(g, tx - 2, 136, 4, 6, '#6b3f26');
  [[84, 16, 22], [96, 22, 26], [110, 28, 30]].forEach(([y, hw, h]) => { poly(g, [[tx, y], [tx + hw, y + h], [tx - hw, y + h]], '#2f6b3a'); poly(g, [[tx, y], [tx + hw, y + h], [tx + 2, y + h]], '#265a31'); for (let i = 0; i < 6; i++) dot(g, tx - hw + 3 + i * hw / 3, y + h - 1, '#1f4a28'); });
  [[74, 104], [86, 112], [70, 126], [90, 130], [80, 120], [66, 136], [94, 138]].forEach(([x, y], i) => { ell(g, x, y, 2, 2, ['#e04848', '#ffd46a', '#6ab8ff'][i % 3]); dot(g, x - 1, y - 1, '#fff'); });
  for (let i = 0; i < 14; i++) { const y = 92 + i * 3.4, hw = 4 + (y - 84) * .5; TREE_LIGHTS.push([tx + Math.sin(i * 2.3) * hw * .8, y, i]); }
  // диван
  rect(g, 84, 112, 16, 34, '#5e4f34'); rect(g, 284, 112, 16, 34, '#5e4f34');
  rect(g, 90, 106, 204, 30, '#6b5a3c'); rect(g, 90, 106, 204, 2, '#7d6a48');
  for (let x = 100; x < 290; x += 16) for (let y = 112; y < 132; y += 9) dot(g, x + ((y / 9 | 0) % 2) * 8, y, '#584a31');
  rect(g, 94, 132, 196, 14, '#7a6746'); rect(g, 94, 132, 196, 2, '#8a7752');
  rect(g, 84, 110, 16, 3, '#6d5c3e'); rect(g, 284, 110, 16, 3, '#6d5c3e');
  // гирлянда
  for (let x = BW.x0 + 4; x < BW.x1 - 4; x++) { const ph = ((x - BW.x0) % 32) / 32, y = 21 + Math.sin(ph * Math.PI) * 6; dot(g, x, y, '#2a2a2a'); if ((x - BW.x0) % 6 === 0) GARLAND.push([x, y + 2, GARLAND.length]); }
  // люстра
  line(g, 192, Y0, 192, 8, '#8a8a8a');
  poly(g, [[184, 8], [200, 8], [205, 14], [179, 14]], '#d9c7a0'); rect(g, 179, 14, 26, 1, '#b8a47c');
  // компьютерный стол справа (сычевальня)
  rect(g, 292, 138, 62, 5, '#6b3f26'); rect(g, 294, 143, 4, 26, '#5a331f'); rect(g, 348, 143, 4, 26, '#5a331f');
  rect(g, 300, 108, 32, 30, '#cfc6ad'); rect(g, 298, 136, 36, 3, '#bdb49a'); rect(g, 330, 110, 10, 26, '#bdb49a');
  rect(g, 302, 111, 27, 22, '#2a2e2a'); rect(g, 303, 112, 25, 20, '#101410');
  rect(g, 304, 140, 24, 3, '#b8af95'); rect(g, 340, 132, 5, 6, '#f3efe6');
  rect(g, 338, 116, 16, 22, '#26262a'); rect(g, 336, 138, 20, 5, '#2e2e33'); rect(g, 345, 143, 2, 18, '#444');
}

function drawTable(g) {
  poly(g, [[96, 143], [288, 143], [296, 153], [88, 153]], '#ece7da');
  for (let x = 90; x < 296; x += 3) dot(g, x, 152, '#d6cfbc');
  rect(g, 88, 153, 208, 15, '#e2dccd');
  for (let x = 94; x < 296; x += 12) { rect(g, x, 154, 1, 13, '#d2cbba'); rect(g, x + 1, 154, 1, 13, '#f0ebdf'); }
  for (let x = 88; x < 296; x += 6) ell(g, x + 3, 168, 3, 1.6, '#e2dccd');
  rect(g, 96, 169, 4, 16, '#4a2c1c'); rect(g, 284, 169, 4, 16, '#4a2c1c');
  rect(g, 84, 185, 216, 2, '#3a2418');
  // праздничный стол
  SEATS.forEach(x => { ell(g, x, 148, 8, 2.2, '#f6f3ea'); ell(g, x, 148, 5, 1.2, '#e2ddd0'); });
  ell(g, 192, 147, 13, 4, '#d9d2bf'); ell(g, 192, 145, 11, 3.2, '#e3d18f');
  for (let i = 0; i < 14; i++) dot(g, 183 + rnd() * 18, 143 + rnd() * 4, ['#6aa84f', '#e07b2a', '#f2e6b8', '#d97a7a'][i % 4]);
  rect(g, 226, 140, 16, 7, '#7d2350'); rect(g, 226, 140, 16, 2, '#9a3368'); for (let i = 0; i < 6; i++) dot(g, 227 + i * 2.5, 141, '#f2e6d8');
  [[144, 145], [148, 144], [152, 145], [146, 142], [150, 141]].forEach(([x, y]) => { ell(g, x, y, 2.4, 2.2, '#f08a1e'); dot(g, x - 1, y - 1, '#ffc06a'); });
  rect(g, 190, 124, 6, 23, '#1f4a2a'); rect(g, 191, 118, 4, 7, '#1f4a2a'); rect(g, 190, 115, 6, 4, '#d9b650'); rect(g, 190, 132, 6, 6, '#e9dfc4'); rect(g, 190, 124, 1, 20, '#3a7a4a');
  [[112, 141], [158, 141], [205, 141], [250, 141], [276, 141]].forEach(([x, y]) => { rect(g, x, y, 3, 5, '#a9cde8'); rect(g, x, y + 2, 3, 3, '#e8c36a'); });
  rect(g, 272, 134, 4, 12, '#f3e7c9');
}

/* letters of the nick, extruded blocks on the floor */
const GLYPHS = {
  D: ['1111.', '1...1', '1...1', '1...1', '1...1', '1...1', '1111.'], v: ['.....', '.....', '1...1', '1...1', '1...1', '.1.1.', '..1..'],
  e: ['.....', '.....', '.111.', '1...1', '11111', '1....', '.1111'], r: ['.....', '.....', '1.11.', '11..1', '1....', '1....', '1....'],
  k: ['1....', '1....', '1..1.', '1.1..', '11...', '1.1..', '1..1.'], a: ['.....', '.....', '.111.', '....1', '.1111', '1...1', '.1111'],
  S: ['.1111', '1....', '1....', '.111.', '....1', '....1', '1111.'], K: ['1...1', '1..1.', '1.1..', '11...', '1.1..', '1..1.', '1...1'],
};
const NICK = 'DverkaSK', VX = 3, BASE = 204, LETTER_TOPS = [];
function drawLetters(g) {
  const total = NICK.length * 6 * VX - VX, x0 = 192 - total / 2;
  LETTER_TOPS.length = 0;
  [...NICK].forEach((ch, li) => {
    const G = GLYPHS[ch], lx = x0 + li * 6 * VX, sk = li >= 6;
    const [front, hi, sh, side] = sk ? ['#ff7a59', '#ffb199', '#d4553a', '#7a2414'] : ['#ffc861', '#ffe39a', '#d0902e', '#8a5418'];
    const cells = [];
    G.forEach((row, ry) => [...row].forEach((c, cx) => { if (c === '1') cells.push([lx + cx * VX, BASE - (7 - ry) * VX]); }));
    cells.forEach(([x, y]) => { rect(g, x + 1, y - 2, VX, VX, side); rect(g, x + 2, y - 2, VX, 1, hi); });
    cells.forEach(([x, y]) => { rect(g, x, y, VX, VX, front); rect(g, x, y + VX - 1, VX, 1, sh); });
    G.forEach((row, ry) => [...row].forEach((c, cx) => { if (c === '1' && (ry === 0 || G[ry - 1][cx] !== '1')) rect(g, lx + cx * VX, BASE - (7 - ry) * VX, VX, 1, hi); }));
    let best = null;
    for (let cx = 0; cx < 5; cx++) { let top = -1; for (let ry = 0; ry < 7; ry++) if (G[ry][cx] === '1') { top = ry; break; } if (top >= 0) { const sc = (7 - top) * 10 - Math.abs(cx - 2); if (!best || sc > best.sc) best = { sc, x: lx + cx * VX + 1.5, y: BASE - (7 - top) * VX - 2 }; } }
    LETTER_TOPS.push({ x: best.x, y: best.y });
  });
  rect(g, x0 - 2, BASE + 1, total + 6, 2, 'rgba(0,0,0,.35)');
}

/* ================= GUESTS ================= */
const GUESTS = [
  { id: 'troll', cx: SEATS[0], face: trollFace(false), wear: 'track', lines: ['problem?', 'хех', 'ну, за код'] },
  { id: 'bag', cx: SEATS[1], face: null, wear: 'hoodie', lines: ['ещё чайку?', 'без лиц, без имён', 'мне и так норм'] },
  { id: 'troll2', cx: SEATS[2], face: trollFace(true), wear: 'hood', lines: ['u mad?', 'кто пушнул в пятницу?', 'хехехе'] },
  { id: 'omg', cx: SEATS[3], face: omgFace(), wear: 'jacket', lines: ['ОМГ', 'прод упал?!', 'это оливье?!'] },
];
GUESTS.forEach(G => { G.t = { blink: false, bob: 0, act: 0 }; G.blinkT = 1 + Math.random() * 3; G.actT = 2 + Math.random() * 4; G.talkT = 3 + Math.random() * 6; G.bubbleT = 0; });

function drawGuest(g, G, t) {
  const cx = G.cx, b = G.t.bob, shake = G.id === 'troll2' && G.t.act ? (Math.floor(t * 20) % 2) : 0;
  const body = { track: '#1d2233', hoodie: '#34443a', hood: '#4b505e', jacket: '#6d7482' }[G.wear];
  if (G.wear === 'hood' || G.wear === 'jacket') { const hc = G.wear === 'hood' ? '#3e4350' : '#3a3f4a'; poly(g, [[cx - 23, 124], [cx - 25, 100], [cx - 19, 82 + b], [cx, 76 + b], [cx + 19, 82 + b], [cx + 25, 100], [cx + 23, 124]], hc); }
  poly(g, [[cx - 21, 152], [cx - 20, 128 + b], [cx - 13, 121 + b], [cx + 13, 121 + b], [cx + 20, 128 + b], [cx + 21, 152]], body);
  if (G.wear === 'track') { line(g, cx - 13, 122 + b, cx - 20, 150, '#eeeeee'); line(g, cx - 11, 122 + b, cx - 18, 150, '#eeeeee'); line(g, cx + 13, 122 + b, cx + 20, 150, '#eeeeee'); line(g, cx + 11, 122 + b, cx + 18, 150, '#eeeeee'); line(g, cx, 124 + b, cx, 150, '#8a8f9e'); }
  if (G.wear === 'hoodie') { rect(g, cx - 5, 123 + b, 1, 8, '#cfcfcf'); rect(g, cx + 4, 123 + b, 1, 8, '#cfcfcf'); rect(g, cx - 9, 138, 18, 8, '#2c3a31'); }
  if (G.wear === 'hood') { rect(g, cx - 4, 123 + b, 1, 7, '#cfcfcf'); rect(g, cx + 3, 123 + b, 1, 7, '#cfcfcf'); }
  if (G.wear === 'jacket') { line(g, cx, 122 + b, cx, 150, '#4d535f'); rect(g, cx - 14, 132, 6, 1, '#4d535f'); rect(g, cx + 8, 132, 6, 1, '#4d535f'); }
  const face = G.id === 'bag' ? (G.t.blink ? BAG1 : BAG0) : G.face;
  const fy = 124 - face.height + b - shake;
  g.drawImage(face, Math.round(cx - face.width / 2), Math.round(fy));
  if (G.id === 'omg') { // hands on cheeks — the classic OMG pose
    poly(g, [[cx - 20, 128], [cx - 25, 112], [cx - 22, 110], [cx - 16, 124]], body); rect(g, cx - 24, 104, 5, 7, '#e6c4a6'); rect(g, cx - 24, 104, 5, 1, '#c9a487');
    poly(g, [[cx + 20, 128], [cx + 25, 112], [cx + 22, 110], [cx + 16, 124]], body); rect(g, cx + 19, 104, 5, 7, '#e6c4a6'); rect(g, cx + 19, 104, 5, 1, '#c9a487');
  }
}
function drawArms(g, G, t) {
  if (G.id === 'omg') return;
  const cx = G.cx, body = { track: '#1d2233', hoodie: '#34443a', hood: '#4b505e' }[G.wear];
  const lift = G.id === 'bag' && G.t.act ? 1 : 0;
  poly(g, [[cx - 20, 140], [cx - 15, 138], [cx - 7, 147], [cx - 12, 149]], body); rect(g, cx - 10, 146, 4, 3, '#e6c4a6');
  if (lift) { poly(g, [[cx + 20, 138], [cx + 15, 136], [cx + 10, 124], [cx + 15, 123]], body); rect(g, cx + 9, 118, 5, 6, '#f3efe6'); rect(g, cx + 14, 119, 2, 3, '#f3efe6'); rect(g, cx + 10, 122, 4, 3, '#e6c4a6'); }
  else {
    poly(g, [[cx + 20, 140], [cx + 15, 138], [cx + 7, 147], [cx + 12, 149]], body); rect(g, cx + 6, 146, 4, 3, '#e6c4a6');
    if (G.id === 'bag') { rect(g, cx + 5, 141, 5, 6, '#f3efe6'); rect(g, cx + 10, 142, 2, 3, '#f3efe6'); }
    if (G.id === 'troll') { rect(g, cx + 6, 140, 3, 6, '#a9cde8'); rect(g, cx + 6, 143, 3, 3, '#e8c36a'); }
  }
  if (G.wear === 'track') { line(g, cx - 19, 139, cx - 11, 148, '#eeeeee'); line(g, cx + 19, 139, cx + 11, 148, '#eeeeee'); }
}
const CAT = { x: 108, blink: false, blinkT: 2, look: 0, lookT: 3 };
function drawCat(g, t) {
  const x = CAT.x, y = 151, k = '#1d1a22';
  const tl = Math.sin(t * 3) * 3;
  path(g, smooth([[x + 6, y - 2], [x + 11, y - 4], [x + 13 + tl * .3, y - 10], [x + 12 + tl, y - 16]]), k);
  path(g, smooth([[x + 7, y - 2], [x + 12, y - 4], [x + 14 + tl * .3, y - 10], [x + 13 + tl, y - 16]]), k);
  ell(g, x, y - 7, 8, 7, k); ell(g, x - 1, y - 6, 4, 5, '#f3efe6');
  rect(g, x - 5, y - 2, 3, 2, '#f3efe6'); rect(g, x + 1, y - 2, 3, 2, '#f3efe6');
  ell(g, x - 1, y - 17, 6.5, 5.5, k);
  poly(g, [[x - 7, y - 19], [x - 6, y - 26], [x - 3, y - 21]], k); poly(g, [[x + 5, y - 19], [x + 4, y - 26], [x + 1, y - 21]], k);
  if (CAT.blink) { rect(g, x - 5, y - 18, 3, 1, '#8fe36a'); rect(g, x + 1, y - 18, 3, 1, '#8fe36a'); }
  else { rect(g, x - 5, y - 19, 3, 3, '#8fe36a'); rect(g, x + 1, y - 19, 3, 3, '#8fe36a'); rect(g, x - 4 + CAT.look, y - 19, 1, 3, '#111'); rect(g, x + 2 + CAT.look, y - 19, 1, 3, '#111'); }
  rect(g, x - 2, y - 15, 2, 1, '#e38aa0'); rect(g, x - 3, y - 13, 4, 2, '#f3efe6');
  poly(g, [[x - 8, y - 22], [x + 4, y - 22], [x + 6, y - 30], [x - 2, y - 32]], '#d23b3b'); rect(g, x - 9, y - 23, 14, 3, '#f3efe6'); ell(g, x + 7, y - 30, 2, 2, '#f3efe6');
}
