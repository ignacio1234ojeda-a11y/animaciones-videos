"""Cartoon sound-effects library + mixer (full library, v3).

python3 sfx.py OUT.wav --vo vo/take1.wav [--vo-at 0.1] [--cues cues.py] [--music curious|spooky|upbeat] [--music-db -15]
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


# ====================================================== v4 (2026-11-27): auto SFX for transitions, steps, landings, reveals
def whip(d=0.22):
    """whip-pan whoosh: fast, bright, peaks early"""
    t = tt(d)
    x = bp(rs.standard_normal(len(t)), 900, 7000)
    s_, _ = sweep(2400, 700, d)
    e = np.where(t < d * 0.35, (t / (d * 0.35)) ** 2, ((d - t) / (d * 0.65)) ** 2.2)
    return norm((x + 0.15 * s_) * e)


def swish(d=0.36):
    """wipe: airy swish that sweeps up"""
    t = tt(d)
    x = rs.standard_normal(len(t))
    lo = hp(x, 600); hi = hp(x, 3000)
    mixr = t / d
    e = np.sin(np.pi * t / d) ** 1.5
    return norm(lp((1 - mixr) * lo + mixr * hi, 9000) * e)


def zoomwhoosh(d=0.34):
    """zoom-through: rising noise + tonal riser that pops at the end"""
    t = tt(d)
    s_, _ = sweep(300, 2600, d)
    x = bp(rs.standard_normal(len(t)), 500, 6000) * (t / d) ** 2 + 0.35 * s_ * (t / d) ** 3
    x *= np.minimum(1, (d - t) / 0.02)
    return norm(x)


def softthump():
    t = tt(0.18)
    return norm(np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.05) + 0.3 * lp(rs.standard_normal(len(t)), 500) * np.exp(-t / 0.02))


def thud(scale=1.0):
    """landing / impact: low body thump + dull noise"""
    d = 0.45
    t = tt(d)
    f = 45 + 75 * np.exp(-t / 0.05) * scale
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    x += 0.45 * lp(rs.standard_normal(len(t)), 350) * np.exp(-t / 0.04)
    x += 0.15 * bp(rs.standard_normal(len(t)), 800, 2500) * np.exp(-t / 0.01)
    return norm(x * np.minimum(1, t / 0.002))


def footstep(i=0, run=0):
    """soft cartoon footstep (tip-tap), i alternates the pitch"""
    d = 0.09
    t = tt(d)
    f0 = (520 if i % 2 else 440) * (1.15 if run else 1)
    x = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.012) + 0.5 * np.sin(2 * np.pi * f0 * 0.5 * t) * np.exp(-t / 0.02)
    x += 0.5 * bp(rs.standard_normal(len(t)), 1200, 5000) * np.exp(-t / 0.006)
    return norm(x * np.minimum(1, t / 0.001))


def sparkle(d=0.9):
    """reveal: rising glockenspiel arpeggio + shimmer"""
    out = np.zeros(int(d * SR))
    for i, f in enumerate([1568, 2093, 2637, 3136, 4186]):
        b = ding(f, 0.5)[: int(0.5 * SR)] * (0.9 - 0.1 * i)
        p = int(i * 0.045 * SR); out[p:p + len(b)] += b[: len(out) - p]
    t = tt(d)
    out += 0.25 * hp(rs.standard_normal(len(t)), 6000) * (rs.random(len(t)) < 0.1) * np.exp(-t / 0.35)
    return norm(out)


def yikes():
    """scared recoil: quick slide-whistle up + knock"""
    d = 0.32
    t = tt(d)
    f = 500 * (2.6 ** (t / d))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05)
    k = knock(1.4); x[:len(k)] += 0.5 * k
    return norm(x)


# ====================================================== v4: background music bed (generated, original, no samples)
MOODS = {
    # bpm, chords (root midi, quality), melody scale (semitones from key), key midi, style
    "curious": dict(bpm=104, key=65, chords=[(53, "M"), (50, "m"), (46, "M"), (48, "M")], scale=[0, 2, 4, 7, 9], style="pizz"),
    "spooky": dict(bpm=84, key=62, chords=[(50, "m"), (46, "M"), (43, "m"), (45, "M")], scale=[0, 2, 3, 7, 8], style="spooky"),
    "upbeat": dict(bpm=124, key=67, chords=[(55, "M"), (50, "M"), (52, "m"), (48, "M")], scale=[0, 2, 4, 7, 9], style="uke"),
}


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def chord_notes(root, q):
    return [root, root + (4 if q == "M" else 3), root + 7]


def _add(buf, x, at):
    p = int(at * SR)
    if p >= len(buf) or p < 0: return
    seg = x[: len(buf) - p]; buf[p:p + len(seg)] += seg


def i_pluck(f, d=0.3, bright=1.0):
    t = tt(d)
    x = np.zeros(len(t))
    for k in range(1, 9):
        if f * k > 11000: break
        x += (1 / k ** 1.15) * np.sin(2 * np.pi * f * k * t + 0.3 * k) * np.exp(-t * (7 + 5 * k * bright))
    x += 0.04 * bp(rs.standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.004)
    return x * np.minimum(1, t / 0.002) * np.minimum(1, (d - t) / 0.02)


def i_mallet(f, d=0.6):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.3) + 0.35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / 0.06) + 0.08 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t / 0.02)
    return x * np.minimum(1, t / 0.002) * np.minimum(1, (d - t) / 0.03)


def i_bell(f, d=1.2):
    t = tt(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (0.7 / m)) for m, a in [(1, 1), (2.0, 0.28), (3.0, 0.1), (4.2, 0.08)])
    return x * np.minimum(1, t / 0.003) * np.minimum(1, (d - t) / 0.05)


def i_bass(f, d=0.4):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return x * np.minimum(1, t / 0.006) * np.exp(-t / (d * 0.6)) * np.minimum(1, (d - t) / 0.03)


def i_pad(fs, d):
    t = tt(d)
    x = np.zeros(len(t))
    for f in fs:
        for det in (-0.004, 0.0, 0.005):
            ph = np.cumsum(np.full(len(t), f * (1 + det))) / SR
            x += 2 * (ph % 1) - 1
    x = lp(x, 900)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6)


def i_theremin(f0, f1, d):
    t = tt(d)
    f = f0 * (f1 / f0) ** np.clip((t - 0.2) / max(0.01, d - 0.6), 0, 1) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.35)


def d_kick():
    t = tt(0.25)
    f = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)


def d_shaker(acc=1.0):
    t = tt(0.07)
    return hp(rs.standard_normal(len(t)), 5000) * np.sin(np.pi * t / 0.07) ** 2 * acc


def d_clap():
    t = tt(0.16)
    x = bp(rs.standard_normal(len(t)), 900, 4000)
    e = sum(np.exp(-np.maximum(0, t - o) / 0.01) * (t >= o) for o in (0, 0.012, 0.024)) / 3 + 0.6 * np.exp(-t / 0.05)
    return x * e


def melody_plan(rng, scale, key, n_bars, chords, dens):
    """2-bar motif (rhythm + contour) repeated over the chord loop, snapped to chord tones on strong beats"""
    pool = sorted({key + o + 12 * k for o in scale for k in (0, 1)})
    rhythm = [i for i in range(16) if (i % 4 == 0 and rng.random() < 0.8) or (i % 4 != 0 and rng.random() < dens)]
    steps = [int(rng.choice([-2, -1, -1, 1, 1, 2, 0])) for _ in range(16)]
    notes = []
    for b0 in range(0, n_bars, 2):
        idx = len(pool) // 2 + int(rng.choice([-1, 0, 1]))
        var = b0 % 8 == 4
        for j, pos in enumerate(rhythm):
            bar = b0 + pos // 8
            if bar >= n_bars: break
            idx = int(np.clip(idx + (steps[j] if not var else -steps[j]), 0, len(pool) - 1))
            m = pool[idx]
            if pos % 4 == 0:
                ct = chord_notes(*chords[bar % len(chords)])
                cands = [c + 12 * k for c in ct for k in range(-1, 4)]
                m = min(cands, key=lambda c: abs(c - m) + (0 if c >= pool[0] else 99))
                idx = int(np.argmin([abs(p_ - m) for p_ in pool]))
            nxt = rhythm[j + 1] if j + 1 < len(rhythm) else 16
            notes.append((bar, pos % 8, m, max(1, min(4, nxt - pos))))
    return notes


def music(mood="curious", dur=30.0, seed=5):
    M = MOODS.get(mood, MOODS["curious"])
    rng = np.random.default_rng(seed)
    beat = 60.0 / M["bpm"]; bar = 4 * beat; e8 = beat / 2
    n_bars = int(np.ceil(dur / bar)) + 1
    L = int((dur + 2) * SR)
    pz, bs, md, dr, pd = (np.zeros(L) for _ in range(5))
    chords = M["chords"]; style = M["style"]
    for b in range(n_bars):
        root, q = chords[b % len(chords)]
        ct = chord_notes(root, q); t0 = b * bar
        if style == "pizz":
            pat = [ct[0], ct[2], ct[0] + 12, ct[2], ct[1] + 12, ct[2], ct[0] + 12, ct[2]]
            for i, m in enumerate(pat): _add(pz, i_pluck(mtof(m), 0.22, 1.2) * (1.0 if i % 2 == 0 else 0.7), t0 + i * e8)
            _add(bs, i_pluck(mtof(root - 12), 0.45, 0.4), t0); _add(bs, i_pluck(mtof(root - 5), 0.4, 0.4), t0 + 2 * beat)
            for i in range(8): _add(dr, d_shaker(1.0 if i % 2 else 0.55), t0 + i * e8)
        elif style == "spooky":
            _add(pd, i_pad([mtof(m - 12) for m in ct], bar + 0.6), t0)
            pat = [ct[0] - 12, ct[2] - 12, ct[0], ct[2] - 12]
            for i, m in enumerate(pat): _add(bs, i_pluck(mtof(m), 0.3, 0.5), t0 + i * beat)
            _add(dr, d_kick() * 0.7, t0)
            if b % 4 == 3: _add(md, 0.35 * i_theremin(mtof(ct[2] + 12), mtof(ct[0] + 12), bar * 0.95), t0 + 0.1)
        else:  # uke
            for pos in (0, 2, 3, 5, 6, 7):
                up = pos in (3, 5, 7)
                strum = [ct[0], ct[1], ct[2], ct[0] + 12][::(-1 if up else 1)]
                for k, m in enumerate(strum): _add(pz, i_pluck(mtof(m), 0.3, 1.4) * (0.75 if up else 1.0) * 0.55, t0 + pos * e8 + k * 0.012)
            for pos, m in ((0, root - 12), (3, root - 5), (4, root - 12), (6, root)): _add(bs, i_bass(mtof(m), 0.3), t0 + pos * e8)
            _add(dr, d_kick(), t0); _add(dr, d_kick() * 0.8, t0 + 2 * beat)
            _add(dr, d_clap() * 0.6, t0 + beat); _add(dr, d_clap() * 0.6, t0 + 3 * beat)
            for i in range(16): _add(dr, d_shaker(0.5 if i % 2 else 0.25), t0 + i * e8 / 2)
    dens = {"pizz": 0.32, "spooky": 0.18, "uke": 0.42}[style]
    for bar_i, p8, m, ln in melody_plan(rng, M["scale"], M["key"] + (12 if style == "spooky" else 0), n_bars, chords, dens):
        at = bar_i * bar + p8 * e8
        if style == "spooky": _add(md, 0.8 * i_bell(mtof(m), 1.4), at)
        else: _add(md, i_mallet(mtof(m), min(0.9, ln * e8 + 0.2)), at)
    parts = {"pizz": (pz, 0.55), "bass": (bs, 0.75), "mel": (md, 0.5), "drums": (dr, 0.32 if style == "uke" else 0.14), "pad": (pd, 0.3)}
    out = np.zeros(L)
    for x, g in parts.values():
        m_ = np.max(np.abs(x))
        if m_ > 0: out += x / m_ * g
    out = hp(lp(out, 7000), 60)
    out = out[: int(dur * SR)]
    f_in, f_out = int(0.05 * SR), int(0.35 * SR)
    out[:f_in] *= np.linspace(0, 1, f_in); out[-f_out:] *= np.linspace(1, 0, f_out)
    return out


def duck_gain(vo, n, at, depth_db=-9.0):
    """gain curve (len n) that dips music under the voice: fast attack, slow release"""
    hop = int(0.01 * SR)
    v = np.zeros(n); p = int(at * SR); seg = vo[: max(0, n - p)]; v[p:p + len(seg)] = np.abs(seg)
    fr = np.array([np.sqrt(np.mean(v[i:i + hop] ** 2)) for i in range(0, n, hop)])
    ref = np.percentile(fr[fr > 0], 90) if np.any(fr > 0) else 1
    x = np.clip(fr / (0.25 * ref + 1e-9), 0, 1)
    sm = np.zeros(len(x)); c = 0.0
    for i, xv in enumerate(x):
        a = 0.55 if xv > c else 0.035  # ~20 ms attack, ~350 ms release at 10 ms frames
        c += a * (xv - c); sm[i] = c
    g = 10 ** (depth_db * sm / 20)
    return np.interp(np.arange(n), np.arange(len(g)) * hop, g)


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
    vo = None
    if "--vo" in opt:
        vo = load_audio(opt["--vo"])
        p = int(float(opt.get("--vo-at", 0.1)) * SR)
        seg = vo[: max(0, len(mix) - p)]
        mix[p:p + len(seg)] += seg
    if opt.get("--music"):
        # v4: generated music bed, level set against the voice, auto-ducked under it
        bed = music(opt["--music"], len(mix) / SR, int(opt.get("--seed", 5)))
        bed = np.pad(bed, (0, max(0, len(mix) - len(bed))))[: len(mix)]
        if vo is not None:
            va = vo[np.abs(vo) > 1e-4]
            vr = np.sqrt(np.mean(va ** 2)) if len(va) else 0.1
            br = np.sqrt(np.mean(bed ** 2)) + 1e-9
            bed *= vr * 10 ** (float(opt.get("--music-db", -15)) / 20) / br
            bed *= duck_gain(vo, len(mix), float(opt.get("--vo-at", 0.1)))
        else:
            bed *= 0.12 / (np.sqrt(np.mean(bed ** 2)) + 1e-9)
        mix += bed
    mix = mix[: int(T["END"] * SR)]
    fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
    peak = np.max(np.abs(mix))
    if peak > 10 ** (-3 / 20):
        mix *= 10 ** (-3 / 20) / peak
    print(f"peak {20 * np.log10(np.max(np.abs(mix)) + 1e-9):.1f} dBFS, {len(mix) / SR:.2f}s" + (f", music {opt['--music']}" if opt.get("--music") else ""))
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
