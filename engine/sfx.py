"""Cartoon sound-effects library + mixer (full library, v3).

python3 sfx.py OUT.wav --vo vo/take1.wav [--vo-at 0.1] [--cues cues.py]
"""
import re, subprocess, sys, wave
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent
rs = np.random.default_rng(7)


def timing():
    js = (ROOT / "scene" / "timing.js").read_text()
    return {k: float(v) for k, v in re.findall(r"(\w+):\s*([\d.]+)", js)}


def tt(d):
    return np.arange(int(d * SR)) / SR


def env(t, a=0.002, tau=0.05):
    return np.minimum(1, t / a) * np.exp(-t / tau)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, btype="high", fs=SR, output="sos"), x)


def sweep(f0, f1, d):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR), t


def norm(x, db=-1):
    m = np.max(np.abs(x)) or 1
    return x / m * 10 ** (db / 20)


def beep(f=1200, d=0.12):
    t = tt(d)
    return norm(np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.01))


def boing(d=0.8, f0=190):
    t = tt(d)
    f = f0 * (1 + 0.6 * (1 - np.exp(-6 * t))) + 45 * np.sin(2 * np.pi * 11 * t) * np.exp(-2 * t)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-3.2 * t) * np.minimum(1, t / 0.004))


def bonk_like():
    s, t = sweep(420, 140, 0.3)
    return norm(s * env(t, 0.002, 0.1))


def clack():
    t = tt(0.15)
    x = sum(a * np.sin(2 * np.pi * f * t) * env(t, 0.0005, tau) for f, a, tau in [(380, 1, 0.04), (690, 0.7, 0.025), (1250, 0.4, 0.012)])
    x += 0.4 * bp(rs.standard_normal(len(t)), 800, 4000) * env(t, 0.0004, 0.006)
    return norm(x)


def deflate(d=0.7):
    s_, t = sweep(500, 120, d)
    return norm((0.5 * s_ + bp(rs.standard_normal(len(t)), 600, 2500)) * np.minimum(1, t / 0.02) * (1 - t / d))


def ding(f=1568, d=1.0):
    t = tt(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (0.35 / m)) for m, a in [(1, 1), (2.76, 0.4), (5.4, 0.2)])
    return norm(x * np.minimum(1, t / 0.002))


def freeze_snd(d=0.7):
    t = tt(d)
    crackle = hp(rs.standard_normal(len(t)), 2500) * (rs.random(len(t)) < 0.05)
    s_, _ = sweep(3000, 900, d)
    return norm(crackle * np.exp(-t / 0.4) + 0.4 * s_ * np.exp(-t / 0.25))


def gush(d=0.9):
    t = tt(d)
    return norm(bp(rs.standard_normal(len(t)), 300, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.2))


def heartbeat(n_=4, gap=0.33):
    out = np.zeros(int((n_ * gap + 0.3) * SR))
    for i in range(n_):
        for j, g in enumerate([1, 0.7]):
            t = tt(0.12)
            x = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.04) * g
            p = int((i * gap + j * 0.12) * SR); out[p:p + len(x)] += x
    return norm(lp(out, 300))


def hiss(d=0.8):
    t = tt(d)
    return norm(bp(rs.standard_normal(len(t)), 3000, 9000) * np.minimum(1, t / 0.08) * np.exp(-t / (d * 0.5)))


def knock(scale=1.0):
    t = tt(0.12)
    x = sum(a * np.sin(2 * np.pi * f * scale * t) * env(t, 0.0005, tau) for f, a, tau in [(820, 1, 0.018), (1460, 0.6, 0.012), (2350, 0.35, 0.008), (430, 0.5, 0.03)])
    x += 0.5 * hp(rs.standard_normal(len(t)), 2500) * env(t, 0.0003, 0.004)
    return norm(x)


def popsnd(f0=500, f1=1300, d=0.07):
    s, t = sweep(f0, f1, d)
    return norm(s * np.sin(np.pi * t / d))


def tick():
    t = tt(0.01)
    return norm(hp(rs.standard_normal(len(t)), 3000) * env(t, 0.0002, 0.0015))


def whoosh(d=0.5, lo=300, hi=3000, peak=0.6):
    t = tt(d)
    e = np.where(t < d * peak, (t / (d * peak)) ** 2, ((d - t) / (d * (1 - peak))) ** 1.5)
    return norm(bp(rs.standard_normal(len(t)), lo, hi) * e)


def xray(d=0.7):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t) / k for k, f in enumerate([120, 240, 360, 480], 1))
    x *= (0.6 + 0.4 * np.sin(2 * np.pi * 8 * t)) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.2)
    return norm(x)


def alarm_soft():
    out = np.zeros(int(0.4 * SR))
    for i, f in enumerate([880, 660]):
        t = tt(0.15)
        b = np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.005) * np.minimum(1, (0.15 - t) / 0.01)
        p = int(i * 0.18 * SR); out[p:p + len(b)] += b
    return norm(out)


def blub(f0=500):
    s_, t = sweep(f0, f0 * 2.2, 0.06)
    return norm(s_ * np.sin(np.pi * t / 0.06))


def boop():
    s, t = sweep(260, 900, 0.09)
    x = s * np.sin(np.pi * t / 0.09)
    k = knock(0.7)
    y = np.zeros(max(len(x), len(k))); y[:len(x)] += x; y[:len(k)] += 0.6 * k
    return norm(y)


def brr(d=0.8):
    t = tt(d)
    x = np.sin(2 * np.pi * 180 * t) * (np.sin(2 * np.pi * 28 * t) > 0)
    return norm(lp(x, 1500) * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.1))


def chomp():
    out = np.zeros(int(0.45 * SR))
    for i in range(3):
        k = knock(0.6 + 0.1 * i)[: int(0.08 * SR)]
        p = int(i * 0.14 * SR); out[p:p + len(k)] += k
    return norm(out)


def chop():
    t = tt(0.08)
    x = sum(a * np.sin(2 * np.pi * f * t) * env(t, 0.0005, tau) for f, a, tau in [(520, 1, 0.02), (1100, 0.5, 0.01)])
    x += 0.6 * bp(rs.standard_normal(len(t)), 1500, 6000) * env(t, 0.0003, 0.006)
    return norm(x)


def clock_spin(d):
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d - 0.02:
        tk = tick(); p = int(k * SR); out[p:p + len(tk)] += tk[: len(out) - p]
        k += max(0.035, 0.12 - 0.08 * (k / d))
    return norm(out)


def crack():
    out = np.zeros(int(0.2 * SR))
    for i, (f, g) in enumerate([(2400, 1.0), (1700, 0.7)]):
        t = tt(0.05)
        x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) + 0.6 * hp(rs.standard_normal(len(t)), 2500) * np.exp(-t / 0.002)) * g
        p = int(i * 0.035 * SR); out[p:p + len(x)] += x
    k = knock(1.3); out[:len(k)] += 0.5 * k[:len(out)]
    return norm(out)


def cricket(d=0.9):
    out = np.zeros(int(d * SR))
    for k in range(3):
        t = tt(0.16)
        c = np.sin(2 * np.pi * 4300 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * t))) * np.sin(np.pi * t / 0.16)
        p = int(k * 0.3 * SR); out[p:p + len(c)] += c
    return norm(lp(out, 7000))


def drip():
    s, t = sweep(900, 2200, 0.05)
    return norm(s * np.sin(np.pi * t / 0.05))


def engine(d):
    t = tt(d)
    f = 70 + 50 * np.minimum(1, t / 0.5)
    ph = np.cumsum(f) / SR
    x = (2 * (ph % 1) - 1) * (0.7 + 0.3 * np.sin(2 * np.pi * 18 * t))
    return norm(lp(x, 900) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.2))


def fizz(d=1.0):
    t = tt(d)
    x = hp(rs.standard_normal(len(t)), 4000) * (rs.random(len(t)) < 0.08)
    return norm(lp(x, 12000) * np.minimum(1, t / 0.05) * np.exp(-t / (d * 0.6)))


def flip():
    t = tt(0.04)
    return norm(bp(rs.standard_normal(len(t)), 1500, 5000) * np.sin(np.pi * t / 0.04))


def flutter(d=0.35):
    t = tt(d)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)
    return norm(bp(rs.standard_normal(len(t)), 1500, 6000) * am * np.sin(np.pi * t / d) ** 2)


def ha(f0=230, n=4, gap=0.15):
    out = np.zeros(int((n * gap + 0.2) * SR))
    for i in range(n):
        t = tt(0.11)
        f = f0 * (1 - 0.05 * i) * (1 + 0.15 * np.exp(-30 * t))
        ph = np.cumsum(f) / SR
        saw = 2 * (ph % 1) - 1
        v = bp(saw, 600, 900) + 0.7 * bp(saw, 1100, 1400) + 0.3 * bp(rs.standard_normal(len(t)), 2000, 5000)
        v *= np.minimum(1, t / 0.01) * np.exp(-t / 0.05)
        p = int(i * gap * SR); out[p:p + len(v)] += v
    return norm(out)


def knobdown(d=0.45):
    out = np.zeros(int(d * SR))
    for i in range(9):
        k = tick() * (1 - i * 0.07)
        p = int(i * d / 9 * SR); out[p:p + len(k)] += k
    s, t = sweep(700, 160, d)
    return norm(out + 0.35 * s * (1 - t / d))


def lever_click():
    c = clack(); k = tick()
    out = np.zeros(len(c)); out += c; out[:len(k)] += 0.6 * k
    return norm(out)


def mri_hum(d):
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.3 + np.sin(2 * np.pi * 220 * t) * 0.5
    x *= (0.5 + 0.5 * (np.sin(2 * np.pi * 4 * t) > 0)) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.1)
    return norm(lp(x, 1500))


def pillow():
    t = tt(0.25)
    return norm(lp(rs.standard_normal(len(t)), 260) * env(t, 0.004, 0.06))


def rain(d):
    t = tt(d)
    return norm(bp(rs.standard_normal(len(t)), 2000, 9000) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t)) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2))


def servo(d=0.45, up=True):
    t = tt(d)
    f = (380 if up else 520) * (1.5 if up else 0.7) ** (t / d)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return norm(lp(saw, 2200) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05))


def shatter():
    out = np.zeros(int(0.4 * SR))
    for i in range(6):
        k = ding(2500 + 400 * i, 0.2)[: int(0.2 * SR)] * (0.6 - 0.08 * i)
        p = int(i * 0.03 * SR); out[p:p + len(k)] += k
    c = clack(); out[:len(c)] += c
    return norm(out)


def skid(d=0.8):
    t = tt(d)
    f = 1500 + 200 * np.sin(2 * np.pi * 7 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(rs.standard_normal(len(t)), 1200, 4000)
    return norm(x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.1))


def skid_short():
    t = tt(0.5)
    f = 1500 + 200 * np.sin(2 * np.pi * 7 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(rs.standard_normal(len(t)), 1200, 4000)
    return norm(x * np.minimum(1, t / 0.03) * np.minimum(1, (0.5 - t) / 0.1))


def slurp(d=0.6):
    t = tt(d)
    f = 300 + 500 * t / d + 80 * np.sin(2 * np.pi * 14 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(rs.standard_normal(len(t)), 800, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t))
    return norm(x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.1))


def snip():
    out = np.zeros(int(0.16 * SR))
    for i in range(2):
        x = hp(rs.standard_normal(int(0.03 * SR)), 3000) * np.exp(-tt(0.03) / 0.006)
        p = int(i * 0.07 * SR); out[p:p + len(x)] += x
    c = clack(); out[:len(c)] += 0.5 * c[:len(out)]
    return norm(out)


def sob(d=0.9):
    t = tt(d)
    f = 330 + 60 * np.sin(2 * np.pi * 5 * t) - 80 * t / d
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    v = bp(saw, 500, 1100) + 0.5 * bp(saw, 1300, 1900)
    return norm(v * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.15))


def splash(d=0.5):
    t = tt(d)
    return norm(bp(rs.standard_normal(len(t)), 500, 6000) * env(t, 0.004, 0.09) + 0.4 * lp(rs.standard_normal(len(t)), 400) * env(t, 0.003, 0.05))


def squish(d=0.6):
    t = tt(d)
    f = 220 * (0.5) ** (t / d) + 30 * np.sin(2 * np.pi * 18 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.02) * (1 - t / d) + 0.3 * lp(rs.standard_normal(len(t)), 600) * (1 - t / d)
    return norm(x)


def tapeslow(d=0.8):
    s, t = sweep(700, 70, d)
    x = s * np.minimum(1, t / 0.01) * (1 - t / d) + 0.3 * lp(rs.standard_normal(len(t)), 900) * (1 - t / d)
    return norm(x)


def violin(d=1.0):
    t = tt(d)
    out = np.zeros(len(t))
    for f0, st in [(659, 0), (587, 0.33), (523, 0.66)]:
        m = (t >= st) & (t < st + 0.36)
        tt_ = t[m] - st
        f = f0 * (1 + 0.012 * np.sin(2 * np.pi * 6 * tt_))
        ph = np.cumsum(f) / SR
        out[m] += (2 * (ph % 1) - 1) * np.minimum(1, tt_ / 0.05) * np.minimum(1, (0.36 - tt_) / 0.05)
    return norm(lp(out, 3500))


def zap(d=0.5):
    t = tt(d)
    f = 400 + 300 * np.sin(2 * np.pi * 30 * t)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return norm(lp(sq, 3000) * np.minimum(1, t / 0.01) * np.exp(-t / 0.2))


def yawn_snd(d=1.0, f0=170):
    # cartoon "haaaawn": breathy formant glide up then down, under the voice
    t = tt(d)
    u = t / d
    f = f0 * (1 + 0.5 * np.sin(np.pi * np.minimum(1, u * 1.3)) - 0.25 * u)
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    v = bp(saw, 500, 1000) + 0.6 * bp(saw, 1000, 1600) + 0.5 * bp(rs.standard_normal(len(t)), 600, 3000)
    e = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.3)
    return norm(lp(v, 3500) * e)


def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def main():
    out = sys.argv[1]
    opt = {sys.argv[i]: sys.argv[i + 1] for i in range(2, len(sys.argv), 2)}
    T = timing()
    ns = dict(globals())
    exec(compile(Path(opt.get("--cues", ROOT / "cues.py")).read_text(), "cues.py", "exec"), ns)
    mix = np.zeros(int((T["END"] + 0.5) * SR))
    for at, snd, db in ns["cues"](T):
        p = int(at * SR)
        if p >= len(mix) or p < 0: continue
        seg = snd[: len(mix) - p] * 10 ** (db / 20)
        mix[p:p + len(seg)] += seg
    if "--vo" in opt:
        vo = load_audio(opt["--vo"])
        p = int(float(opt.get("--vo-at", 0.1)) * SR)
        seg = vo[: max(0, len(mix) - p)]
        mix[p:p + len(seg)] += seg
    mix = mix[: int(T["END"] * SR)]
    fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
    peak = np.max(np.abs(mix))
    if peak > 10 ** (-3 / 20):
        mix *= 10 ** (-3 / 20) / peak
    print(f"peak {20 * np.log10(np.max(np.abs(mix)) + 1e-9):.1f} dBFS, {len(mix) / SR:.2f}s")
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
