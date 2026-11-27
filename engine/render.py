"""Render the HTML/SVG scene with headless Chrome.

python3 render.py stills OUTDIR t1 t2 ...          -> PNG stills (1080x1920)
python3 render.py sheet OUT.png t1 t2 ...          -> contact sheet (stills at 0.3x in a grid)
python3 render.py video OUT.mp4 --fps 60 --scale 1 [--start 0 --end END] [--audio mix.wav]
"""
import subprocess, sys, time, io
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
PAGE = (ROOT / "scene" / "index.html").as_uri()
CHROME = "/usr/bin/google-chrome"


def open_page(p, scale=1):
    b = p.chromium.launch(executable_path=CHROME, args=["--disable-gpu", "--font-render-hinting=none"])
    pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=scale)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(PAGE)
    pg.wait_for_function("typeof window.renderAt === 'function'")
    pg.evaluate("document.fonts.load(\"italic 700 64px Poppins\")")
    pg.wait_for_function("document.fonts.check('italic 700 64px Poppins')")
    if errs:
        print("PAGE ERRORS:", errs)
    return b, pg


def grain_png(pg):
    """v4 paper grain (subtle, static). Built once with numpy, cached as scene/grain.png. Strength = STYLE.grain (0 = off)."""
    g = float(pg.evaluate("(window.STYLE && window.STYLE.grain !== undefined) ? +window.STYLE.grain : 0") or 0)
    if g <= 0: return None
    path = ROOT / "scene" / f"grain-{g:g}.png"
    if not path.exists():
        import numpy as np
        r = np.random.default_rng(11)
        lo = r.random((960 // 24 + 2, 540 // 24 + 2))
        low = np.kron(lo, np.ones((24, 24)))[:960, :540]
        low = np.asarray(Image.fromarray(((low - low.min()) / (np.ptp(low) + 1e-9) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(8)), dtype=np.float32) / 255 - 0.5
        v = low * 0.28 + (r.random((960, 540)) - 0.5) * 0.9
        a = np.zeros((960, 540, 4), np.uint8)
        dark = v > 0
        a[dark] = [70, 52, 36, 0]; a[~dark] = [255, 250, 238, 0]
        a[..., 3] = np.clip(np.where(dark, v * 34, -v * 30) * g, 0, 255).astype(np.uint8)
        Image.fromarray(a, "RGBA").resize((1080, 1920), Image.BILINEAR).save(path)
    return path


def with_grain(png_bytes, gp):
    if not gp: return png_bytes
    im = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    im.alpha_composite(Image.open(gp).convert("RGBA"))
    out = io.BytesIO(); im.convert("RGB").save(out, "PNG"); return out.getvalue()


def shot(pg, t, fmt="png"):
    pg.evaluate(f"window.renderAt({t})")
    # page clip is ~2x faster than locator.screenshot (no element lookup / scroll per frame)
    return pg.screenshot(type=fmt, clip=dict(x=0, y=0, width=1080, height=1920), animations="disabled")


def end_time(pg):
    return pg.evaluate("window.T.END")


def main():
    mode = sys.argv[1]
    with sync_playwright() as p:
        if mode == "stills":
            out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
            b, pg = open_page(p); gp = grain_png(pg)
            for t in sys.argv[3:]:
                (out / f"t{float(t):06.2f}.png").write_bytes(with_grain(shot(pg, float(t)), gp))
            b.close()
        elif mode == "sheet":
            out = Path(sys.argv[2]); ts = [float(x) for x in sys.argv[3:]]
            b, pg = open_page(p); gp = grain_png(pg)
            ims = [Image.open(io.BytesIO(with_grain(shot(pg, t), gp))).convert("RGB") for t in ts]
            b.close()
            sc = 0.3; w, h = int(1080 * sc), int(1920 * sc)
            cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
            sheet = Image.new("RGB", (cols * w + (cols + 1) * 8, rows * (h + 30) + 8), "white")
            d = ImageDraw.Draw(sheet)
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
            except Exception:
                font = None
            for i, (im, t) in enumerate(zip(ims, ts)):
                x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 30)
                sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y))
                d.text((x, y + h + 3), f"{t:.2f}s", fill="black", font=font)
            sheet.save(out)
        elif mode == "video":
            out = sys.argv[2]
            args = sys.argv[3:]
            opt = {args[i]: args[i + 1] for i in range(0, len(args), 2)}
            fps = int(opt.get("--fps", 60)); scale = float(opt.get("--scale", 1))
            b, pg = open_page(p, scale)
            end = float(opt.get("--end", end_time(pg))); start = float(opt.get("--start", 0))
            nframes = int(round((end - start) * fps))
            gp = grain_png(pg)
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "png", "-i", "-"]
            if gp:
                cmd += ["-loop", "1", "-i", str(gp)]
            if "--audio" in opt:
                cmd += ["-i", opt["--audio"], "-c:a", "aac", "-b:a", "256k", "-shortest"]
            if gp:
                cmd += ["-filter_complex", f"[0:v][1:v]overlay=0:0:shortest=1:format=auto,scale={int(1080 * scale)}:{int(1920 * scale)}[v]", "-map", "[v]"]
                if "--audio" in opt: cmd += ["-map", "2:a"]
            cmd += ["-c:v", "libx264", "-preset", opt.get("--preset", "veryfast"), "-crf", opt.get("--crf", "16"),
                    "-pix_fmt", "yuv420p", "-r", str(fps), "-movflags", "+faststart", out]
            ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(nframes):
                ff.stdin.write(shot(pg, start + i / fps))
                if i % 120 == 0:
                    print(f"frame {i}/{nframes}  {time.time() - t0:.0f}s", flush=True)
            ff.stdin.close(); ff.wait(); b.close()
            print(f"done {nframes} frames in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
