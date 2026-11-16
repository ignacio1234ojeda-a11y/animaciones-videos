# Yawn Short sound cues (example)
def cues(T):
    c = []
    WH = lambda at: (at - 0.1, whoosh(0.3, 600, 5000), -30)
    c += [
        (T["yawnA"] + 0.05, yawn_snd(1.3), -24),
        (T["oxygen"] - 0.1, popsnd(500, 1000, 0.07), -25), (T["oxygen"] + 0.25, popsnd(700, 1400, 0.06), -25),
        WH(T["cutB"]), (T["cutB"] + 0.05, hiss(1.2), -32),
        (T["extra"], popsnd(400, 900, 0.08), -25), (T["extra"] + 0.1, gush(1.4), -33),
        (T["yawnB"] + 0.05, yawn_snd(0.9, 190), -24),
        (T["all"], clack(), -15), (T["all"] + 0.03, bonk_like(), -18),
        WH(T["cutC"]), (T["cutC"] + 0.05, xray(0.7), -30),
        (T["real"], popsnd(500, 1000, 0.07), -25),
        (T["brain"], heartbeat(4, 0.28), -24),
        (T["hot"], boing(0.6, 160), -18), (T["hot"] + 0.05, hiss(1.0), -26),
        WH(T["cutD"]),
        (T["yawnD"], yawn_snd(1.6, 160), -22),
        (T["pumps"], heartbeat(5, 0.3), -20),
        (T["blood"], popsnd(400, 900, 0.08), -24), (T["blood"] + 0.1, gush(1.0), -30),
        WH(T["cutE"]),
        (T["gulp"], whoosh(0.9, 300, 2500, 0.4), -24),
        (T["cools"], freeze_snd(0.8), -24),
        (T["radiator"], popsnd(500, 1300, 0.07), -24), (T["radiator"] + 0.15, ding(1760, 0.8), -23),
        WH(T["cutF"]),
        (T["warm"] - 0.1, whoosh(0.3, 400, 3000), -28), (T["warm"] + 0.2, knock(0.6), -22),
        (T["pack"] + 0.05, whoosh(0.3, 400, 3000), -28), (T["pack"] + 0.45, knock(0.8), -22),
    ]
    for i in range(4):
        at = T["four"] + 0.5 * i
        c += [(at, yawn_snd(0.45, 200 + 15 * i), -27), (at + 0.02, popsnd(600 + 150 * i, 1300 + 200 * i, 0.06), -24)]
    c += [
        (T["people"] + 0.75, yawn_snd(0.8, 150), -28), (T["people"] + 0.77, popsnd(400, 800, 0.06), -25),
        (T["more"], clack(), -16), (T["more"] + 0.02, boing(0.6, 220), -20),
        WH(T["cutG"]),
        (T["yawnG"], yawn_snd(1.3, 170), -22),
        (T["brainG"] - 0.1, popsnd(500, 1100, 0.07), -25), (T["brainG"], freeze_snd(0.6), -27),
        (T["cooling"], ding(2093, 0.9), -21),
    ]
    return c
