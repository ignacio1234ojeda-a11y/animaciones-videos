# Fast Short recipe (token-lean). Read ONLY this file; do not read lib.js, sfx.py or old shorts.

1. `unzip -q aniaciones-engine.zip -d ~/work && cd ~/work/engine && bash setup.sh` (prints OK).
2. Script: 1 web search, 50-70 words, English, myth-vs-reality twist, one gag per line, catchy last line. Claude approves it.
3. `python3 tts.py vo/take1.wav am_puck "Line 1." "Line 2." ... --gap 0.4 --speed 0.95`
   then `python3 captions.py vo/take1.json` (word times: syllables inside each line, +0.1 s offset).
4. Write scene/timing.js (`window.T = {cutB:.., beat:.., END: voice end + 0.6}`) and scene/shots.js
   (pattern: example-shots.js — `window.SHOTS=[[0,shotA],[T.cutB,shotB],...]; window.HITS=[[t,amp,decay],...]; window.BG`).
   Grep, don't read: `grep -n "^function\|^const" scene/lib.js` lists every drawing piece.
   1080x1920 canvas, keep art above y 1700 (subtitles at 1796), INK #1c1c1e outlines ~7 px, flat colours.
5. ONE check: `python3 render.py sheet qa/s1.png <~15 times>` -> Read the PNG -> fix only clear problems.
6. cues.py (pattern: example-cues.py; sounds: `grep "^def " sfx.py`), then
   `python3 sfx.py out/mix.wav --vo vo/take1.wav --vo-at 0.1`
7. `python3 render.py video out/NAME-4K.mp4 --fps 60 --scale 2 --crf 16 --audio out/mix.wav` (~6 min / 21 s, timeout 600000)
   then `ffmpeg -y -loglevel error -i out/NAME-4K.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -preset slow -crf 18 -c:a copy out/NAME-1080p.mp4`
   (skip the low-res preview + popscan unless something looks wrong).
8. SendUserFile both mp4s. Save to the project ONLY `<name>-short/plan.md` (script + shot list, short) and
   `<name>-short/shots.js` via project_write local_path (the file was written with Write, so no re-read needed).
9. If new reusable drawings were made, append them to scene/lib.js and send the user a new aniaciones-engine.zip
   (`cd ~/work && zip -qr aniaciones-engine.zip engine -x "engine/*.onnx" "engine/*.bin" "engine/*.json" "engine/vo/*" "engine/out/*" "engine/qa/*"`).
