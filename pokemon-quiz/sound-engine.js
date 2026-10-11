(() => {
  const PQ_BAR_MS = 1680;
  const PQ_TITLE_BAR_MS = 2240;
  const PQ_SCALE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51
  };

  const titleMusicButton = document.getElementById('titleMusicButton');
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
    if (playing) titleMusicButton.textContent = '♪ BGM ON';
    else if (pqTitleEnabled && !soundOn) titleMusicButton.textContent = '♪ SOUND OFF';
    else titleMusicButton.textContent = '♪ BGM 시작';
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
