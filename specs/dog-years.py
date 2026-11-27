# Dog years = 7 human years? (myth format ~25 s, Captain Curious)
SCRIPT = [
    "Is one dog year really seven human years?",
    "Nope!",
    "Dogs grow up way faster at the start.",
    "By their first birthday, they're like a fifteen year old teenager.",
    "Year two adds about nine more.",
    "After that, it's roughly five human years per dog year.",
    "And size matters. Big dogs age faster than small ones.",
    "So your one year old puppy? Basically a moody teenager.",
]
def captain(x, y, sc, expr="curious", pose="rest", glass=False, ch=()):
    it = [guy(x=x, y=y, sc=sc, expr=expr, pose=pose, ch=list(ch), body="#1f3a68", legs="#fbfbf7"),
          art(f"captainCoat({x},{y},{sc}) + captainCap({x},{y},{sc})")]
    if glass: it.append(art(f"spyglass({x+8*sc}, {y-306*sc}, {0.55*sc}, -10)"))
    return it
PARK = "`<rect width='1080' height='1920' fill='#bfe3ff'/><rect x='0' y='1400' width='1080' height='520' fill='#8fd06b'/><line x1='0' y1='1400' x2='1080' y2='1400' stroke='#1c1c1e' stroke-width='8'/>`"
SHOTS = [
    shot(0,
         art(PARK + " + dog(470, 1500, 1.5, {t, mood:'happy'})"),
         *captain(200, 1700, 1.0, "curious", glass=True),
         label("1 DOG YEAR = 7?", None, y=230, size=90),
         cam=(1.08, 1.0)),
    shot("Nope",
         art(PARK + " + dog(470, 1500, 1.5, {t, mood:'confused'})"),
         stamp("NOPE", "Nope", y=600)),
    shot("Dogs",
         art(PARK + " + dog(220, 1500, 0.8*k, {t, mood:'happy'})"),
         art("speedLines(620, 1200, 1.0, t) + dog(640, 1500, 1.2*k, {t, mood:'happy'})", at="faster"),
         label("FAST START", "faster", y=230, col="#ff8a3d")),
    shot("By",
         art(PARK + " + cake(300, 1300, 1.0, t, 1)"),
         art("dog(640, 1500, 1.2*k, {t, mood:'happy', shades:1})", at="teenager"),
         count("fifteen", 15, "year", y=500, fmt="1 = {}", col="#7ee07a"),
         label("TEENAGER!", "teenager", y=230, col="#ffd23f")),
    shot("two",
         art(PARK + " + dog(460, 1500, 1.5, {t, mood:'happy'})"),
         count("nine", 24, "more", y=500, fmt="2 = {}", col="#7ee07a"),
         label("+9 YEARS", "nine", y=230)),
    shot("After",
         art(PARK + " + dog(460, 1500, 1.5, {t, mood:'happy'})"),
         label("THEN ~5 PER YEAR", "five", y=230, col="#7ee07a"),
         pop("+5", "five", x=250, y=700, size=110, col="#ffd23f"),
         pop("+5", "per", x=540, y=620, size=110, col="#ffd23f"),
         pop("+5", "dog", x=830, y=700, size=110, col="#ffd23f")),
    shot("size",
         art(PARK + " + dog(400, 1500, 1.6*k, {t, mood:'confused', col:'#6b4a2a', grey:1})", at="Big"),
         art("dog(830, 1500, 0.8*k, {t, mood:'happy', col:'#f2e2c4'})", at="small"),
         label("BIG DOGS AGE FASTER", "faster", y=230, col="#ff8a3d")),
    shot("puppy",
         art(PARK + " + dog(580, 1500, 1.3, {t, mood:'confused', shades:1})"),
         *captain(220, 1700, 1.1, "laugh", pose="point"),
         pop("MOODY TEEN!", "moody", y=330, size=96, col="#ffd23f")),
]
