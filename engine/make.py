"""One-command Short builder (spec mode, engine v4).

python3 make.py spec.py            -> voice (if script changed) + captions + scene files + cues + QA sheet qa/sheet.png
python3 make.py spec.py --video X  -> same, then mix (voice + music bed + sfx) + native 1080p60 render -> out/X-1080p.mp4 (--hq = old 4K path)

spec.py holds SCRIPT = [...lines...] and SHOTS = [shot(...), ...] built with the helpers below.
Optional spec globals: MUSIC = 'curious' | 'spooky' | 'upbeat' | None (default 'curious'),
STYLE = dict(cel=1, grain=1, boil=0, fx=1).
Anchors ('at', shot start, ch keys) are words of the script: 'Sun' = next word starting with "sun" after the shot start,
'Sun#2' = 2nd one, 'fire+0.3' = offset, a number = seconds. Every item pops in at its anchor with an automatic sound.
"""
import hashlib, json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
OFF = 0.1
V = "aeiouæɑɐəɛɜɪʊʌɔAIOWYᵻi"
VOICE = "am_puck"


# ------------------------------------------------------------------ spec helpers
def shot(at, *items, bg="studio", cam=(1.0, 1.05), focus=(540, 1000), sfx="auto", move=None, tr="whip"):
    """move: None | 'push' | 'pull' | ('push', z) | ('pull', z) | ('pan', dx[, dy]) | ('follow'[, item_index, zoom])
    tr (transition INTO this shot): 'whip' (default) | 'wipe' | 'zoom' | 'match' | 'slide' (old) | 'cut'"""
    items = [x for it in items for x in (it if isinstance(it, list) else [it])]
    return dict(at=at, items=items, bg=bg, cam=list(cam), focus=list(focus), sfx=sfx,
                move=list(move) if isinstance(move, tuple) else move, tr=tr)

def guy(x=540, y=1480, sc=2.2, expr="curious", talk=True, look=None, pose="rest", at=None, ch=(), body=None, legs=None,
        wear=None, glass=False, lookAt=None, flip=False):
    """poses: rest point pointL pointR ears shrug think wave cheer hips + walk run jump celebrate scared.
    ch=[(anchor, dict(expr=.., pose=.., x=.., y=.., gait='walk'|'run'|'jump', dur=.., lookAt=(x,y), look=(lx,ly), flip=..))]
    x/y in ch = walk there (run if pose='run', leap if pose='jump'). lookAt=(x,y) eyes+head follow a screen point."""
    return dict(kind="guy", x=x, y=y, sc=sc, expr=expr, talk=talk, look=list(look) if look else None, pose=pose, at=at, ch=list(ch),
                body=body, legs=legs, wear=wear, glass=glass, lookAt=list(lookAt) if lookAt else None, flip=flip)

def captain(x=540, y=1480, sc=2.0, expr="curious", pose="rest", glass=False, ch=(), **kw):
    """Captain Curious (channel host): navy coat with tails, captain cap, optional spyglass - all ride on his body."""
    return [guy(x=x, y=y, sc=sc, expr=expr, pose=pose, ch=list(ch), body="#1f3a68", legs="#fbfbf7", wear="captain", glass=glass, **kw)]

def label(text, at, x=540, y=260, col="#ffd23f", size=64, out=None, sfx="pop"):
    return dict(kind="label", text=text, at=at, x=x, y=y, col=col, size=size, out=out, sfx=sfx)

def stamp(text, at, x=540, y=380, col="#e8413a", ang=-8, out=None, sfx="clack"):
    return dict(kind="stamp", text=text, at=at, x=x, y=y, col=col, ang=ang, out=out, sfx=sfx, hit=(10, 7))

def check(at, ok=True, x=860, y=380, sc=1.0, out=None):
    return dict(kind="check", at=at, ok=ok, x=x, y=y, sc=sc, out=out, sfx="ding" if ok else "buzz")

def pop(text, at, x=540, y=700, size=110, col="#ffd23f", ang=-8, out=None, sfx="boom", hit=(12, 6)):
    return dict(kind="pop", text=text, at=at, x=x, y=y, size=size, col=col, ang=ang, out=out, sfx=sfx, hit=hit)

def count(at, to, end, frm=0, x=540, y=1400, fmt="{}", size=120, col="#ffd23f", out=None):
    return dict(kind="count", at=at, end=end, to=to, frm=frm, x=x, y=y, fmt=fmt, size=size, col=col, out=out, sfx="count")

def art(code, at=None, out=None, sfx="pop", hit=None, cel=None, reveal=None):
    """code: JS expression using t (seconds), k (pop scale 0..1.15) and T. Any lib.js function works.
    cel=True (or the prop's scale, e.g. 1.5): one-tone cel shadow + rim light (props only, not backgrounds).
    reveal=(x, y[, sc]): sparkle burst + sparkle sound at that point when the item pops in."""
    return dict(kind="art", code=code, at=at, out=out, sfx=(("sparkle" if reveal else sfx) if at is not None else None), hit=hit,
                cel=cel, reveal=list(reveal) if reveal else None)

def sparkle(at, x=540, y=900, sc=1.0, n=9, col="#fff6a8"):
    """twinkle burst + sparkle sound (reveals)"""
    return dict(kind="sparkle", at=at, x=x, y=y, sc=sc, n=n, col=col, sfx="sparkle")

def shake(at, amp=14, decay=7):
    """short camera shake + thud (impacts)"""
    return dict(kind="shake", at=at, sfx="thud", hit=(amp, decay))


# ------------------------------------------------------------------ word timings
def words_from(lines):
    W = []
    for li, L in enumerate(lines):
        ws = L["text"].split(); ph = L["phonemes"].split()
        if len(ph) != len(ws): ph = ws
        syl = [max(1, len(re.findall("[" + V + "]+", p))) for p in ph]
        tot = sum(syl); d = L["end"] - L["start"]; t = L["start"] + OFF
        for w, s in zip(ws, syl):
            W.append((re.sub(r"[^a-z0-9']", "", w.lower()), round(t, 3))); t += d * s / tot
    return W

def resolver(W):
    def res(a, after):
        if a is None: return None
        if isinstance(a, (int, float)): return float(a)
        m = re.match(r"^([^+#-]+)(?:#(\d+))?([+-][\d.]+)?$", a.strip())
        word, nth, off = m.group(1).lower(), int(m.group(2) or 1), float(m.group(3) or 0)
        c = 0
        for w, t in W:
            if t >= after - 0.05 and w.startswith(word):
                c += 1
                if c == nth: return round(t + off, 3)
        raise SystemExit(f"anchor not found: {a!r} after {after:.2f}s")
    return res


# ------------------------------------------------------------------ sounds
def snd(kind, i):
    lo = 450 + 90 * (i % 5)
    return {
        "pop": (f"popsnd({lo}, {lo * 2}, 0.07)", -24),
        "clack": ("clack()", -15),
        "ding": ("ding(1568, 0.8)", -22),
        "buzz": ("boing(0.4, 160)", -20),
        "boom": ("knock(1.2)", -15),
        "count": ("servo(1.0, True)", -26),
        "whoosh": ("whoosh(0.3, 600, 5000)", -30),
        "sparkle": ("sparkle()", -22),
        "thud": ("thud(1.0)", -14),
    }.get(kind, (kind, -22))

TRSFX = {"whip": ("whip()", -25), "slide": ("whoosh(0.3, 600, 5000)", -30), "wipe": ("swish()", -24),
         "zoom": ("zoomwhoosh()", -23), "match": ("softthump()", -26), "cut": None}


# ------------------------------------------------------------------ v4: wear / attachments for the guy
CAP_RE = re.compile(r"^\s*captainCoat\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)\s*\+\s*captainCap\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)\s*$")
GLASS_RE = re.compile(r"^\s*spyglass\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*-10\s*\)\s*$")
WEAR = ("captainCap", "captainCoat", "spyglass", "hornHelmet", "ironHelmet", "eyePatch", "bandana", "rangerHat", "bicorne",
        "crown", "elderBeard", "cane", "stubble")
CALL_RE = re.compile(r"(\w+)\(([^()]*)\)")

def _num(s):
    s = s.strip()
    if not re.fullmatch(r"[-+*/.\d\s()]+", s): return None
    try: return float(eval(s, {"__builtins__": {}}))
    except Exception: return None

def attach_wear(items):
    """Captain coat/cap/spyglass art -> native wear on the guy (rides his body). Other head-wear art drawn at the guy's
    (x, y, sc) -> attached: it follows his hops, leans, squash and flips."""
    guys = [it for it in items if it["kind"] == "guy"]
    if not guys: return items
    eq = lambda a, b: abs(float(a) - float(b)) < 0.02
    out = []
    for it in items:
        if it["kind"] == "art" and it.get("at") is None:
            m = CAP_RE.match(it["code"])
            if m:
                g = next((g for g in guys if all(eq(m.group(i), v) and eq(m.group(i + 3), v) for i, v in zip((1, 2, 3), (g["x"], g["y"], g["sc"])))), None)
                if g: g["wear"] = "captain"; continue
            m = GLASS_RE.match(it["code"])
            if m:
                g = next((g for g in guys if eq(m.group(1), g["x"] + 8 * g["sc"]) and eq(m.group(2), g["y"] - 306 * g["sc"]) and eq(m.group(3), 0.55 * g["sc"])), None)
                if g: g["glass"] = True; continue
        out.append(it)
    for it in out:
        if it["kind"] != "art": continue
        calls = CALL_RE.findall(it["code"])
        rest = CALL_RE.sub("", it["code"]).replace("+", "").strip()
        if not calls or rest or any(fn not in WEAR for fn, _ in calls): continue
        tgt = set()
        for fn, args in calls:
            a = args.split(",")
            ax, ay = (_num(a[0]), _num(a[1])) if len(a) >= 2 else (None, None)
            if ax is None or ay is None: tgt = None; break
            c = [g for g in guys if abs(ax - g["x"]) <= 40 * g["sc"] + 200 * (fn == "cane") * g["sc"] + 10 and g["y"] - 480 * g["sc"] <= ay <= g["y"] + 5]
            if not c: tgt = None; break
            tgt.add(id(min(c, key=lambda g: abs(ax - g["x"]))))
        if tgt and len(tgt) == 1:
            g = next(g for g in guys if id(g) == tgt.pop())
            it["attach"] = out.index(g); g["attachN"] = g.get("attachN", 0) + 1
    return out


# ------------------------------------------------------------------ v4: locomotion timeline for one guy
def plan_guy(it, cues, hits):
    """ch entries with x/y -> moves [t0, t1, x0, y0, x1, y1, gait, period]; facing flips; footstep/landing sounds."""
    x, y, sc = it["x"], it["y"], it["sc"]
    moves, faces = [], []
    for tc, c in it["ch"]:
        pose = c.get("pose")
        if pose == "scared" and "expr" not in c: c["expr"] = "surprised"
        if pose == "celebrate" and "expr" not in c: c["expr"] = "laugh"
        nx, ny = c.get("x", x), c.get("y", y)
        if (nx, ny) != (x, y):
            gait = c.get("gait") or ("run" if pose == "run" else "jump" if pose == "jump" else "walk")
            dist = ((nx - x) ** 2 + (ny - y) ** 2) ** 0.5
            unit = {"walk": 256, "run": 540, "jump": 760}[gait] * sc
            dur = float(c.get("dur") or min(4.0, max(0.35 if gait != "jump" else 0.45, dist / unit)))
            per = {"walk": 128, "run": 184, "jump": 1}[gait] * sc / max(1e-6, dist / dur)
            per = min(0.9, max(0.22, per)) if gait != "jump" else 1
            moves.append([round(tc, 3), round(tc + dur, 3), x, y, nx, ny, gait, round(per, 3)])
            if "flip" not in c and abs(nx - x) > 4: faces.append([round(tc - 0.02, 3), nx > x])
            if gait == "jump":
                cues.append((tc + dur, "thud(0.9)", -16)); hits.append([round(tc + dur, 3), 5, 9])
            else:
                k, tt = 0, tc + per / 4
                while tt < tc + dur - 0.04:
                    cues.append((tt, f"footstep({k % 2}, {1 if gait == 'run' else 0})", -27 if gait == "walk" else -24)); k += 1; tt += per / 2
            x, y = nx, ny
        elif pose == "jump":
            cues.append((tc + 0.62, "thud(0.9)", -16)); hits.append([round(tc + 0.62, 3), 5, 9])
        if pose == "scared": cues.append((tc, "yikes()", -22))
        if pose == "celebrate": cues.append((tc, "sparkle()", -22))
        if "flip" in c: faces.append([round(tc, 3), bool(c["flip"])])
    it["moves"] = moves; it["faces"] = faces


# ------------------------------------------------------------------ v4: viseme mouth from the voice (open + wide/round)
def mouth_track(a, sr):
    hop = sr // 60
    rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a), hop)])
    e = np.clip((rms / (np.percentile(rms, 95) + 1e-6)) ** 0.8, 0, 1)
    e = np.where(e < 0.12, 0, e)
    e = np.convolve(e, [0.25, 0.5, 0.25], "same")
    win = 1024; hann = np.hanning(win); f = np.fft.rfftfreq(win, 1 / sr)
    bl, bm, bh = (f >= 250) & (f < 900), (f >= 900) & (f < 2600), (f >= 3500) & (f < 8000)
    pad = np.concatenate([np.zeros(win), a, np.zeros(win)])
    wide, fric = np.zeros(len(e)), np.zeros(len(e))
    for j in range(len(e)):
        c = win + j * hop + hop // 2
        seg = pad[c - win // 2:c + win // 2] * hann
        p = np.abs(np.fft.rfft(seg)) ** 2
        lo, mi, hi = p[bl].sum(), p[bm].sum(), p[bh].sum()
        wide[j] = mi / (lo + mi + 1e-9); fric[j] = hi / (lo + mi + hi + 1e-9)
    v = e > 0.15
    if v.sum() > 10:
        med, sp = np.median(wide[v]), np.percentile(wide[v], 90) - np.percentile(wide[v], 10) + 1e-6
        w = np.clip((wide - med) / sp * 2.2, -1, 1)
    else:
        w = np.zeros(len(e))
    w = np.convolve(w, [0.25, 0.5, 0.25], "same")
    o = e.copy()
    fz = (fric > 0.55) & (e > 0.06)
    o[fz] = np.maximum(o[fz] * 0.5, 0.2); w[fz] = 0.85
    return e, [[round(float(a_), 2), round(float(b_), 2)] for a_, b_ in zip(o, w)]


def main():
    spec_path = Path(sys.argv[1]); opt = sys.argv[2:]
    ns = {k: v for k, v in globals().items() if k in ("shot", "guy", "captain", "label", "stamp", "check", "pop", "count", "art", "sparkle", "shake")}
    exec(spec_path.read_text(), ns)
    script = ns["SCRIPT"]
    music = ns.get("MUSIC", "curious")
    style = dict(cel=1, grain=1, boil=0, fx=1); style.update(ns.get("STYLE", {}) or {})
    vo = ROOT / "vo"; vo.mkdir(exist_ok=True)
    h = hashlib.md5("|".join(script).encode()).hexdigest()
    hf = vo / "script.md5"
    if not (vo / "take1.json").exists() or not hf.exists() or hf.read_text() != h:
        subprocess.run(["python3", "tts.py", "vo/take1.wav", VOICE, *script, "--gap", "0.4", "--speed", "0.95"], cwd=ROOT, check=True, capture_output=True)
        hf.write_text(h)
    subprocess.run(["python3", "captions.py", "vo/take1.json"], cwd=ROOT, check=True, capture_output=True)
    lines = json.load(open(vo / "take1.json"))
    W = words_from(lines); res = resolver(W)
    END = round(lines[-1]["end"] + OFF + 0.4, 2)  # short tail = cleaner loop back to the hook

    # mouth: open envelope (ENV, kept for old code) + viseme track (MOUTH), 60 fps on the video clock
    with wave.open(str(vo / "take1.wav")) as wf:
        sr = wf.getframerate(); a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)
        if wf.getnchannels() == 2: a = a[::2]
    e, mouth = mouth_track(a, sr)
    lead = int(OFF * 60)
    ENV = [0.0] * lead + [round(float(x), 2) for x in e]
    MOUTH = [[0, 0]] * lead + mouth

    shots, hits, cues, T = [], [], [], {}
    prev = 0.0
    for si, sh in enumerate(ns["SHOTS"]):
        t0 = 0.0 if si == 0 else round(res(sh["at"], prev) - 0.12, 3)
        prev = t0; T[f"cut{si}"] = t0
        tr = sh.get("tr") or "whip"
        if si > 0:
            if sh["sfx"] == "auto":
                s_ = TRSFX.get(tr, TRSFX["whip"])
                if s_: cues.append((t0 - (0.02 if tr == "match" else 0.06), *s_))
            elif sh["sfx"]:
                cues.append((t0 - 0.05, *snd(sh["sfx"], si)))
        items = []
        for ii, it in enumerate(sh["items"]):
            it = dict(it)
            for key in ("at", "out", "end"):
                if it.get(key) is not None: it[key] = res(it[key], t0)
            if it["kind"] == "guy":
                it["ch"] = [[res(a, t0), dict(c)] for a, c in it["ch"]]
                for tc, c in it["ch"]:
                    if c.get("expr") == "surprised" and c.get("pose") != "scared": cues.append((tc, "boop()", -26))
                    for kk in ("lookAt", "look"):
                        if isinstance(c.get(kk), tuple): c[kk] = list(c[kk])
                plan_guy(it, cues, hits)
            if it.get("at") is not None and it.get("sfx"):
                cues.append((it["at"], *snd(it["sfx"], ii)))
                if it["sfx"] == "count" and it.get("end"):
                    cues.append((it["end"], "ding(2093, 0.8)", -22)); cues.append((it["end"], "sparkle()", -27))
                if it["kind"] == "check" and it.get("ok"): cues.append((it["at"] + 0.03, "sparkle()", -28))
            if it.get("at") is not None and it.get("hit"):
                hits.append([it["at"], *it["hit"]])
                if it["kind"] != "shake": cues.append((it["at"], "thud(0.7)", -24))
            items.append(it)
        items = attach_wear(items)
        shots.append(dict(t0=t0, bg=sh["bg"], cam=sh["cam"], focus=sh["focus"], items=items, move=sh.get("move"), tr=tr))
    T["END"] = END

    sc = ROOT / "scene"
    (sc / "timing.js").write_text("window.T = {" + ", ".join(f"{k}: {v}" for k, v in T.items()) + "};\n")
    data = dict(shots=shots, hits=hits, bg="#ffffff", style=style)
    (sc / "shots.js").write_text("window.SPEC = " + json.dumps(data) + ";\nwindow.ENV = " + json.dumps(ENV) + ";\nwindow.MOUTH = " + json.dumps(MOUTH, separators=(",", ":")) + ";\n" + (sc / "spec_runtime.js").read_text())
    (ROOT / "cues.py").write_text("# auto-generated by make.py\ndef cues(T):\n    return [\n" + "".join(f"        ({t:.3f}, {c}, {db}),\n" for t, c, db in sorted(cues)) + "    ]\n")
    print("END", END, "| shots", " ".join(f"{s['t0']:.2f}" for s in shots), "| cues", len(cues), "| music", music)

    if "--video" in opt:
        name = opt[opt.index("--video") + 1]
        mix = ["python3", "sfx.py", "out/mix.wav", "--vo", "vo/take1.wav", "--vo-at", str(OFF)]
        if music and str(music).lower() not in ("none", "off", "0"): mix += ["--music", str(music)]
        subprocess.run(mix, cwd=ROOT, check=True)
        if "--hq" in opt:  # old path: 4K render + downscale (~4x slower, barely visible difference on phones)
            subprocess.run(["python3", "render.py", "video", f"out/{name}-4K.mp4", "--fps", "60", "--scale", "2", "--crf", "16", "--audio", "out/mix.wav"], cwd=ROOT, check=True)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"out/{name}-4K.mp4", "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "copy", f"out/{name}-1080p.mp4"], cwd=ROOT, check=True)
        else:  # default: native 1080p render, one encode
            subprocess.run(["python3", "render.py", "video", f"out/{name}-1080p.mp4", "--fps", "60", "--scale", "1", "--crf", "18", "--audio", "out/mix.wav"], cwd=ROOT, check=True)
        print("video out/" + name + "-1080p.mp4")
    else:
        ts = []
        for i, s in enumerate(shots):
            t1 = shots[i + 1]["t0"] if i + 1 < len(shots) else END
            ts.append(round(s["t0"] + 0.75 * (t1 - s["t0"]), 2))
        (ROOT / "qa").mkdir(exist_ok=True)
        subprocess.run(["python3", "render.py", "sheet", "qa/sheet.png", *map(str, ts)], cwd=ROOT, check=True)
        print("sheet qa/sheet.png @", ts)


if __name__ == "__main__":
    main()
