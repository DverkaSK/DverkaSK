/* ================= SCENE: the desk and the old computer ================= */
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = false;
const scene = new THREE.Scene();
scene.background = col('#07060a');
THREE.RectAreaLightUniformsLib.init();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture;

const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ envMapIntensity: .12 }, o));
const add = (geo, mat, x, y, z, parent = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const RB = (w, h, d, r, s = 4) => new THREE.RoundedBoxGeometry(w, h, d, s, r);

/* a smooth tapered shell between rounded rectangles — the CRT's big back */
function rrPts(w, h, r, seg = 8) {
  const pts = [], cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]];
  cs.forEach(([cx, cy, a0]) => { for (let i = 0; i <= seg; i++) { const a = a0 + i / seg * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } });
  return pts;
}
function shell(loops, cap = true) {
  const pos = [], idx = [], n = rrPts(1, 1, .1).length;
  loops.forEach(L => rrPts(L.w, L.h, L.r).forEach(([x, y]) => pos.push(x, y + (L.dy || 0), L.z)));
  for (let l = 0; l < loops.length - 1; l++) for (let i = 0; i < n; i++) { const a = l * n + i, b = l * n + (i + 1) % n, c = (l + 1) * n + i, d = (l + 1) * n + (i + 1) % n; idx.push(a, c, b, b, c, d); }
  if (cap) { const L = loops[loops.length - 1], ci = pos.length / 3; pos.push(0, L.dy || 0, L.z); const base = (loops.length - 1) * n; for (let i = 0; i < n; i++) idx.push(base + i, ci, base + (i + 1) % n); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function rrShape(w, h, r, dy = 0, P = THREE.Shape) { const s = new P(); rrPts(w, h, r).forEach(([x, y], i) => i ? s.lineTo(x, y + dy) : s.moveTo(x, y + dy)); s.closePath(); return s; }

const M = {
  beige: std({ color: col('#d8ceb2'), roughness: .62, bumpMap: TEX.grain, bumpScale: .0012 }),
  beigeDark: std({ color: col('#c4b894'), roughness: .66, bumpMap: TEX.grain, bumpScale: .0012 }),
  key: std({ color: col('#e1d8c0'), roughness: .5 }),
  wood: new THREE.MeshPhysicalMaterial({ map: TEX.wood, roughness: .42, clearcoat: .55, clearcoatRoughness: .35, envMapIntensity: .15 }),
  dark: std({ color: col('#1b1a1d'), roughness: .5 }),
  brass: std({ color: col('#b08d4a'), roughness: .35, metalness: .8, envMapIntensity: .6 }),
  metal: std({ color: col('#9aa0a6'), roughness: .3, metalness: .9, envMapIntensity: .6 }),
  beigeShell: std({ color: col('#d8ceb2'), roughness: .62, bumpMap: TEX.grain, bumpScale: .0012, side: THREE.DoubleSide }),
  darkShell: std({ color: col('#1b1a1d'), roughness: .5, side: THREE.DoubleSide }),
  lampGreen: std({ color: col('#28453a'), roughness: .35, metalness: .6, envMapIntensity: .5 }),
};

const LEDS = {};
function buildRoom() {
  add(new THREE.PlaneGeometry(8, 4), std({ map: TEX.wallpaper, roughness: .9 }), 0, 1.6, -.46, scene, false);
  add(new THREE.PlaneGeometry(8, 6), std({ map: TEX.floor, roughness: .75 }), 0, 0, 1.5, scene, false).rotation.x = -Math.PI / 2;
  add(RB(8, .09, .02, .005, 2), std({ color: col('#3a2416'), roughness: .6 }), 0, .045, -.445);
}

function buildDesk() {
  const D = new THREE.Group(); scene.add(D);
  add(RB(1.52, .036, .74, .008), M.wood, 0, .722, -.08, D);
  // right pedestal with drawers
  add(RB(.44, .7, .68, .006), M.wood, .5, .352, -.1, D);
  [0, 1, 2].forEach(i => {
    const y = .6 - i * .215;
    add(RB(.4, .19, .02, .006), M.wood, .5, y, .245, D);
    add(RB(.08, .016, .02, .006, 2), M.brass, .5, y + .03, .262, D);
  });
  add(RB(.03, .7, .68, .006), M.wood, -.73, .352, -.1, D);
  add(RB(1.2, .38, .02, .006), M.wood, -.1, .5, -.43, D);
  add(RB(1.46, .04, .03, .006), M.wood, 0, .69, .26, D);
}

function buildComputer() {
  const PC = new THREE.Group(); PC.position.set(-.02, .74, -.12); scene.add(PC);
  // desktop case lying flat, the monitor sits on top of it
  add(RB(.46, .15, .44, .014), M.beige, 0, .075, 0, PC);
  const front = .221;
  add(RB(.44, .004, .01, .002, 2), M.beigeDark, 0, .1, front, PC);
  add(RB(.15, .028, .01, .004, 2), M.beigeDark, -.1, .105, front + .002, PC);
  add(new THREE.BoxGeometry(.1, .004, .006), M.dark, -.1, .106, front + .006, PC, false);
  add(RB(.02, .01, .01, .003, 2), M.beigeDark, -.035, .1, front + .004, PC);
  add(RB(.16, .03, .01, .004, 2), M.beigeDark, -.1, .05, front + .002, PC);
  add(new THREE.CircleGeometry(.004, 16), std({ color: col('#555') }), -.035, .05, front + .008, PC, false);
  add(RB(.05, .035, .014, .006, 3), M.beigeDark, .15, .05, front + .004, PC);
  add(RB(.022, .014, .012, .004, 2), M.beigeDark, .15, .105, front + .004, PC);
  LEDS.power = add(new THREE.CircleGeometry(.0035, 12), new THREE.MeshBasicMaterial({ color: col('#6dff6a') }), .09, .11, front + .007, PC, false);
  LEDS.hdd = add(new THREE.CircleGeometry(.0035, 12), new THREE.MeshBasicMaterial({ color: col('#ff3a2a') }), .09, .096, front + .007, PC, false);
  const turbo = add(new THREE.PlaneGeometry(.036, .018), new THREE.MeshBasicMaterial({ map: TEX.turbo, color: new THREE.Color(1.6, 1.6, 1.6) }), .06, .05, front + .008, PC, false);
  for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(.004, .07, .003), M.dark, .215 - i * .0001, .075, .15 - i * .03, PC, false).rotation.y = Math.PI / 2;

  // the monitor: a big 17" tube
  const MON = new THREE.Group(); MON.position.set(0, .15, .02); PC.add(MON);
  add(new THREE.CylinderGeometry(.13, .15, .022, 64), M.beige, 0, .011, -.1, MON);
  add(RB(.14, .05, .12, .02), M.beige, 0, .04, -.1, MON);
  const cy = .29;
  const body = add(shell([
    { w: .47, h: .43, r: .035, z: 0 }, { w: .468, h: .428, r: .04, z: -.035 }, { w: .44, h: .4, r: .055, z: -.12 },
    { w: .38, h: .345, r: .07, z: -.26, dy: -.01 }, { w: .31, h: .28, r: .075, z: -.38, dy: -.015 }, { w: .27, h: .24, r: .07, z: -.42, dy: -.015 },
  ]), M.beigeShell, 0, cy, .11, MON);
  for (let i = 0; i < 12; i++) add(RB(.012, .003, .12, .001, 1), M.dark, -.1 + i * .018, cy + .165, -.13, MON, false);
  // bezel with a screen-shaped hole
  const bs = rrShape(.47, .43, .035); bs.holes.push(rrShape(.37, .285, .03, .018, THREE.Path));
  const bezel = add(new THREE.ExtrudeGeometry(bs, { depth: .02, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 4, curveSegments: 8 }), M.beige, 0, cy + .0, .105, MON);
  add(shell([{ w: .37, h: .285, r: .03, z: 0, dy: .018 }, { w: .352, h: .27, r: .028, z: -.03, dy: .018 }], false), M.darkShell, 0, cy, .126, MON);
  // the tube: a gently bulging glass
  const sg = new THREE.PlaneGeometry(.355, .272, 40, 30), p = sg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / .1775, y = p.getY(i) / .136; p.setZ(i, .014 * (1 - x * x * .6) * (1 - y * y * .6)); }
  sg.computeVertexNormals();
  const screenMat = new THREE.MeshBasicMaterial({ map: TEX.screen, color: new THREE.Color(.95, .95, .95) });
  LEDS.screen = add(sg, screenMat, 0, cy + .018, .097, MON, false);
  const glass = add(sg.clone(), new THREE.MeshPhysicalMaterial({ color: col('#0a0c0e'), roughness: .06, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.4, clearcoat: 1 }), 0, cy + .018, .099, MON, false);
  // chin: badge, buttons, power LED
  add(new THREE.PlaneGeometry(.1, .018), std({ map: TEX.badge, roughness: .5 }), -.12, cy - .185, .134, MON, false);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(.006, .006, .006, 16), M.beigeDark, .07 + i * .025, cy - .187, .132, MON).rotation.x = Math.PI / 2;
  LEDS.mon = add(new THREE.CircleGeometry(.003, 12), new THREE.MeshBasicMaterial({ color: col('#7dff6a') }), .185, cy - .187, .136, MON, false);
  // the screen really lights the desk
  const rect = new THREE.RectAreaLight(col('#fff2dc'), 5.5, .35, .27);
  rect.position.set(0, cy + .018, .12); rect.lookAt(0, cy + .018, 2); MON.add(rect); LEDS.rect = rect;
  // speakers
  [-1, 1].forEach(s => {
    const S = new THREE.Group(); S.position.set(s * .38, 0, .02); S.rotation.y = -s * .18; PC.add(S);
    add(RB(.1, .15, .1, .012), M.beige, 0, .075, 0, S);
    add(new THREE.CircleGeometry(.032, 32), std({ color: col('#2a2724'), roughness: .9 }), 0, .085, .0505, S, false);
    add(new THREE.CircleGeometry(.012, 24), std({ color: col('#3a3632'), roughness: .6 }), 0, .085, .052, S, false);
  });
  return MON;
}

function buildDeskStuff() {
  // keyboard
  const KB = new THREE.Group(); KB.position.set(-.04, .745, .2); KB.rotation.x = .07; scene.add(KB);
  add(RB(.47, .026, .17, .008), M.beige, 0, .012, 0, KB);
  const keyGeo = RB(.022, .012, .022, .004, 2), keys = new THREE.InstancedMesh(keyGeo, M.key, 110), m4 = new THREE.Matrix4(), c = new THREE.Color();
  let k = 0;
  for (let r = 0; r < 5; r++) for (let i = 0; i < 20 && k < 110; i++) {
    if (i === 15) continue;
    const x = -.215 + i * .0235 + (r % 2) * .005, z = -.062 + r * .026;
    m4.makeTranslation(x, .03, z); keys.setMatrixAt(k, m4);
    const darkKey = i === 0 || i >= 16 || (r === 4 && i > 3 && i < 11);
    keys.setColorAt(k, c.copy(col(darkKey ? '#b9ae90' : '#e6dcc4'))); k++;
  }
  keys.count = k; keys.castShadow = true; keys.receiveShadow = true; KB.add(keys);
  const space = add(RB(.13, .012, .022, .004, 2), M.key, -.03, .03, .066, KB);
  // mouse on a pad, cable running to the case
  add(RB(.24, .004, .2, .006, 2), std({ map: TEX.mousepad, roughness: .8 }), .36, .742, .2);
  const mouse = add(new THREE.SphereGeometry(.03, 32, 24), M.beige, .37, .752, .22); mouse.scale.set(.85, .45, 1.25);
  add(new THREE.BoxGeometry(.001, .002, .02), M.dark, .37, .765, .2, scene, false);
  const cable = new THREE.CatmullRomCurve3([[.37, .752, .18], [.36, .75, .1], [.3, .745, .0], [.2, .75, -.08], [.15, .8, -.2]].map(a => new THREE.Vector3(...a)));
  add(new THREE.TubeGeometry(cable, 40, .003, 6), M.beigeDark, 0, 0, 0);
  // mug with tea
  const mugPts = [[0, 0], [.036, 0], [.04, .004], [.041, .09], [.038, .092], [.036, .088], [.035, .006], [0, .006]].map(([x, y]) => new THREE.Vector2(x, y));
  const mug = add(new THREE.LatheGeometry(mugPts, 48), std({ color: col('#e9e4da'), roughness: .25, envMapIntensity: .5 }), -.42, .74, .12);
  add(new THREE.CircleGeometry(.035, 32), std({ color: col('#5a2a10'), roughness: .1 }), -.42, .815, .12).rotation.x = -Math.PI / 2;
  const handle = add(new THREE.TorusGeometry(.024, .006, 12, 24, Math.PI * 1.15), mug.material, -.461, .785, .12); handle.rotation.z = Math.PI / 2 - .07;
  // instant noodles, lid half open
  const cupPts = [[0, 0], [.036, 0], [.048, .1], [.05, .102], [0, .102]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(cupPts, 48), std({ map: TEX.noodle, roughness: .55 }), -.58, .74, -.05);
  const lid = add(new THREE.CircleGeometry(.05, 32), std({ color: col('#e8e2d0'), roughness: .4, side: THREE.DoubleSide }), -.58, .86, -.085); lid.rotation.x = -Math.PI / 2 - .45;
  // floppies and a to-do sheet
  [[.2, .2, .3], [.24, .205, -.2]].forEach(([x, z, a], i) => {
    const F = new THREE.Group(); F.position.set(x - .02, .742 + i * .004, z - .02 + .13); F.rotation.y = a; scene.add(F);
    add(RB(.09, .003, .094, .002, 2), std({ color: col(i ? '#1f3f7a' : '#1a1a1c'), roughness: .5 }), 0, 0, 0, F);
    add(new THREE.BoxGeometry(.05, .0032, .03), M.metal, 0, 0, -.03, F, false);
    const lb = add(new THREE.PlaneGeometry(.06, .045), std({ map: TEX.floppyLabel, roughness: .8 }), 0, .0018, .02, F, false); lb.rotation.x = -Math.PI / 2;
  });
  const sheet = add(new THREE.PlaneGeometry(.16, .2), std({ map: TEX.paper, roughness: .9, side: THREE.DoubleSide }), -.6, .7405, .15, scene, false); sheet.rotation.x = -Math.PI / 2; sheet.rotation.z = .25;
  return { mug };
}

function buildLamp() {
  const L = new THREE.Group(); L.position.set(-.62, .74, -.3); L.rotation.y = -.5; scene.add(L);
  add(new THREE.CylinderGeometry(.07, .08, .02, 48), M.lampGreen, 0, .01, 0, L);
  const a1 = new THREE.Group(); a1.position.y = .02; a1.rotation.z = -.35; L.add(a1);
  add(new THREE.CylinderGeometry(.008, .008, .34, 16), M.metal, 0, .17, 0, a1);
  add(new THREE.SphereGeometry(.014, 16, 12), M.metal, 0, .34, 0, a1);
  const a2 = new THREE.Group(); a2.position.y = .34; a2.rotation.z = -1.55; a1.add(a2);
  add(new THREE.CylinderGeometry(.007, .007, .22, 16), M.metal, 0, .11, 0, a2);
  const head = new THREE.Group(); head.position.y = .22; head.rotation.z = -1.15; a2.add(head);
  const shadePts = [[.02, 0], [.03, .01], [.075, .1], [.078, .105]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(shadePts, 48), std({ color: col('#28453a'), roughness: .35, metalness: .6, side: THREE.DoubleSide, envMapIntensity: .5 }), 0, 0, 0, head);
  const bulb = add(new THREE.SphereGeometry(.022, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 1.6) }), 0, .06, 0, head, false);
  const spot = new THREE.SpotLight(col('#ffcf8a'), 2.2, 3, .75, .55, 1.4);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -.0004; spot.shadow.radius = 6;
  bulb.add(spot); const tgt = new THREE.Object3D(); tgt.position.set(0, .6, 0); head.add(tgt); spot.target = tgt;
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(col('#3a4a78'), col('#1a120c'), .35));
  const moon = new THREE.DirectionalLight(col('#7f95d8'), .35); moon.position.set(-3, 2.5, 1.5); scene.add(moon);
  const fill = new THREE.PointLight(col('#ffe0b8'), .25, 4, 2); fill.position.set(.6, 1.3, 1.2); scene.add(fill);
}
