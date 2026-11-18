# Touching a baby bird won't make mom reject it (spec mode v2.1)
SCRIPT = [
    "Will a mom bird reject her baby if you touch it?",
    "Nope! Most birds can barely smell.",
    "She can't smell you on her chick.",
    "Birds know their babies by how they look and sound.",
    "Put a chick back in its nest, and mom keeps feeding it.",
    "The myth was probably made up to keep kids away from baby birds.",
    "Which... honestly, still good advice.",
]
BG = "#bfe6ff"
def tree(chick="birdie(560, 1150, 1.1, {t, baby:1})", mom="birdie(870, 1262, 1.2, {t, flip:1, mood:'worried'})", mk=None):
    items = [art("sunFace(860, 520, 0.45, t)"), art("branch(-40, 1300, 1200)"), art("birdNest(560, 1100, 1.5, 'back')")]
    if chick: items.append(art(chick))
    items += [art("birdNest(560, 1100, 1.5, 'front')"), art(mom)]
    return items
SHOTS = [
    shot(0, *tree(),
         guy(x=200, y=1720, sc=1.3, expr="worried", pose="pointR", talk=False),
         label("TOUCH IT = REJECTED?", None, y=230, col="#ffd23f"),
         bg=BG, cam=(1.0, 1.05), focus=(560, 1150)),
    shot("Nope", *tree(mom="birdie(870, 1262, 1.2, {t, flip:1, mood:'sniff'})"),
         stamp("NOPE!", "Nope", y=380, col="#e8413a"),
         pop("SNIFF?", "smell", x=860, y=780, size=90, col="#fff"),
         bg=BG),
    shot("She",
         art("birdie(540, 1500, 2.4, {t, mood:'sniff', flip:1})"),
         pop("?", "smell", x=300, y=650, size=180, col="#fff"),
         label("BIRDS: BAD NOSE", "can't", y=280),
         bg=BG, cam=(1.0, 1.08), focus=(540, 1200)),
    shot("Birds", *tree(chick="birdie(560, 1150, 1.1, {t, baby:1, open: Math.abs(Math.sin(t*9))})", mom="birdie(870, 1262, 1.2, {t, flip:1, mood:'happy'})"),
         pop("CHEEP!", "sound", x=560, y=760, size=100, col="#fff"),
         label("LOOK + SOUND", "look", y=280, col="#7bc043"),
         bg=BG),
    shot("Put", *tree(chick="birdie(300 + 260*eio(prog(t, T.cut4, T.cut4 + 1.0)), 950 + 200*eio(prog(t, T.cut4, T.cut4 + 1.0)), 1.1, {t, baby:1, open: t > T.cut4 + 1.6 ? 1 : 0})",
                      mom="birdie(870, 1262, 1.2, {t, flip:1, mood:'happy', flap: t > T.cut4 + 1.4 ? 1 : 0})"),
         guy(x=200, y=1720, sc=1.3, expr="determined", pose="pointR"),
         check("feeding", ok=True, x=860, y=800, sc=1.0),
         bg=BG),
    shot("myth",
         guy(x=540, y=1560, sc=1.9, expr="smug", pose="point"),
         stamp("MYTH!", "myth", y=380, col="#e8413a"),
         label("KEEP KIDS AWAY", "kids", y=560, col="#ffd23f"),
         bg=BG),
    shot("Which", *tree(mom="birdie(870, 1262, 1.2, {t, flip:1, mood:'happy'})"),
         guy(x=200, y=1720, sc=1.3, expr="laugh", pose="shrug"),
         label("STILL... DON'T GRAB!", "advice", y=280),
         bg=BG),
]
