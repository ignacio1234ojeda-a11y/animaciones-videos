# Fast Short recipe v2 - SPEC MODE + AUTO PUBLISH. Read ONLY this file + example-spec.py.

0. Repo: add_repo(owner ignacio1234ojeda-a11y, repo animaciones-videos, access push), then
   `git clone --depth 1 https://github.com/ignacio1234ojeda-a11y/animaciones-videos ~/work && cd ~/work/engine && bash setup.sh` (prints OK).
1. Topic: not in the "Topics already used" list of project doc cartoon-engine/publishing.md. 1 web search to verify facts.
2. Script: 50-70 words, English, myth-vs-reality twist. Claude approves it (user said: don't ask).
   RETENTION RULES (views come from people not swiping in the first second and rewatching):
   - Line 1 = the question/claim, max ~8 words, curiosity gap ("Why...", "Can...", "You've been lied to about...").
   - Last line must LOOP: it should lead naturally back into line 1 (e.g. ends "...so next time someone asks" -> "Can a day...").
   - Something new on screen every ~1.5 s (new item, expression change, count, pop). Shots <= ~3 s.
3. `cp example-spec.py spec.py` and edit SCRIPT + SHOTS. Helpers:
   shot(at, *items, bg='studio'|'day'|'night'|'space'|'paper'|'#hex', cam=(z0,z1), focus=(x,y))
   guy(x,y,sc,expr,talk=True,pose,ch=[(anchor, dict(expr=..,pose=..))])  - talks with the voice, blinks, breathes, hops on change
     poses: rest point pointL pointR ears shrug think wave cheer hips; exprs: curious smug surprised worried determined confused flat laugh cry
   label(text, at, x,y,col,size)  stamp(text, at)  check(at, ok)  pop('BOOM!', at)  count(at, to, end, fmt='{} DAYS')
   art("anyLibFn(x, y, sc*k, t, ...)", at=...)  - JS expression with t, k (pop-in scale), T (T.cutN = shot N start)
   Anchors are script words: 'Sun', 'Sun#2' (2nd after shot start), 'fire+0.3', or seconds. A shot anchor must not match an
   earlier word of the previous shot (e.g. "so" inside "spins so slowly"). Sounds, shakes, slide transitions, camera, lip-sync are automatic.
   Drawing pieces: `grep -o "^function [a-zA-Z0-9_]*" scene/lib.js` (add new ones to the END of lib.js so the library grows).
   1080x1920, keep art above y 1700 (subtitles at 1796).
   Shot 0 must be a strong frame at t=0: the main object/character + the question as a label with at=None
   (visible from frame 1). Never open on just the guy on an empty background.
4. `python3 make.py spec.py` -> voice (only if SCRIPT changed) + scene + cues + qa/sheet.png. Read it, fix clear problems.
5. `python3 make.py spec.py --video NAME` (timeout 600000) -> out/NAME-1080p.mp4 (native 1080p60, ~80 s; --hq = old 4K path, ~5 min).
6. Publish: `cp out/NAME-1080p.mp4 ../videos/ && cp spec.py ../specs/NAME.py` then commit + push (also lib.js if it grew).
   vidiq_video_upload(url="https://raw.githubusercontent.com/ignacio1234ojeda-a11y/animaciones-videos/main/videos/NAME-1080p.mp4")
   -> vidiq_social_post_draft_create (YouTube + TikTok settings in publishing.md, publishAt for spacing) -> vidiq_social_post_publish.
   Then add the links/topic to publishing.md (project doc). SendUserFile the 1080p only if the user is around.
BATCH ("make N, one every X hours"): repeat 3-6 per video in the same clone; schedule video i at start + i*X hours.
Old manual mode: FAST-old.md.
