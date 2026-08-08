// Pokémon Dice Battle - game logic / AI / audio
// v2.4.2: dice WAVs play only during actual dice animation
// Assets: ../images and ../sounds (paths in browser are relative to index.html)

const P=[
 {id:25,n:"피카츄",t:"전기",hp:60,s1:["전광석화",10,1,"아무 주사위 1개"],s2:["10만볼트",30,2,"합계 10 이상"]},
 {id:4,n:"파이리",t:"불꽃",hp:55,s1:["할퀴기",10,1,"아무 주사위 1개"],s2:["불꽃세례",25,2,"4 이상 2개"]},
 {id:7,n:"꼬부기",t:"물",hp:70,s1:["물대포",15,1,"아무 주사위 1개"],s2:["아쿠아테일",28,2,"짝수 2개"]},
 {id:1,n:"이상해씨",t:"풀",hp:70,s1:["덩굴채찍",15,1,"아무 주사위 1개"],s2:["씨폭탄",28,2,"합계 8 이상"]},
 {id:92,n:"고오스",t:"고스트",hp:50,s1:["핥기",12,1,"홀수 1개"],s2:["나이트헤드",28,2,"같은 눈 2개"]},
 {id:143,n:"잠만보",t:"노말",hp:100,s1:["몸통박치기",14,1,"아무 주사위 1개"],s2:["기가임팩트",35,3,"주사위 3개"]}
];
const LOCAL_IMAGES={
  25:"images/pikachu.png",
  4:"images/charmander.png",
  7:"images/squirtle.png",
  1:"images/bulbasaur.png",
  92:"images/gastly.png",
  143:"images/snorlax.png"
};
const img=id=>LOCAL_IMAGES[id];
let selecting=0, picks=[[],[]], selected=[], teams=[],active=[0,0],turn=0,over=false,gameMode=null,aiBusy=false,aiDifficulty=1,playerTeam=0,aiTeam=1;
let turnDice=[[null,null,null],[null,null,null]];
let turnKept=[[false,false,false],[false,false,false]];
let turnRolled=[false,false];
function diceNow(){return turnDice[turn]}
function keptNow(){return turnKept[turn]}
function rolledNow(){return turnRolled[turn]}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];


const diceRollAudio=new Audio("sounds/dice-roll-real-v3.mp3?v=250");
const diceLockAudio=new Audio("sounds/dice-lock-impact.wav");
diceRollAudio.preload="auto"; diceLockAudio.preload="auto";


const attackHitAudio=new Audio("sounds/attack-hit.mp3?v=276");
const criticalHitAudio=new Audio("sounds/critical-hit.mp3?v=276");
const faintAudio=new Audio("sounds/faint.mp3?v=276");
const gameOverAudio=new Audio("sounds/game-over.mp3?v=276");
const switchAudio=new Audio("sounds/switch.mp3?v=276");
[attackHitAudio,criticalHitAudio,faintAudio,gameOverAudio,switchAudio].forEach(a=>a.preload="auto");

function playCombatAudio(audio,volume=.72,duck=.04,hold=420){
  if(!soundEnabled)return;
  duckBgm(duck,hold);
  try{
    audio.pause();
    audio.currentTime=0;
    audio.volume=volume;
    const p=audio.play();
    if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}

const battleBgm=new Audio("sounds/battle-bgm.mp3?v=274");
battleBgm.preload="auto";
battleBgm.loop=true;
battleBgm.volume=.12;
let bgmWanted=false;

function startBattleBgm(){
  bgmWanted=true;
  if(!soundEnabled)return;
  try{
    battleBgm.volume=.12;
    const p=battleBgm.play();
    if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}
function stopBattleBgm(fade=true){
  bgmWanted=false;
  if(!fade){
    battleBgm.pause();
    battleBgm.currentTime=0;
    return;
  }
  const from=battleBgm.volume||.12;
  const steps=8;
  let n=0;
  const timer=setInterval(()=>{
    n++;
    battleBgm.volume=Math.max(0,from*(1-n/steps));
    if(n>=steps){
      clearInterval(timer);
      battleBgm.pause();
      battleBgm.currentTime=0;
      battleBgm.volume=.12;
    }
  },45);
}

let bgmDuckTimer=null;
function duckBgm(level=.055, holdMs=260){
  if(!bgmWanted || battleBgm.paused)return;
  clearTimeout(bgmDuckTimer);
  battleBgm.volume=level;
  bgmDuckTimer=setTimeout(()=>{
    if(bgmWanted && soundEnabled && !battleBgm.paused){
      battleBgm.volume=.12;
    }
  },holdMs);
}


function playFileSfx(audio,vol=0.8){
  duckBgm(.05,320);
  if(!soundEnabled)return;
  try{
    audio.pause();
    audio.currentTime=0;
    audio.volume=vol;
    const p=audio.play();
    if(p&&p.catch)p.catch(()=>{});
  }catch(e){}
}


let audioCtx=null;

let diceRollBuffer=null;
let diceLockBuffer=null;

async function preloadDiceRollBuffer(){
  try{
    const ctx=ensureAudio();
    if(!ctx)return;
    const [rollRes,lockRes]=await Promise.all([
      fetch("sounds/dice-roll-real-v3.mp3?v=250",{cache:"force-cache"}),
      fetch("sounds/dice-lock-impact.wav?v=250",{cache:"force-cache"})
    ]);
    const [rollArr,lockArr]=await Promise.all([rollRes.arrayBuffer(),lockRes.arrayBuffer()]);
    const decoded=await Promise.all([
      ctx.decodeAudioData(rollArr.slice(0)),
      ctx.decodeAudioData(lockArr.slice(0))
    ]);
    diceRollBuffer=decoded[0];
    diceLockBuffer=decoded[1];
  }catch(e){
    diceRollBuffer=null;
    diceLockBuffer=null;
  }
}

let audioWarmPromise=null;
async function warmUpGameAudio(){
  if(audioWarmPromise)return audioWarmPromise;
  audioWarmPromise=(async()=>{
    try{
      const ctx=ensureAudio();
      if(ctx && ctx.state==="suspended"){
        await ctx.resume();
      }
      // Fetch + decode only. Never call Audio.play() here,
      // because iOS may leak a tiny audible start even at volume 0.
      await preloadDiceRollBuffer();
      [attackHitAudio,criticalHitAudio,faintAudio,gameOverAudio,switchAudio].forEach(a=>a.load());
    }catch(e){}
  })();
  return audioWarmPromise;
}


function playDiceRollInstant(){
  duckBgm(.045,700);
  if(!soundEnabled)return;
  const ctx=ensureAudio();
  if(!ctx)return;

  if(diceRollBuffer){
    const src=ctx.createBufferSource();
    const gain=ctx.createGain();
    src.buffer=diceRollBuffer;
    gain.gain.value=.82;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
  }else{
    // First roll fallback while the decoded buffer is still preparing.
    playFileSfx(diceRollAudio,.82);
  }
}

// Loading/decoding does not produce sound.
function playDiceLockInstant(){
  duckBgm(.04,420);
  if(!soundEnabled)return;
  const ctx=ensureAudio();
  if(!ctx)return;
  if(diceLockBuffer){
    const src=ctx.createBufferSource();
    const gain=ctx.createGain();
    src.buffer=diceLockBuffer;
    gain.gain.value=1.0;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
  }else{
    playFileSfx(diceLockAudio,1.0);
  }
}

window.addEventListener("load",()=>preloadDiceRollBuffer(),{once:true});

let soundEnabled=true;

function ensureAudio(){
  if(!soundEnabled)return null;
  if(!audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    audioCtx=new AC();
  }
  if(audioCtx.state==="suspended")audioCtx.resume();
  return audioCtx;
}
function tone(freq=440,dur=.08,type="sine",gain=.08,delay=0){
  if(bgmWanted) duckBgm(.06,180);
  const ctx=ensureAudio(); if(!ctx)return;
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,ctx.currentTime+delay);
  g.gain.setValueAtTime(0.0001,ctx.currentTime+delay);
  g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+delay+.005);
  g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+delay+dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+dur+.02);
}
function noise(dur=.08,gain=.08,delay=0){
  const ctx=ensureAudio(); if(!ctx)return;
  const len=Math.floor(ctx.sampleRate*dur);
  const buf=ctx.createBuffer(1,len,ctx.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);
  const src=ctx.createBufferSource(), g=ctx.createGain();
  src.buffer=buf; g.gain.setValueAtTime(gain,ctx.currentTime+delay);
  g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+delay+dur);
  src.connect(g); g.connect(ctx.destination); src.start(ctx.currentTime+delay);
}
function sfx(name,type){
  duckBgm(.045,360);
  if(!soundEnabled)return;
  ensureAudio();
  if(name==="diceTick"){ tone(900+Math.random()*240,.025,"square",.025); return; }
  if(name==="diceLock"){ tone(660,.07,"square",.09); tone(990,.09,"square",.06,.02); return; }
  if(name==="switch"){ tone(420,.08,"sine",.06); tone(720,.12,"sine",.05,.05); return; }
  if(name==="faint"){ tone(300,.13,"sawtooth",.06); tone(180,.22,"sawtooth",.05,.11); return; }
  if(name==="victory"){
    [523,659,784,1047].forEach((f,i)=>tone(f,.18,"triangle",.07,i*.11));
    tone(1319,.34,"triangle",.08,.44); return;
  }
  if(name==="hit"){
    noise(.09,.13); tone(110,.12,"square",.09); return;
  }
  if(name==="attack"){
    if(type==="전기"){ tone(1200,.05,"square",.07); tone(1700,.07,"square",.05,.035); }
    else if(type==="불꽃"){ noise(.14,.08); tone(260,.13,"sawtooth",.05); }
    else if(type==="물"){ tone(520,.09,"sine",.05); tone(360,.12,"sine",.04,.05); }
    else if(type==="풀"){ tone(680,.08,"triangle",.045); tone(820,.08,"triangle",.04,.05); }
    else if(type==="고스트"){ tone(240,.18,"sine",.04); tone(190,.18,"sine",.035,.04); }
    else { tone(180,.09,"square",.06); }
    return;
  }
}
$("#soundToggle").onclick=()=>{
  soundEnabled=!soundEnabled;
  $("#soundToggle").textContent=soundEnabled?"🔊":"🔇";
  if(soundEnabled){
    ensureAudio();
    tone(660,.06,"sine",.05);
    if(bgmWanted){
      battleBgm.volume=.12;
      const p=battleBgm.play();
      if(p&&p.catch)p.catch(()=>{});
    }
  }else{
    battleBgm.pause();
  }
};


function chooseMode(mode){
  warmUpGameAudio();
 gameMode=mode;
 $("#modeScreen").classList.add("hidden");
 if(mode==="solo"){
   $("#difficultyScreen").classList.remove("hidden");
   $("#subtitle").textContent="난이도를 선택해";
 }else{
   $("#selectScreen").classList.remove("hidden");
   $("#subtitle").textContent="🔵 블루팀 vs 🔴 레드팀 · 2인용";
   selecting=0; selected=[]; picks=[[],[]]; pickRender();
 }
}
function backToMode(){
 $("#difficultyScreen").classList.add("hidden");
 $("#modeScreen").classList.remove("hidden");
 $("#subtitle").textContent="게임 모드를 선택해";
}
function difficultyName(){
 return ["쉬움","보통","어려움","챔피언급"][aiDifficulty];
}
function chooseDifficulty(level){
  warmUpGameAudio();
 aiDifficulty=level;
 $("#difficultyScreen").classList.add("hidden");
 $("#soloTeamScreen").classList.remove("hidden");
 $("#subtitle").textContent="내 팀 색을 선택해";
 ensureAudio();
 preloadDiceRollBuffer();
}

function backToDifficulty(){
 $("#soloTeamScreen").classList.add("hidden");
 $("#difficultyScreen").classList.remove("hidden");
 $("#subtitle").textContent="난이도를 선택해";
}

function chooseSoloTeam(team){
  warmUpGameAudio();
 playerTeam=team;
 aiTeam=1-team;
 selecting=playerTeam;
 selected=[];
 picks=[[],[]];
 turn=0;

 $("#soloTeamScreen").classList.add("hidden");
 $("#selectScreen").classList.remove("hidden");
 $("#subtitle").innerHTML=playerTeam===0
   ? `🔵 블루팀 vs 🤖 컴퓨터 <span class="difficulty-badge">${difficultyName()}</span>`
   : `🤖 컴퓨터 vs 🔴 레드팀 <span class="difficulty-badge">${difficultyName()}</span>`;
 pickRender();
}
function typeAdv(att,def){
 return (att==="불꽃"&&def==="풀")||(att==="풀"&&def==="물")||(att==="물"&&def==="불꽃");
}
function chooseAiTeam(){
 if(aiDifficulty<=1)return randomAiTeam();
 const playerMons=picks[playerTeam].map(i=>P[i]);
 const scored=P.map((p,i)=>{
   let score=p.hp/18+p.s2[1]/7;
   playerMons.forEach(enemy=>{
     if(typeAdv(p.t,enemy.t))score+=aiDifficulty===3?8:4;
     if(typeAdv(enemy.t,p.t))score-=aiDifficulty===3?3:1.5;
   });
   if(playerMons.some(x=>x.id===p.id))score-=.5;
   return [i,score+Math.random()*(aiDifficulty===3?.05:.7)];
 }).sort((a,b)=>b[1]-a[1]);
 return scored.slice(0,3).map(x=>x[0]);
}

function aiHpMultiplier(){ return 1; }
function aiDamageMultiplier(){
  return [0.95,1.00,1.06,1.14][aiDifficulty];
}
function effectiveDamage(p, skill, defender){
  let mult=typeAdv(p.t,defender.t)?1.5:1;
  return Math.round(skill[1]*mult*(gameMode==="solo"&&turn===aiTeam?aiDamageMultiplier():1));
}
function aiSkillScore(skillKey){
  const me=cur(aiTeam), enemy=cur(playerTeam), sk=me[skillKey];
  if(!valid(sk))return -9999;
  const dmg=effectiveDamage(me,sk,enemy);
  let score=dmg;
  if(dmg>=enemy.cur)score+=100; // guaranteed KO
  if(typeAdv(me.t,enemy.t))score+=10;
  // Prefer stronger move, but avoid wasting huge attacks on nearly fainted targets.
  const overkill=Math.max(0,dmg-enemy.cur);
  score-=overkill*.12;
  return score;
}
function aiKeepScore(v, index){
  const me=cur(aiTeam);
  let score=0;
  if(v>=5)score+=6;
  if(v===4)score+=4;
  const vals=turnDice[aiTeam];
  if(vals.some((x,j)=>j!==index&&x===v))score+=7;
  if(me.s2[0]==="10만볼트" && v>=4)score+=6;
  if(me.s2[0]==="불꽃세례" && v>=4)score+=6;
  if(me.s2[0]==="아쿠아테일" && v%2===0)score+=5;
  if(me.s2[0]==="씨폭탄" && v>=3)score+=4;
  if(me.s2[0]==="나이트헤드" && vals.some((x,j)=>j!==index&&x===v))score+=9;
  if(me.s2[0]==="기가임팩트")score+=2;
  return score;
}
function aiSwitchScore(p, enemy){
  let s=(p.cur/p.hp)*22 + p.s2[1]*.7;
  if(typeAdv(p.t,enemy.t))s+=38;
  if(typeAdv(enemy.t,p.t))s-=28;
  return s;
}

function randomAiTeam(){
 const ids=P.map((_,i)=>i);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
 return ids.slice(0,3);
}
function isAiTurn(){return gameMode==="solo"&&turn===aiTeam&&!over}

function pickRender(){
 const teamLabel=selecting===0?"블루팀":"레드팀";
 $("#pickTitle").textContent=teamLabel+" · 3마리 선택";
 $("#pickTitle").className="turn "+(selecting===0?"pick-title-blue":"pick-title-red");
 $("#confirmPick").className="wide "+(selecting===0?"blue":"red");

 $("#pickGrid").innerHTML=P.map((p,i)=>{
   const on=selected.includes(i);
   const cls=on?(selecting===0?"selected-team-blue":"selected-team-red"):"";
   return `<button class="pick ${cls}" data-p="${i}">
     <img src="${img(p.id)}"><b>${p.n}</b><span>${p.t} · HP ${p.hp}</span>
   </button>`;
 }).join("");

 $$(".pick").forEach(b=>b.onclick=()=>{
   const i=+b.dataset.p;
   if(selected.includes(i))selected=selected.filter(x=>x!==i);
   else if(selected.length<3)selected.push(i);
   pickRender();
 });
 $("#confirmPick").disabled=selected.length!==3;
}
$("#confirmPick").onclick=()=>{
 picks[selecting]=[...selected];selected=[];
 if(gameMode==="solo"){picks[aiTeam]=chooseAiTeam();start();return;}
 if(selecting===0){selecting=1;pickRender()}else start()
};
function start(){
 teams=picks.map(a=>a.map(i=>{
   const base={...P[i]};
   base.cur=base.hp;
   return base;
 }));
 active=[0,0];
 turn=0;
 turnRolled=[false,false];
 turnDice=[[null,null,null],[null,null,null]];
 turnKept=[[false,false,false],[false,false,false]];

 $("#selectScreen").classList.add("hidden");
 $("#gameScreen").classList.remove("hidden");
 startBattleBgm();

 const firstLabel=gameMode==="solo" && aiTeam===0 ? "컴퓨터" : "블루팀";
 log(`배틀 시작! ${firstLabel}부터 시작!`);
 render();
 showTurnBanner();
 if(isAiTurn())setTimeout(aiTakeTurn,900);
}
function log(t){const el=$("#log"); if(el) el.textContent=t;}


function teamName(teamIndex){
 if(gameMode==="solo" && teamIndex===aiTeam)return "컴퓨터";
 return teamIndex===0?"블루팀":"레드팀";
}
function teamIcon(teamIndex){
 if(gameMode==="solo" && teamIndex===aiTeam)return "🤖";
 return teamIndex===0?"🔵":"🔴";
}

function showTurnBanner(){
 const el=$("#turnBanner");
 el.textContent=`${teamIcon(turn)} ${gameMode==="solo"&&turn===aiTeam?"COMPUTER TURN":(turn===0?"BLUE TEAM TURN":"RED TEAM TURN")}`;
 el.className="turn-banner "+(turn===0?"blue":"red")+" show";
 setTimeout(()=>el.classList.remove("show"),800);
}
function updateTurnUX(){
 const strip=$("#turnStrip");
 if(strip){
   strip.textContent=gameMode==="solo"&&turn===aiTeam
     ? `🤖 컴퓨터의 차례 · ${difficultyName()}`
     : `${teamIcon(turn)} ${teamName(turn)}의 차례`;
   strip.className="turn-strip "+(turn===0?"blue":"red");
 }
 const f0=$("#fighter0"),f1=$("#fighter1");
 if(f0&&f1){
   f0.className="fighter "+(turn===0?"active-blue":"inactive");
   f1.className="fighter "+(turn===1?"active-red":"inactive");
 }
}
function typeFx(type){
 return {"전기":"⚡","불꽃":"🔥","물":"💧","풀":"🍃","고스트":"👻","노말":"💥"}[type]||"✨";
}
function playHitEffect(target, dmg, type, superHit=false){
 const f=$("#fighter"+target);
 if(!f)return;
 const pokeImg=f.querySelector("img");
 f.classList.remove("card-impact"); void f.offsetWidth; f.classList.add("card-impact");
 if(pokeImg){pokeImg.classList.remove("poke-hit-big");void pokeImg.offsetWidth;pokeImg.classList.add("poke-hit-big");}
 const flash=f.querySelector(".hit-flash"); flash.classList.remove("on"); void flash.offsetWidth; flash.classList.add("on");
 const pop=document.createElement("div"); pop.className="damage-pop"; pop.textContent="-"+dmg; f.appendChild(pop); setTimeout(()=>pop.remove(),900);
 const layer=f.querySelector(".effect-layer");
 for(let i=0;i<5;i++){
   const fx=document.createElement("div"); fx.className="fx"; fx.textContent=typeFx(type);
   fx.style.left=(12+Math.random()*65)+"%"; fx.style.top=(28+Math.random()*42)+"%";
   fx.style.animationDelay=(i*45)+"ms"; layer.appendChild(fx); setTimeout(()=>fx.remove(),900);
 }
 if(superHit){
   const s=$("#superText"); s.classList.remove("show"); void s.offsetWidth; s.classList.add("show");
 }
}
function openDex(){
 $("#dexGrid").innerHTML=P.map(p=>`
  <div class="dex-card">
   <img src="${img(p.id)}" alt="${p.n}">
   <h3>${p.n}</h3><div class="stat">${p.t} 타입 · HP ${p.hp}</div>
   <div class="move"><b>${p.s1[0]}</b> · 피해 ${p.s1[1]}<br>${p.s1[3]}</div>
   <div class="move"><b>${p.s2[0]}</b> · 피해 ${p.s2[1]}<br>${p.s2[3]}</div>
  </div>`).join("");
 $("#dexModal").classList.remove("hidden");
}
function closeDex(){ $("#dexModal").classList.add("hidden"); }

function cur(x){return teams[x][active[x]]}

function updatePokemonSelectionTeamColors(){
  // Selection cards may expose their Pokémon index through data-i or data-index.
  // Determine selection from the actual picks arrays.
  const cards=$$(".pick-card, .pokemon-pick, .select-card, [data-pokemon-index]");
  cards.forEach(card=>{
    const raw=card.dataset.i ?? card.dataset.index ?? card.dataset.pokemonIndex;
    const i=Number(raw);
    if(!Number.isFinite(i))return;

    const blueSelected=Array.isArray(picks?.[0]) && picks[0].includes(i);
    const redSelected=Array.isArray(picks?.[1]) && picks[1].includes(i);

    card.classList.toggle("selected-blue",blueSelected);
    card.classList.toggle("selected-red",redSelected);
    card.classList.toggle("selected-both",blueSelected && redSelected);
  });
}

function render(){
 let a=cur(0),b=cur(1); $("#p1name").textContent=teamName(0)+" · "+a.n;$("#p2name").textContent=teamName(1)+" · "+b.n;$("#p1type").textContent=a.t+" 타입";$("#p2type").textContent=b.t+" 타입";$("#p1img").src=img(a.id);$("#p2img").src=img(b.id);
 [["p1",a],["p2",b]].forEach(([x,p])=>{$("#"+x+"hp").style.width=(p.cur/p.hp*100)+"%";$("#"+x+"hptext").textContent=`HP ${p.cur} / ${p.hp}`});
 $("#turnText").textContent=`${teamIcon(turn)} ${teamName(turn)} 차례`; updateTurnUX();
 let me=cur(turn);$("#skill1").innerHTML=`${me.s1[0]} · ${me.s1[1]}<small>${me.s1[3]}</small>`;$("#skill2").innerHTML=`${me.s2[0]} · ${me.s2[1]}<small>${me.s2[3]}</small>`;
 $$(".die").forEach((d,i)=>{d.textContent=(!rolledNow() && !keptNow()[i]) ? "?" : (diceNow()[i]??"?");d.classList.toggle("keep",keptNow()[i])});
 $("#teams").innerHTML=teams.map((tm,x)=>{
   const displayTeamName=`${teamIcon(x)} ${teamName(x)}`;
   return `<div class="team-panel ${x===0?"blue-team":"red-team"}">
     <div class="team-title">${displayTeamName}</div>
     ${tm.map((p,i)=>{
       const pct=Math.max(0,p.cur/p.hp*100);
       const activeNow=i===active[x]&&p.cur>0;
       const fainted=p.cur<=0;
       return `<div class="team-mon ${activeNow?"active-mon":""} ${fainted?"fainted-mon":""}">
         <img src="${img(p.id)}" alt="${p.n}">
         <div>
           <div class="team-mon-name"><span>${p.n}</span>${activeNow?'<span class="active-tag">출전 중</span>':(fainted?'<span class="fainted-tag">기절</span>':'')}</div>
           <div class="team-mon-type">${p.t} 타입</div>
           <div class="team-hpbar"><div class="team-hpfill" style="width:${pct}%"></div></div>
           <div class="team-hptext">HP ${p.cur} / ${p.hp}</div>
         </div>
       </div>`;
     }).join("")}
   </div>`;
 }).join("");
 const ai=isAiTurn();
 $("#roll").disabled=rolledNow()||over||ai;
 const s1ok=rolledNow()&&valid(me.s1), s2ok=rolledNow()&&valid(me.s2);
 $("#skill1").disabled=!s1ok||over||ai; $("#skill2").disabled=!s2ok||over||ai;
 $("#skill1").classList.toggle("unavailable",!s1ok); $("#skill2").classList.toggle("unavailable",!s2ok);
 $("#skill1").classList.toggle("available",s1ok); $("#skill2").classList.toggle("available",s2ok);
 $("#switch").disabled=over||ai;$("#pass").disabled=over||ai;

  // V2.5.7: visual state must follow the CURRENT turn's roll state.
  // A new turn showing ? ? ? must never inherit yellow confirmation.
  requestAnimationFrame(()=>{
    $$(".die").forEach((d,i)=>{
      if(!rolledNow()){
        d.classList.remove("confirmed","locked","rolling","keep");
      }else{
        d.classList.toggle("confirmed", diceNow()[i] != null);
      }
    });
  });

  updateKeepHint();

  updateDiceTeamColor();
}


function renderDiceControlsOnly(){
  const me=cur(turn);
  const ai=isAiTurn();

  $$(".die").forEach((d,i)=>{
    d.textContent=(!rolledNow() && !keptNow()[i]) ? "?" : (diceNow()[i]??"?");
    d.classList.toggle("keep",keptNow()[i]);

    // Yellow only while this turn has a confirmed roll.
    // When a new turn resets the dice to ?, clear the yellow state.
    d.classList.toggle("confirmed",rolledNow() && diceNow()[i] != null);
  });

  const s1ok=rolledNow()&&valid(me.s1);
  const s2ok=rolledNow()&&valid(me.s2);

  $("#roll").disabled=rolledNow()||over||ai;
  $("#skill1").disabled=!s1ok||over||ai;
  $("#skill2").disabled=!s2ok||over||ai;

  $("#skill1").classList.toggle("unavailable",!s1ok);
  $("#skill2").classList.toggle("unavailable",!s2ok);
  $("#skill1").classList.toggle("available",s1ok);
  $("#skill2").classList.toggle("available",s2ok);

  $("#switch").disabled=over||ai;
  $("#pass").disabled=over||ai;
  updateKeepHint();

  updateDiceTeamColor();
}

function lockInDice(diceEls,onDone){
  const activeIndexes=[0,1,2].filter(i=>!keptNow()[i]);
  if(!activeIndexes.length){if(onDone)onDone();return;}
  activeIndexes.forEach(idx=>{
    const d=diceEls[idx];
    d.classList.remove("rolling");
    d.classList.add("locked");
  });
  if(navigator.vibrate)navigator.vibrate(45); playFileSfx(diceLockAudio,.95);
  setTimeout(()=>{
    activeIndexes.forEach(idx=>diceEls[idx].classList.remove("locked"));
    if(onDone)onDone();
  },360);
}




function updateDiceTeamColor(){
  const isBlue = turn===0;
  $$(".die").forEach(d=>{
    d.classList.toggle("keep-blue", isBlue);
    d.classList.toggle("keep-red", !isBlue);
  });
}

function updateKeepHint(){
  const hint=$("#keepHint");
  if(!hint)return;

  if(!rolledNow() || over || isAiTurn()){
    hint.textContent="🎯 보관할 주사위를 눌러 선택해";
    hint.classList.toggle("hidden", !rolledNow() || over || isAiTurn());
    return;
  }

  const selected=turnKept[turn]
    .map((on,i)=>on ? turnDice[turn][i] : null)
    .filter(v=>v!=null);

  hint.classList.remove("hidden");
  hint.textContent=selected.length
    ? `📌 보관: ${selected.join(" · ")} · 다시 누르면 해제`
    : "🎯 보관할 주사위를 눌러 선택해";
}

function animateDiceRoll(forTurn,onDone){
  playDiceRollInstant();

  const diceEls=$$(".die");
  const diceWrap=$(".dice");
  if(forTurn===aiTeam&&gameMode==="solo")diceWrap.classList.add("cpu-rolling");
  diceWrap.classList.add("burst");

  const activeIndexes=[0,1,2].filter(i=>!turnKept[forTurn][i]);

  // Start one continuous roll -> confirm animation.
  activeIndexes.forEach(i=>{
    const d=diceEls[i];
    d.classList.remove("locked","rolling","confirmed");
    void d.offsetWidth;
    d.classList.add("rolling");
  });

  let ticks=0;
  const tickMs=92;
  const timer=setInterval(()=>{
    activeIndexes.forEach(i=>{
      diceEls[i].textContent=Math.floor(Math.random()*6)+1;
    });

    ticks++;
    if(ticks>=7){
      clearInterval(timer);

      turnDice[forTurn]=turnDice[forTurn].map(
        (v,i)=>turnKept[forTurn][i]?v:Math.floor(Math.random()*6)+1
      );
      turnRolled[forTurn]=true;

      // Final numbers change while the same CSS animation is still running.
      activeIndexes.forEach(i=>{
        diceEls[i].textContent=turnDice[forTurn][i];
      });

      playDiceLockInstant();
      if(navigator.vibrate)navigator.vibrate(30);

      // Do not swap animation classes at confirmation.
      // Wait for the single animation to complete.
      setTimeout(()=>{
        activeIndexes.forEach(i=>{
          diceEls[i].classList.remove("rolling");
          diceEls[i].classList.add("confirmed");
        });
        diceWrap.classList.remove("burst","cpu-rolling");

        requestAnimationFrame(()=>{
          // Dice roll changes only dice/control state.
          // Avoid rebuilding Pokémon cards/team panels here.
          renderDiceControlsOnly();
          if(onDone)onDone();
        });
      },500);
    }
  },tickMs);
}

$("#roll").onclick=()=>{
  if(rolledNow()||over)return;
  animateDiceRoll(turn,()=>{
    log("🎲 "+diceNow().join(" · ")+" 확정! 🎯 기술을 골라.");
  });
};
$$(".die").forEach(d=>d.onclick=()=>{
  if(!rolledNow() || over || isAiTurn())return;

  const i=+d.dataset.i;
  turnKept[turn][i]=!turnKept[turn][i];

  // Update only dice/control UI so selection is immediate and smooth.
  renderDiceControlsOnly();

  const hint=$("#keepHint");
  if(hint){
    const selected=turnKept[turn]
      .map((on,idx)=>on ? turnDice[turn][idx] : null)
      .filter(v=>v!=null);

    hint.textContent=selected.length
      ? `📌 보관: ${selected.join(" · ")} · 다시 누르면 해제`
      : "🎯 보관할 주사위를 눌러 선택해";
  }
});
function valid(skill){
 let vals=diceNow().filter(v=>v!=null),n=skill[0];
 if(n==="전광석화"||n==="할퀴기"||n==="물대포"||n==="덩굴채찍"||n==="몸통박치기")return vals.length>=1;
 
 if(n==="10만볼트")return vals.length>=2&&[...vals].sort((a,b)=>b-a)[0]+[...vals].sort((a,b)=>b-a)[1]>=10;
 if(n==="불꽃세례")return vals.filter(v=>v>=4).length>=2;
 if(n==="아쿠아테일")return vals.filter(v=>v%2===0).length>=2;
 if(n==="씨폭탄")return vals.length>=2&&[...vals].sort((a,b)=>b-a)[0]+[...vals].sort((a,b)=>b-a)[1]>=8;
 if(n==="핥기")return vals.some(v=>v%2===1);
 if(n==="나이트헤드")return new Set(vals).size<vals.length;
 if(n==="기가임팩트")return vals.length===3;
 return true
}
function use(which){if(!rolledNow())return;let me=cur(turn),sk=me[which];if(!valid(sk)){log("❌ "+sk[0]+" 조건이 안 돼! ("+sk[3]+")");return}let enemy=cur(1-turn),dmg=sk[1],mult=1;
 if((me.t==="불꽃"&&enemy.t==="풀")||(me.t==="풀"&&enemy.t==="물")||(me.t==="물"&&enemy.t==="불꽃"))mult=1.5;
 dmg=Math.round(dmg*mult);
 if(gameMode==="solo"&&turn===aiTeam)dmg=Math.round(dmg*aiDamageMultiplier());
 enemy.cur=Math.max(0,enemy.cur-dmg);sfx("attack",me.t);setTimeout(()=>sfx("hit"),90);log(`💥 ${me.n}의 ${sk[0]}! ${dmg} 피해!${mult>1?" 효과가 굉장했다!":""}`);// Start the hit sound a fraction earlier than the visual impact.
  // Mobile audio output has a small latency, so this makes the perceived hit line up.
  if(mult>1){
    playCombatAudio(criticalHitAudio,.78,.025,650);
  }else{
    playCombatAudio(attackHitAudio,.72,.04,430);
  }
  setTimeout(()=>playHitEffect(1-turn,dmg,me.t,mult>1),55);turnDice[turn]=[null,null,null];turnKept[turn]=[false,false,false];turnRolled[turn]=false;render();if(enemy.cur<=0)setTimeout(faint,350);else setTimeout(next,450)}
$("#skill1").onclick=()=>use("s1");$("#skill2").onclick=()=>use("s2");

function showVictory(winner){
  const blueAlive=teams[0]&&teams[0].some(p=>p.cur>0);
  const redAlive=teams[1]&&teams[1].some(p=>p.cur>0);
  const actualWinner=blueAlive&&!redAlive?0:(!blueAlive&&redAlive?1:(winner==="블루팀"?0:winner==="레드팀"?1:winner));

  const title=$("#victoryOverlay .victory-title");
  const team=$("#victoryTeam");

  if(gameMode==="solo"){
    const playerWon=actualWinner===playerTeam;
    title.textContent=playerWon?"VICTORY!":"DEFEAT";
    team.textContent=playerWon?`${teamName(playerTeam)} 승리!`:"컴퓨터 승리!";
  }else{
    title.textContent=actualWinner===0?"BLUE TEAM WINS!":"RED TEAM WINS!";
    team.textContent=actualWinner===0?"블루팀 승리!":"레드팀 승리!";
  }

  stopBattleBgm(true);
  if(gameMode==="solo" && actualWinner!==playerTeam){
    setTimeout(()=>playCombatAudio(gameOverAudio,.76,.0,1800),520);
  }else{
    setTimeout(()=>sfx("victory"),260);
  }
  $("#victoryOverlay").classList.remove("hidden");
  if(navigator.vibrate) navigator.vibrate([120,70,180]);
}

function faint(){
 let x=1-turn,idx=teams[x].findIndex(p=>p.cur>0);
 if(idx<0){
   over=true;
   const winner=turn;
   log(`🏆 ${teamName(winner)} 승리!!`);
   render();
   setTimeout(()=>showVictory(winner),500);
   return;
 }
 active[x]=idx;
 playCombatAudio(faintAudio,.72,.025,1100);
 log(`😵 쓰러졌다! ${cur(x).n} 출전!`);
 setTimeout(()=>playCombatAudio(switchAudio,.68,.045,520),120);
 render();
 setTimeout(next,500);
}
function next(){
  turn=1-turn;
  turnRolled[turn]=false;
  log(`${teamIcon(turn)} ${teamName(turn)} 차례! 이 팀이 보관한 주사위는 그대로야.`);
  render();showTurnBanner();
  if(isAiTurn()) setTimeout(aiTakeTurn,900);
}
$("#pass").onclick=()=>{if(rolledNow())log("주사위를 보관하고 턴을 넘겼어.");turnRolled[turn]=false;next()};

function aiRoll(onDone){
  animateDiceRoll(aiTeam,()=>{
    log("🤖 컴퓨터 주사위: "+turnDice[aiTeam].join(" · ")+" 확정!");
    if(onDone)onDone();
  });
}
function aiChooseKeep(){
 const vals=turnDice[aiTeam];
 if(aiDifficulty===0){turnKept[aiTeam]=vals.map(()=>false);return;}
 if(aiDifficulty===1){turnKept[aiTeam]=vals.map(v=>v>=4);return;}
 if(aiDifficulty===2){turnKept[aiTeam]=vals.map((v,i)=>aiKeepScore(v,i)>=5);return;}
 // Master: deliberately build next-turn skill patterns.
 turnKept[aiTeam]=vals.map((v,i)=>aiKeepScore(v,i)>=4);
 // Don't lock all three on a bad pattern; reroll the weakest one.
 if(turnKept[aiTeam].every(Boolean) && !valid(cur(aiTeam).s2)){
   let worst=0,worstScore=999;
   vals.forEach((v,i)=>{const s=aiKeepScore(v,i);if(s<worstScore){worstScore=s;worst=i}});
   turnKept[aiTeam][worst]=false;
 }
}
function aiBestMove(){
 const opts=["s1","s2"].filter(k=>valid(cur(aiTeam)[k]));
 if(!opts.length)return null;
 if(aiDifficulty===0)return opts[Math.floor(Math.random()*opts.length)];
 if(aiDifficulty===1)return opts.sort((a,b)=>cur(aiTeam)[b][1]-cur(aiTeam)[a][1])[0];
 return opts.sort((a,b)=>aiSkillScore(b)-aiSkillScore(a))[0];
}
function aiShouldSwitch(){
 const me=cur(aiTeam), enemy=cur(playerTeam);
 const alive=teams[aiTeam].map((p,i)=>p.cur>0&&i!==active[aiTeam]?i:-1).filter(i=>i>=0);
 if(!alive.length||aiDifficulty===0)return false;
 if(aiDifficulty===1)return me.cur<=me.hp*.25&&Math.random()<.2;

 const currentScore=aiSwitchScore(me,enemy);
 const bestAlt=Math.max(...alive.map(i=>aiSwitchScore(teams[aiTeam][i],enemy)));

 if(aiDifficulty===2){
   if(bestAlt-currentScore>24)return true;
   return me.cur<=me.hp*.32&&bestAlt>currentScore+8;
 }
 // Master: switch aggressively only when it creates real advantage.
 if(bestAlt-currentScore>13)return true;
 if(me.cur<=me.hp*.42&&bestAlt>currentScore+3)return true;
 return false;
}
function aiSwitch(){
 const enemy=cur(playerTeam);
 const alive=teams[aiTeam].map((p,i)=>p.cur>0&&i!==active[aiTeam]?i:-1).filter(i=>i>=0);
 if(!alive.length)return false;
 alive.sort((a,b)=>aiSwitchScore(teams[aiTeam][b],enemy)-aiSwitchScore(teams[aiTeam][a],enemy));
 active[aiTeam]=aiDifficulty>=2?alive[0]:alive[Math.floor(Math.random()*alive.length)];
 sfx("switch");log("🤖 컴퓨터가 "+cur(aiTeam).n+"으로 교체!");
 render();setTimeout(next,500);return true;
}
function aiTakeTurn(){
 if(!isAiTurn()||aiBusy)return;
 aiBusy=true;
 if(aiShouldSwitch()){
   aiBusy=false; aiSwitch(); return;
 }
 log("🤖 컴퓨터가 주사위를 굴린다!");
 aiRoll(()=>{
   setTimeout(()=>{
     let move=aiBestMove();
     if(aiDifficulty===0&&Math.random()<.22)move=null;

     // Master may intentionally bank strong dice instead of firing a weak move.
     if(aiDifficulty===3 && move==="s1" && !valid(cur(aiTeam).s2)){
       const keepPotential=turnDice[aiTeam].reduce((sum,v,i)=>sum+aiKeepScore(v,i),0);
       const weakDamage=effectiveDamage(cur(aiTeam),cur(aiTeam).s1,cur(playerTeam));
       if(keepPotential>=14 && weakDamage<cur(playerTeam).cur*.55)move=null;
     }

     if(move){
       aiBusy=false;
       use(move);
     }else{
       aiChooseKeep();
       log(aiDifficulty===3
         ?"🤖 컴퓨터가 다음 강한 기술을 노리고 주사위를 보관한다."
         :"🤖 기술 조건이 안 돼서 주사위를 보관하고 턴을 넘긴다.");
       render();
       aiBusy=false;
       setTimeout(next,500);
     }
   },350);
 });
}

function openSwitchModal(){
  const alive=teams[turn].map((p,i)=>p.cur>0&&i!==active[turn]?i:-1).filter(i=>i>=0);
  if(!alive.length){log("교체할 포켓몬이 없어!");return;}
  $("#switchList").innerHTML=alive.map(i=>{
    const p=teams[turn][i];
    return `<button class="switch-choice" onclick="chooseSwitch(${i})">
      <img src="${img(p.id)}" alt="${p.n}">
      <div><b>${p.n}</b><div class="meta">${p.t} 타입</div></div>
      <div class="hpmini">HP ${p.cur}/${p.hp}</div>
    </button>`;
  }).join("");
  $("#switchModal").classList.remove("hidden");
}
function closeSwitchModal(){ $("#switchModal").classList.add("hidden"); }
function chooseSwitch(i){
  active[turn]=i; closeSwitchModal();
  sfx("switch");log("🔄 "+cur(turn).n+"으로 교체!");
  turnRolled[turn]=false;
  render();
  setTimeout(next,450);
}
$("#switch").onclick=openSwitchModal;



document.addEventListener("pointerdown",warmUpGameAudio,{once:true,passive:true});
