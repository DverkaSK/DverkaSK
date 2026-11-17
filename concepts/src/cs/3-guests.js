/* ================= GUESTS: low-poly, GoldSrc-style ================= */
const SKIN = () => lam({ color: '#e2bfa0' });
const maskMat = tex => new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: .4, side: THREE.DoubleSide });

function arm(parent, sx, mat, handMat, len = .32) {
  const a = new THREE.Group(); a.position.set(sx * .23, .9, 0); parent.add(a);
  cyl(.055, .045, len, 7, mat, 0, -len / 2, 0, a); box(.08, .08, .08, handMat, 0, -len - .03, 0, { parent: a });
  a.rotation.x = -1.05; return a;
}

function ghostface() {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const robe = lam({ map: TEX.robe }), glove = lam({ color: '#0c0c0e' });
  box(.4, .14, .42, robe, 0, .5, .12, { parent: body });
  cyl(.16, .23, .5, 8, robe, 0, .72, 0, body);
  cyl(.09, .17, .1, 8, robe, 0, .98, 0, body);
  const head = new THREE.Group(); head.position.set(0, 1.08, 0); body.add(head);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), robe); hood.scale.set(1, 1.2, 1); hood.position.set(0, .05, -.02); head.add(hood);
  const peak = new THREE.Mesh(new THREE.ConeGeometry(.1, .16, 8), robe); peak.position.set(0, .24, -.07); peak.rotation.x = -.5; head.add(peak);
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(.21, .31), maskMat(TEX.ghost)); mask.position.set(0, .03, .16); mask.rotation.x = -.06; head.add(mask);
  const arms = [arm(body, -1, robe, glove), arm(body, 1, robe, glove)];
  const knife = new THREE.Group(); knife.position.set(0, -.37, .02); arms[1].add(knife);
  box(.018, .07, .025, lam({ color: '#2a2a2a' }), 0, 0, 0, { parent: knife }); box(.012, .13, .035, lam({ color: '#d8dde2' }), 0, -.1, 0, { parent: knife });
  knife.rotation.x = 1.2;
  return { G, body, head, arms };
}

function trollfacer() {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const hood = lam({ map: TEX.hoodie }), skin = SKIN();
  box(.38, .13, .42, lam({ color: '#2b2a33' }), 0, .5, .12, { parent: body });
  box(.38, .46, .23, hood, 0, .72, 0, { parent: body });
  box(.15, .07, .14, skin, 0, .97, 0, { parent: body });
  const head = new THREE.Group(); head.position.set(0, 1.12, 0); body.add(head);
  const h = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), skin); h.scale.set(1, 1.1, 1); head.add(h);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), lam({ color: '#3a2a20' })); hair.position.y = .02; head.add(hair);
  // the real trollface, worn like a printed mask
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(.4, .32), maskMat(TROLL)); mask.position.set(0, -.01, .14); head.add(mask);
  const arms = [arm(body, -1, hood, skin), arm(body, 1, hood, skin)];
  cyl(.035, .03, .1, 10, lam({ color: '#e7c36a', transparent: true, opacity: .85 }), 0, -.39, .03, arms[0]);
  return { G, body, head, arms };
}

function dvacher() {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const halat = lam({ map: TEX.halat }), skin = SKIN(), slip = lam({ map: TEX.slipper });
  // legs: robe over the thighs, bare shins, fluffy slippers
  [-1, 1].forEach(sx => {
    box(.15, .13, .4, halat, sx * .09, .52, .14, { parent: body });
    box(.08, .4, .08, skin, sx * .09, .28, .32, { parent: body });
    box(.13, .07, .22, slip, sx * .1, .035, .38, { parent: body });
    box(.13, .03, .07, lam({ color: '#6f9ad0' }), sx * .1, .075, .46, { parent: body });
  });
  box(.38, .46, .23, halat, 0, .75, 0, { parent: body });
  const chest = new THREE.Mesh(new THREE.PlaneGeometry(.12, .16), skin); chest.position.set(0, .88, .117); body.add(chest);
  for (let i = 0; i < 6; i++) box(.008, .008, .005, lam({ color: '#3a2a20' }), -.03 + (i % 3) * .03, .86 + (i / 3 | 0) * .04, .12, { parent: body, cast: false });
  [-1, 1].forEach(sx => { const l = box(.09, .24, .02, lam({ color: '#5e1826' }), sx * .07, .86, .118, { parent: body }); l.rotation.z = sx * .45; });
  box(.4, .04, .25, lam({ color: '#5e1826' }), 0, .6, 0, { parent: body });
  box(.04, .12, .02, lam({ color: '#5e1826' }), .08, .53, .13, { parent: body }).rotation.z = .2;
  box(.15, .07, .14, skin, 0, 1.0, 0, { parent: body });
  const head = new THREE.Group(); head.position.set(0, 1.02, 0); body.add(head);
  const side = lam({ map: TEX.bagSide });
  box(.3, .36, .28, [side, side, lam({ map: TEX.bagTop }), side, lam({ map: TEX.bagFront }), side], 0, .16, 0, { parent: head });
  const arms = [arm(body, -1, halat, skin), arm(body, 1, halat, skin)];
  const mand = new THREE.Mesh(new THREE.IcosahedronGeometry(.045, 1), lam({ color: '#f08a1e' })); mand.position.set(0, -.4, .04); arms[0].add(mand);
  return { G, body, head, arms };
}

function cat() {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const black = lam({ color: '#1d1a22' });
  box(.2, .12, .3, black, 0, .52, 0, { parent: body });
  box(.18, .24, .16, [black, black, black, black, lam({ map: TEX.catChest }), black], 0, .64, .04, { parent: body });
  const head = new THREE.Group(); head.position.set(0, .82, .06); body.add(head);
  box(.2, .16, .16, [black, black, black, black, lam({ map: TEX.catFace }), black], 0, 0, 0, { parent: head });
  [-1, 1].forEach(sx => { const e = new THREE.Mesh(new THREE.ConeGeometry(.045, .09, 4), black); e.position.set(sx * .065, .11, 0); e.rotation.y = Math.PI / 4; head.add(e); });
  const hat = new THREE.Mesh(new THREE.ConeGeometry(.06, .14, 8), lam({ color: '#d23b3b' })); hat.position.set(-.05, .15, 0); hat.rotation.z = .35; head.add(hat);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), lam({ color: '#f3efe6' })); pom.position.set(-.1, .22, 0); head.add(pom);
  [-1, 1].forEach(sx => box(.05, .04, .06, lam({ color: '#f3efe6' }), sx * .05, .47, .14, { parent: body }));
  const tail = []; let parent = body;
  for (let i = 0; i < 4; i++) { const seg = new THREE.Group(); seg.position.set(0, i ? .07 : .5, i ? 0 : -.15); parent.add(seg); box(.04, .08, .04, black, 0, .04, 0, { parent: seg }); tail.push(seg); parent = seg; }
  return { G, body, head, tail, arms: [] };
}

const GUESTS = [];
function buildGuests() {
  [
    { id: 'ghost', make: ghostface, pos: [-.45, 0, -1.72], ry: 0, lines: ['…', 'какой твой любимый фильм ужасов?', 'режу оливье', 'алло?'] },
    { id: 'troll', make: trollfacer, pos: [.45, 0, -1.72], ry: 0, lines: ['problem?', 'хех', 'u mad?', 'ну, за код'] },
    { id: 'dvach', make: dvacher, pos: [-1.3, -.02, -.85], ry: Math.PI / 3.2, lines: ['ещё оливье?', 'двач торт', 'тапки не снимаю', 'С наступающим, аноны'] },
    { id: 'cat', make: cat, pos: [1.32, 0, -.85], ry: -Math.PI / 3.2, lines: ['мяу', 'мрр', '*смотрит на селёдку*'] },
  ].forEach(d => {
    const R = d.make(); R.G.position.set(...d.pos); R.G.rotation.y = d.ry; scene.add(R.G);
    R.G.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    GUESTS.push({ ...d, ...R, actT: 1 + Math.random() * 3, act: 0, talkT: 3 + Math.random() * 6, bubbleT: 0 });
  });
}

function updateGuests(dt, t) {
  GUESTS.forEach(G => {
    G.actT -= dt;
    if (G.actT < 0) { G.act = G.act ? 0 : 1; G.actT = G.act ? 1.4 : 2 + Math.random() * 4; }
    const k = G.act ? Math.min(1, (1.4 - G.actT) * 4) * Math.min(1, G.actT * 4) : 0;
    if (G.id === 'ghost') { G.head.rotation.z = Math.sin(t * .8) * .22; G.arms[1].rotation.x = -1.05 - k * .4 + Math.sin(t * 12) * .06 * k; }
    if (G.id === 'troll') { G.body.position.y = k * Math.abs(Math.sin(t * 26)) * .018; G.head.rotation.x = -k * .25; G.arms[0].rotation.x = -1.05 - k * 1.1; }
    if (G.id === 'dvach') { G.arms[0].rotation.x = -1.05 - k * .5; G.arms[1].rotation.x = -1.05 - k * .45 + Math.sin(t * 14) * .08 * k; G.head.rotation.y = Math.sin(t * .5) * .35; }
    if (G.id === 'cat') { G.tail.forEach((s, i) => s.rotation.x = Math.sin(t * 2.2 + i * .7) * .35 - (i ? 0 : .5)); G.head.rotation.y = k ? .6 * k : Math.sin(t * .7) * .15; }
    if (G.id !== 'troll') G.body.position.y = Math.sin(t * 1.8 + G.pos[0]) * .004;
    G.talkT -= dt;
    if (G.talkT < 0) { G.talkT = 7 + Math.random() * 9; G.bubble.textContent = G.lines[Math.floor(Math.random() * G.lines.length)]; G.bubble.classList.add('on'); G.bubbleT = 2.6; }
    G.bubbleT -= dt; if (G.bubbleT <= 0) G.bubble.classList.remove('on');
    const wp = new THREE.Vector3(); G.head.getWorldPosition(wp);
    const [x, y] = project(wp, G.id === 'cat' ? .22 : .42); G.bubble.style.left = x + 'px'; G.bubble.style.top = y + 'px';
  });
}
