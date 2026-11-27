# The Great Emu War (1932): Australia's army vs 20,000 emus - and the emus won. Story format, engine v4.
SCRIPT = [
    "Australia once declared war on birds... and lost.",
    "The enemy? Twenty thousand emus.",
    "In nineteen thirty two, they stormed the wheat farms of Western Australia.",
    "So the army sent in soldiers, two machine guns, and ten thousand bullets.",
    "Easy win, right?",
    "Nope! The emus split into tiny groups and scattered in every direction.",
    "Then one gun jammed, after just a dozen birds.",
    "So the soldiers mounted a machine gun on a truck.",
    "But emus sprint fifty kilometers an hour, and the bumpy ride made aiming impossible.",
    "After one week, the army retreated.",
    "They came back and fired almost ten thousand bullets.",
    "That's about ten bullets for every emu they got.",
    "The commander said these birds could face machine guns like tanks.",
    "And the wheat? Still getting eaten.",
    "Final score? Emus one, army zero. That's right,",
]
MUSIC = "upbeat"
STYLE = dict(boil=1)

def soldier(x, y, sc, expr="determined", pose="rest", ch=(), flip=False):
    return [guy(x=x, y=y, sc=sc, expr=expr, talk=False, pose=pose, ch=list(ch), body="#7a7444", legs="#5d5636", flip=flip),
            art(f"slouchHat({x},{y},{sc})")]

FIELD = art("wheatField(t, 1330, 300, 30)")
FIELD_EATEN = art("wheatField(t, 1330, 300, 30, 0.7)")

SHOTS = [
    # 0 hook: helmeted emu staring down a machine gun, headline from frame 1
    shot(0,
         FIELD,
         art("emu(700, 1600, 1.05, {t, mood:'mad', helmet:1, flip:true})"),
         art("lewisGun(20, 1640, 0.85, -4, 0, t)"),
         captain(920, 1720, 0.8, "surprised", glass=True, lookAt=(500, 900),
                 ch=[("lost", dict(pose="shrug", expr="confused", glass=False))]),
         label("AUSTRALIA vs EMUS", None, y=230, size=86),
         stamp("LOST!", "lost", y=420),
         bg="day", move=("push", 1.1), focus=(540, 1200)),
    # 1 the enemy: a whole herd + counter
    shot("enemy",
         art("emuHerd(t, 1180, 14, 0.75, 7)"),
         count("Twenty", 20000, "emus", y=380, fmt="{} EMUS", col="#ff8a3d"),
         label("THE ENEMY", "enemy", y=230),
         bg="day", tr="zoom", move=("pull", 1.15), focus=(540, 1300)),
    # 2 when/where: emus munching wheat
    shot("nineteen",
         FIELD_EATEN,
         art("emu(230, 1560, 0.9, {t, dip:0.35 + 0.15*Math.sin(t*6), mood:'smug'})"),
         art("emu(870, 1600, 0.95, {t: t + 1, dip:0.3 + 0.15*Math.sin(t*5 + 1), mood:'smug', flip:true})", at="stormed", sfx="thud", hit=(10, 6)),
         label("1932", "nineteen", y=230, size=96),
         label("WESTERN AUSTRALIA", "Western", y=360, col="#ff8a3d", size=64),
         bg="day", move=("pan", 220)),
    # 3 the army: soldiers + guns + bullets
    shot("sent",
         *soldier(230, 1640, 0.85, ch=[("guns", dict(pose="point", lookAt=(700, 1300)))]),
         *soldier(420, 1660, 0.8, "smug"),
         art("lewisGun(560, 1600, 0.75*k, -6, 0, t)", at="two"),
         art("lewisGun(780, 1640, 0.75*k, -6, 0, t)", at="machine"),
         count("ten", 10000, "bullets", y=580, fmt="{} BULLETS", col="#ffd23f"),
         label("THE ARMY", "soldiers", y=230, col="#7ee07a"),
         bg="day", tr="wipe", move="push", focus=(540, 1300)),
    # 4 easy win?
    shot("Easy",
         captain(540, 1560, 1.7, "smug", pose="hips"),
         label("EASY WIN?", "Easy", y=300, size=96),
         bg="#ffe2ad", move="push", focus=(540, 1100)),
    # 5 Nope: emus scatter in every direction
    shot("Nope",
         art("emuHerd(t, 1150, 12, 0.7, 3, 1, Math.max(0, t - T.cut5 - 0.8) * 0.35)"),
         stamp("NOPE", "Nope", y=420),
         label("THEY SPLIT UP!", "split", y=230, col="#ff8a3d"),
         bg="day", tr="zoom", move=("pull", 1.2), focus=(540, 1250)),
    # 6 gun jams
    shot("Then",
         art("lewisGun(420, 1620, 1.2, -4, 0, t, 1)"),
         *soldier(820, 1700, 0.9, "worried", pose="scared"),
         pop("JAMMED!", "jammed", y=600, col="#e8413a"),
         label("ONLY 12 BIRDS", "dozen", y=230),
         bg="day", tr="whip", move="push", focus=(500, 1350)),
    # 7 gun on a truck
    shot("mounted",
         art("armyTruck(-200 + 260*(t - T.cut7), 1600, 1.0, t, 0, 1)"),
         label("MACHINE GUN TRUCK", "truck", y=230, col="#7ee07a"),
         pop("UPGRADE!", "truck", x=600, y=600, size=96, col="#ffd23f", sfx="pop", hit=None),
         bg="day", move=("pan", 200)),
    # 8 emus outrun it, bumpy ride
    shot("sprint",
         art("speedLines(860, 1480, 1.2, t) + emu(860, 1560, 0.8, {t, run:1, mood:'smug'})"),
         art("armyTruck(300, 1640, 0.95, t, 1, 1, 0.8)", at="bumpy"),
         count("fifty", 50, "hour", x=540, y=420, fmt="{} KM/H", col="#ff8a3d"),
         label("TOO FAST!", "fifty", y=230),
         shake("bumpy", amp=16),
         pop("MISS!", "impossible", x=540, y=700, size=110, col="#e8413a"),
         bg="day", tr="wipe", move=("follow", 0)),
    # 9 retreat after one week
    shot("week",
         art("calendarPage(820, 640, 0.85*k, 'WEEK', '1', '#e8413a', 6)", at="week"),
         art("flag(560, 1560, 1.6, Math.min(1, Math.max(0, (t - T.cut9 - 1.0)/0.8)), t, '#ffffff')", at="retreated"),
         *soldier(260, 1660, 0.85, "cry", ch=[("retreated", dict(pose="walk", x=-200))]),
         label("RETREAT!", "retreated", y=230, col="#ffffff"),
         bg="day", move="push", focus=(540, 1250)),
    # 10 round two: almost 10,000 bullets
    shot("came",
         art("lewisGun(200, 1600, 0.9, -4, 1, t) + lewisGun(560, 1640, 0.9, -6, 1, t + 0.3)"),
         art("emuHerd(t, 1250, 6, 0.55, 9, 1)"),
         count("fired", 9860, "bullets", y=580, fmt="{} BULLETS", col="#ffd23f"),
         label("ROUND TWO", "came", y=230, col="#7ee07a"),
         bg="day", tr="zoom", move=("push", 1.1), focus=(540, 1300)),
    # 11 ten bullets per emu
    shot("about",
         art("bulletRow(540, 1060, 0.9, 10, 90, (t - T.cut11) / 1.6)"),
         art("emu(540, 1620, 0.7, {t, mood:'smug'})", at="every"),
         label("10 BULLETS", "ten", y=230, size=96),
         label("PER EMU", "every", y=360, col="#ff8a3d", size=80),
         bg="#fff0f4", tr="wipe"),
    # 12 the commander: like tanks
    shot("commander",
         *soldier(250, 1680, 1.0, "surprised", ch=[("tanks", dict(pose="point", lookAt=(760, 1000)))]),
         art("emu(760, 1600, 0.95, {t, mood:'mad', helmet:1, flip:true})"),
         art("speechBubble(330, 640, 1.0*k, 'LIKE TANKS!', 520)", at="tanks"),
         label("THE COMMANDER", "commander", y=230, col="#7ee07a"),
         shake("tanks", amp=12),
         bg="day", move=("push", 1.12), focus=(540, 1200)),
    # 13 the wheat is still getting eaten
    shot("wheat",
         FIELD_EATEN,
         art("emu(230, 1580, 0.85, {t, dip:0.3 + 0.15*Math.sin(t*6), mood:'smug'})"),
         art("emu(870, 1600, 0.9, {t: t + 2, dip:0.35 + 0.15*Math.sin(t*5), mood:'smug', flip:true})"),
         label("STILL EATING", "Still", y=230, col="#ffd23f"),
         bg="day", tr="match", move=("pan", -180)),
    # 14 final score + loop back to line 1
    shot("Final",
         art("emu(720, 1580, 1.0, {t, mood:'smug', flip:true}) + crown(515, 870, 0.55)", at="Emus", reveal=(720, 840)),
         captain(230, 1720, 1.0, "laugh", ch=[("zero", dict(pose="celebrate"))]),
         label("EMUS 1", "Emus", y=230, col="#7ee07a", size=96),
         label("ARMY 0", "zero", y=370, col="#e8413a", size=96),
         bg="day", move=("push", 1.15), focus=(600, 1200)),
]
