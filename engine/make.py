"""One-command Short builder (spec mode).

python3 make.py spec.py            -> voice (if script changed) + captions + scene files + cues + QA sheet qa/sheet.png
python3 make.py spec.py --video X  -> same, then mix + 4K render + out/X-1080p.mp4

spec.py holds SCRIPT = [...lines...] and SHOTS = [shot(...), ...] built with the helpers below.
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
def shot(at, *items, bg="studio", cam=(1.0, 1.05), focus=(540, 1000), sfx="whoosh"):
    return dict(at=at, items=list(items), bg=bg, cam=list(cam), focus=list(focus), sfx=sfx)

def guy(x=540, y=1480, sc=2.2, expr="curious", talk=True, look=(0, -4), pose="rest", at=None, ch=(), body=None, legs=None):
    return dict(kind="guy", x=x, y=y, sc=sc, expr=expr, talk=talk, look=list(look), pose=pose, at=at, ch=list(ch), body=body, legs=legs)

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

def art(code, at=None, out=None, sfx="pop", hit=None):
    """code: JS expression using t (seconds), k (pop scale 0..1.15) and T. Any lib.js function works."""
    return dict(kind="art", code=code, at=at, out=out, sfx=sfx if at is not None else None, hit=hit)


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
    }.get(kind, (kind, -22))


def main():
    spec_path = Path(sys.argv[1]); opt = sys.argv[2:]
    ns = {k: v for k, v in globals().items() if k in ("shot", "guy", "label", "stamp", "check", "pop", "count", "art")}
    exec(spec_path.read_text(), ns)
    script = ns["SCRIPT"]
    vo = ROOT / "vo"; vo.mkdir(exist_ok=True)
    h = hashlib.md5("|".join(script).encode()).hexdigest()
    hf = vo / "script.md5"
    if not (vo / "take1.json").exists() or not hf.exists() or hf.read_text() != h:
        subprocess.run(["python3", "tts.py", "vo/take1.wav", VOICE, *script, "--gap", "0.4", "--speed", "0.95"], cwd=ROOT, check=True, capture_output=True)
        hf.write_text(h)
    subprocess.run(["python3", "captions.py", "vo/take1.json"], cwd=ROOT, check=True, capture_output=True)
    lines = json.load(open(vo / "take1.json"))
    W = words_from(lines); res = resolver(W)
    END = round(lines[-1]["end"] + OFF + 0.7, 2)

    # mouth envelope, 60 fps, on the video clock
    with wave.open(str(vo / "take1.wav")) as wf:
        sr = wf.getframerate(); a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)
        if wf.getnchannels() == 2: a = a[::2]
    hop = sr // 60
    rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a), hop)])
    e = np.clip((rms / (np.percentile(rms, 95) + 1e-6)) ** 0.8, 0, 1)
    e = np.where(e < 0.12, 0, e)
    e = np.convolve(e, [0.25, 0.5, 0.25], "same")
    ENV = [0.0] * int(OFF * 60) + [round(float(x), 2) for x in e]

    shots, hits, cues, T = [], [], [], {}
    prev = 0.0
    for si, sh in enumerate(ns["SHOTS"]):
        t0 = 0.0 if si == 0 else round(res(sh["at"], prev) - 0.12, 3)
        prev = t0; T[f"cut{si}"] = t0
        if si > 0 and sh["sfx"]: cues.append((t0 - 0.05, *snd(sh["sfx"], si)))
        items = []
        for ii, it in enumerate(sh["items"]):
            it = dict(it)
            for key in ("at", "out", "end"):
                if it.get(key) is not None: it[key] = res(it[key], t0)
            if it["kind"] == "guy":
                it["ch"] = [[res(a, t0), c] for a, c in it["ch"]]
                for tc, c in it["ch"]:
                    if c.get("expr") == "surprised": cues.append((tc, "boop()", -26))
            if it.get("at") is not None and it.get("sfx"):
                cues.append((it["at"], *snd(it["sfx"], ii)))
                if it["sfx"] == "count" and it.get("end"): cues.append((it["end"], "ding(2093, 0.8)", -22))
            if it.get("at") is not None and it.get("hit"): hits.append([it["at"], *it["hit"]])
            items.append(it)
        shots.append(dict(t0=t0, bg=sh["bg"], cam=sh["cam"], focus=sh["focus"], items=items))
    T["END"] = END

    sc = ROOT / "scene"
    (sc / "timing.js").write_text("window.T = {" + ", ".join(f"{k}: {v}" for k, v in T.items()) + "};\n")
    data = dict(shots=shots, hits=hits, bg="#ffffff")
    (sc / "shots.js").write_text("window.SPEC = " + json.dumps(data) + ";\nwindow.ENV = " + json.dumps(ENV) + ";\n" + (sc / "spec_runtime.js").read_text())
    (ROOT / "cues.py").write_text("# auto-generated by make.py\ndef cues(T):\n    return [\n" + "".join(f"        ({t:.3f}, {c}, {db}),\n" for t, c, db in sorted(cues)) + "    ]\n")
    print("END", END, "| shots", " ".join(f"{s['t0']:.2f}" for s in shots), "| cues", len(cues))

    if "--video" in opt:
        name = opt[opt.index("--video") + 1]
        subprocess.run(["python3", "sfx.py", "out/mix.wav", "--vo", "vo/take1.wav", "--vo-at", str(OFF)], cwd=ROOT, check=True)
        subprocess.run(["python3", "render.py", "video", f"out/{name}-4K.mp4", "--fps", "60", "--scale", "2", "--crf", "16", "--audio", "out/mix.wav"], cwd=ROOT, check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"out/{name}-4K.mp4", "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "copy", f"out/{name}-1080p.mp4"], cwd=ROOT, check=True)
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
