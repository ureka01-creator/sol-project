function valid(skill){
 let vals=diceNow().filter(v=>v!=null),n=skill[0];
 if(n==="전광석화"||n==="할퀴기"||n==="물대포"||n==="덩굴채찍"||n==="몸통박치기")return vals.length>=1;
 
 if(n==="10만볼트")return vals.length>=1&&vals.reduce((sum,v)=>sum+v,0)>=10;
 if(n==="불꽃세례")return vals.filter(v=>v>=4).length>=2;
 if(n==="아쿠아테일")return vals.filter(v=>v%2===0).length>=2;
 if(n==="씨폭탄")return vals.length>=1&&vals.reduce((sum,v)=>sum+v,0)>=8;
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
    team.textContent=`${teamName(actualWinner)} 승리!`;
  }else{
    title.textContent=actualWinner===0?"BLUE TEAM WINS!":"RED TEAM WINS!";
    team.textContent=actualWinner===0?"블루팀 승리!":"레드팀 승리!";
  }

  stopBattleBgm(true);
  if(gameMode==="solo" && actualWinner!==playerTeam){
    setTimeout(()=>playCombatAudio(gameOverAudio,.76,.0,1800),520);
  }else{
    // Let the final faint land first, then play the dedicated victory theme.
    setTimeout(()=>playCombatAudio(victoryAudio,.82,.0,2400),420);
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

