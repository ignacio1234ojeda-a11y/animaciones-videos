// Spec runtime: turns window.SPEC (written by make.py) into SHOTS/HITS. Generic items, auto camera, slide transitions,
// talking host (mouth from voice envelope), blinking + breathing.

// ---- talking mouth + blink on top of any guy face
const _faceBase = guyFace;
guyFace = function (o) {
  let s = _faceBase(o);
  const lx = o.lookX || 0, ly = o.lookY || 0, skin = o.skin || WHITE;
  const mx = -17 + lx * 0.6, my = -262 + ly * 0.4;
  const k = o.talk || 0;
  if (k > 0.06 && o.expr !== 'laugh' && o.expr !== 'cry' && o.expr !== 'yawn') {
    s += `<ellipse cx="${n(mx)}" cy="${n(my + 1)}" rx="24" ry="15" fill="${skin}"/>`;
    s += `<path d="M${n(mx - 10 - 6 * k)},${n(my - 3)} Q${n(mx)},${n(my - 6)} ${n(mx + 10 + 6 * k)},${n(my - 3)} Q${n(mx + 8 + 4 * k)},${n(my + 4 + 16 * k)} ${n(mx)},${n(my + 5 + 17 * k)} Q${n(mx - 8 - 4 * k)},${n(my + 4 + 16 * k)} ${n(mx - 10 - 6 * k)},${n(my - 3)} Z" fill="${INK}"/>`;
    s += `<ellipse cx="${n(mx + 1)}" cy="${n(my + 2 + 13 * k)}" rx="${n(4 + 4 * k)}" ry="${n(1.5 + 3 * k)}" fill="${SKIN_PINK}"/>`;
  }
  if (o.blink && o.expr !== 'laugh' && o.expr !== 'cry') {
    for (const ex of [-34 + lx, 0 + lx]) s += `<ellipse cx="${n(ex)}" cy="${n(-306 + ly)}" rx="15" ry="19" fill="${skin}"/><path d="M${n(ex - 11)},${n(-304 + ly)} Q${n(ex)},${n(-297 + ly)} ${n(ex + 11)},${n(-304 + ly)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return s;
};

const POSES = {
  rest: () => ({}),
  point: (t) => ({ armR: [110, -330], pointR: -60 }),
  pointL: (t) => ({ armL: [-110, -250], pointL: -120 }),
  pointR: (t) => ({ armR: [120, -230], pointR: -40 }),
  ears: (t) => ({ armL: [-40, -300], armR: [40, -300] }),
  shrug: (t) => ({ armL: [-110, -170], armR: [110, -170] }),
  think: (t) => ({ armR: [-12, -250], bendR: 30 }),
  wave: (t) => ({ armR: [120, -330 + 22 * Math.sin(t * 12)], pointR: -80 }),
  cheer: (t) => ({ armL: [-100, -360 + 10 * Math.sin(t * 9)], armR: [100, -360 - 10 * Math.sin(t * 9)] }),
  hips: (t) => ({ armL: [-60, -120], armR: [60, -120], bendL: -40, bendR: 40 }),
};
const envAt = (t) => { const E = window.ENV || []; const i = Math.round((t - 0.0) * 60); return i >= 0 && i < E.length ? E[i] : 0; };
const kOf = (t, it) => {
  if (it.at === null || it.at === undefined) return 1;
  let k = clamp(pop(t, it.at, it.f || 2.4, 7), 0, 1.15);
  if (it.out !== null && it.out !== undefined) k *= 1 - eio(prog(t, it.out, it.out + 0.25));
  return k;
};
const BGS = {
  studio: () => `<rect width="${W}" height="${H}" fill="url(#studio)"/><rect x="0" y="1480" width="${W}" height="440" fill="#c9b6f2"/><line x1="0" y1="1480" x2="${W}" y2="1480" stroke="${INK}" stroke-width="6"/>`,
  day: () => dayBg(),
  night: (t) => nightBg(0),
  space: (t) => {
    let s = `<rect width="${W}" height="${H}" fill="#151a33"/>`;
    for (let i = 0; i < 60; i++) { const r = rng(i * 13 + 5); s += `<circle cx="${n(r() * W)}" cy="${n(r() * H)}" r="${n(2 + r() * 4)}" fill="#fff" opacity="${n(0.3 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)))}"/>`; }
    return s;
  },
  paper: () => { let s = `<rect width="${W}" height="${H}" fill="#fff8e6"/>`; for (let y = 120; y < H; y += 90) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ecdfc0" stroke-width="4"/>`; return s; },
};
const bgOf = (b, t) => BGS[b] ? BGS[b](t) : `<rect width="${W}" height="${H}" fill="${b}"/>`;

function drawItem(it, t, T) {
  const k = kOf(t, it);
  if (k <= 0.01 && it.kind !== 'guy') return '';
  switch (it.kind) {
    case 'guy': {
      let st = { expr: it.expr, pose: it.pose || 'rest', look: it.look || [0, -4], x: it.x, y: it.y, sc: it.sc, talk: it.talk, body: it.body, legs: it.legs };
      let lastCh = -9;
      for (const [tc, c] of it.ch || []) if (t >= tc) { Object.assign(st, c); lastCh = tc; }
      const o = { expr: st.expr, t, lookX: st.look[0], lookY: st.look[1], body: st.body, legs: st.legs };
      Object.assign(o, POSES[st.pose] ? POSES[st.pose](t) : {});
      o.sy = 1 + 0.012 * Math.sin(t * 2.6 + st.x);
      o.lean = (o.lean || 0) + 1.5 * Math.sin(t * 1.3 + st.x);
      const since = t - lastCh;
      if (since >= 0 && since < 0.35) o.hop = -40 * Math.sin(Math.PI * since / 0.35);
      if (st.talk) o.talk = envAt(t);
      const bt = (t + st.x * 0.003) % 3.4;
      o.blink = bt > 3.25 && st.expr !== 'surprised';
      const ent = it.at === undefined || it.at === null ? 1 : clamp(pop(t, it.at, 2.4, 7), 0, 1.12);
      if (ent <= 0.01) return '';
      return shadow(st.x, st.y + 4, 46 * st.sc * ent) + `<g transform="translate(${n(st.x)} ${n(st.y)}) scale(${n(st.sc * ent)})">${guy(o)}</g>`;
    }
    case 'label': return label(it.x, it.y, k, it.text, it.col, it.ink || INK, it.size);
    case 'stamp': return stamp(it.x, it.y, k, it.text, it.col, it.ang);
    case 'check': return check(it.x, it.y, k * it.sc, it.ok);
    case 'pop': return popG(it.x, it.y, k, txt(0, 0, it.text, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 11) }), it.ang);
    case 'count': {
      const v = lerp(it.frm, it.to, eo(prog(t, it.at, it.end)));
      const s = it.fmt.replace('{}', Math.round(v).toLocaleString('en-US'));
      return popG(it.x, it.y, k, txt(0, 0, s, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 10) }));
    }
    case 'art': return it.fn(t, k, T);
  }
  return '';
}

function drawShot(i, t) {
  const sh = SPEC.shots[i];
  const t0 = sh.t0, t1 = i + 1 < SPEC.shots.length ? SPEC.shots[i + 1].t0 : T.END;
  let body = '';
  for (const it of sh.items) body += drawItem(it, t, T);
  const z = lerp(sh.cam[0], sh.cam[1], eio(prog(t, t0, t1)));
  return bgOf(sh.bg, t) + `<g transform="translate(${sh.focus[0]} ${sh.focus[1]}) scale(${n(z)}) translate(${-sh.focus[0]} ${-sh.focus[1]})">${body}</g>`;
}

(function build() {
  for (const sh of SPEC.shots) for (const it of sh.items) if (it.kind === 'art') it.fn = new Function('t', 'k', 'T', 'return ' + it.code + ';');
  const TR = 0.22;
  const master = (t) => {
    let i = 0;
    SPEC.shots.forEach((sh, j) => { if (t >= sh.t0) i = j; });
    const u = i > 0 ? prog(t, SPEC.shots[i].t0, SPEC.shots[i].t0 + TR) : 1;
    if (u >= 1) return drawShot(i, t);
    const e = eio(u);
    return `<g transform="translate(${n(-W * e)} 0)">${drawShot(i - 1, t)}</g><g transform="translate(${n(W * (1 - e))} 0)">${drawShot(i, t)}</g>`;
  };
  window.SHOTS = [[0, master]];
  window.HITS = SPEC.hits;
  window.BG = SPEC.bg || '#ffffff';
})();
