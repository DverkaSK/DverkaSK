/* ================= MASCOT: Dverka ================= */
const OUTFIT = {
  hat: {
    santa: `<path d="M-22 -80 C-20 -102 2 -112 18 -104 C28 -99 34 -90 32 -80 Z" fill="#d63a3a"/><path d="M-6 -104 C6 -110 22 -104 30 -92" fill="none" stroke="#a82a2a" stroke-width="2" opacity=".6"/><rect x="-26" y="-87" width="52" height="11" rx="5.5" fill="#f7f3ea"/><circle cx="33" cy="-80" r="6.5" fill="#f7f3ea"/>`,
    beanie: `<path d="M-21 -80 C-21 -106 21 -106 21 -80 Z" fill="#e3a33b"/><path d="M-12 -98 v14 M-4 -101 v17 M4 -101 v17 M12 -98 v14" stroke="#c9862a" stroke-width="2"/><rect x="-24" y="-87" width="48" height="10" rx="5" fill="#c9862a"/><circle cx="0" cy="-104" r="7.5" fill="#f6dfae"/>`,
    party: `<path d="M-13 -80 L2 -120 L16 -80 Z" fill="#8f6ad6"/><path d="M-9 -91 L12 -95 M-4 -104 L8 -106" stroke="#ffd46a" stroke-width="3.5" stroke-linecap="round"/><circle cx="2" cy="-121" r="5" fill="#ffd46a"/><path d="M-13 -80 Q2 -76 16 -80" stroke="#6d4fb0" stroke-width="2" fill="none"/>`,
    pumpkin: `<ellipse cx="0" cy="-91" rx="21" ry="13" fill="#e07b2a"/><path d="M-8 -103 C-12 -92 -12 -86 -8 -79 M8 -103 C12 -92 12 -86 8 -79 M0 -104 V-78" stroke="#b85a18" stroke-width="2" fill="none"/><path d="M0 -103 Q1 -110 5 -112" stroke="#4d7a36" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M5 -109 q8 -4 10 2 q-6 3 -10 -2" fill="#6aa84f"/>`,
    crown: `<path d="M-17 -80 L-20 -102 L-9 -91 L0 -107 L9 -91 L20 -102 L17 -80 Z" fill="#f2c14e" stroke="#b8862a" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-88" r="3" fill="#d23b3b"/><circle cx="-10" cy="-86" r="2" fill="#5fb3ff"/><circle cx="10" cy="-86" r="2" fill="#6fdc8c"/>`,
    headphones: `<path d="M-25 -58 C-28 -106 28 -106 25 -58" fill="none" stroke="#2b2d42" stroke-width="5.5" stroke-linecap="round"/><rect x="-32" y="-68" width="11" height="20" rx="5" fill="#ff7a59"/><rect x="21" y="-68" width="11" height="20" rx="5" fill="#ff7a59"/><rect x="-30" y="-64" width="4" height="12" rx="2" fill="#ffb199"/>`,
    propeller: `<path d="M-20 -80 C-20 -100 20 -100 20 -80 Z" fill="#3a86c8"/><path d="M-20 -80 H-32" stroke="#2c6aa0" stroke-width="5" stroke-linecap="round"/><path d="M-10 -97 L10 -84" stroke="#ffd46a" stroke-width="3" opacity=".7"/><rect x="-1.5" y="-107" width="3" height="10" fill="#555"/><g class="prop"><ellipse cx="-10" cy="-108" rx="10" ry="2.8" fill="#ffd46a"/><ellipse cx="10" cy="-108" rx="10" ry="2.8" fill="#ff7a59"/></g>`,
    flower: `<g transform="translate(11 -84)"><path d="M-2 4 q-8 4 -10 -2 q6 -3 10 2" fill="#6aa84f"/><circle cx="0" cy="-6" r="4.5" fill="#ffb3c7"/><circle cx="6" cy="0" r="4.5" fill="#ffb3c7"/><circle cx="0" cy="6" r="4.5" fill="#ffb3c7"/><circle cx="-6" cy="0" r="4.5" fill="#ffb3c7"/><circle r="3.8" fill="#ffd46a"/></g>`,
  },
  neck: {
    scarf: `<rect x="-25" y="-38" width="50" height="11" rx="5.5" fill="#d63a3a"/><path d="M-15 -38 v11 M-5 -38 v11 M5 -38 v11 M15 -38 v11" stroke="#f7f3ea" stroke-width="2.5" opacity=".85"/><path d="M8 -29 L12 -6 L21 -8 L17 -29 Z" fill="#b82f2f"/><path d="M12 -8 l1 4 M15 -8 l1 4 M18 -8 l1 4" stroke="#b82f2f" stroke-width="1.5"/>`,
    bowtie: `<path d="M0 -33 L-12 -40 L-12 -26 Z M0 -33 L12 -40 L12 -26 Z" fill="#8f6ad6" stroke="#6d4fb0" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="-33" r="3.5" fill="#6d4fb0"/>`,
    garland: `<path d="M-23 -42 Q0 -26 23 -42" fill="none" stroke="#2f6b3a" stroke-width="3"/>${[[-17, -36, '#ff5a5a'], [-8, -32, '#ffd46a'], [1, -31, '#6fdc8c'], [10, -33, '#6ab8ff'], [18, -38, '#e79bff']].map(([x, y, c], i) => `<circle class="bulb" cx="${x}" cy="${y + 3}" r="3" fill="${c}" style="animation-delay:${i * .3}s"/>`).join('')}`,
  },
  face: {
    glasses: `<circle cx="-8" cy="-58" r="8.5" fill="#bfe6ff" fill-opacity=".18" stroke="#2b2d42" stroke-width="2.2"/><circle cx="8" cy="-58" r="8.5" fill="#bfe6ff" fill-opacity=".18" stroke="#2b2d42" stroke-width="2.2"/><path d="M-1 -59 h2" stroke="#2b2d42" stroke-width="2.2"/>`,
    sunglasses: `<path d="M-18 -64 h15 v6 a6.5 6.5 0 0 1 -6.5 6.5 h-2 a6.5 6.5 0 0 1 -6.5 -6.5 Z M3 -64 h15 v6 a6.5 6.5 0 0 1 -6.5 6.5 h-2 a6.5 6.5 0 0 1 -6.5 -6.5 Z" fill="#1d1f33"/><path d="M-3 -62 h6" stroke="#1d1f33" stroke-width="2.2"/><path d="M-15 -61 l4 0 M6 -61 l4 0" stroke="#fff" stroke-width="1.5" opacity=".6"/>`,
  },
};
const SEASON_OUTFIT = {
  winter: { hat: 'santa', neck: 'scarf', face: null },
  autumn: { hat: 'beanie', neck: 'scarf', face: null },
  spring: { hat: 'flower', neck: 'bowtie', face: null },
  summer: { hat: 'propeller', neck: null, face: 'sunglasses' },
};

function mascotSVG() {
  return `<g id="m-root">
    <ellipse id="m-shadow" cx="0" cy="2" rx="24" ry="5" fill="#000" opacity=".35"/>
    <g id="m-spin"><g id="m-flip">
      <g id="m-legL"><path d="M-9 -14 L-10 -1" stroke="#5b3218" stroke-width="5.5" stroke-linecap="round"/><ellipse cx="-11" cy="0" rx="6.5" ry="3.8" fill="#5b3218"/></g>
      <g id="m-legR"><path d="M9 -14 L10 -1" stroke="#5b3218" stroke-width="5.5" stroke-linecap="round"/><ellipse cx="11" cy="0" rx="6.5" ry="3.8" fill="#5b3218"/></g>
      <g id="m-body">
        <path id="m-armL" d="M-21 -36 q-10 3 -13 13" stroke="#6b3a1c" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path id="m-armR" d="M21 -36 q10 3 13 13" stroke="#6b3a1c" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M-22 -12 V-60 A22 22 0 0 1 22 -60 V-12 Z" fill="url(#mWood)" stroke="#6b3a1c" stroke-width="3"/>
        <path d="M-15 -17 V-29 H15 V-17 Z" fill="none" stroke="#a65f2c" stroke-width="2" opacity=".7"/>
        <path d="M-14 -72 A16 16 0 0 1 14 -72" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".25"/>
        <circle cx="15" cy="-36" r="3.8" fill="#f2c14e" stroke="#a87a1c" stroke-width="1.2"/>
        <clipPath id="m-clip"><ellipse cx="-8" cy="-58" rx="6.8" ry="8"/><ellipse cx="8" cy="-58" rx="6.8" ry="8"/></clipPath>
        <ellipse cx="-8" cy="-58" rx="6.8" ry="8" fill="#fffaf0" stroke="#6b3a1c" stroke-width="1.5"/>
        <ellipse cx="8" cy="-58" rx="6.8" ry="8" fill="#fffaf0" stroke="#6b3a1c" stroke-width="1.5"/>
        <g id="m-pup"><circle cx="-8" cy="-57" r="4" fill="#23161c"/><circle cx="8" cy="-57" r="4" fill="#23161c"/><circle cx="-6.5" cy="-59" r="1.5" fill="#fff"/><circle cx="9.5" cy="-59" r="1.5" fill="#fff"/></g>
        <rect id="m-lid" x="-16" y="-67" width="32" height="0" fill="#e39150" clip-path="url(#m-clip)"/>
        <ellipse cx="-15" cy="-47" rx="4.5" ry="2.8" fill="#ff8080" opacity=".55"/><ellipse cx="15" cy="-47" rx="4.5" ry="2.8" fill="#ff8080" opacity=".55"/>
        <path id="m-mouth" d="M-4 -46 Q0 -42 4 -46" fill="none" stroke="#6b3a1c" stroke-width="2.2" stroke-linecap="round"/>
        <g id="o-neck"></g><g id="o-face"></g><g id="o-hat"></g>
      </g>
    </g></g>
  </g>`;
}

const M = {
  x: 800, vx: 0, h: 0, vh: 0, face: 1, target: 800, phase: 0, idle: 0, sleeping: false,
  spin: 0, squash: 1, blinkT: 2, blink: 0, look: 0, lookY: 0, wave: 0, mood: 'smile', els: {},
};
let outfit = store.get('outfit', null), outfitCustom = !!outfit;

function mountMascot() {
  $('#mascot-layer').innerHTML = mascotSVG();
  ['m-root', 'm-spin', 'm-flip', 'm-legL', 'm-legR', 'm-body', 'm-armL', 'm-armR', 'm-pup', 'm-lid', 'm-mouth', 'm-shadow', 'o-hat', 'o-neck', 'o-face']
    .forEach(id => M.els[id] = document.getElementById(id));
}
function applyOutfit() {
  ['hat', 'neck', 'face'].forEach(k => { M.els['o-' + k].innerHTML = outfit && outfit[k] ? OUTFIT[k][outfit[k]] : ''; });
}

const MOUTH = {
  smile: 'M-4 -46 Q0 -42 4 -46',
  grin: 'M-6 -47 Q0 -39 6 -47 Z',
  o: 'M-2.5 -45 a2.5 3 0 1 0 5 0 a2.5 3 0 1 0 -5 0',
  sleep: 'M-3 -45 H3',
};

function renderMascot(t) {
  const e = M.els, run = Math.min(1, Math.abs(M.vx) / 500);
  const bob = run > .1 ? Math.abs(Math.sin(M.phase)) * 4 * run : Math.sin(t * 2.4) * (M.sleeping ? .6 : 1.1);
  const lean = Math.max(-14, Math.min(14, M.vx / 900 * 14));
  const sq = M.squash, sx = 1 / Math.sqrt(sq);
  e['m-root'].setAttribute('transform', `translate(${M.x.toFixed(1)} ${(FEET - M.h).toFixed(1)}) scale(1.3)`);
  e['m-shadow'].setAttribute('transform', `translate(0 ${M.h.toFixed(1)}) scale(${Math.max(.4, 1 - M.h / 160).toFixed(2)})`);
  e['m-spin'].setAttribute('transform', `scale(${Math.cos(M.spin).toFixed(3)} 1)`);
  e['m-flip'].setAttribute('transform', `scale(${M.face} 1)`);
  e['m-body'].setAttribute('transform', `rotate(${(lean * M.face).toFixed(1)}) translate(0 ${(-bob).toFixed(1)}) scale(${sx.toFixed(3)} ${sq.toFixed(3)})`);
  const leg = M.h > 2 ? 22 : Math.sin(M.phase) * 38 * run;
  e['m-legL'].setAttribute('transform', `rotate(${(M.h > 2 ? -leg : leg).toFixed(1)} -9 -14)`);
  e['m-legR'].setAttribute('transform', `rotate(${(-leg).toFixed(1)} 9 -14)`);
  const arm = run > .1 ? Math.sin(M.phase) * 30 * run : (M.wave > 0 ? Math.sin(t * 16) * 30 - 50 : Math.sin(t * 2) * 4);
  e['m-armL'].setAttribute('transform', `rotate(${(-arm * (run > .1 ? 1 : 0) + (run > .1 ? 0 : -Math.sin(t * 2) * 4)).toFixed(1)} -21 -36)`);
  e['m-armR'].setAttribute('transform', `rotate(${(run > .1 ? arm : (M.wave > 0 ? -arm - 40 : arm)).toFixed(1)} 21 -36)`);
  // eyes look forward while running, otherwise toward what they're watching
  const lx = run > .2 ? 2.2 : Math.max(-2.4, Math.min(2.4, M.look * M.face)), ly = Math.max(-2, Math.min(2, M.lookY));
  e['m-pup'].setAttribute('transform', `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`);
  const lid = M.sleeping ? 1 : M.blink;
  e['m-lid'].setAttribute('height', (lid * 17).toFixed(1));
  e['m-mouth'].setAttribute('d', MOUTH[M.sleeping ? 'sleep' : M.mood]);
  e['m-mouth'].setAttribute('fill', M.mood === 'grin' || M.mood === 'o' ? '#6b2a24' : 'none');
}
