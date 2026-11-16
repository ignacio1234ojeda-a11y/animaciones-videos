"""Build scene/captions.js from the voice line timings (vo/take1.json).

python3 captions.py vo/take1.json [--vo-at 0.1] [--max-words 3] [--max-chars 15]
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
V = "aeiouæɑɐəɛɜɪʊʌɔAIOWYᵻi"


def main():
    src = sys.argv[1]
    args = sys.argv[2:]
    opt = {args[i]: float(args[i + 1]) for i in range(0, len(args), 2)}
    off = opt.get("--vo-at", 0.1)
    mw, mc = int(opt.get("--max-words", 3)), int(opt.get("--max-chars", 16))
    lines = json.load(open(src))
    chunks = []
    for L in lines:
        words = L["text"].split()
        phs = L["phonemes"].split()
        if len(phs) != len(words):
            phs = words
        syl = [max(1, len(re.findall("[" + V + "]+", p))) for p in phs]
        tot = sum(syl); d = L["end"] - L["start"]; t = L["start"] + off
        starts = []
        for s in syl:
            starts.append(t); t += d * s / tot
        cur = []
        groups = []
        for i, w in enumerate(words):
            trial = " ".join([words[j] for j in cur] + [w])
            if cur and (len(cur) >= mw or len(trial) > mc):
                groups.append(cur); cur = []
            cur.append(i)
            if re.search(r"[.!?]$", w) and i < len(words) - 1 and len(cur) >= 2:
                groups.append(cur); cur = []
        if cur:
            groups.append(cur)
        if len(groups) >= 2 and len(groups[-1]) == 1 and len(groups[-2]) < mw and len(" ".join(words[j] for j in groups[-2] + groups[-1])) <= mc + 3:
            last = groups.pop()
            groups[-1] = groups[-1] + last
        for k, g in enumerate(groups):
            t0 = starts[g[0]] - 0.03
            t1 = starts[groups[k + 1][0]] - 0.03 if k + 1 < len(groups) else L["end"] + off + 0.25
            chunks.append({"t0": round(t0, 3), "t1": round(t1, 3), "text": " ".join(words[j] for j in g)})
    if chunks: chunks[0]["t0"] = 0.0  # words on screen from frame 1 (no empty first frame = fewer swipes)
    for a, b in zip(chunks, chunks[1:]):
        a["t1"] = min(a["t1"], b["t0"])
    out = ROOT / "scene" / "captions.js"
    out.write_text("window.CAPTIONS = " + json.dumps(chunks, indent=1) + ";\n")
    for c in chunks:
        print(f"{c['t0']:6.2f}-{c['t1']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()
