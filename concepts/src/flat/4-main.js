/* ================= RENDER LOOP ================= */
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(40, 1, .1, 50);
const CAM = { x: 0, y: 1.85, z: 3.9, look: new THREE.Vector3(0, .55, -.45), px: 0, py: 0, dist: 1 };

/* ---- post-processing: dithering / palette / PS1 grain ---- */
const PAL = ['#0d0b12', '#2a1d2b', '#4a2c32', '#7a3b2e', '#a8552f', '#d88a3a', '#f2c14e', '#f3e7c9', '#9c8fa8', '#5b5670', '#2f3a5a', '#4f6fa3', '#3f6b3a', '#7aa15a', '#c0392b', '#e8a0a0']
  .map(h => { const c = new THREE.Color(h); return new THREE.Vector3(c.r, c.g, c.b); });
const POST = { rt: null, scene: new THREE.Scene(), cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
POST.mat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uMode: { value: 1 }, uTime: { value: 0 }, uPal: { value: PAL } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: [
    'uniform sampler2D tDiffuse; uniform vec2 uRes; uniform int uMode; uniform float uTime; uniform vec3 uPal[16];',
    'varying vec2 vUv;',
    'float b2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }',
    'float bayer4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }',
    'float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + b2(a); }',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 7.0) * 43758.5453); }',
    'void main() {',
    '  vec3 c = texture2D(tDiffuse, vUv).rgb;',
    '  vec2 p = floor(vUv * uRes);',
    '  if (uMode == 1) {',
    '    float L = 6.0;',
    '    c = floor(c * (L - 1.0) + bayer4(p)) / (L - 1.0);',
    '  } else if (uMode == 2) {',
    '    vec3 q = c + (bayer8(p) - 0.5) * 0.16;',
    '    vec3 best = uPal[0]; float bd = 1e9;',
    '    for (int i = 0; i < 16; i++) { vec3 e = (q - uPal[i]) * vec3(1.0, 1.2, 0.8); float dd = dot(e, e); if (dd < bd) { bd = dd; best = uPal[i]; } }',
    '    c = best;',
    '  } else if (uMode == 3) {',
    '    c += (hash(p) - 0.5) * 0.08;',
    '    float L = 14.0;',
    '    c = floor(c * (L - 1.0) + bayer4(p)) / (L - 1.0);',
    '  }',
    '  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);',
    '}',
  ].join('\n'),
  depthTest: false, depthWrite: false,
});
POST.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), POST.mat));
let styleMode = 1;
try { const v = localStorage.getItem('dverka.style'); if (v !== null && +v >= 0 && +v <= 3) styleMode = +v; } catch (e) {}
POST.mat.uniforms.uMode.value = styleMode;
function renderFrame() {
  if (styleMode === 0) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
  renderer.setRenderTarget(POST.rt); renderer.render(scene, camera);
  renderer.setRenderTarget(null); renderer.render(POST.scene, POST.cam);
}
document.querySelectorAll('#look button').forEach(b => {
  b.classList.toggle('on', +b.dataset.s === styleMode);
  b.addEventListener('click', () => {
    styleMode = +b.dataset.s; POST.mat.uniforms.uMode.value = styleMode; try { localStorage.setItem('dverka.style', styleMode); } catch (e) {}
    document.querySelectorAll('#look button').forEach(x => x.classList.toggle('on', x === b));
  });
});

/* low-res render blown up by a whole number, so every scene pixel is an even square */
const PIX = [270, 400, 560];
let pixLevel = 1;
try { const v = +localStorage.getItem('dverka.pix'); if (v >= 0 && v <= 2 && localStorage.getItem('dverka.pix') !== null) pixLevel = v; } catch (e) {}
function resize() {
  const a = innerWidth / innerHeight, dpr = devicePixelRatio || 1;
  const pw = innerWidth * dpr, ph = innerHeight * dpr;
  const k = Math.max(1, Math.round(ph / PIX[pixLevel]));
  const w = Math.ceil(pw / k), h = Math.ceil(ph / k);
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  canvas.style.width = (w * k / dpr) + 'px'; canvas.style.height = (h * k / dpr) + 'px';
  if (POST.rt) POST.rt.dispose();
  POST.rt = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  POST.mat.uniforms.tDiffuse.value = POST.rt.texture; POST.mat.uniforms.uRes.value.set(w, h);
  camera.aspect = a; CAM.dist = Math.max(1, Math.min(1.9, 1.5 / a)); camera.fov = a < 1 ? 50 : 40; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
document.querySelectorAll('#pix button').forEach(b => b.addEventListener('click', () => {
  pixLevel = +b.dataset.p; try { localStorage.setItem('dverka.pix', pixLevel); } catch (e) {}
  document.querySelectorAll('#pix button').forEach(x => x.classList.toggle('on', x === b)); resize();
}));
document.querySelector(`#pix button[data-p="${pixLevel}"]`).classList.add('on');

/* ---- bubbles ---- */
const mb = $('#m-bubble');
let mbT = 0;
function say(text, s = 2.2) { mb.textContent = text; mb.classList.add('on'); mbT = s; }
const v3 = new THREE.Vector3();
function project(obj, dy) {
  v3.copy(obj).add(new THREE.Vector3(0, dy, 0)).project(camera);
  return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight];
}

/* ---- pointer ---- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let pointerIn = false, hoverSaid = 0;
canvas.addEventListener('pointermove', e => {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pointerIn = true;
  CAM.px = ndc.x; CAM.py = ndc.y;
});
canvas.addEventListener('pointerleave', () => { pointerIn = false; });
const CLICK_LINES = ['Тук-тук!', 'Туда пока нельзя. Скоро!', 'Там темно… но уютно', 'Эй, щекотно!', 'Я Дверка!', 'Скрип-скрип'];
canvas.addEventListener('click', e => {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (ray.intersectObject(DV.hit).length) {
    say(CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)]);
    MV.spin = Math.PI * 2; MV.squash = .7;
    FACE.userData.s.mood = 'grin'; drawFace(); setTimeout(() => { FACE.userData.s.mood = 'smile'; drawFace(); }, 900);
    $('#hint').hidden = true;
  }
});

/* ---- loop ---- */
let DUST = null;
function buildDust() {
  const n = 140, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 3.2; pos[i * 3 + 1] = .3 + Math.random() * 2; pos[i * 3 + 2] = -1.8 + Math.random() * 2.6; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  DUST = new THREE.Points(g, new THREE.PointsMaterial({ map: GLOW_TEX, color: '#ffd9a0', size: .035, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(DUST);
}
let last = performance.now(), tick8 = 0, tickWin = 0, tickTv = 0, tickMon = 0, faceT = 2;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  // hover test
  if (pointerIn) { ray.setFromCamera(ndc, camera); DV.hover = ray.intersectObject(DV.hit).length > 0; } else DV.hover = false;
  canvas.classList.toggle('hot', DV.hover);
  if (DV.hover && now - hoverSaid > 6000) { hoverSaid = now; say('Скри-и-ип… там пока темно'); FACE.userData.s.mood = 'o'; drawFace(); }
  if (!DV.hover && FACE.userData.s.mood === 'o') { FACE.userData.s.mood = 'smile'; drawFace(); }
  updateMascot(dt, t);
  // Dverka blinks and glances at the camera or where it runs
  faceT -= dt;
  if (faceT < 0) { FACE.userData.s.blink = true; drawFace(); setTimeout(() => { FACE.userData.s.blink = false; drawFace(); }, 120); faceT = 2 + Math.random() * 3; }
  // camera: gentle parallax, never a walk-through
  const sway = reduce ? 0 : Math.sin(t * .25) * .06;
  camera.position.set((CAM.x + CAM.px * .45 + sway) * CAM.dist, CAM.y + CAM.py * .18 + (CAM.dist - 1) * .6, CAM.z * CAM.dist);
  camera.lookAt(CAM.look);
  // twinkles
  BLINKERS.forEach(b => {
    if (b.kind === 'bulb') { const on = Math.sin(t * 2.2 + b.p * 1.7) > -.2; b.m.material.color.copy(b.c).multiplyScalar(on ? 1 : .25); if (b.g) b.g.material.opacity = on ? .42 : .05; }
    else if (b.kind === 'spin') b.m.rotation.y = t;
    else if (b.kind === 'flame') { b.m.scale.y = 1 + Math.sin(t * 17) * .2 + Math.random() * .1; b.g.material.opacity = .45 + Math.random() * .15; }
  });
  LIGHTS.tv.intensity = .35 + Math.random() * .12; LIGHTS.tree.intensity = .3 + Math.sin(t * 2.2) * .1;
  if ((tickWin -= dt) < 0) { tickWin = .09; drawWindow(t); }
  if ((tickTv -= dt) < 0) { tickTv = .12; drawTV(t); }
  if ((tickMon -= dt) < 0) { tickMon = .35; drawMonitor(t); }
  updateGuests(dt, t);
  mbT -= dt; if (mbT <= 0) mb.classList.remove('on');
  const [mx, my] = project(DV.root.position, .46); mb.style.left = mx + 'px'; mb.style.top = my + 'px';
  if (DUST) { const a = DUST.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * .03; if (y > 2.3) y = .3; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * .4 + i) * dt * .02); } a.needsUpdate = true; }
  POST.mat.uniforms.uTime.value = t % 10;
  renderFrame();
  requestAnimationFrame(frame);
}

/* ---- boot ---- */
if (!window.THREE) { $('#boot').textContent = 'Не удалось загрузить three.js — обнови страницу.'; }
else {
  buildRoom(); buildLights(); buildNick(); buildGuests(); buildMascot(); buildDust();
  GUESTS.forEach(G => { const b = document.createElement('div'); b.className = 'bubble small'; $('#c-bubbles').appendChild(b); G.bubble = b; G.bubbleT = 0; });
  resize(); drawWindow(0); drawTV(0); drawMonitor(0);
  $('#boot').hidden = true;
  setTimeout(() => say('Привет! Я Дверка', 3), 600);
  requestAnimationFrame(frame);
}
