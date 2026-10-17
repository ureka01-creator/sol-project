
(()=>{const root=document.getElementById('app');
const POKEMON_NAMES = [
  '이상해씨','이상해풀','이상해꽃','파이리','리자드','리자몽','꼬부기','어니부기','거북왕','캐터피',
  '단데기','버터플','뿔충이','딱충이','독침붕','구구','피죤','피죤투','꼬렛','레트라',
  '깨비참','깨비드릴조','아보','아보크','피카츄','라이츄','모래두지','고지','니드런♀','니드리나',
  '니드퀸','니드런♂','니드리노','니드킹','삐삐','픽시','식스테일','나인테일','푸린','푸크린',
  '주뱃','골뱃','뚜벅쵸','냄새꼬','라플레시아','파라스','파라섹트','콘팡','도나리','디그다',
  '닥트리오','나옹','페르시온','고라파덕','골덕','망키','성원숭','가디','윈디','발챙이',
  '슈륙챙이','강챙이','캐이시','윤겔라','후딘','알통몬','근육몬','괴력몬','모다피','우츠동',
  '우츠보트','왕눈해','독파리','꼬마돌','데구리','딱구리','포니타','날쌩마','야돈','야도란',
  '코일','레어코일','파오리','두두','두트리오','쥬쥬','쥬레곤','질퍽이','질뻐기','셀러',
  '파르셀','고오스','고우스트','팬텀','롱스톤','슬리프','슬리퍼','크랩','킹크랩','찌리리공',
  '붐볼','아라리','나시','탕구리','텅구리','시라소몬','홍수몬','내루미','또가스','또도가스',
  '뿔카노','코뿌리','럭키','덩쿠리','캥카','쏘드라','시드라','콘치','왕콘치','별가사리',
  '아쿠스타','마임맨','스라크','루주라','에레브','마그마','쁘사이저','켄타로스','잉어킹','갸라도스',
  '라프라스','메타몽','이브이','샤미드','쥬피썬더','부스터','폴리곤','암나이트','암스타','투구',
  '투구푸스','프테라','잠만보','프리져','썬더','파이어','미뇽','신뇽','망나뇽','뮤츠','뮤'
];

const POKEMON = POKEMON_NAMES.map((name, index) => ({ id: index + 1, name }));
const ART_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/';
const SPRITE_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/';
const ANSWER_DELAY = 700;

const screens = {
  start: root.querySelector('#startScreen'),
  quiz: root.querySelector('#quizScreen'),
  result: root.querySelector('#resultScreen')
};

const countButtons = [...root.querySelectorAll('.count-btn')];
const startButton = root.querySelector('#startButton');
const homeButton = root.querySelector('#homeButton');
const soundButton = root.querySelector('#soundButton');
const retryButton = root.querySelector('#retryButton');
const changeCountButton = root.querySelector('#changeCountButton');
const battleField = root.querySelector('#battleField');
const pokemonImage = root.querySelector('#pokemonImage');
const loadingBadge = root.querySelector('#loadingBadge');
const feedbackStamp = root.querySelector('#feedbackStamp');
const sparkLayer = root.querySelector('#sparkLayer');
const messageLine = root.querySelector('#messageLine');
const answersEl = root.querySelector('#answers');
const timerNumber = root.querySelector('#timerNumber');
const timerBar = root.querySelector('#timerBar');
const progressBar = root.querySelector('#progressBar');
const questionNow = root.querySelector('#questionNow');
const questionTotal = root.querySelector('#questionTotal');
const scoreText = root.querySelector('#scoreText');
const streakText = root.querySelector('#streakText');

let selectedCount = 10;
let questions = [];
let questionIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let current = null;
let locked = true;
let timerInterval = null;
let timeoutHandle = null;
let nextHandle = null;
let questionToken = 0;
let soundOn = true;
let audioCtx = null;

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function switchScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function beep(freq = 440, duration = .06, type = 'square', volume = .025) {
  if (!soundOn) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (_) {}
}

function successSound() {
  beep(660, .07, 'square', .025);
  setTimeout(() => beep(880, .1, 'square', .022), 65);
}

function wrongSound() {
  beep(220, .1, 'sawtooth', .018);
  setTimeout(() => beep(165, .11, 'sawtooth', .015), 75);
}

function clearTimers() {
  clearInterval(timerInterval);
  clearTimeout(timeoutHandle);
  clearTimeout(nextHandle);
  timerInterval = null;
  timeoutHandle = null;
  nextHandle = null;
}

function resetTimerVisual() {
  timerBar.classList.remove('running', 'danger');
  void timerBar.offsetWidth;
  timerBar.style.transform = 'scaleX(1)';
  timerNumber.textContent = '3';
}

function buildOptions(answer) {
  const distractors = shuffle(POKEMON.filter(p => p.id !== answer.id)).slice(0, 3);
  return shuffle([answer, ...distractors]);
}

function renderAnswers(answer) {
  answersEl.innerHTML = '';
  buildOptions(answer).forEach((pokemon, index) => {
    const button = document.createElement('button');
    button.className = 'answer-btn cursor-interaction';
    button.type = 'button';
    button.textContent = pokemon.name;
    button.dataset.id = String(pokemon.id);
    button.dataset.key = String.fromCharCode(65 + index);
    button.disabled = true;
    button.addEventListener('click', () => chooseAnswer(pokemon.id));
    answersEl.appendChild(button);
  });
}

function setAnswerState(selectedId, timedOut = false) {
  [...answersEl.children].forEach(button => {
    const id = Number(button.dataset.id);
    button.disabled = true;
    if (id === current.id) button.classList.add('correct');
    else if (!timedOut && id === selectedId) button.classList.add('wrong');
    else button.classList.add('dimmed');
  });
}

function showFeedback(text, kind) {
  feedbackStamp.textContent = text;
  feedbackStamp.className = `feedback-stamp ${kind}`;
  void feedbackStamp.offsetWidth;
  feedbackStamp.classList.add('show');
}

function showSpark() {
  sparkLayer.classList.remove('show');
  void sparkLayer.offsetWidth;
  sparkLayer.classList.add('show');
  setTimeout(() => sparkLayer.classList.remove('show'), 520);
}

function startCountdown(token) {
  if (token !== questionToken || !screens.quiz.classList.contains('active')) return;
  locked = false;
  [...answersEl.children].forEach(button => { button.disabled = false; });
  loadingBadge.classList.add('hidden');
  messageLine.textContent = '이 포켓몬의 이름은?';
  messageLine.classList.remove('answer-reveal');

  resetTimerVisual();
  void timerBar.offsetWidth;
  timerBar.style.transform = '';
  timerBar.classList.add('running');

  const startedAt = performance.now();
  beep(520, .04, 'square', .018);
  timerInterval = setInterval(() => {
    const remaining = Math.max(0, 3000 - (performance.now() - startedAt));
    const display = Math.max(1, Math.ceil(remaining / 1000));
    timerNumber.textContent = String(display);
    timerBar.classList.toggle('danger', remaining <= 1000);
  }, 60);

  timeoutHandle = setTimeout(() => {
    if (token !== questionToken || locked) return;
    handleTimeout();
  }, 3000);
}

function loadQuestionImage(pokemon, token) {
  pokemonImage.classList.remove('ready');
  pokemonImage.removeAttribute('src');
  pokemonImage.alt = `${pokemon.name} 그림`;
  pokemonImage.dataset.fallback = '0';
  loadingBadge.classList.remove('hidden');
  loadingBadge.textContent = 'SEARCHING...';

  pokemonImage.onload = () => {
    if (token !== questionToken) return;
    pokemonImage.classList.add('ready');
    requestAnimationFrame(() => startCountdown(token));
  };

  pokemonImage.onerror = () => {
    if (token !== questionToken) return;
    if (pokemonImage.dataset.fallback === '0') {
      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
      return;
    }
    loadingBadge.textContent = 'RETRYING...';
    nextHandle = setTimeout(() => {
      if (token !== questionToken) return;
      pokemonImage.dataset.fallback = '0';
      pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
    }, 400);
  };

  pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
}

function preloadUpcomingImages() {
  for (let i = questionIndex + 1; i <= Math.min(questionIndex + 3, questions.length - 1); i += 1) {
    const image = new Image();
    image.src = `${ART_BASE}${questions[i].id}.png`;
  }
}

function animateQuestionIn() {
  battleField.classList.remove('question-in');
  void battleField.offsetWidth;
  battleField.classList.add('question-in');
  setTimeout(() => battleField.classList.remove('question-in'), 260);
}

function showQuestion() {
  clearTimers();
  locked = true;
  feedbackStamp.className = 'feedback-stamp';
  sparkLayer.classList.remove('show');
  messageLine.textContent = '포켓몬을 불러오는 중...';
  messageLine.classList.remove('answer-reveal');

  const token = ++questionToken;
  current = questions[questionIndex];

  questionNow.textContent = String(questionIndex + 1);
  questionTotal.textContent = String(questions.length);
  progressBar.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  scoreText.textContent = String(score);
  streakText.textContent = String(streak);

  resetTimerVisual();
  renderAnswers(current);
  preloadUpcomingImages();
  animateQuestionIn();
  loadQuestionImage(current, token);
}

function stopCountdown() {
  clearInterval(timerInterval);
  clearTimeout(timeoutHandle);
  timerInterval = null;
  timeoutHandle = null;
  timerBar.classList.remove('running');
}

function chooseAnswer(selectedId) {
  if (locked) return;
  locked = true;
  stopCountdown();

  const isCorrect = selectedId === current.id;
  if (isCorrect) {
    score += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    scoreText.textContent = String(score);
    streakText.textContent = String(streak);
    setAnswerState(selectedId, false);
    messageLine.textContent = '정답!';
    showFeedback('정답!', 'correct');
    showSpark();
    successSound();
  } else {
    streak = 0;
    streakText.textContent = '0';
    setAnswerState(selectedId, false);
    messageLine.textContent = `정답은 ${current.name}!`;
    messageLine.classList.add('answer-reveal');
    showFeedback('아쉽다!', 'wrong');
    wrongSound();
  }

  nextHandle = setTimeout(nextQuestion, ANSWER_DELAY);
}

function handleTimeout() {
  locked = true;
  stopCountdown();
  timerBar.style.transform = 'scaleX(0)';
  timerBar.classList.add('danger');
  timerNumber.textContent = '0';
  streak = 0;
  streakText.textContent = '0';
  setAnswerState(null, true);
  messageLine.textContent = `시간 끝! 정답은 ${current.name}!`;
  messageLine.classList.add('answer-reveal');
  showFeedback('시간 끝!', 'wrong');
  wrongSound();
  nextHandle = setTimeout(nextQuestion, ANSWER_DELAY);
}

function nextQuestion() {
  questionIndex += 1;
  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }
  showQuestion();
}

function getResultMessage(ratio) {
  if (ratio === 1) return '완벽해! 관동지방 포켓몬 박사다!';
  if (ratio >= .8) return '대단해! 포켓몬을 정말 많이 알고 있네!';
  if (ratio >= .6) return '좋아! 조금만 더 하면 포켓몬 박사!';
  if (ratio >= .4) return '잘했어! 한 번 더 하면 기록을 올릴 수 있어!';
  return '좋아! 포켓몬을 하나씩 더 알아가 보자!';
}

function finishGame() {
  clearTimers();
  progressBar.style.width = '100%';
  const ratio = score / questions.length;
  const accuracy = Math.round(ratio * 100);
  root.querySelector('#finalScore').textContent = String(score);
  root.querySelector('#finalTotal').textContent = `/ ${questions.length}`;
  root.querySelector('#accuracyText').textContent = `${accuracy}%`;
  root.querySelector('#bestStreakText').textContent = String(bestStreak);
  root.querySelector('#resultMessage').textContent = getResultMessage(ratio);
  root.querySelector('#resultBadge').textContent = '';
  switchScreen('result');
  if (ratio >= .8) successSound();
}

function startGame() {
  clearTimers();
  beep(540, .05, 'square', .018);
  questions = shuffle(POKEMON).slice(0, Math.min(selectedCount, POKEMON.length));
  questionIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  switchScreen('quiz');
  showQuestion();
}

function goHome() {
  clearTimers();
  questionToken += 1;
  locked = true;
  switchScreen('start');
}

countButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedCount = Number(button.dataset.count);
    countButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-checked', String(selected));
    });
    beep(420, .035, 'square', .012);
  });
});

startButton.addEventListener('click', startGame);
homeButton.addEventListener('click', goHome);
retryButton.addEventListener('click', goHome);
changeCountButton.addEventListener('click', goHome);

soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  soundButton.textContent = soundOn ? '♪ ON' : '♪ OFF';
  soundButton.setAttribute('aria-label', soundOn ? '소리 끄기' : '소리 켜기');
  if (soundOn) beep(520, .05, 'square', .018);
});

window.addEventListener('keydown', event => {
  if (!screens.quiz.classList.contains('active') || locked) return;
  const key = event.key.toUpperCase();
  const index = ['A', 'B', 'C', 'D'].indexOf(key);
  if (index < 0) return;
  const button = answersEl.children[index];
  if (button && !button.disabled) button.click();
});

(() => {
  const timeButtons = [...root.querySelectorAll('.time-btn')];
  const subtitle = null;
  let selectedTimeSeconds = 3;

  function syncTimeButtons() {
    timeButtons.forEach(button => {
      const selected = Number(button.dataset.time) === selectedTimeSeconds;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', String(selected));
    });
    if (subtitle) {
      subtitle.innerHTML = `포켓몬이 나타나면 <strong>${selectedTimeSeconds}초 안에</strong> 이름을 골라!`;
    }
  }

  timeButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedTimeSeconds = Number(button.dataset.time) || 3;
      syncTimeButtons();
      beep(420, .035, 'square', .012);
    });
  });

  resetTimerVisual = function configuredResetTimerVisual() {
    timerBar.classList.remove('running', 'danger');
    timerBar.style.animationDuration = `${selectedTimeSeconds}s`;
    void timerBar.offsetWidth;
    timerBar.style.transform = 'scaleX(1)';
    timerNumber.textContent = String(selectedTimeSeconds);
  };

  startCountdown = function configuredStartCountdown(token) {
    if (token !== questionToken || !screens.quiz.classList.contains('active')) return;
    locked = false;
    [...answersEl.children].forEach(button => { button.disabled = false; });
    loadingBadge.classList.add('hidden');
    messageLine.textContent = '이 포켓몬의 이름은?';
    messageLine.classList.remove('answer-reveal');

    resetTimerVisual();
    void timerBar.offsetWidth;
    timerBar.style.transform = '';
    timerBar.style.animationDuration = `${selectedTimeSeconds}s`;
    timerBar.classList.add('running');

    const limitMs = selectedTimeSeconds * 1000;
    const startedAt = performance.now();
    beep(520, .04, 'square', .018);

    timerInterval = setInterval(() => {
      const remaining = Math.max(0, limitMs - (performance.now() - startedAt));
      const display = Math.max(1, Math.ceil(remaining / 1000));
      timerNumber.textContent = String(display);
      timerBar.classList.toggle('danger', remaining <= 1000);
    }, 60);

    timeoutHandle = setTimeout(() => {
      if (token !== questionToken || locked) return;
      handleTimeout();
    }, limitMs);
  };

  syncTimeButtons();
})();

(() => {
  loadQuestionImage = function decodedQuestionImage(pokemon, token) {
    pokemonImage.classList.remove('ready');
    pokemonImage.removeAttribute('src');
    pokemonImage.alt = `${pokemon.name} 그림`;
    pokemonImage.dataset.fallback = '0';
    pokemonImage.decoding = 'async';
    pokemonImage.fetchPriority = 'high';
    loadingBadge.classList.remove('hidden');
    loadingBadge.textContent = 'SEARCHING...';

    let settled = false;
    let slowTimer = null;

    const beginAfterPaint = async () => {
      if (settled || token !== questionToken) return;

      try {
        if (typeof pokemonImage.decode === 'function') await pokemonImage.decode();
      } catch (_) {
        // onload + naturalWidth below is the final validity check.
      }

      if (settled || token !== questionToken) return;
      if (!pokemonImage.complete || pokemonImage.naturalWidth <= 0) return;

      settled = true;
      clearTimeout(slowTimer);
      pokemonImage.classList.add('ready');

      // Give Safari two paint frames before the timer becomes active.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (token !== questionToken) return;
          startCountdown(token);
        });
      });
    };

    const useSpriteFallback = () => {
      if (settled || token !== questionToken) return;
      if (pokemonImage.dataset.fallback === '1') {
        loadingBadge.textContent = 'RETRYING...';
        slowTimer = setTimeout(() => {
          if (settled || token !== questionToken) return;
          pokemonImage.dataset.fallback = '0';
          pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
        }, 500);
        return;
      }

      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    };

    pokemonImage.onload = beginAfterPaint;
    pokemonImage.onerror = useSpriteFallback;

    // If full artwork is slow on mobile data, switch to the much smaller sprite.
    slowTimer = setTimeout(() => {
      if (settled || token !== questionToken || pokemonImage.dataset.fallback === '1') return;
      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    }, 2200);

    pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
  };
})();
(() => {
  const GEN2_NAMES = [
    '치코리타','베이리프','메가니움','브케인','마그케인','블레이범','리아코','엘리게이','장크로다일','꼬리선',
    '다꼬리','부우부','야부엉','레디바','레디안','페이검','아리아도스','크로뱃','초라기','랜턴',
    '피츄','삐','푸푸린','토게피','토게틱','네이티','네이티오','메리프','보송송','전룡',
    '아르코','마릴','마릴리','꼬지모','왕구리','통통코','두코','솜솜코','에이팜','해너츠',
    '해루미','왕자리','우파','누오','에브이','블래키','니로우','야도킹','무우마','안농',
    '마자용','키링키','피콘','쏘콘','노고치','글라이거','강철톤','블루','그랑블루','침바루',
    '핫삼','단단지','헤라크로스','포푸니','깜지곰','링곰','마그마그','마그카르고','꾸꾸리','메꾸리',
    '코산호','총어','대포무노','딜리버드','만타인','무장조','델빌','헬가','킹드라','코코리',
    '코리갑','폴리곤2','노라키','루브도','배루키','카포에라','뽀뽀라','에레키드','마그비','밀탱크',
    '해피너스','라이코','앤테이','스이쿤','애버라스','데기라스','마기라스','루기아','칠색조','세레비'
  ];

  const genButtons = [...root.querySelectorAll('.gen-btn')];
  const optionSummaryText = root.querySelector('#optionSummaryText');
  const gen1 = POKEMON.map(p => ({ ...p }));
  const gen2 = GEN2_NAMES.map((name, index) => ({ id: 152 + index, name }));
  const allPokemon = [...gen1, ...gen2];
  let selectedGeneration = 'all';

  function getSelectedPool() {
    if (selectedGeneration === 'gen1') return gen1;
    if (selectedGeneration === 'gen2') return gen2;
    return allPokemon;
  }

  function applyGenerationPool() {
    const pool = getSelectedPool();
    POKEMON.splice(0, POKEMON.length, ...pool.map(p => ({ ...p })));
  }

  function generationLabel() {
    if (selectedGeneration === 'gen1') return '1세대';
    if (selectedGeneration === 'gen2') return '2세대';
    return '1+2세대';
  }

  function updateOptionSummary() {
    if (!optionSummaryText) return;
    const count = root.querySelector('.count-btn.selected')?.dataset.count || '10';
    const time = root.querySelector('.time-btn.selected')?.dataset.time || '3';
    optionSummaryText.textContent = `${count}문제 · ${time}초 · ${generationLabel()}`;
  }

  function syncGenerationButtons() {
    genButtons.forEach(button => {
      const selected = button.dataset.gen === selectedGeneration;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', String(selected));
    });
    applyGenerationPool();
    updateOptionSummary();
  }

  genButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedGeneration = button.dataset.gen || 'all';
      syncGenerationButtons();
      beep(420, .035, 'square', .012);
    });
  });

  [...root.querySelectorAll('.count-btn, .time-btn')].forEach(button => {
    button.addEventListener('click', updateOptionSummary);
  });

  startButton.addEventListener('click', applyGenerationPool, true);

  getResultMessage = function generationResultMessage(ratio) {
    if (ratio === 1) return '완벽해! 진짜 포켓몬 박사다!';
    if (ratio >= .8) return '대단해! 포켓몬을 정말 많이 알고 있네!';
    if (ratio >= .6) return '좋아! 조금만 더 하면 포켓몬 박사!';
    if (ratio >= .4) return '잘했어! 한 번 더 하면 기록을 올릴 수 있어!';
    return '좋아! 포켓몬을 하나씩 더 알아가 보자!';
  };

  syncGenerationButtons();
})();
(() => {
  const PQ_BAR_MS = 1680;
  const PQ_TITLE_BAR_MS = 2240;
  const PQ_SCALE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51
  };

  const titleMusicButton = root.querySelector('#titleMusicButton');
  let pqQuizTimer = null;
  let pqTitleTimer = null;
  let pqVoices = new Set();
  let pqTimeoutMode = false;
  let pqQuestionSerial = 0;
  let pqAudioUnlocked = false;
  let pqTitleEnabled = false;
  let pqTitleVariant = 0;

  function pqGetContext() {
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    } catch (_) {
      return null;
    }
  }

  async function pqUnlockAudio() {
    if (!soundOn) return false;
    const ctx = pqGetContext();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      pqAudioUnlocked = ctx.state === 'running';
      return pqAudioUnlocked;
    } catch (_) {
      return false;
    }
  }

  function pqToneAt(freq, delay = 0, duration = .08, type = 'square', volume = .018, music = false, detune = 0) {
    if (!soundOn) return null;
    const ctx = pqGetContext();
    if (!ctx || ctx.state !== 'running') return null;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + Math.max(0, delay);
    const t1 = t0 + Math.max(.02, duration);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.detune.setValueAtTime(detune, t0);
    gain.gain.setValueAtTime(.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), t0 + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, t1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1 + .02);

    if (music) {
      pqVoices.add(osc);
      osc.addEventListener('ended', () => pqVoices.delete(osc), { once: true });
    }
    return osc;
  }

  function pqNoise(delay = 0, duration = .04, volume = .006) {
    if (!soundOn) return;
    const ctx = pqGetContext();
    if (!ctx || ctx.state !== 'running') return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + delay;
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(.0001, t0 + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(t0);
    source.stop(t0 + duration + .02);
  }

  function pqStopVoices() {
    pqVoices.forEach(osc => { try { osc.stop(); } catch (_) {} });
    pqVoices.clear();
  }

  function pqStopQuizBgm() {
    if (pqQuizTimer) clearInterval(pqQuizTimer);
    pqQuizTimer = null;
  }

  function pqStopTitleBgm() {
    if (pqTitleTimer) clearInterval(pqTitleTimer);
    pqTitleTimer = null;
  }

  function pqStopAllMusic() {
    pqStopQuizBgm();
    pqStopTitleBgm();
    pqStopVoices();
    pqUpdateTitleButton();
  }

  function pqMenuTick() {
    pqToneAt(PQ_SCALE.E5, 0, .028, 'square', .010);
    pqToneAt(PQ_SCALE.A5, .018, .03, 'square', .008);
  }

  function pqConfirm() {
    pqToneAt(PQ_SCALE.C5, 0, .045, 'square', .014);
    pqToneAt(PQ_SCALE.E5, .045, .055, 'square', .015);
    pqToneAt(PQ_SCALE.G5, .095, .07, 'square', .016);
  }

  function pqStartJingle() {
    [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6].forEach((note, i) => {
      pqToneAt(note, i * .055, .085, i === 3 ? 'triangle' : 'square', .020);
    });
    pqNoise(.17, .035, .005);
  }

  function pqQuestionCue() {
    const serial = ++pqQuestionSerial;
    pqToneAt(PQ_SCALE.G4, 0, .035, 'square', .010);
    pqToneAt(PQ_SCALE.C5, .035, .04, 'square', .012);
    pqToneAt(PQ_SCALE.E5, .075, .055, 'square', .012);
    setTimeout(() => {
      if (serial !== pqQuestionSerial || !screens.quiz.classList.contains('active')) return;
      pqToneAt(PQ_SCALE.G5, 0, .035, 'square', .008);
    }, 125);
  }

  function pqTimerReady() {
    pqToneAt(PQ_SCALE.C6, 0, .035, 'square', .010);
    pqToneAt(PQ_SCALE.G5, .04, .045, 'square', .007);
  }

  function pqAnswerTap() {
    pqNoise(0, .025, .004);
    pqToneAt(PQ_SCALE.D5, 0, .035, 'square', .010);
  }

  function pqCorrect() {
    [PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6].forEach((note, i) => {
      pqToneAt(note, i * .055, .10, i > 1 ? 'triangle' : 'square', .023);
    });
    pqToneAt(PQ_SCALE.C5, .11, .14, 'square', .009);
    pqNoise(.16, .045, .004);
  }

  function pqWrong() {
    pqToneAt(PQ_SCALE.E4, 0, .085, 'square', .016);
    pqToneAt(PQ_SCALE.D4, .072, .09, 'square', .015);
    pqToneAt(PQ_SCALE.C4, .145, .13, 'sawtooth', .010);
  }

  function pqTimeout() {
    pqToneAt(PQ_SCALE.G4, 0, .05, 'square', .014);
    pqToneAt(PQ_SCALE.G4, .07, .05, 'square', .013);
    pqToneAt(PQ_SCALE.C4, .145, .16, 'sawtooth', .010);
    pqNoise(.14, .07, .006);
  }

  function pqResultFanfare() {
    if (!soundOn) return;
    const melody = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6];
    const times = [0, .08, .16, .25, .37, .45, .57];
    melody.forEach((note, i) => pqToneAt(note, times[i], i === melody.length - 1 ? .28 : .11, i >= 3 ? 'triangle' : 'square', .020));
    pqToneAt(PQ_SCALE.C4, .25, .45, 'square', .007);
    pqToneAt(PQ_SCALE.G4, .25, .45, 'square', .006);
  }

  function pqScheduleQuizBar() {
    if (!soundOn || !pqAudioUnlocked || !screens.quiz.classList.contains('active')) return;
    const step = .21;
    const lead = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.E5, PQ_SCALE.D5, PQ_SCALE.F5, PQ_SCALE.G5, PQ_SCALE.D5];
    const bass = [PQ_SCALE.C4, PQ_SCALE.C4, PQ_SCALE.F4, PQ_SCALE.G4];
    lead.forEach((note, i) => pqToneAt(note, i * step, .075, 'square', .0065, true, i % 2 ? -4 : 0));
    bass.forEach((note, i) => pqToneAt(note, i * step * 2, .15, 'triangle', .005, true));
  }

  function pqStartQuizBgm() {
    if (!soundOn || !pqAudioUnlocked || pqQuizTimer || !screens.quiz.classList.contains('active')) return;
    pqStopTitleBgm();
    pqStopVoices();
    pqScheduleQuizBar();
    pqQuizTimer = setInterval(pqScheduleQuizBar, PQ_BAR_MS);
  }

  function pqScheduleTitleBar() {
    if (!soundOn || !pqAudioUnlocked || !pqTitleEnabled || !screens.start.classList.contains('active')) return;
    const step = .14;
    const leadA = [
      PQ_SCALE.G5, PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.C6,
      PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5, PQ_SCALE.E5,
      PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.C6, PQ_SCALE.D6,
      PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5
    ];
    const leadB = [
      PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.B5,
      PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5,
      PQ_SCALE.F5, PQ_SCALE.A5, PQ_SCALE.C6, PQ_SCALE.E6,
      PQ_SCALE.D6, PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.G5
    ];
    const lead = pqTitleVariant % 2 === 0 ? leadA : leadB;
    const bass = pqTitleVariant % 2 === 0
      ? [PQ_SCALE.C4, PQ_SCALE.G4, PQ_SCALE.A4, PQ_SCALE.F4]
      : [PQ_SCALE.F4, PQ_SCALE.G4, PQ_SCALE.E4, PQ_SCALE.G4];

    lead.forEach((note, i) => {
      const volume = i % 4 === 0 ? .021 : .015;
      pqToneAt(note, i * step, .095, i % 4 === 3 ? 'triangle' : 'square', volume, true, i % 2 ? -3 : 2);
    });
    bass.forEach((note, i) => {
      pqToneAt(note, i * step * 4, .36, 'triangle', .011, true);
      pqToneAt(note * 2, i * step * 4 + .28, .06, 'square', .006, true);
    });
    [0, 4, 8, 12].forEach(index => pqNoise(index * step, .03, .004));
    pqTitleVariant += 1;
  }

  function pqUpdateTitleButton() {
    if (!titleMusicButton) return;
    const playing = Boolean(pqTitleTimer) && soundOn && pqTitleEnabled && screens.start.classList.contains('active');
    titleMusicButton.classList.toggle('playing', playing);
    titleMusicButton.setAttribute('aria-pressed', String(playing));
    if (playing) titleMusicButton.textContent = '♪ 음악 끄기';
    else if (pqTitleEnabled && !soundOn) titleMusicButton.textContent = '♪ 음악 켜기';
    else titleMusicButton.textContent = '♪ 음악 켜기';
  }

  function pqStartTitleBgm() {
    if (!soundOn || !pqAudioUnlocked || !pqTitleEnabled || pqTitleTimer || !screens.start.classList.contains('active')) {
      pqUpdateTitleButton();
      return;
    }
    pqStopQuizBgm();
    pqStopVoices();
    pqScheduleTitleBar();
    pqTitleTimer = setInterval(pqScheduleTitleBar, PQ_TITLE_BAR_MS);
    pqUpdateTitleButton();
  }

  async function pqToggleTitleMusic(event) {
    event?.preventDefault();
    if (!pqTitleEnabled || !pqTitleTimer) {
      pqTitleEnabled = true;
      if (!soundOn) {
        soundOn = true;
        soundButton.textContent = '♪ ON';
        soundButton.setAttribute('aria-label', '소리 끄기');
      }
      const unlocked = await pqUnlockAudio();
      if (!unlocked) {
        pqUpdateTitleButton();
        return;
      }
      pqStopTitleBgm();
      pqStopVoices();
      pqConfirm();
      setTimeout(pqStartTitleBgm, 120);
    } else {
      pqTitleEnabled = false;
      pqStopTitleBgm();
      pqStopVoices();
      pqUpdateTitleButton();
    }
  }

  const pqOriginalSwitchScreen = switchScreen;
  switchScreen = function pqSwitchScreen(name) {
    pqOriginalSwitchScreen(name);
    pqStopAllMusic();
    if (name === 'quiz') setTimeout(pqStartQuizBgm, 180);
    else if (name === 'start' && pqTitleEnabled) setTimeout(pqStartTitleBgm, 100);
    else if (name === 'result') setTimeout(pqResultFanfare, 70);
  };

  const pqOriginalShowQuestion = showQuestion;
  showQuestion = function pqShowQuestion() {
    pqOriginalShowQuestion();
    setTimeout(pqQuestionCue, 25);
  };

  const pqOriginalChooseAnswer = chooseAnswer;
  chooseAnswer = function pqChooseAnswer(selectedId) {
    if (!locked) pqAnswerTap();
    pqOriginalChooseAnswer(selectedId);
  };

  const pqOriginalHandleTimeout = handleTimeout;
  handleTimeout = function pqHandleTimeout() {
    pqTimeoutMode = true;
    pqOriginalHandleTimeout();
    pqTimeoutMode = false;
  };

  beep = function pqBeep(freq = 440, duration = .06, type = 'square', volume = .025) {
    if (!soundOn) return;
    if (freq === 420 && duration <= .04) return pqMenuTick();
    if (freq === 540) return pqStartJingle();
    if (freq === 520 && duration <= .045) return pqTimerReady();
    if (freq === 520) return pqConfirm();
    pqToneAt(freq, 0, duration, type, Math.min(volume, .020));
  };

  successSound = function pqSuccessSound() {
    if (screens.result.classList.contains('active')) pqToneAt(PQ_SCALE.C6, 0, .08, 'triangle', .012);
    else pqCorrect();
  };

  wrongSound = function pqWrongSound() {
    if (pqTimeoutMode) pqTimeout();
    else pqWrong();
  };

  document.addEventListener('pointerdown', () => { pqUnlockAudio(); }, { capture: true, passive: true });
  document.addEventListener('touchstart', () => { pqUnlockAudio(); }, { capture: true, passive: true });
  document.addEventListener('keydown', () => { pqUnlockAudio(); }, { capture: true });

  if (titleMusicButton) titleMusicButton.addEventListener('click', pqToggleTitleMusic);

  soundButton.addEventListener('click', async () => {
    if (soundOn) {
      await pqUnlockAudio();
      pqConfirm();
      if (screens.quiz.classList.contains('active')) setTimeout(pqStartQuizBgm, 90);
      else if (screens.start.classList.contains('active') && pqTitleEnabled) setTimeout(pqStartTitleBgm, 90);
    } else {
      pqStopAllMusic();
    }
    pqUpdateTitleButton();
  });

  homeButton.addEventListener('click', () => pqStopAllMusic());
  changeCountButton.addEventListener('click', pqStopAllMusic);
  window.addEventListener('pagehide', pqStopAllMusic);

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      pqStopAllMusic();
      return;
    }
    if (!soundOn || !pqAudioUnlocked) return;
    if (screens.quiz.classList.contains('active')) pqStartQuizBgm();
    else if (screens.start.classList.contains('active') && pqTitleEnabled) pqStartTitleBgm();
  });

  pqUpdateTitleButton();
})();

(() => {
  const list = root.querySelector('#reviewList');
  const count = root.querySelector('#reviewCount');
  const pageLabel = root.querySelector('#reviewPage');
  const previous = root.querySelector('#reviewPrevious');
  const next = root.querySelector('#reviewNext');
  const filters = [...root.querySelectorAll('[data-review-filter]')];
  let attempts = [], filter = 'all', page = 0;
  const pageSize = 3;
  function renderReview() {
    const filtered = attempts.filter(item => filter === 'all' || (filter === 'correct' ? item.correct : !item.correct));
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.max(0, Math.min(page, pageCount - 1));
    const correct = attempts.filter(item => item.correct).length;
    count.textContent = `정답 ${correct} · 오답 ${attempts.length - correct}`;
    pageLabel.textContent = `${page + 1} / ${pageCount}`;
    previous.disabled = page === 0;
    next.disabled = page >= pageCount - 1;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reviewFilter === filter)));
    list.replaceChildren();
    const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'dex-review-empty';
      empty.textContent = attempts.length ? '해당하는 문제가 없어.' : '문제를 풀면 결과가 여기에 보여.';
      list.append(empty);
    }
    visible.forEach(item => {
      const row = document.createElement('article');
      row.className = 'dex-review-item' + (item.correct ? '' : ' is-wrong');
      const number = document.createElement('span');
      number.className = 'dex-review-number'; number.textContent = String(item.index + 1).padStart(2, '0');
      const image = document.createElement('img');
      image.src = SPRITE_BASE + item.id + '.png'; image.alt = ''; image.width = 44; image.height = 44;
      const info = document.createElement('div'); info.className = 'dex-review-info';
      const name = document.createElement('strong'); name.textContent = item.name;
      const answer = document.createElement('small');
      answer.textContent = item.timedOut ? '시간 초과' : item.correct ? '맞혔어!' : '내 답: ' + item.selectedName;
      info.append(name, answer);
      const status = document.createElement('span'); status.className = 'dex-review-status'; status.textContent = item.correct ? '✓ 정답' : '× 오답';
      row.append(number, image, info, status); list.append(row);
    });
  }
  function record(id, timedOut) {
    if (locked || !current || attempts.some(item => item.index === questionIndex)) return;
    const chosen = [...answersEl.children].find(button => Number(button.dataset.id) === Number(id));
    attempts.push({ index: questionIndex, id: current.id, name: current.name, correct: !timedOut && Number(id) === current.id, timedOut, selectedName: chosen?.textContent || '선택 없음' });
  }
  const baseChoose = chooseAnswer;
  chooseAnswer = function(id) { record(id, false); baseChoose(id); };
  const baseTimeout = handleTimeout;
  handleTimeout = function() { record(null, true); baseTimeout(); };
  const baseFinish = finishGame;
  finishGame = function() { filter = 'all'; page = 0; renderReview(); baseFinish(); };
  function resetReview() { attempts = []; filter = 'all'; page = 0; renderReview(); }
  startButton.addEventListener('click', resetReview, true);
  retryButton.addEventListener('click', resetReview, true);
  filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.reviewFilter; page = 0; renderReview(); }));
  previous.addEventListener('click', () => { page--; renderReview(); });
  next.addEventListener('click', () => { page++; renderReview(); });
  renderReview();
})();

(() => {
  const stage = root.querySelector('.dex-hero');
  const display = root.querySelector('.start-display');
  const slots = [...stage.querySelectorAll('.hero-slot')];
  const familiar = [1,4,7,25,39,133,152,155,158,172,175];
  let drawToken = 0;
  function chooseTrio() {
    const pool = POKEMON.slice();
    const leads = pool.filter(p => familiar.includes(p.id));
    const center = shuffle(leads.length ? leads : pool)[0];
    const companions = shuffle(pool.filter(p => p.id !== center.id)).slice(0,2);
    return [companions[0],center,companions[1]];
  }
  function displayTrio() {
    const trio = chooseTrio();
    const token = ++drawToken;
    display.classList.remove('hero-boot');
    void display.offsetWidth;
    display.classList.add('hero-boot');
    slots.forEach((slot,index) => {
      const pokemon = trio[index], image = slot.querySelector('img');
      slot.classList.remove('is-entering','is-bouncing');
      slot.setAttribute('aria-label',pokemon.name+' 반응 보기');
      image.alt = pokemon.name;
      let fallback = false;
      image.onload = () => {
        if(token !== drawToken) return;
        slot.classList.remove('is-entering');
        void slot.offsetWidth;
        slot.classList.add('is-entering');
      };
      image.onerror = () => { if(!fallback && token === drawToken) { fallback=true; image.src=SPRITE_BASE+pokemon.id+'.png'; } };
      image.src = ART_BASE+pokemon.id+'.png';
    });
  }
  slots.forEach(slot => {
    slot.querySelector('img').addEventListener('animationend', () => slot.classList.remove('is-entering','is-bouncing'));
    slot.addEventListener('click', () => {
      slot.classList.remove('is-entering','is-bouncing');
      void slot.offsetWidth;
      slot.classList.add('is-bouncing');
    });
  });
  root.querySelectorAll('.gen-btn').forEach(button => button.addEventListener('click',displayTrio));
  let wasActive = screens.start.classList.contains('active');
  new MutationObserver(() => {
    const active = screens.start.classList.contains('active');
    if(active && !wasActive) displayTrio();
    wasActive = active;
  }).observe(screens.start,{attributes:true,attributeFilter:['class']});
  displayTrio();
})();

})();


(() => {
  const root = document.getElementById('app');
  const scenes = [...root.querySelectorAll(':scope > .scene')];
  const settings = root.querySelector('#gameOptions');
  function syncAccessibility() {
    scenes.forEach(scene => {
      const inactive = !scene.classList.contains('active');
      scene.inert = inactive;
      scene.setAttribute('aria-hidden', String(inactive));
    });
  }
  const observer = new MutationObserver(syncAccessibility);
  scenes.forEach(scene => observer.observe(scene, { attributes: true, attributeFilter: ['class'] }));
  root.querySelector('#startButton').addEventListener('click', () => { settings.open = false; }, true);
  syncAccessibility();
})();

