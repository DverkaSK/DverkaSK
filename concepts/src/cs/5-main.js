/* ================= RENDER LOOP ================= */
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(42, 1, .1, 50);
const CAM = { y: 1.8, z: 3.85, look: new THREE.Vector3(0, .6, -.5), px: 0, py: 0, dist: 1 };

function resize() {
  const a = innerWidth / innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = a; CAM.dist = Math.max(1, Math.min(1.9, 1.5 / a)); camera.fov = a < 1 ? 52 : 42; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ---- bubbles ---- */
const mb = $('#m-bubble'); let mbT = 0;
function say(text, s = 2.2) { mb.textContent = text; mb.classList.add('on'); mbT = s; }
function project(p, dy) { const v = p.clone(); v.y += dy; v.project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; }

/* ---- pointer ---- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let pointerIn = false, hoverSaid = 0;
canvas.addEventListener('pointermove', e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pointerIn = true; CAM.px = ndc.x; CAM.py = ndc.y; });
canvas.addEventListener('pointerleave', () => { pointerIn = false; });
const CLICK_LINES = ['Тук-тук!', 'Туда пока нельзя. Скоро!', 'Там темно… но уютно', 'Эй, щекотно!', 'Я Дверка!', 'Скрип-скрип'];
canvas.addEventListener('click', e => {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  if (ray.intersectObject(DV.hit).length) {
    say(CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)]); MV.spin = Math.PI * 2; MV.squash = .7;
    FACE.userData.s.mood = 'grin'; drawFace(); setTimeout(() => { FACE.userData.s.mood = 'smile'; drawFace(); }, 900);
    $('#hint').hidden = true;
  }
});

let last = performance.now(), tickWin = 0, tickTv = 0, tickMon = 0, faceT = 2;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  if (pointerIn) { ray.setFromCamera(ndc, camera); DV.hover = ray.intersectObject(DV.hit).length > 0; } else DV.hover = false;
  canvas.classList.toggle('hot', DV.hover);
  if (DV.hover && now - hoverSaid > 6000) { hoverSaid = now; say('Скри-и-ип… там пока темно'); FACE.userData.s.mood = 'o'; drawFace(); }
  if (!DV.hover && FACE.userData.s.mood === 'o') { FACE.userData.s.mood = 'smile'; drawFace(); }
  updateMascot(dt, t);
  faceT -= dt; if (faceT < 0) { FACE.userData.s.blink = true; drawFace(); setTimeout(() => { FACE.userData.s.blink = false; drawFace(); }, 120); faceT = 2 + Math.random() * 3; }
  const sway = reduce ? 0 : Math.sin(t * .25) * .05;
  camera.position.set((CAM.px * .4 + sway) * CAM.dist, CAM.y + CAM.py * .15 + (CAM.dist - 1) * .6, CAM.z * CAM.dist);
  camera.lookAt(CAM.look);
  BLINKERS.forEach(b => {
    if (b.kind === 'bulb') b.m.material.color.copy(b.c).multiplyScalar(Math.sin(t * 2.2 + b.p * 1.7) > -.2 ? 1 : .25);
    else if (b.kind === 'spin') b.m.rotation.y = t;
  });
  LIGHTS.tv.intensity = .6 + Math.random() * .2; LIGHTS.tree.intensity = .3 + Math.sin(t * 2.2) * .1;
  if ((tickWin -= dt) < 0) { tickWin = .09; drawWindow(t); }
  if ((tickTv -= dt) < 0) { tickTv = .12; drawTV(t); }
  if ((tickMon -= dt) < 0) { tickMon = .35; drawMonitor(t); }
  updateGuests(dt, t);
  mbT -= dt; if (mbT <= 0) mb.classList.remove('on');
  const [mx, my] = project(DV.root.position, .46); mb.style.left = mx + 'px'; mb.style.top = my + 'px';
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

buildRoom(); buildLights(); buildNick(); buildGuests(); buildMascot();
GUESTS.forEach(G => { const b = document.createElement('div'); b.className = 'bubble small'; $('#c-bubbles').appendChild(b); G.bubble = b; });
resize(); drawWindow(0); drawTV(0); drawMonitor(0);
$('#boot').hidden = true;
setTimeout(() => say('Привет! Я Дверка', 3), 600);
requestAnimationFrame(frame);
