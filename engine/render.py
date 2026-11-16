"""Render the HTML/SVG scene with headless Chrome.

python3 render.py stills OUTDIR t1 t2 ...          -> PNG stills (1080x1920)
python3 render.py sheet OUT.png t1 t2 ...          -> contact sheet (stills at 0.3x in a grid)
python3 render.py video OUT.mp4 --fps 60 --scale 1 [--start 0 --end END] [--audio mix.wav]
"""
import subprocess, sys, time, io
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

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


def shot(pg, t, fmt="png"):
    pg.evaluate(f"window.renderAt({t})")
    return pg.locator("#stage").screenshot(type=fmt, animations="disabled")


def end_time(pg):
    return pg.evaluate("window.T.END")


def main():
    mode = sys.argv[1]
    with sync_playwright() as p:
        if mode == "stills":
            out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
            b, pg = open_page(p)
            for t in sys.argv[3:]:
                (out / f"t{float(t):06.2f}.png").write_bytes(shot(pg, float(t)))
            b.close()
        elif mode == "sheet":
            out = Path(sys.argv[2]); ts = [float(x) for x in sys.argv[3:]]
            b, pg = open_page(p)
            ims = [Image.open(io.BytesIO(shot(pg, t))).convert("RGB") for t in ts]
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
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "png", "-i", "-"]
            if "--audio" in opt:
                cmd += ["-i", opt["--audio"], "-c:a", "aac", "-b:a", "256k", "-shortest"]
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
