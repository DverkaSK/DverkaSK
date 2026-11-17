/* ================= BEHAVIOUR ================= */
let season = store.get('season', 'winter');
let pointer = null, lastInput = performance.now(), hovered = null, openDoor = null;

/* ---- speech ---- */
const bubble = $('#bubble');
let bubbleT = 0, chatT = 9;
function say(text, ms = 2600) { bubble.textContent = text; bubble.classList.remove('off'); bubbleT = ms / 1000; chatT = 12 + Math.random() * 8; }
function placeBubble() {
  const [sx, sy] = toScreen(M.x, FEET - M.h - (outfit && outfit.hat ? 150 : 116));
  bubble.style.left = Math.max(90, Math.min(innerWidth - 90, sx)) + 'px'; bubble.style.top = sy + 'px';
}

/* ---- doors ---- */
function nearestDoor(x, max = 90) {
  let best = null, bd = max;
  for (const id in DOORS) { const d = Math.abs(DOORS[id].cx - x); if (d < bd) { bd = d; best = id; } }
  return best;
}
function hoverDoor(id) {
  if (hovered === id) return;
  hovered = id;
  if (id) { const D = DOORS[id]; M.target = D.cx + (M.x < D.cx ? -D.dw / 2 - 40 : D.dw / 2 + 40); D.sv += (M.x < D.cx ? 1 : -1) * 1.5; say(L().doors[id].line); }
}
function open(id) {
  closePop();
  const D = DOORS[id], H = D.H;
  D.target = 1; openDoor = id; wake();
  M.target = D.cx + (M.x < D.cx ? -D.dw / 2 - 34 : D.dw / 2 + 34);
  if (id === 'home') { setTimeout(() => showRoom('home'), 280); return; }
  if (id === 'shop') { setTimeout(() => showRoom('shop'), 280); return; }
  const s = L().doors[id];
  $('#pop-t').textContent = s.name; $('#pop-p').textContent = s.desc;
  $('#pop-u').textContent = H.url ? H.url.replace(/^https:\/\/(www\.)?/, '') : H.ph;
  const go = $('#pop-go');
  go.hidden = !H.url; if (H.url) { go.href = H.url; go.textContent = L().enter; }
  const pop = $('#pop'); pop.hidden = false; placePop(); go.focus({ preventScroll: true });
}
function placePop() {
  if (!openDoor || $('#pop').hidden) return;
  const D = DOORS[openDoor], [sx, sy] = toScreen(D.cx, GROUND - D.dh - 50);
  const pop = $('#pop'), w = pop.offsetWidth;
  pop.style.left = Math.max(16 + w / 2, Math.min(innerWidth - 16 - w / 2, sx)) + 'px';
  pop.style.top = Math.max(pop.offsetHeight + 24, sy) + 'px';
}
function closePop() {
  $('#pop').hidden = true;
  if (openDoor) DOORS[openDoor].target = 0;
  openDoor = null;
}
$('#pop-go').addEventListener('click', () => { heart(M.x, FEET - 100); setTimeout(closePop, 300); });

/* ---- rooms ---- */
function showRoom(which) {
  const s = L();
  if (which === 'home') {
    $('#home-body').innerHTML = `<h2 id="home-t">${s.home.t}</h2><p>${s.home.p}</p>
      <ul class="facts">${s.home.facts.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join('')}</ul>
      <p class="cozy">${s.home.cozy}</p><p style="font-size:12px;color:var(--muted);margin:0">${s.home.src}</p>`;
  } else {
    const fig = k => `<figure><img src="${ICONS[k]}" alt="" title="${NAMES[k]}"><figcaption>${NAMES[k]}</figcaption></figure>`;
    $('#shop-body').innerHTML = `<h2 id="shop-t">${s.shop.t}</h2><p>${s.shop.p}</p>
      <h3>${s.shop.old}</h3><div class="peg">${STACK_OLD.map(fig).join('')}</div>
      <h3>${s.shop.neu}</h3><div class="peg new">${STACK_NEW.map(fig).join('')}</div>`;
  }
  const el = $('#room-' + which); el.hidden = false; el.querySelector('.x').focus({ preventScroll: true });
}
function closeRooms() { $$('.room').forEach(r => r.hidden = true); if (openDoor) DOORS[openDoor].target = 0; openDoor = null; }

/* ---- wardrobe ---- */
function renderWardrobe() {
  const s = L();
  $('#w-title').textContent = s.wTitle;
  const vb = { hat: '-36 -126 72 54', neck: '-30 -46 60 46', face: '-24 -72 48 26' };
  $('#w-rows').innerHTML = ['hat', 'neck', 'face'].map(k => `
    <div class="row-label">${s.rows[k]}</div>
    <div class="items">
      <button class="item${!outfit || !outfit[k] ? ' on' : ''}" data-k="${k}" data-v="" type="button"><svg viewBox="-20 -20 40 40"><circle r="12" fill="none" stroke="#b9b3cf" stroke-width="2" stroke-dasharray="4 4"/></svg>${s.none}</button>
      ${Object.keys(OUTFIT[k]).map(v => `<button class="item${outfit && outfit[k] === v ? ' on' : ''}" data-k="${k}" data-v="${v}" type="button"><svg viewBox="${vb[k]}">${OUTFIT[k][v]}</svg>${s.items[v]}</button>`).join('')}
    </div>`).join('');
  $$('#w-rows .item').forEach(b => b.addEventListener('click', () => {
    outfit = Object.assign({}, outfit || {}, { [b.dataset.k]: b.dataset.v || null });
    outfitCustom = true; store.set('outfit', outfit); applyOutfit(); renderWardrobe();
    M.vh = 520; M.spin = Math.PI * 2; puff(M.x, FEET - 50, 8, 'rgba(255,230,160,.6)', 60);
    say(pick(s.dress), 1800);
  }));
}
function toggleWardrobe(force) {
  const w = $('#wardrobe'), show = force ?? w.hidden;
  w.hidden = !show; if (show) { renderWardrobe(); M.target = Math.max(120, Math.min(1480, toWorld(innerWidth / 2, 0)[0])); }
}
$('#btn-wardrobe').addEventListener('click', () => toggleWardrobe());

/* ---- seasons & language ---- */
function setSeason(s, speak) {
  season = s; store.set('season', s);
  document.documentElement.className = 's-' + s;
  if (!outfitCustom) { outfit = SEASON_OUTFIT[s]; applyOutfit(); }
  seedAmbient(s);
  $$('#seasons .chip').forEach(c => c.classList.toggle('on', c.dataset.s === s));
  if (speak) { say(L().seasonLine[s]); M.vh = 480; }
}
function renderUI() {
  const s = L();
  document.documentElement.lang = lang;
  $('#t-sub').textContent = s.sub; $('#t-hint').textContent = s.hint;
  $('#btn-wardrobe').textContent = s.wardrobe; $('#btn-lang').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#seasons').innerHTML = ['winter', 'autumn', 'spring', 'summer'].map(k => `<button class="chip${k === season ? ' on' : ''}" data-s="${k}" type="button">${s.seasons[k]}</button>`).join('');
  $$('#seasons .chip').forEach(c => c.addEventListener('click', () => setSeason(c.dataset.s, true)));
  HOUSES.forEach(H => { const t = $('#signt-' + H.id); if (t) t.textContent = s.doors[H.id].name; DOORS[H.id].el.setAttribute('aria-label', s.doors[H.id].name); });
  if (!$('#wardrobe').hidden) renderWardrobe();
}
$('#btn-lang').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; store.set('lang', lang); renderUI(); say(L().hello); });

/* ---- input ---- */
const pick = a => a[Math.floor(Math.random() * a.length)];
function wake() {
  lastInput = performance.now();
  if (M.sleeping) { M.sleeping = false; M.vh = 420; say(L().wake); }
}
const streetEl = $('#street');
streetEl.addEventListener('pointermove', e => {
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  pointer = [wx, wy]; wake();
  const over = e.target.closest && e.target.closest('.door');
  if (over) hoverDoor(over.dataset.id);
  else { hoverDoor(null); if (!openDoor && e.pointerType === 'mouse') M.target = Math.max(40, Math.min(1560, wx)); }
});
streetEl.addEventListener('pointerleave', () => { pointer = null; hoverDoor(null); });
streetEl.addEventListener('click', e => {
  const [wx, wy] = toWorld(e.clientX, e.clientY); wake();
  const door = e.target.closest && e.target.closest('.door');
  if (door) { open(door.dataset.id); return; }
  if (Math.abs(wx - M.x) < 44 && wy > FEET - M.h - 120 && wy < FEET - M.h + 8) { poke(); return; }
  closePop(); M.target = Math.max(40, Math.min(1560, wx));
});
function poke() {
  if (M.h < 4) M.vh = 640; M.spin = Math.PI * 2; M.mood = 'grin'; setTimeout(() => M.mood = 'smile', 900);
  heart(M.x, FEET - 100); say(pick(L().poke), 1600);
}
$$('.door').forEach(d => {
  d.addEventListener('focus', () => hoverDoor(d.dataset.id));
  d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(d.dataset.id); } });
});
$$('[data-close]').forEach(b => b.addEventListener('click', () => { const s = b.closest('.sheet, .room'); s.hidden = true; if (s.classList.contains('room')) closeRooms(); }));
addEventListener('keydown', e => {
  wake();
  if (e.key === 'Escape') { closePop(); closeRooms(); toggleWardrobe(false); return; }
  if (e.target.closest && e.target.closest('button, a, .door, input')) return;
  if (e.key === 'ArrowLeft') M.target = Math.max(40, M.x - 220);
  if (e.key === 'ArrowRight') M.target = Math.min(1560, M.x + 220);
  if (e.key === ' ') { e.preventDefault(); poke(); }
});
addEventListener('pointerdown', e => {
  if (!$('#pop').hidden && !e.target.closest('#pop') && !e.target.closest('.door')) closePop();
});
addEventListener('resize', () => { fitFx(); placePop(); });
streetEl.addEventListener('scroll', placePop, { passive: true });

/* ---- loop ---- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
  // chase the target: quick acceleration, tiny overshoot = springy and nimble
  const dx = M.target - M.x;
  const want = Math.max(-1100, Math.min(1100, dx * 7));
  const before = M.vx;
  M.vx += (want - M.vx) * Math.min(1, dt * 11);
  if (Math.abs(dx) < 2 && Math.abs(M.vx) < 20) M.vx = 0;
  M.x += M.vx * dt;
  if (Math.abs(M.vx) > 30) { M.face = M.vx > 0 ? 1 : -1; M.phase += dt * Math.abs(M.vx) / 16; }
  if (Math.abs(before) < 120 && Math.abs(M.vx) > 250 && M.h < 2) puff(M.x - M.face * 14, FEET - 2, 5);
  if (Math.abs(before) > 500 && Math.abs(M.vx) < 150 && M.h < 2) { puff(M.x + M.face * 12, FEET - 2, 6); M.squash = .8; }
  if (Math.abs(M.vx) > 800 && !reduce && Math.random() < .5) {
    const [sx, sy] = toScreen(M.x - M.face * 30, FEET - 30 - Math.random() * 50), k = worldScale();
    parts.push({ x: sx, y: sy, vx: 0, vy: 0, life: .18, max: .18, line: true, len: -M.face * (18 + Math.random() * 20) * k });
  }
  // jump & squash
  M.vh -= 2600 * dt; M.h += M.vh * dt;
  if (M.h <= 0) { if (M.vh < -300) { M.squash = .72; puff(M.x, FEET - 2, 6); } M.h = 0; M.vh = 0; }
  M.squash += (1 - M.squash) * Math.min(1, dt * 12);
  if (M.h > 0 && M.vh > 0) M.squash = Math.max(M.squash, 1.08);
  M.spin = Math.max(0, M.spin - dt * 14);
  M.wave = Math.max(0, M.wave - dt);
  // look at pointer, or the open door
  const lookAt = pointer || (openDoor ? [DOORS[openDoor].cx, GROUND - 90] : null);
  if (lookAt) { M.look = (lookAt[0] - M.x) / 60; M.lookY = (lookAt[1] - (FEET - 60)) / 80; } else { M.look *= .95; M.lookY *= .95; }
  // blink / sleep / chatter
  M.blinkT -= dt; if (M.blinkT < 0) { M.blink = 1; M.blinkT = 2 + Math.random() * 4; }
  M.blink = Math.max(0, M.blink - dt * 8);
  if (!M.sleeping && now - lastInput > 16000 && Math.abs(M.vx) < 5) { M.sleeping = true; say('Zzz…', 1500); }
  if (M.sleeping && Math.random() < dt * .8) zzz(M.x + 18, FEET - 90);
  bubbleT -= dt; if (bubbleT <= 0) bubble.classList.add('off');
  chatT -= dt; if (chatT <= 0 && !M.sleeping && $('#wardrobe').hidden) { say(pick(L().idle)); M.wave = 1.2; }
  // idle wandering when nobody steers
  if (!pointer && !openDoor && Math.abs(M.vx) < 5 && Math.random() < dt * .12 && !M.sleeping) M.target = Math.max(80, Math.min(1520, M.x + (Math.random() - .5) * 500));
  renderMascot(t); placeBubble();
  // doors
  for (const id in DOORS) {
    const D = DOORS[id];
    D.open += (D.target - D.open) * Math.min(1, dt * 9);
    const k = 1 - .78 * D.open;
    D.leaf.setAttribute('transform', `translate(${D.x0} ${GROUND}) scale(${k.toFixed(3)} ${(1 - .04 * D.open).toFixed(3)}) translate(${-D.x0} ${-GROUND})`);
    D.spill.setAttribute('opacity', (D.open * .9).toFixed(2));
    // everyone watches Dverka; the hovered door watches you
    const awake = hovered === id || openDoor === id;
    const tx = awake && pointer ? pointer[0] : M.x, ty = awake && pointer ? pointer[1] : FEET - 50 - M.h;
    const vx = tx - D.cx, vy = ty - D.eyeY, vl = Math.hypot(vx, vy) || 1;
    D.pup.setAttribute('transform', `translate(${(vx / vl * 3).toFixed(2)} ${(vy / vl * 2.6).toFixed(2)})`);
    D.blinkT -= dt; if (D.blinkT < 0) { D.blink = 1; D.blinkT = 2 + Math.random() * 6; }
    D.blink = Math.max(0, D.blink - dt * 7);
    const base = awake ? 0 : D.lid;
    D.lidEl.setAttribute('height', (Math.max(base, D.blink) * (D.ery * 2 + 2)).toFixed(1));
    D.mouthO.setAttribute('opacity', awake ? 1 : 0);
    if (D.mouth) D.mouth.setAttribute('opacity', awake ? 0 : 1);
    // signs swing when Dverka zooms past
    if (Math.abs(M.x - D.cx) < 50 && Math.abs(M.vx) > 400) D.sv += M.vx / 1100 * dt * 40;
    D.sv += (-D.sa * 40 - D.sv * 3) * dt; D.sa += D.sv * dt;
    D.sign.setAttribute('transform', `rotate(${(D.sa * 6).toFixed(2)} ${D.cx} ${GROUND - D.dh - 50})`);
  }
  // windows: somebody turns a light on or off now and then
  if (Math.random() < dt * .25) { const w = pick(winEls); w.classList.toggle('lit'); }
  // clock
  if (Math.floor(t) !== frame.sec) { frame.sec = Math.floor(t); tickClock(); }
  smoke(dt, season); drawFx(dt, t);
  requestAnimationFrame(frame);
}
function tickClock() {
  let h, m;
  try { const p = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Bratislava' }).formatToParts(new Date()); h = +p.find(x => x.type === 'hour').value; m = +p.find(x => x.type === 'minute').value; }
  catch (e) { const d = new Date(); h = d.getHours(); m = d.getMinutes(); }
  const c = HOUSES[0], cx = c.x + c.w / 2, cy = GROUND - c.h + 34 + 8 + 26;
  $('#clock-h').setAttribute('transform', `rotate(${(h % 12) * 30 + m / 2} ${cx} ${cy})`);
  $('#clock-m').setAttribute('transform', `rotate(${m * 6} ${cx} ${cy})`);
}

/* ---- boot ---- */
buildScene(); mountMascot();
const winEls = $$('.win').filter(w => !w.closest('.door'));
fitFx(); renderUI(); setSeason(season, false); applyOutfit();
streetEl.scrollLeft = ($('#scene').offsetWidth - innerWidth) / 2;
M.x = 800; M.target = 800;
setTimeout(() => { say(L().hello, 4200); M.wave = 1.6; }, 500);
requestAnimationFrame(frame);
