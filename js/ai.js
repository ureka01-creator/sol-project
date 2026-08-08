function aiRoll(onDone){
  animateDiceRoll(aiTeam,()=>{
    log(`${teamIcon(aiTeam)} ${teamName(aiTeam)} 주사위: ${turnDice[aiTeam].join(" · ")} 확정!`);
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
 playCombatAudio(switchAudio,.74,.04,650);log(`${teamIcon(aiTeam)} ${teamName(aiTeam)}가 ${cur(aiTeam).n}으로 교체!`);
 render();setTimeout(next,500);return true;
}
function aiTakeTurn(){
 if(!isAiTurn()||aiBusy)return;
 aiBusy=true;
 if(aiShouldSwitch()){
   aiBusy=false; aiSwitch(); return;
 }
 log(`${teamIcon(aiTeam)} ${teamName(aiTeam)}가 주사위를 굴린다!`);
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
         ?`${teamIcon(aiTeam)} ${teamName(aiTeam)}가 다음 강한 기술을 노리고 주사위를 보관한다.`
         :"🤖 기술 조건이 안 돼서 주사위를 보관하고 턴을 넘긴다.");
       render();
       aiBusy=false;
       setTimeout(next,500);
     }
   },350);
 });
}

