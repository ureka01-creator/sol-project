(() => {
  const PQ_BAR_MS = 1680;
  const PQ_SCALE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51
  };

  let pqBgmTimer = null;
  let pqBgmVoices = new Set();
  let pqTimeoutMode = false;
  let pqQuestionSerial = 0;

  function pqEnsureAudio() {
    if (!soundOn) return null;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (_) {
      return null;
    }
  }

  function pqToneAt(freq, delay = 0, duration = .08, type = 'square', volume = .018, bgm = false, detune = 0) {
    const ctx = pqEnsureAudio();
    if (!ctx) return null;

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
    osc.stop(t1 + .015);

    if (bgm) {
      pqBgmVoices.add(osc);
      osc.addEventListener('ended', () => pqBgmVoices.delete(osc), { once: true });
    }
    return osc;
  }

  function pqNoise(delay = 0, duration = .045, volume = .008) {
    const ctx = pqEnsureAudio();
    if (!ctx) return;

    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + delay;
    const t1 = t0 + duration;

    filter.type = 'highpass';
    filter.frequency.value = 1700;
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(.0001, t1);

    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(t0);
    source.stop(t1 + .01);
  }

  function pqMenuTick() {
    pqToneAt(PQ_SCALE.E5, 0, .028, 'square', .008);
    pqToneAt(PQ_SCALE.A5, .018, .03, 'square', .006);
  }

  function pqConfirm() {
    pqToneAt(PQ_SCALE.C5, 0, .045, 'square', .012);
    pqToneAt(PQ_SCALE.E5, .045, .055, 'square', .013);
    pqToneAt(PQ_SCALE.G5, .095, .07, 'square', .014);
  }

  function pqStartJingle() {
    const notes = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6];
    notes.forEach((note, i) => pqToneAt(note, i * .055, .085, i === 3 ? 'triangle' : 'square', .018));
    pqNoise(.17, .035, .004);
  }

  function pqQuestionCue() {
    const serial = ++pqQuestionSerial;
    pqToneAt(PQ_SCALE.G4, 0, .035, 'square', .009);
    pqToneAt(PQ_SCALE.C5, .035, .04, 'square', .011);
    pqToneAt(PQ_SCALE.E5, .075, .055, 'square', .011);
    setTimeout(() => {
      if (serial !== pqQuestionSerial || !screens.quiz.classList.contains('active')) return;
      pqToneAt(PQ_SCALE.G5, 0, .035, 'square', .007);
    }, 125);
  }

  function pqTimerReady() {
    pqToneAt(PQ_SCALE.C6, 0, .035, 'square', .009);
    pqToneAt(PQ_SCALE.G5, .04, .045, 'square', .006);
  }

  function pqAnswerTap() {
    pqNoise(0, .025, .004);
    pqToneAt(PQ_SCALE.D5, 0, .035, 'square', .009);
  }

  function pqCorrect() {
    const melody = [PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6];
    melody.forEach((note, i) => pqToneAt(note, i * .055, .10, i > 1 ? 'triangle' : 'square', .021));
    pqToneAt(PQ_SCALE.C5, .11, .14, 'square', .008);
    pqNoise(.16, .045, .004);
  }

  function pqWrong() {
    pqToneAt(PQ_SCALE.E4, 0, .085, 'square', .014);
    pqToneAt(PQ_SCALE.D4, .072, .09, 'square', .013);
    pqToneAt(PQ_SCALE.C4, .145, .13, 'sawtooth', .009);
  }

  function pqTimeout() {
    pqToneAt(PQ_SCALE.G4, 0, .05, 'square', .012);
    pqToneAt(PQ_SCALE.G4, .07, .05, 'square', .011);
    pqToneAt(PQ_SCALE.C4, .145, .16, 'sawtooth', .009);
    pqNoise(.14, .07, .006);
  }

  function pqResultFanfare() {
    if (!soundOn) return;
    pqStopBgm();
    const melody = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6];
    const times = [0, .08, .16, .25, .37, .45, .57];
    melody.forEach((note, i) => pqToneAt(note, times[i], i === melody.length - 1 ? .28 : .11, i >= 3 ? 'triangle' : 'square', .018));
    pqToneAt(PQ_SCALE.C4, .25, .45, 'square', .006);
    pqToneAt(PQ_SCALE.G4, .25, .45, 'square', .005);
  }

  function pqScheduleBgmBar() {
    if (!soundOn || !screens.quiz.classList.contains('active')) return;
    const step = .21;
    const lead = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.E5, PQ_SCALE.D5, PQ_SCALE.F5, PQ_SCALE.G5, PQ_SCALE.D5];
    const bass = [PQ_SCALE.C4, PQ_SCALE.C4, PQ_SCALE.F4, PQ_SCALE.G4];

    lead.forEach((note, i) => {
      pqToneAt(note, i * step, .075, 'square', .0038, true, i % 2 ? -4 : 0);
    });
    bass.forEach((note, i) => {
      pqToneAt(note, i * step * 2, .15, 'triangle', .0032, true);
    });
  }

  function pqStartBgm() {
    if (!soundOn || pqBgmTimer || !screens.quiz.classList.contains('active')) return;
    pqScheduleBgmBar();
    pqBgmTimer = setInterval(pqScheduleBgmBar, PQ_BAR_MS);
  }

  function pqStopBgm() {
    if (pqBgmTimer) clearInterval(pqBgmTimer);
    pqBgmTimer = null;
    pqBgmVoices.forEach(osc => {
      try { osc.stop(); } catch (_) {}
    });
    pqBgmVoices.clear();
  }

  const pqOriginalSwitchScreen = switchScreen;
  switchScreen = function pqSwitchScreen(name) {
    pqOriginalSwitchScreen(name);
    if (name === 'quiz') {
      setTimeout(pqStartBgm, 180);
    } else {
      pqStopBgm();
    }
    if (name === 'result') setTimeout(pqResultFanfare, 70);
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
    if (freq === 420 && duration <= .04) {
      pqMenuTick();
      return;
    }
    if (freq === 540) {
      pqStartJingle();
      return;
    }
    if (freq === 520 && duration <= .045) {
      pqTimerReady();
      return;
    }
    if (freq === 520) {
      pqConfirm();
      return;
    }
    pqToneAt(freq, 0, duration, type, Math.min(volume, .018));
  };

  successSound = function pqSuccessSound() {
    if (screens.result.classList.contains('active')) {
      pqToneAt(PQ_SCALE.C6, 0, .08, 'triangle', .010);
      return;
    }
    pqCorrect();
  };

  wrongSound = function pqWrongSound() {
    if (pqTimeoutMode) pqTimeout();
    else pqWrong();
  };

  soundButton.addEventListener('click', () => {
    if (soundOn) {
      pqConfirm();
      if (screens.quiz.classList.contains('active')) setTimeout(pqStartBgm, 100);
    } else {
      pqStopBgm();
    }
  });

  homeButton.addEventListener('click', () => {
    if (soundOn) pqToneAt(PQ_SCALE.C5, 0, .045, 'square', .009);
    pqStopBgm();
  });

  changeCountButton.addEventListener('click', pqStopBgm);
  window.addEventListener('pagehide', pqStopBgm);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pqStopBgm();
    else if (soundOn && screens.quiz.classList.contains('active')) pqStartBgm();
  });
})();
