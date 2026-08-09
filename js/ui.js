function start(){
 stopMenuBgm(true);
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
 preloadCombatAudioBuffers();
 startBattleBgm();

 const firstLabel=teamName(0);
 log(`배틀 시작! ${firstLabel}부터 시작!`);
 render();
 showTurnBanner();
 if(isAiTurn())setTimeout(aiTakeTurn,900);
}
function log(t){const el=$("#log"); if(el) el.textContent=t;}


function teamName(teamIndex){
 return teamIndex===0?"블루팀":"레드팀";
}
function teamIcon(teamIndex){
 return teamIndex===0?"🔵":"🔴";
}

function showTurnBanner(){
 const el=$("#turnBanner");
 el.textContent=turn===0?"🔵 BLUE TEAM TURN":"🔴 RED TEAM TURN";
 el.className="turn-banner "+(turn===0?"blue":"red")+" show";
 setTimeout(()=>el.classList.remove("show"),800);
}
function updateTurnUX(){
 const strip=$("#turnStrip");
 if(strip){
   strip.textContent=gameMode==="solo"
     ? `${teamIcon(turn)} ${teamName(turn)}의 차례 · ${difficultyName()}`
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
let dexReturnScreen=null;
let dexReturnWasHome=false;

function openDex(){
  const screenIds=["modeScreen","difficultyScreen","soloTeamScreen","selectScreen","gameScreen"];
  dexReturnScreen=screenIds.find(id=>{
    const el=$("#"+id);
    return el && !el.classList.contains("hidden");
  }) || null;
  dexReturnWasHome=document.body.classList.contains("main-home");

  $("#dexGrid").innerHTML=P.map(p=>`
   <div class="dex-card">
    <img src="${img(p.id)}" alt="${p.n}">
    <h3>${p.n}</h3><div class="stat">${p.t} 타입 · HP ${p.hp}</div>
    <div class="move"><b>${p.s1[0]}</b> · 피해 ${p.s1[1]}<br>${p.s1[3]}</div>
    <div class="move"><b>${p.s2[0]}</b> · 피해 ${p.s2[1]}<br>${p.s2[3]}</div>
   </div>`).join("");

  $("#dexModal").classList.remove("hidden");
}

function closeDex(){
  $("#dexModal").classList.add("hidden");

  if(dexReturnScreen){
    ["modeScreen","difficultyScreen","soloTeamScreen","selectScreen","gameScreen"].forEach(id=>{
      const el=$("#"+id);
      if(el) el.classList.toggle("hidden", id!==dexReturnScreen);
    });
  }

  document.body.classList.toggle("main-home", !!dexReturnWasHome);
}

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

