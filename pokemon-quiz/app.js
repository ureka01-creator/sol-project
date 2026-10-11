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
const ANSWER_DELAY = 700;

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
const battleField = document.getElementById('battleField');
const pokemonImage = document.getElementById('pokemonImage');
const loadingBadge = document.getElementById('loadingBadge');
const feedbackStamp = document.getElementById('feedbackStamp');
const sparkLayer = document.getElementById('sparkLayer');
const messageLine = document.getElementById('messageLine');
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
    button.className = 'answer-btn';
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
  messageLine.textContent = '포켓몬의 이름은?';
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
retryButton.addEventListener('click', startGame);
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
