(() => {
  const timeButtons = [...document.querySelectorAll('.time-btn')];
  const subtitle = document.querySelector('.start-copy p');
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
    messageLine.textContent = '포켓몬의 이름은?';
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
