// Spec runtime v4 (2026-11-27): turns window.SPEC (written by make.py) into SHOTS/HITS.
// Character acting: poses blended with overshoot, walk/run/jump/celebrate/scared, squash & stretch, anticipation,
// eyes + head look-at, random blinks, viseme mouth, captain coat/cap with secondary motion, attached head-wear.
// Camera: per-shot moves (push/pull/pan/follow) over parallax background layers. Transitions: whip/wipe/zoom/match/slide/cut.
window.STYLE = Object.assign(window.STYLE || {}, SPEC.style || {});
window.BOIL_ITEMS = 1;
const FX = window.STYLE.fx !== 0;

// ---- face: viseme mouth (open + wide/round) and partial blinks on top of any guy face
const _faceBase = guyFace;
guyFace = function (o) {
  let s = _faceBase(o);
  const lx = o.lookX || 0, ly = o.lookY || 0, skin = o.skin || WHITE, ex = o.expr;
  const mx = -17 + lx * 0.6, my = -262 + ly * 0.4;
  const m = o.mouth || [o.talk || 0, 0];
  const k = m[0], w = m[1] || 0;
  if (k > 0.06 && ex !== 'laugh' && ex !== 'cry' && ex !== 'yawn') {
    const rnd = Math.max(0, -w), wid = Math.max(0, w);
    const hw = 10 + 5 * w + 7 * k - 2 * rnd, h = (3 + 21 * k) * (1 - 0.32 * wid) * (1 + 0.12 * rnd);
    const top = my - 3, bot = top + h;
    s += `<ellipse cx="${n(mx)}" cy="${n(my + 1)}" rx="26" ry="16" fill="${skin}"/>`;
    s += `<path d="M${n(mx - hw)},${n(top)} Q${n(mx)},${n(top - 4 - 3 * rnd)} ${n(mx + hw)},${n(top)} Q${n(mx + hw * (0.95 - 0.25 * rnd))},${n(bot)} ${n(mx)},${n(bot + 1)} Q${n(mx - hw * (0.95 - 0.25 * rnd))},${n(bot)} ${n(mx - hw)},${n(top)} Z" fill="${INK}"/>`;
    if (wid > 0.2 && k > 0.16) s += `<path d="M${n(mx - hw * 0.72)},${n(top + 0.5)} L${n(mx + hw * 0.72)},${n(top + 0.5)} L${n(mx + hw * 0.6)},${n(top + 4.5)} L${n(mx - hw * 0.6)},${n(top + 4.5)} Z" fill="#fff"/>`;
    if (k > 0.28) s += `<ellipse cx="${n(mx + 1)}" cy="${n(bot - h * 0.2)}" rx="${n(hw * 0.5)}" ry="${n(Math.max(1.5, h * 0.2))}" fill="${SKIN_PINK}"/>`;
  }
  const b = o.blinkAmt !== undefined ? o.blinkAmt : (o.blink ? 1 : 0);
  if (b > 0.04 && ex !== 'laugh' && ex !== 'cry' && ex !== 'yawn') {
    const big = ex === 'surprised' ? 1.3 : ex === 'worried' ? 1.15 : 1;
    for (const exx of [-34 + lx, 0 + lx]) {
      const ey = -306 + ly, top = ey - 13 * big - 5, lid = top + b * (13 * big + 7), bot = ey + 13 * big + 4, low = bot - b * (11 * big + 2);
      s += `<path d="M${n(exx - 15)},${n(top)} L${n(exx + 15)},${n(top)} L${n(exx + 15)},${n(lid)} L${n(exx - 15)},${n(lid)} Z M${n(exx - 15)},${n(low)} L${n(exx + 15)},${n(low)} L${n(exx + 15)},${n(bot + 1)} L${n(exx - 15)},${n(bot + 1)} Z" fill="${skin}"/>`;
      s += `<path d="M${n(exx - 12)},${n(lid - 1)} Q${n(exx)},${n(lid + 6 * b)} ${n(exx + 12)},${n(lid - 1)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    }
  }
  return s;
};

// ---- poses: (t, ts = seconds since the pose started) -> rig params (guy units, deg)
const DEF4 = { armL: [-64, -118], armR: [64, -118], bendL: -18, bendR: 18, lean: 0, dx: 0, bob: 0, tilt: 0, legL: [-26, -14], legR: [22, -14], kneeL: 0, kneeR: 0, footRotL: 0, footRotR: 0, sweat: 0 };
const JUMP_T = 0.62, JUMP_H = 150;
const backOut = (u) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const POSES = {
  rest: () => ({}),
  point: () => ({ armR: [110, -330], pointR: -60, lean: -2 }),
  pointL: () => ({ armL: [-110, -250], pointL: -120, lean: -3 }),
  pointR: () => ({ armR: [120, -230], pointR: -40, lean: 2 }),
  ears: () => ({ armL: [-40, -300], armR: [40, -300] }),
  shrug: () => ({ armL: [-112, -172], armR: [112, -172], bendL: -34, bendR: 34, tilt: 8 }),
  think: () => ({ armR: [-12, -250], bendR: 30, tilt: -5 }),
  wave: (t) => ({ armR: [120, -330 + 22 * Math.sin(t * 12)], pointR: -80 }),
  cheer: (t) => ({ armL: [-100, -360 + 10 * Math.sin(t * 9)], armR: [100, -360 - 10 * Math.sin(t * 9)] }),
  hips: () => ({ armL: [-60, -120], armR: [60, -120], bendL: -40, bendR: 40 }),
  celebrate: (t) => ({ armL: [-104, -366 + 18 * Math.sin(t * 10)], armR: [104, -366 - 18 * Math.sin(t * 10)], bendL: 12, bendR: -12, lean: 5 * Math.sin(t * 5) }),
  scared: (t, ts) => { const e = backOut(clamp(ts / 0.2)); return { armL: [-108, -292 + 4 * Math.sin(t * 40)], armR: [100, -300 + 4 * Math.sin(t * 43)], bendL: 34, bendR: -30, lean: 13 * e + 1.6 * Math.sin(t * 47), dx: 52 * e + 2.5 * Math.sin(t * 61), tilt: 6, sweat: 1 }; },
  jump: (t, ts) => {
    const air = ts >= 0 && ts < JUMP_T ? Math.sin(Math.PI * ts / JUMP_T) : 0;
    return { armL: [-96, lerp(-150, -350, air)], armR: [96, lerp(-150, -350, air)], bendL: 22, bendR: -22, legL: [-42, -14 - 50 * air], legR: [12, -14 - 44 * air], kneeL: 34 * air, kneeR: 30 * air, footRotL: -12 * air, footRotR: -12 * air };
  },
  walk: () => ({}),
  run: () => ({}),
};
const ACTION = { jump: 1, scared: 1, celebrate: 1, walk: 1, run: 1 };
function cycleP(kind, ph, w) {
  const run = kind === 'run', S = run ? 46 : 32, Lf = run ? 46 : 24, B = run ? 16 : 8;
  const sL = Math.sin(ph), cL = Math.cos(ph), lL = Math.max(0, cL), lR = Math.max(0, -cL);
  const p = {
    legL: [-26 - S * sL * w, -14 - Lf * lL * w], legR: [22 + S * sL * w, -14 - Lf * lR * w],
    kneeL: (8 + 34 * lL) * w, kneeR: (8 + 34 * lR) * w, footRotL: -12 * lL * w, footRotR: -12 * lR * w,
    bob: B * cL * cL * w, lean: (run ? -12 : -4) * w + 1.5 * Math.sin(2 * ph) * w,
  };
  if (run) { p.armL = [-40 + 54 * sL * w, -172 + 22 * Math.abs(sL)]; p.armR = [40 - 54 * sL * w, -172 + 22 * Math.abs(sL)]; p.bendL = 44; p.bendR = -44; }
  else { p.armL = [-64 + 30 * sL * w, -118 - 6 * Math.abs(sL) * w]; p.armR = [64 - 30 * sL * w, -118 - 6 * Math.abs(sL) * w]; }
  return p;
}
function mixP(A, B, u) {
  const out = {}, keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of keys) {
    const a = A[k] !== undefined ? A[k] : DEF4[k], b = B[k] !== undefined ? B[k] : DEF4[k];
    if (a === undefined || b === undefined || a === null || b === null) { out[k] = u < 0.5 ? a : b; continue; }
    if (Array.isArray(a)) out[k] = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    else if (typeof a === 'number' && typeof b === 'number') out[k] = lerp(a, b, u);
    else out[k] = u < 0.5 ? a : b;
  }
  return out;
}
const poseOf = (name, t, ts) => (POSES[name] || POSES.rest)(t, ts);
const envAt = (t) => { const E = window.ENV || []; const i = Math.round(t * 60); return i >= 0 && i < E.length ? E[i] : 0; };
const mouthAt = (t) => { const M = window.MOUTH; const i = Math.round(t * 60); if (M) return i >= 0 && i < M.length ? M[i] : [0, 0]; return [envAt(t), 0]; };

// ---- per-guy precompute: cumulative states, blinks, saccades
function prepGuy(it) {
  const base = { expr: it.expr, pose: it.pose || 'rest', look: it.look, lookAt: it.lookAt, glass: it.glass };
  const S = [{ t: -99, s: base, prev: base, poseT: -99, prevPose: base.pose, lookT: -99, prevLook: base, hop: false }];
  let cur = base;
  for (const [tc, c] of it.ch || []) {
    const last = S[S.length - 1], nxt = Object.assign({}, cur, c);
    const poseCh = c.pose !== undefined && c.pose !== cur.pose, lookCh = c.look !== undefined || c.lookAt !== undefined;
    const moving = c.x !== undefined || c.y !== undefined;
    const hop = !moving && !ACTION[nxt.pose] && (poseCh || (c.expr !== undefined && c.expr !== cur.expr));
    S.push({ t: tc, s: nxt, prev: cur, poseT: poseCh ? tc : last.poseT, prevPose: poseCh ? cur.pose : last.prevPose, lookT: lookCh ? tc : last.lookT, prevLook: lookCh ? cur : last.prevLook, hop });
    cur = nxt;
  }
  it._S = S;
  const r = rng(Math.round(it.x * 13 + it.y * 7 + it.sc * 100) + 5), B = [];
  for (let bt = 0.5 + r() * 1.5; bt < (T.END || 60) + 2; bt += 2.0 + r() * 2.4) { B.push(bt); if (r() < 0.22) B.push(bt + 0.3); }
  for (const [tc] of it.ch || []) B.push(tc + 0.02);
  it._B = B.sort((a, b) => a - b);
  it._SAC = []; for (let st = 1 + r(); st < (T.END || 60) + 2; st += 1.3 + r() * 1.8) it._SAC.push([st, (r() - 0.5) * 6, (r() - 0.5) * 3.5]);
  it._dust = []; it._conf = [];
  for (const e of S) { if (e.s.pose === 'jump' && e.poseT === e.t) it._dust.push(e.t + JUMP_T); if (e.s.pose === 'celebrate' && e.poseT === e.t) it._conf.push(e.t); }
  for (const m of it.moves || []) { if (m[6] === 'jump') it._dust.push(m[1]); if (m[6] === 'run') it._dust.push(m[0] + 0.05); }
}
function stateAt(it, t) { const S = it._S; let i = 0; for (let j = 1; j < S.length; j++) if (t >= S[j].t) i = j; return [S[i], S[i + 1]]; }

// body squash/stretch + lift (guy units, up = positive) from hops, jumps, loops
function landSpring(dt, amt) { if (dt < 0 || dt > 0.7) return [1, 1]; const e = amt * Math.exp(-8 * dt) * Math.cos(2 * Math.PI * 2.8 * dt); return [1 + 0.8 * e, 1 - e]; }

// rigCore: position, facing, lift and blended params at time t (pure function of t)
function rigCore(it, t) {
  const [E, NX] = stateAt(it, t), st = E.s;
  // position from moves
  let X = it.x, Y = it.y, lift = 0, mv = null, mw = 0;
  for (const m of it.moves || []) {
    const [t0, t1, x0, y0, x1, y1, gait] = m;
    if (t >= t1) { X = x1; Y = y1; }
    else if (t >= t0) {
      const u = prog(t, t0, t1), e = gait === 'jump' ? u : u - Math.sin(2 * Math.PI * u) / (2 * Math.PI);
      X = lerp(x0, x1, e); Y = lerp(y0, y1, e); mv = m;
      mw = Math.min(eo(prog(t, t0, t0 + 0.12)), 1 - ei(prog(t, t1 - 0.12, t1)));
      if (gait === 'jump') lift += 120 * 4 * u * (1 - u);
    }
  }
  let face = it.flip ? -1 : 1;
  for (const [tf, fl] of it.faces || []) if (t >= tf) face = fl ? -1 : 1;
  // pose blend (overshoot) from the previous pose
  const ts = t - E.poseT;
  let P = poseOf(st.pose, t, ts);
  const ub = prog(t, E.poseT, E.poseT + 0.3);
  if (ub < 1) P = mixP(poseOf(E.prevPose, t, t - E.poseT + 9), P, backOut(ub));
  P = Object.assign({}, P);
  let sx = 1, sy = 1;
  // walk / run cycles (travel moves or in-place walk/run poses)
  if (mv && mv[6] !== 'jump') { const ph = 2 * Math.PI * (t - mv[0]) / mv[7]; Object.assign(P, cycleRest(P, cycleP(mv[6], ph, mw))); }
  else if (st.pose === 'walk' || st.pose === 'run') { const w = eo(prog(ts, 0, 0.15)); Object.assign(P, cycleRest(P, cycleP(st.pose, 2 * Math.PI * ts / (st.pose === 'run' ? 0.34 : 0.5), w))); }
  if (mv && mv[6] === 'jump') { const a = Math.sin(Math.PI * prog(t, mv[0], mv[1])); Object.assign(P, { legL: [-42, -14 - 50 * a], legR: [12, -14 - 44 * a], kneeL: 34 * a, kneeR: 30 * a, armL: [-96, lerp(-150, -350, a)], armR: [96, lerp(-150, -350, a)] }); }
  // hop on expression/pose change: anticipation squash -> stretch -> arc -> landing squash
  const hopAt = (e) => {
    const dt = t - e.t;
    if (dt >= -0.08 && dt < 0) { const a = eo((dt + 0.08) / 0.08); sy *= 1 - 0.07 * a; sx *= 1 + 0.05 * a; }
    else if (dt >= 0 && dt < 0.3) { lift += 30 * Math.sin(Math.PI * dt / 0.3); const s2 = 0.07 * (1 - clamp(dt / 0.1)); sy *= 1 + s2; sx *= 1 - s2 * 0.6; }
    else if (dt >= 0.3) { const [a, b] = landSpring(dt - 0.3, 0.09); sx *= a; sy *= b; }
  };
  if (E.hop) hopAt(E);
  if (NX && NX.hop && t > NX.t - 0.08) hopAt(NX);
  // jump action
  const jumpAt = (t0) => {
    const dt = t - t0;
    if (dt >= -0.14 && dt < 0) { const a = eo((dt + 0.14) / 0.14); sy *= 1 - 0.16 * a; sx *= 1 + 0.1 * a; }
    else if (dt >= 0 && dt < JUMP_T) { const u = dt / JUMP_T; lift += JUMP_H * 4 * u * (1 - u); const s2 = 0.15 * (1 - clamp(dt / 0.16)); sy *= 1 + s2; sx *= 1 - s2 * 0.6; }
    else if (dt >= JUMP_T) { const [a, b] = landSpring(dt - JUMP_T, 0.2); sx *= a; sy *= b; }
  };
  if (st.pose === 'jump') jumpAt(E.poseT);
  if (NX && NX.s.pose === 'jump' && NX.poseT === NX.t && t > NX.t - 0.14) jumpAt(NX.t);
  for (const m of it.moves || []) if (m[6] === 'jump') { if (t > m[0] - 0.14 && t < m[0]) { const a = eo((t - m[0] + 0.14) / 0.14); sy *= 1 - 0.16 * a; sx *= 1 + 0.1 * a; } else if (t >= m[1]) { const [a, b] = landSpring(t - m[1], 0.2); sx *= a; sy *= b; } }
  // celebrate hop loop
  if (st.pose === 'celebrate') { const p = (ts % 0.5) / 0.5; lift += 34 * Math.sin(Math.PI * p); const c = 1 - clamp(Math.min(p, 1 - p) / 0.12); sy *= 1 - 0.08 * c; sx *= 1 + 0.06 * c; }
  // anticipation before any other big pose change (scared / celebrate): small dip
  if (NX && NX.poseT === NX.t && (NX.s.pose === 'scared' || NX.s.pose === 'celebrate') && t > NX.t - 0.1) { const a = eo((t - NX.t + 0.1) / 0.1); sy *= 1 - 0.06 * a; sx *= 1 + 0.04 * a; }
  lift += P.bob || 0;
  // idle breathing + sway
  sy *= 1 + 0.012 * Math.sin(t * 2.6 + it.x);
  const lean = (P.lean || 0) + 1.5 * Math.sin(t * 1.3 + it.x);
  return { X, Y, face, lift, sx, sy, lean, P, st, E, mv };
}
// cycles keep arms from a gesture pose (walking while pointing); otherwise swing them
function cycleRest(P, C) {
  const gesture = P.armL && (Math.abs(P.armL[0] - DEF4.armL[0]) + Math.abs(P.armL[1] - DEF4.armL[1]) > 6) || P.armR && (Math.abs(P.armR[0] - DEF4.armR[0]) + Math.abs(P.armR[1] - DEF4.armR[1]) > 6);
  if (gesture) { const c = Object.assign({}, C); delete c.armL; delete c.armR; delete c.bendL; delete c.bendR; return c; }
  return C;
}
const lookTarget = (it, s) => s.lookAt || (s.look ? null : (it.attachN ? null : [540, 760]));
function lookVec(it, s, R, t) {
  const tg = lookTarget(it, s);
  if (!tg) return s.look ? [s.look[0], s.look[1]] : [0, -4];
  const hx = R.X + R.face * (R.P.dx || 0) * it.sc, hy = R.Y - (R.lift + 300) * it.sc;
  const dx = R.face * (tg[0] - hx), dy = tg[1] - hy;
  return [clamp(dx / 260, -1, 1) * 18, -4 + clamp(dy / 420, -1, 1) * 8];
}

// full rig -> guy() options + world transform
function rigGuy(it, t) {
  const R = rigCore(it, t), P = R.P, st = R.st, E = R.E;
  const o = { expr: st.expr, t, body: it.body, legs: it.legs, wear: it.wear, glass: st.glass };
  for (const k of ['armL', 'armR', 'bendL', 'bendR', 'pointL', 'pointR', 'legL', 'legR', 'kneeL', 'kneeR', 'footRotL', 'footRotR']) if (P[k] !== undefined && P[k] !== null) o[k] = P[k];
  o.sx = R.sx; o.sy = R.sy; o.lean = R.lean;
  if (P.sweat > 0.5) o.sweat = 1;
  // eyes dart to the new target (0.14 s), head follows later (overlapping action)
  let lk = lookVec(it, st, R, t);
  const ul = prog(t, E.lookT, E.lookT + 0.14);
  if (ul < 1) { const pl = lookVec(it, E.prevLook, R, t); lk = [lerp(pl[0], lk[0], eo(ul)), lerp(pl[1], lk[1], eo(ul))]; }
  if (!st.look || st.lookAt) { let sc = [0, 0]; for (const s of it._SAC) if (t >= s[0]) sc = [s[1], s[2]]; if (lookTarget(it, st)) { lk[0] += sc[0]; lk[1] += sc[1]; } }
  o.lookX = lk[0]; o.lookY = lk[1];
  const talkK = it.talk ? mouthAt(t) : [0, 0];
  if (it.talk) o.mouth = talkK;
  const att = it.attachN ? 0 : 1;
  o.headTilt = att * ((P.tilt || 0) + 0.08 * lk[0] - 0.3 * (lk[1] + 4) + 2.2 * talkK[0] * Math.sin(t * 6.1 + it.x));
  // blinks
  let b = 0;
  if (st.expr !== 'surprised') for (const bt of it._B) { const u = (t - bt) / 0.17; if (u >= 0 && u <= 1) b = Math.max(b, u < 0.35 ? u / 0.35 : u < 0.5 ? 1 : 1 - (u - 0.5) / 0.5); }
  o.blinkAmt = b;
  // secondary motion: cap lags rotations and floats on the way down, coat tails drag + flare
  if (it.wear === 'captain') {
    const h = 1 / 30, A = rigCore(it, t - h), B2 = rigCore(it, t - 0.1);
    const vy = ((R.Y - R.lift * it.sc) - (A.Y - A.lift * it.sc)) / h / it.sc;   // units/s, + = falling
    const vx = R.face * (R.X - A.X) / h / it.sc;
    o.capLift = clamp(0.035 * vy, 0, 14);
    o.capRot = clamp(0.55 * (B2.lean - R.lean) - 0.012 * vx, -16, 16);
    o.coatSwing = clamp(0.035 * vx + 0.6 * (B2.lean - R.lean), -30, 30);
    o.coatFlare = clamp(0.03 * vy, -6, 18);
  }
  return { R, o };
}
function guyXform(it, R, ent) {
  const X = R.X + R.face * (R.P.dx || 0) * it.sc, Y = R.Y - R.lift * it.sc;
  return { X, Y, tf: `translate(${n(X)} ${n(Y)}) scale(${n(R.face * it.sc * ent)} ${n(it.sc * ent)})` };
}
// delta transform for art drawn at the guy's static (x, y, sc): follows hops, recoil, squash, lean and flips
function attachXform(it, t) {
  const R = rigCore(it, t), ent = it.at === undefined || it.at === null ? 1 : clamp(pop(t, it.at, 2.4, 7), 0, 1.12);
  const X = R.X + R.face * (R.P.dx || 0) * it.sc, Y = R.Y - R.lift * it.sc;
  return `translate(${n(X)} ${n(Y)}) scale(${n(R.face * ent)} ${n(ent)}) rotate(${n(R.lean)}) scale(${n(R.sx)} ${n(R.sy)}) translate(${n(-it.x)} ${n(-it.y)})`;
}

const kOf = (t, it) => {
  if (it.at === null || it.at === undefined) return 1;
  let k = clamp(pop(t, it.at, it.f || 2.4, 7), 0, 1.15);
  if (it.out !== null && it.out !== undefined) k *= 1 - eio(prog(t, it.out, it.out + 0.25));
  return k;
};

function drawItem(it, t, T, sh) {
  const k = kOf(t, it);
  if (k <= 0.01 && it.kind !== 'guy') return '';
  switch (it.kind) {
    case 'guy': {
      if (!it._S) prepGuy(it);
      const ent = it.at === undefined || it.at === null ? 1 : clamp(pop(t, it.at, 2.4, 7), 0, 1.12);
      if (ent <= 0.01) return '';
      const { R, o } = rigGuy(it, t), G = guyXform(it, R, ent);
      let s = shadow(G.X, R.Y + 4, 46 * it.sc * ent * (1 - Math.min(0.5, R.lift / 320)));
      if (FX) {
        for (const td of it._dust) if (t >= td && t < td + 0.5) s += dust(rigCore(it, td).X, R.Y, t, td, it.sc * 0.9);
        if (R.mv && R.mv[6] === 'run') s += speedStreaks(G.X, R.Y, t, it.sc * 0.8, R.X > R.mv[2] ? 1 : -1);
      }
      s += `<g transform="${G.tf}">${guy(o)}</g>`;
      if (FX) for (const tc of it._conf) if (t >= tc && t < tc + 1.8) s += confetti(G.X, R.Y - 380 * it.sc, t, tc, Math.max(1, it.sc * 0.9), 26, Math.round(tc * 10));
      return s;
    }
    case 'label': return label(it.x, it.y, k, it.text, it.col, it.ink || INK, it.size);
    case 'stamp': return stamp(it.x, it.y, k, it.text, it.col, it.ang);
    case 'check': return check(it.x, it.y, k * it.sc, it.ok) + (FX && it.ok ? sparkleBurst(it.x, it.y, t, it.at, it.sc * 0.9, 7) : '');
    case 'pop': return popG(it.x, it.y, k, txt(0, 0, it.text, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 11) }), it.ang);
    case 'count': {
      const v = lerp(it.frm, it.to, eo(prog(t, it.at, it.end)));
      const s = it.fmt.replace('{}', Math.round(v).toLocaleString('en-US'));
      return popG(it.x, it.y, k, txt(0, 0, s, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 10) })) + (FX && it.end ? sparkleBurst(it.x, it.y - it.size * 0.35, t, it.end, it.size / 110, 9) : '');
    }
    case 'sparkle': return sparkleBurst(it.x, it.y, t, it.at, it.sc, it.n || 9, it.col || '#fff6a8');
    case 'shake': return '';
    case 'art': {
      let s = it.fn(t, k, T);
      if (it.cel) s = cel(s, it.cel === true ? 10 : it.cel * 9);
      if (it.attach !== undefined && it.attach !== null && sh) { const g = sh.items[it.attach]; if (g && g.kind === 'guy') { if (!g._S) prepGuy(g); s = `<g transform="${attachXform(g, t)}">${s}</g>`; } }
      if (it.reveal && it.at !== null && it.at !== undefined && FX) s += sparkleBurst(it.reveal[0], it.reveal[1], t, it.at, it.reveal[2] || 1, 9);
      return s;
    }
  }
  return '';
}

// ---- camera: base drift (cam), moves (push / pull / pan / follow), punch-in after cuts; parallax per bg layer
function guyIndex(sh, idx) { if (idx !== undefined && idx !== null && sh.items[idx]) return idx; return sh.items.findIndex((x) => x.kind === 'guy'); }
function camState(i, t) {
  const sh = SPEC.shots[i], t0 = sh.t0, t1 = i + 1 < SPEC.shots.length ? SPEC.shots[i + 1].t0 : T.END;
  const u = prog(t, t0, t1);
  let z = lerp(sh.cam[0], sh.cam[1], eio(u)), px = 0, py = 0;
  const fx = sh.focus[0], fy = sh.focus[1], mv = sh.move;
  if (mv) {
    const kind = Array.isArray(mv) ? mv[0] : mv, a = Array.isArray(mv) ? mv : [mv];
    if (kind === 'push') z = lerp(1.0, a[1] || 1.22, eio(u));
    else if (kind === 'pull') z = lerp(a[1] || 1.28, 1.0, eo(u));
    else if (kind === 'pan') { const dx = a[1] === undefined ? 420 : a[1], dy = a[2] || 0; px = lerp(-dx / 2, dx / 2, eio(u)); py = lerp(-dy / 2, dy / 2, eio(u)); z = a[3] || 1.0; }
    else if (kind === 'follow') {
      const gi = guyIndex(sh, a[1]), g = sh.items[gi];
      if (g) { if (!g._S) prepGuy(g); let sx = 0; for (let j = 0; j < 8; j++) sx += rigCore(g, t - j * 0.045).X; px = clamp(sx / 8 - fx, -1100, 1100); }
      z = a[2] || 1.08;
    }
  }
  if (sh.tr !== 'match' && sh.tr !== 'zoom') z *= 1 + 0.07 * (1 - eo(prog(t, t0 + (i ? 0.18 : 0), t0 + (i ? 0.55 : 0.4))));
  return { z, px, py, fx, fy };
}
const camT = (C, f) => `translate(${C.fx} ${C.fy}) scale(${n(1 + (C.z - 1) * f)}) translate(${n(-C.fx - C.px * f)} ${n(-C.fy - C.py * f)})`;
function drawShot(i, t, extra) {
  const sh = SPEC.shots[i], C = camState(i, t);
  let s = '';
  for (const [f, svg] of bgLayers(sh.bg, t)) s += f === 0 ? svg : `<g transform="${camT(C, f)}">${svg}</g>`;
  // headline labels are screen graphics: they ride only 30% of the camera move so they never leave the frame
  let body = '', ui = '';
  for (const it of sh.items) { const d = drawItem(it, t, T, sh); if (it.kind === 'label') ui += d; else body += d; }
  const bo = +(window.STYLE.boil || 0);
  if (bo > 0) body = boilSvg(body, Math.floor(t * 8) % 3, 1.1 * bo);   // only characters + props boil; the painted bg stays still
  s += `<g transform="${camT(C, 1)}">${body}</g>` + (ui ? `<g transform="${camT(C, 0.3)}">${ui}</g>` : '');
  return extra ? `<g transform="${extra}">${s}</g>` : s;
}

(function build() {
  for (const sh of SPEC.shots) for (const it of sh.items) if (it.kind === 'art') it.fn = new Function('t', 'k', 'T', 'return ' + it.code + ';');
  const TRD = { whip: 0.2, slide: 0.22, wipe: 0.34, zoom: 0.34, match: 0.45, cut: 0 };
  const master = (t) => {
    let i = 0;
    SPEC.shots.forEach((sh, j) => { if (t >= sh.t0) i = j; });
    if (i === 0) return drawShot(0, t);
    const sh = SPEC.shots[i], tr = sh.tr || 'whip', d = TRD[tr] === undefined ? 0.2 : TRD[tr];
    const u = d > 0 ? prog(t, sh.t0, sh.t0 + d) : 1;
    if (u >= 1) return drawShot(i, t);
    const e = eio(u), clip = (x) => `<g clip-path="url(#frameClip)">${x}</g>`;
    if (tr === 'slide') return `<g transform="translate(${n(-W * e)} 0)">${clip(drawShot(i - 1, t))}</g><g transform="translate(${n(W * (1 - e))} 0)">${clip(drawShot(i, t))}</g>`;
    if (tr === 'whip') {
      const b = Math.round(8 * Math.sin(Math.PI * u)), f = b > 0 ? ` filter="url(#whip${b})"` : '';
      return `<g${f}><g transform="translate(${n(-W * 1.15 * e)} 0)">${clip(drawShot(i - 1, t))}</g><g transform="translate(${n(W * 1.15 * (1 - e))} 0)">${clip(drawShot(i, t))}</g></g>`;
    }
    if (tr === 'wipe') {
      const xe = lerp(-420, W + 420, e), id = uid('wp');
      return drawShot(i - 1, t) + `<defs><clipPath id="${id}"><path d="M-700,-100 L${n(xe + 320)},-100 L${n(xe - 320)},${H + 100} L-700,${H + 100} Z"/></clipPath></defs><g clip-path="url(#${id})">${clip(drawShot(i, t))}</g>` +
        `<path d="M${n(xe + 320)},-100 L${n(xe - 320)},${H + 100}" stroke="${INK}" stroke-width="46"/><path d="M${n(xe + 320)},-100 L${n(xe - 320)},${H + 100}" stroke="#ffd23f" stroke-width="30"/>`;
    }
    if (tr === 'zoom') {
      const p = SPEC.shots[i - 1].focus, q = sh.focus;
      if (u < 0.5) { const z = 1 + 2.4 * ei(u * 2); return `<g transform="translate(${p[0]} ${p[1]}) scale(${n(z)}) translate(${-p[0]} ${-p[1]})">${drawShot(i - 1, t)}</g><rect width="${W}" height="${H}" fill="#fff" opacity="${n(0.85 * ei(u * 2))}"/>`; }
      const z = lerp(1.7, 1, eo((u - 0.5) * 2));
      return `<g transform="translate(${q[0]} ${q[1]}) scale(${n(z)}) translate(${-q[0]} ${-q[1]})">${drawShot(i, t)}</g><rect width="${W}" height="${H}" fill="#fff" opacity="${n(0.85 * (1 - eo((u - 0.5) * 2)))}"/>`;
    }
    if (tr === 'match') {
      // the new subject starts where the old one was (same screen spot + size), then settles into its own framing
      const p = SPEC.shots[i - 1].focus, q = sh.focus, A = camState(i - 1, sh.t0), Bc = camState(i, sh.t0), v = 1 - eo(u);
      const s = lerp(1, A.z / Bc.z, v);
      return drawShot(i, t, `translate(${n(lerp(q[0], p[0], v))} ${n(lerp(q[1], p[1], v))}) scale(${n(s)}) translate(${-q[0]} ${-q[1]})`);
    }
    return drawShot(i, t);
  };
  window.SHOTS = [[0, master]];
  window.HITS = SPEC.hits;
  window.BG = SPEC.bg || '#ffffff';
})();
