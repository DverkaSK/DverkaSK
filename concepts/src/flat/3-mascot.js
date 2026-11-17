/* ================= DVERKA — the little door ================= */
const FACE = canvasTex(16, 24, () => {});
FACE.userData.s = { blink: false, look: 0, mood: 'smile' };
function drawFace() {
  const { g, s } = FACE.userData;
  px(g, 0, 0, 16, 24, '#e08f4f'); px(g, 0, 0, 16, 1, '#f0a868'); px(g, 0, 0, 1, 24, '#f0a868'); px(g, 15, 0, 1, 24, '#a85a2a');
  px(g, 3, 15, 10, 1, '#b8662f'); px(g, 3, 15, 1, 7, '#b8662f'); px(g, 3, 21, 10, 1, '#f0a868'); px(g, 12, 15, 1, 7, '#f0a868');
  if (s.blink) { px(g, 3, 7, 4, 1, '#3a1f10'); px(g, 9, 7, 4, 1, '#3a1f10'); }
  else {
    px(g, 3, 4, 4, 5, '#fffaf0'); px(g, 9, 4, 4, 5, '#fffaf0');
    const lx = s.look; px(g, 4 + lx, 5, 2, 3, '#21140d'); px(g, 10 + lx, 5, 2, 3, '#21140d'); px(g, 4 + lx, 5, 1, 1, '#fff'); px(g, 10 + lx, 5, 1, 1, '#fff');
  }
  px(g, 1, 10, 3, 1, '#ff8a7a'); px(g, 12, 10, 3, 1, '#ff8a7a');
  if (s.mood === 'o') { px(g, 7, 10, 2, 3, '#6b2a24'); }
  else if (s.mood === 'grin') { px(g, 5, 10, 6, 1, '#6b2a24'); px(g, 6, 11, 4, 1, '#6b2a24'); }
  else { px(g, 6, 11, 4, 1, '#6b2a24'); px(g, 5, 10, 1, 1, '#6b2a24'); px(g, 10, 10, 1, 1, '#6b2a24'); }
  px(g, 12, 13, 2, 2, '#ffd23a'); px(g, 12, 13, 1, 1, '#fff3b0');
  FACE.needsUpdate = true;
}
const VOID = canvasTex(16, 24, (g) => {
  for (let y = 0; y < 24; y++) px(g, 0, y, 16, 1, `rgb(${4 + y * .3 | 0},${3 + y * .2 | 0},${10 + y * .6 | 0})`);
  for (let i = 0; i < 8; i++) { const k = i / 8, w = 2 + k * 12 | 0, y = 9 + k * 15 | 0; px(g, 8 - w / 2 | 0, y, 1, 1, `rgba(150,130,220,${(.08 + k * .25).toFixed(2)})`); px(g, 8 + w / 2 | 0, y, 1, 1, `rgba(150,130,220,${(.08 + k * .25).toFixed(2)})`); }
  px(g, 7, 8, 2, 1, 'rgba(255,220,160,.35)');
});

const DV = { root: new THREE.Group(), body: new THREE.Group(), leafPivot: new THREE.Group(), legs: [], open: 0, hover: false };
function buildMascot() {
  const wood = lam({ color: '#c8773c' }), dark = lam({ color: '#6b3a1c' }), sole = lam({ color: '#4a2a14' });
  const W = .22, H = .3, T = .07, P = .026, base = .055;
  DV.root.add(DV.body);
  box(P, H, T, dark, -W / 2 + P / 2, base + H / 2, 0, { parent: DV.body });
  box(P, H, T, dark, W / 2 - P / 2, base + H / 2, 0, { parent: DV.body });
  box(W + .02, P + .005, T + .01, dark, 0, base + H - P / 2 + .003, 0, { parent: DV.body });
  box(W, .015, T, dark, 0, base + .007, 0, { parent: DV.body });
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * P, H - P - .015), basic({ map: VOID })); hole.position.set(0, base + (H - P + .015) / 2, -.02); DV.body.add(hole);
  box(W - 2 * P, H - P - .015, .01, basic({ color: '#05030a' }), 0, base + (H - P + .015) / 2, -.03, { parent: DV.body, cast: false });
  // the leaf, hinged on the left
  const lw = W - 2 * P - .004, lh = H - P - .017;
  DV.leafPivot.position.set(-lw / 2, base + .015 + lh / 2, .012); DV.body.add(DV.leafPivot);
  const mats = [wood, wood, wood, wood, lam({ map: FACE }), wood];
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, .025), mats); leaf.position.x = lw / 2; leaf.castShadow = true; DV.leafPivot.add(leaf);
  // arms & legs
  [-1, 1].forEach(sx => {
    const arm = new THREE.Group(); arm.position.set(sx * (W / 2 + .01), base + .16, 0); DV.body.add(arm);
    box(.018, .07, .018, dark, 0, -.035, 0, { parent: arm }); arm.rotation.z = sx * .35; DV[sx < 0 ? 'armL' : 'armR'] = arm;
    const leg = new THREE.Group(); leg.position.set(sx * .05, base, 0); DV.root.add(leg);
    box(.024, base, .024, dark, 0, -base / 2, 0, { parent: leg }); box(.04, .02, .055, sole, 0, -base + .01, .012, { parent: leg });
    DV.legs.push(leg);
  });
  const hit = new THREE.Mesh(new THREE.BoxGeometry(.42, .5, .3), basic({ visible: false })); hit.position.y = .2; DV.root.add(hit); DV.hit = hit;
  DV.root.position.set(.4, 0, 1.15); scene.add(DV.root);
  drawFace();
}

/* ---- movement brain: run, pause, parkour over the letters ---- */
const ZONES = { front: { x: [-1.9, 1.9], z: [.98, 1.3] }, mid: { x: [-1.5, 1.2], z: [-.2, .48] } };
const MV = { mode: 'pause', t: .8, target: null, zone: 'front', vx: 0, vz: 0, phase: 0, jump: null, queue: [], rot: 0, squash: 1, spin: 0 };
const rand = (a, b) => a + Math.random() * (b - a);
function randPoint(zone) { const Z = ZONES[zone]; return new THREE.Vector3(rand(Z.x[0], Z.x[1]), 0, rand(Z.z[0], Z.z[1])); }
function planNext() {
  const p = DV.root.position, roll = Math.random();
  if (roll < .38) { // letter parkour
    const dir = Math.random() < .5 ? 1 : -1, tops = dir > 0 ? LETTER_TOPS : LETTER_TOPS.slice().reverse();
    const startZ = MV.zone === 'front' ? 1.0 : .48;
    MV.target = new THREE.Vector3(tops[0].x - dir * .35, 0, startZ); MV.mode = 'walk';
    MV.queue = tops.map(t => ({ to: new THREE.Vector3(t.x, t.y, t.z), h: .16 }));
    const land = MV.zone === 'front' ? 'mid' : 'front';
    const end = randPoint(land); end.x = Math.max(ZONES[land].x[0], Math.min(ZONES[land].x[1], tops[tops.length - 1].x + dir * .3)); MV.queue.push({ to: end, h: .2, zone: land });
  } else if (roll < .55) { // hop over the sign to the other side
    const other = MV.zone === 'front' ? 'mid' : 'front', q = randPoint(other);
    q.x = Math.max(-1.6, Math.min(1.6, p.x + rand(-.3, .3)));
    MV.queue = [{ to: q, h: .75, zone: other }]; MV.mode = 'hopnext';
  } else { MV.target = randPoint(MV.zone); MV.mode = 'walk'; MV.fast = Math.random() < .35; }
}
function startJump(j) {
  const from = DV.root.position.clone();
  MV.jump = { from, to: j.to, h: Math.max(from.y, j.to.y) + j.h, t: 0, d: .22 + from.distanceTo(j.to) * .38, zone: j.zone };
  MV.mode = 'jump';
}
function updateMascot(dt, t) {
  const p = DV.root.position;
  let moving = false;
  if (DV.hover) {
    MV.vx = MV.vz = 0;
    MV.rot += (0 - MV.rot) * Math.min(1, dt * 12);
  } else if (MV.mode === 'walk') {
    const dx = MV.target.x - p.x, dz = MV.target.z - p.z, d = Math.hypot(dx, dz);
    const sp = MV.fast ? 3.1 : 2.1;
    if (d < .04) { MV.mode = MV.queue.length ? 'hopnext' : 'pause'; MV.t = rand(.25, 1.4); MV.vx = MV.vz = 0; MV.squash = .85; }
    else {
      const k = Math.min(1, dt * 10);
      MV.vx += (dx / d * Math.min(sp, d * 8) - MV.vx) * k; MV.vz += (dz / d * Math.min(sp, d * 8) - MV.vz) * k;
      p.x += MV.vx * dt; p.z += MV.vz * dt; moving = true;
      MV.rot = lerpAngle(MV.rot, Math.atan2(MV.vx, MV.vz), Math.min(1, dt * 14));
    }
  } else if (MV.mode === 'hopnext') {
    MV.t -= dt; if (MV.t <= 0 || MV.t === undefined) startJump(MV.queue.shift());
  } else if (MV.mode === 'jump') {
    const J = MV.jump; J.t += dt / J.d; const k = Math.min(1, J.t);
    p.x = J.from.x + (J.to.x - J.from.x) * k; p.z = J.from.z + (J.to.z - J.from.z) * k;
    const base = J.from.y + (J.to.y - J.from.y) * k;
    p.y = base + Math.sin(k * Math.PI) * (J.h - Math.max(J.from.y, J.to.y) + Math.abs(J.to.y - J.from.y) * .5);
    MV.rot = lerpAngle(MV.rot, Math.atan2(J.to.x - J.from.x, J.to.z - J.from.z || .001), Math.min(1, dt * 16));
    if (k >= 1) {
      p.copy(J.to); MV.squash = .7; if (J.zone) MV.zone = J.zone;
      if (MV.queue.length) { MV.mode = 'hopnext'; MV.t = .06; } else { MV.mode = 'pause'; MV.t = rand(.3, 1); }
    }
  } else if (MV.mode === 'pause') {
    MV.t -= dt; MV.rot = lerpAngle(MV.rot, Math.sin(t * .7) * .6, dt * 2);
    if (MV.t <= 0) planNext();
  }
  // pose
  const inAir = MV.mode === 'jump';
  if (moving) MV.phase += dt * Math.hypot(MV.vx, MV.vz) * 16;
  const sw = moving ? Math.sin(MV.phase) * .9 : inAir ? .5 : 0;
  DV.legs[0].rotation.x = sw; DV.legs[1].rotation.x = inAir ? .5 : -sw;
  DV.armL.rotation.x = -sw * .8; DV.armR.rotation.x = sw * .8;
  DV.armR.rotation.z = DV.hover ? -1.9 + Math.sin(t * 14) * .35 : .35;
  MV.squash += (1 - MV.squash) * Math.min(1, dt * 10);
  const bob = moving ? Math.abs(Math.sin(MV.phase)) * .025 : Math.sin(t * 3) * .004;
  DV.body.position.y = bob;
  DV.body.scale.set(1 / Math.sqrt(MV.squash), MV.squash * (inAir ? 1.06 : 1), 1 / Math.sqrt(MV.squash));
  DV.body.rotation.x = moving ? .12 * Math.min(1, Math.hypot(MV.vx, MV.vz) / 2) : 0;
  MV.spin = Math.max(0, MV.spin - dt * 12);
  DV.root.rotation.y = MV.rot + MV.spin;
  // the door creaks open on hover
  DV.open += ((DV.hover ? 1 : 0) - DV.open) * Math.min(1, dt * 7);
  DV.leafPivot.rotation.y = -1.15 * DV.open;
}
function lerpAngle(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }
