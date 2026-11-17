/* ================= camera, post-processing, life ================= */
const camera = new THREE.PerspectiveCamera(30, 1, .05, 30);
const CAM = { base: new THREE.Vector3(-.78, 1.32, 1.95), look: new THREE.Vector3(-.04, .98, -.16), px: 0, py: 0, tx: 0, ty: 0 };

const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(512, 512), .38, .5, .92);
composer.addPass(bloom);
// film look: ACES tone map + gamma, soft vignette, a touch of chromatic fringe and grain
const FILM = new THREE.ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: [
    'uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;',
    'vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }',
    'void main() {',
    '  vec2 d = vUv - 0.5; float r2 = dot(d, d);',
    '  vec3 c = vec3(texture2D(tDiffuse, vUv + d * 0.004).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - d * 0.004).b);',
    '  c = aces(c * 1.1);',
    '  c = pow(c, vec3(1.0 / 2.2));',
    '  c *= 1.0 - r2 * 1.1;',
    '  c += (hash(vUv * uRes) - 0.5) * 0.035;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}',
  ].join('\n'),
});
composer.addPass(FILM);

function resize() {
  const w = innerWidth, h = innerHeight, pr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
  composer.setPixelRatio ? composer.setPixelRatio(pr) : 0; composer.setSize(w, h);
  bloom.setSize(w * pr / 2, h * pr / 2);
  FILM.uniforms.uRes.value.set(w * pr, h * pr);
  camera.aspect = w / h; camera.fov = w / h < 1 ? 48 : 30; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('pointermove', e => { CAM.tx = e.clientX / innerWidth * 2 - 1; CAM.ty = e.clientY / innerHeight * 2 - 1; });

/* steam over the mug, dust in the screen light */
let steam = [], dust;
function buildParticles(mug) {
  const mat = new THREE.SpriteMaterial({ map: TEX.soft, color: col('#ffffff'), transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(mat.clone()); s.userData.t = i / 14; scene.add(s); steam.push(s); }
  steam.origin = mug.position.clone().add(new THREE.Vector3(0, .09, 0));
  const n = 120, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * .9; pos[i * 3 + 1] = .78 + Math.random() * .6; pos[i * 3 + 2] = -.05 + Math.random() * .6; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(g, new THREE.PointsMaterial({ map: TEX.soft, color: col('#fff0d0'), size: .006, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
}

let last = performance.now(), screenT = 0, hddT = 0;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  CAM.px += (CAM.tx - CAM.px) * Math.min(1, dt * 2.5); CAM.py += (CAM.ty - CAM.py) * Math.min(1, dt * 2.5);
  const breathe = reduce ? 0 : Math.sin(t * .35) * .015;
  camera.position.set(CAM.base.x + CAM.px * .22, CAM.base.y - CAM.py * .1 + breathe, CAM.base.z);
  camera.lookAt(CAM.look);
  if ((screenT -= dt) < 0) { screenT = .12; drawScreen(t); }
  const flick = 1 + Math.sin(t * 50) * .015 + (Math.random() < .01 ? -.08 : 0);
  LEDS.screen.material.color.setScalar(.95 * flick); LEDS.rect.intensity = 4.5 * flick;
  if ((hddT -= dt) < 0) { hddT = .05 + Math.random() * .3; LEDS.hdd.visible = Math.random() < .45; }
  steam.forEach(s => {
    s.userData.t = (s.userData.t + dt * .18) % 1; const k = s.userData.t;
    s.position.set(steam.origin.x + Math.sin(k * 6 + s.id) * .012 * k * 3, steam.origin.y + k * .16, steam.origin.z + Math.cos(k * 5 + s.id) * .008);
    const sz = .02 + k * .05; s.scale.set(sz, sz, 1); s.material.opacity = Math.sin(k * Math.PI) * .12;
  });
  const a = dust.geometry.attributes.position;
  for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * .006; if (y > 1.4) y = .78; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t * .3 + i) * dt * .004); }
  a.needsUpdate = true;
  FILM.uniforms.uTime.value = t % 10;
  composer.render();
  requestAnimationFrame(frame);
}

buildRoom(); buildDesk(); buildComputer(); const stuff = buildDeskStuff(); buildLamp(); buildLights(); buildParticles(stuff.mug);
resize(); drawScreen(0);
$('#boot').hidden = true;
requestAnimationFrame(frame);
