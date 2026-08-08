const diceRollAudio=new Audio("sounds/dice-roll-real-v3.mp3?v=283");
const diceLockAudio=new Audio("sounds/dice-lock-impact.wav");
diceRollAudio.preload="auto"; diceLockAudio.preload="auto";


const attackHitAudio=new Audio("sounds/attack-hit.mp3?v=276");
const criticalHitAudio=new Audio("sounds/critical-hit.mp3?v=276");
const faintAudio=new Audio("sounds/faint.mp3?v=276");
const gameOverAudio=new Audio("sounds/game-over.mp3?v=276");
const switchAudio=new Audio("sounds/switch.mp3?v=276");
[attackHitAudio,criticalHitAudio,faintAudio,gameOverAudio,switchAudio].forEach(a=>a.preload="auto");

const combatAudioUrls=new Map([
  [attackHitAudio,"sounds/attack-hit.mp3?v=281"],
  [criticalHitAudio,"sounds/critical-hit.mp3?v=281"],
  [faintAudio,"sounds/faint.mp3?v=281"],
  [gameOverAudio,"sounds/game-over.mp3?v=281"],
  [switchAudio,"sounds/switch.mp3?v=281"]
]);
const combatAudioBuffers=new Map();

async function preloadCombatAudioBuffers(){
  const ctx=ensureAudio();
  if(!ctx)return;
  await Promise.all([...combatAudioUrls.entries()].map(async([audio,url])=>{
    if(combatAudioBuffers.has(audio))return;
    try{
      const res=await fetch(url,{cache:"force-cache"});
      const arr=await res.arrayBuffer();
      const buf=await ctx.decodeAudioData(arr.slice(0));
      combatAudioBuffers.set(audio,buf);
    }catch(e){}
  }));
}


function playCombatAudio(audio,volume=.72,duck=.04,hold=420){
  if(!soundEnabled)return;
  duckBgm(duck,hold);

  const fallback=()=>{
    try{
      audio.pause();
      audio.currentTime=0;
      audio.volume=volume;
      const p=audio.play();
      if(p&&p.catch)p.catch(()=>{});
    }catch(e){}
  };

  const ctx=ensureAudio();
  if(!ctx){
    fallback();
    return;
  }

  const playBuffer=()=>{
    const buf=combatAudioBuffers.get(audio);
    if(!buf){
      fallback();
      preloadCombatAudioBuffers();
      return;
    }
    try{
      const src=ctx.createBufferSource();
      const gain=ctx.createGain();
      src.buffer=buf;
      gain.gain.value=volume;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(0);
    }catch(e){
      fallback();
    }
  };

  if(ctx.state==="suspended"){
    const p=ctx.resume();
    if(p&&p.then)p.then(playBuffer).catch(fallback);
    else setTimeout(playBuffer,0);
  }else{
    playBuffer();
  }
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
      fetch("sounds/dice-roll-real-v3.mp3?v=283",{cache:"reload"}),
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
      await preloadCombatAudioBuffers();
    }catch(e){}
  })();
  return audioWarmPromise;
}


function playDiceRollInstant(){
  if(!soundEnabled)return;

  // Dice must sit clearly above the music.
  duckBgm(.008,900);

  const playHtml=()=>{
    try{
      diceRollAudio.pause();
      diceRollAudio.currentTime=0;
      diceRollAudio.volume=1.0;
      const p=diceRollAudio.play();
      if(p&&p.catch)p.catch(()=>{});
    }catch(e){}
  };

  const ctx=ensureAudio();
  const playBoosted=()=>{
    if(!ctx || !diceRollBuffer){
      playHtml();
      return;
    }
    try{
      const src=ctx.createBufferSource();
      const gain=ctx.createGain();
      src.buffer=diceRollBuffer;
      // The source recording is much quieter than the other SFX.
      gain.gain.value=2.8;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(0);
    }catch(e){
      playHtml();
    }
  };

  if(ctx && ctx.state==="suspended"){
    ctx.resume().then(playBoosted).catch(playHtml);
  }else{
    playBoosted();
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


