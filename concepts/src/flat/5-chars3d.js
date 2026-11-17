/* ================= GUESTS as chunky low-poly figures ================= */
function faceTex(w, h, draw) { return canvasTex(w, h, draw); }
const FT = {
  bagFront: faceTex(32, 36, g => {
    px(g, 0, 0, 32, 36, '#b98a55'); px(g, 0, 0, 32, 5, '#caa06a');
    for (let x = 0; x < 32; x += 2) px(g, x, (x / 2) % 2, 2, 1, '#8a6038');
    px(g, 5, 6, 1, 29, '#a0744a'); px(g, 26, 6, 1, 29, '#a0744a'); px(g, 0, 35, 32, 1, '#8a6038');
    // eye holes, big and dark so they read from far away
    [[7, 11], [19, 11]].forEach(([x, y]) => { px(g, x, y + 1, 7, 5, '#120a06'); px(g, x + 1, y, 5, 7, '#120a06'); px(g, x + 3, y + 3, 2, 2, '#f3efe6'); });
    px(g, 6, 22, 20, 8, '#c0392b'); px(g, 11, 23, 10, 2, '#f2c14e'); px(g, 10, 25, 12, 2, '#6b3a1c'); px(g, 11, 27, 10, 2, '#f2c14e'); px(g, 13, 23, 1, 1, '#fff3c0'); px(g, 17, 23, 1, 1, '#fff3c0');
    speckle(g, 32, 36, 30, ['#c29560', '#ad7f4c']);
  }),
  bagSide: faceTex(16, 18, g => { px(g, 0, 0, 16, 18, '#a88050'); px(g, 0, 0, 16, 3, '#caa06a'); px(g, 7, 3, 2, 15, '#94693f'); speckle(g, 16, 18, 10, ['#b98a55']); }),
  bagTop: faceTex(16, 16, g => { px(g, 0, 0, 16, 16, '#7a5530'); px(g, 2, 2, 12, 12, '#5a3c20'); px(g, 0, 0, 16, 2, '#caa06a'); px(g, 0, 14, 16, 2, '#caa06a'); }),
  bag2Front: faceTex(32, 36, g => {
    px(g, 0, 0, 32, 36, '#ece7da'); px(g, 0, 0, 32, 5, '#f7f4ec');
    for (let x = 0; x < 32; x += 2) px(g, x, (x / 2) % 2, 2, 1, '#cfc8b6');
    px(g, 5, 6, 1, 29, '#d6cfbd'); px(g, 26, 6, 1, 29, '#d6cfbd');
    [[7, 11], [19, 11]].forEach(([x, y]) => { px(g, x, y + 1, 7, 5, '#120a06'); px(g, x + 1, y, 5, 7, '#120a06'); px(g, x + 3, y + 3, 2, 2, '#f3efe6'); });
    px(g, 7, 8, 6, 1, '#1a1a1a'); px(g, 19, 8, 6, 1, '#1a1a1a');
    px(g, 7, 23, 2, 2, '#1a1a1a'); px(g, 9, 25, 2, 2, '#1a1a1a'); px(g, 11, 27, 10, 2, '#1a1a1a'); px(g, 21, 25, 2, 2, '#1a1a1a'); px(g, 23, 23, 2, 2, '#1a1a1a');
  }),
  bag2Side: faceTex(16, 18, g => { px(g, 0, 0, 16, 18, '#ddd6c6'); px(g, 0, 0, 16, 3, '#f7f4ec'); px(g, 7, 3, 2, 15, '#cfc8b6'); }),
  // the grin mask: huge smile, squint, raised brows — drawn big on purpose
  troll: faceTex(32, 32, g => {
    px(g, 0, 0, 32, 32, '#f4f3ec'); px(g, 30, 0, 2, 32, '#d8d6cb');
    const k = '#1b1b1b';
    px(g, 3, 5, 9, 2, k); px(g, 2, 7, 2, 1, k); px(g, 20, 4, 9, 2, k); px(g, 28, 6, 2, 1, k);
    px(g, 4, 10, 8, 2, k); px(g, 3, 9, 2, 1, k); px(g, 11, 9, 2, 1, k);
    px(g, 20, 10, 8, 2, k); px(g, 19, 9, 2, 1, k); px(g, 27, 9, 2, 1, k);
    px(g, 5, 12, 3, 1, '#b9b7ac'); px(g, 23, 12, 3, 1, '#b9b7ac');
    px(g, 14, 12, 2, 5, '#c9c7bb'); px(g, 13, 16, 5, 1, '#9a988e');
    px(g, 1, 17, 30, 2, k); px(g, 0, 15, 2, 3, k); px(g, 30, 15, 2, 3, k);
    px(g, 2, 19, 28, 6, '#ffffff');
    for (let x = 3; x < 30; x += 3) px(g, x, 19, 1, 6, k);
    px(g, 2, 22, 28, 1, k);
    px(g, 3, 25, 26, 2, k); px(g, 6, 27, 20, 1, k);
    px(g, 11, 29, 10, 1, '#b9b7ac'); px(g, 13, 31, 6, 1, '#b9b7ac');
    px(g, 0, 20, 1, 4, '#b9b7ac'); px(g, 31, 20, 1, 4, '#b9b7ac');
  }),
  hair: faceTex(16, 16, g => { px(g, 0, 0, 16, 16, '#17161a'); speckle(g, 16, 16, 20, ['#2a2830', '#0c0b0e']); }),
  catFace: faceTex(24, 20, g => {
    px(g, 0, 0, 24, 20, '#1d1a22'); px(g, 7, 10, 10, 10, '#f3efe6'); px(g, 9, 8, 6, 4, '#f3efe6');
    [[3, 5], [15, 5]].forEach(([x, y]) => { px(g, x, y, 6, 5, '#8fe36a'); px(g, x + 2, y, 2, 5, '#0d0d0d'); px(g, x, y, 1, 1, '#d6ffc0'); });
    px(g, 11, 11, 2, 2, '#e38aa0'); px(g, 11, 13, 1, 2, '#555'); px(g, 12, 13, 1, 2, '#555');
    px(g, 0, 12, 6, 1, '#999'); px(g, 18, 12, 6, 1, '#999');
  }),
  catChest: faceTex(16, 16, g => { px(g, 0, 0, 16, 16, '#1d1a22'); px(g, 4, 2, 8, 14, '#f3efe6'); px(g, 3, 6, 10, 10, '#f3efe6'); }),
  hoodie: (c, d) => faceTex(16, 16, g => { px(g, 0, 0, 16, 16, c); px(g, 0, 12, 16, 4, d); px(g, 5, 0, 1, 7, '#cfcfcf'); px(g, 10, 0, 1, 7, '#cfcfcf'); px(g, 4, 8, 8, 4, d); }),
  track: faceTex(16, 16, g => { px(g, 0, 0, 16, 16, '#1d2030'); px(g, 7, 0, 2, 16, '#2c3044'); px(g, 8, 0, 1, 10, '#cfcfcf'); }),
  stripes: faceTex(8, 16, g => { px(g, 0, 0, 8, 16, '#1d2030'); px(g, 2, 0, 1, 16, '#eeeeee'); px(g, 5, 0, 1, 16, '#eeeeee'); }),
  sweater: faceTex(16, 16, g => { px(g, 0, 0, 16, 16, '#6e7480'); for (let x = 0; x < 16; x += 4) { px(g, x, 3, 2, 1, '#e8e8ee'); px(g, x + 2, 12, 2, 1, '#e8e8ee'); } px(g, 7, 6, 1, 4, '#e8e8ee'); px(g, 6, 7, 3, 1, '#e8e8ee'); }),
};
const skin = () => lam({ color: '#e6c4a6' });

function seatedAnon({ top, sleeve, headKind }) {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const bodyMat = lam({ map: top }), sleeveMat = lam({ map: sleeve || top });
  box(.36, .12, .4, lam({ color: '#2b2a33' }), 0, .5, .12, { parent: body });                       // lap
  box(.36, .44, .22, bodyMat, 0, .72, 0, { parent: body });                                         // torso
  box(.14, .06, .14, skin(), 0, .96, 0, { parent: body });                                          // neck
  const arms = [-1, 1].map(sx => {
    const a = new THREE.Group(); a.position.set(sx * .23, .9, 0); body.add(a);
    box(.1, .32, .1, sleeveMat, 0, -.15, 0, { parent: a }); box(.09, .08, .09, skin(), 0, -.33, 0, { parent: a });
    a.rotation.x = -1.05; return a;
  });
  const head = new THREE.Group(); head.position.set(0, 1.0, 0); body.add(head);
  if (headKind === 'troll') {
    const mats = [lam({ color: '#dcdad0' }), lam({ color: '#dcdad0' }), lam({ map: FT.hair }), lam({ color: '#d8d6cb' }), lam({ map: FT.troll }), lam({ map: FT.hair })];
    box(.26, .28, .24, mats, 0, .13, 0, { parent: head });
    box(.28, .07, .26, lam({ map: FT.hair }), 0, .3, -.01, { parent: head });
    for (let i = 0; i < 5; i++) box(.05, .06, .05, lam({ map: FT.hair }), -.1 + i * .05, .35, (i % 2) * .05 - .03, { parent: head }).rotation.z = (i - 2) * .25;
  } else {
    const white = headKind === 'bag2', side = lam({ map: white ? FT.bag2Side : FT.bagSide });
    const mats = [side, side, lam({ map: FT.bagTop }), side, lam({ map: white ? FT.bag2Front : FT.bagFront }), side];
    box(.3, .36, .28, mats, 0, .14, 0, { parent: head });
  }
  return { G, body, head, arms };
}

function seatedCat() {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const black = lam({ color: '#1d1a22' });
  box(.2, .12, .3, black, 0, .52, 0, { parent: body });
  box(.18, .24, .16, [black, black, black, black, lam({ map: FT.catChest }), black], 0, .64, .04, { parent: body });
  const head = new THREE.Group(); head.position.set(0, .82, .06); body.add(head);
  box(.2, .16, .16, [black, black, black, black, lam({ map: FT.catFace }), black], 0, 0, 0, { parent: head });
  [-1, 1].forEach(sx => { const e = new THREE.Mesh(new THREE.ConeGeometry(.045, .09, 4), black); e.position.set(sx * .065, .11, 0); e.rotation.y = Math.PI / 4; head.add(e); });
  const hat = new THREE.Mesh(new THREE.ConeGeometry(.06, .14, 6), lam({ color: '#d23b3b' })); hat.position.set(-.05, .15, 0); hat.rotation.z = .35; head.add(hat);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), lam({ color: '#f3efe6' })); pom.position.set(-.1, .22, 0); head.add(pom);
  [-1, 1].forEach(sx => box(.05, .04, .06, lam({ color: '#f3efe6' }), sx * .05, .47, .14, { parent: body }));
  const tail = []; let parent = body, y = .5, z = -.15;
  for (let i = 0; i < 4; i++) { const seg = new THREE.Group(); seg.position.set(0, i ? .07 : y, i ? 0 : z); parent.add(seg); box(.04, .08, .04, black, 0, .04, 0, { parent: seg }); tail.push(seg); parent = seg; }
  return { G, body, head, tail };
}

const GUESTS = [];
function buildGuests() {
  const defs = [
    { id: 'bag', make: () => seatedAnon({ top: FT.hoodie('#34443a', '#2a3730'), headKind: 'bag' }), pos: [-.45, 0, -1.72], ry: 0, lines: ['ещё чайку?', 'мне и так норм', 'без лиц, без имён'] },
    { id: 'troll', make: () => seatedAnon({ top: FT.track, sleeve: FT.stripes, headKind: 'troll' }), pos: [.45, 0, -1.72], ry: 0, lines: ['хех', 'problem?', 'ну, за код', 'кто пушнул в пятницу?'] },
    { id: 'bag2', make: () => seatedAnon({ top: FT.sweater, headKind: 'bag2' }), pos: [-1.3, -.02, -.85], ry: Math.PI / 3.2, lines: ['мандаринку?', 'С наступающим, аноны', 'оливье — топ'] },
    { id: 'cat', make: seatedCat, pos: [1.32, 0, -.85], ry: -Math.PI / 3.2, lines: ['мяу', 'мрр', '*смотрит на селёдку*'] },
  ];
  defs.forEach(d => {
    const R = d.make(); R.G.position.set(...d.pos); R.G.rotation.y = d.ry; scene.add(R.G);
    R.G.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    GUESTS.push({ ...d, ...R, actT: 1 + Math.random() * 3, act: 0, talkT: 3 + Math.random() * 6, bubbleT: 0 });
  });
  const mugM = lam({ color: '#f3efe6' });
  const b = GUESTS[0]; b.mug = cyl(.04, .035, .09, 8, mugM, 0, -.38, .02, b.arms[1]);
  const t = GUESTS[1]; t.glass = cyl(.035, .03, .1, 8, lam({ color: '#e7c36a', transparent: true, opacity: .8 }), 0, -.39, .02, t.arms[0]);
  const m = GUESTS[2]; m.mand = new THREE.Mesh(new THREE.IcosahedronGeometry(.045, 0), lam({ color: '#f08a1e' })); m.mand.position.set(0, -.39, .04); m.arms[0].add(m.mand);
}

function updateGuests(dt, t) {
  GUESTS.forEach(G => {
    G.actT -= dt;
    if (G.actT < 0) { G.act = G.act ? 0 : 1; G.actT = G.act ? 1.3 : 2 + Math.random() * 4; }
    const k = G.act ? Math.min(1, (1.3 - G.actT) * 4) * Math.min(1, G.actT * 4) : 0; // ease in/out of the action
    if (G.id === 'bag') { G.arms[1].rotation.x = -1.05 - k * 1.25; G.head.rotation.x = -k * .25; }
    if (G.id === 'troll') { G.body.position.y = k * Math.abs(Math.sin(t * 28)) * .02; G.head.rotation.x = -k * .3; G.head.rotation.z = Math.sin(t * 1.3) * .06; }
    if (G.id === 'bag2') { G.arms[0].rotation.x = -1.05 - k * .5; G.arms[1].rotation.x = -1.05 - k * .45 + Math.sin(t * 14) * .08 * k; G.head.rotation.y = Math.sin(t * .5) * .35; }
    if (G.id === 'cat') { G.tail.forEach((s, i) => s.rotation.x = Math.sin(t * 2.2 + i * .7) * .35 - (i ? 0 : .5)); G.head.rotation.y = k ? .6 * k : Math.sin(t * .7) * .15; }
    if (G.id !== 'troll') G.body.position.y = Math.sin(t * 1.8 + G.pos[0]) * .004;
    G.talkT -= dt;
    if (G.talkT < 0) { G.talkT = 7 + Math.random() * 9; G.bubble.textContent = G.lines[Math.floor(Math.random() * G.lines.length)]; G.bubble.classList.add('on'); G.bubbleT = 2.4; }
    G.bubbleT -= dt; if (G.bubbleT <= 0) G.bubble.classList.remove('on');
    const wp = new THREE.Vector3(); G.head.getWorldPosition(wp);
    const [x, y] = project(wp, G.id === 'cat' ? .2 : .42); G.bubble.style.left = x + 'px'; G.bubble.style.top = y + 'px';
  });
}
