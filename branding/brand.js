const fs=require('fs'),vm=require('vm');
const ctx={Math,console,window:{T:{}},document:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8')+';this.L={guy,captainCap,spyglass,captainCoat,cloud};',ctx);
const {guy,captainCap,spyglass,captainCoat}=ctx.L;
const INK='#1c1c1e',COAT='#1f3a68',FONT="font-family=\"Poppins\" font-weight=\"bold\"";
function cc(x,y,sc,o,glass){return `<g transform="translate(${x} ${y}) scale(${sc})">${guy(Object.assign({body:COAT,legs:'#fbfbf7'},o))}${captainCoat(0,0,1)}${captainCap(0,0,1)}${glass||''}</g>`;}
const LOOK={expr:'curious',armR:[78,-300],bendR:-30};
const GLASS=spyglass(8,-306,0.55,-10);
function puffy(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-120,30 Q-140,-20 -90,-30 Q-80,-80 -20,-70 Q20,-110 70,-60 Q130,-60 125,0 Q150,30 110,40 L-100,40 Q-130,40 -120,30 Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/></g>`;}
function gull(x,y,s){return `<path transform="translate(${x} ${y}) scale(${s})" d="M-40,0 Q-20,-25 0,0 Q20,-25 40,0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;}
function waves(y,col,amp,ph){let d=`M-50,${y}`;for(let x=-50;x<=2610;x+=80)d+=` Q${x+20},${y-amp} ${x+40},${y} T${x+80},${y}`;return `<path d="${d} L2610,1500 L-50,1500 Z" fill="${col}" stroke="${INK}" stroke-width="7" transform="translate(${ph} 0)"/>`;}
function ship(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110,0 L110,0 L80,45 L-80,45 Z" fill="#a8743a" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><line x1="0" y1="0" x2="0" y2="-170" stroke="${INK}" stroke-width="9"/><path d="M8,-160 L95,-30 L8,-30 Z" fill="#fbfbf7" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M-8,-140 L-80,-30 L-8,-30 Z" fill="#fbfbf7" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><path d="M0,-170 L40,-160 L0,-150 Z" fill="#e8413a" stroke="${INK}" stroke-width="5"/></g>`;}
function star(x,y,r,col='#ffd23f'){let d='';for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*0.4:r;d+=(i?'L':'M')+(x+rr*Math.cos(a-Math.PI/2)).toFixed(1)+','+(y+rr*Math.sin(a-Math.PI/2)).toFixed(1);}return `<path d="${d}Z" fill="${col}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;}
function qmark(x,y,s,col){return `<text x="${x}" y="${y}" ${FONT} font-size="${s}" fill="${col}" stroke="${INK}" stroke-width="7" paint-order="stroke" text-anchor="middle" transform="rotate(12 ${x} ${y})">?</text>`;}

// ---------------- banner 2560x1440 (safe area 507..2053 x 508..931)
let b=`<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440" viewBox="0 0 2560 1440"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fc3f0"/><stop offset="1" stop-color="#d6f1ff"/></linearGradient></defs><rect width="2560" height="1440" fill="url(#sky)"/>`;
b+=`<circle cx="2250" cy="260" r="120" fill="#ffd23f" stroke="${INK}" stroke-width="9"/>`;
b+=puffy(260,250,1.3)+puffy(1900,170,1.0)+puffy(1180,140,0.8)+puffy(380,560,0.7);
b+=gull(2100,520,1.2)+gull(2190,470,0.9)+gull(450,400,1);
b+=ship(2150,905,0.75);
b+=`<rect x="520" y="858" width="280" height="34" rx="6" fill="#a8743a" stroke="${INK}" stroke-width="8"/>`+[550,660,770].map(x=>`<rect x="${x-14}" y="888" width="28" height="120" fill="#7a4f22" stroke="${INK}" stroke-width="7"/>`).join('');
b+=cc(655,861,0.74,LOOK,GLASS);
b+=waves(905,'#3d8fd6',22,0)+waves(990,'#2a6fb8',26,-40)+waves(1100,'#1f3a68',30,-20);
// title
b+=`<g transform="rotate(-3 1450 650)"><rect x="900" y="560" width="1120" height="180" rx="40" fill="#fff" stroke="${INK}" stroke-width="12"/>`;
b+=`<text x="1460" y="688" ${FONT} font-size="104" text-anchor="middle" fill="${INK}">Culture With <tspan fill="#e8413a">Data</tspan></text></g>`;
b+=`<rect x="1010" y="770" width="900" height="92" rx="24" fill="${COAT}" stroke="${INK}" stroke-width="9"/><text x="1460" y="832" ${FONT} font-size="46" text-anchor="middle" fill="#fff">Weird true stories from the past</text>`;
b+=star(2000,575,42)+star(955,820,30)+qmark(1980,860,110,'#e8413a');
b+=`</svg>`;
fs.writeFileSync('banner.svg',b);

// ---------------- avatar 800x800
let a=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><clipPath id="c"><circle cx="400" cy="400" r="388"/></clipPath></defs>`;
a+=`<g clip-path="url(#c)"><rect width="800" height="800" fill="#ffd23f"/>`;
a+=`<circle cx="400" cy="400" r="300" fill="#ffe27a"/>`;
a+=star(130,190,40,'#fff')+star(670,600,30,'#fff')+qmark(625,300,140,'#e8413a');
a+=cc(360,1150,2.25,LOOK,GLASS);
a+=`</g><circle cx="400" cy="400" r="388" fill="none" stroke="${INK}" stroke-width="16"/></svg>`;
fs.writeFileSync('avatar.svg',a);
