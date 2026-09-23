
import html2canvas from 'html2canvas';
import { fallbackBrewName, isValidBrewName, shareBrewName } from '../shared/brew-name.js';
import { playIngredient, playBell, unlockSound } from './sound.js';
(function(){
"use strict";
/* ---------- data ---------- */
const BASE='#3B2519';
const EMO={
  happy:{n:'开心',c:'#C98A4B',ing:'焦糖'},
  excited:{n:'兴奋',c:'#E58A3A',ing:'橙汁'},
  calm:{n:'平静',c:'#FAF6EF',ing:'燕麦奶'},
  miss:{n:'想念',c:'#D8AE4E',ing:'桂花蜜'},
  tired:{n:'疲惫',c:'#8A6450',ing:'冷萃'},
  anxious:{n:'焦虑',c:'#C9D2D3',ing:'海盐奶盖'},
  regret:{n:'遗憾',c:'#D46F5A',ing:'西柚'},
  sad:{n:'悲伤',c:'#4A3226',ing:'黑咖啡'}
};
const ORDER=['happy','excited','calm','miss','tired','anxious','regret','sad'];
const METHOD={
  happy:{k:'combo',n:'一咖两喝 Combo',s:'Combo',en:'Combo'},
  excited:{k:'tonic',n:'咖啡汤力',s:'汤力',en:'Espresso Tonic'},
  calm:{k:'pourover',n:'手冲',s:'手冲',en:'Pour Over'},
  miss:{k:'siphon',n:'虹吸壶',s:'虹吸',en:'Siphon'},
  tired:{k:'dirty',n:'冰博克 Dirty',s:'冰博克',en:'Dirty'},
  anxious:{k:'icedrip',n:'冰滴',s:'冰滴',en:'Ice Drip'},
  regret:{k:'coldbrew',n:'冷萃',s:'冷萃',en:'Cold Brew'},
  sad:{k:'phin',n:'越南滴滴壶',s:'滴滴壶',en:'Phin'}
};
const BEAN={
  happy:{n:'埃塞俄比亚 耶加雪菲 · 水洗',s:'耶加雪菲',f:'柑橘、茉莉',g:'lemon',t:'#F3D98B'},
  excited:{n:'哥伦比亚 · 厌氧发酵',s:'哥伦比亚',f:'百香果、草莓、酒感',g:'berry',t:'#F0B3B8'},
  calm:{n:'巴拿马 瑰夏 · 水洗',s:'瑰夏',f:'茉莉、佛手柑、蜂蜜',g:'flower',t:'#E3D8EE'},
  miss:{n:'云南 保山 · 蜜处理',s:'保山',f:'红糖、蜜桃、乌龙',g:'osmanthus',t:'#F2CD9A'},
  tired:{n:'巴西 喜拉多 · 半日晒',s:'喜拉多',f:'坚果、可可、焦糖',g:'cocoa',t:'#E2C6A4'},
  anxious:{n:'印尼 曼特宁 · 湿刨法',s:'曼特宁',f:'黑巧、草本',g:'herb',t:'#BFD0B8'},
  regret:{n:'肯尼亚 AA · 水洗',s:'肯尼亚',f:'黑醋栗、西柚',g:'grapefruit',t:'#F1B4A2'},
  sad:{n:'哥伦比亚 · 朗姆桶陈',s:'朗姆桶',f:'朗姆酒、黑糖、葡萄干',g:'caramel',t:'#D9B38E'}
};
const BAT_TXT=['快没电了','有点累','还行','挺有劲','满格'];
const FB_NOTE={happy:'这份开心，分你一口也不少',excited:'先坐下，杯子会等你',calm:'今天不赶时间',miss:'这杯的甜，留给想起的人',tired:'今天也算没白熬',anxious:'这口先替你咽下去',regret:'这杯不用喝完，捧着就好',sad:'今天可以不用懂事'};
const HIDDEN_NOTES=['你是今天被偏爱的那一个','这杯没写在菜单上，只给你','今天的好运，先存在杯底'];
const BANNED=['治愈','温暖','美好','元气','奔赴','热爱','生活','开心','兴奋','平静','想念','疲惫','焦虑','遗憾','悲伤','难过','伤心','快乐'];
const CRISIS=['想死','不想活','自杀','轻生','结束生命','活不下去','伤害自己','割腕','去死'];
const INK='#1C1B1A';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
let uidN=0;const uid=p=>(p||'u')+(++uidN);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const WEEK='日一二三四五六';
function fmtDate(ts,withTime){const d=new Date(ts);let s=`${d.getMonth()+1}月${d.getDate()}日 周${WEEK[d.getDay()]}`;if(withTime)s+=` · ${pad(d.getHours())}:${pad(d.getMinutes())}`;return s}
function shortDate(ts){const d=new Date(ts);return `${String(d.getFullYear()).slice(2)}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('on'),2200)}
const easeOut=t=>1-Math.pow(1-t,3);
const easeIn=t=>t*t;
const easeBack=t=>{const c1=1.5,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
function tween(ms,fn,ease){ease=ease||easeOut;return new Promise(res=>{if(reduce||ms<=0){fn(1);res();return}const t0=performance.now();(function f(now){const t=Math.min(1,(now-t0)/ms);fn(ease(t));t<1?requestAnimationFrame(f):res()})(t0)})}
const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));
const NS='http://www.w3.org/2000/svg';
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- small icons (16px, centered) ---------- */
function ingIcon(e){
  const c=EMO[e].c;
  switch(e){
    case 'happy':return `<path d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z" fill="${c}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    case 'excited':return `<circle r="5" fill="${c}" stroke="${INK}" stroke-width="1.1"/><circle cx="-1.6" cy="-1.6" r="1.2" fill="#fff"/>`;
    case 'calm':return `<path d="M0 -7Q5 0 4 3A4 4 0 0 1 -4 3Q-5 0 0 -7Z" fill="${c}" stroke="${INK}" stroke-width="1.1"/>`;
    case 'miss':return `<path d="M0 5Q-7 0 -6 -3Q-5 -7 -1 -5L0 -4L1 -5Q5 -7 6 -3Q7 0 0 5Z" fill="${c}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    case 'tired':return `<rect x="-5" y="-5" width="10" height="10" rx="2" fill="#F4F6F6" stroke="${INK}" stroke-width="1.1"/><path d="M-2 -2L1 -2" stroke="${INK}" stroke-width=".8"/>`;
    case 'anxious':return `<path d="M-6 2Q-7 -3 -3 -3Q-2 -7 2 -5Q7 -5 6 0Q7 4 2 4L-3 4Q-7 4 -6 2Z" fill="${c}" stroke="${INK}" stroke-width="1.1"/>`;
    case 'regret':return `<path d="M-6 4Q-2 -6 6 -4Q1 -2 -2 5Z" fill="${c}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    case 'sad':return `<path d="M0 -7Q5 0 4 3A4 4 0 0 1 -4 3Q-5 0 0 -7Z" fill="#CFDCE2" stroke="${INK}" stroke-width="1.1"/>`;
  }
}

/* ---------- jars ---------- */
const FACE={
  happy:'<path class="ln-thin" d="M21 27Q23 25 25 27M31 27Q33 25 35 27"/><path class="ln-thin" d="M24 31Q28 34 32 31"/>',
  excited:'<circle cx="23" cy="26.5" r="1.4" class="inkfill"/><circle cx="33" cy="26.5" r="1.4" class="inkfill"/><path class="inkfill" d="M25 30Q28 36 31 30Z"/><path class="ln-thin" d="M8 12L5 9M48 12L51 9"/>',
  calm:'<path class="ln-thin" d="M21 27H25M31 27H35"/><path class="ln-thin" d="M25 31.5H31"/>',
  miss:'<circle cx="23" cy="26" r="1.1" class="inkfill"/><circle cx="33" cy="26" r="1.1" class="inkfill"/><circle cx="28" cy="31" r="1.4" class="ln-thin"/><path class="ln-thin" d="M44 10Q42 7 45 7Q46 7 46 9Q46 7 47.5 7Q50 7 48 10L46 12Z"/>',
  tired:'<path class="ln-thin" d="M21 26L25 28M35 26L31 28"/><path class="ln-thin" d="M25 32Q28 30.5 31 32"/><path class="ln-thin" d="M44 6H49L44 11H49"/>',
  anxious:'<circle cx="23" cy="26" r="1.1" class="inkfill"/><circle cx="33" cy="26" r="1.1" class="inkfill"/><path class="ln-thin" d="M23 31.5Q24.5 29.5 26 31.5T29 31.5T32 31.5"/><path class="ln-thin" d="M39 22Q41 25 39.5 26.5Q38 25 39 22Z"/>',
  regret:'<path class="ln-thin" d="M21 28Q23 29.5 25 28M31 28Q33 29.5 35 28"/><path class="ln-thin" d="M25.5 32.5H30.5"/>',
  sad:'<circle cx="23" cy="26" r="1.1" class="inkfill"/><circle cx="33" cy="26" r="1.1" class="inkfill"/><path class="ln-thin" d="M24 33Q28 29.5 32 33"/><path d="M22 29Q23.6 31.5 22.8 32.5Q21.4 32 22 29Z" fill="#CFDCE2" stroke="var(--ink)" stroke-width=".9"/>'
};
function jarSVG(e){const id=uid('jc');return `<svg viewBox="0 0 56 64" aria-hidden="true"><defs><clipPath id="${id}"><path d="M12 18Q10 20 10 26V54Q10 60 16 60H40Q46 60 46 54V26Q46 20 44 18Z"/></clipPath></defs><rect x="0" y="40" width="56" height="24" fill="${EMO[e].c}" clip-path="url(#${id})"/><path class="ln-thin" d="M10 40Q28 38 46 40" opacity=".5"/><path class="inkfill" d="M14 8H42V15H14Z"/><path class="ln" d="M12 18Q10 20 10 26V54Q10 60 16 60H40Q46 60 46 54V26Q46 20 44 18Z"/><path class="ln-thin" d="M14 15L12 18M42 15L44 18"/>${FACE[e]}</svg>`}

/* ---------- Glass (mix / wait / open) ---------- */
const G={clip:'42,26 55,258 165,258 178,26',bot:258,unit:30};
class Glass{
  constructor(svg){
    const cid=uid('gc');this.svg=svg;
    svg.innerHTML=`<defs><clipPath id="${cid}"><polygon points="${G.clip}"/></clipPath></defs>
      <g clip-path="url(#${cid})"><g class="liq"></g><g class="fx"></g></g>
      <g filter="url(#wob)"><path class="ln" d="M40 22L54 262Q110 272 166 262L180 22"/><ellipse class="ln" cx="110" cy="22" rx="70" ry="6"/><path class="ln-thin" d="M58 250Q110 257 162 250" opacity=".7"/></g>
      <g class="steam"></g>`;
    this.liq=svg.querySelector('.liq');this.fx=svg.querySelector('.fx');this.steam=svg.querySelector('.steam');
    this.cur={};this.order=[];this.nodes={};this.surface=G.bot;
  }
  node(key,color){
    if(!this.nodes[key]){const g=el('g',{},this.liq);const r=el('rect',{x:0,width:220,fill:color},g);const l=el('path',{class:'ln-thin',opacity:.45},g);this.nodes[key]={g,r,l}}
    this.nodes[key].r.setAttribute('fill',color);return this.nodes[key];
  }
  draw(){
    let y=G.bot;
    for(const k of this.order){const n=this.nodes[k];const h=Math.max(0,this.cur[k]||0);n.r.setAttribute('y',y-h);n.r.setAttribute('height',h+0.6);const yy=y-h;n.l.setAttribute('d',h>1?`M0 ${yy}Q55 ${yy-1.6} 110 ${yy}T220 ${yy}`:'');y-=h}
    this.surface=y;
  }
  set(list,ms){
    const target={};list.forEach(it=>{target[it.key]=it.p*G.unit;this.node(it.key,it.c)});
    const gone=this.order.filter(k=>!(k in target));
    this.order=list.map(i=>i.key).concat(gone);
    gone.forEach(k=>target[k]=0);
    const from={...this.cur};
    return tween(ms==null?520:ms,t=>{for(const k in target){const a=from[k]||0;this.cur[k]=a+(target[k]-a)*t}this.draw()},easeBack).then(()=>{
      gone.forEach(k=>{this.nodes[k].g.remove();delete this.nodes[k];delete this.cur[k]});
      this.order=this.order.filter(k=>k in this.cur||list.some(i=>i.key===k));this.draw();
    });
  }
  clear(){this.liq.innerHTML='';this.fx.innerHTML='';this.cur={};this.order=[];this.nodes={};this.surface=G.bot}
  async drop(e){
    if(reduce||e==='calm')return;
    const x=110+rnd(-24,24);const g=el('g',{},this.fx);g.innerHTML=ingIcon(e);
    const target=this.surface-3;
    await tween(420,t=>g.setAttribute('transform',`translate(${x} ${30+(target-30)*t}) rotate(${t*120})`),easeIn);
    g.remove();
    const rip=el('ellipse',{cx:x,cy:this.surface,rx:3,ry:1.2,class:'ln-thin'},this.fx);
    tween(450,t=>{rip.setAttribute('rx',3+44*t);rip.setAttribute('ry',1.2+3*t);rip.setAttribute('opacity',1-t)}).then(()=>rip.remove());
  }
  detail(e){
    if(reduce)return;
    const s=this.surface,fx=this.fx;
    const floatUp=(shape,x,dist,ms,delay)=>{setTimeout(()=>{const g=el('g',{},fx);g.innerHTML=shape;tween(ms,t=>{g.setAttribute('transform',`translate(${x+Math.sin(t*6)*3} ${s-6-dist*t}) scale(.9)`);g.setAttribute('opacity',1-t*t)}).then(()=>g.remove())},delay||0)};
    switch(e){
      case 'happy':[0,1,2].forEach(i=>floatUp(ingIcon('happy'),80+i*28,70,900,i*120));break;
      case 'excited':[0,1,2,3].forEach(i=>{setTimeout(()=>{const c=el('circle',{r:rnd(2.5,4),class:'ln-thin',fill:'rgba(255,255,255,.5)'},fx);const x=rnd(70,150),y0=G.bot-10;tween(700,t=>{c.setAttribute('cx',x+Math.sin(t*9)*3);c.setAttribute('cy',y0-(y0-s+4)*t)}).then(()=>c.remove())},i*110)});break;
      case 'miss':floatUp(`<g transform="scale(1.3)">${ingIcon('miss')}</g>`,112,60,1100);break;
      case 'tired':{const g=el('g',{},fx);g.innerHTML=`<rect x="-9" y="-9" width="18" height="18" rx="3" fill="rgba(255,255,255,.75)" stroke="${INK}" stroke-width="1.2"/>`;
        tween(380,t=>g.setAttribute('transform',`translate(128 ${30+(s+10-30)*t})`),easeIn).then(()=>tween(700,t=>g.setAttribute('transform',`translate(128 ${s+10}) rotate(${Math.sin(t*Math.PI*4)*9*(1-t)})`))).then(()=>tween(300,t=>g.setAttribute('opacity',1-t))).then(()=>g.remove());break}
      case 'anxious':tween(520,t=>this.liq.setAttribute('transform',`translate(${Math.sin(t*Math.PI*4)*3.5*(1-t)} 0)`)).then(()=>this.liq.removeAttribute('transform'));break;
      case 'regret':{const g=el('g',{},fx);g.innerHTML=`<g transform="scale(1.4)">${ingIcon('regret')}</g>`;tween(800,t=>g.setAttribute('transform',`translate(${170-6*t*(1)} ${34+(s-34)*t}) rotate(${-20+30*t})`),easeIn).then(()=>g.remove());break}
      case 'sad':[0,1].forEach(i=>setTimeout(()=>{const g=el('g',{},fx);g.innerHTML=ingIcon('sad');const x=98+i*22;tween(420,t=>g.setAttribute('transform',`translate(${x} ${30+(s-30)*t})`),easeIn).then(()=>{g.remove();const r=el('ellipse',{cx:x,cy:s,rx:2,ry:1,class:'ln-thin'},fx);tween(350,t=>{r.setAttribute('rx',2+14*t);r.setAttribute('opacity',1-t)}).then(()=>r.remove())})},i*260));break;
    }
  }
  steamOn(){this.steam.innerHTML=[0,1,2].map(i=>`<path class="ln-thin" d="M${92+i*18} 2Q${88+i*18} -8 ${92+i*18} -16" opacity="0"><animate attributeName="opacity" values="0;.9;0" dur="2.4s" begin="${i*.5}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 8;0 -4" dur="2.4s" begin="${i*.5}s" repeatCount="indefinite"/></path>`).join('');this.svg.setAttribute('viewBox','0 -24 220 304')}
}

/* ---------- vessels (share / reveal / cabinet) ---------- */
const VES={
  combo:{vb:'8 50 184 140',lines:['M14 170L186 170','M18 170L25 182L175 182L182 170','M32 132Q32 164 55 164Q78 164 78 132','M78 139Q91 139 89 150Q87 157 76 156','M28 166Q55 171 82 166','M100 70L106 166L156 166L162 70','M104 152Q131 156 158 152'],ell:[[55,132,23,3.5],[131,70,31,4]],fixed:[{d:'M34 136Q35 161 55 162Q75 161 76 136Z',c:BASE}],clip:'M101 72L106.5 164L155.5 164L161 72Z',bot:164,top:80,g:[160,68]},
  tonic:{vb:'34 4 132 180',lines:['M70 36L78 176L122 176L130 36','M76 162Q100 167 124 162','M116 12L99 150'],ell:[[100,36,30,4]],clip:'M71 38L78.5 174L121.5 174L129 38Z',bot:174,top:48,ice:[[84,96,19],[105,118,17]],bub:[[90,150],[112,140],[96,128]],g:[128,36]},
  pourover:{vb:'38 24 128 160',lines:['M60 38L140 38L112 84L88 84Z','M78 50L94 80','M100 46L100 80','M122 50L106 80','M78 84L122 84L118 92L82 92','M68 100Q58 150 72 178L128 178Q142 150 132 100','M64 100L136 100','M134 112Q158 116 152 140Q148 154 130 154'],clip:'M69 102Q60 150 73 176L127 176Q140 150 131 102Z',bot:176,top:116,drips:[[100,96]],g:[138,36]},
  siphon:{vb:'36 12 128 176',lines:['M82 26L118 26L112 78Q100 90 88 78Z','M96 88L96 110','M104 88L104 110','M56 182L144 182','M64 182L70 116','M136 182L130 116','M92 182L94 176H106L108 182'],circ:[[100,144,34]],clip:'M68 144A32 32 0 1 0 132 144A32 32 0 1 0 68 144Z',bot:176,top:118,g:[118,24]},
  dirty:{vb:'22 60 156 132',lines:['M48 106L57 178L143 178L152 106','M55 164Q100 170 145 164'],ell:[[100,106,52,5]],clip:'M49 108L57.5 176L142.5 176L151 108Z',bot:176,top:116,ice:[[76,122,22]],g:[150,104]},
  icedrip:{vb:'34 6 132 184',lines:['M52 14L52 184','M148 14L148 184','M44 16L156 16','M44 184L156 184','M52 66L148 66','M52 118L148 118','M76 22Q74 56 100 60Q126 56 124 22Z','M100 60L100 70','M84 74L116 74L112 102L88 102Z','M72 128L78 180L122 180L128 128'],fixed:[{d:'M78 30Q77 55 100 58Q123 55 122 30Z',c:'#E4EBEC'},{d:'M86 86L114 86L112 100L88 100Z',c:BASE}],clip:'M73 130L78.5 178L121.5 178L127 130Z',bot:178,top:136,drips:[[100,108],[100,116]],g:[126,126]},
  coldbrew:{vb:'26 24 148 160',lines:['M38 74Q38 60 52 56L52 44L72 44L72 56Q86 60 86 74L86 178L38 178Z','M46 110H78V140H46Z','M98 98L104 178L152 178L158 98','M102 164Q128 169 154 164'],solid:['M50 34H74V44H50Z'],ell:[[128,98,30,4]],fixed:[{d:'M40 86L84 86L84 176L40 176Z',c:BASE},{d:'M46 110H78V140H46Z',c:'#FBFBF9'}],clip:'M99 100L104.5 176L151.5 176L157 100Z',bot:176,top:108,ice:[[112,114,18]],g:[156,96]},
  phin:{vb:'34 26 132 158',lines:['M62 98L70 178L130 178L138 98','M68 164Q100 170 132 164','M76 90L78 52L122 52L124 90','M72 52L128 52L122 44L78 44Z','M88 64L112 64'],ell:[[100,92,48,5]],solid:['M95 36H105V44H95Z'],fixed:[{d:'M80 70L120 70L121 88L79 88Z',c:BASE}],clip:'M63 100L70.5 176L129.5 176L137 100Z',bot:176,top:110,drips:[[100,104]],g:[138,120]}
};
function garnishSVG(kind,t){
  const k='stroke="#1C1B1A" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"';
  switch(kind){
    case 'lemon':return `<circle r="9" fill="${t}" ${k}/><circle r="6.5" fill="none" ${k} stroke-width=".7"/><path d="M0 -6.5V6.5M-6.5 0H6.5M-4.6 -4.6L4.6 4.6M4.6 -4.6L-4.6 4.6" ${k} stroke-width=".6"/>`;
    case 'berry':return `<circle cx="-4" cy="-2" r="5" fill="${t}" ${k}/><circle cx="4" cy="0" r="5" fill="${t}" ${k}/><path d="M-3 -7Q0 -12 5 -10Q2 -7 -3 -7Z" fill="#fff" ${k}/>`;
    case 'flower':return [0,72,144,216,288].map(a=>`<circle cx="${(4.2*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(4.2*Math.sin(a*Math.PI/180)).toFixed(1)}" r="3.4" fill="#fff" ${k}/>`).join('')+`<circle r="2.2" fill="${t}" ${k}/>`;
    case 'osmanthus':return [[-6,-2],[2,-5],[6,3]].map(([x,y])=>[0,90,180,270].map(a=>`<circle cx="${x+2*Math.cos(a*Math.PI/180)}" cy="${y+2*Math.sin(a*Math.PI/180)}" r="1.9" fill="${t}" ${k} stroke-width=".7"/>`).join('')).join('');
    case 'cocoa':return `<path d="M-12 1Q0 -5 12 1" fill="none" ${k}/>`+[[-8,-2],[-3,-4],[2,-4],[7,-2],[-5,-7],[4,-7],[0,-9]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.5" fill="${t}" ${k} stroke-width=".6"/>`).join('');
    case 'herb':return `<path d="M0 10Q2 0 -2 -12" fill="none" ${k}/>`+[[-4,-6,-35],[3,-2,30],[-3,3,-30],[2,-10,25]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="3.2" ry="1.8" transform="rotate(${r} ${x} ${y})" fill="${t}" ${k} stroke-width=".8"/>`).join('');
    case 'grapefruit':return `<path d="M-10 0A10 10 0 0 1 10 0Z" fill="${t}" ${k}/><path d="M-7 0A7 7 0 0 1 7 0M0 0V-7M0 0L-5 -5M0 0L5 -5" fill="none" ${k} stroke-width=".6"/>`;
    case 'caramel':return `<path d="M-14 -2Q-8 7 -2 -1T12 1" fill="none" stroke="${t}" stroke-width="3.4" stroke-linecap="round"/><path d="M-14 -2Q-8 7 -2 -1T12 1" fill="none" ${k} stroke-width=".6"/>`;
  }
}
/* cup = {method, layers:[{c,p}], bean, hidden} ; opts {anim} */
function vesselSVG(cup,opts){
  opts=opts||{};const V=VES[cup.method];const id=uid('vc');
  const units=cup.layers.reduce((a,b)=>a+b.p,0);const H=V.bot-V.top;
  const fillH=H*Math.min(1,Math.max(.5,.34+units*.095));const unitH=fillH/units;
  let y=V.bot,rects='',seps='';
  cup.layers.forEach(l=>{const h=l.p*unitH;rects+=`<rect x="0" y="${(y-h).toFixed(1)}" width="200" height="${(h+.6).toFixed(1)}" fill="${l.c}"/>`;const yy=(y-h).toFixed(1);seps+=`<path class="ln-thin" opacity=".45" d="M0 ${yy}Q50 ${yy-1.4} 100 ${yy}T200 ${yy}"/>`;y-=h});
  const P=d=>`<path class="ln" pathLength="1" d="${d}"/>`;
  let body='';
  (V.fixed||[]).forEach(f=>body+=`<path class="lq" d="${f.d}" fill="${f.c}"/>`);
  body+=`<g class="lq" clip-path="url(#${id})">${rects}${seps}`;
  (V.ice||[]).forEach(([x,yy,s])=>body+=`<rect x="${x}" y="${yy}" width="${s}" height="${s}" rx="3" fill="rgba(255,255,255,.6)" stroke="#1C1B1A" stroke-width="1.2" transform="rotate(${(x%7)-3} ${x+s/2} ${yy+s/2})"/>`);
  (V.bub||[]).forEach(([x,yy])=>body+=`<circle cx="${x}" cy="${yy}" r="3" fill="none" stroke="#1C1B1A" stroke-width="1"/>`);
  body+=`</g><g filter="url(#wob)">`;
  V.lines.forEach(d=>body+=P(d));
  (V.ell||[]).forEach(([cx,cy,rx,ry])=>body+=`<ellipse class="ln" pathLength="1" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`);
  (V.circ||[]).forEach(([cx,cy,r])=>body+=`<circle class="ln" pathLength="1" cx="${cx}" cy="${cy}" r="${r}"/>`);
  (V.solid||[]).forEach(d=>body+=`<path class="inkfill" d="${d}"/>`);
  (V.drips||[]).forEach(([x,yy])=>body+=`<circle cx="${x}" cy="${yy}" r="1.8" class="inkfill"/>`);
  body+=`</g>`;
  const B=BEAN[cup.bean];
  body+=`<g class="lq" transform="translate(${V.g[0]} ${V.g[1]})">${garnishSVG(B.g,cup.hidden?'#E6C66A':B.t)}</g>`;
  return `<svg class="v${opts.anim?' drawing':''}" viewBox="${V.vb}" ${opts.label?`role="img" aria-label="${esc(opts.label)}"`:'aria-hidden="true"'}${opts.w?` width="${opts.w}" height="${opts.w}"`:''}><defs><clipPath id="${id}"><path d="${V.clip}"/></clipPath></defs>${body}</svg>`;
}

/* ---------- state ---------- */
const S={battery:3,layers:[],hist:[],msg:'',cup:null,saved:false,style:'receipt',forceHidden:/[?#&]hidden/.test(location.search+location.hash),busy:false};
const shots=()=>S.battery<=2?2:1;
const total=()=>S.layers.reduce((a,b)=>a+b.p,0);
function glassList(){return [{key:'base',c:BASE,p:shots()}].concat(S.layers.map(l=>({key:l.e,c:EMO[l.e].c,p:l.p})))}
function snap(){S.hist.push(JSON.stringify({b:S.battery,l:S.layers}));if(S.hist.length>40)S.hist.shift()}

/* ---------- screens ---------- */
let current='s-start';
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));current=id;window.scrollTo(0,0);if(id==='s-wait')startReplay();else stopReplay()}
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.back)));

/* ---------- start ---------- */
const openGlass=new Glass($('#openGlass'));openGlass.steamOn();
(async function intro(){
  const seq=[{key:'base',c:BASE,p:1},{key:'calm',c:EMO.calm.c,p:2},{key:'miss',c:EMO.miss.c,p:1},{key:'happy',c:EMO.happy.c,p:2}];
  await wait(300);
  for(let i=1;i<=seq.length;i++){await openGlass.set(seq.slice(0,i),560);await wait(120)}
})();
let taps=0,tapStart=0;
$('#startCup').addEventListener('click',()=>{const now=Date.now();if(now-tapStart>2000){taps=0;tapStart=now}taps++;if(taps>=5){taps=0;S.forceHidden=!S.forceHidden;toast(S.forceHidden?'下一杯必出隐藏款':'隐藏款恢复随机')}});
$('#goMix').addEventListener('click',()=>{resetMix();show('s-mix')});
$('#goRandom').addEventListener('click',()=>{unlockSound();randomCup()});
$('#toCabinet').addEventListener('click',()=>{if(current==='s-cabinet')return;cabFrom=current;openCabinet()});

/* ---------- mix ---------- */
const mixGlass=new Glass($('#mixGlass'));
function renderBattery(){
  const bat=$('#bat');bat.innerHTML='';
  for(let i=1;i<=5;i++){const b=document.createElement('button');b.className='cell'+(i<=S.battery?' full':'');b.setAttribute('role','radio');b.setAttribute('aria-checked',i===S.battery);b.setAttribute('aria-label',`${i} 格，${BAT_TXT[i-1]}`);b.addEventListener('click',()=>setBattery(i));bat.appendChild(b)}
  $('#batLabel').textContent=BAT_TXT[S.battery-1];
}
function setBattery(n){if(S.busy||n===S.battery)return;snap();S.battery=n;renderBattery();mixGlass.set(glassList());renderTags()}
function renderJars(){
  const wrap=$('#jars');wrap.innerHTML='';
  ORDER.forEach(e=>{const l=S.layers.find(x=>x.e===e);const b=document.createElement('button');b.className='jar';b.innerHTML=jarSVG(e)+`<span>${EMO[e].n}</span>`+(l?`<span class="cnt">×${l.p}</span>`:'');
    const full=total()>=5||(!l&&S.layers.length>=4);b.setAttribute('aria-disabled',full);b.setAttribute('aria-label',`${EMO[e].n}${l?`，已放 ${l.p} 份`:''}`);
    b.addEventListener('click',()=>addEmo(e));wrap.appendChild(b)});
}
function renderTags(){
  const t=$('#tags');t.innerHTML='';
  [...S.layers].reverse().forEach(l=>{const b=document.createElement('button');b.className='tag';b.innerHTML=`<span class="sw" style="background:${EMO[l.e].c}"></span>${EMO[l.e].n} ×${l.p}<span class="x">−1</span>`;b.setAttribute('aria-label',`${EMO[l.e].n} ${l.p} 份，点一下减一份`);b.addEventListener('click',()=>removeEmo(l.e));t.appendChild(b)});
  const f=document.createElement('div');f.className='tag fixed';f.innerHTML=`<span class="sw" style="background:${BASE}"></span>浓缩 ${shots()===2?'双份':'单份'}`;t.appendChild(f);
}
function renderStatus(){
  const n=total();$('#status').textContent=n?`加了 ${n} 份，还能再加 ${5-n} 份`:'还空着，挑一个罐子开始';
  $('#bellHint').innerHTML=n?'摇铃，<br>交给咖啡师':'';
}
function refreshMix(){renderJars();renderTags();renderStatus()}
function resetMix(){S.battery=3;S.layers=[];S.hist=[];S.msg='';S.cup=null;S.saved=false;$('#msg').value='';renderMessageUI();mixGlass.clear();mixGlass.set(glassList(),0);renderBattery();refreshMix()}
async function addEmo(e,quiet){
  if(S.busy&&!quiet)return;
  const l=S.layers.find(x=>x.e===e);
  if(total()>=5){$('#status').textContent='杯子满了，摇铃吧';return}
  if(!l&&S.layers.length>=4){$('#status').textContent='最多放四种';return}
  snap();if(l)l.p++;else S.layers.push({e,p:1});
  refreshMix();
  playIngredient(e);
  await mixGlass.drop(e);
  const p=mixGlass.set(glassList());mixGlass.detail(e);await p;
}
function removeEmo(e){if(S.busy)return;const l=S.layers.find(x=>x.e===e);if(!l)return;snap();l.p--;if(!l.p)S.layers=S.layers.filter(x=>x!==l);mixGlass.set(glassList(),380);refreshMix()}
$('#undo').addEventListener('click',()=>{if(S.busy||!S.hist.length){if(!S.hist.length)toast('没有可以撤回的了');return}const h=JSON.parse(S.hist.pop());S.battery=h.b;S.layers=h.l;renderBattery();mixGlass.set(glassList(),380);refreshMix()});
$('#dump').addEventListener('click',()=>{if(S.busy||!S.layers.length)return;snap();S.layers=[];mixGlass.set(glassList(),380);refreshMix()});
$('#bell').addEventListener('click',ring);
async function ring(){
  if(!total()){$('#status').textContent='先放点东西进去';return}
  if(S.busy&&!ring.auto)return;
  const b=$('#bellSvg');b.classList.remove('shake');void b.getBoundingClientRect();b.classList.add('shake');
  playBell();
  $('#bellHint').innerHTML='叮——';
  await wait(650);S.busy=false;ring.auto=false;show('s-wait');
}
async function randomCup(){
  resetMix();show('s-mix');S.busy=true;
  await wait(350);
  S.battery=1+Math.floor(Math.random()*5);renderBattery();mixGlass.set(glassList(),300);
  const pool=[...ORDER].sort(()=>Math.random()-.5);const kinds=1+Math.floor(Math.random()*2);
  for(let i=0;i<kinds;i++){const n=1+Math.floor(Math.random()*2);for(let j=0;j<n;j++){await addEmo(pool[i],true);await wait(160)}}
  await wait(1000);ring.auto=true;ring();
}

/* ---------- wait: replay ---------- */
const waitGlass=new Glass($('#waitGlass'));let replayOn=false,replayGen=0;
async function startReplay(){
  replayOn=true;const gen=++replayGen;
  while(replayOn&&gen===replayGen){
    waitGlass.clear();
    const list=glassList();
    for(let i=0;i<list.length;i++){if(!replayOn||gen!==replayGen)return;const it=list[i];if(it.key!=='base')await waitGlass.drop(it.key);await waitGlass.set(list.slice(0,i+1),520);await wait(260)}
    await wait(1600);
    if(reduce)return;
  }
}
function stopReplay(){replayOn=false}
function renderMessageUI(){const value=$('#msg').value.trim();$('#msgCount').textContent=[...$('#msg').value].length;$('#sendMsg').disabled=!value}
$('#msg').addEventListener('input',renderMessageUI);
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{$('#msg').value=b.dataset.example;renderMessageUI();$('#msg').focus()}));
$('#skipMsg').addEventListener('click',()=>{S.msg='';toReveal()});
$('#sendMsg').addEventListener('click',()=>{S.msg=$('#msg').value.trim();toReveal()});
$('#msg').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#sendMsg').click()}});

/* ---------- recipe ---------- */
function buildCup(){
  const idx=S.layers.map((l,i)=>({...l,i}));
  const sorted=[...idx].sort((a,b)=>b.p-a.p||a.i-b.i);
  const main=sorted[0].e,second=(sorted[1]||sorted[0]).e;
  const crisis=CRISIS.some(w=>S.msg.includes(w));
  const hidden=!crisis&&(S.forceHidden||Math.random()<.05);
  S.forceHidden=false;
  const strength=S.battery<=2?'浓一点':S.battery===3?'标准':'淡一点';
  const now=Date.now();
  return{id:'c'+now.toString(36)+Math.random().toString(36).slice(2,6),createdAt:now,battery:S.battery,shots:shots(),
    layers:[{c:BASE,p:shots(),e:'base'}].concat(S.layers.map(l=>({c:EMO[l.e].c,p:l.p,e:l.e}))),
    main,second,method:METHOD[main].k,methodKey:main,bean:second,strength,msg:S.msg,hidden,
    no:String(Math.floor(now/1000)%1000).padStart(3,'0'),
    name:'',note:'',barista:'',crisis};
}
const M=c=>METHOD[c.methodKey],Bn=c=>BEAN[c.bean];
function fallbackName(c){return fallbackBrewName(c.main,c.crisis)}
function fallbackNote(c){return c.hidden?HIDDEN_NOTES[Math.floor(Math.random()*HIDDEN_NOTES.length)]:FB_NOTE[c.main]}
function fallbackBarista(c){
  const feeling={happy:'这份高兴值得多留一会儿',excited:'先让这份雀跃慢慢落地',calm:'安静待一会儿也很好',miss:'想念谁，就给心里留个位置',tired:'累了就先歇一会儿',anxious:'紧绷的事先放在我这儿',regret:'没说完的事可以留到明天',sad:'难过时不用马上想通'}[c.main];
  const energy=c.battery<=2?'电量不多':c.battery>=4?'今天还有力气':'照自己的节奏';
  const first=c.msg.split(/[，。！？,!?]/)[0];
  const heard=first?`你说「${[...first].slice(0,12).join('')}${[...first].length>12?'…':''}」，我听见了。`:'';
  return `${heard}${energy}，${feeling}。`;
}
const clen=s=>[...String(s).replace(/[，。、！？,.!?\s…“”"'「」]/g,'')].length;
function okNote(s){return typeof s==='string'&&clen(s)>=5&&clen(s)<=18&&!BANNED.some(w=>s.includes(w))}
function okBarista(s){return typeof s==='string'&&clen(s)>=10&&clen(s)<=36}

async function generate(c){
  let out={};
  try{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('/api/brew-copy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        battery:c.battery,layers:c.layers.filter(l=>l.e!=='base').map(l=>({emotion:l.e,portions:l.p})),
        method:c.method,strength:c.strength,bean:c.bean,message:c.msg
      }),signal:controller.signal});
      if(response.ok)out=await response.json();
    }finally{clearTimeout(timer)}
  }catch(e){out={}}
  c.name=!c.crisis&&isValidBrewName(out.name)?out.name:fallbackName(c);
  c.note=c.crisis?'你值得有人陪着，先找信任的人说说':c.hidden?fallbackNote(c):(okNote(out.note)?out.note.trim():fallbackNote(c));
  c.barista=c.crisis?'我认真听到了你的话。现在请联系身边信任的人，或当地心理援助热线。':okBarista(out.barista)?out.barista.trim():fallbackBarista(c);
  return c;
}

/* ---------- reveal ---------- */
let storyMotion=null,storySequence=0;
function storyFrame(){
  const bean=$('#beanTrigger').getBoundingClientRect(),card=$('#storyCard').getBoundingClientRect();
  const x=bean.left+bean.width/2-card.left-card.width/2;
  const y=bean.top+bean.height/2-card.top-card.height/2;
  return `translate(${x}px, ${y}px) scale(.12) rotate(-12deg)`;
}
function animateStory(opening){
  if(reduce)return Promise.resolve();
  storyMotion?.cancel();
  const small={transform:storyFrame(),opacity:0};
  const full={transform:'translate(0, 0) scale(1) rotate(0)',opacity:1};
  storyMotion=$('#storyCard').animate(opening?[small,full]:[full,small],{
    duration:opening?520:380,easing:'cubic-bezier(.22,.8,.25,1)',fill:'both'
  });
  return storyMotion.finished.catch(()=>{});
}
function openStory(){
  ++storySequence;
  $('#recipeOverlay').hidden=false;
  $('#beanTrigger').setAttribute('aria-expanded','true');
  animateStory(true);
  $('#storyCard').focus({preventScroll:true});
}
async function closeStory(){
  if($('#recipeOverlay').hidden)return;
  const sequence=++storySequence;
  await animateStory(false);
  if(sequence!==storySequence)return;
  $('#recipeOverlay').hidden=true;
  $('#beanTrigger').setAttribute('aria-expanded','false');
  storyMotion?.cancel();storyMotion=null;
  $('#beanTrigger').focus({preventScroll:true});
}
$('#beanTrigger').addEventListener('click',openStory);
$('#storyCard').addEventListener('click',closeStory);
$('#storyCard').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault()}else if(e.key==='Enter'||e.key===' '){e.preventDefault();closeStory()}});
$('#recipeBackdrop').addEventListener('click',closeStory);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#recipeOverlay').hidden)closeStory()});
async function toReveal(){
  const c=buildCup();S.cup=c;S.saved=false;
  document.fonts.load('400 32px "Long Cang Extra"','院').catch(()=>{});
  show('s-reveal');
  const sv=$('#stageVessel'),stageNote=$('#stageNote'),nameEl=$('#cupName');
  $('#s-reveal').classList.toggle('hidden',c.hidden);
  $('#hiddenFlag').classList.toggle('on',c.hidden);
  $('#care').hidden=!c.crisis;
  ++storySequence;storyMotion?.cancel();storyMotion=null;
  $('#recipeOverlay').hidden=true;
  $('#beanTrigger').setAttribute('aria-expanded','false');
  $('#recipeOverlay').classList.toggle('hidden-cup',c.hidden);
  $('#storyMethod').textContent=`${M(c).n} · ${c.strength}`;
  $('#storyBean').textContent=Bn(c).n;
  $('#storyFlavor').textContent=Bn(c).f;
  $('#storyEmotions').textContent=c.layers.filter(l=>l.e!=='base').map(l=>`${EMO[l.e].n} ×${l.p}`).join('、');
  $('#storyBattery').textContent=`${c.battery}/5 · ${BAT_TXT[c.battery-1]}`;
  $('#storyWords').textContent=c.msg?'你的话，正在被听见…':'这杯的话，还在路上…';
  $('#cupDate').textContent=fmtDate(c.createdAt,true);
  nameEl.className='cup-name pending';nameEl.textContent='这一杯，正在落款…';
  $('#beanTrigger').classList.remove('is-inviting');
  $('#takeAway').disabled=true;$('#takeAway').textContent='还在落款…';
  $('#stageNoteText').textContent='这一页，先留白';
  sv.classList.remove('in');stageNote.classList.remove('in');$('#confetti').innerHTML='';
  sv.innerHTML=vesselSVG(c,{anim:true,label:`${M(c).n}`});
  const gen=generate(c);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(S.cup!==c)return;
    sv.classList.add('in');stageNote.classList.add('in');openStory();
  }));
  await wait(1300);
  if(S.cup!==c)return;
  if(c.hidden)confetti();
  await gen;
  if(S.cup!==c)return;
  $('#stageNoteText').textContent=c.note;
  $('#storyWords').textContent=c.barista;
  await wait(reduce?0:500);
  if(S.cup!==c)return;
  nameEl.className='cup-name hand';nameEl.textContent=c.name;
  $('#beanTrigger').classList.add('is-inviting');
  $('#takeAway').disabled=false;$('#takeAway').textContent='带走这杯';
}
function confetti(){if(reduce)return;const box=$('#confetti');box.innerHTML=Array.from({length:22},(_,i)=>`<i style="left:${rnd(4,96)}%;background:${i%3?'#E6C66A':'#FBFBF9'};animation-delay:${rnd(0,.6).toFixed(2)}s;transform:rotate(${rnd(0,90)}deg)"></i>`).join('')}
$('#again').addEventListener('click',()=>{resetMix();show('s-mix')});
$('#takeAway').addEventListener('click',()=>{renderCard();show('s-share')});

/* ---------- sheet ---------- */
let lastFocus=null;
function openSheet(html){lastFocus=document.activeElement;$('#sheet').innerHTML=html;$('#scrim').classList.add('on');const c=$('#sheet [data-close]');c&&c.addEventListener('click',closeSheet);setTimeout(()=>c&&c.focus(),50)}
function closeSheet(){$('#scrim').classList.remove('on');lastFocus&&lastFocus.focus&&lastFocus.focus()}
$('#scrim').addEventListener('click',e=>{if(e.target.id==='scrim')closeSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#scrim').classList.contains('on'))closeSheet()});
const closeBtn=`<button class="iconbtn" data-close aria-label="关闭" style="margin-right:-12px"><svg viewBox="0 0 24 24" class="ln-thin"><path d="M6 6L18 18M18 6L6 18"/></svg></button>`;
/* ---------- share cards ---------- */
function hiddenBadge(c){return c.hidden?`<span class="hidden-badge"><span class="sticker" style="background:#D9B55A;width:18px;height:18px"><svg viewBox="0 0 18 18" width="12" height="12"><path d="M9 2Q10 8 16 9Q10 10 9 16Q8 10 2 9Q8 8 9 2Z" fill="#1C1B1A"/></svg></span>隐藏款</span>`:''}
function ingredients(c){return c.layers.map(l=>l.e==='base'?`浓缩 ${c.shots===2?'双份':'单份'}`:`${EMO[l.e].ing}${l.p>1?' ×'+l.p:''}`)}
function splitHalf(s){const a=[...s];const m=Math.ceil(a.length/2);return[a.slice(0,m).join(''),a.slice(m).join('')]}
const SHARE_EMOTIONS=/开心|兴奋|平静|想念|疲惫|焦虑|遗憾|悲伤|难过|伤心|快乐/;
function shareName(c){return shareBrewName(c.name,c.main,c.crisis)}
function shareNote(c){const note=c.note||fallbackNote(c);return SHARE_EMOTIONS.test(note)?'今天也算没白熬':note}
function cardHTML(c,style){
  const date=shortDate(c.createdAt),name=esc(shareName(c)),note=esc(shareNote(c));
  if(style==='receipt'){
    const zig=Array.from({length:23},(_,i)=>`${(22-i)*10} ${i%2?360:352}`).join(' L');
    return `<div class="sc" style="display:flex;justify-content:center;align-items:flex-start;padding-top:18px">${hiddenBadge(c)}
      <div style="width:220px;position:relative">
        <svg width="220" height="366" viewBox="0 0 220 366" style="position:absolute;inset:0" aria-hidden="true"><path d="M0 0H220V352 L${zig} Z" fill="#FFFFFF"/><path d="M220 352 L${zig}" fill="none" stroke="#1C1B1A" stroke-width=".8" opacity=".4"/></svg>
        <div style="position:relative;padding:16px 18px 0;text-align:center">
          <div style="font-size:12px;letter-spacing:3px;font-weight:400">此刻咖啡馆</div>
          <div class="latin" style="font-size:10px;color:#6F6C67;margin-top:2px">${date} · No.${c.no}</div>
          <div style="border-top:1px dashed #1C1B1A;margin:10px 0 2px;opacity:.5"></div>
          <div style="width:128px;height:128px;margin:0 auto">${vesselSVG(c,{w:128})}</div>
          <div class="hand" style="font-size:24px;line-height:1.15;margin-top:2px">${name}</div>
          <div class="hand" style="font-size:17px;line-height:1.35;margin-top:8px;color:#1C1B1A">${note}</div>
          <div style="border-top:1px dashed #1C1B1A;margin:12px 0 6px;opacity:.5"></div>
          <div style="font-size:11px;color:#6F6C67">谢谢光临</div>
        </div>
      </div></div>`;
  }
  if(style==='polaroid'){
    const f=Bn(c).f.split('、')[0];
    return `<div class="sc" style="display:flex;align-items:center;justify-content:center">${hiddenBadge(c)}
      <div style="width:232px;background:#FFFFFF;border:1px solid #1C1B1A;padding:12px 12px 16px;transform:rotate(-2deg)">
        <div style="background:#F0EFEB;height:208px;display:flex;align-items:center;justify-content:center">${vesselSVG(c,{w:180})}</div>
        <div class="hand" style="font-size:24px;line-height:1.15;margin-top:12px">${name}</div>
        <div style="font-size:11px;color:#6F6C67;margin-top:6px">${esc(M(c).s)} · ${esc(f)} · <span class="latin">${date}</span></div>
      </div></div>`;
  }
  if(style==='journal'){
    const [a,b]=splitHalf(shareNote(c));
    const list=ingredients(c).slice(-5).reverse().map(t=>`<div style="display:flex;align-items:center;gap:7px;font-size:12px;line-height:1"><svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><rect x=".5" y=".5" width="10" height="10" fill="none" stroke="#1C1B1A"/><path d="M2.5 5.5L4.6 7.8L8.8 2.8" fill="none" stroke="#1C1B1A" stroke-width="1.2"/></svg>${esc(t)}</div>`).join('');
    return `<div class="sc" style="background:#FFFFFF;padding:26px 22px 20px 36px">${hiddenBadge(c)}
      <svg style="position:absolute;left:14px;top:0;height:100%" width="6" viewBox="0 0 6 400" preserveAspectRatio="none" aria-hidden="true"><path d="M1 0V400M5 0V400" stroke="#1C1B1A" stroke-width=".7" opacity=".5"/></svg>
      <div style="position:relative;display:inline-block;padding:4px 12px;margin-left:-8px">
        <svg style="position:absolute;inset:-4px -8px;width:calc(100% + 16px);height:calc(100% + 8px)" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M8 22Q6 5 52 4Q96 4 94 20Q92 36 48 36Q6 36 10 16" fill="none" stroke="#1C1B1A" stroke-width="1.2" vector-effect="non-scaling-stroke" filter="url(#wob)"/></svg>
        <span class="latin" style="font-size:20px;font-weight:300">${esc(M(c).en)}</span>
      </div>
      <div style="display:flex;gap:14px;margin-top:16px;align-items:flex-start">
        <div style="width:128px;height:118px;border:1px solid #1C1B1A;display:flex;align-items:center;justify-content:center;flex:none">${vesselSVG(c,{w:108})}</div>
        <div style="display:flex;flex-direction:column;gap:10px;padding-top:4px">${list}</div>
      </div>
      <div class="hand" style="font-size:26px;line-height:1.15;margin-top:20px">${name}</div>
      <div class="hand" style="font-size:18px;line-height:1.4;margin-top:8px">${esc(a)}<span style="background:rgba(163,189,91,.55);padding:0 2px">${esc(b)}</span></div>
      <div class="latin" style="position:absolute;right:22px;bottom:18px;font-size:10px;color:#6F6C67">${date}</div>
    </div>`;
  }
  /* label */
  const cells=Array.from({length:5},(_,i)=>`<span style="display:inline-block;width:6px;height:8px;margin-right:1px;background:${i<c.battery?'#1C1B1A':'transparent'};border:.5px solid #1C1B1A"></span>`).join('');
  const bars=Array.from({length:26},(_,i)=>`<rect x="${i*3}" y="0" width="${[1,2,1,1,2][i%5]}" height="16" fill="#1C1B1A"/>`).join('');
  return `<div class="sc" style="padding:26px 30px 0">${hiddenBadge(c)}
    <div style="background:#FFFFFF;border:1px solid #1C1B1A;border-radius:2px;padding:12px 14px 10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="latin" style="font-size:24px;font-weight:400">${c.no}</span><span style="font-size:11px;font-weight:400;letter-spacing:1px">此刻咖啡馆</span></div>
      <div class="latin" style="font-size:10px;color:#6F6C67">${String(new Date(c.createdAt).getHours()).padStart(2,'0')}:${String(new Date(c.createdAt).getMinutes()).padStart(2,'0')}</div>
      <div class="hand" style="font-size:24px;line-height:1.15;margin:6px 0 4px">${name}</div>
      <div style="font-size:11px;line-height:1.6">${esc(M(c).s)} · ${c.strength} · ${esc(Bn(c).s)}</div>
      <div style="font-size:11px;line-height:1.6;display:flex;align-items:center;gap:6px">电量 <span style="display:inline-flex;align-items:center">${cells}</span></div>
      <div style="font-size:11px;line-height:1.6;color:#6F6C67;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">备注：${esc(SHARE_EMOTIONS.test(c.msg||'')?'已留给咖啡师':c.msg||'无')}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px"><span class="latin" style="font-size:10px;color:#6F6C67">${date} &nbsp;1/1</span><svg width="78" height="16" aria-hidden="true">${bars}</svg></div>
    </div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:14px">
      <div class="hand" style="font-size:18px;line-height:1.4;max-width:150px">${note}</div>
      <div style="width:86px;height:86px;flex:none">${vesselSVG(c,{w:86})}</div>
    </div></div>`;
}
function renderCard(){$('#cardWrap').innerHTML=cardHTML(S.cup,S.style);document.querySelectorAll('#styleTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.style===S.style));$('#toShelf').textContent=S.saved?'去咖啡柜看看':'收进咖啡柜'}
document.querySelectorAll('#styleTabs button').forEach(b=>b.addEventListener('click',()=>{S.style=b.dataset.style;renderCard()}));
async function rasterizeCardSvg(svg){
  const rect=svg.getBoundingClientRect(),scale=3;
  if(!rect.width||!rect.height)throw new Error('svg-has-no-size');
  const copy=svg.cloneNode(true),originals=[svg,...svg.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];
  const properties=['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','color'];
  originals.forEach((node,i)=>{const style=getComputedStyle(node);properties.forEach(key=>clones[i].style.setProperty(key,style.getPropertyValue(key)))});
  // The page filter lives outside this SVG; keep the exported vessel self-contained.
  copy.querySelectorAll('[filter]').forEach(node=>node.removeAttribute('filter'));
  copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
  copy.setAttribute('width',rect.width*scale);copy.setAttribute('height',rect.height*scale);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));
  try{
    const image=new Image();
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});
    const canvas=document.createElement('canvas');canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let visible=0;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]>32)visible++;
    if(visible<canvas.width*canvas.height*.01)throw new Error('cup-image-empty');
    return canvas;
  }finally{URL.revokeObjectURL(url)}
}
async function captureCard(){
  const card=$('#cardWrap .sc');
  const cardRect=card.getBoundingClientRect();
  const vessels=[...card.querySelectorAll('svg.v')];
  if(!vessels.length)throw new Error('cup-image-missing');
  const cups=await Promise.all(vessels.map(async svg=>({rect:svg.getBoundingClientRect(),canvas:await rasterizeCardSvg(svg)})));
  const result=await html2canvas(card,{scale:3,backgroundColor:'#F0EFEB',useCORS:true,logging:false,onclone:doc=>{
    doc.querySelectorAll('#cardWrap .sc svg.v').forEach(svg=>{svg.style.visibility='hidden'});
  }});
  const ctx=result.getContext('2d'),sx=result.width/cardRect.width,sy=result.height/cardRect.height;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  cups.forEach(({rect,canvas})=>ctx.drawImage(canvas,(rect.left-cardRect.left)*sx,(rect.top-cardRect.top)*sy,rect.width*sx,rect.height*sy));
  ctx.restore();
  return result;
}
$('#saveImg').addEventListener('click',async()=>{
  const button=$('#saveImg');
  button.disabled=true;button.textContent='在洗照片…';
  try{
    await document.fonts.ready;
    const canvas=await captureCard();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('image-export-failed');
    const filename=`此刻咖啡馆-${shareName(S.cup).replace(/[\\/:*?"<>|]/g,'')}.png`;
    const file=new File([blob],filename,{type:'image/png'});
    if(/Android|iPhone|iPad|iPod/.test(navigator.userAgent)&&navigator.canShare?.({files:[file]})){
      try{await navigator.share({files:[file],title:'此刻咖啡馆'});return}catch(error){if(error.name==='AbortError')return}
    }
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=filename;
    if('download' in link){document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
    else{openSheet(`<div class="topbar"><h2 id="sheetTitle">长按保存图片</h2>${closeBtn}</div><img alt="分享图片" style="display:block;width:100%;max-width:300px;margin:auto" src="${url}"><p>长按图片保存</p>`);setTimeout(()=>URL.revokeObjectURL(url),60000)}
  }catch(error){console.error('图片导出失败',error);toast('图片没保存成功，请再试一次')}
  finally{button.disabled=false;button.textContent='保存图片'}
});
$('#toShelf').addEventListener('click',async()=>{
  if(!S.saved){const rec={...S.cup,style:S.style};S.saved=true;justSaved=rec.id;await store.save(rec)}
  cabFrom='s-share';openCabinet(monthKey(S.cup.createdAt));
});

/* ---------- store ---------- */
const LSK='moment-cafe-paper:cups';
const store={
  list:[],ready:null,
  init(){this.ready=(async()=>{
    try{const ls=JSON.parse(localStorage.getItem(LSK)||'[]');if(Array.isArray(ls))this.list=ls.slice(-200).filter(c=>c&&c.id&&c.createdAt)}catch(e){}
  })();return this.ready},
  async save(rec){
    this.list=this.list.filter(r=>r.id!==rec.id).concat([rec]).slice(-200);
    try{localStorage.setItem(LSK,JSON.stringify(this.list))}catch(e){toast('本机存储不可用，这杯暂时只在当前页面')}
  }
};
store.init();

/* ---------- cabinet ---------- */
let cabFrom='s-start',justSaved=null,curMonth=null;
const monthKey=ts=>{const d=new Date(ts);return d.getFullYear()*100+d.getMonth()+1};
const MN=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
async function openCabinet(focusMonth){
  show('s-cabinet');$('#shelfWrap').innerHTML='<p class="empty">正在把杯子摆出来…</p>';
  await Promise.race([store.ready,wait(4000)]);
  renderCabinet(focusMonth);
}
function renderCabinet(focusMonth){
  const mine=store.list.slice().sort((a,b)=>b.createdAt-a.createdAt);
  const cups=mine;
  const nowK=monthKey(Date.now());
  const keys=[...new Set([nowK].concat(cups.map(c=>monthKey(c.createdAt))))].sort((a,b)=>b-a).slice(0,6);
  curMonth=focusMonth&&keys.includes(focusMonth)?focusMonth:(curMonth&&keys.includes(curMonth)?curMonth:keys[0]);
  $('#months').innerHTML=keys.map(k=>`<button role="tab" data-k="${k}" aria-selected="${k===curMonth}">${MN[k%100-1]}月</button>`).join('');
  document.querySelectorAll('#months button').forEach(b=>b.addEventListener('click',()=>{curMonth=+b.dataset.k;renderCabinet(curMonth)}));
  const list=cups.filter(c=>monthKey(c.createdAt)===curMonth);
  let html='';
  if(!list.length){html+=`<p class="empty">这个月还没有收进来的杯子。<br>调一杯，放进来吧。</p>`;$('#shelfWrap').innerHTML=html;return}
  html+='<div class="shelf">';
  list.forEach((c,i)=>{
    const noteChars=[...(c.note||'')],memo=noteChars.slice(0,5).join('')+(noteChars.length>5?'…':'');const rot=((i*37)%7-3);
    html+=`<button class="slot" data-id="${esc(c.id)}" aria-label="${esc(c.name)}，${fmtDate(c.createdAt)}，${esc(c.note||'')}">
      ${c.id===justSaved?'<span class="flag">刚收进来</span>':''}${c.hidden?'<span class="gflag sticker" style="background:#D9B55A;width:18px;height:18px"><svg viewBox="0 0 18 18" width="12" height="12"><path d="M9 2Q10 8 16 9Q10 10 9 16Q8 10 2 9Q8 8 9 2Z" fill="#1C1B1A"/></svg></span>':''}
      ${vesselSVG(c)}<span class="memo" style="transform:rotate(${rot}deg)">${esc(memo)}</span><span class="d">${shortDate(c.createdAt).slice(3)}</span></button>`;
    if(i%3===2||i===list.length-1)html+=`<svg class="shelf-line" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path class="ln" filter="url(#wob)" d="M0 4Q80 6 150 3T300 5"/><path class="ln-thin" d="M6 4L10 13M294 4L290 13" opacity=".6"/></svg>`;
  });
  html+='</div>';$('#shelfWrap').innerHTML=html;
  document.querySelectorAll('.slot').forEach(b=>b.addEventListener('click',()=>{const c=cups.find(x=>x.id===b.dataset.id);if(c)openSheet(`<div class="topbar"><h2 id="sheetTitle">${fmtDate(c.createdAt)}</h2>${closeBtn}</div><div class="modal-card">${cardHTML(c,c.style||'receipt')}</div>`)}));
}
$('#cabBack').addEventListener('click',()=>show(cabFrom));
$('#cabAgain').addEventListener('click',()=>{resetMix();show('s-mix')});

/* ---------- boot ---------- */
resetMix();
})();
