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
        # soft vignette (edges a little darker) baked into the same static overlay
        yy, xx = np.mgrid[0:960, 0:540]
        d = np.sqrt(((xx - 270) / 300.0) ** 2 + ((yy - 430) / 560.0) ** 2)
        vig = np.clip((d - 0.62) / 0.55, 0, 1) ** 1.6 * 34 * min(1.0, g)
        dk = vig > a[..., 3] * 0.5
        a[dk, 0:3] = [36, 24, 48]
        a[..., 3] = np.maximum(a[..., 3], vig).astype(np.uint8)
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
    if fmt == "jpeg":  # v4 video frames: JPEG q96 encodes much faster than PNG for textured frames; x264 re-encodes anyway
        return pg.screenshot(type="jpeg", quality=96, clip=dict(x=0, y=0, width=1080, height=1920), animations="disabled")
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
            jobs = int(opt.get("--jobs", 2))
            if jobs > 1:  # v4: render frame ranges in parallel Chrome processes, then join them without re-encoding
                b, pg = open_page(p, scale)
                end = float(opt.get("--end", end_time(pg))); start = float(opt.get("--start", 0)); b.close()
                f0, f1 = int(round(start * fps)), int(round(end * fps))
                cuts = [f0 + (f1 - f0) * k // jobs for k in range(jobs + 1)]
                tmp = Path(out).with_suffix(""); parts = []
                procs = []
                for k in range(jobs):
                    part = f"{tmp}.part{k}.mp4"; parts.append(part)
                    a = [sys.executable, __file__, "video", part, "--fps", str(fps), "--scale", str(scale), "--jobs", "1",
                         "--start", repr(cuts[k] / fps), "--end", repr(cuts[k + 1] / fps), "--crf", opt.get("--crf", "16"), "--preset", opt.get("--preset", "veryfast")]
                    procs.append(subprocess.Popen(a))
                for pr in procs:
                    if pr.wait() != 0: raise SystemExit("segment render failed")
                lst = f"{tmp}.parts.txt"
                Path(lst).write_text("".join(f"file '{Path(x).resolve()}'\n" for x in parts))
                cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst]
                if "--audio" in opt: cmd += ["-i", opt["--audio"], "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "256k", "-shortest"]
                cmd += ["-c:v", "copy", "-movflags", "+faststart", out]
                subprocess.run(cmd, check=True)
                for x in parts + [lst]: Path(x).unlink(missing_ok=True)
                print(f"done {f1 - f0} frames in {jobs} parallel parts")
                return
            b, pg = open_page(p, scale)
            end = float(opt.get("--end", end_time(pg))); start = float(opt.get("--start", 0))
            nframes = int(round((end - start) * fps))
            gp = grain_png(pg)
            vfmt = opt.get("--frames", "jpeg")
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg" if vfmt == "jpeg" else "png", "-i", "-"]
            if gp:
                cmd += ["-loop", "1", "-i", str(gp)]
            if "--audio" in opt:
                cmd += ["-i", opt["--audio"], "-c:a", "aac", "-b:a", "256k", "-shortest"]
            if gp:
                cmd += ["-filter_complex", f"[0:v][1:v]overlay=0:0:shortest=1:format=yuv420,scale={int(1080 * scale)}:{int(1920 * scale)}[v]", "-map", "[v]"]
                if "--audio" in opt: cmd += ["-map", "2:a"]
            cmd += ["-c:v", "libx264", "-preset", opt.get("--preset", "veryfast"), "-crf", opt.get("--crf", "16"),
                    "-pix_fmt", "yuv420p", "-r", str(fps), "-movflags", "+faststart", out]
            ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(nframes):
                ff.stdin.write(shot(pg, start + i / fps, vfmt))
                if i % 120 == 0:
                    print(f"frame {i}/{nframes}  {time.time() - t0:.0f}s", flush=True)
            ff.stdin.close(); ff.wait(); b.close()
            print(f"done {nframes} frames in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
