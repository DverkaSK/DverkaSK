/* ================= THE FLAT, a cosy GoldSrc-style map ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d0b12');
const lam = o => new THREE.MeshLambertMaterial(o);
const basic = o => new THREE.MeshBasicMaterial(o);
const BLINKERS = [];

function box(w, h, d, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = opts.cast !== false; m.receiveShadow = true;
  (opts.parent || scene).add(m); return m;
}
function cyl(rt, rb, h, seg, mat, x, y, z, parent, open) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m;
}
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; scene.add(m); return m;
}
function rep(tex, rx, ry) { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; }

const RW = 5.2, RD = 4.6, RH = 2.6, BACK = -2.2, LEFT = -RW / 2, RIGHT = RW / 2;
const ARCH = { x0: 1.5, x1: 2.3, h: 2.0 };

function buildRoom() {
  const shell = lam({ color: '#2e2630' });
  box(RW + .24, .3, RD + .12, shell, 0, -.15, BACK + RD / 2 - .06, { cast: false });
  plane(RW, RD, lam({ map: TEX.floorWood }), 0, .001, BACK + RD / 2, 0, -Math.PI / 2);
  plane(3, 2.1, lam({ map: TEX.carpet }), 0, .004, -.85, 0, -Math.PI / 2);
  // back wall with an arched doorway into the next room
  const s = new THREE.Shape(); s.moveTo(LEFT, 0); s.lineTo(RIGHT, 0); s.lineTo(RIGHT, RH); s.lineTo(LEFT, RH); s.lineTo(LEFT, 0);
  const hole = new THREE.Path(), r = (ARCH.x1 - ARCH.x0) / 2;
  hole.moveTo(ARCH.x0, 0); hole.lineTo(ARCH.x1, 0); hole.lineTo(ARCH.x1, ARCH.h - r); hole.absarc(ARCH.x0 + r, ARCH.h - r, r, 0, Math.PI, false); hole.lineTo(ARCH.x0, 0);
  s.holes.push(hole);
  const paper = TEX.wallpaper.clone(); paper.needsUpdate = true; paper.wrapS = paper.wrapT = THREE.RepeatWrapping; paper.repeat.set(1 / .58, 1 / .6);
  const back = new THREE.Mesh(new THREE.ShapeGeometry(s), lam({ map: paper })); back.position.z = BACK; back.receiveShadow = true; scene.add(back);
  box(RW + .24, RH, .12, shell, 0, RH / 2, BACK - .07, { cast: false }).visible = false;
  const wallMat = lam({ map: TEX.wallpaper });
  plane(RD, RH, wallMat, LEFT + .001, RH / 2, BACK + RD / 2, Math.PI / 2);
  plane(RD, RH, wallMat, RIGHT - .001, RH / 2, BACK + RD / 2, -Math.PI / 2);
  box(.12, RH, RD, shell, LEFT - .06, RH / 2, BACK + RD / 2, { cast: false });
  box(.12, RH, RD, shell, RIGHT + .06, RH / 2, BACK + RD / 2, { cast: false });
  plane(RW, RD, lam({ map: TEX.plaster }), 0, RH, BACK + RD / 2, 0, Math.PI / 2);
  const skirt = lam({ color: '#5a3a26' });
  box(ARCH.x0 - LEFT, .08, .03, skirt, (LEFT + ARCH.x0) / 2, .04, BACK + .015); box(.03, .08, RD, skirt, LEFT + .015, .04, BACK + RD / 2); box(.03, .08, RD, skirt, RIGHT - .015, .04, BACK + RD / 2);
  // arch trim + the next room: dim, a TV glowing on New Year's Eve
  const trim = lam({ color: '#c9b79a' });
  box(.06, ARCH.h - r, .1, trim, ARCH.x0 - .03, (ARCH.h - r) / 2, BACK + .02); box(.06, ARCH.h - r, .1, trim, ARCH.x1 + .03, (ARCH.h - r) / 2, BACK + .02);
  const nx = (ARCH.x0 + ARCH.x1) / 2, nz0 = BACK - 1.6, dim = lam({ map: rep(TEX.wallpaper, 3, 4), color: '#9a8c80' });
  plane(2.2, RH, dim, nx, RH / 2, nz0); plane(1.6, RH, dim, nx - 1.1, RH / 2, BACK - .8, Math.PI / 2); plane(1.6, RH, dim, nx + 1.1, RH / 2, BACK - .8, -Math.PI / 2);
  plane(2.2, 1.6, lam({ map: rep(TEX.floorWood, 3, 2) }), nx, .001, BACK - .8, 0, -Math.PI / 2); plane(2.2, 1.6, lam({ map: TEX.plaster }), nx, RH, BACK - .8, 0, Math.PI / 2);
  const tv = new THREE.Group(); tv.position.set(nx, 0, nz0 + .35); scene.add(tv);
  box(.7, .45, .4, lam({ map: TEX.wood }), 0, .22, 0, { parent: tv }); box(.56, .44, .44, lam({ color: '#3a3438' }), 0, .67, 0, { parent: tv });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.42, .31), basic({ map: TEX.tv })); scr.position.set(0, .68, .225); tv.add(scr);
  // ковёр на стене
  plane(2.3, 1.45, lam({ map: TEX.rug }), 0, 1.5, BACK + .01);
  // диван
  const sofa = lam({ map: TEX.sofa });
  box(2.3, .42, .7, sofa, 0, .21, -1.78); box(2.3, .55, .18, sofa, 0, .62, -2.08); box(.16, .56, .72, sofa, -1.2, .28, -1.78); box(.16, .56, .72, sofa, 1.2, .28, -1.78);
  // стол
  const wood = lam({ map: TEX.wood }), cloth = lam({ map: TEX.cloth });
  box(1.9, .05, .95, cloth, 0, .74, -.85);
  box(1.9, .16, .02, cloth, 0, .66, -.37); box(1.9, .16, .02, cloth, 0, .66, -1.33); box(.02, .16, .95, cloth, -.96, .66, -.85); box(.02, .16, .95, cloth, .96, .66, -.85);
  [[-.85, -.45], [.85, -.45], [-.85, -1.25], [.85, -1.25]].forEach(([x, z]) => box(.06, .58, .06, wood, x, .29, z));
  [[-1.32, -.85], [1.32, -.85]].forEach(([x, z]) => { box(.38, .05, .38, wood, x, .44, z); [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15]].forEach(([a, b]) => box(.04, .42, .04, wood, x + a, .21, z + b)); });
  // еда: кастрюля оливье по центру, как положено
  const metal = lam({ map: TEX.metal }), white = lam({ color: '#f2efe6' });
  cyl(.17, .16, .22, 14, metal, 0, .88, -.85, null, true); cyl(.165, .165, .005, 14, lam({ map: TEX.olivier }), 0, .97, -.85);
  cyl(.17, .17, .012, 14, lam({ color: '#9aa0a6' }), 0, .99, -.85, null, true);
  [[-.2, 0], [.2, 0]].forEach(([dx]) => box(.05, .02, .05, lam({ color: '#6a6e74' }), dx, .95, -.85));
  [[-.55, -.62], [.55, -.62], [-.45, -1.08], [.45, -1.08], [-.78, -.85], [.78, -.85]].forEach(([x, z]) => cyl(.1, .09, .012, 12, white, x, .772, z));
  cyl(.13, .09, .07, 12, lam({ color: '#e9e2cf' }), -.42, .8, -.62); cyl(.12, .12, .005, 12, lam({ map: TEX.olivier }), -.42, .832, -.62);
  cyl(.12, .12, .05, 12, lam({ map: TEX.shuba }), .42, .79, -.62);
  const mand = lam({ color: '#f08a1e' });
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.035, 1), mand); m.position.set(-.25 + (i % 3) * .06, .8 + (i > 2 ? .04 : 0), -1.1 + (i > 2 ? .02 : 0)); m.castShadow = true; scene.add(m); }
  const bottle = lam({ color: '#1f4a2a' }), label = lam({ color: '#e9dfc4' });
  cyl(.045, .045, .24, 10, bottle, .28, .89, -1.05); cyl(.016, .03, .1, 10, bottle, .28, 1.05, -1.05); cyl(.046, .046, .08, 10, label, .28, .88, -1.05);
  const lying = cyl(.04, .04, .22, 10, lam({ color: '#d9d4c4' }), -.62, .79, -1.12); lying.rotation.z = Math.PI / 2; lying.rotation.y = .5;
  const glass = lam({ color: '#cfe8ff', transparent: true, opacity: .5 });
  [[-.5, -.5], [.5, -.5], [-.3, -1.22], [.62, -1.2]].forEach(([x, z]) => cyl(.025, .02, .1, 8, glass, x, .82, z));
  // окно, батарея, подоконник
  const wz = -.35, wy = 1.45;
  plane(1.15, 1.2, basic({ map: TEX.window }), LEFT + .012, wy, wz, Math.PI / 2);
  const frame = lam({ color: '#e8e4da' });
  box(.06, 1.3, .07, frame, LEFT + .03, wy, wz - .6); box(.06, 1.3, .07, frame, LEFT + .03, wy, wz + .6); box(.06, .07, 1.27, frame, LEFT + .03, wy + .63, wz); box(.06, .05, 1.2, frame, LEFT + .03, wy, wz); box(.06, 1.2, .05, frame, LEFT + .03, wy, wz);
  box(.22, .05, 1.35, frame, LEFT + .1, wy - .63, wz);
  box(.1, .45, .95, lam({ map: TEX.radiator }), LEFT + .08, .42, wz);
  cyl(.07, .06, .12, 8, lam({ color: '#b8653b' }), LEFT + .1, wy - .55, wz - .3);
  for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(.025, .16, 5), lam({ color: '#4d8a3e' })); sp.position.set(LEFT + .1 + (i - 2) * .02, wy - .43, wz - .3); sp.rotation.z = (i - 2) * .25; scene.add(sp); }
  // ёлка
  const tree = new THREE.Group(); tree.position.set(-1.95, 0, -1.75); scene.add(tree);
  box(.16, .2, .16, lam({ color: '#8a5a3a' }), 0, .1, 0, { parent: tree });
  const green = lam({ color: '#2f6b3a' });
  [[.42, .45, .35], [.34, .4, .65], [.25, .36, .92], [.15, .3, 1.15]].forEach(([rr, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(rr, h, 8), green); c.position.y = y; c.castShadow = true; tree.add(c); });
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(.06, 0), basic({ color: '#ffd46a' })); star.position.y = 1.34; tree.add(star); BLINKERS.push({ m: star, kind: 'spin' });
  const cols = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff'];
  for (let i = 0; i < 16; i++) { const a = i * 2.4, y = .3 + (i / 16) * .9, rr = .38 * (1 - (y - .2) / 1.1) + .03; const b = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), basic({ color: cols[i % 5] })); b.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); tree.add(b); BLINKERS.push({ m: b, kind: 'bulb', c: new THREE.Color(cols[i % 5]), p: i }); }
  // компьютерный угол
  const desk = new THREE.Group(); desk.position.set(2.05, 0, .55); desk.rotation.y = -Math.PI / 2.6; scene.add(desk);
  box(1, .04, .55, wood, 0, .74, 0, { parent: desk }); box(.04, .72, .5, wood, -.46, .36, 0, { parent: desk }); box(.04, .72, .5, wood, .46, .36, 0, { parent: desk });
  const beige = lam({ map: TEX.beige });
  box(.42, .36, .36, beige, 0, .98, -.08, { parent: desk }); box(.28, .06, .2, beige, 0, .79, -.08, { parent: desk });
  const mon = new THREE.Mesh(new THREE.PlaneGeometry(.34, .26), basic({ map: TEX.monitor })); mon.position.set(0, .99, .101); desk.add(mon);
  box(.36, .02, .12, beige, 0, .77, .15, { parent: desk });
  box(.45, .06, .45, lam({ color: '#2a2a2e' }), 0, .46, .5, { parent: desk }); box(.45, .5, .05, lam({ color: '#2a2a2e' }), 0, .74, .72, { parent: desk });
  // плафон на потолке
  cyl(.44, .44, .03, 16, lam({ color: '#7a5a3a' }), 0, RH - .015, -.85);
  const plaf = cyl(.4, .36, .07, 16, basic({ color: '#fff3d6' }), 0, RH - .05, -.85);
  // бумажные фонарики на леске, как на той карте
  const cord = lam({ color: '#222' });
  [-.35, -1.35].forEach((z, row) => {
    cyl(.006, .006, RW - .2, 4, cord, 0, RH - .18, z).rotation.z = Math.PI / 2;
    for (let i = 0; i < 9; i++) {
      const x = LEFT + .45 + i * .54 + row * .25, c = cols[(i + row * 2) % 5];
      const lan = cyl(.055, .055, .17, 8, basic({ color: c, transparent: true, opacity: .9 }), x, RH - .3, z);
      cyl(.058, .058, .015, 8, lam({ color: '#333' }), x, RH - .21, z); cyl(.058, .058, .015, 8, lam({ color: '#333' }), x, RH - .39, z);
      lan.rotation.z = (rnd() - .5) * .25;
    }
  });
}

/* ---- lights: warm and soft, like a baked lightmap ---- */
const LIGHTS = {};
function buildLights() {
  scene.add(new THREE.HemisphereLight('#fff1dc', '#5a4638', .55));
  const lamp = new THREE.PointLight('#ffe2b0', 1.2, 9, 1.3);
  lamp.position.set(0, RH - .35, -.75); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.002; lamp.shadow.radius = 5; scene.add(lamp);
  const win = new THREE.PointLight('#7f98ff', .45, 4, 1.5); win.position.set(LEFT + .5, 1.4, -.35); scene.add(win);
  LIGHTS.tv = new THREE.PointLight('#7a9aff', .7, 2.8, 1.4); LIGHTS.tv.position.set((ARCH.x0 + ARCH.x1) / 2, .8, BACK - 1); scene.add(LIGHTS.tv);
  LIGHTS.mon = new THREE.PointLight('#cfeccf', .4, 2, 1.5); LIGHTS.mon.position.set(1.7, 1.05, .75); scene.add(LIGHTS.mon);
  LIGHTS.tree = new THREE.PointLight('#ff9a5a', .35, 2, 1.5); LIGHTS.tree.position.set(-1.8, .8, -1.5); scene.add(LIGHTS.tree);
  const front = new THREE.PointLight('#ffd6a0', .45, 5, 1.4); front.position.set(0, 1.4, 1.8); scene.add(front);
}

/* ---- the nick, built from blocks ---- */
const GLYPHS = {
  D: ['1111.', '1...1', '1...1', '1...1', '1...1', '1...1', '1111.'], v: ['.....', '.....', '1...1', '1...1', '1...1', '.1.1.', '..1..'],
  e: ['.....', '.....', '.111.', '1...1', '11111', '1....', '.1111'], r: ['.....', '.....', '1.11.', '11..1', '1....', '1....', '1....'],
  k: ['1....', '1....', '1..1.', '1.1..', '11...', '1.1..', '1..1.'], a: ['.....', '.....', '.111.', '....1', '.1111', '1...1', '.1111'],
  S: ['.1111', '1....', '1....', '.111.', '....1', '....1', '1111.'], K: ['1...1', '1..1.', '1.1..', '11...', '1.1..', '1..1.', '1...1'],
};
const NICK = 'DverkaSK', VOX = .06, NICK_Z = .72;
const LETTER_TOPS = [];
function buildNick() {
  const cubes = [[], []], total = NICK.length * 6 * VOX - VOX, x0 = -total / 2;
  [...NICK].forEach((ch, li) => {
    const G = GLYPHS[ch], lx = x0 + li * 6 * VOX;
    G.forEach((row, ry) => [...row].forEach((c, cx) => { if (c === '1') for (let dz = 0; dz < 2; dz++) cubes[li >= 6 ? 1 : 0].push([lx + cx * VOX + VOX / 2, (6 - ry) * VOX + VOX / 2, NICK_Z + dz * VOX]); }));
    let best = null;
    for (let cx = 0; cx < 5; cx++) { let top = -1; for (let ry = 0; ry < 7; ry++) if (G[ry][cx] === '1') { top = 7 - ry; break; } if (top > 0) { const sc = top * 10 - Math.abs(cx - 2); if (!best || sc > best.sc) best = { sc, x: lx + cx * VOX + VOX / 2, y: top * VOX }; } }
    LETTER_TOPS.push({ x: best.x, y: best.y, z: NICK_Z + VOX / 2 });
  });
  const mats = [lam({ color: '#ffc861', emissive: '#4a2606' }), lam({ color: '#ff7a59', emissive: '#4a1608' })];
  cubes.forEach((list, i) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(VOX * .96, VOX * .96, VOX * .96), mats[i], list.length);
    const mm = new THREE.Matrix4(); list.forEach((p, j) => { mm.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(j, mm); });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  });
}
