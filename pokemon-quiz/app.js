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
const ART_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

const screens = {
  start: document.getElementById('startScreen'),
  quiz: document.getElementById('quizScreen'),
  result: document.getElementById('resultScreen')
};

const countButtons = [...document.querySelectorAll('.count-btn')];
const startButton = document.getElementById('startButton');
const homeButton = document.getElementById('homeButton');
const soundButton = document.getElementById('soundButton');
const retryButton = document.getElementById('retryButton');
const changeCountButton = document.getElementById('changeCountButton');
const pokemonImage = document.getElementById('pokemonImage');
const loadingBadge = document.getElementById('loadingBadge');
const feedbackStamp = document.getElementById('feedbackStamp');
const answersEl = document.getElementById('answers');
const timerNumber = document.getElementById('timerNumber');
const timerBar = document.getElementById('timerBar');
const progressBar = document.getElementById('progressBar');
const questionNow = document.getElementById('questionNow');
const questionTotal = document.getElementById('questionTotal');
const scoreText = document.getElementById('scoreText');
const streakText = document.getElementById('streakText');

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
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function switchScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function beep(freq = 440, duration = .07, type = 'sine', volume = .04) {
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
  beep(660, .09, 'triangle', .055);
  setTimeout(() => beep(880, .12, 'triangle', .05), 80);
}

function wrongSound() {
  beep(190, .13, 'sawtooth', .025);
  setTimeout(() => beep(145, .14, 'sawtooth', .02), 90);
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
  timerBar.classList.remove('running');
  void timerBar.offsetWidth;
  timerBar.style.transform = 'scaleX(1)';
  timerNumber.textContent = '3';
  timerNumber.classList.remove('danger');
}

function buildOptions(answer) {
  const distractors = [];
  const candidates = shuffle(POKEMON.filter(p => p.id !== answer.id));
  for (const p of candidates) {
    if (!distractors.some(d => d.name === p.name)) distractors.push(p);
    if (distractors.length === 3) break;
  }
  return shuffle([answer, ...distractors]);
}

function renderAnswers(answer) {
  answersEl.innerHTML = '';
  buildOptions(answer).forEach(pokemon => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.type = 'button';
    button.textContent = pokemon.name;
    button.dataset.id = String(pokemon.id);
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

function showStamp(text, correct) {
  feedbackStamp.textContent = text;
  feedbackStamp.className = `feedback-stamp ${correct ? 'correct' : 'wrong'}`;
  void feedbackStamp.offsetWidth;
  feedbackStamp.classList.add('show');
}

function startCountdown(token) {
  if (token !== questionToken || !screens.quiz.classList.contains('active')) return;
  locked = false;
  [...answersEl.children].forEach(button => button.disabled = false);
  loadingBadge.classList.add('hidden');
  resetTimerVisual();
  void timerBar.offsetWidth;
  timerBar.style.transform = '';
  timerBar.classList.add('running');

  const startedAt = performance.now();
  beep(520, .05, 'square', .025);
  timerInterval = setInterval(() => {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, 3000 - elapsed);
    const display = Math.max(1, Math.ceil(remaining / 1000));
    if (timerNumber.textContent !== String(display)) {
      timerNumber.textContent = String(display);
      beep(display === 1 ? 700 : 520, .05, 'square', .022);
    }
    timerNumber.classList.toggle('danger', remaining <= 1000);
  }, 70);

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
  loadingBadge.textContent = '포켓몬 등장 중...';

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
    } else {
      loadingBadge.textContent = '다시 불러오는 중...';
      nextHandle = setTimeout(() => {
        if (token !== questionToken) return;
        pokemonImage.dataset.fallback = '0';
        pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
      }, 450);
    }
  };

  pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
}

function showQuestion() {
  clearTimers();
  locked = true;
  feedbackStamp.className = 'feedback-stamp';
  const token = ++questionToken;
  current = questions[questionIndex];

  questionNow.textContent = String(questionIndex + 1);
  questionTotal.textContent = String(questions.length);
  progressBar.style.width = `${(questionIndex / questions.length) * 100}%`;
  scoreText.textContent = String(score);
  streakText.textContent = String(streak);
  resetTimerVisual();
  renderAnswers(current);
  [...answersEl.children].forEach(button => button.disabled = true);
  loadQuestionImage(current, token);
}

function chooseAnswer(selectedId) {
  if (locked) return;
  locked = true;
  clearInterval(timerInterval);
  clearTimeout(timeoutHandle);
  timerBar.classList.remove('running');
  const isCorrect = selectedId === current.id;

  if (isCorrect) {
    score += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    showStamp('정답!', true);
    successSound();
  } else {
    streak = 0;
    showStamp('아쉽다!', false);
    wrongSound();
  }

  scoreText.textContent = String(score);
  streakText.textContent = String(streak);
  setAnswerState(selectedId, false);
  nextHandle = setTimeout(nextQuestion, 850);
}

function handleTimeout() {
  locked = true;
  clearInterval(timerInterval);
  timerBar.classList.remove('running');
  timerBar.style.transform = 'scaleX(0)';
  timerNumber.textContent = '0';
  timerNumber.classList.add('danger');
  streak = 0;
  streakText.textContent = '0';
  setAnswerState(null, true);
  showStamp('시간 끝!', false);
  wrongSound();
  nextHandle = setTimeout(nextQuestion, 900);
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
  if (ratio >= .4) return '잘했어! 다시 하면 기록을 더 올릴 수 있어!';
  return '괜찮아! 포켓몬을 하나씩 더 알아가 보자!';
}

function finishGame() {
  clearTimers();
  progressBar.style.width = '100%';
  const ratio = score / questions.length;
  const accuracy = Math.round(ratio * 100);
  document.getElementById('finalScore').textContent = String(score);
  document.getElementById('finalTotal').textContent = `/ ${questions.length}`;
  document.getElementById('accuracyText').textContent = `${accuracy}%`;
  document.getElementById('bestStreakText').textContent = String(bestStreak);
  document.getElementById('resultMessage').textContent = getResultMessage(ratio);
  document.getElementById('resultBadge').textContent = ratio >= .8 ? 'POKÉMON MASTER' : ratio >= .5 ? 'ACE TRAINER' : 'POKÉMON TRAINER';
  switchScreen('result');
  if (ratio >= .8) successSound();
}

function startGame() {
  clearTimers();
  beep(540, .06, 'triangle', .025);
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
    countButtons.forEach(b => {
      const selected = b === button;
      b.classList.toggle('selected', selected);
      b.setAttribute('aria-checked', String(selected));
    });
    beep(420, .05, 'triangle', .02);
  });
});

startButton.addEventListener('click', startGame);
homeButton.addEventListener('click', goHome);
retryButton.addEventListener('click', startGame);
changeCountButton.addEventListener('click', goHome);
soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  soundButton.textContent = soundOn ? '🔊' : '🔇';
  soundButton.setAttribute('aria-label', soundOn ? '소리 끄기' : '소리 켜기');
  if (soundOn) beep(620, .06, 'triangle', .025);
});

window.addEventListener('keydown', event => {
  if (!screens.quiz.classList.contains('active') || locked) return;
  const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
  if (event.key in keyMap) {
    const button = answersEl.children[keyMap[event.key]];
    if (button) button.click();
  }
});
