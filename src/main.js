import "./styles.css";
import { DRINKS, ENERGY, FEELINGS, MILK_TEXT, OPTS, SWEETS, TAB_ORDER, TOP_TEXT, WHY } from "./data.js";
import { cloneModel, makeOrder as buildOrder, modelFrom as buildModel, realName, specLine, strengthText, topsLine } from "./recommend.js";
import { applyOption, editMoods as deriveEditMoods, recordEdit as updateEdits } from "./edit.js";
import { writeCopy as requestCopy } from "./copy.js";
import { renderReceipt, saveReceipt } from "./receipt.js";
import { createCup } from "./cup.js";

(function(){
const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

let energy=3; const picked=new Set();
let order=null, model=null, draft=null, baseDraft=null, edits=[];
let swapped=false, rankIdx=0, activeTab="temp", token=0;

const now=()=>new Date();
const wk=["周日","周一","周二","周三","周四","周五","周六"];
const p2=n=>String(n).padStart(2,"0");
function period(h){return h<5?"深夜":h<11?"早上":h<14?"中午":h<18?"下午":h<22?"晚上":"深夜";}
const {drawFinish,pour,resetCup,showFull,tweenTo}=createCup($,RM);
$("today").textContent=(d=>`${d.getMonth()+1}月${d.getDate()}日 ${wk[d.getDay()]}`)(now());

const cells=$("cells");
for(let i=1;i<=5;i++){
  const b=document.createElement("button");b.type="button";b.className="cell";
  b.setAttribute("role","radio");b.setAttribute("aria-label",`${i}格，${ENERGY[i-1]}`);
  b.onclick=()=>{energy=i;paintEnergy();};cells.appendChild(b);
}
function paintEnergy(){[...cells.children].forEach((b,i)=>{b.classList.toggle("on",i<energy);b.setAttribute("aria-checked",i+1===energy);});$("energyText").textContent=ENERGY[energy-1];}
paintEnergy();
const chips=$("chips");
FEELINGS.forEach(f=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=f;b.setAttribute("aria-pressed","false");
  b.onclick=()=>{picked.has(f)?picked.delete(f):picked.add(f);paintChips();};chips.appendChild(b);});
function paintChips(){
  [...chips.children].forEach(b=>{const on=picked.has(b.textContent);b.setAttribute("aria-pressed",on);b.disabled=!on&&picked.size>=3;});
  $("brew").disabled=!picked.size;$("brew").textContent=picked.size?"帮我调一杯":"先选一个感觉";
}
paintChips();

function makeOrder(){
  return buildOrder({date:now(),energy,feelings:[...picked],say:$("say").value});
}
function modelFrom(key,o){return buildModel(key,o);}
const clone=cloneModel;

async function writeCopy(o,m){
  return requestCopy(o,m,editMoods(),{realName,strengthText,topsLine,milkText:MILK_TEXT,topText:TOP_TEXT});
}

function typeNote(lines,my){
  return new Promise(res=>{
    const n=$("note");n.classList.remove("wait");const text=lines.join("\n");
    if(RM){n.textContent=text;return res();}
    let i=0;n.textContent="";
    (function step(){if(my!==token)return res();n.textContent=text.slice(0,++i);if(i<text.length)setTimeout(step,text[i-1]==="\n"?260:65);else res();})();
  });
}
function receipt(o,m,copy){
  renderReceipt($("receipt"),o,m,copy,editMoods(),{realName,strengthText,topsLine});
}

function paintDrinkInfo(m){
  const info=DRINKS[m.key];
  const details=$("drinkInfoDetails");
  if(!info){details.hidden=true;return;}
  details.hidden=false;
  $("taste").textContent=info.taste;
  $("caffeine").textContent=info.caffeine;
  $("moment").textContent=info.moment;
}

async function serve(){
  const my=++token;
  ["headBlock","sleeveBlock","receiptBlock"].forEach(id=>$(id).classList.remove("in"));
  $("tweak").hidden=true;$("note").textContent="咖啡师在写杯套……";$("note").classList.add("wait");$("toast").textContent="";
  $("status").textContent="正在萃取……";
  const cp=writeCopy(order,model);
  await pour(model);if(my!==token)return;
  $("drinkName").textContent=`${model.temp}${realName(model)}`;
  $("drinkReal").textContent=specLine(model);$("why").textContent="";paintDrinkInfo(model);$("drinkInfoDetails").open=false;
  $("headBlock").classList.add("in");$("sleeveBlock").classList.add("in");
  $("status").textContent="咖啡好了，杯套还在写……";
  const copy=await cp;if(my!==token)return;
  $("drinkName").textContent=copy.name;$("why").textContent=copy.why;$("status").textContent="";
  $("drinkReal").textContent=`${realName(model)}，${specLine(model)}`;
  $("tweak").hidden=false;
  await typeNote(copy.note,my);if(my!==token)return;
  receipt(order,model,copy);$("receiptBlock").classList.add("in");
}
function show(view){
  ["order","result","edit"].forEach(v=>$(v).hidden=v!==view);
  document.body.classList.toggle("editing",view==="edit");
  window.scrollTo({top:0,behavior:RM?"auto":"smooth"});
}
$("brew").onclick=()=>{
  order=makeOrder();rankIdx=0;edits=[];swapped=false;
  model=modelFrom(order.rank[0],order);show("result");serve();
};
$("again").onclick=()=>{token++;resetCup();picked.clear();paintChips();$("say").value="";edits=[];swapped=false;show("order");};

function editMoods(){return deriveEditMoods(swapped,edits);}
function recordEdit(cat,val,mood){edits=updateEdits(edits,draft,baseDraft,cat,val,mood);}
function paintWhisper(){
  const moods=editMoods(),w=$("whisper"),h=$("whisperHint");
  if(!moods.length){w.textContent="想怎么改都行，我看着呢。";h.textContent="每改一下，杯子都会跟着变";}
  else{w.textContent=moods.slice(-2).join("，")+"。";h.textContent=moods.length>2?`还有 ${moods.length-2} 个小心思，我也记着`:"咖啡师记下了";}
  if(!RM){w.classList.remove("fade-in");void w.offsetWidth;w.classList.add("fade-in");}
}
function paintLive(){$("liveName").textContent=`${draft.temp}${realName(draft)}`;$("liveSpec").textContent=specLine(draft)+(draft.tops.size?`，加${topsLine(draft)}`:"");}
function valText(cat){
  if(cat==="temp")return draft.temp;if(cat==="sweet")return SWEETS[draft.sweet];
  if(cat==="strength")return {single:"单份",double:"双份",decaf:"低因"}[draft.strength];
  if(cat==="milk")return MILK_TEXT[draft.milk];return draft.tops.size?`${draft.tops.size} 种`:"不加";
}
function paintTabs(){
  const box=$("tabs");box.innerHTML="";
  TAB_ORDER.forEach(cat=>{
    const b=document.createElement("button");b.type="button";b.className="tab";b.setAttribute("role","tab");
    b.setAttribute("aria-selected",cat===activeTab);
    const changed=edits.some(e=>e.cat===cat);
    b.innerHTML=`<em>${OPTS[cat].label}</em><small>${valText(cat)}</small>${changed?'<i class="dot" aria-hidden="true"></i>':""}`;
    b.onclick=()=>{activeTab=cat;paintTabs();paintOpts();};box.appendChild(b);
  });
}
function isOn(cat,v){return cat==="tops"?draft.tops.has(v):draft[cat]===v;}
function paintOpts(){
  const box=$("opts"),spec=OPTS[activeTab];box.innerHTML="";
  box.setAttribute("role",spec.multi?"group":"radiogroup");
  spec.items.forEach(it=>{
    const b=document.createElement("button");b.type="button";b.className="opt";
    b.setAttribute("role",spec.multi?"checkbox":"radio");b.setAttribute("aria-checked",isOn(activeTab,it.v));
    let sub=it.mood;
    const off=activeTab==="temp"&&it.v==="热"&&(draft.base==="orange"||draft.base==="cold");
    if(off)sub="这杯只做冰的";
    b.disabled=off;
    b.innerHTML=`<i class="sw" style="background:${it.sw}"></i><div><b>${it.t}</b><span>${sub}</span></div><svg class="tick" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 6 10l5-6"/></svg>`;
    b.onclick=()=>choose(activeTab,it);box.appendChild(b);
  });
  if(spec.multi){const n=document.createElement("p");n.className="opt-note";n.textContent="可以多选，再点一次就拿掉";box.appendChild(n);}
}
function choose(cat,it){
  if(cat!=="tops"&&draft[cat]===it.v)return;
  applyOption(draft,cat,it);
  recordEdit(cat,it.v,it.mood);
  tweenTo(draft);drawFinish(draft,true);
  paintWhisper();paintLive();paintTabs();paintOpts();
}
function openEdit(){
  draft=clone(model);baseDraft=clone(model);edits=[];swapped=false;activeTab="temp";
  showFull();
  show("edit");paintWhisper();paintLive();paintTabs();paintOpts();
}
$("tweak").onclick=openEdit;
$("back").onclick=()=>{
  draft=null;edits=[];swapped=false;tweenTo(model);drawFinish(model);show("result");
};
$("swap").onclick=()=>{
  const n=Math.min(5,order.rank.length);
  let key;do{rankIdx=(rankIdx+1)%n;key=order.rank[rankIdx];}while(key===draft.key&&n>1);
  draft=modelFrom(key,order);baseDraft=clone(draft);edits=[];swapped=true;
  tweenTo(draft,620);drawFinish(draft,true);paintWhisper();paintLive();paintTabs();paintOpts();
};
$("done").onclick=()=>{
  if(!edits.length&&!swapped){$("back").onclick();return;}
  model=clone(draft);show("result");serve();
};

$("save").hidden=false;
$("save").onclick=async()=>{
  const b=$("save");b.disabled=true;$("toast").textContent="正在生成图片……";
  try{
    const d=order.time;
    const mode=await saveReceipt($("receipt"),`此刻咖啡馆-${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}.png`);
    $("toast").textContent=mode==="preview"?"长按图片，就能保存。":"小票已保存。";
  }catch{$("toast").textContent="没能保存，可以直接截图这张小票。";}
  finally{b.disabled=false;}
};
$("closeSave").onclick=()=>{
  const overlay=$("saveOverlay");
  if(overlay.dataset.objectUrl)URL.revokeObjectURL(overlay.dataset.objectUrl);
  overlay.hidden=true;$("savedReceipt").removeAttribute("src");delete overlay.dataset.objectUrl;
};
})();
