// Cartoon engine lib.js v3 (2026-11-11): full v2 library + yawn-short helpers at the end
'use strict';
const W = 1080, H = 1920;
const INK = '#1c1c1e', OUT = 7;
const WHITE = '#ffffff', SHADE = '#e4e8ee';
const CAP = '#e8413a', SKIN_PINK = '#ff8fa3';
const F_SKIN = '#ffc978', F_SHADE = '#f2ad52';

let _id = 0;
const uid = (p) => p + (++_id);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eio = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eo = (u) => 1 - Math.pow(1 - u, 3);
const ei = (u) => u * u * u;
const D2R = Math.PI / 180;
const n = (v) => Math.round(v * 100) / 100;

function pop(t, t0, f = 2.0, d = 7) {
  if (t < t0) return 0;
  const x = t - t0;
  return 1 - Math.exp(-d * x) * Math.cos(2 * Math.PI * f * x);
}
function wob(t, t0, amp, f = 3, d = 5) {
  if (t < t0) return 0;
  const x = t - t0;
  return amp * Math.exp(-d * x) * Math.sin(2 * Math.PI * f * x);
}
function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
const rot = (x, y, deg) => {
  const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R);
  return [x * c - y * s, x * s + y * c];
};
const txt = (x, y, str, size, fill, o = {}) =>
  `<text x="${n(x)}" y="${n(y)}" text-anchor="${o.anchor || 'middle'}" font-family="Inter" font-weight="900" font-size="${size}" letter-spacing="${o.ls || 0}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 8}" paint-order="stroke" stroke-linejoin="round"` : ''}${o.op !== undefined ? ` opacity="${n(o.op)}"` : ''}>${str}</text>`;
const popG = (x, y, sc, inner, r = 0) => sc <= 0.01 ? '' : `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(r)}) scale(${n(sc)})">${inner}</g>`;

function star(cx, cy, r, ang) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (ang + i * 36 - 90) * D2R;
    d += (i ? 'L' : 'M') + n(cx + rr * Math.cos(a)) + ',' + n(cy + rr * Math.sin(a));
  }
  return `<path d="${d}Z" fill="#ffd23f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
}
function impactLines(x, y, t, t0, dir = 180, len = 60, r0 = 30, count = 5, spread = 120, w = 7) {
  const u = prog(t, t0, t0 + 0.28);
  if (u <= 0 || u >= 1) return '';
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = (dir - spread / 2 + (spread * i) / (count - 1)) * D2R;
    const a0 = r0 + u * 40, a1 = a0 + len * (1 - u);
    s += `<line x1="${n(x + a0 * Math.cos(a))}" y1="${n(y + a0 * Math.sin(a))}" x2="${n(x + a1 * Math.cos(a))}" y2="${n(y + a1 * Math.sin(a))}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return s;
}
function tears(ex, ey, t, side, on) {
  if (!on) return '';
  let s = '';
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 2.2 + i / 3) % 1);
    const x = ex + side * (14 + ph * 46), y = ey - 6 - 30 * ph + 70 * ph * ph;
    const r = 7 * (1 - ph * 0.5);
    s += `<path d="M${n(x)},${n(y - r * 1.6)} C${n(x + r)},${n(y - r * 0.4)} ${n(x + r)},${n(y + r)} ${n(x)},${n(y + r)} C${n(x - r)},${n(y + r)} ${n(x - r)},${n(y - r * 0.4)} ${n(x)},${n(y - r * 1.6)} Z" fill="#8fd3ff" stroke="${INK}" stroke-width="3"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ the guy (round head), facing left
function noodle(sx, sy, hx, hy, bend, col = WHITE) {
  const mx = (sx + hx) / 2, my = (sy + hy) / 2;
  let px = -(hy - sy), py = hx - sx;
  const L = Math.hypot(px, py) || 1;
  px /= L; py /= L;
  const cx = mx + px * bend, cy = my + py * bend;
  const d = `M${n(sx)},${n(sy)} Q${n(cx)},${n(cy)} ${n(hx)},${n(hy)}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="13" stroke-linecap="round"/>`;
}
function hand(x, y, col = WHITE, point = null) {
  let s = '';
  if (point !== null) {
    const [dx, dy] = [Math.cos(point * D2R), Math.sin(point * D2R)];
    const fx = x + dx * 30, fy = y + dy * 30;
    s += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(fx)}" y2="${n(fy)}" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>`;
    s += `<line x1="${n(x)}" y1="${n(y)}" x2="${n(fx)}" y2="${n(fy)}" stroke="${col}" stroke-width="10" stroke-linecap="round"/>`;
  }
  return s + `<circle cx="${n(x)}" cy="${n(y)}" r="16" fill="${col}" stroke="${INK}" stroke-width="6"/>`;
}
function guyHead(o) {
  const c = uid('gh');
  const skin = o.skin || WHITE, shade = o.shade || SHADE;
  let s = `<defs><clipPath id="${c}"><circle cx="0" cy="-300" r="72"/></clipPath></defs>
    <circle cx="0" cy="-300" r="72" fill="${skin}"/>
    <g clip-path="url(#${c})"><circle cx="38" cy="-282" r="62" fill="${shade}"/><circle cx="-6" cy="-310" r="70" fill="${skin}"/></g>
    <circle cx="0" cy="-300" r="72" fill="none" stroke="${INK}" stroke-width="${OUT}"/>`;
  if (o.tuft) s += `<path d="M-6,-370 C-2,-400 22,-404 26,-384 C14,-392 6,-386 4,-371" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  return s + guyFace(o);
}
function guy(o) {
  const skin = o.skin || WHITE, shade = o.shade || SHADE, body = o.body || skin, legs = o.legs || body, bshade = o.body ? 'rgba(0,0,0,0.14)' : shade;
  let s = '';
  s += `<path d="M-22,-96 L-26,-14 M22,-96 L22,-14" fill="none" stroke="${INK}" stroke-width="32" stroke-linecap="round"/>`;
  s += `<path d="M-22,-96 L-26,-14 M22,-96 L22,-14" fill="none" stroke="${legs}" stroke-width="18" stroke-linecap="round"/>`;
  s += `<ellipse cx="-40" cy="-9" rx="28" ry="13" fill="${skin}" stroke="${INK}" stroke-width="6"/>`;
  s += `<ellipse cx="8" cy="-9" rx="28" ry="13" fill="${skin}" stroke="${INK}" stroke-width="6"/>`;
  const bc = uid('gb');
  const bd = 'M-46,-214 C-60,-160 -64,-112 -52,-88 Q0,-70 52,-88 C64,-112 60,-160 46,-214 Q0,-236 -46,-214 Z';
  s += `<defs><clipPath id="${bc}"><path d="${bd}"/></clipPath></defs>`;
  s += `<path d="${bd}" fill="${body}"/><g clip-path="url(#${bc})"><ellipse cx="54" cy="-150" rx="30" ry="90" fill="${bshade}"/></g>`;
  s += `<path d="${bd}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  const L = o.armL || [-64, -118], R = o.armR || [64, -118];
  s += noodle(40, -196, R[0], R[1], o.bendR === undefined ? 18 : o.bendR, body);
  s += guyHead(o);
  s += noodle(-40, -196, L[0], L[1], o.bendL === undefined ? -18 : o.bendL, body);
  if (o.propBehind) s = o.propBehind + s;
  if (o.prop) s += o.prop;
  s += hand(L[0], L[1], skin, o.pointL === undefined ? null : o.pointL) + hand(R[0], R[1], skin, o.pointR === undefined ? null : o.pointR);
  if (o.propFront) s += o.propFront;
  return `<g transform="rotate(${n(o.lean || 0)}) scale(${n(o.sx || 1)} ${n(o.sy || 1)})">${s}</g>`;
}
function shadow(x, y, rx, ry = 14, op = 0.26) {
  return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${ry}" fill="rgba(72,54,42,${op})" filter="url(#soft)"/>`;
}
function brain(cx, cy, r) {
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(r / 100)})">`;
  s += `<path d="M-95,10 C-110,-40 -70,-85 -25,-80 C-5,-105 45,-100 60,-70 C100,-70 115,-20 95,10 C110,50 70,85 30,75 C10,95 -40,95 -55,70 C-90,75 -110,40 -95,10 Z" fill="#f7a8c1" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-60,-40 q20,-20 40,0 M10,-55 q25,-10 35,15 M-70,25 q25,-15 45,5 M5,10 q20,25 50,5 M-20,55 q20,-15 35,5" fill="none" stroke="#d6698f" stroke-width="7" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function xray(cx, cy, r, sc) {
  if (sc <= 0.01) return '';
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">
    <circle r="${n(r)}" fill="#203154" stroke="${INK}" stroke-width="${OUT}"/>
    <circle r="${n(r * 0.86)}" fill="none" stroke="#e9f1ff" stroke-width="${n(Math.max(5, r * 0.07))}" opacity="0.9"/>
  </g>`;
}
function cloud(cx, cy, rx, ry, sc, tail = null) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">`;
  const bumps = 11;
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * 2 * Math.PI;
    const x = rx * Math.cos(a), y = ry * Math.sin(a);
    if (i === 0) d += `M${n(x)},${n(y)}`;
    else {
      const am = ((i - 0.5) / bumps) * 2 * Math.PI;
      d += ` Q${n(rx * 1.22 * Math.cos(am))},${n(ry * 1.25 * Math.sin(am))} ${n(x)},${n(y)}`;
    }
  }
  s += `<path d="${d}Z" fill="#fff" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += `</g>`;
  if (tail) {
    const [tx, ty] = tail;
    for (let i = 0; i < 3; i++) {
      const u = 0.25 + i * 0.25;
      const x = lerp(cx, tx, u), y = lerp(cy + ry * 0.8 * sc, ty, u);
      s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n((16 - i * 4) * sc)}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    }
  }
  return s;
}
function drop(x, y, r, col = '#8fd3ff') {
  return `<path d="M${n(x)},${n(y - r * 1.7)} C${n(x + r)},${n(y - r * 0.4)} ${n(x + r)},${n(y + r)} ${n(x)},${n(y + r)} C${n(x - r)},${n(y + r)} ${n(x - r)},${n(y - r * 0.4)} ${n(x)},${n(y - r * 1.7)} Z" fill="${col}" stroke="${INK}" stroke-width="4"/>`;
}
function stamp(x, y, sc, label, col, ang) {
  return popG(x, y, sc, `<rect x="-230" y="-80" width="460" height="160" rx="24" fill="none" stroke="${col}" stroke-width="16"/>` + txt(0, 34, label, 104, col, { ls: 8 }), ang);
}
function check(x, y, sc, ok) {
  const inner = ok
    ? `<circle r="56" fill="#5cc96b" stroke="${INK}" stroke-width="8"/><path d="M-26,0 L-6,22 L28,-20" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle r="56" fill="#ff5a4e" stroke="${INK}" stroke-width="8"/><path d="M-20,-20 L20,20 M20,-20 L-20,20" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>`;
  return popG(x, y, sc, inner);
}
function camAt(keys, t) {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], k: keys[0][3] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1, k1] = keys[i];
    const [t0, x0, y0, k0] = keys[i - 1];
    if (t <= t1) {
      const u = eio(prog(t, t0, t1));
      return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), k: Math.exp(lerp(Math.log(k0), Math.log(k1), u)) };
    }
  }
  const L = keys[keys.length - 1];
  return { x: L[1], y: L[2], k: L[3] };
}
function layer(cam, Z, content, blur = 0) {
  const camZ = 1000 - 1000 / cam.k;
  const d = Z - camZ;
  if (d < 300) return '';
  const k = 1000 / d;
  const tr = `translate(540 960) scale(${n(k * 1000) / 1000}) translate(${n(-cam.x)} ${n(-cam.y)})`;
  const inner = `<g transform="${tr}">${content}</g>`;
  if (blur > 0.05) return `<g filter="url(#blur${Math.round(blur * 10)})">${inner}</g>`;
  return inner;
}
const T = window.T;

const FLOOR = 1450;
function livingWall() {
  let s = `<rect x="-3000" y="-2000" width="9000" height="${FLOOR + 2000}" fill="#ffe2ad"/>`;
  for (let x = -2000; x < 4000; x += 120) s += `<rect x="${x}" y="-2000" width="50" height="${FLOOR + 2000}" fill="#ffd796" opacity="0.7"/>`;
  s += `<rect x="40" y="560" width="300" height="380" rx="10" fill="#9fdcff" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<circle cx="120" cy="650" r="34" fill="#fff6b0"/>`;
  s += `<path d="M60,880 Q130,800 210,860 Q260,820 320,860 L320,930 L60,930 Z" fill="#8cd16a"/>`;
  s += `<line x1="190" y1="560" x2="190" y2="940" stroke="${INK}" stroke-width="${OUT}"/><line x1="40" y1="750" x2="340" y2="750" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="20" y="935" width="340" height="26" rx="6" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  s += `<rect x="880" y="640" width="230" height="180" rx="8" fill="#fff" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="898" y="658" width="194" height="144" fill="#bfe7ff"/><path d="M898,802 L960,720 L1010,770 L1040,740 L1092,802 Z" fill="#7cbf5a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<line x1="1240" y1="${FLOOR}" x2="1240" y2="1000" stroke="${INK}" stroke-width="12"/><path d="M1180,1000 L1300,1000 L1270,900 L1210,900 Z" fill="#ffd23f" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += `<rect x="-3000" y="${FLOOR - 40}" width="9000" height="40" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  return s;
}
function livingFloor() {
  let s = `<rect x="-3000" y="${FLOOR}" width="9000" height="3000" fill="#d39a62"/>`;
  s += `<line x1="-3000" y1="${FLOOR}" x2="6000" y2="${FLOOR}" stroke="${INK}" stroke-width="6"/>`;
  for (let y = FLOOR + 70; y < FLOOR + 900; y += 90) s += `<line x1="-3000" y1="${y}" x2="6000" y2="${y}" stroke="#b98149" stroke-width="6"/>`;
  s += `<ellipse cx="560" cy="${FLOOR + 40}" rx="330" ry="46" fill="#7fb8e6" stroke="${INK}" stroke-width="6"/>`;
  s += `<ellipse cx="560" cy="${FLOOR + 40}" rx="270" ry="32" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="14 12"/>`;
  return s;
}
function plant(x, y, sc) {
  return `<g transform="translate(${x} ${y}) scale(${sc})">
    <path d="M-10,-120 C-60,-200 -120,-210 -140,-190 C-110,-180 -60,-150 -20,-110 Z" fill="#5aa13d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M10,-120 C40,-230 110,-250 130,-230 C100,-210 60,-170 22,-112 Z" fill="#6cb24a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M0,-120 C-10,-240 20,-300 40,-310 C40,-270 30,-200 12,-118 Z" fill="#4b8f32" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-70,-130 L70,-130 L54,0 L-54,0 Z" fill="#e8834a" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
    <rect x="-80" y="-150" width="160" height="34" rx="8" fill="#f09a63" stroke="${INK}" stroke-width="${OUT}"/></g>`;
}
const ICE = '#cdefff', ICE_D = '#8fd3ff', COLD = '#4fb3f0';
const ART = '#e8413a';
function label(x, y, sc, str, bg, fg = INK, size = 50) {
  return popG(x, y, sc, `<rect x="${-(str.length * size * 0.36 + 34)}" y="${-size * 0.95}" width="${str.length * size * 0.72 + 68}" height="${size * 1.65}" rx="18" fill="${bg}" stroke="${INK}" stroke-width="${OUT}"/>` + txt(0, size * 0.33, str, size, fg, { ls: 3 }));
}
function snowflake(x, y, r, ang, col = '#fff') {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><path d="M${-r},0 L${r},0 M0,${-r} L0,${r} M${n(-r * 0.7)},${n(-r * 0.7)} L${n(r * 0.7)},${n(r * 0.7)} M${n(-r * 0.7)},${n(r * 0.7)} L${n(r * 0.7)},${n(-r * 0.7)}" stroke="${col}" stroke-width="${n(r * 0.22)}" stroke-linecap="round"/></g>`;
}
function thermometer(x, y, sc, level, labelTxt) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<rect x="-34" y="-300" width="68" height="300" rx="34" fill="#fff" stroke="${INK}" stroke-width="8"/>`;
  s += `<circle cx="0" cy="20" r="56" fill="${CAP}" stroke="${INK}" stroke-width="8"/>`;
  s += `<rect x="-16" y="${n(-20 - 260 * level)}" width="32" height="${n(260 * level + 30)}" rx="12" fill="${CAP}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="14" y1="${-60 - i * 40}" x2="34" y2="${-60 - i * 40}" stroke="${INK}" stroke-width="5"/>`;
  s += txt(0, 130, labelTxt, 60, INK);
  return s + `</g>`;
}


// ====================================================== (rest of the original lib.js pieces)
const FEATHER_C = '#ff6fae', FEATHER_D = '#d94a8c';
const CB = '#b98cf0', CB_D = '#8f62d1';
function spiralEye(cx, cy, r, t) {
  let d = '';
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const a = u * 2.4 * 2 * Math.PI + t * 9;
    d += (i ? 'L' : 'M') + n(cx + u * r * Math.cos(a)) + ',' + n(cy + u * r * Math.sin(a));
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
}
function feather(x, y, ang, len = 100, flutter = 0) {
  const L = len;
  const f = flutter;
  const vane = `M${n(L * 0.18)},0 C${n(L * 0.35)},${n(-L * 0.24 + f)} ${n(L * 0.85)},${n(-L * 0.22 + f)} ${n(L * 1.02)},${n(f * 1.4)} C${n(L * 0.85)},${n(L * 0.2 + f)} ${n(L * 0.35)},${n(L * 0.22 + f)} ${n(L * 0.18)},0 Z`;
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})">`;
  s += `<path d="${vane}" fill="${FEATHER_C}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  for (let i = 1; i <= 4; i++) {
    const px = L * (0.3 + i * 0.15), off = f * (0.3 + i * 0.2);
    s += `<path d="M${n(px)},${n(off * 0.5)} L${n(px + L * 0.08)},${n(-L * 0.13 + off)} M${n(px)},${n(off * 0.5)} L${n(px + L * 0.08)},${n(L * 0.13 + off)}" stroke="${FEATHER_D}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  s += `<path d="M0,0 Q${n(L * 0.5)},${n(f * 0.4)} ${n(L)},${n(f * 1.3)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  s += `</g>`;
  return s;
}
function wiggles(x, y, t, amp, ang = 0) {
  if (amp <= 0.02) return '';
  let s = '';
  for (let i = 0; i < 3; i++) {
    const a = (ang - 50 + i * 50) * D2R;
    const r0 = 34 + 6 * Math.sin(t * 20 + i);
    const cx = x + r0 * Math.cos(a), cy = y + r0 * Math.sin(a);
    const L = 26 * amp;
    const ph = t * 30 + i * 2;
    let d = '';
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const px = cx + Math.cos(a) * L * u + Math.cos(a + Math.PI / 2) * 6 * amp * Math.sin(ph + u * 9);
      const py = cy + Math.sin(a) * L * u + Math.sin(a + Math.PI / 2) * 6 * amp * Math.sin(ph + u * 9);
      d += (k ? 'L' : 'M') + n(px) + ',' + n(py);
    }
    s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return s;
}
function haBurst(cx, cy, t, t0, t1, every = 0.16, big = 1, seed = 1) {
  let s = '';
  const cols = ['#ffd23f', '#ff6fae', '#5cc9ff', '#7ee07a'];
  for (let i = 0; ; i++) {
    const ts = t0 + i * every;
    if (ts > t || ts > t1) break;
    const age = t - ts;
    if (age > 0.85) continue;
    const r = rng(seed * 100 + i);
    const side = i % 2 ? 1 : -1;
    const x = cx + side * (70 + r() * 110) + side * age * 60;
    const y = cy - 30 - r() * 90 - age * 170;
    const sc = clamp(pop(t, ts, 2.6, 8), 0, 1.3) * big * (0.75 + r() * 0.5) * (1 - prog(age, 0.6, 0.85));
    s += popG(x, y, sc, txt(0, 0, 'HA', 70, cols[i % 4], { stroke: INK, sw: 9 }), side * (8 + r() * 14));
  }
  return s;
}
function guyFace(o) {
  const lx = o.lookX || 0, ly = o.lookY || 0;
  const skin = o.skin || WHITE;
  const e1 = [-34 + lx, -306 + ly], e2 = [0 + lx, -306 + ly];
  let s = '';
  const ex = o.expr || 'curious';
  const eye = (x, y, big = 1) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(9 * big)}" ry="${n(13 * big)}" fill="${INK}"/><circle cx="${n(x + 3)}" cy="${n(y - 5)}" r="3.2" fill="#fff"/>`;
  const lid = (x, y) => `<path d="M${n(x - 12)},${n(y + 1)} L${n(x - 12)},${n(y - 16)} L${n(x + 12)},${n(y - 16)} L${n(x + 12)},${n(y + 1)} Z" fill="${skin}"/><line x1="${n(x - 12)}" y1="${n(y + 1)}" x2="${n(x + 12)}" y2="${n(y)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  const brow = (x, y, tilt, lift = 0) => `<path d="M${n(x - 13)},${n(y - 24 - lift + tilt)} Q${n(x)},${n(y - 32 - lift)} ${n(x + 13)},${n(y - 24 - lift - tilt)}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`;
  const mx = -17 + lx * 0.6, my = -262 + ly * 0.4;
  if (ex === 'cry') {
    for (const [x, y] of [e1, e2]) s += `<path d="M${n(x - 12)},${n(y - 4)} Q${n(x)},${n(y + 9)} ${n(x + 12)},${n(y - 4)}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    s += brow(e1[0], e1[1], 8, 10) + brow(e2[0], e2[1], -8, 10);
    const w = 20, h = 26 * (o.mouthOpen === undefined ? 1 : o.mouthOpen);
    s += `<path d="M${n(mx - w)},${n(my + 6)} Q${n(mx)},${n(my - 14)} ${n(mx + w)},${n(my + 6)} Q${n(mx + w - 4)},${n(my + 6 + h)} ${n(mx)},${n(my + 8 + h)} Q${n(mx - w + 4)},${n(my + 6 + h)} ${n(mx - w)},${n(my + 6)} Z" fill="${INK}"/>`;
    s += `<ellipse cx="${n(mx)}" cy="${n(my + 2 + h)}" rx="9" ry="${n(Math.max(2, h * 0.16))}" fill="${SKIN_PINK}"/>`;
    return s;
  }
  if (ex === 'laugh') {
    for (const [x, y] of [e1, e2]) s += `<path d="M${n(x - 11)},${n(y + 5)} Q${n(x)},${n(y - 12)} ${n(x + 11)},${n(y + 5)}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    s += brow(e1[0], e1[1], 5, 8) + brow(e2[0], e2[1], -5, 8);
    const w = 24, h = 34 * (o.mouthOpen === undefined ? 1 : o.mouthOpen);
    s += `<path d="M${n(mx - w)},${n(my - 8)} Q${n(mx)},${n(my - 12)} ${n(mx + w)},${n(my - 8)} Q${n(mx + w - 2)},${n(my - 8 + h)} ${n(mx)},${n(my - 6 + h)} Q${n(mx - w + 2)},${n(my - 8 + h)} ${n(mx - w)},${n(my - 8)} Z" fill="${INK}"/>`;
    s += `<ellipse cx="${n(mx + 2)}" cy="${n(my - 10 + h * 0.85)}" rx="${n(13)}" ry="${n(Math.max(2, h * 0.18))}" fill="${SKIN_PINK}"/>`;
    s += `<path d="M${n(mx - w + 6)},${n(my - 8)} L${n(mx + w - 6)},${n(my - 8)}" stroke="#fff" stroke-width="5"/>`;
    s += `<ellipse cx="${n(e1[0] - 8)}" cy="${n(e1[1] + 22)}" rx="11" ry="6" fill="#ffb3c2" opacity="0.8"/>`;
    s += tears(e1[0] - 6, e1[1] + 2, o.t || 0, -1, o.tears) + tears(e2[0] + 6, e2[1] + 2, (o.t || 0) + 0.21, 1, o.tears);
  } else if (ex === 'flat') {
    s += eye(e1[0], e1[1]) + eye(e2[0], e2[1]) + lid(e1[0], e1[1]) + lid(e2[0], e2[1]);
    s += brow(e1[0], e1[1], 0, -2) + brow(e2[0], e2[1], 0, -2);
    s += `<line x1="${n(mx - 13)}" y1="${n(my)}" x2="${n(mx + 13)}" y2="${n(my)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else if (ex === 'smug') {
    s += eye(e1[0], e1[1]) + eye(e2[0], e2[1]) + lid(e1[0], e1[1]) + lid(e2[0], e2[1]);
    s += brow(e1[0], e1[1], 2, 2) + brow(e2[0], e2[1], -6, 6);
    s += `<path d="M${n(mx - 14)},${n(my - 2)} Q${n(mx + 2)},${n(my + 10)} ${n(mx + 16)},${n(my - 7)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else if (ex === 'surprised') {
    s += eye(e1[0], e1[1], 1.3) + eye(e2[0], e2[1], 1.3);
    s += brow(e1[0], e1[1], 0, 12) + brow(e2[0], e2[1], 0, 12);
    s += `<ellipse cx="${n(mx)}" cy="${n(my + 2)}" rx="9" ry="13" fill="${INK}"/>`;
  } else {
    const big = ex === 'worried' ? 1.15 : 1;
    s += eye(e1[0], e1[1], big) + eye(e2[0], e2[1], big);
    if (ex === 'curious') {
      s += brow(e1[0], e1[1], 0, 6) + brow(e2[0], e2[1], 0, 6);
      s += `<ellipse cx="${n(mx)}" cy="${n(my)}" rx="7" ry="9" fill="${INK}"/>`;
    } else if (ex === 'determined') {
      s += brow(e1[0], e1[1], -5, -2) + brow(e2[0], e2[1], 5, -2);
      s += `<path d="M${n(mx - 14)},${n(my - 3)} Q${n(mx)},${n(my + 9)} ${n(mx + 14)},${n(my - 3)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    } else if (ex === 'confused') {
      s += brow(e1[0], e1[1], 0, 10) + brow(e2[0], e2[1], 4, -2);
      s += `<line x1="${n(mx - 12)}" y1="${n(my + 4)}" x2="${n(mx + 10)}" y2="${n(my - 3)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    } else {
      s += brow(e1[0], e1[1], 0, 2) + brow(e2[0], e2[1], 0, 2);
      s += `<path d="M${n(mx - 14)},${n(my - 3)} Q${n(mx)},${n(my + 10)} ${n(mx + 14)},${n(my - 3)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    }
  }
  return s;
}
function guyPt(gx, gy, o, lx, ly) {
  const [rx, ry] = rot(lx * (o.sx || 1), ly * (o.sy || 1), o.lean || 0);
  return [gx + rx, gy + ry + (o.hop || 0)];
}
const PIT = [50, -188];
function selfTickle(o, t, amp = 1) {
  o.armR = [96, -330 + 4 * Math.sin(t * 3)];
  o.bendR = -24;
  const ph = t * 2 * Math.PI * 5.5;
  const k = 6 * amp * Math.sin(ph);
  const ang = -38;
  const [dx, dy] = [Math.cos(ang * D2R), Math.sin(ang * D2R)];
  const len = 92;
  const hx = PIT[0] - dx * (len + 6) + dx * k, hy = PIT[1] - dy * (len + 6) + dy * k;
  o.armL = [hx, hy];
  o.bendL = 20;
  o.prop = feather(hx, hy, ang, len, 7 * amp * Math.sin(ph * 1.3));
  return o;
}
function laughPose(o, t, x, power = 1) {
  o.expr = 'laugh'; o.tears = x > 0.25; o.t = t;
  const s = Math.min(1, x / 0.25) * power;
  o.lean = 9 * s + 5 * s * Math.sin(2 * Math.PI * 5.2 * t);
  o.sy = 1 + 0.05 * s * Math.sin(2 * Math.PI * 10.4 * t);
  o.sx = 1 - 0.03 * s * Math.sin(2 * Math.PI * 10.4 * t);
  o.hop = -26 * s * Math.abs(Math.sin(2 * Math.PI * 2.6 * t));
  o.mouthOpen = 0.75 + 0.25 * Math.abs(Math.sin(2 * Math.PI * 5.2 * t));
  const j = 8 * Math.sin(2 * Math.PI * 10.4 * t);
  o.armL = [-42, -128 + j]; o.armR = [46, -124 - j];
  o.bendL = -22; o.bendR = 22;
  o.prop = '';
  return o;
}
function cerebellum(cx, cy, r, mood, t, o = {}) {
  if (r <= 0.5) return '';
  const c = uid('cb');
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${n(o.rot || 0)}) scale(${n(r / 100)})">`;
  s += `<defs><clipPath id="${c}"><ellipse rx="100" ry="70"/></clipPath></defs>`;
  s += `<ellipse rx="100" ry="70" fill="${CB}"/>`;
  s += `<g clip-path="url(#${c})"><path d="M-110,-38 Q0,-20 110,-38 M-110,-6 Q0,12 110,-6 M-110,32 Q0,50 110,32" fill="none" stroke="${CB_D}" stroke-width="9"/><ellipse cx="30" cy="40" rx="90" ry="40" fill="${CB_D}" opacity="0.35"/></g>`;
  s += `<ellipse rx="100" ry="70" fill="none" stroke="${INK}" stroke-width="9"/>`;
  const lx = (o.lookX || 0) * 10, ly = (o.lookY || 0) * 10;
  for (const ex of [-30, 30]) {
    const x = ex + lx, y = -8 + ly;
    if (mood === 'spiral') { s += spiralEye(x, y, 18, t + ex * 0.01).replace('stroke-width="4.5"', 'stroke-width="6"'); continue; }
    const big = mood === 'wide' ? 1.3 : 1;
    s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(12 * big)}" ry="${n(17 * big)}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    s += `<circle cx="${n(x + lx * 0.4)}" cy="${n(y + 3 + ly * 0.4)}" r="${n(7 * big)}" fill="${INK}"/>`;
    if (mood === 'smug') s += `<path d="M${n(x - 15)},${n(y - 2)} L${n(x - 15)},${n(y - 22)} L${n(x + 15)},${n(y - 22)} L${n(x + 15)},${n(y - 2)} Z" fill="${CB}"/><line x1="${n(x - 15)}" y1="${n(y - 2)}" x2="${n(x + 15)}" y2="${n(y - 3)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  }
  if (mood === 'confused') s += `<path d="M-46,-38 Q-30,-48 -14,-40 M14,-46 Q30,-36 46,-44" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  if (mood === 'smug') s += `<path d="M-12,30 Q4,42 20,26" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  else if (mood === 'wide' || mood === 'spiral') s += `<ellipse cx="2" cy="34" rx="12" ry="14" fill="${INK}"/>`;
  else if (mood === 'confused') s += `<path d="M-14,34 q7,-8 14,0 q7,8 14,0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  else s += `<path d="M-14,28 Q2,38 18,28" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  s += `</g>`;
  return s;
}
function gauge(cx, cy, r, needle, sc, label = '') {
  if (sc <= 0.01) return '';
  const arc = (a0, a1, col) => {
    const p = (a) => [cx + r * Math.cos((a - 90) * D2R), cy + r * Math.sin((a - 90) * D2R)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `<path d="M${n(x0)},${n(y0)} A${r},${r} 0 0 1 ${n(x1)},${n(y1)}" fill="none" stroke="${col}" stroke-width="${n(r * 0.25)}"/>`;
  };
  let s = `<g transform="translate(${cx} ${cy}) scale(${n(sc)}) translate(${-cx} ${-cy})">`;
  s += `<path d="M${n(cx - r - r * 0.23)},${n(cy + r * 0.13)} A${n(r * 1.23)},${n(r * 1.23)} 0 0 1 ${n(cx + r + r * 0.23)},${n(cy + r * 0.13)} Z" fill="#fff" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += arc(-88, -30, '#5cc96b') + arc(-30, 30, '#ffd23f') + arc(30, 88, '#ff5a4e');
  const [nx, ny] = [cx + (r - 6) * Math.cos((needle - 90) * D2R), cy + (r - 6) * Math.sin((needle - 90) * D2R)];
  s += `<line x1="${cx}" y1="${cy}" x2="${n(nx)}" y2="${n(ny)}" stroke="${INK}" stroke-width="${n(r * 0.08)}" stroke-linecap="round"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${n(r * 0.12)}" fill="${CAP}" stroke="${INK}" stroke-width="6"/>`;
  if (label) s += txt(cx, cy - r * 1.4, label, n(r * 0.36), INK, { ls: 3 });
  s += `</g>`;
  return s;
}
function knob(cx, cy, r, v, sc) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">`;
  s += `<rect x="${n(-r * 1.55)}" y="${n(-r * 1.75)}" width="${n(r * 3.1)}" height="${n(r * 3.35)}" rx="30" fill="#f4f1ea" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += txt(0, -r * 1.25, 'TICKLE', n(r * 0.42), INK, { ls: 4 });
  for (let i = 0; i <= 10; i++) {
    const a = (-135 + i * 27 - 90) * D2R;
    const r0 = r * 1.08, r1 = r * (i % 5 ? 1.2 : 1.3);
    s += `<line x1="${n(r0 * Math.cos(a))}" y1="${n(r0 * Math.sin(a))}" x2="${n(r1 * Math.cos(a))}" y2="${n(r1 * Math.sin(a))}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += txt(-r * 1.05, r * 1.32, '0', n(r * 0.3), INK) + txt(r * 1.05, r * 1.32, 'MAX', n(r * 0.3), CAP);
  const a0 = -135, a1 = -135 + 270 * clamp(v);
  if (v > 0.01) {
    const p = (a) => [r * 0.88 * Math.cos((a - 90) * D2R), r * 0.88 * Math.sin((a - 90) * D2R)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    s += `<path d="M${n(x0)},${n(y0)} A${n(r * 0.88)},${n(r * 0.88)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${n(x1)},${n(y1)}" fill="none" stroke="${FEATHER_C}" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>`;
  }
  s += `<circle r="${n(r * 0.72)}" fill="#cfd6df" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<circle r="${n(r * 0.55)}" fill="#e6ebf1"/>`;
  const a = (a1 - 90) * D2R;
  s += `<line x1="${n(r * 0.15 * Math.cos(a))}" y1="${n(r * 0.15 * Math.sin(a))}" x2="${n(r * 0.6 * Math.cos(a))}" y2="${n(r * 0.6 * Math.sin(a))}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function stopwatch(cx, cy, r, t, t0, sc) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">`;
  s += `<rect x="-14" y="${n(-r - 30)}" width="28" height="26" rx="6" fill="#cfd6df" stroke="${INK}" stroke-width="6"/>`;
  s += `<circle r="${r}" fill="#fff" stroke="${INK}" stroke-width="${OUT + 2}"/>`;
  for (let i = 0; i < 12; i++) {
    const a = i * 30 * D2R;
    s += `<line x1="${n(r * 0.78 * Math.sin(a))}" y1="${n(-r * 0.78 * Math.cos(a))}" x2="${n(r * 0.9 * Math.sin(a))}" y2="${n(-r * 0.9 * Math.cos(a))}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  const sweep = clamp((t - t0) / 1.4) * 72;
  const a0 = -90 * D2R, a1 = (sweep - 90) * D2R;
  if (sweep > 1) s += `<path d="M0,0 L${n(r * 0.7 * Math.cos(a0))},${n(r * 0.7 * Math.sin(a0))} A${n(r * 0.7)},${n(r * 0.7)} 0 0 1 ${n(r * 0.7 * Math.cos(a1))},${n(r * 0.7 * Math.sin(a1))} Z" fill="#ffd23f" opacity="0.8"/>`;
  s += `<line x1="0" y1="0" x2="${n(r * 0.72 * Math.cos(a1))}" y2="${n(r * 0.72 * Math.sin(a1))}" stroke="${CAP}" stroke-width="9" stroke-linecap="round"/>`;
  s += `<circle r="10" fill="${INK}"/>`;
  return s + `</g>`;
}

const RAISIN = '#6e3a52', RAISIN_D = '#4a2235';
const NERVE = '#ffd23f';
const WATER = '#8fd3ff', WATER_D = '#5fb8ec';
const FINGERS = [[-54, -34, 112], [-18, -42, 132], [18, -40, 124], [54, -30, 100]];
function fingerTip(i, sc = 1) { const [fx, fy, L] = FINGERS[i]; return [fx * sc, (fy - L) * sc]; }
function bigHand(x, y, sc, ang, o = {}) {
  const skin = o.skin || WHITE, shade = o.shade || SHADE;
  const wr = o.wr || 0, rz = o.raisin || 0;
  let outl = '', fill = '';
  const cap = (x1, y1, x2, y2, w) => {
    outl += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${INK}" stroke-width="${w + 14}" stroke-linecap="round"/>`;
    fill += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${skin}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  if (!o.noArm) cap(0, 60, 0, 620, 104);
  outl += `<rect x="-86" y="-50" width="172" height="150" rx="56" fill="${INK}" stroke="${INK}" stroke-width="14"/>`;
  fill += `<rect x="-86" y="-50" width="172" height="150" rx="56" fill="${skin}"/>`;
  fill += `<ellipse cx="44" cy="40" rx="30" ry="50" fill="${shade}"/>`;
  for (const [fx, fy, L] of FINGERS) cap(fx, fy, fx, fy - L, 34);
  const ta = -128 * D2R;
  cap(-70, 34, -70 + 84 * Math.cos(ta), 34 + 84 * Math.sin(ta), 38);
  let s = outl + fill;
  if (rz > 0.01) {
    for (const [fx, fy, L] of FINGERS) s += `<line x1="${fx}" y1="${n(fy - L)}" x2="${fx}" y2="${n(fy - L * 0.45)}" stroke="${RAISIN}" stroke-width="34" stroke-linecap="round" opacity="${n(rz)}"/>`;
    s += `<line x1="-70" y1="34" x2="${n(-70 + 84 * Math.cos(ta))}" y2="${n(34 + 84 * Math.sin(ta))}" stroke="${RAISIN}" stroke-width="38" stroke-linecap="round" opacity="${n(rz * 0.8)}"/>`;
  }
  if (wr > 0.01) {
    const col = rz > 0.5 ? RAISIN_D : '#b39aa2';
    FINGERS.forEach(([fx, fy, L], i) => {
      const k = 5;
      for (let j = 0; j < k; j++) {
        const yy = fy - L + 10 + j * (L * 0.62 / k);
        const sg = (i + j) % 2 ? 1 : -1;
        s += `<path d="M${fx - 13},${n(yy)} Q${fx},${n(yy + sg * 7)} ${fx + 13},${n(yy)}" fill="none" stroke="${col}" stroke-width="${n(4.5)}" stroke-linecap="round" opacity="${n(wr)}"/>`;
      }
    });
    for (let j = 0; j < 3; j++) {
      const u = 0.35 + j * 0.2;
      const px = -70 + 84 * u * Math.cos(ta), py = 34 + 84 * u * Math.sin(ta);
      s += `<path d="M${n(px - 12)},${n(py - 6)} Q${n(px)},${n(py + 4)} ${n(px + 10)},${n(py + 10)}" fill="none" stroke="${col}" stroke-width="4.5" stroke-linecap="round" opacity="${n(wr)}"/>`;
    }
  }
  if ((o.nerve || 0) > 0.01) {
    const nv = o.nerve;
    const cutY = 250;
    const branch = (fx, fy, L) => `M0,40 Q${n(fx * 0.6)},${n(fy + 10)} ${fx},${n(fy - 10)} L${fx},${n(fy - L + 22)}`;
    let paths = `M0,560 L0,40 ` + FINGERS.map(([fx, fy, L]) => branch(fx, fy, L)).join(' ') + ` M0,40 Q-40,40 -60,20 L${n(-70 + 70 * Math.cos(ta))},${n(34 + 70 * Math.sin(ta))}`;
    const col = o.cut ? '#b9bec6' : NERVE;
    s += `<path d="${paths}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" opacity="${n(nv)}"/>`;
    s += `<path d="${paths}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${n(nv)}"/>`;
    if (o.cut) {
      s += `<path d="M0,560 L0,${cutY + 16}" fill="none" stroke="${NERVE}" stroke-width="7" stroke-linecap="round" opacity="${n(nv)}"/>`;
      s += `<rect x="-14" y="${cutY - 16}" width="28" height="30" fill="${skin}"/>`;
      s += `<path d="M-10,${cutY - 18} l6,6 l-6,6 M10,${cutY + 16} l-6,-6 l6,-6" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    if (o.pulse !== undefined && !o.cut) {
      const u = o.pulse % 1;
      const py = lerp(560, -80, u);
      s += `<circle cx="0" cy="${n(Math.max(py, 40))}" r="11" fill="#fff6b0" stroke="${INK}" stroke-width="4" opacity="${n(nv)}"/>`;
    }
  }
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">${s}</g>`;
}
function raisin(x, y, sc, ang = 0) {
  return popG(x, y, sc, `<path d="M-40,-30 C-10,-55 35,-45 45,-10 C55,25 25,50 -10,45 C-45,40 -60,0 -40,-30 Z" fill="${RAISIN}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-28,-18 q14,-10 26,2 M-6,8 q16,-8 30,4 M-30,18 q10,8 22,4" fill="none" stroke="${RAISIN_D}" stroke-width="6" stroke-linecap="round"/>`, ang);
}
function duck(x, y, sc, t) {
  const b = 6 * Math.sin(t * 2.4);
  return `<g transform="translate(${n(x)} ${n(y + b)}) rotate(${n(4 * Math.sin(t * 2))}) scale(${sc})">
    <ellipse cx="0" cy="0" rx="62" ry="38" fill="#ffd23f" stroke="${INK}" stroke-width="7"/>
    <path d="M30,-10 Q60,-30 70,-6" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="-30" cy="-46" r="32" fill="#ffd23f" stroke="${INK}" stroke-width="7"/>
    <path d="M-60,-46 L-86,-38 L-60,-32 Z" fill="#ff8a3d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="-40" cy="-54" r="6" fill="${INK}"/></g>`;
}
function pill(x, y, sc, label, col) {
  return popG(x, y, sc, `<rect x="-${label.length * 22 + 40}" y="-56" width="${label.length * 44 + 80}" height="96" rx="22" fill="${col}" stroke="${INK}" stroke-width="${OUT}"/>` + txt(0, 18, label, 58, '#fff', { ls: 4 }));
}
function doctor(o) {
  let s = guy(o);
  const extra = `<path d="M-62,-322 Q0,-352 62,-322" fill="none" stroke="${INK}" stroke-width="8"/>
    <circle cx="-30" cy="-358" r="26" fill="#cfe6ff" stroke="${INK}" stroke-width="7"/><circle cx="-36" cy="-364" r="8" fill="#fff"/>
    <path d="M-30,-210 Q-36,-150 -6,-140 Q24,-150 22,-210" fill="none" stroke="#57606b" stroke-width="8"/>
    <circle cx="-6" cy="-138" r="13" fill="#b9bec6" stroke="${INK}" stroke-width="5"/>`;
  return s.replace(/<\/g>$/, extra + '</g>');
}
function magnifier(x, y, sc, ang) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">
    <line x1="0" y1="0" x2="0" y2="150" stroke="${INK}" stroke-width="34" stroke-linecap="round"/><line x1="0" y1="10" x2="0" y2="150" stroke="#c08a52" stroke-width="20" stroke-linecap="round"/>
    <circle cx="0" cy="-70" r="72" fill="#dff3ff" fill-opacity="0.45" stroke="${INK}" stroke-width="16"/><circle cx="0" cy="-70" r="72" fill="none" stroke="#b9bec6" stroke-width="7"/>
    <path d="M-30,-110 Q-46,-84 -40,-60" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g>`;
}
function labWall() {
  let s = `<rect x="-3000" y="-2000" width="9000" height="${FLOOR + 2000}" fill="#e3f4f1"/>`;
  for (let x = -2000; x < 4000; x += 110) s += `<line x1="${x}" y1="-2000" x2="${x}" y2="${FLOOR}" stroke="#c6e4de" stroke-width="5"/>`;
  for (let y = -1980; y < FLOOR; y += 110) s += `<line x1="-3000" y1="${y}" x2="6000" y2="${y}" stroke="#c6e4de" stroke-width="5"/>`;
  s += `<rect x="-400" y="1120" width="2000" height="34" fill="#9aa8b8" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="-400" y="1154" width="2000" height="${FLOOR - 1154}" fill="#b8c4d2" stroke="${INK}" stroke-width="${OUT}"/>`;
  const flask = (x, col, h) => `<path d="M${x - 14},${1120 - h} L${x - 14},${1120 - h * 0.55} L${x - 46},1120 L${x + 46},1120 L${x + 14},${1120 - h * 0.55} L${x + 14},${1120 - h} Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M${x - 36},1108 L${x - 22},${1120 - h * 0.32} L${x + 22},${1120 - h * 0.32} L${x + 36},1108 Z" fill="${col}"/>`;
  s += flask(70, '#7ee07a', 130) + flask(160, '#ff6fae', 100) + flask(980, '#5cc9ff', 140);
  s += `<rect x="560" y="440" width="300" height="110" rx="16" fill="#203154" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += txt(710, 513, 'TICKLE LAB', 46, '#e9f1ff', { ls: 3 });
  return s;
}
function labFloor() {
  return `<rect x="-3000" y="${FLOOR}" width="9000" height="3000" fill="#a9b8c8"/><line x1="-3000" y1="${FLOOR}" x2="6000" y2="${FLOOR}" stroke="${INK}" stroke-width="6"/>`;
}
const TUB_TOP = 1310, TUB_L = 120, TUB_R = 1000;
function bathWall() {
  let s = `<rect x="-3000" y="-2000" width="9000" height="5000" fill="#d6eefa"/>`;
  for (let x = -2000; x < 4000; x += 100) s += `<line x1="${x}" y1="-2000" x2="${x}" y2="1500" stroke="#fff" stroke-width="6"/>`;
  for (let y = -1980; y < 1500; y += 100) s += `<line x1="-3000" y1="${y}" x2="6000" y2="${y}" stroke="#fff" stroke-width="6"/>`;
  s += `<rect x="160" y="520" width="260" height="320" rx="130" fill="#eaf7ff" stroke="${INK}" stroke-width="${OUT}"/><path d="M220,620 L280,560 M230,690 L330,590" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`;
  s += `<rect x="700" y="560" width="220" height="16" rx="8" fill="#b9bec6" stroke="${INK}" stroke-width="5"/>`;
  s += `<path d="M720,570 L900,570 L890,860 L730,860 Z" fill="#ff8fa3" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/><path d="M730,800 L890,800" stroke="#fff" stroke-width="10"/>`;
  s += `<rect x="-3000" y="1500" width="9000" height="2000" fill="#9fc6dd"/><line x1="-3000" y1="1500" x2="6000" y2="1500" stroke="${INK}" stroke-width="6"/>`;
  return s;
}
function tubBack() {
  return `<path d="M${TUB_L},${TUB_TOP} L${TUB_R},${TUB_TOP} L${TUB_R - 10},${TUB_TOP - 30} L${TUB_L + 10},${TUB_TOP - 30} Z" fill="#f4f6f9" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
    <rect x="${TUB_R - 90}" y="${TUB_TOP - 150}" width="26" height="120" rx="8" fill="#b9bec6" stroke="${INK}" stroke-width="6"/>
    <path d="M${TUB_R - 77},${TUB_TOP - 150} q0,-50 -60,-50 l-20,0" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M${TUB_R - 77},${TUB_TOP - 150} q0,-50 -60,-50 l-20,0" fill="none" stroke="#c9ced6" stroke-width="10" stroke-linecap="round"/>`;
}
function tubFront(t) {
  let s = `<ellipse cx="560" cy="${TUB_TOP + 2}" rx="430" ry="26" fill="${WATER}" opacity="0.9"/>`;
  const r = rng(5);
  for (let i = 0; i < 26; i++) {
    const bx = TUB_L + 40 + r() * (TUB_R - TUB_L - 80), by = TUB_TOP - 6 - r() * 26;
    const rr = 16 + r() * 22 + 2 * Math.sin(t * 3 + i);
    s += `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(rr)}" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  }
  s += `<path d="M${TUB_L},${TUB_TOP} L${TUB_R},${TUB_TOP} Q${TUB_R + 10},${TUB_TOP + 220} ${TUB_R - 120},${TUB_TOP + 230} L${TUB_L + 120},${TUB_TOP + 230} Q${TUB_L - 10},${TUB_TOP + 220} ${TUB_L},${TUB_TOP} Z" fill="#fff" stroke="${INK}" stroke-width="${OUT + 1}" stroke-linejoin="round"/>`;
  s += `<path d="M${TUB_L + 60},${TUB_TOP + 60} Q${TUB_L + 70},${TUB_TOP + 160} ${TUB_L + 160},${TUB_TOP + 190}" fill="none" stroke="${SHADE}" stroke-width="14" stroke-linecap="round"/>`;
  s += `<rect x="${TUB_L - 16}" y="${TUB_TOP - 14}" width="${TUB_R - TUB_L + 32}" height="28" rx="14" fill="#fff" stroke="${INK}" stroke-width="${OUT}"/>`;
  for (const fx of [TUB_L + 150, TUB_R - 150]) s += `<path d="M${fx - 30},${TUB_TOP + 226} L${fx + 30},${TUB_TOP + 226} L${fx + 16},${TUB_TOP + 270} L${fx - 16},${TUB_TOP + 270} Z" fill="#ffd23f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  return s;
}
const KFLOOR = 1450, COUNTER = 1330;
function kitchenWall() {
  let s = `<rect x="-3000" y="-2000" width="9000" height="5000" fill="#fff1d6"/>`;
  s += `<rect x="-3000" y="${COUNTER - 330}" width="9000" height="330" fill="#d8efe6"/>`;
  for (let x = -2000; x < 4000; x += 80) s += `<line x1="${x}" y1="${COUNTER - 330}" x2="${x}" y2="${COUNTER}" stroke="#fff" stroke-width="5"/>`;
  for (let y = COUNTER - 330; y < COUNTER; y += 80) s += `<line x1="-3000" y1="${y}" x2="6000" y2="${y}" stroke="#fff" stroke-width="5"/>`;
  s += `<rect x="-200" y="420" width="1500" height="360" fill="#f7c873" stroke="${INK}" stroke-width="${OUT}"/>`;
  for (let x = -200; x < 1300; x += 300) s += `<rect x="${x + 20}" y="440" width="260" height="320" rx="14" fill="#fbd68f" stroke="${INK}" stroke-width="5"/><circle cx="${x + 250}" cy="610" r="10" fill="${INK}"/>`;
  s += `<line x1="900" y1="780" x2="900" y2="830" stroke="${INK}" stroke-width="6"/><circle cx="900" cy="900" r="70" fill="#57606b" stroke="${INK}" stroke-width="${OUT}"/><circle cx="900" cy="900" r="50" fill="#6c7682"/>`;
  return s;
}
function counterFront() {
  let s = `<rect x="-3000" y="${COUNTER}" width="9000" height="40" fill="#e6e1d6" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="-3000" y="${COUNTER + 40}" width="9000" height="800" fill="#7fb8e6" stroke="${INK}" stroke-width="${OUT}"/>`;
  for (let x = -2000; x < 4000; x += 300) s += `<rect x="${x + 20}" y="${COUNTER + 70}" width="260" height="500" rx="14" fill="#8fc4ee" stroke="${INK}" stroke-width="5"/><rect x="${x + 110}" y="${COUNTER + 100}" width="80" height="14" rx="7" fill="${INK}"/>`;
  return s;
}
function ik(sx, sy, tx, ty, l1, l2, flip = 1) {
  const dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  d = Math.min(d, l1 + l2 - 1);
  const a = Math.atan2(dy, dx);
  const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const a1 = a - flip * Math.acos(c);
  const ex = sx + l1 * Math.cos(a1), ey = sy + l1 * Math.sin(a1);
  const ex2 = sx + dx / Math.hypot(dx, dy) * d, ey2 = sy + dy / Math.hypot(dx, dy) * d;
  return { e: [ex, ey], h: [ex2, ey2] };
}
function robot(o, t) {
  let s = '';
  const blink = Math.sin(t * 2 * Math.PI * 1.2) > 0.6;
  s += `<line x1="0" y1="-300" x2="0" y2="-360" stroke="${INK}" stroke-width="8"/>`;
  s += `<circle cx="0" cy="-370" r="16" fill="${blink ? '#ffd23f' : CAP}" stroke="${INK}" stroke-width="6"/>`;
  s += `<ellipse cx="-50" cy="-26" rx="34" ry="26" fill="#57606b" stroke="${INK}" stroke-width="6"/><ellipse cx="50" cy="-26" rx="34" ry="26" fill="#57606b" stroke="${INK}" stroke-width="6"/>`;
  s += `<rect x="-90" y="-300" width="180" height="250" rx="30" fill="#cfd6df" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="-90" y="-120" width="180" height="70" rx="0" fill="#b7c0cb" opacity="0.6"/>`;
  s += `<rect x="-66" y="-276" width="132" height="96" rx="16" fill="#203154" stroke="${INK}" stroke-width="6"/>`;
  const face = o.face || 'calm';
  for (const ex of [-28, 28]) {
    if (face === 'busy') s += `<rect x="${ex - 14}" y="-236" width="28" height="8" rx="4" fill="#5cf2ff"/>`;
    else s += `<ellipse cx="${ex}" cy="-232" rx="11" ry="${face === 'wide' ? 17 : 14}" fill="#5cf2ff"/>`;
  }
  s += `<path d="M-20,-204 Q0,-${face === 'happy' ? 190 : 200} 20,-204" fill="none" stroke="#5cf2ff" stroke-width="6" stroke-linecap="round"/>`;
  s += `<circle cx="-40" cy="-90" r="10" fill="${CAP}" stroke="${INK}" stroke-width="4"/><circle cx="-8" cy="-90" r="10" fill="#ffd23f" stroke="${INK}" stroke-width="4"/>`;
  const sh = [80, -200];
  const { e, h } = ik(sh[0], sh[1], o.target[0], o.target[1], 175, 165, -1);
  const seg = (a, b) => `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" stroke="${INK}" stroke-width="34" stroke-linecap="round"/><line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" stroke="#aeb8c4" stroke-width="20" stroke-linecap="round"/>`;
  s += seg(sh, e) + seg(e, h);
  s += `<circle cx="${sh[0]}" cy="${sh[1]}" r="20" fill="#8b96a3" stroke="${INK}" stroke-width="6"/><circle cx="${n(e[0])}" cy="${n(e[1])}" r="18" fill="#8b96a3" stroke="${INK}" stroke-width="6"/>`;
  const fa = o.featherAng;
  s += feather(h[0], h[1], fa, 100, o.flutter || 0);
  s += `<circle cx="${n(h[0])}" cy="${n(h[1])}" r="20" fill="#8b96a3" stroke="${INK}" stroke-width="6"/>`;
  return `<g transform="scale(${n(o.sx || 1)} ${n(o.sy || 1)})">${s}</g>`;
}
function spongeFinger(x, y, sc, puff, t, wr = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc * (1 + 0.12 * puff))} ${n(sc * (1 + 0.05 * puff))})">`;
  s += `<rect x="-80" y="-200" width="160" height="380" rx="80" fill="#ffe27a" stroke="${INK}" stroke-width="9"/>`;
  s += `<path d="M-50,-170 Q-20,-200 20,-185" fill="none" stroke="#fff6c8" stroke-width="12" stroke-linecap="round"/>`;
  const r = rng(11);
  for (let i = 0; i < 14; i++) {
    const hx = -55 + r() * 110, hy = -160 + r() * 310, rr = 7 + r() * 9;
    s += `<ellipse cx="${n(hx)}" cy="${n(hy)}" rx="${n(rr)}" ry="${n(rr * 0.8)}" fill="#e3b941"/>`;
  }
  s += `<path d="M-80,60 L80,60" stroke="${INK}" stroke-width="5" opacity="0.4"/>`;
  s += `<rect x="-60" y="-210" width="120" height="70" rx="30" fill="#ffffff" stroke="${INK}" stroke-width="6" opacity="0.9"/>`;
  s += `</g>`;
  return s;
}
function scissors(x, y, sc, open) {
  const a = 8 + 26 * open;
  const blade = (sg) => `<g transform="rotate(${n(sg * a)})"><path d="M0,0 L-150,${sg * -6} L-150,${sg * 8} Z" fill="#cfd6df" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="54" cy="${sg * 24}" r="28" fill="none" stroke="${INK}" stroke-width="18"/><circle cx="54" cy="${sg * 24}" r="28" fill="none" stroke="${CAP}" stroke-width="9"/><line x1="0" y1="0" x2="34" y2="${sg * 16}" stroke="${CAP}" stroke-width="16" stroke-linecap="round"/></g>`;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">${blade(1)}${blade(-1)}<circle r="9" fill="${INK}"/></g>`;
}
function tire(cx, cy, r, ang, treads) {
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${n(ang)})">`;
  s += `<circle r="${r}" fill="#2e2e35" stroke="${INK}" stroke-width="${OUT}"/>`;
  if (treads) {
    for (let i = 0; i < 18; i++) {
      const a = i * 20;
      s += `<g transform="rotate(${a})"><path d="M${r - 34},-10 L${r + 2},-16 L${r + 2},4 L${r - 34},10 Z" fill="#1c1c1e" stroke="#57606b" stroke-width="3"/></g>`;
      s += `<g transform="rotate(${a + 10})"><path d="M${r - 30},-4 L${r - 4},-6 L${r - 4},6 L${r - 30},4 Z" fill="#57606b"/></g>`;
    }
  } else {
    s += `<circle r="${r - 16}" fill="none" stroke="#3d3d46" stroke-width="10"/>`;
  }
  s += `<circle r="${n(r * 0.55)}" fill="#b9bec6" stroke="${INK}" stroke-width="6"/>`;
  for (let i = 0; i < 5; i++) { const a = (i * 72) * D2R; s += `<circle cx="${n(r * 0.3 * Math.cos(a))}" cy="${n(r * 0.3 * Math.sin(a))}" r="9" fill="#57606b"/>`; }
  s += `<circle r="18" fill="#8b96a3" stroke="${INK}" stroke-width="5"/>`;
  return s + `</g>`;
}
const BONE = '#f4ead2', BONE_D = '#d9caa6', FLUID = 'rgba(120,200,255,0.45)';
function crackText(x, y, t, t0, size = 1, word = 'CRACK!') {
  const sc = clamp(pop(t, t0, 2.6, 8), 0, 1.25) * (1 - prog(t, t0 + 0.5, t0 + 0.7)) * size;
  return popG(x, y - 40 * prog(t, t0, t0 + 0.7), sc, txt(0, 0, word, 72, '#ffd23f', { stroke: INK, sw: 10 }), -8);
}
function hazard(x, y, sc, label) {
  return popG(x, y, sc, `<path d="M0,-150 L140,90 L-140,90 Z" fill="#ffd23f" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>` +
    txt(0, 50, '!', 150, INK) + `<rect x="-230" y="110" width="460" height="92" rx="20" fill="${CAP}" stroke="${INK}" stroke-width="${OUT}"/>` + txt(0, 174, label, 56, '#fff', { ls: 3 }));
}
function handKnot(x, y, sc, skin = WHITE) {
  let s = '';
  const pts = [[-26, -20], [-8, -26], [10, -24], [28, -16], [-20, 8], [0, 12], [20, 10]];
  for (const [px, py] of pts) s += `<circle cx="${px}" cy="${py}" r="17" fill="${INK}"/>`;
  for (const [px, py] of pts) s += `<circle cx="${px}" cy="${py}" r="11.5" fill="${skin}"/>`;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">${s}</g>`;
}
function joint(cx, cy, sc, gap, o = {}) {
  const style = o.style || 'xray';
  const boneF = style === 'mri' ? '#c9ced6' : BONE, boneS = style === 'mri' ? '#8b96a3' : BONE_D;
  const fluidF = style === 'mri' ? '#3a4458' : FLUID;
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">`;
  const half = gap / 2;
  s += `<ellipse cx="0" cy="0" rx="${n(150 + half)}" ry="190" fill="${fluidF}" stroke="${style === 'mri' ? '#8b96a3' : '#9fdcff'}" stroke-width="6" stroke-dasharray="${style === 'diagram' ? '0' : '14 10'}"/>`;
  const bone = (sg) => {
    const x0 = sg * half;
    const x1 = sg * (half + 560);
    const head = `<ellipse cx="${n(x0 + sg * 66)}" cy="0" rx="62" ry="118" fill="${boneF}" stroke="${INK}" stroke-width="9"/>`;
    const shaft = `<rect x="${n(Math.min(x0 + sg * 60, x1))}" y="-80" width="${n(Math.abs(x1 - (x0 + sg * 60)))}" height="160" fill="${boneF}" stroke="${INK}" stroke-width="9"/>`;
    const shade = `<rect x="${n(Math.min(x0 + sg * 80, x1))}" y="30" width="${n(Math.abs(x1 - (x0 + sg * 80)))}" height="40" fill="${boneS}" opacity="0.6"/>`;
    return shaft + shade + head + `<ellipse cx="${n(x0 + sg * 70)}" cy="0" rx="50" ry="104" fill="${boneF}"/>`;
  };
  s += bone(-1) + bone(1);
  s += `<path d="M${n(-half - 4)},-100 Q${n(-half + 12)},0 ${n(-half - 4)},100" fill="none" stroke="#b8e2ff" stroke-width="10" stroke-linecap="round"/>`;
  s += `<path d="M${n(half + 4)},-100 Q${n(half - 12)},0 ${n(half + 4)},100" fill="none" stroke="#b8e2ff" stroke-width="10" stroke-linecap="round"/>`;
  if ((o.bubble || 0) > 0.5) {
    const r = o.bubble;
    s += `<circle cx="0" cy="0" r="${n(r)}" fill="${style === 'mri' ? '#0d111a' : 'rgba(255,255,255,0.75)'}" stroke="${style === 'mri' ? '#e9f1ff' : INK}" stroke-width="6"/>`;
    if (style !== 'mri') s += `<path d="M${n(-r * 0.5)},${n(-r * 0.3)} Q${n(-r * 0.3)},${n(-r * 0.6)} ${n(0)},${n(-r * 0.6)}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
  }
  return s + `</g>`;
}
function xrayBg() {
  let s = `<rect width="${W}" height="${H}" fill="#16233f"/>`;
  for (let x = 0; x <= W; x += 90) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#1e3156" stroke-width="3"/>`;
  for (let y = 0; y <= H; y += 90) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#1e3156" stroke-width="3"/>`;
  return s;
}
function soda(x, y, sc, open, t) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-60,0 L-60,-200 Q-60,-250 -24,-280 L-24,-330 L24,-330 L24,-280 Q60,-250 60,-200 L60,0 Q60,20 40,20 L-40,20 Q-60,20 -60,0 Z" fill="#7ee07a" fill-opacity="0.85" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<rect x="-60" y="-170" width="120" height="70" fill="#fff" stroke="${INK}" stroke-width="6"/>` + txt(0, -122, 'FIZZ', 34, CAP);
  const cu = clamp(open);
  s += `<rect x="-30" y="${n(-360 - 260 * cu)}" width="60" height="34" rx="8" fill="${CAP}" stroke="${INK}" stroke-width="6" transform="rotate(${n(200 * cu)} 0 ${n(-343 - 260 * cu)})"/>`;
  if (open > 0.05) {
    const r = rng(9);
    for (let i = 0; i < 14; i++) {
      const ph = ((t * 1.3 + r()) % 1);
      const bx = -40 + r() * 80 + 10 * Math.sin(t * 6 + i), by = -20 - ph * 380;
      s += `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(6 + 6 * r())}" fill="#fff" stroke="${INK}" stroke-width="3" opacity="${n(1 - ph * 0.6)}"/>`;
    }
  }
  return s + `</g>`;
}
const ON_SKIN = '#d9a066', ON_SKIN_D = '#b97d45', ON_FLESH = '#f6efe0', ON_RING = '#e6d9bd';
const GAS = '#9be15d', GAS_D = '#6fbf3a';
function onion(x, y, sc, o = {}) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(o.rot || 0)}) scale(${n(sc * (o.sx || 1))} ${n(sc * (o.sy || 1))})">`;
  const body = 'M0,-250 C20,-200 130,-190 140,-100 C150,-20 80,0 0,0 C-80,0 -150,-20 -140,-100 C-130,-190 -20,-200 0,-250 Z';
  s += `<path d="${body}" fill="${ON_SKIN}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
  s += `<path d="M-60,-190 C-100,-140 -100,-60 -50,-12 M60,-190 C100,-140 100,-60 50,-12 M0,-232 C-14,-150 -14,-60 0,-4" fill="none" stroke="${ON_SKIN_D}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M90,-170 C120,-140 130,-90 118,-50" fill="none" stroke="#f0c48c" stroke-width="12" stroke-linecap="round"/>`;
  s += `<path d="M0,-250 C-6,-290 8,-310 22,-320 M0,-250 C10,-285 -6,-300 -20,-308" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="M-30,0 l-8,18 M-10,0 l-2,20 M10,0 l3,20 M30,0 l8,16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  const f = o.face;
  if (f) {
    const ey = -110;
    if (f === 'evil') {
      for (const ex of [-42, 42]) s += `<ellipse cx="${ex}" cy="${ey}" rx="15" ry="19" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${ex + (o.look || 0) * 6}" cy="${ey + 4}" r="8" fill="${INK}"/>`;
      s += `<path d="M-66,-146 L-20,-128 M66,-146 L20,-128" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
      s += `<path d="M-40,-60 Q0,-30 46,-70" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M30,-62 L36,-48 L42,-66" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    } else if (f === 'cold') {
      for (const ex of [-42, 42]) s += `<path d="M${ex - 14},${ey} L${ex + 2},${ey + 8} L${ex - 14},${ey + 16}" transform="scale(${ex < 0 ? 1 : -1} 1) translate(${ex < 0 ? 0 : -2 * ex} 0)" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M-30,-60 l10,-8 l10,8 l10,-8 l10,8 l10,-8 l10,8" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M-120,-40 Q0,0 120,-40 L118,-10 Q0,30 -118,-10 Z" fill="${CAP}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M60,-20 L80,60 L50,62 L40,-10 Z" fill="${CAP}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    } else {
      for (const ex of [-42, 42]) s += `<ellipse cx="${ex}" cy="${ey}" rx="12" ry="16" fill="${INK}"/><circle cx="${ex + 4}" cy="${ey - 5}" r="4" fill="#fff"/>`;
      s += `<path d="M-30,-66 Q0,-44 30,-66" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    }
  }
  return s + `</g>`;
}
function onionHalf(x, y, sc) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-140,0 A140,140 0 0 1 140,0 Z" fill="${ON_FLESH}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  for (let r = 110; r > 10; r -= 30) s += `<path d="M${-r},0 A${r},${r} 0 0 1 ${r},0" fill="none" stroke="${ON_RING}" stroke-width="7"/>`;
  s += `<path d="M-140,0 A140,140 0 0 1 140,0" fill="none" stroke="${ON_SKIN}" stroke-width="12"/>`;
  return s + `</g>`;
}
function knife(x, y, sc, ang) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">
    <rect x="-26" y="-130" width="52" height="130" rx="18" fill="#3d3d46" stroke="${INK}" stroke-width="7"/>
    <circle cx="0" cy="-90" r="6" fill="#c9ced6"/><circle cx="0" cy="-40" r="6" fill="#c9ced6"/>
    <path d="M-30,0 L30,0 L30,260 Q10,300 -30,320 Z" fill="#e3e9f1" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-16,30 L-16,250" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/></g>`;
}
function bigEye(x, y, sc, open, lookX = 0, red = 0) {
  const c = uid('eye');
  const h = 110 * clamp(open, 0.04, 1);
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<defs><clipPath id="${c}"><path d="M-200,0 Q0,${n(-h * 1.6)} 200,0 Q0,${n(h * 1.6)} -200,0 Z"/></clipPath></defs>`;
  s += `<path d="M-200,0 Q0,${n(-h * 1.6)} 200,0 Q0,${n(h * 1.6)} -200,0 Z" fill="#fff"/>`;
  s += `<g clip-path="url(#${c})">`;
  if (red > 0.01) s += `<path d="M-180,10 l40,-10 l20,14 M170,-6 l-40,8 l-16,-16 M-150,-30 l30,6 M150,30 l-34,-8" fill="none" stroke="#ff5a4e" stroke-width="6" stroke-linecap="round" opacity="${n(red)}"/>`;
  s += `<circle cx="${n(lookX * 40)}" cy="0" r="78" fill="#7a5230"/><circle cx="${n(lookX * 40)}" cy="0" r="78" fill="none" stroke="#5a3a1e" stroke-width="10"/>`;
  s += `<circle cx="${n(lookX * 40)}" cy="0" r="36" fill="${INK}"/><circle cx="${n(lookX * 40 + 24)}" cy="-26" r="14" fill="#fff"/>`;
  s += `</g>`;
  s += `<path d="M-200,0 Q0,${n(-h * 1.6)} 200,0 Q0,${n(h * 1.6)} -200,0 Z" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`;
  for (let i = 0; i < 5; i++) {
    const u = 0.2 + i * 0.15;
    const px = lerp(-200, 200, u), py = -2 * u * (1 - u) * h * 1.6;
    s += `<line x1="${n(px)}" y1="${n(py)}" x2="${n(px + (u - 0.5) * 40)}" y2="${n(py - 34)}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  }
  return s + `</g>`;
}
function gasCloud(x, y, sc, t, face = true) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  const blobs = [[-70, 10, 70], [0, -30, 85], [70, 10, 68], [-30, 40, 60], [40, 40, 62]];
  for (const [bx, by, r] of blobs) s += `<circle cx="${bx + 4 * Math.sin(t * 3 + bx)}" cy="${by + 4 * Math.cos(t * 2.5 + by)}" r="${r + 7}" fill="${INK}"/>`;
  for (const [bx, by, r] of blobs) s += `<circle cx="${bx + 4 * Math.sin(t * 3 + bx)}" cy="${by + 4 * Math.cos(t * 2.5 + by)}" r="${r}" fill="${GAS}"/>`;
  s += `<circle cx="-40" cy="-50" r="26" fill="#c9f59a"/>`;
  if (face) {
    s += `<path d="M-46,-6 L-18,6 M46,-6 L18,6" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<ellipse cx="-30" cy="18" rx="9" ry="12" fill="${INK}"/><ellipse cx="30" cy="18" rx="9" ry="12" fill="${INK}"/>`;
    s += `<path d="M-28,56 Q0,76 30,52" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  }
  return s + `</g>`;
}
function wisp(x, y, t, t0, amp = 1, n0 = 3) {
  let s = '';
  for (let i = 0; i < n0; i++) {
    const ph = ((t - t0) * 0.6 + i / n0) % 1;
    if (t < t0) break;
    const px = x + (i - 1) * 40 * amp + 30 * Math.sin(ph * 6 + i), py = y - ph * 300 * amp;
    const op = Math.sin(Math.PI * ph);
    let d = '';
    for (let k = 0; k <= 10; k++) { const u = k / 10; d += (k ? 'L' : 'M') + n(px + 14 * amp * Math.sin(u * 7 + t * 4 + i)) + ',' + n(py - u * 90 * amp); }
    s += `<path d="${d}" fill="none" stroke="${GAS_D}" stroke-width="${n(14 * amp)}" stroke-linecap="round" opacity="${n(op)}"/>`;
  }
  return s;
}
function tearStreams(ex, ey, t, amp, side) {
  if (amp <= 0.02) return '';
  let s = '';
  for (let i = 0; i < 9; i++) {
    const ph = ((t * 2.6 + i / 9) % 1);
    const x = ex + side * (10 + 170 * ph * amp), y = ey - 30 * amp * ph + 260 * ph * ph * amp;
    s += drop(x, y, 9 * amp * (1 - ph * 0.3));
  }
  return s;
}
function chemBlob(x, y, sc, col, name, mood, t) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-70,10 C-80,-50 -30,-80 0,-78 C40,-80 80,-50 72,8 C80,60 30,78 0,76 C-40,78 -80,58 -70,10 Z" fill="${col}" stroke="${INK}" stroke-width="8"/>`;
  if (mood === 'angry') {
    s += `<path d="M-40,-30 L-12,-18 M40,-30 L12,-18" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<circle cx="-24" cy="-2" r="9" fill="${INK}"/><circle cx="24" cy="-2" r="9" fill="${INK}"/><path d="M-20,34 Q0,24 20,34" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M-34,-6 Q-24,-18 -12,-6 M12,-6 Q24,-18 34,-6" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M-26,22 Q0,48 26,22" fill="${INK}"/>`;
  }
  s += txt(0, 110, name, 40, INK, { ls: 2 });
  return s + `</g>`;
}
const FISH = '#ff8a2a', FISH_D = '#e0631a', FISH_L = '#ffb46a';
const AQUA = '#9fe0f5', AQUA_D = '#6cc6e6';
function goldfish(x, y, sc, o = {}) {
  const dir = o.dir || 1;
  const t = o.t || 0;
  const tw = 12 * Math.sin(t * 9 + (o.tail || 0));
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc * dir)} ${n(sc)}) rotate(${n(o.rot || 0)})">`;
  s += `<g transform="translate(-90 0) rotate(${n(tw)})"><path d="M0,0 C-40,-70 -110,-90 -120,-60 C-100,-20 -100,20 -120,60 C-110,90 -40,70 0,0 Z" fill="${FISH_L}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-20,0 L-95,-45 M-20,0 L-100,0 M-20,0 L-95,45" stroke="${FISH}" stroke-width="5" stroke-linecap="round"/></g>`;
  s += `<path d="M-50,-62 C-30,-110 30,-110 40,-66 Z" fill="${FISH_L}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M-20,60 C-10,95 30,95 30,62 Z" fill="${FISH_L}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  s += `<ellipse cx="0" cy="0" rx="110" ry="74" fill="${FISH}" stroke="${INK}" stroke-width="8"/>`;
  s += `<ellipse cx="-10" cy="34" rx="70" ry="26" fill="${FISH_L}" opacity="0.8"/>`;
  s += `<path d="M-40,-20 q14,14 0,28 M-14,-26 q16,18 0,36 M12,-22 q14,14 0,28" fill="none" stroke="${FISH_D}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M10,20 C-10,50 -30,60 -40,50 C-30,40 -10,30 10,20 Z" fill="${FISH_L}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" transform="rotate(${n(10 * Math.sin(t * 7))} 10 20)"/>`;
  const ex = 58, ey = -14;
  const eye = o.eye || 'open';
  s += `<circle cx="${ex}" cy="${ey}" r="26" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  if (eye === 'blank') s += `<circle cx="${ex}" cy="${ey}" r="5" fill="${INK}"/>`;
  else if (eye === 'shut' || eye === 'happy') s += `<path d="M${ex - 14},${ey + (eye === 'happy' ? 4 : 0)} Q${ex},${ey + (eye === 'happy' ? -12 : 10)} ${ex + 14},${ey + (eye === 'happy' ? 4 : 0)}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  else {
    s += `<circle cx="${ex + 6 + (o.lookX || 0) * 6}" cy="${ey + 2 + (o.lookY || 0) * 6}" r="13" fill="${INK}"/><circle cx="${ex + 10}" cy="${ey - 4}" r="4.5" fill="#fff"/>`;
    if (eye === 'smug') s += `<path d="M${ex - 28},${ey} L${ex - 28},${ey - 30} L${ex + 28},${ey - 30} L${ex + 28},${ey} Z" fill="${FISH}"/><line x1="${ex - 26}" y1="${ey}" x2="${ex + 26}" y2="${ey - 2}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  }
  const mo = o.mouth || 0;
  if (mo > 0.05) s += `<ellipse cx="104" cy="18" rx="${n(8 + 6 * mo)}" ry="${n(4 + 12 * mo)}" fill="${INK}"/>`;
  else s += `<path d="M90,22 Q100,30 110,20" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  if (o.glasses) s += `<g transform="translate(${ex} ${ey})"><rect x="-34" y="-16" width="64" height="32" rx="12" fill="${INK}"/><line x1="-34" y1="-6" x2="-90" y2="-14" stroke="${INK}" stroke-width="6"/><path d="M-20,-8 L-6,-8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.6"/></g>`;
  return s + `</g>`;
}
function bubbles(x, y, t, n0 = 4, spread = 40, speed = 160, seed = 1) {
  let s = '';
  const r = rng(seed);
  for (let i = 0; i < n0; i++) {
    const off = r(), ph = ((t * speed / 300 + off) % 1);
    const bx = x + (r() - 0.5) * spread + 8 * Math.sin(t * 4 + i), by = y - ph * 300;
    s += `<circle cx="${n(bx)}" cy="${n(by)}" r="${n(6 + 6 * r())}" fill="#e9fbff" stroke="${INK}" stroke-width="3" opacity="${n(1 - ph)}"/>`;
  }
  return s;
}
function fishbowl(cx, cy, r, inner, t) {
  const c = uid('bowl');
  let s = `<defs><clipPath id="${c}"><circle cx="${cx}" cy="${cy}" r="${r - 6}"/></clipPath></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eefbff" opacity="0.6"/>`;
  s += `<g clip-path="url(#${c})"><rect x="${cx - r}" y="${n(cy - r * 0.62 + 6 * Math.sin(t * 2))}" width="${2 * r}" height="${2 * r}" fill="${AQUA}"/>`;
  s += `<path d="M${cx - r},${cy + r * 0.75} Q${cx},${cy + r * 0.55} ${cx + r},${cy + r * 0.75} L${cx + r},${cy + r} L${cx - r},${cy + r} Z" fill="#f2d08a"/>`;
  s += inner + `</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="9"/>`;
  s += `<ellipse cx="${cx}" cy="${cy - r * 0.86}" rx="${r * 0.52}" ry="${r * 0.08}" fill="#eefbff" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M${cx - r * 0.7},${cy - r * 0.35} Q${cx - r * 0.78},${cy} ${cx - r * 0.62},${cy + r * 0.35}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.8"/>`;
  return s;
}
function aquarium(x0, y0, w, h, inner, t) {
  const c = uid('aq');
  let s = `<defs><clipPath id="${c}"><rect x="${x0 + 6}" y="${y0 + 6}" width="${w - 12}" height="${h - 12}"/></clipPath></defs>`;
  s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#eefbff"/>`;
  s += `<g clip-path="url(#${c})"><rect x="${x0}" y="${n(y0 + 60 + 5 * Math.sin(t * 2))}" width="${w}" height="${h}" fill="${AQUA}"/>`;
  s += `<rect x="${x0}" y="${y0 + h - 60}" width="${w}" height="60" fill="#f2d08a"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M${x0 + 80 + i * 160},${y0 + h - 50} q-20,-80 ${10 + 10 * Math.sin(t * 2 + i)},-160" fill="none" stroke="#5aa13d" stroke-width="14" stroke-linecap="round"/>`;
  s += inner + `</g>`;
  s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="10" rx="10"/>`;
  s += `<rect x="${x0 - 14}" y="${y0 - 16}" width="${w + 28}" height="26" rx="8" fill="#57606b" stroke="${INK}" stroke-width="6"/>`;
  s += `<rect x="${x0 - 14}" y="${y0 + h - 10}" width="${w + 28}" height="30" rx="8" fill="#57606b" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="M${x0 + 30},${y0 + 60} L${x0 + 30},${y0 + h - 80}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.6"/>`;
  return s;
}
function lever(x, y, sc, pressed, locked, t) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<rect x="-30" y="-20" width="60" height="70" rx="10" fill="#57606b" stroke="${INK}" stroke-width="6"/>`;
  const a = lerp(-30, 25, pressed);
  s += `<g transform="rotate(${n(a)})"><line x1="0" y1="0" x2="0" y2="-110" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="-110" stroke="#c9ced6" stroke-width="8" stroke-linecap="round"/><circle cx="0" cy="-118" r="22" fill="${CAP}" stroke="${INK}" stroke-width="6"/></g>`;
  if (locked > 0.01) s += popG(40, 40, locked, `<path d="M-18,-6 L-18,-24 Q-18,-44 0,-44 Q18,-44 18,-24 L18,-6" fill="none" stroke="${INK}" stroke-width="9"/><rect x="-28" y="-8" width="56" height="44" rx="8" fill="#ffd23f" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="12" r="6" fill="${INK}"/>`);
  return s + `</g>`;
}
function dispenser(x, y, sc) {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})"><rect x="-70" y="-120" width="140" height="120" rx="16" fill="#e3e9f1" stroke="${INK}" stroke-width="7"/>
    ${txt(0, -48, 'FOOD', 34, CAP, { ls: 2 })}<path d="M-26,0 L26,0 L16,40 L-16,40 Z" fill="#b9bec6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></g>`;
}
function pellets(x, yTop, yBottom, t, t0, nP = 6) {
  let s = '';
  for (let i = 0; i < nP; i++) {
    const ts = t0 + i * 0.06;
    if (t < ts) continue;
    const dt = t - ts;
    const y = Math.min(yBottom, yTop + 220 * dt + 900 * dt * dt * (dt < 0.2 ? 1 : 0.3));
    s += `<circle cx="${n(x + (i % 3 - 1) * 16 + 6 * Math.sin(dt * 8 + i))}" cy="${n(y)}" r="9" fill="#a0522d" stroke="${INK}" stroke-width="3"/>`;
  }
  return s;
}
function wallClock(cx, cy, r, ang, openArc, sc) {
  if (sc <= 0.01) return '';
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)})">`;
  s += `<circle r="${r}" fill="#fff" stroke="${INK}" stroke-width="10"/>`;
  if (openArc > 0.01) {
    const a0 = -90 * D2R, a1 = (-90 + 60 * openArc) * D2R;
    s += `<path d="M0,0 L${n(r * 0.86 * Math.cos(a0))},${n(r * 0.86 * Math.sin(a0))} A${n(r * 0.86)},${n(r * 0.86)} 0 0 1 ${n(r * 0.86 * Math.cos(a1))},${n(r * 0.86 * Math.sin(a1))} Z" fill="#7ee07a" opacity="0.85"/>`;
  }
  for (let i = 0; i < 12; i++) { const a = i * 30 * D2R; s += `<line x1="${n(r * 0.78 * Math.sin(a))}" y1="${n(-r * 0.78 * Math.cos(a))}" x2="${n(r * 0.9 * Math.sin(a))}" y2="${n(-r * 0.9 * Math.cos(a))}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`; }
  const hA = (ang - 90) * D2R, mA = (ang * 12 - 90) * D2R;
  s += `<line x1="0" y1="0" x2="${n(r * 0.48 * Math.cos(hA))}" y2="${n(r * 0.48 * Math.sin(hA))}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>`;
  s += `<line x1="0" y1="0" x2="${n(r * 0.72 * Math.cos(mA))}" y2="${n(r * 0.72 * Math.sin(mA))}" stroke="${CAP}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<circle r="12" fill="${INK}"/>`;
  return s + `</g>`;
}
function fov(x, y, sc, t, speed) {
  const c = uid('fov');
  const sp = t * speed;
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<rect x="-260" y="40" width="520" height="70" rx="20" fill="#57606b" stroke="${INK}" stroke-width="8"/>`;
  for (const wx of [-180, 180]) s += `<g transform="translate(${wx} 120) rotate(${n(sp)})"><circle r="56" fill="#2e2e35" stroke="${INK}" stroke-width="8"/><circle r="24" fill="#b9bec6" stroke="${INK}" stroke-width="5"/><line x1="-24" y1="0" x2="24" y2="0" stroke="${INK}" stroke-width="5"/></g>`;
  s += `<line x1="200" y1="40" x2="200" y2="-330" stroke="${INK}" stroke-width="12"/><rect x="170" y="-370" width="70" height="50" rx="10" fill="#2e2e35" stroke="${INK}" stroke-width="6"/><circle cx="240" cy="-345" r="12" fill="#5cf2ff" stroke="${INK}" stroke-width="4"/>`;
  s += `<defs><clipPath id="${c}"><rect x="-230" y="-250" width="410" height="286" rx="20"/></clipPath></defs>`;
  s += `<rect x="-230" y="-250" width="410" height="286" rx="20" fill="#eefbff"/>`;
  s += `<g clip-path="url(#${c})"><rect x="-240" y="${n(-200 + 6 * Math.sin(t * 5))}" width="440" height="300" fill="${AQUA}"/>`;
  s += goldfish(-30, -90, 0.8, { dir: 1, t, eye: 'open', glasses: t >= (T.tank || 0) - 0.1, rot: -4 });
  s += `</g><rect x="-230" y="-250" width="410" height="286" rx="20" fill="none" stroke="${INK}" stroke-width="9"/>`;
  return s + `</g>`;
}
const ART_D = '#b52a24';
const SCOOP = '#ff9ec4', SCOOP_D = '#e8749f', CONE = '#e8b46a', CONE_D = '#c98d3f';
function iceCream(x, y, sc, ang = 0, bites = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  s += `<path d="M-60,0 L60,0 L0,170 Z" fill="${CONE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-40,20 L20,110 M-10,10 L36,70 M40,20 L-20,110 M10,10 L-36,70" stroke="${CONE_D}" stroke-width="5"/>`;
  const big = 1 - 0.35 * bites;
  s += `<path d="M-70,6 C-90,-40 -60,${n(-110 * big)} 0,${n(-112 * big)} C60,${n(-110 * big)} 90,-40 70,6 C50,22 30,4 10,18 C-10,4 -40,24 -70,6 Z" fill="${SCOOP}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-30,${n(-80 * big)} Q-10,${n(-96 * big)} 14,${n(-86 * big)}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.8"/>`;
  s += `<circle cx="${n(4)}" cy="${n(-118 * big)}" r="14" fill="${CAP}" stroke="${INK}" stroke-width="5"/>`;
  return s + `</g>`;
}
function iceBlock(x0, y0, w, h, sc) {
  if (sc <= 0.01) return '';
  const cx = x0 + w / 2, cy = y0 + h;
  let s = `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(sc)}) translate(${n(-cx)} ${n(-cy)})">`;
  s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="26" fill="${ICE}" fill-opacity="0.62" stroke="${INK}" stroke-width="9"/>`;
  s += `<path d="M${x0 + 40},${y0 + 60} L${x0 + 40},${y0 + h * 0.5} M${x0 + 70},${y0 + 40} L${x0 + 70},${y0 + 140}" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.85"/>`;
  s += `<path d="M${x0 + w - 60},${y0 + h - 160} l30,-40 M${x0 + w - 90},${y0 + h - 90} l50,-60" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.7"/>`;
  for (let i = 0; i < 6; i++) { const ix = x0 + 40 + i * (w - 80) / 5; s += `<path d="M${n(ix - 16)},${y0 + 4} L${n(ix + 16)},${y0 + 4} L${n(ix)},${y0 + 50 + (i % 2) * 24} Z" fill="#eaf8ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`; }
  return s + `</g>`;
}
function profileHead(x, y, sc, o) {
  const t = o.t || 0;
  const c = uid('ph');
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-120,250 L-120,420 C-320,440 -420,520 -440,700 L380,700 C360,520 260,440 120,420 L120,250 Z" fill="${WHITE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<defs><clipPath id="${c}"><circle cx="0" cy="0" r="330"/></clipPath></defs>`;
  s += `<circle cx="0" cy="0" r="330" fill="${WHITE}"/>`;
  s += `<g clip-path="url(#${c})">`;
  s += `<circle cx="70" cy="40" r="300" fill="${SHADE}" opacity="0.0"/>`;
  s += `<path d="M-280,-200 Q0,-330 280,-200 L330,330 L-330,330 Z" fill="#fff4f0"/>`;
  s += `<g transform="translate(-40 6) scale(0.88)">`;
  s += `<path d="M-250,-60 C-280,-170 -170,-270 -40,-268 C90,-275 230,-200 230,-90 C240,-30 170,0 80,-6 C20,10 -80,10 -140,-4 C-210,4 -250,-20 -250,-60 Z" fill="#f7a8c1" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-180,-150 q30,-30 60,0 M-60,-200 q40,-20 60,20 M60,-180 q36,-10 50,30 M-140,-70 q40,-24 70,6 M20,-90 q34,30 80,6" fill="none" stroke="#d6698f" stroke-width="7" stroke-linecap="round"/>`;
  s += `</g>`;
  const av = o.artVis || 0;
  if (av > 0.01) {
    const sw = o.artery || 0;
    const wdt = lerp(16, 46, sw);
    const P = 'M40,340 C40,260 60,200 90,150 C130,90 170,20 150,-70 C130,-140 60,-170 -10,-190';
    s += `<path d="${P}" fill="none" stroke="${INK}" stroke-width="${n(wdt + 14)}" stroke-linecap="round" opacity="${n(av)}"/>`;
    s += `<path d="${P}" fill="none" stroke="${ART}" stroke-width="${n(wdt)}" stroke-linecap="round" opacity="${n(av)}"/>`;
    s += `<path d="${P}" fill="none" stroke="#ff8a7e" stroke-width="${n(wdt * 0.3)}" stroke-linecap="round" stroke-dasharray="10 40" stroke-dashoffset="${n(-t * (60 + 300 * sw))}" opacity="${n(av)}"/>`;
    if (sw > 0.2) {
      for (let i = 0; i < 2; i++) {
        const ph = ((t * 2 + i / 2) % 1);
        s += `<circle cx="150" cy="-50" r="${n(30 + 70 * ph)}" fill="none" stroke="${ART}" stroke-width="${n(6 * (1 - ph))}" opacity="${n(sw * (1 - ph))}"/>`;
      }
    }
  }
  const tongueUp = o.tongue || 0;
  s += `<path d="M340,120 C250,70 120,70 0,110 C-60,130 -80,170 -60,210 C40,230 200,230 340,200 Z" fill="#8a2f3c" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  const coldA = o.cold || 0;
  s += `<path d="M330,110 C240,64 120,66 0,108" fill="none" stroke="${coldA > 0.02 ? COLD : '#ff9fae'}" stroke-width="${n(14 + 6 * coldA)}" stroke-linecap="round"/>`;
  const ty = lerp(0, -70, tongueUp);
  s += `<path d="M330,${n(205 + ty * 0.5)} C250,${n(150 + ty)} 120,${n(140 + ty)} 0,${n(170 + ty * 0.7)} C-40,${n(190 + ty * 0.4)} -40,240 0,250 L330,250 Z" fill="#ff8fa3" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M260,${n(175 + ty * 0.9)} C200,${n(160 + ty)} 140,${n(158 + ty)} 90,${n(165 + ty)}" fill="none" stroke="#e8667f" stroke-width="6" stroke-linecap="round"/>`;
  if ((o.warm || 0) > 0.02) {
    const w = o.warm;
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.2 + i / 3) % 1);
      s += `<path d="M${120 + i * 60},${n(150 + ty - ph * 40)} q10,-14 0,-28 q-10,-14 0,-28" fill="none" stroke="#ff9a3d" stroke-width="7" stroke-linecap="round" opacity="${n(w * (1 - ph))}"/>`;
    }
  }
  if (coldA > 0.02) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.4 + i / 3) % 1);
      const r = 40 + 160 * ph;
      s += `<path d="M${n(170 - r)},${n(80 - r * 0.25)} Q170,${n(80 - r * 1.1)} ${n(170 + r)},${n(80 - r * 0.25)}" fill="none" stroke="${COLD}" stroke-width="${n(9 * (1 - ph))}" stroke-linecap="round" opacity="${n(coldA * (1 - ph))}"/>`;
    }
  }
  s += `</g>`;
  s += `<circle cx="0" cy="0" r="330" fill="none" stroke="${INK}" stroke-width="10"/>`;
  s += `<path d="M-280,-200 Q0,-330 280,-200" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="16 12" opacity="0.5"/>`;
  s += `<path d="M318,-10 Q380,30 326,70" fill="${WHITE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  const pain = o.pain || 0;
  s += `<circle cx="230" cy="-60" r="34" fill="#fff" stroke="${INK}" stroke-width="7"/>`;
  if (pain > 0.5) s += `<path d="M212,-58 L246,-70 M212,-58 L246,-46" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  else s += `<circle cx="244" cy="-58" r="14" fill="${INK}"/><circle cx="248" cy="-64" r="5" fill="#fff"/>`;
  s += `<path d="M196,${n(-110 + 14 * pain)} Q236,${n(-126 + 4 * pain)} 270,${n(-104 - 6 * pain)}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  const sc2 = o.scoop || 0;
  if (sc2 > 0.01) s += iceCream(lerp(620, 300, sc2), 140, 1.05, -96, 0);
  return s + `</g>`;
}
function cup(x, y, sc, t, level) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-50,-140 L50,-140 L40,0 L-40,0 Z" fill="#eefbff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  const ly = lerp(-30, -120, level);
  s += `<path d="M${n(-44 + (ly + 140) * 0.07)},${n(ly)} L${n(44 - (ly + 140) * 0.07)},${n(ly)} L40,-4 L-40,-4 Z" fill="${ICE_D}" opacity="0.8"/>`;
  for (const [ix, iy, r] of [[-18, ly + 18, 0], [16, ly + 30, 20]]) s += `<rect x="${ix - 14}" y="${n(iy - 14)}" width="28" height="28" rx="6" fill="#fff" stroke="${INK}" stroke-width="4" transform="rotate(${r} ${ix} ${n(iy)})"/>`;
  return s + `</g>`;
}
function monitor(x, y, w, h, t, spike) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#2e2e35" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="${x + 20}" y="${y + 20}" width="${w - 40}" height="${h - 40}" rx="12" fill="#0b1220"/>`;
  let d = '';
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const tt0 = t - (1 - u) * 2;
    const base = 0.25 + 0.5 * clamp((tt0 - spike) / 0.3) * (tt0 > spike ? 1 : 0);
    const v = base + 0.08 * Math.sin(tt0 * 2 * Math.PI * 1.3) * (1 + (tt0 > spike ? 1.5 : 0));
    const px = x + 30 + u * (w - 60), py = y + h - 30 - v * (h - 60);
    d += (i ? 'L' : 'M') + n(px) + ',' + n(py);
  }
  s += `<path d="${d}" fill="none" stroke="#ff5a4e" stroke-width="6" stroke-linejoin="round"/>`;
  s += txt(x + 40, y + 62, 'BLOOD FLOW', 30, '#9fb2c8', { anchor: 'start', ls: 3 });
  return s;
}

// ====================================================== SHELL: shake, subtitles, defs, renderAt
function shakeAt(t) {
  let A = 0;
  for (const [t0, a, d] of (window.HITS || [])) if (t >= t0) A += a * Math.exp(-d * (t - t0));
  return [
    A * (Math.sin(2 * Math.PI * 13.3 * t) + 0.6 * Math.sin(2 * Math.PI * 7.1 * t + 1)) / 1.6,
    A * (Math.sin(2 * Math.PI * 11.7 * t + 2) + 0.5 * Math.sin(2 * Math.PI * 5.3 * t)) / 1.5,
  ];
}
const CAP_Y = 1796, CAP_SIZE = 76;
function captions(t) {
  for (const c of (window.CAPTIONS || [])) {
    if (t >= c.t0 && t < c.t1) {
      const str = c.text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      // pop-in: each 2-3 word chunk springs in (0.82 -> 1.08 -> 1) so the eye keeps getting a new "beat"
      const u = clamp((t - c.t0) / 0.16, 0, 1);
      const s2 = u < 1 ? lerp(0.82, 1.08, Math.min(1, u / 0.6)) - (u > 0.6 ? 0.08 * (u - 0.6) / 0.4 : 0) : 1;
      const base = `x="0" y="0" text-anchor="middle" font-family="Poppins" font-weight="700" font-style="italic" font-size="${CAP_SIZE}" letter-spacing="1.5"`;
      return `<g transform="translate(540 ${CAP_Y}) scale(${n(s2)})">` +
        `<text ${base} transform="translate(4 6)" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round">${str}</text>` +
        `<text ${base} fill="#f8f20f" stroke="${INK}" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${str}</text></g>`;
    }
  }
  return '';
}
function defs() {
  let d = `<defs>
    <radialGradient id="studio" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#f3ecff"/><stop offset="1" stop-color="#d9c8ff"/></radialGradient>
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9ff"/><stop offset="1" stop-color="#eef7ff"/></linearGradient>
    <linearGradient id="aquaBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4f1fb"/><stop offset="1" stop-color="#f0fbff"/></linearGradient>
    <linearGradient id="iceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff4ff"/><stop offset="1" stop-color="#f4fbff"/></linearGradient>
    <radialGradient id="mint" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#eafaf3"/><stop offset="1" stop-color="#bfe8d6"/></radialGradient>
    <radialGradient id="purple" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#f1e6ff"/><stop offset="1" stop-color="#cdb6f2"/></radialGradient>
    <clipPath id="clipTop"><rect x="-100" y="-100" width="1280" height="1060"/></clipPath>
    <clipPath id="clipBot"><rect x="-100" y="960" width="1280" height="1100"/></clipPath>
    <clipPath id="screenClip"><rect x="80" y="340" width="920" height="1100" rx="20"/></clipPath>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>`;
  for (let b = 1; b <= 40; b++) d += `<filter id="blur${b}" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1480" height="2320"><feGaussianBlur stdDeviation="${b / 10}"/></filter>`;
  return d + `</defs>`;
}
let _defs = null;
window.renderAt = function (t) {
  _id = 0;
  if (!_defs) _defs = defs();
  const shots = window.SHOTS || [];
  let fn = shots.length ? shots[0][1] : (() => '');
  for (const [t0, f] of shots) if (t >= t0) fn = f;
  const body = fn(t);
  const [sx, sy] = shakeAt(t);
  const bg = window.BG || '#ffe2ad';
  document.getElementById('stage').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${_defs}<g transform="translate(${n(sx)} ${n(sy)})"><rect x="-60" y="-60" width="${W + 120}" height="${H + 120}" fill="${bg}"/>${body}</g>${captions(t)}</svg>`;
};

// ====================================================== HELPERS from the yawn short (v3)
// guy expr 'yawn' (o.yawn 0..1), yawnAmt(t,t0,dur), stretch(o,y), moodBrain(cx,cy,r,heat,'hot'|'cool',t), steam(x,y,t,amp,col),
// flowPath(d,w,col,flowCol,t,speed,op), torso(HX,HY,HS), bigHead(HX,HY,HS,o), tank(x,y,sc) O2 tank, pack(hot,t,dropT) bag on head (guy prop), counter(x,y,k,tk,t,col)
// ---------------------------------------------------------------- yawn face for the guy rig: o.expr = 'yawn', o.yawn 0..1
const _guyFace = guyFace;
guyFace = function (o) {
  if (o.expr !== 'yawn') return _guyFace(o);
  const y = clamp(o.yawn || 0);
  const lx = o.lookX || 0, ly = o.lookY || 0;
  const e1 = [-34 + lx, -308 + ly], e2 = [0 + lx, -308 + ly];
  let s = '';
  for (const [x, yy] of [e1, e2]) {
    if (y > 0.3) s += `<path d="M${n(x - 12)},${n(yy + 3)} Q${n(x)},${n(yy - 9)} ${n(x + 12)},${n(yy + 3)}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    else s += `<ellipse cx="${n(x)}" cy="${n(yy)}" rx="9" ry="${n(13 * (1 - y))}" fill="${INK}"/><circle cx="${n(x + 3)}" cy="${n(yy - 5)}" r="3.2" fill="#fff"/>`;
    const lift = 4 + 10 * y;
    s += `<path d="M${n(x - 13)},${n(yy - 24 - lift)} Q${n(x)},${n(yy - 33 - lift)} ${n(x + 13)},${n(yy - 24 - lift)}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`;
  }
  const mx = -17 + lx * 0.6, my = -262 + ly * 0.4;
  if (y < 0.06) {
    s += `<path d="M${n(mx - 12)},${n(my - 2)} Q${n(mx)},${n(my + 8)} ${n(mx + 12)},${n(my - 2)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else {
    const rx = 8 + 12 * y, ry = 4 + 25 * y, cy = my - 2 + 6 * y;
    s += `<ellipse cx="${n(mx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${INK}"/>`;
    if (y > 0.3) s += `<ellipse cx="${n(mx)}" cy="${n(cy + ry * 0.55)}" rx="${n(rx * 0.6)}" ry="${n(ry * 0.3)}" fill="${SKIN_PINK}"/>`;
  }
  return s;
};
function yawnAmt(t, t0, dur = 1.3) {
  return eo(prog(t, t0, t0 + 0.35)) * (1 - eio(prog(t, t0 + dur - 0.35, t0 + dur)));
}
function stretch(o, y) {
  o.armL = [lerp(-64, -100, y), lerp(-118, -410, y)];
  o.armR = [lerp(64, 100, y), lerp(-118, -410, y)];
  o.bendL = lerp(-18, 30, y); o.bendR = lerp(18, -30, y);
  return o;
}
const BRAIN_D = 'M-95,10 C-110,-40 -70,-85 -25,-80 C-5,-105 45,-100 60,-70 C100,-70 115,-20 95,10 C110,50 70,85 30,75 C10,95 -40,95 -55,70 C-90,75 -110,40 -95,10 Z';
// brain with heat tint and a face; mood 'hot' | 'cool'
function moodBrain(cx, cy, r, heat, mood, t) {
  let s = brain(cx, cy, r);
  let g = '';
  if (heat > 0.01) g += `<path d="${BRAIN_D}" fill="#ff4a3a" opacity="${n(0.6 * heat)}"/><path d="${BRAIN_D}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  if (heat < 0.6 && mood === 'cool') g += `<path d="${BRAIN_D}" fill="#8fd3ff" opacity="${n(0.35 * (1 - heat))}"/><path d="${BRAIN_D}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  if (mood === 'hot') {
    g += `<ellipse cx="-26" cy="-6" rx="10" ry="14" fill="${INK}"/><ellipse cx="26" cy="-6" rx="10" ry="14" fill="${INK}"/>`;
    g += `<path d="M-40,-30 L-14,-24 M40,-30 L14,-24" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    g += `<ellipse cx="0" cy="${n(32 + 2 * Math.sin(t * 14))}" rx="14" ry="${n(11 + 3 * Math.sin(t * 14))}" fill="${INK}"/><ellipse cx="0" cy="40" rx="8" ry="4" fill="${SKIN_PINK}"/>`;
    g += drop(78, -50 + 6 * ((t * 1.5) % 1) * 4, 9) + drop(-82, -30 + 6 * ((t * 1.5 + 0.5) % 1) * 4, 8);
  } else {
    g += `<path d="M-38,-4 Q-26,-18 -14,-4 M14,-4 Q26,-18 38,-4" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    g += `<path d="M-20,24 Q0,42 20,24" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  }
  s += `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(r / 100)})">${g}</g>`;
  return s;
}
function steam(x, y, t, amp, col = '#ff8a3d') {
  if (amp <= 0.02) return '';
  let s = '';
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.9 + i / 3) % 1);
    const px = x + (i - 1) * 60 * amp, py = y - ph * 120 * amp;
    let d = '';
    for (let k = 0; k <= 10; k++) { const u = k / 10; d += (k ? 'L' : 'M') + n(px + 12 * amp * Math.sin(u * 7 + t * 5 + i)) + ',' + n(py - u * 80 * amp); }
    s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${n(10 * amp)}" stroke-linecap="round" opacity="${n(Math.sin(Math.PI * ph))}"/>`;
  }
  return s;
}
function flowPath(d, w, col, flowCol, t, speed, op = 1) {
  if (op <= 0.01) return '';
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 14}" stroke-linecap="round" opacity="${n(op)}"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${n(op)}"/>` +
    `<path d="${d}" fill="none" stroke="${flowCol}" stroke-width="${n(w * 0.4)}" stroke-linecap="round" stroke-dasharray="14 34" stroke-dashoffset="${n(-t * speed)}" opacity="${n(op)}"/>`;
}
function torso(HX, HY, HS) {
  const k = HS / 3;
  return `<path d="M${n(HX - 330 * k)},${n(HY + 1100)} C${n(HX - 330 * k)},${n(HY + 330 * k)} ${n(HX - 140 * k)},${n(HY + 180 * k)} ${HX},${n(HY + 180 * k)} C${n(HX + 140 * k)},${n(HY + 180 * k)} ${n(HX + 330 * k)},${n(HY + 330 * k)} ${n(HX + 330 * k)},${n(HY + 1100)} Z" fill="${WHITE}" stroke="${INK}" stroke-width="${OUT}"/>`;
}
const bigHead = (HX, HY, HS, o) => `<g transform="translate(${HX} ${HY}) scale(${HS}) translate(0 300)">${guyHead(o)}</g>`;
function tank(x, y, sc) {
  let s = `<g transform="translate(${x} ${y}) scale(${sc})">`;
  s += `<rect x="-75" y="-470" width="150" height="470" rx="60" fill="#5cc96b" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<rect x="45" y="-430" width="18" height="380" rx="9" fill="#8fe39a"/>`;
  s += `<rect x="-75" y="-320" width="150" height="110" fill="#fff" stroke="${INK}" stroke-width="6"/>` + txt(0, -238, 'O2', 72, '#2f9e44');
  s += `<rect x="-24" y="-520" width="48" height="56" rx="8" fill="#b9bec6" stroke="${INK}" stroke-width="6"/>`;
  s += `<circle cx="0" cy="-540" r="26" fill="${CAP}" stroke="${INK}" stroke-width="6"/>`;
  return s + `</g>`;
}
function pack(hot, t, drop0) {
  const d = eo(prog(t, drop0, drop0 + 0.3));
  if (d <= 0) return '';
  const dy = lerp(-420, 0, d) + wob(t, drop0 + 0.3, 6, 4, 6);
  let s = `<g transform="translate(0 ${n(dy)})">`;
  s += `<path d="M-80,-366 Q-90,-410 -40,-420 L40,-420 Q90,-410 80,-366 Q0,-350 -80,-366 Z" fill="${hot ? '#ff6b5e' : ICE_D}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  s += `<rect x="-14" y="-436" width="28" height="20" rx="5" fill="${hot ? '#b52a24' : '#4f8fbf'}" stroke="${INK}" stroke-width="5"/>`;
  s += txt(0, -373, hot ? 'HOT' : 'ICE', 30, '#fff', { ls: 2 });
  s += `</g>`;
  if (d >= 1) s += hot ? steam(0, -440, t, 0.6) : snowflake(70, -440, 16, t * 80, '#fff') + snowflake(-70, -430, 12, -t * 80, '#fff');
  return s;
}
function counter(x, y, k, tk, t, col) {
  let s = txt(x, y - 120, 'YAWNS', 44, INK, { ls: 4 });
  const sc = k > 0 ? clamp(pop(t, tk, 2.6, 8), 0, 1.25) : 1;
  s += popG(x, y + 30, sc, txt(0, 0, String(k), 160, col, { stroke: INK, sw: 12 }));
  return s;
}
// ---------------------------------------------------------------- reusable pieces (bull, cape, arena)
const BULL = '#6b4a3a', BULL_D = '#4e3326', BULL_L = '#8a6450', MUZ = '#e3a08f';
const SAND = '#f2c98a', SAND_D = '#e0b06c';
function mixHex(a, b, u) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
}
function bull(x, y, sc, o = {}) {
  const t = o.t || 0, run = o.run || 0, mood = o.mood || 'calm';
  const ph = t * (o.speed || 6) * 2 * Math.PI;
  const leg = (lx, k, col) => {
    const sw = run * 30 * Math.sin(ph + k);
    return `<path d="M${lx},-120 L${n(lx + sw)},-16" stroke="${INK}" stroke-width="36" stroke-linecap="round"/>` +
      `<path d="M${lx},-120 L${n(lx + sw)},-16" stroke="${col}" stroke-width="22" stroke-linecap="round"/>` +
      `<ellipse cx="${n(lx + sw - 4)}" cy="-8" rx="22" ry="12" fill="#2b2b2b" stroke="${INK}" stroke-width="5"/>`;
  };
  let s = leg(-60, Math.PI, BULL_D) + leg(110, 0, BULL_D);
  const bob = run * 9 * Math.abs(Math.sin(ph)) + (o.bob || 0);
  let b = '';
  const tw = 12 * Math.sin(t * 5);
  b += `<path d="M185,-205 C235,-195 225,-140 ${n(238 + tw)},-100" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>`;
  b += `<path d="M185,-205 C235,-195 225,-140 ${n(238 + tw)},-100" fill="none" stroke="${BULL}" stroke-width="6" stroke-linecap="round"/>`;
  b += `<circle cx="${n(238 + tw)}" cy="-92" r="15" fill="${BULL_D}" stroke="${INK}" stroke-width="5"/>`;
  const body = 'M-110,-250 C-40,-292 120,-272 190,-215 C222,-180 212,-122 170,-105 C80,-90 -40,-90 -110,-115 C-150,-140 -150,-222 -110,-250 Z';
  b += `<path d="${body}" fill="${BULL}"/>`;
  b += `<ellipse cx="30" cy="-120" rx="95" ry="20" fill="${BULL_L}"/>`;
  b += `<path d="${body}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += `<g transform="translate(0 ${n(-bob)})">${b}</g>`;
  s += leg(-90, 0, BULL) + leg(140, Math.PI, BULL);
  // head
  const lower = o.charge ? 26 : 0;
  let h = '';
  const horn = (m) => `<path d="M${-28 * m},-38 C${-60 * m},-78 ${-92 * m},-98 ${-104 * m},-80 C${-84 * m},-80 ${-58 * m},-62 ${-14 * m},-46 Z" fill="${BONE}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  h += horn(1) + horn(-1);
  h += `<ellipse cx="-70" cy="-22" rx="28" ry="14" transform="rotate(-20 -70 -22)" fill="${BULL}" stroke="${INK}" stroke-width="6"/>`;
  h += `<ellipse cx="70" cy="-22" rx="28" ry="14" transform="rotate(20 70 -22)" fill="${BULL}" stroke="${INK}" stroke-width="6"/>`;
  h += `<ellipse cx="0" cy="0" rx="64" ry="66" fill="${BULL}" stroke="${INK}" stroke-width="${OUT}"/>`;
  h += `<path d="M-14,-62 C-4,-80 14,-74 8,-60 C18,-70 26,-58 16,-52" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  const lx = o.lookX || 0, ly = o.lookY || 0;
  const red = mood === 'angry' ? (o.red === undefined ? 1 : o.red) : 0;
  const eye = (ex) => {
    let e = `<circle cx="${ex}" cy="-10" r="16" fill="${mixHex('#ffffff', '#ff9a8e', red)}" stroke="${INK}" stroke-width="5"/>`;
    e += `<circle cx="${n(ex + lx)}" cy="${n(-8 + ly)}" r="${mood === 'angry' ? 6 : 8}" fill="${INK}"/>`;
    if (mood === 'meh') e += `<path d="M${ex - 17},-12 A17,17 0 0 1 ${ex + 17},-12 Z" fill="${BULL}" stroke="${INK}" stroke-width="5"/>`;
    return e;
  };
  h += eye(-26) + eye(24);
  if (mood === 'angry') h += `<path d="M-50,-38 L-12,-22 M48,-38 L10,-22" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
  if (mood === 'confused') h += `<path d="M-42,-40 Q-26,-50 -10,-40 M8,-30 L40,-30" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  if (mood === 'calm') h += `<path d="M-40,-36 Q-26,-42 -12,-36 M10,-36 Q24,-42 38,-36" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  h += `<ellipse cx="-4" cy="46" rx="56" ry="34" fill="${MUZ}" stroke="${INK}" stroke-width="6"/>`;
  h += `<ellipse cx="-24" cy="44" rx="8" ry="11" fill="${INK}"/><ellipse cx="16" cy="44" rx="8" ry="11" fill="${INK}"/>`;
  h += `<circle cx="-4" cy="74" r="14" fill="none" stroke="#ffd23f" stroke-width="7"/>`;
  const st = o.steam || 0;
  if (st > 0.01) for (const nx of [-24, 16]) for (let i = 0; i < 3; i++) {
    const p = (t * 1.6 + i / 3 + (nx > 0 ? 0.15 : 0)) % 1;
    h += `<circle cx="${n(nx + (nx < 0 ? -1 : 1) * p * 70)}" cy="${n(60 + p * 40)}" r="${n((10 + p * 22) * st)}" fill="#fff" fill-opacity="${n(1 - p)}" stroke="${INK}" stroke-width="4" stroke-opacity="${n(1 - p)}"/>`;
  }
  s += `<g transform="translate(-150 ${n(-205 + lower - bob)}) rotate(${n((o.tilt || 0) - (o.charge ? 12 : 0))})">${h}</g>`;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc * (o.flip ? -1 : 1))} ${n(sc)})">${s}</g>`;
}
function cape(x, y, sc, col, t, amp = 1, ang = 0) {
  const w = (k, f) => n(amp * 34 * Math.sin(t * f + k));
  let s = `<path d="M-120,0 L120,0 C${130 + +w(0, 7)},80 ${140 + +w(1, 6)},160 ${120 + +w(2, 8)},230 Q60,${n(250 + +w(3, 9) * 0.5)} 0,236 Q-60,${n(222 + +w(4, 7) * 0.5)} ${-120 + +w(5, 6)},230 C-130,150 -126,80 -120,0 Z" fill="${col}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += `<path d="M-40,10 Q${-30 + +w(6, 7) * 0.4},120 -44,220 M50,10 Q${60 + +w(7, 6) * 0.4},120 46,222" fill="none" stroke="${INK}" stroke-width="4" opacity="0.25"/>`;
  s += `<line x1="-140" y1="0" x2="140" y2="0" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><line x1="-140" y1="0" x2="140" y2="0" stroke="#a5713f" stroke-width="9" stroke-linecap="round"/>`;
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">${s}</g>`;
}
function arenaBg(sky = '#ffd9a0') {
  let s = `<rect x="-60" y="-60" width="${W + 120}" height="${H + 120}" fill="${sky}"/>`;
  s += `<rect x="-60" y="1080" width="${W + 120}" height="190" fill="#c8322c" stroke="${INK}" stroke-width="7"/>`;
  for (let x = 60; x < W + 60; x += 150) s += `<line x1="${x}" y1="1100" x2="${x}" y2="1270" stroke="#9e2420" stroke-width="6"/>`;
  s += `<rect x="-60" y="1060" width="${W + 120}" height="30" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  s += `<rect x="-60" y="1270" width="${W + 120}" height="800" fill="${SAND}"/><line x1="-60" y1="1270" x2="${W + 60}" y2="1270" stroke="${INK}" stroke-width="7"/>`;
  s += `<ellipse cx="540" cy="1560" rx="700" ry="150" fill="none" stroke="${SAND_D}" stroke-width="8"/>`;
  for (const [dx, dy] of [[120, 1400], [880, 1470], [330, 1650], [760, 1690]]) s += `<ellipse cx="${dx}" cy="${dy}" rx="26" ry="7" fill="${SAND_D}"/>`;
  return s;
}
function crowd(t, y0, rows, cheer = 0, seed = 3) {
  let s = '', k = seed;
  const r = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  const cols = ['#ffd23f', '#5fb8ec', '#ff8fa3', '#7ee07a', '#b98cf0', '#ff8a3d', '#ffffff'];
  for (let j = 0; j < rows; j++) {
    const yy = y0 + j * 120;
    s += `<rect x="-60" y="${yy + 40}" width="${W + 120}" height="80" fill="${j % 2 ? '#d9b98a' : '#cfae7d'}" stroke="${INK}" stroke-width="5"/>`;
    for (let x = -20 + (j % 2) * 45; x < W + 60; x += 90) {
      const c = cols[Math.floor(r() * cols.length)], p = r() * 6;
      const hop = cheer * 18 * Math.abs(Math.sin(t * 7 + p));
      s += `<path d="M${x - 30},${yy + 70 - hop} Q${x},${yy - 10 - hop} ${x + 30},${yy + 70 - hop} Z" fill="${c}" stroke="${INK}" stroke-width="5"/>`;
      if (cheer > 0.3) s += `<path d="M${x - 24},${yy + 20 - hop} L${x - 40},${yy - 40 - hop} M${x + 24},${yy + 20 - hop} L${x + 40},${yy - 40 - hop}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
      s += `<circle cx="${x}" cy="${yy - 10 - hop}" r="26" fill="${WHITE}" stroke="${INK}" stroke-width="5"/>`;
      s += `<circle cx="${x - 8}" cy="${yy - 14 - hop}" r="4" fill="${INK}"/><circle cx="${x + 8}" cy="${yy - 14 - hop}" r="4" fill="${INK}"/>`;
      s += cheer > 0.3 ? `<ellipse cx="${x}" cy="${yy - hop}" rx="8" ry="7" fill="#8a2f3c"/>` : `<path d="M${x - 7},${yy - 2 - hop} Q${x},${yy + 3 - hop} ${x + 7},${yy - 2 - hop}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    }
  }
  return s;
}
// a coloured shirt + trousers drawn over guy()
function outfit(col) {
  return `<path d="M-22,-96 L-26,-14 M22,-96 L22,-14" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round"/>` +
    `<path d="M-22,-96 L-26,-30 M22,-96 L22,-30" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round"/>` +
    `<path d="M-48,-200 C-60,-160 -64,-112 -52,-88 Q0,-70 52,-88 C64,-112 60,-160 48,-200 Q0,-214 -48,-200 Z" fill="${col}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
}
const sc1 = (t, t0, f = 2.4, d = 7, mx = 1.15) => clamp(pop(t, t0, f, d), 0, mx);

// ---------------------------------------------------------------- camel short (2026-11-13): camel rig + desert pieces
// camel(x,y,sc,{t,mood:'calm'|'happy'|'sad'|'surprised',full,flop,squish,inner:'water'|'xray'|'lunch',level,cap,capPop,open,headDown,belly,walk,chew,vessels}), desertBg(sky), cactus, flame, waterBottle, bucket, zoomG
// ---------------------------------------------------------------- camel rig (side view, faces right, feet at y 0)
const CAMEL = '#d9a45b', CAMEL_D = '#b8833f', CAMEL_L = '#ecc184', FAT = '#ffe58a', FAT_D = '#f2c53d';
function humpPath(full, flop) {
  const L = [-150, -398], R = [110, -414];
  const Hh = 40 + 180 * full;
  const px = -20 - 200 * flop, py = lerp(-420 - Hh, -360, flop);
  return `M${L[0]},${L[1]} C${n(L[0] + 10 - 60 * flop)},${n(L[1] - 40 * (1 - flop))} ${n(px - 70)},${n(py)} ${n(px)},${n(py)} ` +
    `C${n(px + 90)},${n(py)} ${R[0]},${n(R[1] - 70 * (1 - flop))} ${R[0]},${R[1]} Z`;
}
function camelHead(o) {
  const mood = o.mood || 'calm', t = o.t || 0;
  let h = '';
  h += `<ellipse cx="-44" cy="-38" rx="16" ry="24" transform="rotate(-25 -44 -38)" fill="${CAMEL_D}" stroke="${INK}" stroke-width="6"/>`;
  h += `<path d="M-60,-30 C-60,-62 20,-66 70,-40 C104,-22 108,22 76,32 C30,46 -50,44 -62,10 Z" fill="${CAMEL}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  h += `<path d="M58,-30 C84,-24 100,-6 96,14" fill="none" stroke="${CAMEL_D}" stroke-width="8" stroke-linecap="round"/>`;
  h += `<path d="M78,-12 q10,4 6,14" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  const chew = o.chew ? 5 * Math.sin(t * 9) : 0;
  const mo = o.mouth || 0;
  if (mo > 0.05) h += `<ellipse cx="78" cy="${n(26 + chew * 0.3)}" rx="${n(14 + 6 * mo)}" ry="${n(4 + 14 * mo)}" fill="${INK}"/>`;
  else if (mood === 'happy') h += `<path d="M48,22 Q72,40 96,20" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  else if (mood === 'sad') h += `<path d="M52,34 Q74,20 96,30" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  else h += `<path d="M52,${n(26 + chew)} Q74,${n(32 + chew)} 96,${n(24 + chew)}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  const ex = 6, ey = -14, lx = o.lookX || 0;
  if (mood === 'happy') {
    h += `<path d="M${ex - 15},${ey + 4} Q${ex},${ey - 14} ${ex + 15},${ey + 4}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  } else {
    const r = mood === 'surprised' ? 19 : 16;
    h += `<circle cx="${ex}" cy="${ey}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    h += `<circle cx="${n(ex + 4 + lx)}" cy="${ey + 2}" r="${mood === 'surprised' ? 6 : 8}" fill="${INK}"/>`;
    if (mood === 'calm' || mood === 'sad') {
      const lid = mood === 'sad' ? 2 : -2;
      h += `<path d="M${ex - r - 2},${ey + lid} A${r + 2},${r + 2} 0 0 1 ${ex + r + 2},${ey + lid} Z" fill="${CAMEL_D}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    }
    if (mood === 'sad') h += `<path d="M${ex - 18},${ey - 34} L${ex + 16},${ey - 24}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    if (mood === 'surprised') h += `<path d="M${ex - 16},${ey - 34} Q${ex},${ey - 44} ${ex + 16},${ey - 34}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return h;
}
// o: t, mood, full (hump 0..1), flop 0..1, squish, inner 'water'|'xray'|'lunch'|null, level, cap, headDown 0..1, mouth, chew, walk, belly
function camel(x, y, sc, o = {}) {
  const t = o.t || 0, walk = o.walk || 0;
  const ph = t * 5 * 2 * Math.PI;
  const leg = (lx, k, col) => {
    const sw = walk * 22 * Math.sin(ph + k);
    const kx = lx + sw * 0.4;
    return `<path d="M${lx},-320 L${n(kx)},-150 L${n(lx + sw)},-16" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M${lx},-320 L${n(kx)},-150 L${n(lx + sw)},-16" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${n(kx)}" cy="-150" r="15" fill="${col}" stroke="${INK}" stroke-width="5"/>` +
      `<ellipse cx="${n(lx + sw + 4)}" cy="-8" rx="26" ry="11" fill="${CAMEL_D}" stroke="${INK}" stroke-width="5"/>`;
  };
  let s = leg(-140, Math.PI, CAMEL_D) + leg(110, 0, CAMEL_D);
  const bob = walk * 6 * Math.abs(Math.sin(ph)) + 4 * Math.sin(t * 2.2);
  let b = '';
  const tw = 10 * Math.sin(t * 4);
  b += `<path d="M-196,-360 C-226,-330 -222,-290 ${n(-226 + tw)},-250" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>`;
  b += `<path d="M-196,-360 C-226,-330 -222,-290 ${n(-226 + tw)},-250" fill="none" stroke="${CAMEL}" stroke-width="6" stroke-linecap="round"/>`;
  b += `<path d="M${n(-226 + tw)},-250 l-8,26 l16,-4 Z" fill="${CAMEL_D}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  // neck + head
  const hd = o.headDown || 0;
  const hx = lerp(290, 330, hd), hy = lerp(-600, -250, hd);
  const neck = `M120,-370 C210,-380 ${n(lerp(250, 340, hd))},${n(lerp(-470, -380, hd))} ${n(hx - 20)},${n(hy + 14)}`;
  b += `<path d="${neck}" fill="none" stroke="${INK}" stroke-width="${70 + 2 * OUT}" stroke-linecap="round"/>`;
  b += `<path d="${neck}" fill="none" stroke="${CAMEL}" stroke-width="70" stroke-linecap="round"/>`;
  // hump
  const sq = o.squish || 0;
  const hp = humpPath(o.full === undefined ? 1 : o.full, o.flop || 0);
  const cid = uid('hump');
  let hm = `<defs><clipPath id="${cid}"><path d="${hp}"/></clipPath></defs>`;
  const inner = o.inner;
  hm += `<path d="${hp}" fill="${inner === 'xray' ? '#9fc2e0' : CAMEL}"/>`;
  hm += `<g clip-path="url(#${cid})">`;
  if (inner === 'water') {
    const lv = -420 - 150 * (o.level === undefined ? 0.75 : o.level);
    const wv = (k) => n(lv + 12 * Math.sin(t * 6 + k));
    hm += `<path d="M-260,${wv(0)} Q-150,${wv(1.4)} -40,${wv(2.1)} T180,${wv(3)} L180,-300 L-260,-300 Z" fill="${WATER}"/>`;
    hm += `<path d="M-260,${wv(0)} Q-150,${wv(1.4)} -40,${wv(2.1)} T180,${wv(3)}" fill="none" stroke="#fff" stroke-width="8" opacity="0.8"/>`;
    for (let i = 0; i < 4; i++) { const p = (t * 0.7 + i / 4) % 1; hm += `<circle cx="${-100 + i * 55}" cy="${n(-410 - p * 120)}" r="${8 + i * 2}" fill="none" stroke="#fff" stroke-width="4" opacity="${n(1 - p)}"/>`; }
  } else if (inner === 'xray') {
    const g = o.glow || 0;
    for (const [fx, fy, r] of [[-70, -470, 48], [-10, -520, 56], [50, -470, 46], [-20, -440, 40], [-110, -430, 30], [80, -432, 28]]) {
      const pr = r * (1 + 0.05 * Math.sin(t * 5 + fx));
      hm += `<circle cx="${fx}" cy="${fy}" r="${n(pr * (0.6 + 0.4 * g))}" fill="${FAT}" stroke="${FAT_D}" stroke-width="6"/>`;
    }
  } else {
    hm += `<ellipse cx="60" cy="-470" rx="50" ry="110" fill="${CAMEL_D}" opacity="0.45"/>`;
  }
  hm += `</g>`;
  hm += `<path d="${hp}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  let ov = '';
  if (inner === 'lunch') {
    const op = o.open || 0;
    ov += `<path d="M-146,-440 Q-20,-470 106,-450" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="14 10"/>`;
    ov += `<rect x="-36" y="-462" width="40" height="34" rx="6" fill="#c9ced6" stroke="${INK}" stroke-width="5"/>`;
    if (op > 0.01) ov += `<g transform="translate(-18 ${n(-650 - 70 * op)}) scale(${n(op)})">` +
      `<path d="M-70,10 Q0,-40 70,10 Z" fill="#f2c27b" stroke="${INK}" stroke-width="6"/>` +
      `<path d="M-74,10 Q-40,24 0,14 Q40,26 74,10 L70,22 L-70,22 Z" fill="#7ee07a" stroke="${INK}" stroke-width="5"/>` +
      `<rect x="-70" y="22" width="140" height="16" fill="#e8413a" stroke="${INK}" stroke-width="5"/>` +
      `<path d="M-70,38 L70,38 Q60,58 0,58 Q-60,58 -70,38 Z" fill="#f2c27b" stroke="${INK}" stroke-width="6"/></g>`;
    const hy2 = -660 + 30 * op;
    ov += `<path d="M-90,${hy2 + 70} C-90,${hy2 - 20} 50,${hy2 - 20} 50,${hy2 + 70}" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>`;
    ov += `<path d="M-90,${hy2 + 70} C-90,${hy2 - 20} 50,${hy2 - 20} 50,${hy2 + 70}" fill="none" stroke="#e8413a" stroke-width="12" stroke-linecap="round"/>`;
  }
  if (o.cap) {
    const cy = -640 - (o.capPop || 0) * 120;
    ov += `<path d="M-160,-410 C-150,-560 60,-600 120,-420" fill="none" stroke="${INK}" stroke-width="22"/><path d="M-160,-410 C-150,-560 60,-600 120,-420" fill="none" stroke="#5a8f3a" stroke-width="12"/>`;
    ov += `<rect x="-46" y="${n(cy)}" width="52" height="44" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="6" transform="rotate(${n(25 * (o.capPop || 0))} -20 ${n(cy + 20)})"/>`;
  }
  b += `<g transform="translate(-20 -420) scale(${n(1 + 0.08 * sq)} ${n(1 - 0.12 * sq)}) translate(20 420)">${hm}</g>`;
  // body
  const belly = o.belly || 0;
  const body = `M-200,-350 C-200,-420 -120,-440 0,-436 C130,-432 200,-410 200,-350 C200,${n(-290 + belly * 40)} 120,${n(-262 + belly * 60)} 0,${n(-262 + belly * 60)} C-120,${n(-262 + belly * 40)} -200,-290 -200,-350 Z`;
  b += `<path d="${body}" fill="${CAMEL}"/>`;
  b += `<ellipse cx="10" cy="${n(-290 + belly * 40)}" rx="140" ry="18" fill="${CAMEL_L}"/>`;
  b += `<path d="${body}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  if (o.vessels) b += o.vessels;
  b += `<g transform="translate(-20 -420) scale(${n(1 + 0.08 * sq)} ${n(1 - 0.12 * sq)}) translate(20 420)">${ov}</g>`;
  b += `<g transform="translate(${n(hx)} ${n(hy)}) rotate(${n(lerp(0, 50, hd))})">${camelHead(o)}</g>`;
  s += `<g transform="translate(0 ${n(-bob)})">${b}</g>`;
  s += leg(-100, 0, CAMEL) + leg(150, Math.PI, CAMEL);
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc * (o.flip ? -1 : 1))} ${n(sc)})">${s}</g>`;
}
function desertBg(sky = '#ffe2ad') {
  let s = `<rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="${sky}"/>`;
  s += `<circle cx="860" cy="330" r="120" fill="#ffd23f" stroke="${INK}" stroke-width="7"/>`;
  s += `<path d="M-200,1260 Q150,1120 460,1250 T1280,1200 L1280,2200 L-200,2200 Z" fill="${SAND_D}" stroke="${INK}" stroke-width="7"/>`;
  s += `<path d="M-200,1450 Q300,1380 700,1440 T1300,1420 L1300,2200 L-200,2200 Z" fill="${SAND}" stroke="${INK}" stroke-width="7"/>`;
  for (const [dx, dy] of [[140, 1560], [820, 1600], [420, 1680], [960, 1720]]) s += `<ellipse cx="${dx}" cy="${dy}" rx="30" ry="8" fill="${SAND_D}"/>`;
  return s;
}
function cactus(x, y, sc) {
  const p = 'M-22,0 L-22,-200 Q-22,-232 0,-232 Q22,-232 22,-200 L22,0 Z M22,-110 L54,-110 L54,-160 Q54,-180 70,-180 Q86,-180 86,-160 L86,-96 Q86,-78 66,-78 L22,-78 Z M-22,-90 L-50,-90 L-50,-130 Q-50,-148 -64,-148 Q-78,-148 -78,-130 L-78,-74 Q-78,-58 -60,-58 L-22,-58 Z';
  return `<g transform="translate(${x} ${y}) scale(${sc})"><path d="${p}" fill="#5fae4a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></g>`;
}
function zoomG(cx, cy, k, inner) { return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(k)}) translate(${n(-cx)} ${n(-cy)})">${inner}</g>`; }
function flame(x, y, sc, t, k = 0) {
  const f = 1 + 0.15 * Math.sin(t * 18 + k);
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)} ${n(sc * f)})"><path d="M0,0 C-34,0 -40,-40 -18,-70 C-14,-48 -4,-46 0,-90 C16,-60 40,-40 30,-14 C26,-4 14,0 0,0 Z" fill="#ff8a3d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M0,-6 C-14,-6 -16,-26 -4,-40 C2,-30 14,-24 10,-12 Z" fill="#ffd23f"/></g>`;
}
function waterBottle(x, y, sc) {
  return `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-40" y="-150" width="80" height="150" rx="22" fill="#cfefff" stroke="${INK}" stroke-width="7"/>` +
    `<rect x="-40" y="-90" width="80" height="90" rx="22" fill="${WATER}"/><rect x="-40" y="-150" width="80" height="150" rx="22" fill="none" stroke="${INK}" stroke-width="7"/>` +
    `<rect x="-22" y="-182" width="44" height="34" rx="6" fill="#5fb8ec" stroke="${INK}" stroke-width="6"/></g>`;
}
function bucket(x, y, sc, level, t) {
  const cid = uid('bk');
  const p = 'M-110,-150 L110,-150 L84,0 L-84,0 Z';
  const ly = -150 + 140 * (1 - level);
  return `<g transform="translate(${x} ${y}) scale(${sc})"><defs><clipPath id="${cid}"><path d="${p}"/></clipPath></defs>` +
    `<path d="${p}" fill="#b0b8c4"/><g clip-path="url(#${cid})"><path d="M-130,${n(ly + 6 * Math.sin(t * 7))} Q0,${n(ly - 8)} 130,${n(ly + 6 * Math.cos(t * 7))} L130,10 L-130,10 Z" fill="${WATER}"/></g>` +
    `<path d="${p}" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><ellipse cx="0" cy="-150" rx="110" ry="16" fill="none" stroke="${INK}" stroke-width="7"/></g>`;
}

// ---- banana short pieces
const LEAF = '#7ccf4a', LEAF_D = '#4f9e2c', STEM = '#a9d36a', STEM_D = '#7fae45';
const BAN = '#ffd84a', BAN_D = '#f0b52a', BUD = '#8a3a6e';

// ---------------------------------------------------------------- new drawing pieces
function bananaLeaf(ang, len, flap, t) {
  const w = len * 0.26;
  const a = ang + flap * Math.sin(t * 2.2 + ang);
  return `<g transform="rotate(${n(a)})">
    <path d="M0,0 C${n(len * 0.2)},${n(-w)} ${n(len * 0.8)},${n(-w * 1.1)} ${n(len)},${n(-w * 0.15)} C${n(len * 0.8)},${n(w * 0.8)} ${n(len * 0.2)},${n(w * 0.7)} 0,0 Z" fill="${LEAF}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
    <path d="M0,0 C${n(len * 0.4)},${n(-w * 0.25)} ${n(len * 0.75)},${n(-w * 0.25)} ${n(len)},${n(-w * 0.15)}" fill="none" stroke="${LEAF_D}" stroke-width="7" stroke-linecap="round"/>
    <path d="M${n(len * 0.45)},${n(w * 0.55)} l${n(len * 0.04)},${n(-w * 0.4)} M${n(len * 0.65)},${n(w * 0.45)} l${n(len * 0.04)},${n(-w * 0.35)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>`;
}
function bananaFruit(x, y, sc, ang = 0, o = {}) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  s += `<path d="M-150,-30 C-90,80 90,80 150,-30 C120,-10 90,20 0,22 C-90,20 -120,-10 -150,-30 Z" fill="${BAN}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M-110,6 C-60,50 60,50 110,6" fill="none" stroke="${BAN_D}" stroke-width="9" stroke-linecap="round"/>`;
  s += `<path d="M150,-30 l14,-26 l12,6 l-12,24 Z" fill="#7a9a3a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  s += `<circle cx="-150" cy="-30" r="9" fill="#5a3a22"/>`;
  if (o.face) {
    for (const ex of [-34, 22]) s += `<ellipse cx="${ex}" cy="20" rx="9" ry="12" fill="${INK}"/><circle cx="${ex + 3}" cy="15" r="3" fill="#fff"/>`;
    if (o.face === 'proud') s += `<path d="M-22,42 Q-6,58 12,42" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    else s += `<ellipse cx="-6" cy="48" rx="10" ry="12" fill="${INK}"/>`;
  }
  return s + `</g>`;
}
function bananaBunch(x, y, sc, t) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M0,0 C30,60 40,180 30,300" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="M0,0 C30,60 40,180 30,300" fill="none" stroke="${STEM_D}" stroke-width="12" stroke-linecap="round"/>`;
  for (let r = 0; r < 3; r++) for (let i = -1; i <= 1; i++) s += bananaFruit(30 + i * 34, 80 + r * 70, 0.32, -70 + i * 22);
  s += `<path d="M30,300 C0,320 0,390 30,420 C60,390 60,320 30,300 Z" fill="${BUD}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  return s + `</g>`;
}
// origin = ground centre; o.h stem height, o.cut (y of cut, 0 = none), o.fall deg, o.grow sy
function bananaPlant(x, y, sc, t, o = {}) {
  const h = o.h || 700;
  const top = (o.fall !== undefined || o.cut) ? '' : '';
  const stem = (y0, y1) => {
    const wb = 52 - 16 * (y0 / -h), wt = 52 - 16 * (y1 / -h);
    let p = `<path d="M${n(-wb)},${y0} L${n(-wt)},${y1} L${n(wt)},${y1} L${n(wb)},${y0} Z" fill="${STEM}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
    for (let yy = y0 - 70; yy > y1 + 20; yy -= 90) p += `<path d="M${n(-wb + 8)},${yy + 30} Q0,${yy} ${n(wb - 8)},${yy - 26}" fill="none" stroke="${STEM_D}" stroke-width="6" stroke-linecap="round"/>`;
    return p;
  };
  const crown = () => {
    let c = '';
    const L = [[-160, 420], [-120, 460], [-60, 380], [-20, 460], [30, 420], [-200, 330]];
    for (const [a, len] of L) c += `<g transform="translate(0 ${-h})">${bananaLeaf(a, len, 3, t)}</g>`;
    c += bananaBunch(10, -h + 40, 0.9, t);
    return c;
  };
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)} ${n(sc * (o.grow || 1))})">`;
  if (o.cut) {
    s += stem(0, -o.cut);
    s += `<ellipse cx="0" cy="${-o.cut}" rx="${n(52 - 16 * (o.cut / h))}" ry="14" fill="#dff0b8" stroke="${INK}" stroke-width="6"/>`;
    s += `<g transform="translate(46 ${-o.cut}) rotate(${n(o.fall || 0)}) translate(-46 ${o.cut})">${stem(-o.cut, -h)}${crown()}</g>`;
  } else s += stem(0, -h) + crown();
  if (o.crown) s += popG(0, -h - 120, o.crown, `<path d="M-70,0 L-80,-80 L-35,-40 L0,-100 L35,-40 L80,-80 L70,0 Z" fill="#ffd23f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`);
  return s + `</g>`;
}
function axe(x, y, sc, ang) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">
    <rect x="-14" y="-260" width="28" height="290" rx="12" fill="#b97d45" stroke="${INK}" stroke-width="7"/>
    <path d="M-12,-250 L-12,-200 C-60,-196 -100,-170 -110,-130 C-130,-190 -120,-260 -100,-290 C-80,-260 -40,-252 -12,-250 Z" fill="#c9ced6" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-104,-270 C-118,-230 -118,-180 -108,-150" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>`;
}
function crossSection(cx, cy, r, t, t0) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${STEM}" stroke="${INK}" stroke-width="10"/>`;
  const N = 7;
  for (let i = 0; i < N; i++) {
    const rr = r * (1 - (i + 1) / (N + 1));
    const k = clamp(pop(t, t0 + i * 0.09, 2.6, 7), 0, 1.1);
    if (k < 0.02) continue;
    s += `<circle cx="${cx}" cy="${cy}" r="${n(rr * k)}" fill="${i % 2 ? '#dff0b8' : '#bfe08a'}" stroke="${STEM_D}" stroke-width="6"/>`;
  }
  return s;
}
function herbPot(x, y, sc, kind) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  const lf = kind === 'mint' ? '#5fd38b' : '#4fae3a';
  const P = kind === 'mint' ? [[-30, -150, -30], [30, -160, 30], [0, -200, 0], [-40, -100, -50], [40, -105, 50]] : [[-36, -140, -40], [36, -140, 40], [0, -190, 0], [-20, -100, -70], [24, -96, 70]];
  s += `<path d="M0,-60 L0,-190" stroke="${INK}" stroke-width="14"/><path d="M0,-60 L0,-190" stroke="${LEAF_D}" stroke-width="6"/>`;
  for (const [lx, ly, a] of P) s += `<ellipse cx="${lx}" cy="${ly}" rx="${kind === 'mint' ? 30 : 34}" ry="${kind === 'mint' ? 22 : 24}" transform="rotate(${a} ${lx} ${ly})" fill="${lf}" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="M-80,-70 L80,-70 L60,0 L-60,0 Z" fill="#d9774a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="-90" y="-90" width="180" height="30" rx="8" fill="#e88a5a" stroke="${INK}" stroke-width="7"/>`;
  return s + `</g>`;
}
function blender(x, y, sc, t, spin, fill) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-110,0 L110,0 L95,-130 L-95,-130 Z" fill="#e8413a" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><circle cx="0" cy="-64" r="26" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  const lv = -150 - 300 * fill;
  const c = uid('bl');
  s += `<defs><clipPath id="${c}"><path d="M-90,-130 L-120,-480 L120,-480 L90,-130 Z"/></clipPath></defs>`;
  s += `<g clip-path="url(#${c})"><rect x="-130" y="${n(lv)}" width="260" height="${n(-lv)}" fill="#d6e86a"/>`;
  for (let i = 0; i < 4; i++) {
    const a = t * spin * 7 + i * 1.6;
    s += `<ellipse cx="${n(60 * Math.cos(a))}" cy="${n(lv + 60 + 80 * i * fill)}" rx="34" ry="12" fill="${i % 2 ? '#9fd35a' : '#ffe27a'}" opacity="0.9"/>`;
  }
  s += `</g><path d="M-90,-130 L-120,-480 L120,-480 L90,-130 Z" fill="#cfefff" fill-opacity="0.25" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-80,-180 L-100,-420" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.8"/>`;
  s += `<rect x="-132" y="-510" width="264" height="40" rx="14" fill="#3d3d46" stroke="${INK}" stroke-width="8"/>`;
  return s + `</g>`;
}
function jungleBg() {
  let s = `<rect width="${W}" height="${H}" fill="url(#sky2)"/>`;
  s += `<circle cx="880" cy="300" r="110" fill="#ffe27a"/>`;
  s += `<path d="M0,1180 C200,1080 420,1150 600,1090 C800,1030 950,1120 1080,1080 L1080,1500 L0,1500 Z" fill="#b8e39a"/>`;
  s += `<rect x="0" y="1460" width="${W}" height="460" fill="#8fcf5f"/><line x1="0" y1="1460" x2="${W}" y2="1460" stroke="${INK}" stroke-width="6"/>`;
  return s;
}
const zoom = (cx, cy, z, inner) => `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(z)}) translate(${n(-cx)} ${n(-cy)})">${inner}</g>`;


// ---- lightning short pieces: sunFace, boltShape, stormCloud, degreeCounter, shockRings, nightBg, dayBg, flashAt
const SUN = '#ffcf3a', SUN_D = '#ff9f1c', BOLT = '#fff27a', BOLT_D = '#ffd23f', STORM = '#3a4466', STORM_D = '#2a3150';
function sunFace(x, y, sc, t, o = {}) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  for (let i = 0; i < 12; i++) {
    const a = i * 30 + t * 20, L = 60 + 14 * Math.sin(t * 6 + i);
    s += `<g transform="rotate(${n(a)})"><path d="M-22,-150 L0,${n(-170 - L)} L22,-150 Z" fill="${o.rays || SUN_D}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></g>`;
  }
  s += `<circle r="150" fill="${o.fill || SUN}" stroke="${INK}" stroke-width="9"/><circle cx="-40" cy="-50" r="80" fill="${o.fill ? '#fff' : '#ffe27a'}" opacity="0.6"/>`;
  const m = o.mood || 'happy';
  if (o.shades) {
    s += `<path d="M-110,-40 L110,-40 L100,-10 Q70,30 25,0 L-25,0 Q-70,30 -100,-10 Z" fill="${INK}"/><path d="M-80,-30 L-50,-30" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
  } else {
    for (const ex of [-50, 50]) s += m === 'shock' ? `<circle cx="${ex}" cy="-20" r="22" fill="#fff" stroke="${INK}" stroke-width="6"/><circle cx="${ex}" cy="-20" r="9" fill="${INK}"/>` : `<ellipse cx="${ex}" cy="-20" rx="14" ry="20" fill="${INK}"/><circle cx="${ex + 5}" cy="-27" r="5" fill="#fff"/>`;
  }
  if (m === 'shock') s += `<ellipse cx="0" cy="60" rx="24" ry="30" fill="${INK}"/>`;
  else if (m === 'smug') s += `<path d="M-40,50 Q10,80 50,40" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
  else s += `<path d="M-50,40 Q0,95 50,40 Z" fill="${INK}"/><path d="M-26,62 Q0,80 26,62" fill="${SKIN_PINK}"/>`;
  s += `<circle cx="-95" cy="40" r="20" fill="#ff8a3d" opacity="0.5"/><circle cx="95" cy="40" r="20" fill="#ff8a3d" opacity="0.5"/>`;
  return s + `</g>`;
}
function boltShape(x, y, sc, ang = 0, o = {}) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  if (o.glow) s += `<path d="M30,-220 L-80,20 L-10,20 L-50,220 L90,-40 L15,-40 L60,-220 Z" fill="${BOLT}" opacity="${n(0.35 * o.glow)}" transform="scale(1.35)"/>`;
  s += `<path d="M30,-220 L-80,20 L-10,20 L-50,220 L90,-40 L15,-40 L60,-220 Z" fill="${BOLT}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
  s += `<path d="M38,-190 L-40,0" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
  if (o.face) {
    s += `<ellipse cx="-10" cy="-40" rx="10" ry="14" fill="${INK}"/><ellipse cx="34" cy="-40" rx="10" ry="14" fill="${INK}"/>`;
    s += `<path d="M-30,-70 L0,-58 M54,-70 L24,-58" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    s += o.face === 'grin' ? `<path d="M-14,-10 Q12,14 40,-10 Z" fill="${INK}"/>` : `<path d="M-10,-6 Q12,4 34,-6" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  }
  return s + `</g>`;
}
function stormCloud(x, y, sc, t) {
  let s = `<g transform="translate(${n(x + 6 * Math.sin(t * 1.3))} ${n(y)}) scale(${n(sc)})">`;
  for (const [cx, cy, r] of [[-150, 20, 100], [-50, -40, 130], [80, -20, 120], [170, 30, 90], [0, 40, 120]]) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${STORM}" stroke="${INK}" stroke-width="9"/>`;
  for (const [cx, cy, r] of [[-150, 20, 92], [-50, -40, 122], [80, -20, 112], [170, 30, 82], [0, 40, 112]]) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${STORM}"/>`;
  s += `<path d="M-120,-30 Q-50,-90 20,-60" fill="none" stroke="#56628a" stroke-width="14" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function degreeCounter(x, y, sc, val, col) {
  return popG(x, y, sc, txt(0, 0, Math.round(val).toLocaleString('en-US') + '°F', 120, col, { stroke: INK, sw: 12 }));
}
function shockRings(x, y, t, t0, n0 = 4, maxR = 700) {
  let s = '';
  for (let i = 0; i < n0; i++) {
    const u = prog(t, t0 + i * 0.25, t0 + i * 0.25 + 1.1);
    if (u <= 0 || u >= 1) continue;
    s += `<circle cx="${x}" cy="${y}" r="${n(40 + maxR * eo(u))}" fill="none" stroke="#fff" stroke-width="${n(26 * (1 - u))}" opacity="${n(1 - u)}"/>`;
  }
  return s;
}
const nightBg = (flash = 0) => `<rect width="${W}" height="${H}" fill="${flash > 0.5 ? '#c9d4ff' : '#26304f'}"/><rect x="0" y="1480" width="${W}" height="440" fill="#3c5a3a"/><line x1="0" y1="1480" x2="${W}" y2="1480" stroke="${INK}" stroke-width="6"/>`;
const flashAt = (t, t0) => (t > t0 && t < t0 + 0.12) || (t > t0 + 0.2 && t < t0 + 0.27) ? 1 : 0;
const dayBg = () => `<rect width="${W}" height="${H}" fill="url(#sky2)"/><rect x="0" y="1480" width="${W}" height="440" fill="#8fcf5f"/><line x1="0" y1="1480" x2="${W}" y2="1480" stroke="${INK}" stroke-width="6"/>`;


// ---- space pieces (venus short): planet, orbitRing, calendarPage, cake, arrowCurve
function planet(x, y, r, col, t, o = {}) {
  const c = uid('pl');
  let s = `<g transform="translate(${n(x)} ${n(y)})"><defs><clipPath id="${c}"><circle r="${r}"/></clipPath></defs>`;
  s += `<circle r="${r}" fill="${col}" stroke="${INK}" stroke-width="${n(Math.max(6, r * 0.05))}"/>`;
  s += `<g clip-path="url(#${c})">`;
  const spin = (o.spin || 0) * t;
  for (let i = -3; i <= 3; i++) {
    const yy = i * r * 0.28, off = ((spin * r + i * 37) % (2 * r)) - r;
    s += `<path d="M${n(-r * 1.2 + off)},${n(yy)} q${n(r * 0.4)},${n(-r * 0.08)} ${n(r * 0.8)},0 t${n(r * 0.8)},0 t${n(r * 0.8)},0" fill="none" stroke="${o.band || '#000'}" stroke-opacity="0.13" stroke-width="${n(r * 0.1)}"/>`;
  }
  s += `<circle cx="${n(r * 0.35)}" cy="${n(r * 0.25)}" r="${n(r)}" fill="#000" opacity="0.12"/></g>`;
  s += `<circle cx="${n(-r * 0.4)}" cy="${n(-r * 0.4)}" r="${n(r * 0.18)}" fill="#fff" opacity="0.5"/>`;
  if (o.face) {
    const e = r * 0.09;
    s += `<ellipse cx="${n(-r * 0.25)}" cy="${n(-r * 0.05)}" rx="${n(e)}" ry="${n(e * 1.4)}" fill="${INK}"/><ellipse cx="${n(r * 0.25)}" cy="${n(-r * 0.05)}" rx="${n(e)}" ry="${n(e * 1.4)}" fill="${INK}"/>`;
    if (o.face === 'sleepy') s = s.replace(/<ellipse cx="[^"]*" cy="[^"]*" rx="[^"]*" ry="[^"]*" fill="#1c1c1e"\/>/g, '') + `<path d="M${n(-r * 0.35)},${n(-r * 0.05)} q${n(r * 0.1)},${n(r * 0.08)} ${n(r * 0.2)},0 M${n(r * 0.15)},${n(-r * 0.05)} q${n(r * 0.1)},${n(r * 0.08)} ${n(r * 0.2)},0" fill="none" stroke="${INK}" stroke-width="${n(r * 0.04)}" stroke-linecap="round"/>`;
    s += o.face === 'happy' || o.face === 'sleepy' ? `<path d="M${n(-r * 0.2)},${n(r * 0.2)} Q0,${n(r * 0.38)} ${n(r * 0.2)},${n(r * 0.2)}" fill="none" stroke="${INK}" stroke-width="${n(r * 0.05)}" stroke-linecap="round"/>` : `<ellipse cx="0" cy="${n(r * 0.28)}" rx="${n(r * 0.08)}" ry="${n(r * 0.11)}" fill="${INK}"/>`;
  }
  return s + `</g>`;
}
function orbitRing(cx, cy, rx, ry, u = 1) {
  const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="6" stroke-dasharray="18 16" stroke-dashoffset="0" pathLength="${n(len)}" style="stroke-dasharray:${n(len * u)} ${n(len)}"/>`;
}
function calendarPage(x, y, sc, big, small, col = '#e8413a', ang = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  s += `<rect x="-130" y="-150" width="260" height="290" rx="22" fill="#fff" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-130,-128 Q-130,-150 -108,-150 L108,-150 Q130,-150 130,-128 L130,-70 L-130,-70 Z" fill="${col}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<circle cx="-70" cy="-150" r="12" fill="${INK}"/><circle cx="70" cy="-150" r="12" fill="${INK}"/>`;
  s += txt(0, -94, small, 40, '#fff') + txt(0, 60, big, Math.min(120, 360 / big.length), INK);
  return s + `</g>`;
}
function cake(x, y, sc, t, lit = 1) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<ellipse cx="0" cy="10" rx="170" ry="30" fill="#fff" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-130,0 L-130,-130 L130,-130 L130,0 Z" fill="#f7b2c8" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-130,-130 Q-110,-90 -90,-130 Q-70,-90 -50,-130 Q-30,-90 -10,-130 Q10,-90 30,-130 Q50,-90 70,-130 Q90,-90 110,-130 Q120,-100 130,-130" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  for (const cx of [-60, 0, 60]) {
    s += `<rect x="${cx - 9}" y="-200" width="18" height="70" fill="#8fd3ff" stroke="${INK}" stroke-width="6"/>`;
    if (lit > 0.05) s += `<path d="M${cx},${n(-246 - 6 * Math.sin(t * 14 + cx))} Q${cx + 16},-218 ${cx},-206 Q${cx - 16},-218 ${cx},${n(-246 - 6 * Math.sin(t * 14 + cx))} Z" fill="#ffb347" stroke="${INK}" stroke-width="5" transform="scale(1 ${n(lit)})" transform-origin="${cx} -206"/>`;
  }
  return s + `</g>`;
}
function arrowCurve(cx, cy, r, a0, a1, col = '#ffd23f') {
  const p = (a) => [cx + r * Math.cos(a * D2R), cy + r * Math.sin(a * D2R)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const big = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
  const tang = (a1 + (sw ? 90 : -90));
  const h = (d) => [x1 + 34 * Math.cos((tang + d) * D2R), y1 + 34 * Math.sin((tang + d) * D2R)];
  const [ha, hb] = [h(150), h(-150)];
  return `<path d="M${n(x0)},${n(y0)} A${r},${r} 0 ${big} ${sw} ${n(x1)},${n(y1)}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M${n(x0)},${n(y0)} A${r},${r} 0 ${big} ${sw} ${n(x1)},${n(y1)}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"/><path d="M${n(ha[0])},${n(ha[1])} L${n(x1)},${n(y1)} L${n(hb[0])},${n(hb[1])}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
}


// ---- batch 2026-11-16: snowman, mountain, greatWall, skyscraper, coin, radioWaves, molecules, tvSet, shadeHalf, tiltAxis
function snowman(x, y, sc, t) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<circle cy="-90" r="110" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cy="-260" r="80" fill="#fff" stroke="${INK}" stroke-width="8"/><circle cy="-390" r="60" fill="#fff" stroke="${INK}" stroke-width="8"/>`;
  s += `<circle cx="-20" cy="-400" r="8" fill="${INK}"/><circle cx="20" cy="-400" r="8" fill="${INK}"/><path d="M0,-385 L50,-375 L0,-370 Z" fill="#ff8a3d" stroke="${INK}" stroke-width="4"/>`;
  s += `<path d="M-50,-445 L50,-445 L40,-520 L-40,-520 Z" fill="${INK}"/><rect x="-62" y="-452" width="124" height="14" rx="6" fill="${INK}"/>`;
  s += `<path d="M-78,-250 L-170,${n(-310 - 15 * Math.sin(t * 5))}" stroke="#7a4a2a" stroke-width="10" stroke-linecap="round"/><path d="M78,-250 L170,-300" stroke="#7a4a2a" stroke-width="10" stroke-linecap="round"/>`;
  s += `<path d="M-58,-330 Q0,-300 58,-330" fill="none" stroke="#e8413a" stroke-width="22" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function mountain(x, baseY, w, h, col = '#8a7f74', snow = true, o = {}) {
  const top = baseY - h, hw = w / 2;
  let s = `<path d="M${n(x - hw)},${n(baseY)} L${n(x - hw * 0.35)},${n(baseY - h * 0.55)} L${n(x - hw * 0.15)},${n(baseY - h * 0.5)} L${n(x)},${n(top)} L${n(x + hw * 0.3)},${n(baseY - h * 0.6)} L${n(x + hw * 0.45)},${n(baseY - h * 0.52)} L${n(x + hw)},${n(baseY)} Z" fill="${col}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
  if (snow) s += `<path d="M${n(x - hw * 0.22)},${n(top + h * 0.25)} L${n(x)},${n(top)} L${n(x + hw * 0.2)},${n(top + h * 0.22)} L${n(x + hw * 0.08)},${n(top + h * 0.28)} L${n(x - hw * 0.04)},${n(top + h * 0.2)} L${n(x - hw * 0.12)},${n(top + h * 0.3)} Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  if (o.flag) s += `<line x1="${n(x)}" y1="${n(top)}" x2="${n(x)}" y2="${n(top - 90)}" stroke="${INK}" stroke-width="7"/><path d="M${n(x)},${n(top - 90)} L${n(x + 60)},${n(top - 72)} L${n(x)},${n(top - 54)} Z" fill="${o.flag}" stroke="${INK}" stroke-width="5"/>`;
  return s;
}
function greatWall(y, t, col = '#c9a46a', amp = 60) {
  let p = '', q = '';
  for (let i = 0; i <= 24; i++) { const xx = -40 + i * 48, yy = y + amp * Math.sin(i * 0.6); p += `${i ? 'L' : 'M'}${n(xx)},${n(yy)} `; q = `L${n(xx)},${n(yy + 40)} ` + q; }
  let s = `<path d="${p}${q}Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  for (let i = 0; i <= 24; i += 2) { const xx = -40 + i * 48, yy = y + amp * Math.sin(i * 0.6); s += `<rect x="${n(xx - 12)}" y="${n(yy - 22)}" width="24" height="24" fill="${col}" stroke="${INK}" stroke-width="5"/>`; }
  for (const i of [4, 12, 20]) { const xx = -40 + i * 48, yy = y + amp * Math.sin(i * 0.6); s += `<rect x="${n(xx - 34)}" y="${n(yy - 70)}" width="68" height="100" fill="${col}" stroke="${INK}" stroke-width="7"/><rect x="${n(xx - 10)}" y="${n(yy - 45)}" width="20" height="30" fill="${INK}"/>`; }
  return s;
}
function skyscraper(x, baseY, sc) {
  let s = `<g transform="translate(${n(x)} ${n(baseY)}) scale(${n(sc)})">`;
  s += `<rect x="-130" y="-700" width="260" height="700" fill="#b8c2d6" stroke="${INK}" stroke-width="9"/><rect x="-90" y="-900" width="180" height="200" fill="#c9d1e2" stroke="${INK}" stroke-width="9"/>`;
  s += `<rect x="-55" y="-1040" width="110" height="140" fill="#d6dcea" stroke="${INK}" stroke-width="9"/><path d="M-30,-1040 L0,-1130 L30,-1040 Z" fill="#d6dcea" stroke="${INK}" stroke-width="8"/><line x1="0" y1="-1130" x2="0" y2="-1250" stroke="${INK}" stroke-width="10"/>`;
  for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) s += `<rect x="${-105 + c * 58}" y="${-670 + r * 55}" width="34" height="30" fill="${(r * 3 + c) % 5 ? '#ffe27a' : '#6b7896'}" stroke="${INK}" stroke-width="3"/>`;
  return s + `</g>`;
}
function coin(x, y, r, flip = 0) {
  const sy = Math.abs(Math.cos(flip)) * 0.85 + 0.15;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(1 ${n(sy)})"><circle r="${n(r)}" fill="#c8743a" stroke="${INK}" stroke-width="${n(Math.max(5, r * 0.08))}"/><circle r="${n(r * 0.75)}" fill="none" stroke="#8f4f22" stroke-width="${n(r * 0.06)}"/><text x="0" y="${n(r * 0.28)}" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="${n(r * 0.8)}" fill="#8f4f22">1¢</text></g>`;
}
function radioWaves(x, y, t, dir = 1, col = '#ffd23f') {
  let s = '';
  for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1, r = 30 + 90 * u; s += `<path d="M${n(x + dir * r * 0.5)},${n(y - r)} Q${n(x + dir * r * 1.1)},${n(y)} ${n(x + dir * r * 0.5)},${n(y + r)}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" opacity="${n(1 - u)}"/>`; }
  return s;
}
function molecules(x, y, nn, gap, t, amp = 22, col = '#8fd3ff') {
  let s = '';
  for (let i = 0; i < nn; i++) { const ph = t * 6 - i * 0.9, dx = amp * Math.max(0, Math.sin(ph)); s += `<circle cx="${n(x + i * gap + dx)}" cy="${n(y)}" r="38" fill="${col}" stroke="${INK}" stroke-width="7"/><circle cx="${n(x + i * gap + dx - 12)}" cy="${n(y - 12)}" r="9" fill="#fff" opacity="0.7"/>`; }
  return s;
}
function tvSet(x, y, w, h, inner = '') {
  return `<g transform="translate(${n(x)} ${n(y)})"><rect x="${n(-w / 2 - 30)}" y="${n(-h / 2 - 30)}" width="${n(w + 60)}" height="${n(h + 60)}" rx="30" fill="#5a4636" stroke="${INK}" stroke-width="9"/><rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="16" fill="#101624" stroke="${INK}" stroke-width="7"/>${inner}<path d="M-60,${n(h / 2 + 30)} L-100,${n(h / 2 + 100)} M60,${n(h / 2 + 30)} L100,${n(h / 2 + 100)}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>`;
}
function shadeHalf(x, y, r, ang = 0, op = 0.7) {
  const c = uid('sh');
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><defs><clipPath id="${c}"><circle r="${n(r)}"/></clipPath></defs><rect x="0" y="${n(-r)}" width="${n(r)}" height="${n(2 * r)}" fill="#0b1030" opacity="${n(op)}" clip-path="url(#${c})"/></g>`;
}
function tiltAxis(x, y, r, ang = 23.4) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><line x1="0" y1="${n(-r * 1.35)}" x2="0" y2="${n(r * 1.35)}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><line x1="0" y1="${n(-r * 1.35)}" x2="0" y2="${n(r * 1.35)}" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round" stroke-dasharray="20 14"/></g>`;
}

// ====================================================== HELPERS from the safety-coffin short (2026-11-16)
// graveBg(t, night) cut-away ground, tombstone(x,y,sc,text), coffin(x,y,sc,t,{awake}), bell(x,y,sc,swing),
// pullString(x0,y0,x1,y1,tug), airTube(x,yTop,yBot), flag(x,y,sc,up,t), boxingGlove(x,y,sc,ang,col), boxRing(t)
function graveBg(t, night = 0, gy = 900) {
  const sky = night ? '#2a2f55' : '#bfe3ff';
  let s = `<rect width="${W}" height="${H}" fill="${sky}"/>`;
  if (night) for (let i = 0; i < 30; i++) { const r = rng(i * 7 + 3); s += `<circle cx="${n(r() * W)}" cy="${n(r() * gy * 0.8)}" r="${n(2 + r() * 3)}" fill="#fff" opacity="${n(0.4 + 0.5 * Math.abs(Math.sin(t * 1.3 + i)))}"/>`; }
  s += `<rect x="0" y="${gy}" width="${W}" height="${H - gy}" fill="#7a5233"/>`;
  for (let i = 0; i < 26; i++) { const r = rng(i * 11 + 1); s += `<ellipse cx="${n(r() * W)}" cy="${n(gy + 60 + r() * (H - gy - 80))}" rx="${n(10 + r() * 22)}" ry="${n(7 + r() * 12)}" fill="#5e3d24" opacity="0.8"/>`; }
  s += `<rect x="0" y="${gy - 30}" width="${W}" height="44" fill="#4caf50" stroke="${INK}" stroke-width="7"/>`;
  return s;
}
function tombstone(x, y, sc, text = 'RIP', ang = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  s += `<path d="M-110,0 L-110,-200 Q-110,-300 0,-300 Q110,-300 110,-200 L110,0 Z" fill="#b8bec9" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M70,-40 L70,-190 Q70,-250 10,-262" fill="none" stroke="#9aa1ad" stroke-width="10" stroke-linecap="round"/>`;
  s += txt(0, -150, text, 70, '#5b6270');
  return s + `</g>`;
}
function coffin(x, y, sc, t, o = {}) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<path d="M-300,-20 L-250,-90 L260,-90 L300,0 L260,90 L-250,90 Z" fill="#a0612e" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
  s += `<path d="M-255,-50 L-220,-60 L235,-60 L262,0 L235,60 L-220,60 L-255,40 Z" fill="#3a2414"/>`;
  // occupant head (cut-away)
  const hx = -170;
  s += `<circle cx="${hx}" cy="0" r="52" fill="#fff" stroke="${INK}" stroke-width="7"/>`;
  if (o.awake) {
    const by = (t % 2.6) > 2.45;
    for (const ex of [-18, 18]) s += by ? `<path d="M${hx + ex - 9},-8 L${hx + ex + 9},-8" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` : `<ellipse cx="${hx + ex}" cy="-8" rx="8" ry="12" fill="${INK}"/><circle cx="${hx + ex + 2}" cy="-12" r="3" fill="#fff"/>`;
    s += `<ellipse cx="${hx}" cy="24" rx="9" ry="11" fill="${INK}"/>`;
  } else {
    for (const ex of [-18, 18]) s += `<path d="M${hx + ex - 10},-8 L${hx + ex + 10},-8" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  }
  s += `<path d="M-115,-40 Q60,-55 200,-30 L200,40 Q60,55 -115,40 Z" fill="#e6e9ef" stroke="${INK}" stroke-width="6"/>`;
  return s + `</g>`;
}
function bell(x, y, sc, swing = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<rect x="-6" y="-150" width="12" height="160" fill="#6b4a2b" stroke="${INK}" stroke-width="5"/>`;
  s += `<path d="M-90,-150 L90,-150" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`;
  s += `<g transform="translate(60 -150) rotate(${n(swing)})">`;
  s += `<path d="M0,0 L0,14" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-42,80 Q-40,14 0,12 Q40,14 42,80 L54,92 L-54,92 Z" fill="#f5c542" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M-22,70 Q-20,32 -4,26" fill="none" stroke="#fff3b0" stroke-width="7" stroke-linecap="round"/>`;
  s += `<circle cx="${n(-swing * 0.3)}" cy="100" r="11" fill="${INK}"/></g>`;
  return s + `</g>`;
}
function pullString(x0, y0, x1, y1, tug = 0) {
  const mx = (x0 + x1) / 2 + 40 * (1 - tug), my = (y0 + y1) / 2;
  return `<path d="M${n(x0)},${n(y0)} Q${n(mx)},${n(my)} ${n(x1)},${n(y1)}" fill="none" stroke="#f3e6c8" stroke-width="8" stroke-linecap="round"/><path d="M${n(x0)},${n(y0)} Q${n(mx)},${n(my)} ${n(x1)},${n(y1)}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 10"/>`;
}
function airTube(x, yTop, yBot) {
  return `<rect x="${n(x - 18)}" y="${n(yTop)}" width="36" height="${n(yBot - yTop)}" fill="#9aa1ad" stroke="${INK}" stroke-width="7"/><path d="M${n(x - 18)},${n(yTop)} L${n(x - 18)},${n(yTop - 40)} Q${n(x - 18)},${n(yTop - 70)} ${n(x + 30)},${n(yTop - 70)}" fill="none" stroke="${INK}" stroke-width="7"/><path d="M${n(x + 18)},${n(yTop)} L${n(x + 18)},${n(yTop - 34)} L${n(x + 30)},${n(yTop - 34)}" fill="none" stroke="${INK}" stroke-width="7"/><rect x="${n(x - 18)}" y="${n(yTop - 70)}" width="50" height="36" fill="#9aa1ad"/><path d="M${n(x - 18)},${n(yTop - 70)} L${n(x + 32)},${n(yTop - 70)} M${n(x - 18)},${n(yTop - 34)} L${n(x + 32)},${n(yTop - 34)} M${n(x - 18)},${n(yTop - 70)} L${n(x - 18)},${n(yTop)} M${n(x + 18)},${n(yTop - 34)} L${n(x + 18)},${n(yTop)}" stroke="${INK}" stroke-width="7" fill="none"/>`;
}
function flag(x, y, sc, up, t, col = '#e8413a') {
  const h = 260 * sc, fy = y - lerp(40, h - 10, clamp(up));
  const w = Math.sin(t * 8) * 10;
  return `<line x1="${n(x)}" y1="${n(y)}" x2="${n(x)}" y2="${n(y - h)}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${n(x)},${n(fy)} Q${n(x + 60 * sc)},${n(fy - 14 + w)} ${n(x + 120 * sc)},${n(fy + 6)} L${n(x + 120 * sc)},${n(fy + 76 * sc)} Q${n(x + 60 * sc)},${n(fy + 60 * sc + w)} ${n(x)},${n(fy + 70 * sc)} Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
}
function boxingGlove(x, y, sc, ang = 0, col = '#e8413a') {
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  s += `<rect x="-70" y="60" width="140" height="90" rx="20" fill="#fff" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-90,70 Q-120,-40 -60,-110 Q0,-150 70,-110 Q120,-70 100,0 Q90,60 60,70 Z" fill="${col}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-100,20 Q-150,0 -130,-50 Q-110,-80 -70,-50" fill="${col}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M-40,-90 Q10,-115 50,-85" fill="none" stroke="#ff9a90" stroke-width="12" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function boxRing(t) {
  let s = `<rect width="${W}" height="${H}" fill="#2b2140"/>`;
  s += `<path d="M0,0 L540,0 L380,1300 Z" fill="#fff" opacity="0.06"/><path d="M1080,0 L540,0 L700,1300 Z" fill="#fff" opacity="0.06"/>`;
  s += `<rect x="0" y="1300" width="${W}" height="620" fill="#3d7bd9"/>`;
  for (const [yy, c] of [[1000, '#e8413a'], [1110, '#fff'], [1220, '#e8413a']]) s += `<rect x="-10" y="${yy}" width="${W + 20}" height="22" fill="${c}" stroke="${INK}" stroke-width="6"/>`;
  s += `<rect x="60" y="900" width="40" height="420" fill="#ccc" stroke="${INK}" stroke-width="7"/><rect x="980" y="900" width="40" height="420" fill="#ccc" stroke="${INK}" stroke-width="7"/>`;
  return s;
}

// ====================================================== HELPERS from the old-times batch (2026-11-16)
// brickRow(t, night, gy) street of houses, window(x,y,sc,lit), longPole(x0,y0,len,ang), lobster(x,y,sc,t,ang,col),
// prisonBars(x,y,w,h), plate(x,y,sc), bicorne(x,y,sc,ang), heightChart(x,y,sc), penny(x,y,r), peaShot(x0,y0,x1,y1,u)
function brickRow(t, night = 1, gy = 1300) {
  let s = `<rect width="${W}" height="${H}" fill="${night ? '#24294d' : '#bfe3ff'}"/>`;
  if (night) for (let i = 0; i < 25; i++) { const r = rng(i * 5 + 9); s += `<circle cx="${n(r() * W)}" cy="${n(r() * 300)}" r="${n(2 + r() * 3)}" fill="#fff" opacity="${n(0.4 + 0.5 * Math.abs(Math.sin(t * 1.4 + i)))}"/>`; }
  s += `<rect x="0" y="340" width="${W}" height="${gy - 340}" fill="#a5523a" stroke="${INK}" stroke-width="8"/>`;
  for (let y = 380; y < gy; y += 60) for (let x = (y / 60) % 2 ? 0 : 60; x < W; x += 120) s += `<rect x="${x}" y="${y}" width="110" height="50" fill="none" stroke="#8a4230" stroke-width="5"/>`;
  s += `<path d="M-20,340 L540,170 L1100,340 Z" fill="#4a3b52" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<rect x="0" y="${gy}" width="${W}" height="${H - gy}" fill="#6b6f7a"/><line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${INK}" stroke-width="8"/>`;
  return s;
}
function window_(x, y, sc, lit = 0) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">`;
  s += `<rect x="-90" y="-120" width="180" height="240" fill="${lit ? '#ffe28a' : '#2b3a5c'}" stroke="${INK}" stroke-width="9"/>`;
  s += `<path d="M0,-120 L0,120 M-90,0 L90,0" stroke="${INK}" stroke-width="8"/><rect x="-104" y="118" width="208" height="20" fill="#ddd" stroke="${INK}" stroke-width="6"/>`;
  return s + `</g>`;
}
function longPole(x0, y0, len, ang) {
  const x1 = x0 + len * Math.cos(ang * D2R), y1 = y0 + len * Math.sin(ang * D2R);
  return `<line x1="${n(x0)}" y1="${n(y0)}" x2="${n(x1)}" y2="${n(y1)}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><line x1="${n(x0)}" y1="${n(y0)}" x2="${n(x1)}" y2="${n(y1)}" stroke="#d9b36b" stroke-width="10" stroke-linecap="round"/><circle cx="${n(x1)}" cy="${n(y1)}" r="16" fill="#8a5a2b" stroke="${INK}" stroke-width="6"/>`;
}
function peaShot(x0, y0, x1, y1, u) {
  if (u <= 0 || u >= 1) return '';
  const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - 80 * Math.sin(Math.PI * u);
  return `<circle cx="${n(x)}" cy="${n(y)}" r="14" fill="#7bc043" stroke="${INK}" stroke-width="5"/>`;
}
function lobster(x, y, sc, t, ang = 0, col = '#e8413a') {
  const w = Math.sin(t * 6) * 8;
  let s = `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})">`;
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 3; i++) s += `<path d="M${sd * 30},${-10 + i * 30} L${sd * 90},${10 + i * 34}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    s += `<path d="M${sd * 30},-60 Q${sd * 90},-110 ${sd * 80},-170" fill="none" stroke="${col}" stroke-width="22" stroke-linecap="round"/><path d="M${sd * 30},-60 Q${sd * 90},-110 ${sd * 80},-170" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round" opacity="0" />`;
    s += `<g transform="translate(${sd * 80} -190) rotate(${n(sd * (10 + w))})"><path d="M0,30 Q${sd * -50},-10 ${sd * -20},-70 L0,-20 L${sd * 10},-75 Q${sd * 50},-20 0,30 Z" fill="${col}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/></g>`;
    s += `<path d="M${sd * 14},-110 Q${sd * 60},-260 ${sd * 140},-300" fill="none" stroke="${INK}" stroke-width="5"/>`;
  }
  s += `<path d="M-40,-80 Q-48,30 -30,90 L30,90 Q48,30 40,-80 Q0,-120 -40,-80 Z" fill="${col}" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="M-30,90 L-26,130 L26,130 L30,90 M-26,130 L-22,165 L22,165 L26,130 M-22,165 L-40,210 L40,210 L22,165" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<circle cx="-16" cy="-70" r="9" fill="${INK}"/><circle cx="16" cy="-70" r="9" fill="${INK}"/><circle cx="-13" cy="-73" r="3" fill="#fff"/><circle cx="19" cy="-73" r="3" fill="#fff"/>`;
  return s + `</g>`;
}
function prisonBars(x, y, w, h) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="10"/>`;
  for (let bx = x + 60; bx < x + w; bx += 90) s += `<rect x="${bx - 9}" y="${y}" width="18" height="${h}" fill="#7d8592" stroke="${INK}" stroke-width="5"/>`;
  s += `<rect x="${x}" y="${y + h * 0.3}" width="${w}" height="20" fill="#7d8592" stroke="${INK}" stroke-width="5"/>`;
  return s;
}
function plate(x, y, sc) {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})"><ellipse cx="0" cy="0" rx="230" ry="70" fill="#fff" stroke="${INK}" stroke-width="8"/><ellipse cx="0" cy="-4" rx="160" ry="44" fill="none" stroke="#d5dbe4" stroke-width="6"/></g>`;
}
function bicorne(x, y, sc, ang = 0) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})"><path d="M-170,20 Q-120,-30 -60,-80 Q0,-120 60,-80 Q120,-30 170,20 Q0,-10 -170,20 Z" fill="#1f2433" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><circle cx="40" cy="-40" r="22" fill="#3d7bd9" stroke="#fff" stroke-width="6"/><circle cx="40" cy="-40" r="8" fill="#e8413a"/></g>`;
}
function heightChart(x, y, sc) {
  let s = `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})"><rect x="-60" y="-1000" width="120" height="1000" fill="#fff8e6" stroke="${INK}" stroke-width="7"/>`;
  for (let i = 0; i <= 20; i++) { const yy = -i * 50; s += `<line x1="-60" y1="${yy}" x2="${i % 2 ? -25 : 0}" y2="${yy}" stroke="${INK}" stroke-width="5"/>`; }
  return s + `</g>`;
}
function penny(x, y, r) { return coin(x, y, r, 0); }

// ====================================================== HELPERS: vikings + pirates (2026-11-16)
// Head-wear sits on guy(x, y, sc): pass (x, y, sc) of the guy.
// hornHelmet(x,y,sc,horns=1), ironHelmet(x,y,sc), eyePatch(x,y,sc,side) side 1 = right eye, -1 = left eye,
// bandana(x,y,sc,col), operaStage(t, open), shipDeck(t, dark), lantern(x,y,sc,t)
function hornHelmet(gx, gy, sc, horns = 1) {
  let s = `<g transform="translate(${n(gx)} ${n(gy)}) scale(${n(sc)}) translate(0 -24)">`;
  if (horns) for (const sd of [-1, 1]) s += `<path d="M${sd * 60},-340 Q${sd * 120},-350 ${sd * 125},-430 Q${sd * 128},-470 ${sd * 110},-490 Q${sd * 100},-420 ${sd * 50},-372 Z" fill="#f3ead2" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M-78,-318 Q-80,-392 0,-396 Q80,-392 78,-318 Z" fill="#9aa1ad" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<rect x="-84" y="-330" width="168" height="22" rx="8" fill="#7d8592" stroke="${INK}" stroke-width="7"/>`;
  s += `<path d="M-40,-385 Q-20,-394 0,-394" fill="none" stroke="#d5dbe4" stroke-width="8" stroke-linecap="round"/>`;
  return s + `</g>`;
}
function ironHelmet(gx, gy, sc) {
  let s = hornHelmet(gx, gy, sc, 0);
  s += `<g transform="translate(${n(gx)} ${n(gy)}) scale(${n(sc)}) translate(0 -24)"><rect x="-26" y="-316" width="16" height="44" rx="6" fill="#7d8592" stroke="${INK}" stroke-width="6"/><path d="M0,-394 L0,-332" stroke="${INK}" stroke-width="6"/></g>`;
  return s;
}
function eyePatch(gx, gy, sc, side = 1) {
  const ex = side > 0 ? 0 : -34;
  return `<g transform="translate(${n(gx)} ${n(gy)}) scale(${n(sc)})"><path d="M-72,-338 L${ex},-306 L72,-280" fill="none" stroke="${INK}" stroke-width="7"/><ellipse cx="${ex}" cy="-304" rx="22" ry="20" fill="${INK}"/></g>`;
}
function bandana(gx, gy, sc, col = '#e8413a') {
  return `<g transform="translate(${n(gx)} ${n(gy)}) scale(${n(sc)})"><path d="M-74,-320 Q-76,-382 0,-384 Q76,-382 74,-320 Q0,-344 -74,-320 Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M70,-330 L110,-300 L96,-350 Z" fill="${col}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="-30" cy="-362" r="7" fill="#fff"/><circle cx="20" cy="-366" r="7" fill="#fff"/></g>`;
}
function operaStage(t, open = 1) {
  let s = `<rect width="${W}" height="${H}" fill="#2b1a2e"/>`;
  s += `<ellipse cx="540" cy="1500" rx="420" ry="90" fill="#fff6c9" opacity="0.25"/>`;
  s += `<rect x="0" y="1480" width="${W}" height="440" fill="#7a4a2a" stroke="${INK}" stroke-width="8"/>`;
  const cw = lerp(540, 200, clamp(open));
  for (const sd of [0, 1]) {
    const x0 = sd ? W - cw : 0;
    s += `<rect x="${n(x0)}" y="0" width="${n(cw)}" height="1500" fill="#c0283a" stroke="${INK}" stroke-width="8"/>`;
    for (let i = 1; i < 5; i++) s += `<line x1="${n(x0 + cw * i / 5)}" y1="0" x2="${n(x0 + cw * i / 5)}" y2="1500" stroke="#8e1b2a" stroke-width="10"/>`;
  }
  s += `<path d="M0,0 L${W},0 L${W},150 Q810,220 540,150 Q270,220 0,150 Z" fill="#a51f30" stroke="${INK}" stroke-width="8"/>`;
  return s;
}
function shipDeck(t, dark = 0) {
  if (dark) {
    let s = `<rect width="${W}" height="${H}" fill="#1a1410"/>`;
    for (let y = 300; y < H; y += 110) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#2c2018" stroke-width="10"/>`;
    return s;
  }
  let s = `<rect width="${W}" height="${H}" fill="#9fd6ff"/><circle cx="880" cy="440" r="90" fill="#ffe14d" stroke="${INK}" stroke-width="7"/>`;
  s += `<path d="M0,900 Q135,${n(870 + 10 * Math.sin(t * 2))} 270,900 T540,900 T810,900 T1080,900 L1080,1000 L0,1000 Z" fill="#3d7bd9"/>`;
  s += `<rect x="0" y="1000" width="${W}" height="920" fill="#a0612e" stroke="${INK}" stroke-width="8"/>`;
  for (let y = 1080; y < H; y += 90) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#7a4a22" stroke-width="7"/>`;
  s += `<rect x="0" y="960" width="${W}" height="50" fill="#7a4a22" stroke="${INK}" stroke-width="8"/>`;
  return s;
}
function lantern(x, y, sc, t) {
  const g = 0.5 + 0.15 * Math.sin(t * 9);
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})"><circle cx="0" cy="40" r="140" fill="#ffd27a" opacity="${n(g * 0.35)}"/><path d="M-40,-20 L40,-20 L30,100 L-30,100 Z" fill="#ffe28a" stroke="${INK}" stroke-width="7"/><rect x="-48" y="-40" width="96" height="24" fill="#555" stroke="${INK}" stroke-width="6"/><path d="M-20,-40 Q0,-80 20,-40" fill="none" stroke="${INK}" stroke-width="6"/></g>`;
}

// ---- ostrich short (2026-11-18) ----
const OST_SK = '#f4a6a0', OST_BK = '#2b2b30', OST_WH = '#fbf7ef';
function ostrich(x, y, sc, o = {}) {
  // feet at (x,y), faces right. o: t, dip 0..1 (head down into a hole at +300,0), run 0..1, kick 0..1, mood calm|smug|scared|gasp, flip
  const t = o.t || 0, dip = clamp(o.dip || 0), run = o.run || 0, kick = clamp(o.kick || 0), mood = o.mood || 'calm';
  const ph = t * 7 * 2 * Math.PI;
  const bob = run * 12 * Math.abs(Math.sin(ph)) + 4 * Math.sin(t * 2.2) * (1 - run);
  const leg = (hx, k, front) => {
    let sw = run * 70 * Math.sin(ph + k), fy = -run * 30 * Math.max(0, Math.sin(ph + k + 1.5));
    let kx = hx + 26 + sw * 0.4, ky = -150 - bob * 0.5, fx = hx + sw, fyy = fy;
    if (front && kick > 0) { kx = lerp(kx, hx + 120, kick); ky = lerp(ky, -230, kick); fx = lerp(fx, hx + 250, kick); fyy = lerp(fyy, -170, kick); }
    let s = `<path d="M${hx},${n(-270 - bob)} L${n(kx)},${n(ky)}" stroke="${INK}" stroke-width="58" stroke-linecap="round"/><path d="M${hx},${n(-270 - bob)} L${n(kx)},${n(ky)}" stroke="${OST_SK}" stroke-width="44" stroke-linecap="round"/>`;
    s += `<path d="M${n(kx)},${n(ky)} L${n(fx)},${n(fyy - 10)}" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M${n(kx)},${n(ky)} L${n(fx)},${n(fyy - 10)}" stroke="${OST_SK}" stroke-width="17" stroke-linecap="round"/>`;
    const fa = front ? -60 * kick : 0;
    s += `<g transform="translate(${n(fx)} ${n(fyy - 6)}) rotate(${n(fa)})"><path d="M-14,0 Q10,-18 52,-4 Q60,8 44,10 L-14,10 Z" fill="${OST_SK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M50,-2 L64,4 L50,10" fill="#fff" stroke="${INK}" stroke-width="4"/></g>`;
    return s;
  };
  let s = leg(-40, Math.PI, false);
  // body
  let b = '';
  const fl = [];
  for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; fl.push(`${n(150 * Math.cos(a))},${n(-330 + 100 * Math.sin(a) * (i % 2 ? 1.12 : 1))}`); }
  b += `<path d="M-150,-330 C-150,-430 140,-450 165,-340 C175,-280 120,-240 40,-238 L-20,-240 Q-60,-215 -90,-245 Q-120,-225 -140,-262 Q-175,-262 -160,-300 Z" fill="${OST_BK}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  // tail plume + wing
  const tw = 6 * Math.sin(t * 4);
  b += `<path d="M-140,-380 Q-230,${n(-430 + tw)} -235,${n(-360 + tw)} Q-215,-350 -232,-320 Q-200,-300 -150,-312 Z" fill="${OST_WH}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  const wf = run ? 14 * Math.sin(ph * 0.5) : 0;
  b += `<path d="M-60,-370 Q30,${n(-395 - wf)} 110,-330 Q60,-300 20,-305 Q0,-280 -30,-300 Q-60,-285 -70,-320 Z" fill="#45454c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  b += `<path d="M60,-312 Q90,-300 110,-330 Q100,-296 78,-290 Z" fill="${OST_WH}" stroke="${INK}" stroke-width="5"/>`;
  s += `<g transform="translate(0 ${n(-bob)})">${b}</g>`;
  s += leg(40, 0, true);
  // neck + head
  const n0x = 130, n0y = -370 - bob;
  const hxU = 205, hyU = -690 - bob + 6 * Math.sin(t * 2.5), hxD = 300, hyD = 52;
  const hx = lerp(hxU, hxD, eio(dip)), hy = lerp(hyU, hyD, eio(dip));
  const cx = lerp(200, 330, dip), cy = lerp(-470, -420, dip);
  const neck = `M${n0x},${n(n0y)} Q${n(cx)},${n(cy)} ${n(hx)},${n(hy)}`;
  s += `<path d="${neck}" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/><path d="${neck}" fill="none" stroke="${OST_SK}" stroke-width="30" stroke-linecap="round"/>`;
  s += `<path d="M${n0x - 10},${n(n0y + 6)} Q${n0x + 10},${n(n0y - 30)} ${n0x + 34},${n(n0y - 4)}" fill="${OST_WH}" stroke="${INK}" stroke-width="5"/>`;
  const ha = 95 * eio(dip);
  let h = `<ellipse cx="0" cy="0" rx="44" ry="38" fill="${OST_SK}" stroke="${INK}" stroke-width="${OUT}"/>`;
  h += `<path d="M-20,-34 q6,-22 14,-4 q8,-22 14,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  const open = mood === 'gasp' ? 16 : 0;
  h += `<path d="M28,-4 Q80,-2 92,10 Q70,18 30,14 Z" fill="#f0b04a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  h += `<path d="M30,14 Q66,${18 + open} 88,${12 + open * 0.6} Q66,${26 + open} 28,22 Z" fill="#e79a35" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  const er = mood === 'scared' || mood === 'gasp' ? 22 : 19, pr = mood === 'scared' ? 5 : 9;
  h += `<circle cx="6" cy="-6" r="${er}" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="12" cy="-5" r="${pr}" fill="${INK}"/><circle cx="15" cy="-9" r="3" fill="#fff"/>`;
  h += `<path d="M-6,${-6 - er} l-6,-12 M4,${-6 - er} l0,-13 M14,${-6 - er} l6,-11" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  if (mood === 'smug') h += `<path d="M${6 - er},-8 A${er},${er} 0 0 1 ${6 + er},-8 Z" fill="${OST_SK}" stroke="${INK}" stroke-width="5"/>`;
  if (dip < 0.9) s += `<g transform="translate(${n(hx)} ${n(hy)}) rotate(${n(ha)}) scale(${n(1 - clamp((dip - 0.6) / 0.3))})">${h}</g>`;
  const fx = o.flip ? -1 : 1;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc * fx)} ${n(sc)})">${shadow(0, 0, 150, 18)}${s}</g>`;
}
function ostEgg(x, y, sc, ang = 0) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)}) scale(${n(sc)})"><ellipse cx="0" cy="0" rx="34" ry="42" fill="#fff6dc" stroke="${INK}" stroke-width="6"/><ellipse cx="-10" cy="-14" rx="8" ry="12" fill="#fff"/><circle cx="12" cy="10" r="3" fill="#e9d7a8"/><circle cx="4" cy="20" r="2.5" fill="#e9d7a8"/></g>`;
}
function nestHole(x, y, sc, part, t = 0, turn = 0) {
  // part 'back' (hole + eggs) or 'front' (sand lip). Draw the ostrich between them.
  if (part === 'front') return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})"><path d="M-200,6 Q0,64 200,6 Q216,40 170,58 Q0,92 -170,58 Q-216,40 -200,6 Z" fill="#f2cf8a" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/><ellipse cx="-90" cy="56" rx="22" ry="6" fill="#d9ad62"/><ellipse cx="80" cy="62" rx="26" ry="6" fill="#d9ad62"/></g>`;
  let s = `<ellipse cx="0" cy="0" rx="200" ry="52" fill="#8a5a2b" stroke="${INK}" stroke-width="${OUT}"/><ellipse cx="0" cy="8" rx="170" ry="36" fill="#6b4220"/>`;
  [[-110, 4], [-40, 14], [40, 10], [112, 2]].forEach(([ex, ey], i) => { s += ostEgg(ex, ey - 18, 0.85, turn * 25 * Math.sin(t * 3 + i * 1.7)); });
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">${s}</g>`;
}
function lion(x, y, sc, o = {}) {
  // feet at (x,y), faces left. o: t, mood calm|angry|scared, fly 0..1 (launched away up-right, spinning)
  const t = o.t || 0, mood = o.mood || 'angry', fly = o.fly || 0;
  const LI = '#e8a64a', MA = '#b8622a';
  let s = '';
  const lg = (lx) => `<path d="M${lx},-120 L${lx},-10" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="M${lx},-120 L${lx},-10" stroke="${LI}" stroke-width="26" stroke-linecap="round"/>`;
  s += lg(60) + lg(150);
  s += `<path d="M190,-170 Q260,-190 ${n(250 + 10 * Math.sin(t * 5))},-260" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><circle cx="${n(250 + 10 * Math.sin(t * 5))}" cy="-266" r="16" fill="${MA}" stroke="${INK}" stroke-width="5"/>`;
  s += `<ellipse cx="100" cy="-150" rx="120" ry="70" fill="${LI}" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += lg(20) + lg(120);
  let m = '';
  for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; m += `${i ? 'L' : 'M'}${n(-60 + 108 * Math.cos(a))},${n(-230 + 108 * Math.sin(a))} L${n(-60 + 86 * Math.cos(a + 0.22))},${n(-230 + 86 * Math.sin(a + 0.22))} `; }
  s += `<path d="${m}Z" fill="${MA}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  s += `<circle cx="-60" cy="-230" r="66" fill="${LI}" stroke="${INK}" stroke-width="${OUT}"/>`;
  s += `<circle cx="-110" cy="-284" r="18" fill="${LI}" stroke="${INK}" stroke-width="5"/><circle cx="-10" cy="-284" r="18" fill="${LI}" stroke="${INK}" stroke-width="5"/>`;
  const eyeR = mood === 'scared' ? 18 : 13;
  for (const ex of [-88, -40]) {
    s += `<circle cx="${ex}" cy="-244" r="${eyeR}" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${ex - 3}" cy="-243" r="${mood === 'scared' ? 4 : 7}" fill="${INK}"/>`;
    if (mood === 'angry') s += `<path d="M${ex - 18},${ex < -60 ? -268 : -262} L${ex + 16},${ex < -60 ? -260 : -268}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  }
  s += `<ellipse cx="-66" cy="-208" rx="14" ry="10" fill="${INK}"/>`;
  s += mood === 'scared' ? `<ellipse cx="-66" cy="-180" rx="16" ry="14" fill="#7a1f1f" stroke="${INK}" stroke-width="5"/>`
    : `<path d="M-96,-186 Q-80,-172 -66,-190 Q-52,-172 -36,-186" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-88,-182 l6,14 l6,-12 M-50,-182 l-6,14 l-6,-12" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  const fx = x + fly * 900, fy = y - fly * 1300 + fly * fly * 300, rot = fly * 540;
  return `<g transform="translate(${n(fx)} ${n(fy)}) rotate(${n(rot)} 0 -150) scale(${n(sc)})">${fly ? '' : shadow(60, 0, 150, 16)}${s}</g>`;
}
function speedLines(x, y, sc, t) {
  let s = '';
  for (let i = 0; i < 6; i++) { const yy = -340 + i * 60, off = ((t * 900 + i * 137) % 300); s += `<line x1="${n(-260 - off)}" y1="${yy}" x2="${n(-120 - off)}" y2="${yy}" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity="0.5"/>`; }
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(sc)})">${s}</g>`;
}
