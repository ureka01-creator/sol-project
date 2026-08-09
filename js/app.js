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
  active[turn]=i;
  closeSwitchModal();

  // Actual Pokémon switch sound. Do not use the generic menu/select SFX here.
  playCombatAudio(switchAudio,.78,.035,700);
  log("🔄 "+cur(turn).n+"으로 교체!");

  turnRolled[turn]=false;
  render();
  setTimeout(next,450);
}
$("#switch").onclick=openSwitchModal;



document.addEventListener("pointerdown",warmUpGameAudio,{once:true,passive:true});


// V2.9.6 - shared menu selection sound
document.addEventListener("click",(e)=>{
  const b=e.target.closest("button");
  if(!b || b.disabled)return;
  if(b.closest("#gameScreen"))return;
  if(b.closest("#switchModal") || b.classList.contains("switch-choice"))return;
  if(b.classList.contains("pick") || b.id==="confirmPick")return;
  playCombatAudio(selectAudio,.72,.055,180);
});

// V3.0.4 - Pokémon-style title screen. First tap unlocks audio on iOS.
const tapStart=$("#tapStart");
const homeMenu=$("#homeMenu");
let titleReady=false;
setTimeout(()=>{ titleReady=true; },450);

if(tapStart){
  tapStart.addEventListener("click",(e)=>{
    if(!titleReady)return;
    e.preventDefault();
    warmUpGameAudio();
    startMenuBgm();
    tapStart.style.display="none";
    if(homeMenu){
      homeMenu.classList.remove("hidden");
      homeMenu.style.display="grid";
    }
  });
}
