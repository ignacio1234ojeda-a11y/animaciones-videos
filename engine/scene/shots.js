window.SPEC = {"shots": [{"t0": 0.0, "bg": "studio", "cam": [1.0, 1.05], "focus": [540, 1000], "items": [{"kind": "guy", "x": 540, "y": 1480, "sc": 2.1, "expr": "curious", "talk": true, "look": [0, -4], "pose": "rest", "at": null, "ch": [[0.782, {"expr": "confused", "pose": "think"}]]}, {"kind": "art", "code": "calendarPage(260, 640, 1.0*k, 'DAY', '1', '#4fa3e0', -6)", "at": 0.441, "out": null, "sfx": "pop", "hit": null}, {"kind": "art", "code": "calendarPage(820, 640, 1.0*k, 'YEAR', '1', '#e8413a', 6)", "at": 1.464, "out": null, "sfx": "pop", "hit": null}, {"kind": "label", "text": "DAY > YEAR ?", "at": 0.782, "x": 540, "y": 230, "col": "#ffd23f", "size": 64, "out": null, "sfx": "pop"}]}, {"t0": 1.914, "bg": "space", "cam": [1.0, 1.08], "focus": [540, 900], "items": [{"kind": "art", "code": "planet(540, 900, 330*k, '#f2b45a', t, {face:'happy', spin:0.05})", "at": 2.034, "out": null, "sfx": "pop", "hit": null}, {"kind": "label", "text": "VENUS", "at": 2.248, "x": 540, "y": 300, "col": "#f2b45a", "size": 64, "out": null, "sfx": "pop"}, {"kind": "stamp", "text": "YES!", "at": 2.89, "x": 540, "y": 1380, "col": "#2fa84f", "ang": -8, "out": null, "sfx": "clack", "hit": [10, 7]}]}, {"t0": 3.384, "bg": "space", "cam": [1.05, 1.0], "focus": [540, 1000], "items": [{"kind": "art", "code": "sunFace(540, 900, 0.75, t)", "at": null, "out": null, "sfx": null, "hit": null}, {"kind": "art", "code": "orbitRing(540, 900, 400, 400, 1)", "at": null, "out": null, "sfx": null, "hit": null}, {"kind": "art", "code": "planet(540 + 400*Math.cos(-1.6 + 1.1*(t - T.cut2)), 900 + 400*Math.sin(-1.6 + 1.1*(t - T.cut2)), 80, '#f2b45a', t, {face:'happy'})", "at": null, "out": null, "sfx": null, "hit": null}, {"kind": "count", "at": 5.034, "end": 6.563, "to": 225, "frm": 0, "x": 540, "y": 1480, "fmt": "{} DAYS", "size": 120, "col": "#ffd23f", "out": null, "sfx": "count"}, {"kind": "label", "text": "1 VENUS YEAR", "at": 3.941, "x": 540, "y": 230, "col": "#ffd23f", "size": 64, "out": null, "sfx": "pop"}]}, {"t0": 7.062, "bg": "space", "cam": [1.0, 1.06], "focus": [540, 820], "items": [{"kind": "art", "code": "planet(540, 820, 300*k, '#f2b45a', t, {face:'sleepy', spin:0.012})", "at": 7.182, "out": null, "sfx": "pop", "hit": null}, {"kind": "art", "code": "arrowCurve(540, 820, 380, -150, -40, '#8fd3ff')", "at": 7.649, "out": null, "sfx": "pop", "hit": null}, {"kind": "pop", "text": "Zzz", "at": 8.117, "x": 820, "y": 470, "size": 90, "col": "#fff", "ang": -8, "out": null, "sfx": "pop", "hit": null}, {"kind": "count", "at": 9.519, "end": 10.721, "to": 243, "frm": 0, "x": 540, "y": 1400, "fmt": "{} DAYS", "size": 120, "col": "#8fd3ff", "out": null, "sfx": "count"}, {"kind": "label", "text": "1 SPIN", "at": 8.818, "x": 540, "y": 230, "col": "#8fd3ff", "size": 64, "out": null, "sfx": "pop"}]}, {"t0": 11.155, "bg": "#fff0f4", "cam": [1.0, 1.05], "focus": [540, 1000], "items": [{"kind": "art", "code": "cake(540, 1000, 1.5*k, t)", "at": 11.463, "out": null, "sfx": "pop", "hit": null}, {"kind": "label", "text": "HAPPY BIRTHDAY!", "at": 11.463, "x": 540, "y": 300, "col": "#f7b2c8", "size": 64, "out": null, "sfx": "pop"}, {"kind": "art", "code": "calendarPage(830, 560, 0.75*k, 'TODAY', 'STILL', '#4fa3e0', 8)", "at": 12.774, "out": null, "sfx": "pop", "hit": null}, {"kind": "guy", "x": 230, "y": 1480, "sc": 1.5, "expr": "smug", "talk": true, "look": [0, -4], "pose": "cheer", "at": null, "ch": [[12.774, {"expr": "surprised", "pose": "shrug"}]]}]}, {"t0": 13.803, "bg": "#ffd9a8", "cam": [1.0, 1.05], "focus": [540, 1000], "items": [{"kind": "art", "code": "planet(540, 640, 230*k, '#f2b45a', t, {face:'happy', spin:-0.2})", "at": 13.923, "out": null, "sfx": "pop", "hit": null}, {"kind": "art", "code": "arrowCurve(540, 640, 300, -30, -150, '#ff8a3d')", "at": 14.573, "out": null, "sfx": "pop", "hit": null}, {"kind": "label", "text": "SPINS BACKWARDS", "at": 14.573, "x": 540, "y": 230, "col": "#ff8a3d", "size": 64, "out": null, "sfx": "pop"}, {"kind": "art", "code": "`<rect x='0' y='1250' width='1080' height='700' fill='#c2763a'/><line x1='0' y1='1250' x2='1080' y2='1250' stroke='#1c1c1e' stroke-width='8'/>` + sunFace(200, 1250 - 260*eo(prog(t, T.cut5 + 2.0, T.END)), 0.45, t)", "at": null, "out": null, "sfx": null, "hit": null}, {"kind": "label", "text": "WEST", "at": 16.521, "x": 200, "y": 1350, "col": "#fff", "size": 50, "out": null, "sfx": "pop"}, {"kind": "check", "at": 16.521, "ok": true, "x": 420, "y": 1100, "sc": 0.9, "out": null, "sfx": "ding"}]}, {"t0": 17.018, "bg": "space", "cam": [1.0, 1.05], "focus": [540, 1000], "items": [{"kind": "art", "code": "planet(540, 820, 280, '#f2b45a', t, {face:'happy', spin:0.03})", "at": null, "out": null, "sfx": null, "hit": null}, {"kind": "art", "code": "wallClock(540, 820, 150, -t*240, 0, 0.9*k)", "at": 18.932, "out": null, "sfx": "pop", "hit": null}, {"kind": "label", "text": "ITS OWN CLOCK", "at": 18.732, "x": 540, "y": 260, "col": "#ffd23f", "size": 64, "out": null, "sfx": "pop"}, {"kind": "guy", "x": 860, "y": 1480, "sc": 1.4, "expr": "smug", "talk": true, "look": [0, -4], "pose": "point", "at": null, "ch": []}]}], "hits": [[2.89, 10, 7]], "bg": "#ffffff"};
window.ENV = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.16, 0.5, 0.7, 0.73, 0.8, 0.85, 0.76, 0.53, 0.33, 0.18, 0.17, 0.48, 0.85, 0.99, 0.99, 0.98, 0.99, 1.0, 1.0, 1.0, 1.0, 0.96, 0.82, 0.66, 0.65, 0.72, 0.8, 0.9, 0.93, 0.88, 0.86, 0.84, 0.77, 0.64, 0.47, 0.43, 0.47, 0.43, 0.31, 0.18, 0.18, 0.44, 0.66, 0.68, 0.62, 0.57, 0.53, 0.51, 0.45, 0.38, 0.39, 0.49, 0.53, 0.43, 0.3, 0.31, 0.44, 0.52, 0.5, 0.49, 0.5, 0.48, 0.43, 0.39, 0.35, 0.33, 0.34, 0.35, 0.37, 0.4, 0.42, 0.43, 0.41, 0.4, 0.36, 0.32, 0.3, 0.3, 0.27, 0.21, 0.21, 0.17, 0.1, 0.09, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08, 0.27, 0.47, 0.6, 0.67, 0.73, 0.82, 0.85, 0.75, 0.57, 0.42, 0.46, 0.69, 0.92, 1.0, 1.0, 1.0, 0.98, 0.93, 0.88, 0.89, 0.96, 0.96, 0.86, 0.66, 0.45, 0.35, 0.32, 0.26, 0.33, 0.56, 0.64, 0.49, 0.31, 0.16, 0.05, 0.0, 0.12, 0.46, 0.77, 0.86, 0.82, 0.78, 0.78, 0.71, 0.63, 0.56, 0.47, 0.39, 0.34, 0.27, 0.21, 0.17, 0.17, 0.19, 0.19, 0.17, 0.14, 0.1, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.06, 0.26, 0.6, 0.89, 1.0, 1.0, 1.0, 0.98, 0.93, 0.9, 0.96, 1.0, 0.98, 0.91, 0.74, 0.54, 0.47, 0.47, 0.44, 0.41, 0.41, 0.41, 0.4, 0.49, 0.75, 0.95, 0.96, 0.79, 0.47, 0.18, 0.03, 0.07, 0.33, 0.67, 0.89, 0.94, 0.86, 0.7, 0.5, 0.34, 0.25, 0.14, 0.09, 0.25, 0.51, 0.63, 0.6, 0.49, 0.36, 0.35, 0.37, 0.36, 0.35, 0.31, 0.38, 0.62, 0.73, 0.67, 0.63, 0.65, 0.64, 0.59, 0.57, 0.53, 0.49, 0.49, 0.45, 0.4, 0.37, 0.3, 0.18, 0.05, 0.0, 0.0, 0.07, 0.22, 0.38, 0.48, 0.52, 0.52, 0.49, 0.39, 0.21, 0.05, 0.05, 0.19, 0.31, 0.33, 0.28, 0.23, 0.38, 0.75, 0.96, 0.96, 0.92, 0.81, 0.7, 0.64, 0.64, 0.71, 0.83, 0.87, 0.82, 0.72, 0.64, 0.62, 0.66, 0.66, 0.55, 0.39, 0.22, 0.11, 0.12, 0.16, 0.24, 0.45, 0.64, 0.67, 0.65, 0.66, 0.64, 0.57, 0.48, 0.36, 0.17, 0.04, 0.0, 0.0, 0.08, 0.39, 0.75, 0.84, 0.84, 0.85, 0.82, 0.81, 0.75, 0.69, 0.66, 0.57, 0.4, 0.24, 0.17, 0.18, 0.24, 0.22, 0.16, 0.26, 0.43, 0.53, 0.56, 0.56, 0.55, 0.51, 0.44, 0.28, 0.08, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08, 0.3, 0.54, 0.6, 0.56, 0.52, 0.51, 0.49, 0.46, 0.42, 0.37, 0.32, 0.3, 0.3, 0.23, 0.14, 0.19, 0.23, 0.19, 0.16, 0.11, 0.08, 0.13, 0.18, 0.17, 0.16, 0.1, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08, 0.36, 0.72, 0.84, 0.74, 0.78, 0.94, 0.9, 0.59, 0.26, 0.19, 0.31, 0.43, 0.45, 0.37, 0.21, 0.06, 0.0, 0.05, 0.34, 0.8, 1.0, 1.0, 0.98, 0.95, 0.92, 0.93, 0.93, 0.93, 0.88, 0.73, 0.54, 0.45, 0.43, 0.42, 0.43, 0.4, 0.48, 0.78, 0.98, 1.0, 0.97, 0.89, 0.76, 0.57, 0.41, 0.4, 0.42, 0.41, 0.4, 0.34, 0.21, 0.16, 0.35, 0.58, 0.72, 0.83, 0.87, 0.86, 0.82, 0.8, 0.79, 0.74, 0.64, 0.54, 0.48, 0.48, 0.51, 0.5, 0.43, 0.36, 0.31, 0.29, 0.26, 0.23, 0.22, 0.2, 0.19, 0.17, 0.11, 0.03, 0.0, 0.0, 0.0, 0.06, 0.21, 0.34, 0.48, 0.65, 0.77, 0.83, 0.85, 0.85, 0.86, 0.86, 0.82, 0.69, 0.42, 0.18, 0.22, 0.32, 0.3, 0.29, 0.48, 0.72, 0.81, 0.78, 0.72, 0.68, 0.67, 0.65, 0.62, 0.61, 0.59, 0.53, 0.34, 0.14, 0.15, 0.24, 0.23, 0.32, 0.55, 0.7, 0.67, 0.57, 0.44, 0.28, 0.12, 0.07, 0.14, 0.25, 0.29, 0.21, 0.06, 0.0, 0.0, 0.07, 0.24, 0.33, 0.28, 0.32, 0.56, 0.75, 0.75, 0.71, 0.66, 0.59, 0.55, 0.58, 0.68, 0.73, 0.67, 0.57, 0.51, 0.46, 0.44, 0.48, 0.43, 0.31, 0.17, 0.05, 0.0, 0.0, 0.0, 0.03, 0.19, 0.41, 0.52, 0.53, 0.53, 0.53, 0.5, 0.43, 0.37, 0.39, 0.43, 0.41, 0.37, 0.31, 0.2, 0.05, 0.0, 0.0, 0.0, 0.0, 0.04, 0.16, 0.28, 0.36, 0.43, 0.47, 0.5, 0.49, 0.43, 0.38, 0.35, 0.31, 0.3, 0.28, 0.23, 0.2, 0.2, 0.17, 0.16, 0.16, 0.11, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.04, 0.14, 0.21, 0.29, 0.51, 0.74, 0.83, 0.85, 0.9, 0.97, 0.97, 0.83, 0.59, 0.41, 0.29, 0.24, 0.46, 0.83, 1.0, 1.0, 1.0, 1.0, 0.98, 0.91, 0.65, 0.28, 0.05, 0.0, 0.0, 0.0, 0.04, 0.24, 0.6, 0.87, 0.9, 0.84, 0.82, 0.81, 0.79, 0.75, 0.67, 0.58, 0.57, 0.64, 0.66, 0.49, 0.22, 0.1, 0.21, 0.36, 0.4, 0.39, 0.38, 0.37, 0.42, 0.61, 0.79, 0.81, 0.75, 0.7, 0.71, 0.75, 0.77, 0.77, 0.77, 0.73, 0.62, 0.43, 0.2, 0.04, 0.0, 0.0, 0.0, 0.06, 0.25, 0.44, 0.43, 0.24, 0.09, 0.1, 0.13, 0.09, 0.12, 0.29, 0.47, 0.59, 0.67, 0.68, 0.62, 0.56, 0.46, 0.25, 0.06, 0.07, 0.2, 0.23, 0.26, 0.44, 0.57, 0.61, 0.63, 0.62, 0.61, 0.64, 0.64, 0.62, 0.64, 0.61, 0.56, 0.56, 0.54, 0.5, 0.49, 0.47, 0.43, 0.36, 0.28, 0.16, 0.1, 0.22, 0.42, 0.5, 0.49, 0.47, 0.48, 0.45, 0.38, 0.37, 0.32, 0.24, 0.2, 0.2, 0.15, 0.11, 0.19, 0.27, 0.27, 0.25, 0.22, 0.15, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.09, 0.32, 0.55, 0.63, 0.71, 0.86, 0.93, 0.8, 0.48, 0.17, 0.16, 0.32, 0.4, 0.36, 0.21, 0.06, 0.0, 0.1, 0.46, 0.85, 1.0, 1.0, 1.0, 0.99, 0.97, 0.98, 0.97, 0.86, 0.64, 0.47, 0.36, 0.18, 0.04, 0.08, 0.41, 0.83, 1.0, 0.98, 0.93, 0.87, 0.83, 0.79, 0.67, 0.39, 0.1, 0.0, 0.0, 0.03, 0.2, 0.46, 0.61, 0.64, 0.61, 0.59, 0.57, 0.53, 0.44, 0.33, 0.22, 0.12, 0.07, 0.1, 0.14, 0.13, 0.12, 0.13, 0.15, 0.17, 0.2, 0.21, 0.29, 0.57, 0.77, 0.7, 0.52, 0.41, 0.48, 0.59, 0.62, 0.54, 0.4, 0.32, 0.33, 0.34, 0.33, 0.32, 0.31, 0.44, 0.69, 0.75, 0.71, 0.71, 0.72, 0.72, 0.71, 0.69, 0.66, 0.62, 0.58, 0.55, 0.54, 0.57, 0.59, 0.62, 0.68, 0.7, 0.68, 0.69, 0.69, 0.66, 0.62, 0.59, 0.48, 0.31, 0.24, 0.27, 0.36, 0.46, 0.52, 0.49, 0.42, 0.37, 0.31, 0.24, 0.23, 0.3, 0.41, 0.46, 0.46, 0.45, 0.44, 0.47, 0.47, 0.44, 0.41, 0.39, 0.37, 0.36, 0.38, 0.44, 0.52, 0.59, 0.6, 0.57, 0.56, 0.49, 0.38, 0.35, 0.3, 0.22, 0.15, 0.05, 0.04, 0.12, 0.17, 0.17, 0.16, 0.14, 0.1, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.06, 0.24, 0.52, 0.77, 0.91, 0.98, 0.99, 0.95, 0.9, 0.89, 0.96, 1.0, 0.96, 0.81, 0.6, 0.49, 0.42, 0.24, 0.06, 0.0, 0.0, 0.1, 0.44, 0.85, 1.0, 1.0, 1.0, 0.93, 0.71, 0.49, 0.44, 0.43, 0.41, 0.42, 0.35, 0.18, 0.04, 0.0, 0.16, 0.5, 0.72, 0.76, 0.75, 0.68, 0.57, 0.47, 0.43, 0.46, 0.54, 0.64, 0.71, 0.73, 0.7, 0.67, 0.66, 0.66, 0.67, 0.66, 0.6, 0.48, 0.36, 0.39, 0.55, 0.64, 0.61, 0.55, 0.53, 0.56, 0.55, 0.44, 0.26, 0.13, 0.19, 0.28, 0.32, 0.38, 0.41, 0.43, 0.46, 0.52, 0.57, 0.56, 0.52, 0.53, 0.5, 0.44, 0.35, 0.18, 0.09, 0.14, 0.13, 0.04, 0.06, 0.27, 0.53, 0.68, 0.75, 0.72, 0.66, 0.65, 0.63, 0.57, 0.38, 0.16, 0.09, 0.04, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
// Spec runtime: turns window.SPEC (written by make.py) into SHOTS/HITS. Generic items, auto camera, slide transitions,
// talking host (mouth from voice envelope), blinking + breathing.

// ---- talking mouth + blink on top of any guy face
const _faceBase = guyFace;
guyFace = function (o) {
  let s = _faceBase(o);
  const lx = o.lookX || 0, ly = o.lookY || 0, skin = o.skin || WHITE;
  const mx = -17 + lx * 0.6, my = -262 + ly * 0.4;
  const k = o.talk || 0;
  if (k > 0.06 && o.expr !== 'laugh' && o.expr !== 'cry' && o.expr !== 'yawn') {
    s += `<ellipse cx="${n(mx)}" cy="${n(my + 1)}" rx="24" ry="15" fill="${skin}"/>`;
    s += `<path d="M${n(mx - 10 - 6 * k)},${n(my - 3)} Q${n(mx)},${n(my - 6)} ${n(mx + 10 + 6 * k)},${n(my - 3)} Q${n(mx + 8 + 4 * k)},${n(my + 4 + 16 * k)} ${n(mx)},${n(my + 5 + 17 * k)} Q${n(mx - 8 - 4 * k)},${n(my + 4 + 16 * k)} ${n(mx - 10 - 6 * k)},${n(my - 3)} Z" fill="${INK}"/>`;
    s += `<ellipse cx="${n(mx + 1)}" cy="${n(my + 2 + 13 * k)}" rx="${n(4 + 4 * k)}" ry="${n(1.5 + 3 * k)}" fill="${SKIN_PINK}"/>`;
  }
  if (o.blink && o.expr !== 'laugh' && o.expr !== 'cry') {
    for (const ex of [-34 + lx, 0 + lx]) s += `<ellipse cx="${n(ex)}" cy="${n(-306 + ly)}" rx="15" ry="19" fill="${skin}"/><path d="M${n(ex - 11)},${n(-304 + ly)} Q${n(ex)},${n(-297 + ly)} ${n(ex + 11)},${n(-304 + ly)}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return s;
};

const POSES = {
  rest: () => ({}),
  point: (t) => ({ armR: [110, -330], pointR: -60 }),
  pointL: (t) => ({ armL: [-110, -250], pointL: -120 }),
  pointR: (t) => ({ armR: [120, -230], pointR: -40 }),
  ears: (t) => ({ armL: [-40, -300], armR: [40, -300] }),
  shrug: (t) => ({ armL: [-110, -170], armR: [110, -170] }),
  think: (t) => ({ armR: [-12, -250], bendR: 30 }),
  wave: (t) => ({ armR: [120, -330 + 22 * Math.sin(t * 12)], pointR: -80 }),
  cheer: (t) => ({ armL: [-100, -360 + 10 * Math.sin(t * 9)], armR: [100, -360 - 10 * Math.sin(t * 9)] }),
  hips: (t) => ({ armL: [-60, -120], armR: [60, -120], bendL: -40, bendR: 40 }),
};
const envAt = (t) => { const E = window.ENV || []; const i = Math.round((t - 0.0) * 60); return i >= 0 && i < E.length ? E[i] : 0; };
const kOf = (t, it) => {
  if (it.at === null || it.at === undefined) return 1;
  let k = clamp(pop(t, it.at, it.f || 2.4, 7), 0, 1.15);
  if (it.out !== null && it.out !== undefined) k *= 1 - eio(prog(t, it.out, it.out + 0.25));
  return k;
};
const BGS = {
  studio: () => `<rect width="${W}" height="${H}" fill="url(#studio)"/><rect x="0" y="1480" width="${W}" height="440" fill="#c9b6f2"/><line x1="0" y1="1480" x2="${W}" y2="1480" stroke="${INK}" stroke-width="6"/>`,
  day: () => dayBg(),
  night: (t) => nightBg(0),
  space: (t) => {
    let s = `<rect width="${W}" height="${H}" fill="#151a33"/>`;
    for (let i = 0; i < 60; i++) { const r = rng(i * 13 + 5); s += `<circle cx="${n(r() * W)}" cy="${n(r() * H)}" r="${n(2 + r() * 4)}" fill="#fff" opacity="${n(0.3 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)))}"/>`; }
    return s;
  },
  paper: () => { let s = `<rect width="${W}" height="${H}" fill="#fff8e6"/>`; for (let y = 120; y < H; y += 90) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ecdfc0" stroke-width="4"/>`; return s; },
};
const bgOf = (b, t) => BGS[b] ? BGS[b](t) : `<rect width="${W}" height="${H}" fill="${b}"/>`;

function drawItem(it, t, T) {
  const k = kOf(t, it);
  if (k <= 0.01 && it.kind !== 'guy') return '';
  switch (it.kind) {
    case 'guy': {
      let st = { expr: it.expr, pose: it.pose || 'rest', look: it.look || [0, -4], x: it.x, y: it.y, sc: it.sc, talk: it.talk };
      let lastCh = -9;
      for (const [tc, c] of it.ch || []) if (t >= tc) { Object.assign(st, c); lastCh = tc; }
      const o = { expr: st.expr, t, lookX: st.look[0], lookY: st.look[1] };
      Object.assign(o, POSES[st.pose] ? POSES[st.pose](t) : {});
      o.sy = 1 + 0.012 * Math.sin(t * 2.6 + st.x);
      o.lean = (o.lean || 0) + 1.5 * Math.sin(t * 1.3 + st.x);
      const since = t - lastCh;
      if (since >= 0 && since < 0.35) o.hop = -40 * Math.sin(Math.PI * since / 0.35);
      if (st.talk) o.talk = envAt(t);
      const bt = (t + st.x * 0.003) % 3.4;
      o.blink = bt > 3.25 && st.expr !== 'surprised';
      const ent = it.at === undefined || it.at === null ? 1 : clamp(pop(t, it.at, 2.4, 7), 0, 1.12);
      if (ent <= 0.01) return '';
      return shadow(st.x, st.y + 4, 46 * st.sc * ent) + `<g transform="translate(${n(st.x)} ${n(st.y)}) scale(${n(st.sc * ent)})">${guy(o)}</g>`;
    }
    case 'label': return label(it.x, it.y, k, it.text, it.col, it.ink || INK, it.size);
    case 'stamp': return stamp(it.x, it.y, k, it.text, it.col, it.ang);
    case 'check': return check(it.x, it.y, k * it.sc, it.ok);
    case 'pop': return popG(it.x, it.y, k, txt(0, 0, it.text, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 11) }), it.ang);
    case 'count': {
      const v = lerp(it.frm, it.to, eo(prog(t, it.at, it.end)));
      const s = it.fmt.replace('{}', Math.round(v).toLocaleString('en-US'));
      return popG(it.x, it.y, k, txt(0, 0, s, it.size, it.col, { stroke: INK, sw: Math.round(it.size / 10) }));
    }
    case 'art': return it.fn(t, k, T);
  }
  return '';
}

function drawShot(i, t) {
  const sh = SPEC.shots[i];
  const t0 = sh.t0, t1 = i + 1 < SPEC.shots.length ? SPEC.shots[i + 1].t0 : T.END;
  let body = '';
  for (const it of sh.items) body += drawItem(it, t, T);
  const z = lerp(sh.cam[0], sh.cam[1], eio(prog(t, t0, t1)));
  return bgOf(sh.bg, t) + `<g transform="translate(${sh.focus[0]} ${sh.focus[1]}) scale(${n(z)}) translate(${-sh.focus[0]} ${-sh.focus[1]})">${body}</g>`;
}

(function build() {
  for (const sh of SPEC.shots) for (const it of sh.items) if (it.kind === 'art') it.fn = new Function('t', 'k', 'T', 'return ' + it.code + ';');
  const TR = 0.22;
  const master = (t) => {
    let i = 0;
    SPEC.shots.forEach((sh, j) => { if (t >= sh.t0) i = j; });
    const u = i > 0 ? prog(t, SPEC.shots[i].t0, SPEC.shots[i].t0 + TR) : 1;
    if (u >= 1) return drawShot(i, t);
    const e = eio(u);
    return `<g transform="translate(${n(-W * e)} 0)">${drawShot(i - 1, t)}</g><g transform="translate(${n(W * (1 - e))} 0)">${drawShot(i, t)}</g>`;
  };
  window.SHOTS = [[0, master]];
  window.HITS = SPEC.hits;
  window.BG = SPEC.bg || '#ffffff';
})();
