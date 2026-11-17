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
