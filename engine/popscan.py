import subprocess, sys, numpy as np, cv2
path=sys.argv[1]; fps=float(sys.argv[2])
cap=cv2.VideoCapture(path); prev=None; d=[]
while True:
    ok,f=cap.read()
    if not ok: break
    g=cv2.GaussianBlur(cv2.resize(cv2.cvtColor(f,cv2.COLOR_BGR2GRAY),(270,480)),(5,5),0).astype(np.float32)
    if prev is not None: d.append(np.abs(g-prev).mean())
    prev=g
d=np.array(d)
for i in range(len(d)):
    lo,hi=max(0,i-15),min(len(d),i+16)
    med=np.median(d[lo:hi])+0.15
    if d[i]>2.2*med and d[i]>1.0:
        print(f"t={ (i+1)/fps:6.2f}s  diff={d[i]:.2f}  med={med:.2f}")
