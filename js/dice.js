function animateDiceRoll(forTurn,onDone){
  if(!diceRollBuffer) preloadDiceRollBuffer();
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
