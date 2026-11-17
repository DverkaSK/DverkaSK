/* ================= THE FLAT ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d0b12');
const lam = (o) => new THREE.MeshLambertMaterial(o);
const basic = (o) => new THREE.MeshBasicMaterial(o);
const BLINKERS = []; // emissive bits that twinkle
/* soft additive halo so lights feel warm instead of flat */
const GLOW_TEX = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();
function glow(parent, color, size, opacity, x = 0, y = 0, z = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); return s;
}

function box(w, h, d, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = opts.cast !== false; m.receiveShadow = true;
  (opts.parent || scene).add(m); return m;
}
function cyl(rt, rb, h, seg, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m;
}
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; scene.add(m); return m;
}

const RW = 5.2, RD = 4.6, RH = 2.6, BACK = -2.2, LEFT = -RW / 2, RIGHT = RW / 2, FRONT = BACK + RD;

function buildRoom() {
  // floor slab — the diorama's cut edge
  box(RW + .24, .3, RD + .12, lam({ color: '#2a2230' }), 0, -.15, BACK + RD / 2 - .06, { cast: false });
  const floor = plane(RW, RD, lam({ map: TEX.lino }), 0, .001, BACK + RD / 2, 0, -Math.PI / 2);
  plane(2.6, 1.7, lam({ map: TEX.rug }), 0, .004, -.85, 0, -Math.PI / 2); // floor rug under the table
  // walls (dark shells + papered inner faces)
  const shell = lam({ color: '#2e2630' }), paper = lam({ map: TEX.wallpaper });
  box(RW + .24, RH, .12, shell, 0, RH / 2, BACK - .06, { cast: false });
  box(.12, RH, RD, shell, LEFT - .06, RH / 2, BACK + RD / 2, { cast: false });
  box(.12, RH, RD, shell, RIGHT + .06, RH / 2, BACK + RD / 2, { cast: false });
  plane(RW, RH, paper, 0, RH / 2, BACK + .001);
  plane(RD, RH, paper, LEFT + .001, RH / 2, BACK + RD / 2, Math.PI / 2);
  plane(RD, RH, paper, RIGHT - .001, RH / 2, BACK + RD / 2, -Math.PI / 2);
  // skirting boards
  const skirt = lam({ color: '#5a3a26' });
  box(RW, .08, .03, skirt, 0, .04, BACK + .015); box(.03, .08, RD, skirt, LEFT + .015, .04, BACK + RD / 2); box(.03, .08, RD, skirt, RIGHT - .015, .04, BACK + RD / 2);
  // ceiling
  plane(RW, RD, lam({ map: TEX.ceiling }), 0, RH, BACK + RD / 2, 0, Math.PI / 2);

  // ковёр на стене
  plane(2.3, 1.45, lam({ map: TEX.rug }), 0, 1.5, BACK + .01);
  for (let i = 0; i < 24; i++) box(.02, .05, .01, lam({ color: '#e6d3a3' }), -1.12 + i * .097, .75, BACK + .015, { cast: false });

  // диван
  const sofa = lam({ map: TEX.sofa });
  box(2.3, .42, .7, sofa, 0, .21, -1.78); box(2.3, .55, .18, sofa, 0, .62, -2.08); box(.16, .56, .72, sofa, -1.2, .28, -1.78); box(.16, .56, .72, sofa, 1.2, .28, -1.78);
  box(.4, .3, .1, lam({ color: '#c9a24a' }), -.8, .55, -1.95).rotation.z = .15; // cushion

  // стол с новогодней скатертью
  const wood = lam({ map: TEX.wood }), cloth = lam({ map: TEX.cloth });
  box(1.9, .05, .95, cloth, 0, .74, -.85);
  box(1.9, .16, .02, cloth, 0, .66, -.37); box(1.9, .16, .02, cloth, 0, .66, -1.33); box(.02, .16, .95, cloth, -.96, .66, -.85); box(.02, .16, .95, cloth, .96, .66, -.85);
  [[-.85, -.45], [.85, -.45], [-.85, -1.25], [.85, -1.25]].forEach(([x, z]) => box(.06, .58, .06, wood, x, .29, z));
  // табуретки
  [[-1.32, -.85], [1.32, -.85]].forEach(([x, z]) => { box(.38, .05, .38, wood, x, .44, z); [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15]].forEach(([a, b]) => box(.04, .42, .04, wood, x + a, .21, z + b)); });

  // еда
  const white = lam({ color: '#f2efe6' }), glass = lam({ color: '#bfe3ff', transparent: true, opacity: .55 });
  [[-.55, -.62], [.55, -.62], [-.45, -1.08], [.45, -1.08], [-.78, -.85], [.78, -.85]].forEach(([x, z]) => cyl(.1, .09, .012, 10, white, x, .772, z));
  const bowl = cyl(.15, .1, .09, 10, lam({ color: '#e9e2cf' }), -.15, .81, -.85); cyl(.14, .14, .005, 10, lam({ map: TEX.olivier }), -.15, .855, -.85);
  box(.24, .07, .14, lam({ map: TEX.herring }), .25, .8, -.95);
  cyl(.13, .13, .012, 10, white, .28, .772, -.66);
  const mand = lam({ color: '#f08a1e' });
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.035, 0), mand); m.position.set(.22 + (i % 3) * .06 - (i > 5 ? .03 : 0), .8 + (i > 2 ? .04 : 0) + (i > 5 ? .04 : 0), -.66 + ((i / 3 | 0) % 2) * .04); m.castShadow = true; scene.add(m); }
  const bottleG = lam({ color: '#1f4a2a' });
  cyl(.045, .045, .24, 8, bottleG, .02, .89, -1.08); cyl(.016, .03, .1, 8, bottleG, .02, 1.05, -1.08); cyl(.018, .018, .03, 8, lam({ color: '#d9b650' }), .02, 1.11, -1.08);
  [[-.5, -.5], [.5, -.5], [-.35, -1.2], [.35, -1.2]].forEach(([x, z]) => cyl(.025, .02, .1, 8, glass, x, .82, z));
  cyl(.04, .04, .09, 8, lam({ color: '#f3e7c9' }), -.55, .82, -1.2); // candle
  const flame = cyl(.012, .02, .035, 6, basic({ color: '#ffcf5a' }), -.55, .885, -1.2); BLINKERS.push({ m: flame, kind: 'flame', g: glow(scene, '#ffb347', .35, .55, -.55, .9, -1.2) });

  // окно, батарея, подоконник
  const wz = -.35, wy = 1.45;
  plane(1.15, 1.2, basic({ map: TEX.window }), LEFT + .012, wy, wz, Math.PI / 2);
  glow(scene, '#6f8cff', 1.3, .08, LEFT + .25, wy, wz);
  const frame = lam({ color: '#e8e4da' });
  box(.06, 1.3, .07, frame, LEFT + .03, wy, wz - .6); box(.06, 1.3, .07, frame, LEFT + .03, wy, wz + .6); box(.06, .07, 1.27, frame, LEFT + .03, wy + .63, wz); box(.06, .05, 1.2, frame, LEFT + .03, wy, wz);
  box(.06, 1.2, .05, frame, LEFT + .03, wy, wz);
  box(.22, .05, 1.35, frame, LEFT + .1, wy - .63, wz);
  box(.1, .45, .95, lam({ map: TEX.radiator }), LEFT + .08, .42, wz);
  box(.12, .06, .22, lam({ color: '#c0392b' }), LEFT + .09, .68, wz + .2); // носки сушатся
  cyl(.07, .06, .12, 8, lam({ color: '#b8653b' }), LEFT + .1, wy - .55, wz - .3);
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(.025, .16, 4), lam({ color: '#4d8a3e' })); s.position.set(LEFT + .1 + (i - 2) * .02, wy - .43, wz - .3 + (i % 2 ? .02 : -.02)); s.rotation.z = (i - 2) * .25; scene.add(s); }
  [[.2, .3], [-.25, -.2], [.35, -.35]].forEach(([dz, dy]) => { const f = plane(.09, .09, basic({ color: '#f5f5f5', transparent: true, opacity: .85 }), LEFT + .02, wy + dy, wz + dz, Math.PI / 2); f.rotation.z = .6; });

  // телевизор-кинескоп в углу
  const tv = new THREE.Group(); tv.position.set(-1.95, 0, -1.72); tv.rotation.y = Math.PI / 4.5; scene.add(tv);
  box(.62, .5, .45, wood, 0, .25, 0, { parent: tv });
  box(.56, .44, .46, lam({ color: '#3a3438' }), 0, .74, 0, { parent: tv });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.42, .31), basic({ map: TEX.tv })); scr.position.set(0, .75, .232); tv.add(scr); glow(tv, '#7a9aff', .9, .3, 0, .75, .3);
  box(.02, .2, .02, lam({ color: '#888' }), -.1, 1.04, 0, { parent: tv }).rotation.z = .4; box(.02, .2, .02, lam({ color: '#888' }), .1, 1.04, 0, { parent: tv }).rotation.z = -.4;

  // ёлка
  const tree = new THREE.Group(); tree.position.set(1.95, 0, -1.75); scene.add(tree);
  box(.16, .2, .16, lam({ color: '#8a5a3a' }), 0, .1, 0, { parent: tree });
  const green = lam({ color: '#2f6b3a' });
  [[.42, .45, .35], [.34, .4, .65], [.25, .36, .92], [.15, .3, 1.15]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), green); c.position.y = y; c.castShadow = true; tree.add(c); });
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(.06, 0), basic({ color: '#ffd46a' })); star.position.y = 1.34; tree.add(star); glow(star, '#ffd46a', .32, .5); BLINKERS.push({ m: star, kind: 'spin' });
  const cols = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff'];
  for (let i = 0; i < 16; i++) { const a = i * 2.4, y = .3 + (i / 16) * .9, r = .38 * (1 - (y - .2) / 1.1) + .03; const b = new THREE.Mesh(new THREE.SphereGeometry(.025, 5, 4), basic({ color: cols[i % 5] })); b.position.set(Math.cos(a) * r, y, Math.sin(a) * r); tree.add(b); BLINKERS.push({ m: b, kind: 'bulb', c: new THREE.Color(cols[i % 5]), p: i, g: glow(b, cols[i % 5], .13, .45) }); }

  // компьютерный угол — сычевальня
  const desk = new THREE.Group(); desk.position.set(2.05, 0, .55); desk.rotation.y = -Math.PI / 2.6; scene.add(desk);
  box(1, .04, .55, wood, 0, .74, 0, { parent: desk }); box(.04, .72, .5, wood, -.46, .36, 0, { parent: desk }); box(.04, .72, .5, wood, .46, .36, 0, { parent: desk });
  const beige = lam({ map: TEX.beige });
  box(.42, .36, .36, beige, 0, .98, -.08, { parent: desk }); box(.28, .06, .2, beige, 0, .79, -.08, { parent: desk });
  const mon = new THREE.Mesh(new THREE.PlaneGeometry(.34, .26), basic({ map: TEX.monitor })); mon.position.set(0, .99, .101); desk.add(mon); glow(desk, '#cfeccf', .8, .28, 0, .99, .2);
  box(.36, .02, .12, beige, 0, .77, .15, { parent: desk });
  box(.18, .4, .42, beige, .34, .96, -.05, { parent: desk });
  cyl(.035, .03, .08, 8, lam({ color: '#f3efe6' }), -.33, .8, .12, desk); // кружка
  box(.45, .06, .45, lam({ color: '#2a2a2e' }), 0, .46, .5, { parent: desk }); box(.45, .5, .05, lam({ color: '#2a2a2e' }), 0, .74, .72, { parent: desk }); cyl(.03, .03, .42, 6, lam({ color: '#555' }), 0, .22, .5, desk);

  // люстра
  cyl(.01, .01, .25, 4, lam({ color: '#999' }), 0, RH - .12, -.85);
  cyl(.2, .06, .08, 8, lam({ color: '#d9c7a0' }), 0, RH - .26, -.85);
  [0, 2.1, 4.2].forEach(a => { const b = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 4), basic({ color: '#fff1c9' })); b.position.set(Math.cos(a) * .17, RH - .31, -.85 + Math.sin(a) * .17); scene.add(b); glow(b, '#ffd9a0', .38, .45); });
  glow(scene, '#ffcf8a', 1.1, .08, 0, RH - .4, -.85);

  // гирлянда по стене
  const curve = new THREE.CatmullRomCurve3([-2.5, -1.5, -.5, .5, 1.5, 2.5].flatMap((x, i, arr) => i < arr.length - 1 ? [new THREE.Vector3(x, 2.4, BACK + .03), new THREE.Vector3(x + .5, 2.22, BACK + .03)] : [new THREE.Vector3(x, 2.4, BACK + .03)]));
  curve.getPoints(40).forEach((p, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.025, 5, 4), basic({ color: cols[i % 5] })); b.position.copy(p); scene.add(b); BLINKERS.push({ m: b, kind: 'bulb', c: new THREE.Color(cols[i % 5]), p: i, g: glow(b, cols[i % 5], .13, .4) }); });
  // мишура над ковром
  const tinsel = lam({ color: '#c9d4e0', emissive: '#223' });
  for (let i = 0; i < 30; i++) { const x = -1.2 + i * .083; box(.05, .04, .02, tinsel, x, 2.28 - Math.sin(i / 29 * Math.PI) * .12, BACK + .02, { cast: false }); }
}

/* ---- lights ---- */
const LIGHTS = {};
function buildLights() {
  scene.add(new THREE.AmbientLight('#6a5a78', .62));
  const lamp = new THREE.PointLight('#ffd49a', 1.25, 9, 1.4);
  lamp.position.set(0, RH - .4, -.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.002; lamp.shadow.radius = 4; scene.add(lamp);
  const win = new THREE.PointLight('#6f8cff', .55, 4, 1.5); win.position.set(LEFT + .5, 1.4, -.35); scene.add(win);
  LIGHTS.tv = new THREE.PointLight('#7a9aff', .45, 2.5, 1.5); LIGHTS.tv.position.set(-1.6, .9, -1.3); scene.add(LIGHTS.tv);
  LIGHTS.mon = new THREE.PointLight('#cfeccf', .5, 2.2, 1.5); LIGHTS.mon.position.set(1.7, 1.05, .75); scene.add(LIGHTS.mon);
  LIGHTS.tree = new THREE.PointLight('#ff9a5a', .35, 2, 1.5); LIGHTS.tree.position.set(1.8, .8, -1.5); scene.add(LIGHTS.tree);
  const front = new THREE.PointLight('#ffcf8a', .35, 5, 1.5); front.position.set(0, 1.6, 2.2); scene.add(front);
}

/* ---- the nickname, built from voxels ---- */
const GLYPHS = {
  D: ['1111.', '1...1', '1...1', '1...1', '1...1', '1...1', '1111.'],
  v: ['.....', '.....', '1...1', '1...1', '1...1', '.1.1.', '..1..'],
  e: ['.....', '.....', '.111.', '1...1', '11111', '1....', '.1111'],
  r: ['.....', '.....', '1.11.', '11..1', '1....', '1....', '1....'],
  k: ['1....', '1....', '1..1.', '1.1..', '11...', '1.1..', '1..1.'],
  a: ['.....', '.....', '.111.', '....1', '.1111', '1...1', '.1111'],
  S: ['.1111', '1....', '1....', '.111.', '....1', '....1', '1111.'],
  K: ['1...1', '1..1.', '1.1..', '11...', '1.1..', '1..1.', '1...1'],
};
const NICK = 'DverkaSK', VOX = .06, NICK_Z = .72;
const LETTER_TOPS = []; // landing spots on each letter
function buildNick() {
  const cubes = [[], []];
  const total = NICK.length * 6 * VOX - VOX, x0 = -total / 2;
  [...NICK].forEach((ch, li) => {
    const G = GLYPHS[ch], lx = x0 + li * 6 * VOX;
    G.forEach((row, ry) => [...row].forEach((c, cx) => {
      if (c !== '1') return;
      for (let dz = 0; dz < 2; dz++) cubes[li >= 6 ? 1 : 0].push([lx + cx * VOX + VOX / 2, (6 - ry) * VOX + VOX / 2, NICK_Z + dz * VOX]);
    }));
    // best landing column: tallest one nearest the middle
    let best = null;
    for (let cx = 0; cx < 5; cx++) { let top = -1; for (let ry = 0; ry < 7; ry++) if (G[ry][cx] === '1') { top = 7 - ry; break; } if (top > 0) { const score = top * 10 - Math.abs(cx - 2); if (!best || score > best.score) best = { score, x: lx + cx * VOX + VOX / 2, y: top * VOX }; } }
    LETTER_TOPS.push({ x: best.x, y: best.y, z: NICK_Z + VOX / 2 });
  });
  const mats = [lam({ color: '#ffc861', emissive: '#5a2e08' }), lam({ color: '#ff7a59', emissive: '#5a1a0a' })];
  cubes.forEach((list, i) => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(VOX * .96, VOX * .96, VOX * .96), mats[i], list.length);
    const m = new THREE.Matrix4(); list.forEach((p, j) => { m.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(j, m); });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  });
  const glow = new THREE.PointLight('#ffb65c', .5, 2.2, 1.5); glow.position.set(0, .5, NICK_Z + .5); scene.add(glow);
}

