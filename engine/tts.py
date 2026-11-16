"""Offline English TTS with Kokoro-82M (ONNX) + misaki dictionaries. Apache-2.0 model.

python3 tts.py OUT.wav VOICE "line one" "line two" ... [--speed 1.0] [--gap 0.35]
Writes OUT.wav (24 kHz) and OUT.json with the start/end of every line.
"""
import json, re, sys, wave
from pathlib import Path
import numpy as np
import onnxruntime as ort

D = Path(__file__).resolve().parent
VOCAB = json.load(open(D / "config.json"))["vocab"]
GOLD = json.load(open(D / "us_gold.json"))
SILVER = json.load(open(D / "us_silver.json"))
SR = 24000


def lookup(w):
    for dct in (GOLD, SILVER):
        v = dct.get(w) or dct.get(w.lower()) or dct.get(w.capitalize())
        if isinstance(v, dict):
            v = v.get("DEFAULT") or next((x for x in v.values() if x), None)
        if v:
            return v
    return None


MANUAL = {"MRI": "ˌɛmˌɑɹˈI"}


def word_ph(w):
    if w in MANUAL:
        return MANUAL[w]
    if w.lower() == "a":
        return "ə"
    p = lookup(w)
    if p:
        return p
    lw = w.lower()
    if lw.endswith("'s"):
        b = word_ph(lw[:-2])
        if b:
            return b + ("s" if b[-1] in "ptkfθ" else "z")
    for suf, add in (("s", "z"), ("es", "ᵻz")):
        if lw.endswith(suf):
            b = lookup(lw[: -len(suf)])
            if b:
                return b + ("s" if suf == "s" and b[-1] in "ptkfθ" else add)
    if lw.endswith("ed"):
        for base in (lw[:-2], lw[:-1]):  # "pecked" -> peck, "noticed" -> notice
            b = lookup(base)
            if b:
                if b[-1] in "td":
                    return b + "ᵻd"
                return b + ("t" if b[-1] in "pkfsʃθʧ" else "d")
    raise KeyError(f"no pronunciation for {w!r}")


def g2p(text):
    out = []
    for tok in re.findall(r"[A-Za-z]+(?:'[a-z]+)?|[.,!?;:—]", text.replace("’", "'")):
        if re.match(r"[.,!?;:—]", tok):
            if out and out[-1] == " ":
                out.pop()
            out.append(tok); out.append(" ")
        else:
            out.append(word_ph(tok)); out.append(" ")
    return "".join(out).strip()


class Kokoro:
    def __init__(self, voice, model="model_quantized.onnx"):
        self.s = ort.InferenceSession(str(D / model))
        self.v = np.fromfile(D / f"{voice}.bin", dtype=np.float32).reshape(-1, 1, 256)

    def say(self, text, speed=1.0):
        ph = g2p(text)
        ids = [VOCAB[c] for c in ph if c in VOCAB][:510]
        style = self.v[len(ids)]
        wav = self.s.run(None, {"input_ids": np.array([[0, *ids, 0]], dtype=np.int64),
                                "style": style.astype(np.float32), "speed": np.array([speed], dtype=np.float32)})[0]
        return wav.reshape(-1), ph


def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a, b = max(0, idx[0] - int(0.02 * SR)), min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]


def main():
    out, voice = sys.argv[1], sys.argv[2]
    args = sys.argv[3:]
    opts = {}
    lines = []
    i = 0
    while i < len(args):
        if args[i].startswith("--"):
            opts[args[i]] = float(args[i + 1]); i += 2
        else:
            lines.append(args[i]); i += 1
    k = Kokoro(voice)
    speed, gap = opts.get("--speed", 1.0), opts.get("--gap", 0.35)
    parts, marks, t = [], [], 0.0
    for ln in lines:
        w, ph = k.say(ln, speed)
        w = trim(w)
        marks.append({"text": ln, "phonemes": ph, "start": round(t, 3), "end": round(t + len(w) / SR, 3)})
        parts += [w, np.zeros(int(gap * SR))]
        t += len(w) / SR + gap
    y = np.concatenate(parts[:-1])
    y = y / (np.max(np.abs(y)) + 1e-9) * 10 ** (-1.5 / 20)
    with wave.open(out, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((y * 32767).astype(np.int16).tobytes())
    Path(out).with_suffix(".json").write_text(json.dumps(marks, indent=1, ensure_ascii=False))
    for m in marks:
        print(f"{m['start']:6.2f}-{m['end']:6.2f}  {m['text']}")


if __name__ == "__main__":
    main()
