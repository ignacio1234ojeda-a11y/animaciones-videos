# Myth short: do you have to wait 30 minutes to swim after eating? (myth format, engine v4)
SCRIPT = [
    "Do you really have to wait thirty minutes to swim after eating?",
    "Nope!",
    "The Red Cross checked, and found no real case of anyone drowning from a full stomach.",
    "Yes, digestion pulls some blood to your belly.",
    "But your arms and legs still get plenty.",
    "Worst case? A little cramp. Just float and relax.",
    "The rule probably came from a Scout handbook in nineteen oh eight.",
    "The real danger is alcohol, not sandwiches.",
    "So grab that sandwich and cannonball. Just finish chewing first.",
]
MUSIC = "upbeat"
STYLE = dict(boil=1)
WY = 1300  # water surface
POOL = art(f"pool(t, {WY}, 'back')")
WATER = art(f"pool(t, {WY}, 'front')")

SHOTS = [
    # 0 hook: captain on the pool deck with a sandwich, stopwatch ticking
    shot(0, POOL,
         art(f"poolLadder(880, {WY - 150}, 0.8)"),
         captain(430, 1150, 1.0, "worried", pose="pointR", lookAt=(560, 960),
                 ch=[("minutes", dict(expr="confused", pose="think"))]),
         art("sandwich(600, 960, 0.75, -8, 0)"),
         art("stopwatch(830, 620, 110, t, 0, 1)"),
         WATER,
         label("WAIT 30 MIN?", None, y=230, size=96),
         bg="day", move=("push", 1.08), focus=(540, 1000)),
    # 1 Nope: he's already in the water, happy
    shot("Nope", POOL,
         captain(540, 1560, 1.15, "laugh", ch=[("Nope", dict(pose="cheer"))]),
         WATER,
         art("lifeRing(200, 1330, 0.7, t)"),
         stamp("NOPE", "Nope", y=480),
         sparkle("Nope", 540, 1250),
         bg="day", tr="zoom", focus=(540, 1200)),
    # 2 Red Cross checked: no cases
    shot("Red",
         art("newspaper(560, 960, 1.15*k, -4, 'NO CASES', 'FULL STOMACH: SAFE')", at="checked", sfx="clack"),
         captain(170, 1720, 0.85, "curious", glass=True, lookAt=(560, 900),
                 ch=[("drowning", dict(pose="pointR", glass=False, expr="surprised"))]),
         label("RED CROSS CHECKED", "Red", y=230, col="#ffffff"),
         pop("0", "no", x=880, y=1350, size=200, col="#7ee07a"),
         bg="paper", tr="wipe", move="push", focus=(560, 1000)),
    # 3 digestion pulls blood to belly
    shot("digestion",
         captain(540, 1650, 1.9, "curious", lookAt=(540, 1350)),
         art("bloodFlow(540, 1650, 1.9, t, 1)", at="blood", reveal=(540, 1450)),
         label("BLOOD TO BELLY", "belly", y=230, col="#ff8a3d"),
         bg="studio", tr="zoom", focus=(540, 1250)),
    # 4 arms and legs still fine
    shot("arms",
         captain(540, 1650, 1.9, "smug", pose="cheer"),
         art("bloodFlow(540, 1650, 1.9, t, 1)"),
         check("arms", True, x=200, y=900),
         check("legs", True, x=880, y=900),
         label("ARMS & LEGS: FINE", "plenty", y=230, col="#7ee07a"),
         bg="studio", tr="match", focus=(540, 1250)),
    # 5 worst case: a little cramp, just float
    shot("Worst", POOL,
         captain(540, 1560, 1.15, "worried", ch=[("float", dict(expr="smug", pose="hips"))]),
         WATER,
         art("lifeRing(820, 1330, 0.7*k, t)", at="float", reveal=(820, 1330)),
         pop("CRAMP?", "cramp", x=540, y=640, size=110, col="#ff8a3d", sfx="pop", hit=None),
         label("JUST FLOAT", "float", y=230),
         bg="day", tr="whip", move=("push", 1.1), focus=(540, 1250)),
    # 6 1908 scout handbook
    shot("rule",
         art("newspaper(620, 980, 1.1*k, 5, 'SCOUT GUIDE', 'NO SWIM AFTER MEALS')", at="Scout", sfx="clack"),
         guy(250, 1720, 1.15, "determined", talk=False, pose="pointR", lookAt=(620, 900), body="#6b7a3a", legs="#5a4a2a"),
         art("rangerHat(250, 1720, 1.15)"),
         label("1908", "nineteen", y=230, size=110),
         label("WHERE IT CAME FROM", "rule", y=380, col="#ff8a3d", size=60),
         bg="paper", tr="wipe", move=("pan", 120)),
    # 7 real danger: alcohol, not sandwiches
    shot("real",
         art("bottle(330, 1420, 1.25*k, '#5a8a3a', 'ALCOHOL', -6)", at="alcohol", sfx="thud", hit=(12, 6)),
         art("sandwich(770, 1250, 0.85*k, 6, 0)", at="sandwiches"),
         check("alcohol", False, x=330, y=820),
         check("sandwiches", True, x=770, y=900),
         label("REAL DANGER", "danger", y=230, col="#e8413a"),
         bg="#fff0f4", tr="zoom"),
    # 8 joke: cannonball, chew first
    shot("grab", POOL,
         art("sandwich(450, 960, 0.7, -6, Math.min(1, Math.max(0, (t - T.cut8 - 0.4) / 0.4)))", out="cannonball"),
         captain(300, 1150, 1.0, "laugh", ch=[("cannonball", dict(pose="jump", x=640, y=1560))]),
         WATER,
         pop("CANNONBALL!", "cannonball", x=540, y=560, size=96, col="#ffd23f"),
         label("CHEW FIRST", "chewing", y=230, col="#7ee07a"),
         shake("cannonball", amp=14),
         bg="day", move=("push", 1.1), focus=(540, 1100)),
]
