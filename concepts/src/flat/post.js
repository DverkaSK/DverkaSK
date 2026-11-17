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

