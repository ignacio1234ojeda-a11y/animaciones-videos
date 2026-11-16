# Fast Short recipe v2 - SPEC MODE (token-lean). Read ONLY this file + example spec.py.

1. `git clone --depth 1 https://github.com/ignacio1234ojeda-a11y/animaciones-videos ~/work && cd ~/work/engine && bash setup.sh` (or unzip aniaciones-engine.zip)
2. Script: 1 web search, 50-70 words, English, myth-vs-reality twist, catchy last line. Claude approves it.
3. Copy spec.py (Venus example) and edit: SCRIPT lines + SHOTS. Helpers:
   shot(at, *items, bg='studio'|'day'|'night'|'space'|'paper'|'#hex', cam=(z0,z1), focus=(x,y))
   guy(x,y,sc,expr,talk=True,pose,ch=[(anchor, dict(expr=..,pose=..))])  - talks with the voice, blinks, breathes, hops on change
     poses: rest point pointL pointR ears shrug think wave cheer hips; exprs: curious smug surprised worried determined confused flat laugh cry
   label(text, at, x,y,col,size)  stamp(text, at)  check(at, ok)  pop('BOOM!', at)  count(at, to, end, fmt='{} DAYS')
   art("anyLibFn(x, y, sc*k, t, ...)", at=...)  - JS expression with t, k (pop-in scale), T (T.cutN = shot N start)
   Anchors are script words: 'Sun', 'Sun#2' (2nd after shot start), 'fire+0.3', or seconds. Sounds, shakes, slide transitions,
   camera push-in and lip-sync are automatic.
   Drawing pieces: `grep -o "^function [a-zA-Z0-9_]*" scene/lib.js` (add new ones to the END of lib.js so the library grows).
   1080x1920, keep art above y 1700 (subtitles at 1796).
4. `python3 make.py spec.py` -> voice (only if SCRIPT changed) + scene + cues + qa/sheet.png (1 frame per shot). Read it, fix clear problems.
5. `python3 make.py spec.py --video NAME` (timeout 600000) -> out/NAME-1080p.mp4 (+4K).
6. Publish: see project doc cartoon-engine/publishing.md (vidiq_file_upload -> user uploads -> draft -> publish).
Old manual mode (timing.js/shots.js/cues.py by hand) still works: see FAST-old.md.
