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
   ? `🔵 블루팀 vs 🔴 레드팀 <span class="difficulty-badge">${difficultyName()}</span>`
   : `🔵 블루팀 vs 🔴 레드팀 <span class="difficulty-badge">${difficultyName()}</span>`;
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
function aiDamageMultiplier(){ return 1; }
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
