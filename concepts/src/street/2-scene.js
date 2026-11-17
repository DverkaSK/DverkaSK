/* ================= SCENE ================= */
const svg = $('#svg');
const CHIMNEYS = [];
const DOORS = {};
let seedS = 7;
const r = () => (seedS = (seedS * 16807) % 2147483647) / 2147483647;

const DS = {
  charcoal: { c: '#454a60', d: '#262936', sleepy: true },
  oak: { c: '#6a4630', d: '#3a2416', grumpy: true },
  metal: { c: '#7c8896', d: '#48525e' },
  home: { c: '#dd8c4e', d: '#7a4220', round: true },
  green: { c: '#3f9e6a', d: '#22583a', grin: true },
  plank: { c: '#a06d40', d: '#5a3a1e' },
  blue: { c: '#3b87c7', d: '#20507e' },
};

function defs() {
  return `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--sky1)"/><stop offset=".55" style="stop-color:var(--sky2)"/><stop offset="1" style="stop-color:var(--sky3)"/>
    </linearGradient>
    <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff3d6" stop-opacity=".45"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>
    <linearGradient id="winLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a3"/><stop offset="1" stop-color="#ffa94d"/></linearGradient>
    <radialGradient id="winGlow"><stop offset="0" stop-color="#ffb65c" stop-opacity=".55"/><stop offset="1" stop-color="#ffb65c" stop-opacity="0"/></radialGradient>
    <linearGradient id="doorLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0"/><stop offset="1" stop-color="#ff9f45"/></linearGradient>
    <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc56e" stop-opacity=".75"/><stop offset="1" stop-color="#ffc56e" stop-opacity="0"/></linearGradient>
    <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffd48a" stop-opacity=".7"/><stop offset=".35" stop-color="#ffb35c" stop-opacity=".22"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <radialGradient id="poolGlow"><stop offset="0" stop-color="#ffc06a" stop-opacity=".4"/><stop offset="1" stop-color="#ffc06a" stop-opacity="0"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12112a" stop-opacity=".55"/><stop offset=".6" stop-color="#12112a" stop-opacity=".1"/><stop offset="1" stop-color="#ff9a4a" stop-opacity=".12"/></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3553"/><stop offset="1" stop-color="#211e36"/></linearGradient>
    <pattern id="cobble" width="30" height="16" patternUnits="userSpaceOnUse">
      <rect x="1" y="1" width="26" height="12" rx="6" fill="none" stroke="#1a1830" stroke-opacity=".5" stroke-width="1.5"/>
      <rect x="-14" y="9" width="26" height="12" rx="6" fill="none" stroke="#1a1830" stroke-opacity=".3" stroke-width="1.5"/>
    </pattern>
    <linearGradient id="mWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0a563"/><stop offset="1" stop-color="#c8733a"/></linearGradient>
  </defs>`;
}

function sky() {
  let s = `<rect width="1600" height="900" fill="url(#sky)"/>`;
  s += `<g class="d-winter d-summer d-spring d-autumn">`;
  for (let i = 0; i < 80; i++) s += `<circle class="star" cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 380).toFixed(0)}" r="${(.6 + r() * 1.2).toFixed(1)}" fill="#fff6e0" style="animation-delay:${(r() * 3.5).toFixed(2)}s"/>`;
  s += `</g>`;
  s += `<circle cx="1290" cy="118" r="95" fill="url(#moonGlow)"/><circle cx="1290" cy="118" r="30" fill="#fff3d6"/><circle cx="1280" cy="110" r="6" fill="#efe0bf"/><circle cx="1300" cy="128" r="4" fill="#efe0bf"/>`;
  // Bratislava-style castle on the hill: a box with four corner towers
  s += `<path d="M760 480 Q930 330 1110 336 Q1300 342 1500 480 Z" fill="#2a2850"/>`;
  s += `<g fill="#302d5c"><rect x="1030" y="262" width="150" height="82"/>
    <rect x="1022" y="236" width="24" height="108"/><rect x="1164" y="236" width="24" height="108"/>
    <path d="M1020 238 L1034 218 L1048 238 Z M1162 238 L1176 218 L1190 238 Z"/></g>`;
  s += `<g fill="#ffcf7a" opacity=".75"><rect x="1060" y="286" width="5" height="7"/><rect x="1098" y="286" width="5" height="7"/><rect x="1136" y="300" width="5" height="7"/><rect x="1031" y="262" width="4" height="6"/></g>`;
  // far rooftops
  let d = 'M0 900 L0 400', x = 0;
  while (x < 1600) { const w = 50 + r() * 70, h = 330 + r() * 80; d += ` L${x} ${h} L${x + w / 2} ${h - 30 - r() * 30} L${x + w} ${h}`; x += w; }
  s += `<path d="${d} L1600 900 Z" fill="#23234a"/>`;
  for (let i = 0; i < 26; i++) s += `<rect x="${(r() * 1600).toFixed(0)}" y="${(380 + r() * 60).toFixed(0)}" width="4" height="6" fill="#ffc46a" opacity="${(.3 + r() * .5).toFixed(2)}"/>`;
  return s;
}

function roof(H, y0) {
  const { x, w } = H, rc = '#2e2940', re = '#463d5c';
  let s = '', snow = '';
  if (H.roof === 'gable') {
    const rh = w * .36;
    s += `<path d="M${x - 8} ${y0} L${x + w / 2} ${y0 - rh} L${x + w + 8} ${y0} Z" fill="${rc}"/>`;
    s += `<path d="M${x - 8} ${y0} L${x + w / 2} ${y0 - rh} L${x + w + 8} ${y0}" fill="none" stroke="${re}" stroke-width="4"/>`;
    snow = `<path d="M${x - 8} ${y0 - 2} L${x + w / 2} ${y0 - rh - 3} L${x + w + 8} ${y0 - 2}" fill="none" stroke="#eef2ff" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (H.chimney) { const cx = x + w * .72, cy = y0 - rh * .56; s = `<rect x="${cx - 9}" y="${cy - 34}" width="18" height="40" fill="#5a4150"/><rect x="${cx - 12}" y="${cy - 38}" width="24" height="6" fill="#3b2c3a"/>` + s; CHIMNEYS.push([cx, cy - 40]); snow += `<rect x="${cx - 12}" y="${cy - 42}" width="24" height="6" rx="3" fill="#eef2ff"/>`; }
    s += `<circle cx="${x + w / 2}" cy="${y0 - rh * .45}" r="11" fill="#1c1a30"/><circle cx="${x + w / 2}" cy="${y0 - rh * .45}" r="8" fill="url(#winLit)" opacity=".9"/>`;
  } else if (H.roof === 'step') {
    const st = 5, sw = w / (st * 2 - 1), sh = 18;
    let d = `M${x} ${y0}`;
    for (let i = 0; i < st; i++) d += ` V${y0 - sh * (i + 1)} H${x + sw * (i + 1)}`;
    for (let i = st - 1; i >= 0; i--) d += ` V${y0 - sh * i}${i ? ` H${x + w - sw * i}` : ''}`;
    d += ` H${x + w} Z`;
    s += `<path d="${d}" fill="${H.col}"/><path d="${d}" fill="url(#shade)"/>`;
    for (let i = 0; i < st; i++) { snow += `<rect x="${x + sw * i - 2}" y="${y0 - sh * (i + 1) - 4}" width="${sw + 4}" height="6" rx="3" fill="#eef2ff"/><rect x="${x + w - sw * (i + 1) - 2}" y="${y0 - sh * (i + 1) - 4}" width="${sw + 4}" height="6" rx="3" fill="#eef2ff"/>`; }
    if (H.chimney) { const cx = x + w * .2; s = `<rect x="${cx - 8}" y="${y0 - 70}" width="16" height="40" fill="#4f3b4a"/>` + s; CHIMNEYS.push([cx, y0 - 72]); }
  } else {
    const rh = 56;
    s += `<path d="M${x - 6} ${y0} L${x + 18} ${y0 - rh} L${x + w - 18} ${y0 - rh} L${x + w + 6} ${y0} Z" fill="${rc}"/>`;
    s += `<rect x="${x + w / 2 - 17}" y="${y0 - rh + 12}" width="34" height="36" fill="#3b3350"/><rect x="${x + w / 2 - 11}" y="${y0 - rh + 20}" width="22" height="26" rx="11" fill="url(#winLit)"/>`;
    snow = `<path d="M${x + 16} ${y0 - rh - 2} H${x + w - 16}" stroke="#eef2ff" stroke-width="8" stroke-linecap="round"/><path d="M${x + w / 2 - 19} ${y0 - rh + 12} H${x + w / 2 + 19}" stroke="#eef2ff" stroke-width="6" stroke-linecap="round"/>`;
  }
  return s + `<g class="d-winter">${snow}</g>`;
}

function windowSVG(x, y, w, h, lit, arch, extra = '') {
  const sh = arch ? `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z` : `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  return `<g class="win${lit ? ' lit' : ''}">
    <rect class="glow" x="${x - 26}" y="${y - 22}" width="${w + 52}" height="${h + 44}" fill="url(#winGlow)"/>
    <path class="glass" d="${sh}"/>
    ${extra}
    <path d="${sh} M${x + w / 2} ${y + (arch ? 2 : 0)} V${y + h} M${x} ${y + h * .45} H${x + w}" fill="none" stroke="#e8dcc6" stroke-opacity=".85" stroke-width="3"/>
    <rect x="${x - 5}" y="${y + h}" width="${w + 10}" height="6" rx="2" fill="#d9ccb4" opacity=".85"/>
    <rect class="d-winter" x="${x - 6}" y="${y + h - 3}" width="${w + 12}" height="6" rx="3" fill="#eef2ff"/>
    <g class="d-spring"><rect x="${x - 3}" y="${y + h + 5}" width="${w + 6}" height="9" rx="2" fill="#7a4a30"/>
      ${[0, 1, 2, 3, 4].map(i => `<circle cx="${x + 2 + i * (w - 4) / 4}" cy="${y + h + 3}" r="4" fill="${['#ffb3c7', '#fff1f5', '#ffd46a', '#ffb3c7', '#e7a1ff'][i]}"/>`).join('')}</g>
  </g>`;
}

function doorSVG(H) {
  const D = H.door, st = DS[D.style], G = GROUND;
  const cx = H.x + H.w / 2 + (D.off || 0), dw = D.w, dh = D.h, x0 = cx - dw / 2, x1 = cx + dw / 2, top = G - dh;
  const shape = (p = 0) => st.round
    ? `M${x0 - p} ${G} V${top + dw / 2} A${dw / 2 + p} ${dw / 2 + p} 0 0 1 ${x1 + p} ${top + dw / 2} V${G} Z`
    : `M${x0 - p} ${G} V${top + 8 - p} Q${x0 - p} ${top - p} ${x0 + 8 - p} ${top - p} H${x1 - 8 + p} Q${x1 + p} ${top - p} ${x1 + p} ${top + 8 - p} V${G} Z`;
  const ey = st.round ? top + dh * .47 : top + dh * .3, erx = dw * .105, ery = dw * .125, ex1 = cx - dw * .19, ex2 = cx + dw * .19;
  const my = ey + ery + 11;
  let face = `
    <clipPath id="clip-${H.id}"><ellipse cx="${ex1}" cy="${ey}" rx="${erx}" ry="${ery}"/><ellipse cx="${ex2}" cy="${ey}" rx="${erx}" ry="${ery}"/></clipPath>
    <ellipse cx="${ex1}" cy="${ey}" rx="${erx + 1.5}" ry="${ery + 1.5}" fill="${st.d}"/><ellipse cx="${ex2}" cy="${ey}" rx="${erx + 1.5}" ry="${ery + 1.5}" fill="${st.d}"/>
    <ellipse cx="${ex1}" cy="${ey}" rx="${erx}" ry="${ery}" fill="#fffaf0"/><ellipse cx="${ex2}" cy="${ey}" rx="${erx}" ry="${ery}" fill="#fffaf0"/>
    <g class="pup"><circle cx="${ex1}" cy="${ey}" r="${erx * .55}" fill="#1f1622"/><circle cx="${ex2}" cy="${ey}" r="${erx * .55}" fill="#1f1622"/>
      <circle cx="${ex1 + 1.5}" cy="${ey - 2}" r="1.4" fill="#fff"/><circle cx="${ex2 + 1.5}" cy="${ey - 2}" r="1.4" fill="#fff"/></g>
    <rect class="lid" x="${x0}" y="${ey - ery - 1}" width="${dw}" height="0" fill="${st.c}" clip-path="url(#clip-${H.id})"/>
    <ellipse cx="${ex1 - 4}" cy="${my - 2}" rx="5" ry="3" fill="#ff8f8f" opacity=".35"/><ellipse cx="${ex2 + 4}" cy="${my - 2}" rx="5" ry="3" fill="#ff8f8f" opacity=".35"/>`;
  let mouth = `M${cx - 7} ${my} Q${cx} ${my + 6} ${cx + 7} ${my}`;
  let extra = '';
  if (st.grumpy) {
    mouth = `M${cx - 6} ${my + 2} H${cx + 6}`;
    face += `<path class="brow" d="M${ex1 - 7} ${ey - ery - 6} L${ex1 + 6} ${ey - ery - 2} M${ex2 + 7} ${ey - ery - 6} L${ex2 - 6} ${ey - ery - 2}" stroke="${st.d}" stroke-width="3" stroke-linecap="round"/>`;
    extra += `<rect x="${x0 + 9}" y="${top + dh * .62}" width="13" height="9" rx="2" fill="#f25c54" transform="rotate(-12 ${x0 + 15} ${top + dh * .66})"/>
      <circle cx="${x1 - 16}" cy="${top + dh * .78}" r="6" fill="#ffd166"/><rect x="${x0 + 14}" y="${top + dh * .83}" width="15" height="8" rx="2" fill="#6fdc8c" transform="rotate(8 ${x0 + 20} ${top + dh * .86})"/>`;
  }
  if (st.grin) mouth = `M${cx - 9} ${my - 1} Q${cx} ${my + 11} ${cx + 9} ${my - 1} Z`;
  if (D.style === 'metal') {
    for (let y = top + 10; y < G - 4; y += 16) extra += `<circle cx="${x0 + 6}" cy="${y}" r="1.8" fill="#aab4bf"/><circle cx="${x1 - 6}" cy="${y}" r="1.8" fill="#aab4bf"/>`;
    extra += `<rect x="${cx - 2}" y="${ey + ery + 1}" width="12" height="5" rx="2" fill="#b9c2cc"/><rect x="${cx + 6}" y="${ey + ery + 3}" width="5" height="8" rx="2" fill="#b9c2cc"/>
      <circle class="drip" cx="${cx + 8.5}" cy="${ey + ery + 14}" r="2" fill="#8fd0ff"/>`;
    mouth = `M${cx - 8} ${my + 4} Q${cx - 3} ${my + 8} ${cx + 1} ${my + 4}`;
  }
  if (D.style === 'blue') {
    mouth = '';
    extra += `<rect x="${cx - 15}" y="${my - 3}" width="30" height="7" rx="3" fill="${st.d}"/>
      <g class="letter"><rect x="${cx - 9}" y="${my - 13}" width="18" height="12" rx="1.5" fill="#fffaf0"/><path d="M${cx - 9} ${my - 13} L${cx} ${my - 7} L${cx + 9} ${my - 13}" fill="none" stroke="#c9bfa8" stroke-width="1.2"/><rect x="${cx + 4}" y="${my - 12}" width="4" height="4" fill="#e85d5d"/></g>
      <rect x="${cx - 15}" y="${my - 1}" width="30" height="5" rx="2" fill="${st.d}"/>`;
  }
  if (D.style === 'plank') {
    for (let x = x0 + 12; x < x1; x += 12) extra += `<path d="M${x} ${top + 4} V${G}" stroke="${st.d}" stroke-opacity=".45" stroke-width="1.5"/>`;
    extra += `<path d="M${x0} ${ey - ery - 9} H${x1}" stroke="#3b2a1e" stroke-width="3"/><circle cx="${ex1}" cy="${ey - ery - 9}" r="6.5" fill="#8fd6ff" fill-opacity=".75" stroke="#3b2a1e" stroke-width="2.5"/><circle cx="${ex2}" cy="${ey - ery - 9}" r="6.5" fill="#8fd6ff" fill-opacity=".75" stroke="#3b2a1e" stroke-width="2.5"/>`;
  }
  if (st.round) {
    extra += `<circle cx="${cx}" cy="${top + dw * .36}" r="13" fill="${st.d}"/><circle cx="${cx}" cy="${top + dw * .36}" r="10" fill="url(#winLit)"/><path d="M${cx} ${top + dw * .36 - 10} v20 M${cx - 10} ${top + dw * .36} h20" stroke="${st.d}" stroke-width="2"/>
      <circle cx="${cx}" cy="${top + dh * .74}" r="6" fill="none" stroke="#f2c14e" stroke-width="2.5"/>`;
    mouth = `M${cx - 10} ${my - 1} Q${cx} ${my + 9} ${cx + 10} ${my - 1}`;
  }
  const knob = `<circle cx="${x1 - 9}" cy="${top + dh * .62}" r="3.6" fill="#f2c14e" stroke="${st.d}" stroke-width="1"/>`;
  const panel = st.round || D.style === 'plank' ? '' : `<rect x="${x0 + 10}" y="${top + dh * .6}" width="${dw - 20}" height="${dh * .4 - 12}" rx="3" fill="none" stroke="${st.d}" stroke-opacity=".5" stroke-width="2"/>`;
  const wreath = `<g class="d-winter"><circle cx="${cx}" cy="${top + dh * .73}" r="${dw * .15}" fill="none" stroke="#2f7a45" stroke-width="6"/><circle cx="${cx}" cy="${top + dh * .73}" r="${dw * .15}" fill="none" stroke="#4fa566" stroke-width="2" stroke-dasharray="3 5"/>
    ${[0, 1, 2, 3, 4].map(i => { const a = i * 1.25 + .4; return `<circle cx="${cx + Math.cos(a) * dw * .15}" cy="${top + dh * .73 + Math.sin(a) * dw * .15}" r="2.2" fill="#e04848"/>`; }).join('')}
    <path d="M${cx - 6} ${top + dh * .73 - dw * .15 - 4} l6 4 l6 -4 v8 l-6 -4 l-6 4 Z" fill="#d23b3b"/></g>`;
  const label = L().doors[H.id].name;
  const signW = st.round ? 132 : Math.max(96, label.length * 10 + 38), sy = top - (st.round ? 40 : 36);
  const sign = `<g class="sign" id="sign-${H.id}">
    <path d="M${cx - signW / 2 + 12} ${sy} L${cx - signW / 2 + 12} ${sy - 14} M${cx + signW / 2 - 12} ${sy} L${cx + signW / 2 - 12} ${sy - 14}" stroke="#1d1a2b" stroke-width="2"/>
    <rect x="${cx - signW / 2 - 6}" y="${sy - 17}" width="${signW + 12}" height="4" rx="2" fill="#1d1a2b"/>
    <rect x="${cx - signW / 2}" y="${sy}" width="${signW}" height="27" rx="9" fill="${st.round ? '#3b2432' : '#27223a'}" stroke="${st.round ? '#f2c14e' : '#cfa46a'}" stroke-width="2"/>
    ${signIcon(H.id, cx - signW / 2 + 16, sy + 13.5)}
    <text id="signt-${H.id}" x="${cx + (st.round ? 0 : 9)}" y="${sy + 19}" text-anchor="middle" font-family="M PLUS Rounded 1c, Nunito, sans-serif" font-weight="800" font-size="15" fill="${st.round ? '#ffd08a' : '#f5e4c8'}">${label}</text>
    <rect class="d-winter" x="${cx - signW / 2 + 4}" y="${sy - 3}" width="${signW - 8}" height="6" rx="3" fill="#eef2ff"/>
  </g>`;
  const outer = `
    <g class="d-autumn"><ellipse cx="${x1 + 20}" cy="${G + 3}" rx="12" ry="9" fill="#e07b2a"/><path d="M${x1 + 16} ${G - 5} Q${x1 + 14} ${G + 3} ${x1 + 16} ${G + 11} M${x1 + 24} ${G - 5} Q${x1 + 26} ${G + 3} ${x1 + 24} ${G + 11}" stroke="#b85a18" stroke-width="1.5" fill="none"/>
      <path d="M${x1 + 15} ${G + 1} l3 -3 l3 3 Z M${x1 + 21} ${G + 1} l3 -3 l3 3 Z M${x1 + 15} ${G + 5} Q${x1 + 20} ${G + 9} ${x1 + 25} ${G + 5}" fill="#ffd46a"/><rect x="${x1 + 19}" y="${G - 11}" width="3" height="6" rx="1" fill="#4d7a36"/></g>
    <g class="d-spring"><path d="M${x0 - 26} ${G - 14} h18 l-3 18 h-12 Z" fill="#b8653b"/>${[0, 1, 2].map(i => `<circle cx="${x0 - 22 + i * 5}" cy="${G - 20 - (i % 2) * 5}" r="4" fill="${['#ffb3c7', '#fff', '#ffd46a'][i]}"/>`).join('')}</g>`;
  return `
  <g class="door" id="door-${H.id}" data-id="${H.id}" tabindex="0" role="button" aria-label="${label}">
    <rect x="${x0 - 30}" y="${sy - 18}" width="${dw + 60}" height="${G - sy + 40}" fill="transparent"/>
    ${sign}
    <path class="frame" d="${shape(9)}" fill="#a8977f" stroke="transparent"/>
    <path d="${shape(9)}" fill="url(#shade)"/>
    <path d="${shape(0)}" fill="url(#doorLight)"/>
    <path class="spill" d="M${x0} ${G + 8} L${x1} ${G + 8} L${x1 + 50} ${G + 110} L${x0 - 50} ${G + 110} Z" fill="url(#spill)" opacity="0"/>
    <g class="leaf">
      <path d="${shape(0)}" fill="${st.c}" stroke="${st.d}" stroke-width="3"/>
      ${panel}${extra}${knob}${face}
      ${mouth ? `<path class="mouth" d="${mouth}" fill="${st.grin ? '#5a1f24' : 'none'}" stroke="${st.d}" stroke-width="2.6" stroke-linecap="round"/>` : ''}
      <ellipse class="mouth-o" cx="${cx}" cy="${my + 2}" rx="4" ry="5" fill="#5a1f24" opacity="0"/>
      ${wreath}
    </g>
    <rect x="${x0 - 14}" y="${G}" width="${dw + 28}" height="9" rx="2" fill="#6d6680"/>
    <rect class="d-winter" x="${x0 - 16}" y="${G - 2}" width="${dw + 32}" height="6" rx="3" fill="#eef2ff"/>
    ${st.round ? `<rect x="${cx - 34}" y="${G + 11}" width="68" height="10" rx="3" fill="#7a3f3f"/><text x="${cx}" y="${G + 19.5}" text-anchor="middle" font-family="M PLUS Rounded 1c, sans-serif" font-weight="800" font-size="8" fill="#f5d9a8" letter-spacing="1">DVERKA</text>` : ''}
    ${outer}
  </g>`;
  // (door metadata is filled in after insertion)
}

function signIcon(id, x, y) {
  switch (id) {
    case 'gh': return `<circle cx="${x}" cy="${y}" r="9" fill="#f4f1ea"/><g fill="#181717"><ellipse cx="${x}" cy="${y - 1}" rx="5" ry="4"/><path d="M${x - 5} ${y - 2} l1 -5 l3 3 Z M${x + 5} ${y - 2} l-1 -5 l-3 3 Z"/><rect x="${x - 2}" y="${y + 2}" width="4" height="6"/></g>`;
    case 'spigot': return `<rect x="${x - 6}" y="${y - 7}" width="12" height="3" rx="1" fill="#c9ced3"/><rect x="${x - 1}" y="${y - 5}" width="2" height="3" fill="#c9ced3"/><rect x="${x - 7}" y="${y - 2}" width="12" height="6" rx="2" fill="#9aa1a7"/><rect x="${x + 2}" y="${y + 3}" width="4" height="4" fill="#9aa1a7"/><circle cx="${x + 4}" cy="${y + 9}" r="1.6" fill="#f5a524"/>`;
    case 'modrinth': return `<image href="${MODRINTH}" x="${x - 9}" y="${y - 9}" width="18" height="18"/>`;
    case 'waka': return `<circle cx="${x}" cy="${y}" r="9" fill="#111"/><circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M${x - 4} ${y - 1} l2 3.5 l2 -3 l2 3.5 l2.5 -5" fill="none" stroke="#fff" stroke-width="1.4"/>`;
    case 'tg': return `<circle cx="${x}" cy="${y}" r="9" fill="#2aabee"/><path d="M${x - 5} ${y} L${x + 5} ${y - 4.5} L${x + 3} ${y + 5} L${x - .5} ${y + 2.5} L${x - 2} ${y + 4.5} L${x - 2} ${y + 1.5} Z" fill="#fff"/>`;
    case 'shop': return `<path d="M${x - 6} ${y + 6} L${x + 3} ${y - 3}" stroke="#d9dde2" stroke-width="3" stroke-linecap="round"/><circle cx="${x + 4}" cy="${y - 4}" r="4.5" fill="none" stroke="#d9dde2" stroke-width="2.5"/>`;
    default: return `<path d="M${x} ${y + 6} C${x - 10} ${y - 1} ${x - 5} ${y - 9} ${x} ${y - 3} C${x + 5} ${y - 9} ${x + 10} ${y - 1} ${x} ${y + 6} Z" fill="#ff8f8f"/>`;
  }
}

function houseSVG(H) {
  const { x, w, h, col } = H, y0 = GROUND - h;
  let s = roof(H, y0);
  s += `<rect x="${x}" y="${y0}" width="${w}" height="${h}" fill="${col}"/>`;
  s += `<rect x="${x}" y="${y0}" width="${w}" height="${h}" fill="url(#shade)"/>`;
  s += `<rect x="${x}" y="${y0}" width="3" height="${h}" fill="#fff" opacity=".07"/><rect x="${x + w - 4}" y="${y0}" width="4" height="${h}" fill="#000" opacity=".15"/>`;
  s += `<rect x="${x - 4}" y="${y0 - 2}" width="${w + 8}" height="9" fill="#3a3350"/>`;
  const dh = H.door.h, bandY = GROUND - dh - 70;
  s += `<rect x="${x}" y="${bandY}" width="${w}" height="5" fill="#000" opacity=".12"/>`;
  // upper windows
  const top = y0 + 34, bottom = bandY - 14, rows = Math.max(1, Math.floor((bottom - top) / 96));
  const cols = w >= 240 ? 3 : 2, ww = 36, wh = 56, arch = H.roof === 'step' || H.id === 'home';
  for (let rI = 0; rI < rows; rI++) for (let c = 0; c < cols; c++) {
    const wx = x + (c + .5) * w / cols - ww / 2, wy = top + rI * 96 + 8;
    if (H.clock && rI === 0) { if (c === 0) s += clockSVG(x + w / 2, wy + 26); continue; }
    let extra = '';
    if (H.cat && rI === rows - 1 && c === 1) extra = `<g fill="#1a1626"><ellipse cx="${wx + 18}" cy="${wy + wh - 8}" rx="11" ry="8"/><circle cx="${wx + 12}" cy="${wy + wh - 18}" r="7"/><path d="M${wx + 6} ${wy + wh - 22} l2 -8 l4 5 Z M${wx + 13} ${wy + wh - 24} l4 -7 l2 7 Z"/><path class="tail" d="M${wx + 28} ${wy + wh - 5} q8 -2 6 -14" fill="none" stroke="#1a1626" stroke-width="3" stroke-linecap="round"/></g><circle cx="${wx + 10}" cy="${wy + wh - 19}" r="1.2" fill="#ffe27a"/><circle cx="${wx + 15}" cy="${wy + wh - 19}" r="1.2" fill="#ffe27a"/>`;
    const lit = H.cat && rI === rows - 1 && c === 1 ? true : r() < .6;
    s += windowSVG(wx, wy, ww, wh, lit, arch, extra);
    if (H.id === 'gh' && rI === rows - 1 && c === 0) { // contribution-graph flower box
      s += `<rect x="${wx - 6}" y="${wy + wh + 6}" width="${ww + 12}" height="12" rx="2" fill="#4a3526"/>`;
      for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) s += `<rect x="${wx - 4 + i * 6.6}" y="${wy + wh + 7.5 + j * 5}" width="5" height="4" rx="1" fill="${['#0e4429', '#006d32', '#26a641', '#39d353'][Math.floor(r() * 4)]}"/>`;
    }
  }
  if (H.shopWin) {
    const sx = x + w / 2 + (H.door.off || 0) + H.door.w / 2 + 20, sw = x + w - 14 - sx, sy = GROUND - 112;
    s += `<rect x="${sx - 5}" y="${sy - 5}" width="${sw + 10}" height="102" rx="4" fill="#3b2a24"/>`;
    s += `<g class="win lit"><rect class="glow" x="${sx - 30}" y="${sy - 30}" width="${sw + 60}" height="150" fill="url(#winGlow)"/><rect class="glass" x="${sx}" y="${sy}" width="${sw}" height="92" rx="2"/></g>`;
    ['java', 'kotlin', 'kafka', 'docker', 'kubernetes', 'postgresql'].forEach((k, i) => {
      const ix = sx + 8 + (i % 3) * ((sw - 16) / 3), iy = sy + 10 + Math.floor(i / 3) * 40;
      s += `<rect x="${ix}" y="${iy + 26}" width="${(sw - 16) / 3 - 4}" height="3" fill="#6b4a30"/><image href="${ICONS[k]}" x="${ix + ((sw - 16) / 3 - 26) / 2}" y="${iy}" width="24" height="24"/>`;
    });
    s += `<rect x="${sx - 8}" y="${sy + 92}" width="${sw + 16}" height="7" rx="2" fill="#d9ccb4"/><rect class="d-winter" x="${sx - 9}" y="${sy + 89}" width="${sw + 18}" height="6" rx="3" fill="#eef2ff"/>`;
    s += `<path d="M${sx - 6} ${sy - 8} h${sw + 12} l-8 -16 h-${sw - 4} Z" fill="#c24a3a"/><path d="M${sx - 6} ${sy - 8} h${sw + 12}" stroke="#f5e4c8" stroke-width="3" stroke-dasharray="10 10"/>`;
  }
  s += doorSVG(H);
  return `<g class="house" id="house-${H.id}">${s}</g>`;
}

function clockSVG(cx, cy) {
  let t = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; t += `<rect x="${cx - 1}" y="${cy - 22}" width="2" height="${i % 3 ? 3 : 5}" fill="#3a3350" transform="rotate(${i * 30} ${cx} ${cy})"/>`; }
  return `<circle cx="${cx}" cy="${cy}" r="30" fill="#3a3350"/><circle cx="${cx}" cy="${cy}" r="26" fill="#f3e6c8"/>${t}
    <rect id="clock-h" x="${cx - 2}" y="${cy - 13}" width="4" height="14" rx="2" fill="#2a2238"/>
    <rect id="clock-m" x="${cx - 1.2}" y="${cy - 20}" width="2.4" height="21" rx="1.2" fill="#2a2238"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="#d23b3b"/><rect class="d-winter" x="${cx - 22}" y="${cy - 34}" width="44" height="7" rx="3.5" fill="#eef2ff"/>`;
}

function street() {
  let s = `<rect x="0" y="${GROUND}" width="1600" height="32" fill="#4b4663"/><rect x="0" y="${GROUND + 30}" width="1600" height="7" fill="#5f5a78"/>`;
  s += `<rect x="0" y="${GROUND + 37}" width="1600" height="${900 - GROUND - 37}" fill="url(#road)"/><rect x="0" y="${GROUND + 37}" width="1600" height="${900 - GROUND - 37}" fill="url(#cobble)"/>`;
  s += `<g class="d-winter"><rect x="0" y="${GROUND - 1}" width="1600" height="30" fill="#dfe6f7" opacity=".9"/><rect x="0" y="${GROUND + 37}" width="1600" height="163" fill="#cfd8ee" opacity=".16"/>`;
  for (let i = 0; i < 16; i++) s += `<ellipse cx="${(r() * 1600).toFixed(0)}" cy="${GROUND + 30}" rx="${(20 + r() * 40).toFixed(0)}" ry="7" fill="#eef2ff"/>`;
  s += `</g><g class="d-autumn">`;
  for (let i = 0; i < 6; i++) { const px = 80 + r() * 1440, py = 800 + r() * 70; s += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${(40 + r() * 40).toFixed(0)}" ry="8" fill="#6d6a95" opacity=".35"/><ellipse cx="${(px + 8).toFixed(0)}" cy="${py.toFixed(0)}" rx="12" ry="2" fill="#ffc06a" opacity=".3"/>`; }
  for (let i = 0; i < 60; i++) s += `<ellipse cx="${(r() * 1600).toFixed(0)}" cy="${(GROUND + 4 + r() * 150).toFixed(0)}" rx="3.5" ry="2" fill="${['#e07b2a', '#c9452f', '#e8b23a'][i % 3]}" opacity=".85"/>`;
  s += `</g><g class="d-spring">`;
  for (let i = 0; i < 50; i++) s += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(GROUND + 4 + r() * 150).toFixed(0)}" r="1.8" fill="#ffc9d9" opacity=".8"/>`;
  s += `</g>`;
  return s;
}
function lampPools() { return [210, 660, 940, 1390].map(x => `<ellipse cx="${x}" cy="812" rx="120" ry="30" fill="url(#poolGlow)"/>`).join(''); }
function lamps() {
  return [210, 660, 940, 1390].map(x => `<g>
    <circle cx="${x}" cy="566" r="90" fill="url(#lampGlow)"/>
    <rect x="${x - 3}" y="572" width="6" height="238" fill="#1b1a2c"/><rect x="${x - 8}" y="800" width="16" height="14" rx="3" fill="#1b1a2c"/>
    <path d="M${x - 11} 560 L${x + 11} 560 L${x + 8} 580 L${x - 8} 580 Z" fill="#ffd48a"/><path d="M${x - 14} 560 L${x} 546 L${x + 14} 560 Z" fill="#1b1a2c"/><rect x="${x - 9}" y="580" width="18" height="4" fill="#1b1a2c"/>
    <path class="d-winter" d="M${x - 14} 559 L${x} 545 L${x + 14} 559" fill="none" stroke="#eef2ff" stroke-width="5" stroke-linecap="round"/>
    <g class="d-winter"><path d="M${x - 3} 640 q14 10 0 20 q-14 10 0 20" fill="none" stroke="#d23b3b" stroke-width="6"/><path d="M${x - 3} 640 q14 10 0 20 q-14 10 0 20" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="6 6"/></g>
  </g>`).join('');
}

function buildScene() {
  let s = defs() + sky();
  s += `<g id="houses">${HOUSES.map(houseSVG).join('')}</g>`;
  s += `<path id="rope" d="" fill="none" stroke="#1d1a2b" stroke-width="1.6"/><g id="rope-deco"></g>`;
  s += street() + lampPools();
  s += `<g id="mascot-layer"></g>`;
  s += lamps();
  svg.innerHTML = s;
  // rope across the street for garlands / bunting
  const anchors = [0, 220, 450, 670, 950, 1170, 1400, 1600];
  let d = `M0 452`;
  for (let i = 1; i < anchors.length; i++) d += ` Q${(anchors[i - 1] + anchors[i]) / 2} ${490} ${anchors[i]} 452`;
  const rope = $('#rope'); rope.setAttribute('d', d);
  const len = rope.getTotalLength(); let deco = '<g class="d-winter">', bunt = '<g class="d-summer d-spring">', cols = ['#ff5a5a', '#ffd46a', '#6fdc8c', '#6ab8ff', '#e79bff'];
  for (let l = 12, i = 0; l < len; l += 26, i++) {
    const p = rope.getPointAtLength(l);
    deco += `<circle class="bulb" cx="${p.x.toFixed(1)}" cy="${(p.y + 5).toFixed(1)}" r="4" fill="${cols[i % 5]}" style="animation-delay:${(i % 3) * .5}s"/><circle cx="${p.x.toFixed(1)}" cy="${(p.y + 5).toFixed(1)}" r="10" fill="${cols[i % 5]}" opacity=".18"/>`;
    bunt += `<path d="M${(p.x - 8).toFixed(1)} ${p.y.toFixed(1)} L${(p.x + 8).toFixed(1)} ${p.y.toFixed(1)} L${p.x.toFixed(1)} ${(p.y + 16).toFixed(1)} Z" fill="${cols[i % 5]}" opacity=".9"/>`;
  }
  $('#rope-deco').innerHTML = deco + '</g>' + bunt + '</g>';
  // door metadata
  HOUSES.forEach(H => {
    const el = $('#door-' + H.id), D = H.door;
    const cx = H.x + H.w / 2 + (D.off || 0);
    DOORS[H.id] = {
      H, el, cx, x0: cx - D.w / 2, dw: D.w, dh: D.h, open: 0, target: 0, lid: DS[D.style].sleepy ? .5 : 0, blinkT: 1 + Math.random() * 5, blink: 0,
      eyeY: GROUND - D.h + (DS[D.style].round ? D.h * .47 : D.h * .3), ery: D.w * .125,
      leaf: el.querySelector('.leaf'), pup: el.querySelector('.pup'), lidEl: el.querySelector('.lid'), spill: el.querySelector('.spill'),
      mouthO: el.querySelector('.mouth-o'), mouth: el.querySelector('.mouth'), sign: el.querySelector('.sign'), sa: 0, sv: 0, awake: false,
    };
  });
}
