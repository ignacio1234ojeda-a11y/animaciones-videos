// Why do we yawn? - shots (uses lib.js)


// ---------------------------------------------------------------- A: the myth (living room)
function shotA(t) {
  const cam = camAt([[0, 560, 1160, 1.55], [T.oxygen, 600, 1120, 1.75], [T.cutB, 610, 1110, 1.8]], t);
  let s = `<rect width="${W}" height="${H}" fill="#ffe2ad"/>`;
  s += layer(cam, 1180, livingWall(), 2);
  let m = livingFloor();
  const GX = 560;
  const y = yawnAmt(t, T.yawnA, 1.55);
  const o = { expr: y > 0.02 ? 'yawn' : 'curious', yawn: y, t, lookX: -4, lookY: 2, sy: 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t) + 0.05 * y };
  stretch(o, y);
  m += shadow(GX, FLOOR + 4, 84);
  m += `<g transform="translate(${GX} ${FLOOR})">${guy(o)}</g>`;
  const ys = clamp(pop(t, T.yawnA + 0.25, 2.6, 8), 0, 1.15) * (1 - prog(t, T.yawnA + 1.2, T.yawnA + 1.45));
  m += popG(GX - 190, FLOOR - 250, ys, txt(0, 0, 'YAAAWN', 48, '#ffd23f', { stroke: INK, sw: 8 }), -12);
  const cs = clamp(pop(t, T.oxygen - 0.1, 2.4, 7), 0, 1.12) * 0.9;
  m += cloud(GX + 150, FLOOR - 560, 150, 80, cs, [GX + 40, FLOOR - 420]);
  m += popG(GX + 150, FLOOR - 545, cs, txt(0, 0, 'OXYGEN?', 48, '#2b8fd6'));
  s += layer(cam, 1000, m);
  s += layer(cam, 700, plant(1060, FLOOR + 240, 1.6) + plant(-150, FLOOR + 260, 1.4));
  s += label(540, 300, clamp(pop(t, T.oxygen + 0.25, 2.4, 7), 0, 1.15), 'MYTH?', '#ffd23f', INK, 70);
  return s;
}

// ---------------------------------------------------------------- B: extra oxygen, still yawning
function labBg() {
  let s = `<rect width="${W}" height="${H}" fill="#e3f4f1"/>`;
  for (let x = -100; x < 1200; x += 110) s += `<line x1="${x}" y1="0" x2="${x}" y2="1460" stroke="#c6e4de" stroke-width="5"/>`;
  for (let y = 0; y < 1460; y += 110) s += `<line x1="0" y1="${y}" x2="1100" y2="${y}" stroke="#c6e4de" stroke-width="5"/>`;
  s += `<rect x="0" y="1460" width="${W}" height="500" fill="#a9b8c8"/><line x1="0" y1="1460" x2="${W}" y2="1460" stroke="${INK}" stroke-width="6"/>`;
  return s;
}
function shotB(t) {
  let s = labBg();
  const GX = 400, GY = 1460, SC = 2.0;
  const y = yawnAmt(t, T.yawnB, 1.05);
  const o = { expr: y > 0.02 ? 'yawn' : (t > T.extra + 0.3 ? 'smug' : 'curious'), yawn: y, t, lookX: -4, lookY: 2, sy: 1 + 0.008 * Math.sin(t * 4) + 0.05 * y };
  stretch(o, y);
  o.propFront = `<path d="M22,-262 L66,-292" stroke="#57606b" stroke-width="6" stroke-linecap="round"/>` +
    `<ellipse cx="-16" cy="-257" rx="40" ry="37" fill="#cfefff" fill-opacity="0.45" stroke="${INK}" stroke-width="6"/>`;
  s += tank(860, 1460, 1.0);
  const flowing = t > T.extra ? 1 : 0.4;
  s += flowPath(`M${GX - 16 * SC},${GY - 220 * SC} C${GX - 20 * SC},1180 700,1220 800,1000 L860,935`, 16, '#b9e6c9', '#ffffff', t, 260 * flowing);
  s += shadow(GX, GY + 6, 84 * SC);
  s += `<g transform="translate(${GX} ${GY}) scale(${SC})">${guy(o)}</g>`;
  if (t > T.extra) for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.8 + i / 4) % 1);
    s += popG(860 + 30 * Math.sin(i * 2 + t * 3), 880 - ph * 260, 1 - ph, txt(0, 0, 'O2', 34, '#2f9e44', { stroke: '#fff', sw: 6 }));
  }
  s += label(540, 290, clamp(pop(t, T.extra, 2.4, 7), 0, 1.12), 'EXTRA OXYGEN', '#7ee07a', INK, 56);
  s += popG(GX + 230, GY - 860, clamp(pop(t, T.yawnB + 0.2, 2.6, 8), 0, 1.15) * (1 - prog(t, T.yawnB + 0.9, T.yawnB + 1.1)), txt(0, 0, 'YAWN', 52, '#ffd23f', { stroke: INK, sw: 8 }), 12);
  s += stamp(640, 520, clamp(pop(t, T.all, 2.6, 7), 0, 1.15) * 0.9, 'NOPE', '#e8413a', -10);
  return s;
}

// ---------------------------------------------------------------- C: x-ray head, brain overheating
function shotC(t) {
  let s = `<rect width="${W}" height="${H}" fill="#ffe6d8"/>`;
  const HX = 470, HY = 950, HS = 3.0;
  const z = 1 + 0.05 * prog(t, T.cutC, T.cutD);
  s += `<g transform="translate(540 960) scale(${n(z)}) translate(-540 -960)">`;
  s += torso(HX, HY, HS);
  const heat = lerp(0.15, 1, eo(prog(t, T.brain - 0.3, T.hot + 0.2)));
  s += bigHead(HX, HY, HS, { expr: 'worried', t, lookX: -8, lookY: -4 });
  s += drop(HX - 170, HY - 90 + 30 * ((t * 1.2) % 1), 16);
  const WX = HX + 26 * HS, WY = HY - 22 * HS, WR = 44 * HS;
  const xs = clamp(pop(t, T.cutC + 0.05, 2.2, 7), 0, 1.12);
  s += xray(WX, WY, WR, xs);
  if (xs > 0.02) {
    const k = Math.min(1, xs);
    const throb = 1 + 0.04 * heat * Math.sin(t * 2 * Math.PI * 3);
    s += moodBrain(WX - 6, WY - 6, WR * 0.66 * k * throb, heat, 'hot', t);
    s += steam(WX - 6, WY - WR * 0.6, t, heat * k);
  }
  s += `</g>`;
  const lvl = lerp(0.4, 0.95, eo(prog(t, T.real, T.hot + 0.2))) + 0.02 * Math.sin(t * 6);
  s += thermometer(900, 1250, clamp(pop(t, T.real, 2.4, 7), 0, 1.12) * 0.9, lvl, t >= T.hot ? 'HOT!' : '');
  s += label(540, 300, clamp(pop(t, T.real, 2.4, 7), 0, 1.15) * (1 - prog(t, T.hot - 0.15, T.hot)), 'REAL REASON:', '#fff', INK, 56);
  s += label(540, 300, clamp(pop(t, T.hot, 2.4, 7), 0, 1.15), 'OVERHEATING!', '#ff5a4e', '#fff', 62);
  return s;
}

// ---------------------------------------------------------------- D: big yawn pumps blood up
function shotD(t) {
  let s = `<rect width="${W}" height="${H}" fill="url(#studio)"/>`;
  const HX = 540, HY = 860, HS = 3.4;
  const y = yawnAmt(t, T.yawnD, 1.85);
  const z = 1 + 0.06 * eo(prog(t, T.yawnD, T.yawnD + 0.6));
  s += `<g transform="translate(540 900) scale(${n(z)}) translate(-540 -900)">`;
  s += torso(HX, HY, HS);
  const fl = eo(prog(t, T.pumps - 0.1, T.pumps + 0.3));
  const sp = 160 + 360 * y;
  const vL = `M${HX - 120},1560 C${HX - 130},1300 ${HX - 160},1150 ${HX - 180},1020`;
  const vR = `M${HX + 120},1560 C${HX + 130},1300 ${HX + 160},1150 ${HX + 180},1020`;
  s += flowPath(vL, 26, ART, '#ff9a8e', t, sp, fl) + flowPath(vR, 26, ART, '#ff9a8e', t, sp, fl);
  s += bigHead(HX, HY, HS, { expr: 'yawn', yawn: y, t, lookX: 0, lookY: 0 });
  // vessels continue inside the head (x-ray style)
  const inL = `M${HX - 180},1020 C${HX - 225},920 ${HX - 225},770 ${HX - 150},670`;
  const inR = `M${HX + 180},1020 C${HX + 225},920 ${HX + 225},770 ${HX + 150},670`;
  s += flowPath(inL, 18, ART, '#ff9a8e', t, sp, fl * 0.85) + flowPath(inR, 18, ART, '#ff9a8e', t, sp, fl * 0.85);
  // stretch lines around the jaw
  for (const k of [0, 0.6, 1.2]) s += impactLines(HX - 58, HY + 170, t, T.yawnD + 0.2 + k, 90, 50, 150, 5, 160, 7);
  s += `</g>`;
  s += label(540, 300, clamp(pop(t, T.yawnD, 2.4, 7), 0, 1.15) * (1 - prog(t, T.blood - 0.15, T.blood)), 'BIG YAWN', '#ffd23f', INK, 62);
  s += label(540, 300, clamp(pop(t, T.blood, 2.4, 7), 0, 1.15), 'FRESH BLOOD', ART, '#fff', 62);
  s += popG(240, 1300, clamp(pop(t, T.pumps, 2.6, 8), 0, 1.2), txt(0, 0, 'PUMP!', 70, ART, { stroke: INK, sw: 10 }), -10 + wob(t, T.pumps, 8, 3, 4));
  return s;
}

// ---------------------------------------------------------------- E: cross-section, cool air in, brain cools
function shotE(t) {
  let s = `<rect width="${W}" height="${H}" fill="url(#iceBg)"/>`;
  const CX = 470, CY = 900, R = 330;
  const heat = 1 - eio(prog(t, T.cools - 0.3, T.radiator + 0.1));
  const c = uid('pc');
  // shoulders
  s += `<path d="M${CX - 120},${CY + 250} L${CX - 120},${CY + 420} C${CX - 320},${CY + 440} ${CX - 420},${CY + 520} ${CX - 440},${CY + 900} L${CX + 380},${CY + 900} C${CX + 360},${CY + 520} ${CX + 260},${CY + 440} ${CX + 120},${CY + 420} L${CX + 120},${CY + 250} Z" fill="${WHITE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<defs><clipPath id="${c}"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="${WHITE}"/>`;
  s += `<g clip-path="url(#${c})">`;
  s += `<path d="M${CX - 280},${CY - 200} Q${CX},${CY - 330} ${CX + 280},${CY - 200} L${CX + 330},${CY + 330} L${CX - 330},${CY + 330} Z" fill="#fff4f0"/>`;
  s += `</g>`;
  s += moodBrain(CX - 40, CY - 110, 190, heat, heat > 0.5 ? 'hot' : 'cool', t);
  s += steam(CX - 40, CY - 260, t, heat);
  // wide-open mouth (yawning) on the right side
  const jaw = 0.85 + 0.15 * Math.sin(t * 1.5);
  s += `<path d="M${CX + 335},${CY + 90} C${CX + 240},${CY + 70} ${CX + 120},${CY + 80} ${CX + 20},${CY + 130} C${CX - 20},${CY + 160} ${CX - 10},${CY + 210} ${CX + 40},${CY + 220} C${CX + 140},${CY + 230 + 40 * jaw} ${CX + 260},${CY + 250 + 60 * jaw} ${CX + 320},${CY + 250 + 60 * jaw} Z" fill="#8a2f3c" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<path d="M${CX + 300},${CY + 240 + 55 * jaw} C${CX + 220},${CY + 200 + 40 * jaw} ${CX + 120},${CY + 190 + 30 * jaw} ${CX + 50},${CY + 210}" fill="none" stroke="${SKIN_PINK}" stroke-width="30" stroke-linecap="round"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${INK}" stroke-width="10"/>`;
  s += `<path d="M${CX - 280},${CY - 200} Q${CX},${CY - 330} ${CX + 280},${CY - 200}" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="16 12" opacity="0.5"/>`;
  // nose + closed yawning eye
  s += `<path d="M${CX + 318},${CY - 10} Q${CX + 380},${CY + 30} ${CX + 326},${CY + 70}" fill="${WHITE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M${CX + 212},${CY - 50} Q${CX + 236},${CY - 70} ${CX + 262},${CY - 50}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="M${CX + 200},${CY - 118} Q${CX + 236},${CY - 136} ${CX + 270},${CY - 114}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  // cool air: in through the mouth, up toward the brain
  const air = eo(prog(t, T.gulp - 0.1, T.gulp + 0.3));
  const AIR = `M${CX + 620},${CY + 150} C${CX + 480},${CY + 150} ${CX + 340},${CY + 170} ${CX + 200},${CY + 160} C${CX + 80},${CY + 150} ${CX + 40},${CY + 110} ${CX + 10},${CY + 80}`;
  s += flowPath(AIR, 30, '#bfe9ff', COLD, t, 420, air * 0.9);
  if (air > 0.05) for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.7 + i / 4) % 1);
    s += snowflake(CX + 600 - ph * 520, CY + 150 - 40 * Math.sin(ph * 3) - ph * 60, 16 * air, t * 120 + i * 40, COLD);
  }
  const lvl = lerp(0.95, 0.35, eio(prog(t, T.cools - 0.2, T.radiator + 0.2))) + 0.02 * Math.sin(t * 6);
  s += thermometer(930, 700, 0.75, lvl, heat < 0.4 ? 'COOL' : '');
  s += label(780, 1420, clamp(pop(t, T.gulp, 2.4, 7), 0, 1.12) * 0.85, 'GULP OF AIR', ICE_D, INK, 52);
  // radiator
  const rs = clamp(pop(t, T.radiator, 2.4, 7), 0, 1.15);
  let rad = `<rect x="-150" y="-90" width="300" height="180" rx="22" fill="#e3e9f1" stroke="${INK}" stroke-width="${OUT}"/>`;
  for (let i = 0; i < 5; i++) rad += `<rect x="${-128 + i * 54}" y="-70" width="40" height="140" rx="16" fill="#cfd6df" stroke="${INK}" stroke-width="5"/>`;
  rad += `<rect x="-120" y="90" width="20" height="30" fill="#57606b" stroke="${INK}" stroke-width="5"/><rect x="100" y="90" width="20" height="30" fill="#57606b" stroke="${INK}" stroke-width="5"/>`;
  rad += snowflake(170, -100, 34, t * 60, COLD);
  s += popG(780, 330, rs * 0.9, rad, -4);
  s += label(300, 300, clamp(pop(t, T.radiator + 0.1, 2.4, 7), 0, 1.15) * 0.8, 'RADIATOR', '#fff', INK, 54);
  return s;
}

// ---------------------------------------------------------------- F: split screen, warm pack vs cold pack
const TOPYAWNS = () => [T.four, T.four + 0.5, T.four + 1.0, T.four + 1.5];
function shotF(t) {
  let s = `<rect x="-60" y="-60" width="${W + 120}" height="1020" fill="#ffd9c2"/><rect x="-60" y="960" width="${W + 120}" height="1020" fill="#d6efff"/>`;
  // top: warm pack
  let top = '';
  const ys = TOPYAWNS();
  let yt = 0, kt = 0, tk = 0;
  for (const y0 of ys) { yt = Math.max(yt, yawnAmt(t, y0, 0.48)); if (t >= y0) { kt++; tk = y0; } }
  const oT = { expr: yt > 0.02 ? 'yawn' : 'worried', yawn: yt, t, lookX: -4, sy: 1 + 0.05 * yt };
  stretch(oT, yt * 0.7);
  oT.propFront = pack(true, t, T.warm - 0.1);
  top += shadow(360, 904, 84 * 1.55);
  top += `<g transform="translate(360 900) scale(1.55)">${guy(oT)}</g>`;
  top += label(810, 330, clamp(pop(t, T.warm, 2.4, 7), 0, 1.12) * 0.9, 'WARM', '#ff8a5e', INK, 56);
  top += counter(810, 640, kt, tk, t, '#ff5a4e');
  s += `<g clip-path="url(#clipTop)">${top}</g>`;
  // bottom: cold pack
  let bot = '';
  const yb = yawnAmt(t, T.people + 0.75, 0.9);
  const kb = t >= T.people + 0.75 ? 1 : 0;
  const oB = { expr: yb > 0.02 ? 'yawn' : 'flat', yawn: yb, t, lookX: -4, sy: 1 + 0.03 * yb };
  stretch(oB, yb * 0.5);
  oB.propFront = pack(false, t, T.pack + 0.15);
  bot += shadow(360, 1694, 84 * 1.55);
  bot += `<g transform="translate(360 1690) scale(1.55)">${guy(oB)}</g>`;
  bot += label(810, 1120, clamp(pop(t, T.pack + 0.4, 2.4, 7), 0, 1.12) * 0.9, 'COLD', ICE_D, INK, 56);
  bot += counter(810, 1430, kb, T.people + 0.75, t, COLD);
  s += `<g clip-path="url(#clipBot)">${bot}</g>`;
  s += `<line x1="-60" y1="960" x2="${W + 60}" y2="960" stroke="${INK}" stroke-width="10"/>`;
  s += label(540, 960, clamp(pop(t, T.more, 2.6, 7), 0, 1.2), '4X MORE YAWNS', '#ffd23f', INK, 64);
  return s;
}

// ---------------------------------------------------------------- G: did you just yawn?
function shotG(t) {
  let s = `<rect width="${W}" height="${H}" fill="url(#mint)"/>`;
  const HX = 520, HY = 980, HS = 3.3;
  const y = yawnAmt(t, T.yawnG, 1.4);
  const z = 1 + 0.04 * prog(t, T.cutG, T.END);
  s += `<g transform="translate(540 960) scale(${n(z)}) translate(-540 -960)">`;
  s += torso(HX, HY, HS);
  const after = t > T.yawnG + 1.4;
  s += bigHead(HX, HY, HS, { expr: y > 0.02 ? 'yawn' : (after ? 'smug' : 'curious'), yawn: y, t, lookX: 10, lookY: 0 });
  for (const k of [0, 0.5]) s += impactLines(HX - 40, HY + 150, t, T.yawnG + 0.25 + k, 90, 50, 140, 5, 160, 7);
  s += `</g>`;
  // thought cloud: brain cooling off
  const cs = clamp(pop(t, T.brainG - 0.1, 2.4, 7), 0, 1.12);
  s += cloud(790, 380, 170, 120, cs, [640, 640]);
  if (cs > 0.02) {
    const heat = 0.5 * (1 - eio(prog(t, T.cooling, T.cooling + 0.6)));
    s += moodBrain(790, 380, 100 * Math.min(1, cs), heat, 'cool', t);
    for (let i = 0; i < 3; i++) {
      const a = t * 1.6 + i * 2.1;
      s += snowflake(790 + 165 * Math.cos(a) * cs, 380 + 105 * Math.sin(a) * cs, 18 * cs, t * 90, COLD);
    }
  }
  s += label(500, 1520, clamp(pop(t, T.cooling, 2.4, 7), 0, 1.15), 'COOLING OFF', ICE_D, INK, 60);
  s += check(880, 1520, clamp(pop(t, T.cooling + 0.12, 2.4, 7), 0, 1.12) * 0.8, true);
  return s;
}

window.BG = '#ffe2ad';
window.SHOTS = [[0, shotA], [T.cutB, shotB], [T.cutC, shotC], [T.cutD, shotD], [T.cutE, shotE], [T.cutF, shotF], [T.cutG, shotG]];
window.HITS = [[T.yawnA + 0.3, 5, 8], [T.oxygen, 4, 9], [T.all, 14, 6], [T.hot, 12, 6], [T.yawnD + 0.3, 8, 7], [T.pumps, 6, 8],
  [T.gulp, 5, 9], [T.radiator, 6, 8], [T.four, 5, 9], [T.more, 12, 6], [T.yawnG + 0.3, 6, 8], [T.cooling, 5, 9]];
