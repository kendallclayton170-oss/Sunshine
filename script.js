const $=id=>document.getElementById(id);
// [sun, glow, text, soft text]
const PRE={gold:['#ffd36b','#ff9a3c','#fbe9c6','#d9b98a'],ember:['#ff9a70','#d6402b','#ffdccb','#e0a088'],moon:['#d6e6ff','#6f9bff','#e6f0ff','#9fb9e3'],rose:['#ffc6da','#e0568a','#ffe3ee','#dba0b8']};
const pad=n=>String(n).padStart(2,'0');
const loc=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
const al=(c,a)=>c+Math.round(Math.max(0,Math.min(1,a))*255).toString(16).padStart(2,'0');
const hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const FONT='Georgia,serif';

const CFG=window.CONFIG||{};
const PERSONAL_KEY='ec-personal-settings';
const DEVICE_ID_KEY='ec-device-id';
const LEGACY_EDITS_KEY='ec-local-edits';
const roomCacheKey=roomCode=>`ec-room-cache:${roomCode}`;
let personalSettings={};
try{
  const saved=JSON.parse(localStorage.getItem(PERSONAL_KEY)||'{}');
  if(saved&&typeof saved==='object'&&!Array.isArray(saved))personalSettings=saved;
}catch(error){}
try{
  const legacy=JSON.parse(localStorage.getItem(LEGACY_EDITS_KEY)||'{}');
  if(legacy&&typeof legacy==='object'&&!Array.isArray(legacy)){
    if(typeof personalSettings.pre!=='string'&&typeof legacy.pre==='string')personalSettings.pre=legacy.pre;
    if(typeof personalSettings.placeA!=='string'&&typeof legacy.placeA==='string')personalSettings.placeA=legacy.placeA;
    if(typeof personalSettings.placeB!=='string'&&typeof legacy.placeB==='string')personalSettings.placeB=legacy.placeB;
    delete legacy.pre;delete legacy.placeA;delete legacy.placeB;
    delete legacy.title;delete legacy.who;delete legacy.msg;delete legacy.when;delete legacy.created;
    if(Object.keys(legacy).length)localStorage.setItem(LEGACY_EDITS_KEY,JSON.stringify(legacy));
    else localStorage.removeItem(LEGACY_EDITS_KEY);
  }
}catch(error){}
const makeDeviceId=()=>{
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
  return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
};
let deviceId=localStorage.getItem(DEVICE_ID_KEY);
if(!deviceId){deviceId=makeDeviceId();try{localStorage.setItem(DEVICE_ID_KEY,deviceId)}catch(error){}}
let personal={
  pre:typeof personalSettings.pre==='string'&&Object.hasOwn(PRE,personalSettings.pre)?personalSettings.pre:CFG.pre,
  roomCode:typeof personalSettings.roomCode==='string'?personalSettings.roomCode:'',
  myName:typeof personalSettings.myName==='string'?personalSettings.myName:'',
  placeA:typeof personalSettings.placeA==='string'?personalSettings.placeA:(typeof CFG.placeA==='string'?CFG.placeA:''),
  placeB:typeof personalSettings.placeB==='string'?personalSettings.placeB:(typeof CFG.placeB==='string'?CFG.placeB:'')
};
let S={title:'Until we’re together',who:'',when:'',msg:'',created:0,pre:'gold',seen:false,placeA:'',placeB:'',miles:0};
Object.assign(S,CFG);delete S.notes;delete S.words;delete S.songs;delete S.sync;delete S.version;
S.created=CFG.start?new Date(CFG.start).getTime():0;
S.pre=personal.pre||'gold';S.placeA=personal.placeA;S.placeB=personal.placeB;
let sharedContent={songs:[],wishes:[],message:null};
let messageDirty=false;
try{
  const previous=JSON.parse(localStorage.getItem('ec')||'{}');
  if(previous&&typeof previous==='object')S.seen=Boolean(previous.seen);
}catch(error){}
if(!S.when){const t=new Date(Date.now()+7*864e5);t.setMinutes(0,0,0);S.when=loc(t)}
if(!S.created)S.created=Date.now();
const save=()=>{
  try{
    personal={...personal,pre:S.pre,roomCode:personal.roomCode,myName:personal.myName,placeA:S.placeA,placeB:S.placeB};
    localStorage.setItem(PERSONAL_KEY,JSON.stringify(personal));
    $('local-edits-status').textContent='Color, room, name, and places are saved on this device only.';
  }catch(error){
    $('local-edits-status').textContent='Could not save personal settings on this device.';
  }
  try{localStorage.setItem('ec',JSON.stringify({seen:S.seen}))}catch(error){}
};
const target=()=>new Date(S.when).getTime();
const HISTORY_KEY='ec-countdown-history';
let countdownHistory=[];
try{
  const savedHistory=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
  if(Array.isArray(savedHistory))countdownHistory=savedHistory.filter(item=>item&&Number.isFinite(item.when));
}catch(error){}
function archivePastCountdown(when=target()){
  if(!Number.isFinite(when)||when>Date.now()||countdownHistory.some(item=>item.when===when))return;
  countdownHistory.push({
    when,
    title:String(S.title||'Until Totality'),
    who:String(S.who||''),
    message:String(S.msg||'')
  });
  countdownHistory.sort((a,b)=>b.when-a.when);
  let saved=true;
  try{
    localStorage.setItem(HISTORY_KEY,JSON.stringify(countdownHistory));
  }catch(error){
    saved=false;
  }
  renderCountdownHistory();
  if(!saved)$('history-status').textContent='Could not save this countdown to history in this browser.';
}
function renderCountdownHistory(){
  const list=$('history-list'),status=$('history-status');
  if(!list||!status)return;
  list.replaceChildren();
  status.textContent=countdownHistory.length
    ?`${countdownHistory.length} past ${countdownHistory.length===1?'countdown':'countdowns'}`
    :'Your finished countdowns will be saved here.';
  for(const item of countdownHistory){
    const card=document.createElement('article'),title=document.createElement('h3'),date=document.createElement('div'),names=document.createElement('div');
    card.className='history-card';
    title.textContent=item.title||'Until Totality';
    date.className='history-date';
    date.textContent=new Date(item.when).toLocaleString(undefined,{dateStyle:'long',timeStyle:'short'});
    card.append(title,date);
    if(item.who){names.className='history-names';names.textContent=item.who;card.append(names)}
    if(item.message){const message=document.createElement('p');message.textContent=item.message;card.append(message)}
    list.append(card);
  }
}
const WORDS=Object.assign({week:'This week.',tomorrow:'Tomorrow.',today:'Today.',hour:'One hour.',ten:'Ten minutes.',minute:'One minute.',together:'Together for'},CFG.words||{});

// canvas
const cv=$('c'),ctx=cv.getContext('2d');let w,h,HN=null;
function size(){HN=null;const r=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;cv.width=w*r;cv.height=h*r;cv.style.width=w+'px';cv.style.height=h+'px';ctx.setTransform(r,0,0,r,0,0)}
addEventListener('resize',size);size();
const stars=Array.from({length:320},()=>{
  const bright=Math.random()<.1;
  return{
    x:Math.random(),y:Math.random(),
    r:bright?1.05+Math.random()*.7:.2+Math.random()*.7,
    p:Math.random()*6.28,
    speed:.55+Math.random()*1.15,
    glow:.35+Math.random()*.65
  };
});
const nebulaDust=Array.from({length:340},()=>{
  const cluster=Math.random()<.72;
  const centers=[[.18,.34],[.48,.3],[.78,.38],[.35,.53],[.68,.56]];
  const center=centers[Math.random()*centers.length|0];
  return{
    x:cluster?Math.max(0,Math.min(1,center[0]+(Math.random()+Math.random()-1)*.2)):Math.random(),
    y:cluster?Math.max(.08,Math.min(.7,center[1]+(Math.random()+Math.random()-1)*.12)):.08+Math.random()*.62,
    r:.35+Math.random()*1.5,
    p:Math.random()*6.28,
    color:Math.random()<.55?'#77aaff':'#bd82ff'
  };
});
const milkyWayDust=Array.from({length:460},()=>({
  x:-.4+Math.random()*1.8,
  offset:(Math.random()+Math.random()-1)*.12,
  r:.25+Math.random()*1.15,
  a:.12+Math.random()*.38,
  color:Math.random()<.54?'#a9c5ff':Math.random()<.5?'#d9b8ff':'#fff1d2'
}));
const sh=[];
const ff=Array.from({length:42},()=>({x:Math.random(),y:Math.random(),p:Math.random()*6.28,s:.15+Math.random()*.35,r:1.4+Math.random()*1.8}));
const pt=[];let wst=null,nextWish=performance.now()+9000,bursted=0;
const spark=(x,y,n,o)=>{for(let i=0;i<n&&pt.length<700;i++){const a=Math.random()*6.2832,v=(o.v||1)*(.3+Math.random());pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:o.g||0,l:1,d:o.d||.02,r:(o.r||1.6)*(.6+Math.random()*.8),c:o.c||'#ffe9a8',star:Math.random()<.35})}};
// felt: a woolly grain laid over everything
{const t=document.createElement('canvas');t.width=t.height=256;const x=t.getContext('2d');
 for(let i=0;i<5000;i++){const v=Math.random()<.5?255:0;x.fillStyle='rgba('+v+','+v+','+v+','+Math.random()*.22+')';x.fillRect(Math.random()*256,Math.random()*256,1+Math.random(),1+Math.random())}
 x.lineWidth=.7;
 for(let i=0;i<500;i++){const a=Math.random()*6.28,px=Math.random()*256,py=Math.random()*256,l=3+Math.random()*7;x.strokeStyle='rgba(255,'+(200+Math.random()*50|0)+',170,'+Math.random()*.16+')';x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a)*l,py+Math.sin(a)*l*.5,px+Math.cos(a+.5)*l*1.5,py+Math.sin(a+.5)*l*1.5);x.stroke()}
 $('felt').style.backgroundImage='url('+t.toDataURL()+')'}

// time: real countdown, or a 12-second preview. f = fraction of the wait remaining
let pv=0,manualSpaceEvent=null;
function state(now){
  if(pv){const x=(now-pv)/12000;return x>=1?{d:0,done:true,rem:0,f:0,since:now-pv-12000}:{d:2.4*(1-x),done:false,rem:(1-x)*12000,f:1-x,since:0}}
  const t=target(),rem=t-Date.now();
  if(!(rem>0))return{d:0,done:true,rem:0,f:0,since:-rem};
  const p=Math.min(1,Math.max(0,1-rem/Math.max(1,t-S.created)));
  const d=rem>=36e5?1:rem>6e4?.25+.75*(rem-6e4)/(36e5-6e4):.25*rem/6e4;
  return{d,done:false,rem,f:1-p,since:0};
}

function buildHeart(size){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const heart=canvas.getContext('2d');
  let seed=7;
  const random=()=>{
    seed=(seed+0x6d2b79f5)|0;
    let value=Math.imul(seed^seed>>>15,1|seed);
    value=value+Math.imul(value^value>>>7,61|value)^value;
    return((value^value>>>14)>>>0)/4294967296;
  };
  const scale=size*.68/32;
  const point=t=>[
    size/2+scale*16*Math.sin(t)**3,
    size/2-scale*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)-2)
  ];
  const blob=(x,y,r,color,alpha)=>{
    const glow=heart.createRadialGradient(x,y,0,x,y,r);
    glow.addColorStop(0,al(color,alpha));
    glow.addColorStop(1,al(color,0));
    heart.fillStyle=glow;
    heart.fillRect(x-r,y-r,r*2,r*2);
  };
  const clouds=['#8a5a8f','#c9777f','#e0a060','#5a78c8'];
  heart.globalCompositeOperation='lighter';
  for(let i=0;i<48;i++){
    const[x,y]=point(random()*6.2832);
    blob(
      x+(random()-.5)*size*.09,
      y+(random()-.5)*size*.09,
      size*(.045+random()*.105),
      clouds[i%clouds.length],
      .08+random()*.07
    );
  }
  blob(size/2,size/2,size*.2,'#e0a060',.4);
  for(let i=0;i<2600;i++){
    const[x,y]=point(random()*6.2832),spread=size*.022;
    const px=x+(random()+random()+random()-1.5)*spread;
    const py=y+(random()+random()+random()-1.5)*spread;
    const radius=.5+random()*1.2;
    heart.fillStyle=random()<.16
      ?`rgba(255,190,110,${.4+random()*.5})`
      :`rgba(190,210,255,${.2+random()*.5})`;
    heart.fillRect(px,py,radius,radius);
  }
  for(let i=0;i<130;i++){
    const[x,y]=point(random()*6.2832);
    blob(x+(random()-.5)*size*.07,y+(random()-.5)*size*.07,3+random()*5,'#ffb860',.8);
  }
  for(let i=0;i<500;i++){
    const angle=i*.22,radius=size*.004*Math.pow(1.035,i%90)*(1+(random()-.5)*.3);
    heart.fillStyle=`rgba(255,170,100,${.15+random()*.35})`;
    heart.fillRect(size/2+Math.cos(angle)*radius,size/2+Math.sin(angle)*radius*.7,1.2,1.2);
  }
  const edgeFade=heart.createRadialGradient(size/2,size/2,size*.46,size/2,size/2,size*.68);
  edgeFade.addColorStop(0,'rgba(255,255,255,1)');
  edgeFade.addColorStop(.58,'rgba(255,255,255,.92)');
  edgeFade.addColorStop(1,'rgba(255,255,255,0)');
  heart.globalCompositeOperation='destination-in';
  heart.fillStyle=edgeFade;
  heart.fillRect(0,0,size,size);
  return canvas;
}

function paintHeartNebula(now,st,cx,cy){
  if(!HN)HN=buildHeart(Math.round(Math.min(w*1.15,h*.95)));
  const alpha=Math.min(1,(.48+.3*(1-st.f)+(st.done?.22*Math.min(1,st.since/3000):0))*(.93+.07*Math.sin(now*.0008)));
  const size=HN.width;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=alpha;
  ctx.drawImage(HN,cx-size/2,cy-size/2+size*.06);
  ctx.restore();
}

function couple(now,st,cx,cy,R,c0){
  if(!(S.miles>0||S.placeA||S.placeB))return;
  const placeY=h-76,y=placeY-20+Math.sin(now*.0012)*5,len=26+70*st.f;
  const anchors=[w*.25,w*.75];
  ctx.globalCompositeOperation='lighter';
  for(const [i,s] of[-1,1].entries()){
    const x=anchors[i],tx=x+s*len;
    let g=ctx.createLinearGradient(x,y,tx,y);g.addColorStop(0,al(c0,.9));g.addColorStop(1,al(c0,0));
    ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,y);ctx.stroke();
    g=ctx.createRadialGradient(x,y,0,x,y,13);g.addColorStop(0,'#ffffff');g.addColorStop(.3,al(c0,.7));g.addColorStop(1,al(c0,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,13,0,6.2832);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  ctx.textAlign='center';
  ctx.font=`italic ${Math.min(18,Math.max(12,w*.04))}px ${FONT}`;
  if(S.miles>0&&!st.done){ctx.fillStyle=al((PRE[S.pre]||PRE.gold)[2],.52);ctx.font=`italic ${Math.min(13,Math.max(10,w*.03))}px ${FONT}`;ctx.fillText(Math.round(S.miles*st.f).toLocaleString()+' miles',cx,placeY-8)}
  ctx.fillStyle=al((PRE[S.pre]||PRE.gold)[2],.85);
  const placeWidth=w*.42;
  if(S.placeA)ctx.fillText(String(S.placeA),anchors[0],placeY,placeWidth);
  if(S.placeB)ctx.fillText(String(S.placeB),anchors[1],placeY,placeWidth);
}

function paintLandscape(cx,c0,progress){
  const horizon=h*.72;
  const glow=ctx.createRadialGradient(cx,horizon,0,cx,horizon,w*.72);
  glow.addColorStop(0,al('#ffbd69',.1+.18*progress));
  glow.addColorStop(.38,al(c0,.06+.09*progress));
  glow.addColorStop(1,al('#161725',0));
  ctx.fillStyle=glow;
  ctx.fillRect(0,horizon-h*.2,w,h*.48);

  const cloud=(offset,color,alpha)=>{
    const y=horizon+offset;
    const g=ctx.createLinearGradient(0,y-h*.09,0,y+h*.09);
    g.addColorStop(0,al(color,0));
    g.addColorStop(.45,al(color,alpha));
    g.addColorStop(1,al(color,0));
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,y+h*.04);
    ctx.bezierCurveTo(w*.1,y-h*.1,w*.15,y+h*.06,w*.28,y-h*.01);
    ctx.bezierCurveTo(w*.4,y-h*.16,w*.43,y+h*.03,w*.54,y-h*.04);
    ctx.bezierCurveTo(w*.67,y-h*.18,w*.69,y+h*.06,w*.8,y-h*.02);
    ctx.bezierCurveTo(w*.91,y-h*.11,w*.94,y+h*.06,w,y-h*.03);
    ctx.lineTo(w,y+h*.08);
    ctx.lineTo(0,y+h*.08);
    ctx.closePath();
    ctx.fill();
  };
  cloud(-h*.38,'#4a4b60',.11+.1*progress);
  cloud(-h*.29,'#9b7d7e',.13+.1*progress);
  cloud(-h*.055,'#b68b83',.1+.07*progress);
  cloud(h*.015,'#f3bc75',.09+.1*progress);

  const ridge=(fill,base,points)=>{
    const g=ctx.createLinearGradient(0,base-h*.2,0,h);
    g.addColorStop(0,fill);
    g.addColorStop(1,'#080812');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,h);
    ctx.lineTo(0,base);
    for(let i=0;i<points.length;i+=3)ctx.bezierCurveTo(points[i][0],points[i][1],points[i+1][0],points[i+1][1],points[i+2][0],points[i+2][1]);
    ctx.lineTo(w,h);
    ctx.closePath();
    ctx.fill();
  };
  ridge('#29232b',h*.88,[
    [w*.08,h*.83],[w*.13,h*.74],[w*.23,h*.82],
    [w*.31,h*.91],[w*.38,h*.79],[w*.5,h*.84],
    [w*.62,h*.88],[w*.72,h*.75],[w*.81,h*.82],
    [w*.9,h*.88],[w*.94,h*.79],[w,h*.84]
  ]);
  ridge('#171722',h*.95,[
    [w*.12,h*.89],[w*.2,h*.85],[w*.3,h*.91],
    [w*.42,h*.98],[w*.48,h*.87],[w*.59,h*.91],
    [w*.72,h*.96],[w*.82,h*.85],[w*.9,h*.91],
    [w*.96,h*.94],[w*.98,h*.9],[w,h*.92]
  ]);
}

let constellation=null;
function prepareConstellation(){
  if(constellation?.width===w)return constellation;
  const glyphs={
    I:{width:.52,lines:[[[.5,0],[.5,1]],[[.12,0],[.88,0]],[[.12,1],[.88,1]]]},
    T:{width:1,lines:[[[0,0],[1,0]],[[.5,0],[.5,1]]]},
    S:{width:.88,lines:[[[1,0],[.2,0],[0,.18],[0,.4],[.88,.58],[.88,.82],[.68,1],[0,1]]]},
    W:{width:1.2,lines:[[[0,0],[.2,1],[.5,.5],[.8,1],[1,0]]]},
    R:{width:1,lines:[[[0,0],[0,1]],[[0,0],[.72,0],[1,.18],[1,.34],[.78,.5],[0,.5]],[[.48,.5],[1,1]]]},
    E:{width:.88,lines:[[[1,0],[0,0],[0,1],[1,1]],[[0,.5],[.78,.5]]]},
    N:{width:1,lines:[[[0,1],[0,0],[1,1],[1,0]]]}
  };
  const unit=Math.max(14,Math.min(24,w*.035)),cellH=unit*1.45,gap=unit*.28,wordGap=unit*.8;
  const phrase='IT IS WRITTEN',stagger=[-7,3,7,-4,6,-8,2,8,-6,4,-1];
  let totalWidth=0,letterIndex=0;
  for(const char of phrase)totalWidth+=char===' '?wordGap:(unit*glyphs[char].width+gap);
  totalWidth-=gap;
  const scale=Math.min(1,(w*.84)/totalWidth);
  const nodes=[],edges=[],nodeIndices=new Map();
  const addNode=(key,x,y)=>{
    if(nodeIndices.has(key))return nodeIndices.get(key);
    const seed=letterIndex*97+key.length*13+nodes.length*7;
    const jitterX=(Math.sin(seed*12.9898)*.5)*unit*.16;
    const jitterY=(Math.cos(seed*78.233)*.5)*unit*.16;
    const index=nodes.length;
    nodes.push({x:(x+jitterX)*scale,y:(y+jitterY+stagger[letterIndex%stagger.length])*scale});
    nodeIndices.set(key,index);
    return index;
  };
  let cursor=-totalWidth/2;
  for(const char of phrase){
    if(char===' '){cursor+=wordGap;continue}
    const glyph=glyphs[char],offset=cursor;
    for(const line of glyph.lines){
      let previous=-1;
      for(const [px,py] of line){
        const key=`${letterIndex}:${Math.round(px*100)}:${Math.round(py*100)}`;
        const current=addNode(key,offset+px*unit*glyph.width,(py-.5)*cellH);
        if(previous>=0)edges.push([previous,current]);
        previous=current;
      }
    }
    cursor+=unit*glyph.width+gap;
    letterIndex++;
  }
  constellation={width:w,nodes,edges};
  return constellation;
}

function drawConstellation(now,st){
  if(!st.done||st.since<8000)return;
  const map=prepareConstellation(),centerX=w*.77,centerY=h*.27;
  const bounds=map.nodes.reduce((box,node)=>({
    minX:Math.min(box.minX,node.x),maxX:Math.max(box.maxX,node.x),
    minY:Math.min(box.minY,node.y),maxY:Math.max(box.maxY,node.y)
  }),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});
  const scale=Math.min(1.05,w*.42/(bounds.maxX-bounds.minX),h*.65/(bounds.maxY-bounds.minY));
  const visibility=Math.min(1,(st.since-8000)/2400);
  const shimmer=(.7+.12*Math.sin(now*.0011))*visibility;
  ctx.save();
  ctx.translate(centerX,centerY);
  ctx.scale(scale,scale);
  ctx.lineWidth=.8;
  ctx.strokeStyle=`rgba(195,215,255,${.5*shimmer})`;
  for(const [a,b] of map.edges){
    ctx.beginPath();
    ctx.moveTo(map.nodes[a].x,map.nodes[a].y);
    ctx.lineTo(map.nodes[b].x,map.nodes[b].y);
    ctx.stroke();
  }
  for(let i=0;i<map.nodes.length;i++){
    const node=map.nodes[i];
    const twinkle=.82+.16*Math.sin(now*.002+i*1.7);
    const x=node.x,y=node.y,r=i%3===0?1.8:1.25;
    ctx.globalAlpha=twinkle*visibility;
    ctx.shadowColor=i%7===0?'#dce8ff':'#8cafff';
    ctx.shadowBlur=i%3===0?7:3.5;
    ctx.fillStyle=i%9===0?'#fff5cf':'#cbd9ff';
    ctx.beginPath();
    ctx.arc(x,y,r,0,6.2832);
    ctx.fill();
    if(i%3===0){
      ctx.globalAlpha=twinkle*.45*visibility;
      ctx.fillRect(x-3,y-.3,6,.6);
      ctx.fillRect(x-.3,y-3,.6,6);
    }
  }
  ctx.restore();
}

function paintNebula(now,progress){
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const clouds=[
    {x:w*.2+Math.sin(now*.000035)*w*.025,y:h*.32,r:w*.28,color:'#395fd0',a:.11},
    {x:w*.69+Math.sin(now*.000027+2)*w*.035,y:h*.3,r:w*.25,color:'#8146c6',a:.12},
    {x:w*.47+Math.sin(now*.00003+4)*w*.03,y:h*.5,r:w*.3,color:'#416bbb',a:.08}
  ];
  for(const cloud of clouds){
    const g=ctx.createRadialGradient(cloud.x,cloud.y,cloud.r*.04,cloud.x,cloud.y,cloud.r);
    g.addColorStop(0,al(cloud.color,cloud.a*(.72+.12*Math.sin(now*.00025))));
    g.addColorStop(.42,al(cloud.color,cloud.a*.38));
    g.addColorStop(1,al(cloud.color,0));
    ctx.fillStyle=g;
    ctx.fillRect(cloud.x-cloud.r,cloud.y-cloud.r,w<cloud.r*2?w:cloud.r*2,cloud.r*2);
  }
  const veil=ctx.createLinearGradient(w*.04,h*.54,w*.96,h*.08);
  veil.addColorStop(0,al('#467adf',0));
  veil.addColorStop(.28,al('#467adf',.012));
  veil.addColorStop(.56,al('#8252d6',.02));
  veil.addColorStop(.78,al('#73a6f2',.014));
  veil.addColorStop(1,al('#73a6f2',0));
  ctx.fillStyle=veil;
  ctx.fillRect(0,0,w,h*.68);
  for(let i=0;i<nebulaDust.length;i++){
    const speck=nebulaDust[i];
    const x=speck.x*w+Math.sin(now*.00005+speck.p)*12;
    const y=speck.y*h+Math.sin(now*.00007+speck.p)*7;
    ctx.globalAlpha=(.14+.27*(.5+.5*Math.sin(now*.0008+speck.p)))*progress;
    ctx.fillStyle=speck.color;
    ctx.beginPath();
    ctx.arc(x,y,speck.r,0,6.2832);
    ctx.fill();
  }
  ctx.restore();
}

function dateHash(value){
  let hash=2166136261;
  for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),16777619);
  return hash>>>0;
}

function scheduledSpaceEvent(timestamp){
  const today=new Date(timestamp),reunion=new Date(target());
  const todayUtc=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
  const reunionUtc=Date.UTC(reunion.getFullYear(),reunion.getMonth(),reunion.getDate());
  const daysUntil=Math.ceil((reunionUtc-todayUtc)/864e5);
  if(daysUntil<=0)return null;
  const type=daysUntil%23===0?'auroraSouth'
    :daysUntil%17===0?'auroraNorth'
    :daysUntil%14===0?'meteor'
    :daysUntil%7===3?'milkyway':null;
  if(!type)return null;
  const key=`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${type}`;
  const seed=dateHash(key);
  const start=new Date(today.getFullYear(),today.getMonth(),today.getDate(),20+(seed%3),(seed>>>5)%60).getTime();
  const duration={milkyway:150000,meteor:150000,auroraNorth:90000,auroraSouth:90000}[type];
  const elapsed=timestamp-start;
  return elapsed>=0&&elapsed<duration?{type,elapsed,duration,seed}:null;
}

function paintMilkyWay(event){
  const progress=event.elapsed/event.duration;
  ctx.save();
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=Math.min(1,event.elapsed/1400,(event.duration-event.elapsed)/1400);
  ctx.translate((progress*2.4-1.2)*w,0);
  const band=ctx.createLinearGradient(0,h*.2,w,h*.55);
  band.addColorStop(0,al('#467adf',0));
  band.addColorStop(.35,al('#7297e8',.3));
  band.addColorStop(.58,al('#ad8bd9',.38));
  band.addColorStop(.76,al('#d3c4ef',.23));
  band.addColorStop(1,al('#467adf',0));
  ctx.strokeStyle=band;
  ctx.filter='blur(34px)';
  ctx.lineWidth=h*.16;
  ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-w*.4,h*.59);
  ctx.bezierCurveTo(w*.03,h*.24,w*.62,h*.66,w*1.4,h*.19);
  ctx.stroke();
  ctx.filter='blur(12px)';
  ctx.lineWidth=h*.055;
  ctx.strokeStyle=al('#b5bde8',.27);
  ctx.beginPath();
  ctx.moveTo(-w*.35,h*.55);
  ctx.bezierCurveTo(w*.12,h*.3,w*.6,h*.59,w*1.35,h*.23);
  ctx.stroke();
  ctx.filter='none';
  for(const dust of milkyWayDust){
    const x=dust.x*w,y=h*(.59-.25*dust.x+dust.offset);
    if(x<0||x>w)continue;
    ctx.globalAlpha=dust.a*1.35*Math.min(1,progress*7,(1-progress)*7);
    ctx.fillStyle=dust.color;
    ctx.beginPath();
    ctx.arc(x,y,dust.r,0,6.2832);
    ctx.fill();
  }
  ctx.restore();
}

function paintMeteorShower(event){
  const elapsed=event.elapsed/1000;
  for(let i=0;i<42;i++){
    const seed=dateHash(`${Math.floor(event.duration)}-${i}`);
    const start=i*(event.manual?0.62:3.5)+(seed%180)/100;
    const age=elapsed-start;
    if(age<0||age>1.15)continue;
    const fade=Math.min(1,age*5,(1.15-age)*2);
    const x=((seed>>>8)%1000)/1000*w;
    const y=h*(.12+((seed>>>18)%480)/1000);
    const length=75+(seed%100);
    const drift=age*190;
    const headX=x+drift,headY=y+drift*.55;
    const tail=ctx.createLinearGradient(headX,headY,headX-length,headY-length*.55);
    tail.addColorStop(0,al('#ffffff',fade*.95));
    tail.addColorStop(.35,al('#b9d1ff',fade*.52));
    tail.addColorStop(1,al('#8b77d8',0));
    ctx.globalCompositeOperation='lighter';
    ctx.lineWidth=1.3+(seed%3)*.35;
    ctx.strokeStyle=tail;
    ctx.beginPath();
    ctx.moveTo(headX,headY);
    ctx.lineTo(headX-length,headY-length*.55);
    ctx.stroke();
    ctx.fillStyle=al('#fff8e6',fade*.9);
    ctx.beginPath();
    ctx.arc(headX,headY,1.2+(seed%3)*.4,0,6.2832);
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}

function paintAurora(event,hemisphere,now){
  const fade=Math.min(1,event.elapsed/1400,(event.duration-event.elapsed)/1400);
  const top=hemisphere==='north'?h*.12:h*.46,height=h*.25;
  ctx.save();
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=fade*.95;
  for(let layer=0;layer<7;layer++){
    const phase=now*.00035+layer*1.3,base=top+layer*height*.045;
    const gradient=ctx.createLinearGradient(0,base-height*.18,0,base+height);
    gradient.addColorStop(0,al('#62ffd2',0));
    gradient.addColorStop(.28,al(layer%2?'#51eab4':'#77e4ff',.12));
    gradient.addColorStop(.68,al(layer%2?'#8a74ff':'#62ffd2',.38));
    gradient.addColorStop(.82,al('#d8fff1',.15));
    gradient.addColorStop(1,al('#86dfff',0));
    ctx.fillStyle=gradient;
    ctx.filter='blur(18px)';
    ctx.beginPath();ctx.moveTo(0,base+height*.48);
    for(let i=0;i<=24;i++){
      const x=w*i/24;
      const wave=Math.sin(i*.72+phase+layer)*height*.2+Math.sin(i*.31-phase*.7)*height*.12;
      ctx.lineTo(x,base+wave);
    }
    for(let i=24;i>=0;i--){
      const x=w*i/24;
      const wave=Math.sin(i*.72+phase+layer)*height*.2+Math.sin(i*.31-phase*.7)*height*.12;
      ctx.lineTo(x,base+wave+height*(.45+.22*Math.sin(i*.8+phase)));
    }
    ctx.closePath();ctx.fill();
    ctx.filter='none';
  }
  ctx.restore();
}

function draw(now){
  const st=state(now),d=st.d,[c0,c1]=PRE[S.pre]||PRE.gold;
  if(st.done&&!pv)archivePastCountdown();
  const cx=w/2,cy=h*.38,R=Math.min(w,h)*.14;
  const cover=Math.max(0,Math.min(1,1-d/2)),k=Math.max(0,Math.min(1,(cover-.9)/.1));
  const wm=Math.pow(1-st.f,1.4);
  const fl=st.done?Math.max(0,1-st.since/4500):0,kc=st.done?k*Math.min(1,st.since/2500):k;
  ctx.globalCompositeOperation='source-over';
  // sky: cold blue far away, warming as we get closer, deep dark at totality
  let g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,mix(mix('#03040b','#070914',wm),'#020208',k*.5));
  g.addColorStop(1,mix(mix('#060a16','#111321',wm),'#05040a',k*.7));
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  paintNebula(now,.82);
  if(manualSpaceEvent&&performance.now()-manualSpaceEvent.startedAt>=manualSpaceEvent.duration){
    manualSpaceEvent=null;
    updateSpaceEventButtons();
  }
  const spaceEvent=manualSpaceEvent
    ?{...manualSpaceEvent,elapsed:performance.now()-manualSpaceEvent.startedAt,manual:true}
    :scheduledSpaceEvent(Date.now());
  ctx.fillStyle='rgba(2,3,12,.2)';
  ctx.fillRect(0,0,w,h);
  paintLandscape(cx,c0,Math.max(wm,k));
  paintHeartNebula(now,st,cx,cy);
  drawConstellation(now,st);
  for(const s of stars){
    const x=s.x*w,y=s.y*h;
    const shimmer=.5+.5*Math.sin(now*.001*s.speed+s.p);
    const brightness=.3+.65*shimmer;
    ctx.fillStyle=al('#eaf3ff',brightness);
    ctx.beginPath();ctx.arc(x,y,s.r*.55,0,6.2832);ctx.fill();
    if(s.r>1){
      const halo=ctx.createRadialGradient(x,y,0,x,y,s.r*(4+shimmer*4));
      halo.addColorStop(0,al('#dceaff',brightness*.23*s.glow));
      halo.addColorStop(1,al('#a9c5ff',0));
      ctx.fillStyle=halo;
      ctx.beginPath();ctx.arc(x,y,s.r*(4+shimmer*4),0,6.2832);ctx.fill();
      const flare=Math.max(0,(shimmer-.9)*10)*s.glow;
      if(flare>.12){
        ctx.strokeStyle=al('#f3f6ff',flare*.48);
        ctx.lineWidth=.6;
        const ray=s.r*(2+flare*5);
        ctx.beginPath();ctx.moveTo(x-ray,y);ctx.lineTo(x+ray,y);ctx.moveTo(x,y-ray);ctx.lineTo(x,y+ray);ctx.stroke();
      }
    }
  }
  if(spaceEvent){
    if(spaceEvent.type==='milkyway')paintMilkyWay(spaceEvent);
    else if(spaceEvent.type==='meteor')paintMeteorShower(spaceEvent);
    else if(spaceEvent.type==='auroraNorth')paintAurora(spaceEvent,'north',now);
    else if(spaceEvent.type==='auroraSouth')paintAurora(spaceEvent,'south',now);
  }
  // little shooting stars, more often the closer we get
  if(Math.random()<.004+.014*wm)sh.push({x:Math.random()*w*.9,y:Math.random()*h*.45,vx:3+Math.random()*3,vy:1+Math.random()*1.5,l:1});
  ctx.lineWidth=1.4;
  for(let i=sh.length-1;i>=0;i--){
    const q=sh[i];q.x+=q.vx;q.y+=q.vy;q.l-=.012;
    const tx=q.x-q.vx*14,ty=q.y-q.vy*14,lg=ctx.createLinearGradient(q.x,q.y,tx,ty);
    lg.addColorStop(0,al('#ffffff',q.l*.9));lg.addColorStop(1,al(c0,0));
    ctx.strokeStyle=lg;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(tx,ty);ctx.stroke();
    if(q.l<=0)sh.splice(i,1);
  }
  // fireflies drifting up
  ctx.globalCompositeOperation='lighter';
  for(const f of ff){
    f.y-=f.s*.0006*(1+wm);if(f.y<-.05){f.y=1.05;f.x=Math.random()}
    const x=(f.x+Math.sin(now*.0004+f.p)*.02)*w,y=f.y*h,a=.35+.65*Math.max(0,Math.sin(now*.0016+f.p));
    const gg=ctx.createRadialGradient(x,y,0,x,y,f.r*7);gg.addColorStop(0,al('#fff6d0',a*.9));gg.addColorStop(.25,al(c0,a*.45));gg.addColorStop(1,al(c0,0));
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,y,f.r*7,0,6.2832);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  // a falling star you can tap to make a wish
  if(!wst&&now>nextWish&&!st.done)wst={x:-40,y:h*(.08+Math.random()*.25),vx:1.5+Math.random(),vy:.5+Math.random()*.4};
  if(wst){
    wst.x+=wst.vx;wst.y+=wst.vy;
    if(wst.x>w+60||wst.y>h){wst=null;nextWish=now+25000+Math.random()*20000}
    else{
      const x=wst.x,y=wst.y,tx=x-wst.vx*70,ty=y-wst.vy*70,lg=ctx.createLinearGradient(x,y,tx,ty);
      lg.addColorStop(0,al('#ffffff',.95));lg.addColorStop(1,al(c0,0));
      ctx.lineWidth=3;ctx.strokeStyle=lg;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
      const pu=1+.25*Math.sin(now*.008),gg=ctx.createRadialGradient(x,y,0,x,y,22*pu);
      gg.addColorStop(0,'#ffffff');gg.addColorStop(.3,al(c0,.6));gg.addColorStop(1,al(c0,0));
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,y,22*pu,0,6.2832);ctx.fill();ctx.globalCompositeOperation='source-over';
    }
  }
  // glow dims as the sun is covered
  g=ctx.createRadialGradient(cx,cy,R*1.05,cx,cy,R*2.6);
  g.addColorStop(0,al(c0,.24*(1-cover*.9)));g.addColorStop(1,al(c1,0));
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.lineWidth=1.2;
  for(let j=0;j<3;j++){const ph=(now/4500+j/3)%1;ctx.strokeStyle=al(c0,.14*(1-ph)*(1-k*.5));ctx.beginPath();ctx.arc(cx,cy,R*(1.2+ph*3.6),0,6.2832);ctx.stroke()}
  // sun
  g=ctx.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'#fffaf0');g.addColorStop(1,c0);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,6.2832);ctx.fill();
  // corona at totality
  if(kc>0){const k=kc;
    ctx.globalCompositeOperation='lighter';
    g=ctx.createRadialGradient(cx,cy,R,cx,cy,R*2.5);g.addColorStop(0,al('#ffffff',.5*k));g.addColorStop(.35,al(c0,.18*k));g.addColorStop(1,al(c1,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*2.5,0,6.2832);ctx.fill();
    ctx.lineWidth=1.2;
    const rayFade=st.done?Math.max(0,1-st.since/12000):1;
    for(let i=0;i<140;i++){
      const a=i/140*6.2832,n=Math.sin(i*12.9898+now*.0007)*.5+.5,len=R*(1.15+(n*1.5+(i%7===0?.9:0))*k*(.9+.1*Math.sin(now*.002+i)));
      ctx.strokeStyle=al(i%3?'#ffffff':c0,.22*k*rayFade);ctx.beginPath();
      ctx.moveTo(cx+Math.cos(a)*R*1.03,cy+Math.sin(a)*R*1.03);ctx.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);ctx.stroke();
    }
    ctx.globalCompositeOperation='source-over';
  }
  // moon
  ctx.fillStyle='#06050c';ctx.beginPath();ctx.arc(cx-d*R,cy+d*R*.22,R*1.03,0,6.2832);ctx.fill();
  ctx.strokeStyle='rgba(159,180,216,.2)';ctx.lineWidth=1.5;ctx.stroke();
  // diamond ring just before totality
  if(d>0&&d<.2){
    const f=Math.min(1,1-d/.2)*Math.min(1,d/.02),a=Math.atan2(-.22,1),px=cx+Math.cos(a)*R,py=cy+Math.sin(a)*R;
    ctx.globalCompositeOperation='lighter';
    g=ctx.createRadialGradient(px,py,0,px,py,R*.9*f+2);g.addColorStop(0,al('#ffffff',f));g.addColorStop(1,al(c0,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,R*.9*f+2,0,6.2832);ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }
  couple(now,st,cx,cy,R,c0);
  // finale: the two stars meet in a burst of golden dust
  if(st.done){if(!bursted){bursted=1;if(st.since<8000){spark(cx,cy+R*2.45,90,{v:3,g:.012,d:.008,r:2.2});spark(cx,cy,60,{v:4,g:.01,d:.006,r:1.8,c:c0})}}}else bursted=0;
  ctx.globalCompositeOperation='lighter';
  for(let i=pt.length-1;i>=0;i--){
    const q=pt[i];q.x+=q.vx;q.y+=q.vy;q.vy+=q.g;q.vx*=.985;q.l-=q.d;
    if(q.l<=0){pt.splice(i,1);continue}
    ctx.fillStyle=al(q.c,q.l*q.l);
    if(q.star){ctx.fillRect(q.x-q.r*2.5,q.y-.5,q.r*5,1);ctx.fillRect(q.x-.5,q.y-q.r*2.5,1,q.r*5)}
    ctx.beginPath();ctx.arc(q.x,q.y,q.r*(.5+q.l*.5),0,6.2832);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  hud(st);requestAnimationFrame(draw);
}

// text overlay
function mile(rem){
  if(rem<=0)return'';
  if(rem<=6e4)return WORDS.minute;if(rem<=6e5)return WORDS.ten;if(rem<=36e5)return WORDS.hour;
  const t=new Date(target()),n=new Date();
  const dd=Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);
  return dd===0?WORDS.today:dd===1?WORDS.tomorrow:dd>1&&dd<=7?WORDS.week:'';
}
let last='',lastN=-2;
function hud(st){
  const done=st.done,full=S.msg||'The sky goes dark, and you’re here.';
  if(done){const n=Math.max(0,Math.min(full.length,Math.floor((st.since-1500)/85)));if(n!==lastN){lastN=n;$('ma').textContent=full.slice(0,n);$('mb').textContent=full.slice(n)}}
  else if(lastN!==-1){lastN=-1;$('ma').textContent='';$('mb').textContent=full}
  $('tot').classList.toggle('on',done);$('msg').classList.toggle('on',done);
  $('cd').style.display=done?'none':'flex';
  const s=Math.max(0,Math.ceil(st.rem/1000)),dd=Math.floor(s/86400),hh=Math.floor(s%86400/3600),mm=Math.floor(s%3600/60),ss=s%60;
  const key=dd+':'+hh+':'+mm+':'+ss+done;
  if(key===last)return;last=key;
  $('ms').textContent=done?'':mile(st.rem);
  const cd=$('cd');cd.replaceChildren();
  [[dd,'days'],[hh,'hours'],[mm,'minutes'],[ss,'seconds']].forEach(([n,unit],index)=>{
    const item=document.createElement('div'),value=document.createElement('b'),label=document.createElement('span');
    value.textContent=pad(n);label.textContent=unit;item.append(value,label);cd.append(item);
    if(index<3){const separator=document.createElement('span');separator.className='cd-sep';separator.setAttribute('aria-hidden','true');separator.textContent='✦';cd.append(separator)}
  });
}
function texts(){
  $('ttl').textContent=S.title;$('who').textContent=S.who;
  lastN=-2;
  const P=PRE[S.pre]||PRE.gold,rs=document.documentElement.style;rs.setProperty('--acc',P[0]);rs.setProperty('--ink',P[2]);rs.setProperty('--soft',P[3]);
  document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b.dataset.k===S.pre));
  document.title=S.title||'Until Totality';
}

// a song for each day: unlocks at midnight of its date (Spotify embed + a message)
let OWN=[];try{OWN=JSON.parse(localStorage.getItem('ec-songs')||'[]')}catch(e){}
const saveOwn=()=>{try{localStorage.setItem('ec-songs',JSON.stringify(OWN))}catch(e){}};
const SPOT=/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/;
const dayStart=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).getTime()};
const validRoomCode=value=>/^[A-Za-z0-9_-]{1,64}$/.test(value);
const validSongDate=value=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
};
const databaseBase=String(CFG.sync?.databaseURL||'').replace(/\/+$/,'');
const databaseUrl=path=>`${databaseBase}/${path.split('/').map(encodeURIComponent).join('/')}.json`;
const roomPath=()=>`rooms/${personal.roomCode}`;
const songKey=n=>n.id?`shared:${n.id}`:JSON.stringify([n.date,String(n.song||''),String(n.text||'')]);
const configSongs=()=>Array.isArray(CFG.songs)?CFG.songs:Array.isArray(CFG.notes)?CFG.notes:[];
function normalizeSongs(value){
  if(!value||typeof value!=='object')return[];
  return Object.entries(value).flatMap(([id,item])=>{
    if(!item||typeof item!=='object'||typeof item.date!=='string'||!validSongDate(item.date))return[];
    const song=typeof item.song==='string'?item.song:'';
    const text=typeof item.text==='string'?item.text.slice(0,400):'';
    if(!song||song.length>500||!SPOT.test(song))return[];
    return[{id,date:item.date,song,text,who:typeof item.who==='string'?item.who.slice(0,50):'',deviceId:typeof item.deviceId==='string'?item.deviceId:''}];
  });
}
function normalizeWishes(value){
  if(!value||typeof value!=='object')return[];
  return Object.entries(value).flatMap(([id,item])=>{
    if(!item||typeof item!=='object'||typeof item.text!=='string'||!item.text.trim())return[];
    return[{id,text:item.text.slice(0,200),who:typeof item.who==='string'?item.who.slice(0,50):'',deviceId:typeof item.deviceId==='string'?item.deviceId:''}];
  });
}
function applyRoomData(value){
  const message=value?.totalityMessage;
  sharedContent={
    songs:normalizeSongs(value?.songs),
    wishes:normalizeWishes(value?.wishes),
    message:message&&typeof message.text==='string'&&message.text.trim()
      ?{text:message.text.slice(0,400),deviceId:typeof message.deviceId==='string'?message.deviceId:''}
      :null
  };
  S.msg=sharedContent.message?.text||CFG.msg||'';
  if(!$('f-msg').matches(':focus')||!messageDirty)$('f-msg').value=sharedContent.message?.text||CFG.msg||'';
  lastN=-2;
  renderNotes();renderWishes();
}
function readRoomCache(roomCode){
  try{
    const value=JSON.parse(localStorage.getItem(roomCacheKey(roomCode))||'null');
    if(value&&typeof value==='object')return value;
  }catch(error){}
  return null;
}
function saveRoomCache(roomCode,value){
  try{localStorage.setItem(roomCacheKey(roomCode),JSON.stringify(value));return true}catch(error){return false}
}
function setSyncStatus(value){$('sync-status').textContent=value}
async function syncRoom(){
  const code=personal.roomCode.trim();
  if(!code){
    sharedContent={songs:[],wishes:[],message:null};
    setSyncStatus('Enter room code');
    $('sync-hint').textContent='Enter room code to share.';
    applyRoomData(null);
    return;
  }
  if(!validRoomCode(code)){
    sharedContent={songs:[],wishes:[],message:null};
    setSyncStatus('Enter room code');
    $('sync-hint').textContent='Use 1–64 letters, numbers, hyphens, or underscores for the room code.';
    applyRoomData(null);
    return;
  }
  $('sync-hint').textContent='';
  if(!databaseBase){
    setSyncStatus('Offline');
    const cached=readRoomCache(code);
    applyRoomData(cached);
    $('sync-hint').textContent=cached?'Showing the last copy saved on this device.':'No saved copy is available on this device yet.';
    return;
  }
  try{
    const response=await fetch(databaseUrl(roomPath()));
    if(!response.ok)throw new Error(`Realtime Database returned ${response.status}`);
    const value=await response.json();
    if(code!==personal.roomCode.trim())return;
    const data=value&&typeof value==='object'?value:{};
    const cached=saveRoomCache(code,data);
    applyRoomData(data);
    setSyncStatus('Synced');
    $('sync-hint').textContent=cached?'':'Synced; offline copy could not be saved on this device.';
  }catch(error){
    if(code!==personal.roomCode.trim())return;
    const cached=readRoomCache(code);
    applyRoomData(cached);
    setSyncStatus('Offline');
    $('sync-hint').textContent=cached?'Showing the last copy saved on this device.':'No saved copy is available on this device yet.';
  }
}
let syncBusy=false;
async function refreshRoom(){
  if(syncBusy)return;
  syncBusy=true;
  try{await syncRoom()}finally{syncBusy=false}
}
async function databaseWrite(path,method,body){
  const response=await fetch(databaseUrl(path),{
    method,
    headers:body?{'Content-Type':'application/json'}:undefined,
    body:body?JSON.stringify(body):undefined
  });
  if(!response.ok)throw new Error(`Realtime Database returned ${response.status}`);
  return response.status===204?null:response.json();
}
function notes(){
  const localSongs=validRoomCode(personal.roomCode)?OWN.map((item,index)=>({...item,own:1,i:index,who:item.who||personal.myName})): [];
  return[...configSongs(),...sharedContent.songs,...localSongs].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
}
function allWishes(){
  const configWishes=Array.isArray(CFG.wishes)?CFG.wishes.filter(text=>typeof text==='string'&&text.trim()).map(text=>({text})):[];
  return[...configWishes,...sharedContent.wishes];
}
function stopMusic(){
  const frame=$('music-frame').querySelector('iframe');
  if(frame)frame.src='about:blank';
  $('music-frame').replaceChildren();
  $('music-dock').hidden=true;
}
function playSong(song){
  const match=String(song.song||'').match(SPOT);
  if(!match)return;
  const frame=document.createElement('iframe');
  frame.src=`https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0&autoplay=1`;
  frame.height=match[1]==='track'||match[1]==='episode'?'152':'352';
  frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  frame.loading='eager';
  frame.title='Spotify song player';
  $('music-title').textContent=`Playing song for ${new Date(dayStart(song.date)).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
  $('music-frame').replaceChildren(frame);
  $('music-dock').hidden=false;
}
$('music-pause').onclick=stopMusic;
let seenN={};try{seenN=JSON.parse(localStorage.getItem('ec-seen')||'{}')}catch(e){}
for(const n of notes())if(seenN[n.date])seenN[songKey(n)]=true;
const songSeen=n=>Boolean(seenN[songKey(n)]);
async function removeSharedEntry(collection,item){
  if(!item.id||item.deviceId!==deviceId)return;
  try{
    await databaseWrite(`${roomPath()}/${collection}/${item.id}`,'DELETE');
    const code=personal.roomCode.trim(),cached=readRoomCache(code);
    if(cached?.[collection]){
      delete cached[collection][item.id];
      saveRoomCache(code,cached);
      applyRoomData(cached);
    }
    $('sync-hint').textContent='';
    await refreshRoom();
  }catch(error){
    setSyncStatus('Offline');
    $('sync-hint').textContent='Could not remove this entry. Check the connection and try again.';
  }
}
function renderNotes(){
  const list=$('nlist');list.replaceChildren();let unseen=0;
  for(const n of notes()){
    const open=dayStart(n.date)<=Date.now(),card=document.createElement('div'),hd=document.createElement('div'),p=document.createElement('p');
    const unread=open&&!songSeen(n);
    card.className='card'+(open?'':' lock')+(unread?' unread':'');hd.className='cdate';
    hd.textContent=new Date(dayStart(n.date)).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    if(unread){const badge=document.createElement('span');badge.className='song-new';badge.textContent='New';hd.append(' ',badge)}
    card.appendChild(hd);
    if(n.who){
      const byline=document.createElement('div');
      byline.className='song-from';
      byline.textContent=`from ${n.who}`;
      card.appendChild(byline);
    }
    if(n.id&&n.deviceId===deviceId){
      const rm=document.createElement('button');rm.className='rm';rm.textContent='Remove';rm.onclick=()=>removeSharedEntry('songs',n);card.appendChild(rm);
    }else if(n.own){
      const rm=document.createElement('button');rm.className='rm';rm.textContent='Remove';rm.onclick=()=>{OWN.splice(n.i,1);saveOwn();renderNotes()};card.appendChild(rm);
    }
    if(open){
      const m=String(n.song||'').match(SPOT);
      if(m){
        const play=document.createElement('button');
        play.className='song-play';
        play.type='button';
        play.textContent='Play on this page';
        play.onclick=()=>playSong(n);
        card.appendChild(play);
      }
      if(n.image){const im=document.createElement('img');im.src=n.image;im.alt='';card.appendChild(im)}
        p.textContent=n.text||'';if(unread)unseen++;
    }else p.textContent='A song opens on this day.';
    card.appendChild(p);list.appendChild(card);
  }
  const badge=$('song-badge'),button=$('nbtn');
  badge.hidden=unseen===0;
  badge.textContent=unseen>9?'9+':String(unseen);
  button.classList.toggle('has-new',unseen>0);
  button.setAttribute('aria-label',unseen?`Song of the day, ${unseen} new ${unseen===1?'song':'songs'}`:'Song of the day');
  button.title=unseen?`${unseen} new ${unseen===1?'song':'songs'} to listen to`:'Song of the day';
}
function renderWishes(){
  const list=$('wish-list');list.replaceChildren();
  for(const wish of allWishes()){
    const row=document.createElement('div'),text=document.createElement('p');
    row.className='wish-entry';
    text.textContent=wish.text;
    row.appendChild(text);
    if(wish.who){
      const byline=document.createElement('div');
      byline.className='song-from';
      byline.textContent=`from ${wish.who}`;
      row.appendChild(byline);
    }
    if(wish.id&&wish.deviceId===deviceId){
      const remove=document.createElement('button');
      remove.type='button';remove.className='rm';remove.textContent='Remove';
      remove.onclick=()=>removeSharedEntry('wishes',wish);
      row.appendChild(remove);
    }
    list.appendChild(row);
  }
}
function toggleNotes(v){
  $('notes').classList.toggle('open',v);
  if(!v){for(const n of notes())if(dayStart(n.date)<=Date.now())seenN[songKey(n)]=true;try{localStorage.setItem('ec-seen',JSON.stringify(seenN))}catch(e){}renderNotes()}
}
$('nbtn').onclick=()=>toggleNotes(!$('notes').classList.contains('open'));
$('nclose').onclick=()=>toggleNotes(false);
setInterval(()=>{if(!$('notes').classList.contains('open'))renderNotes()},60000);
function toggleHistory(open){
  const history=$('history');
  history.classList.toggle('open',open);
  history.setAttribute('aria-hidden',String(!open));
  if(open){
    $('notes').classList.remove('open');
    $('panel').classList.remove('open');
    $('sky-events-menu').hidden=true;
    $('sky-events-toggle').setAttribute('aria-expanded','false');
    renderCountdownHistory();
  }
}
$('history-btn').onclick=()=>toggleHistory(!$('history').classList.contains('open'));
$('history-close').onclick=()=>toggleHistory(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleHistory(false)});

// settings panel
$('room-code').value=personal.roomCode;$('my-name').value=personal.myName;
$('f-pa').value=S.placeA;$('f-pb').value=S.placeB;$('f-msg').value=CFG.msg||'';
$('wish-copy').onclick=async()=>{
  const snippet='wishes: '+JSON.stringify([...new Set(allWishes().map(wish=>wish.text))],null,2)+',';
  const status=$('wish-share-status');
  try{
    await navigator.clipboard.writeText(snippet);
    status.textContent='Copied. Replace the wishes list in config.js with this line to make these shared defaults.';
  }catch(error){
    const copy=document.createElement('textarea');
    copy.value=snippet;
    copy.setAttribute('readonly','');
    copy.style.position='fixed';
    copy.style.opacity='0';
    document.body.append(copy);
    copy.select();
    const copied=document.execCommand('copy');
    copy.remove();
    status.textContent=copied
      ? 'Copied. Replace the wishes list in config.js with this line to make these shared defaults.'
      : 'Could not copy automatically. Check browser clipboard permissions.';
  }
};
$('sw').replaceChildren();
Object.entries(PRE).forEach(([key,[sun,glow]])=>{
  const button=document.createElement('button');
  button.type='button';button.className='sw';button.dataset.k=key;button.setAttribute('aria-label',key);
  button.style.background=`linear-gradient(135deg,${sun},${glow})`;
  $('sw').append(button);
});
$('sw').onclick=e=>{const k=e.target.dataset.k;if(k){S.pre=k;save();texts()}};
$('save-local-edits').onclick=save;
$('reset-local-edits').onclick=()=>{
  try{
    localStorage.removeItem(PERSONAL_KEY);
    location.reload();
  }catch(error){
    $('local-edits-status').textContent='Could not reset personal settings on this device.';
  }
};
let roomTimer;
$('room-code').addEventListener('input',e=>{
  personal.roomCode=e.target.value.trim();
  save();
  clearTimeout(roomTimer);
  roomTimer=setTimeout(refreshRoom,350);
});
$('my-name').addEventListener('input',e=>{
  personal.myName=e.target.value.slice(0,50);save();
});
[['f-pa','placeA'],['f-pb','placeB']].forEach(([id,key])=>$(id).addEventListener('input',e=>{
  S[key]=e.target.value.slice(0,80);save();updateMiles();
}));
$('f-msg').addEventListener('input',()=>{messageDirty=true});
$('save-message').onclick=async()=>{
  const code=personal.roomCode.trim(),text=$('f-msg').value.trim().slice(0,400);
  if(!validRoomCode(code)){
    setSyncStatus('Enter room code');$('message-status').textContent='Enter room code to share.';
    return;
  }
  try{
    const message={text,who:personal.myName,deviceId,updatedAt:Date.now()};
    if(text){
      await databaseWrite(`${roomPath()}/totalityMessage`,'PUT',message);
    }else{
      await databaseWrite(`${roomPath()}/totalityMessage`,'DELETE');
    }
    const cached=readRoomCache(code)||{};
    if(text)cached.totalityMessage=message;else delete cached.totalityMessage;
    saveRoomCache(code,cached);messageDirty=false;
    applyRoomData(cached);
    $('message-status').textContent=text?'Shared message saved.':'Using the config.js message.';
    await refreshRoom();
  }catch(error){
    setSyncStatus('Offline');$('message-status').textContent='Could not save the shared message. Check the connection and try again.';
  }
};
$('clear-message').onclick=async()=>{
  const code=personal.roomCode.trim();
  $('f-msg').value=CFG.msg||'';messageDirty=false;
  if(!validRoomCode(code)){
    $('message-status').textContent='Enter room code to share.';S.msg=CFG.msg||'';return;
  }
  try{
    await databaseWrite(`${roomPath()}/totalityMessage`,'DELETE');
    const cached=readRoomCache(code)||{};
    delete cached.totalityMessage;
    saveRoomCache(code,cached);applyRoomData(cached);
    $('message-status').textContent='Using the config.js message.';
    await refreshRoom();
  }catch(error){
    setSyncStatus('Offline');$('message-status').textContent='Could not clear the shared message. Check the connection and try again.';
  }
};
$('wish-add').onclick=async()=>{
  const text=$('f-wish').value.trim();
  if(!text){$('wish-share-status').textContent='Write a wish before adding it.';return}
  if(text.length>200){$('wish-share-status').textContent='A wish can be up to 200 characters.';return}
  if(!validRoomCode(personal.roomCode.trim())){
    setSyncStatus('Enter room code');$('wish-share-status').textContent='Enter room code to share.';
    return;
  }
  if(!personal.myName.trim()){$('wish-share-status').textContent='Enter your name before adding a shared wish.';return}
  try{
    const wish={text,who:personal.myName.trim(),deviceId};
    const result=await databaseWrite(`${roomPath()}/wishes`,'POST',wish);
    const cached=readRoomCache(personal.roomCode.trim())||{};
    cached.wishes={...(cached.wishes||{}),[result.name]:wish};
    saveRoomCache(personal.roomCode.trim(),cached);applyRoomData(cached);
    $('f-wish').value='';$('wish-share-status').textContent='Wish added to your room.';
    setSyncStatus('Synced');await refreshRoom();
  }catch(error){
    setSyncStatus('Offline');$('wish-share-status').textContent='Could not add the wish. Check the connection and try again.';
  }
};
$('s-add').onclick=async()=>{
  const date=$('s-date').value,song=$('s-link').value.trim(),text=$('s-msg').value.trim(),status=$('s-st');
  if(!validRoomCode(personal.roomCode.trim())){
    setSyncStatus('Enter room code');status.textContent='Enter room code to share.';return;
  }
  if(!personal.myName.trim()){status.textContent='Enter your name before adding a shared song.';return}
  if(!validSongDate(date)){status.textContent='Pick a valid day for the song to unlock.';return}
  if(!song||song.length>500||!SPOT.test(song)){status.textContent='Add a valid Spotify link. In Spotify: Share, then Copy link.';return}
  if(text.length>400){status.textContent='A song message can be up to 400 characters.';return}
  try{
    const entry={date,song,text,who:personal.myName.trim(),deviceId};
    const result=await databaseWrite(`${roomPath()}/songs`,'POST',entry);
    const cached=readRoomCache(personal.roomCode.trim())||{};
    cached.songs={...(cached.songs||{}),[result.name]:entry};
    saveRoomCache(personal.roomCode.trim(),cached);applyRoomData(cached);
    $('s-link').value='';$('s-msg').value='';status.textContent='Song added to your room.';
    setSyncStatus('Synced');await refreshRoom();
  }catch(error){
    setSyncStatus('Offline');status.textContent='Could not add the song. Check the connection and try again.';
  }
};
$('room-code').addEventListener('change',refreshRoom);
const open=v=>$('panel').classList.toggle('open',v);
$('gear').onclick=()=>open(!$('panel').classList.contains('open'));
$('close').onclick=()=>open(false);
$('pv').onclick=()=>{if(pv){pv=0;$('pv').textContent='Preview the eclipse'}else{pv=performance.now();$('pv').textContent='Stop preview';open(false)}};
$('sky-events-toggle').onclick=()=>{
  const menu=$('sky-events-menu'),isOpen=menu.hidden;
  menu.hidden=!isOpen;
  $('sky-events-toggle').setAttribute('aria-expanded',String(isOpen));
};
function updateSpaceEventButtons(){
  document.querySelectorAll('#sky-events-menu [data-space-event]').forEach(button=>{
    button.setAttribute('aria-pressed',String(manualSpaceEvent?.type===button.dataset.spaceEvent));
  });
}
$('sky-events-menu').onclick=e=>{
  const button=e.target.closest('[data-space-event]');
  const type=button?.dataset.spaceEvent;
  if(!type)return;
  if(manualSpaceEvent?.type===type){
    manualSpaceEvent=null;
  }else{
    const duration={milkyway:60000,meteor:60000,auroraNorth:90000,auroraSouth:90000}[type];
    manualSpaceEvent={type,startedAt:performance.now(),duration,seed:Math.random()*0xffffffff>>>0};
  }
  updateSpaceEventButtons();
  $('sky-events-menu').hidden=true;
  $('sky-events-toggle').setAttribute('aria-expanded','false');
};
if(!S.seen&&!CFG.when){S.seen=true;save();open(true)}
else if(CFG.when)S.seen=true;
refreshRoom();
setInterval(refreshRoom,15000);

// distance: look up both places (OpenStreetMap), compute the miles ourselves
let GEO={};try{GEO=JSON.parse(localStorage.getItem('ec-geo')||'{}')}catch(e){}
const saveGeo=()=>{try{localStorage.setItem('ec-geo',JSON.stringify(GEO))}catch(e){}};
async function geocode(q){
  const key=q.trim().toLowerCase();if(!key)return null;
  if(GEO[key])return GEO[key];
  const j=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q))).json();
  if(!j[0])return null;
  GEO[key]={lat:+j[0].lat,lng:+j[0].lon};saveGeo();return GEO[key];
}
const miBetween=(a,b)=>{const t=x=>x*Math.PI/180,p=Math.sin(t(b.lat-a.lat)/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(t(b.lng-a.lng)/2)**2;return 3958.8*2*Math.asin(Math.sqrt(p))};
let gt;
function updateMiles(){
  clearTimeout(gt);
  gt=setTimeout(async()=>{
    if(!S.placeA||!S.placeB){$('mi-s').textContent='';return}
    $('mi-s').textContent='Finding the distance…';
    try{
      const[a,b]=await Promise.all([geocode(S.placeA),geocode(S.placeB)]);
      if(!a||!b){$('mi-s').textContent='Couldn’t find one of those places. Try “City, State”.';return}
      S.miles=Math.round(miBetween(a,b));$('mi-s').textContent='About '+S.miles.toLocaleString()+' miles apart.';
    }catch(e){$('mi-s').textContent='Couldn’t look that up right now.'}
  },600);
}
$('loc').onclick=()=>{
  if(!navigator.geolocation){$('mi-s').textContent='Location isn’t available in this browser.';return}
  $('mi-s').textContent='Asking for your location…';
  navigator.geolocation.getCurrentPosition(async p=>{
    const lat=p.coords.latitude,lng=p.coords.longitude;let label='Here';
    try{
      const a=(await(await fetch('https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat='+lat+'&lon='+lng)).json()).address||{};
      label=[a.city||a.town||a.village||a.county,a.state].filter(Boolean).join(', ')||label;
    }catch(e){}
    GEO[label.toLowerCase()]={lat,lng};saveGeo();
    S.placeA=label;$('f-pa').value=label;save();texts();updateMiles();
  },()=>{$('mi-s').textContent='Couldn’t get your location. You can type a city instead.'},{timeout:10000});
};

// wishes: notes that pop up when a falling star is tapped
let AC,wi=-1,wtm;
function chime(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;
  [784,1175,1568].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),b=t+i*.12;o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0,b);g.gain.linearRampToValueAtTime(.09,b+.02);g.gain.exponentialRampToValueAtTime(.0001,b+1.6);
    o.connect(g);g.connect(AC.destination);o.start(b);o.stop(b+1.7)})}catch(e){}}
function showWish(){
  const L=allWishes().map(wish=>wish.text).filter(t=>typeof t==='string'&&t.trim());
  if(!L.length)return;
  let n;do{n=Math.floor(Math.random()*L.length)}while(L.length>1&&n===wi);wi=n;
  const t=L[n];
  $('wtxt').textContent=t;$('wish').classList.add('on');clearTimeout(wtm);wtm=setTimeout(()=>$('wish').classList.remove('on'),10000);
}
function closeWish(){ $('wish').classList.remove('on');clearTimeout(wtm); }
document.addEventListener('pointerdown',()=>{if($('wish').classList.contains('on'))closeWish()},true);
$('wish').onclick=closeWish;
const sc=()=>(PRE[S.pre]||PRE.gold)[0];
cv.addEventListener('pointermove',e=>{if(pt.length<500)spark(e.clientX,e.clientY,1,{v:.5,g:.02,d:.03,r:1.3,c:sc()})});
cv.addEventListener('pointerdown',e=>{
  if(wst&&Math.hypot(e.clientX-wst.x,e.clientY-wst.y)<36){const x=wst.x,y=wst.y;wst=null;nextWish=performance.now()+30000;spark(x,y,40,{v:2.2,g:.03,d:.015,r:2});chime();showWish();return}
  spark(e.clientX,e.clientY,14,{v:2,g:.04,d:.022,r:1.8,c:sc()});
});
// add a song right on the page
{const t=new Date(Date.now()+864e5);$('s-date').value=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())}
$('s-copy').onclick=async()=>{
  const all=notes().map(({date,song,text,image,who})=>({date,song,text,image,...(who?{who}:{})})),t='songs: '+JSON.stringify(all,null,2)+',';
  try{await navigator.clipboard.writeText(t);$('s-st').textContent='Copied. Paste it over the songs list in config.js to share them with anyone who opens the site.'}
  catch(e){$('s-st').textContent='Couldn’t copy automatically.'}
};
texts();renderNotes();renderCountdownHistory();archivePastCountdown();updateMiles();requestAnimationFrame(draw);
