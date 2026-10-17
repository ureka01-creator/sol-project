(() => {
  const resultPanel = document.querySelector('#resultScreen .result-panel');
  const resultActions = document.querySelector('#resultScreen .result-actions');
  if (!resultPanel || !resultActions) return;

  const style = document.createElement('style');
  style.textContent = `
    .review-panel {
      margin: 0 14px 14px;
      border: 4px solid #0f1114;
      background: #f4f0df;
    }
    .review-panel > summary {
      list-style: none;
      cursor: pointer;
      user-select: none;
    }
    .review-panel > summary::-webkit-details-marker { display: none; }
    .review-head {
      min-height: 58px;
      padding: 12px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 10px;
    }
    .review-panel[open] .review-head { border-bottom: 3px solid #0f1114; }
    .review-head strong {
      font-size: 17px;
      font-weight: 1000;
    }
    .review-count {
      justify-self: end;
      font: 900 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #53604d;
      white-space: nowrap;
    }
    .review-chevron {
      font-size: 13px;
      transition: transform .16s ease;
    }
    .review-panel[open] .review-chevron { transform: rotate(90deg); }
    .review-filters {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-bottom: 3px solid #0f1114;
    }
    .review-filter {
      min-height: 42px;
      border: 0;
      border-right: 2px solid #0f1114;
      background: #fffdf4;
      color: #1d2024;
      font-weight: 900;
      cursor: pointer;
    }
    .review-filter:last-child { border-right: 0; }
    .review-filter.active { background: #efc64b; }
    .review-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
    }
    .review-item {
      min-height: 92px;
      display: grid;
      grid-template-columns: 34px 68px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-bottom: 2px solid #0f1114;
      background: #fffdf4;
    }
    .review-item:nth-child(odd) { border-right: 2px solid #0f1114; }
    .review-item.correct { box-shadow: inset 6px 0 0 #2d7045; }
    .review-item.wrong { box-shadow: inset 6px 0 0 #b12b24; }
    .review-number {
      text-align: center;
      font: 900 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #53604d;
    }
    .review-sprite {
      width: 64px;
      height: 64px;
      object-fit: contain;
      image-rendering: auto;
    }
    .review-info { min-width: 0; }
    .review-name {
      display: block;
      font-weight: 1000;
      font-size: 17px;
      line-height: 1.15;
      margin-bottom: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .review-answer {
      display: block;
      font-size: 12px;
      line-height: 1.3;
      color: #6b655b;
      overflow-wrap: anywhere;
    }
    .review-status {
      min-width: 46px;
      padding: 6px 5px;
      border: 2px solid #0f1114;
      text-align: center;
      font: 1000 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .review-item.correct .review-status { background: #d6eadb; color: #205536; }
    .review-item.wrong .review-status { background: #f2d5d1; color: #8d221e; }
    .review-empty {
      grid-column: 1 / -1;
      padding: 22px 12px;
      text-align: center;
      font-weight: 900;
      color: #6b655b;
    }
    @media (max-width: 640px) {
      .review-list { grid-template-columns: 1fr; }
      .review-item:nth-child(odd) { border-right: 0; }
      .review-item { grid-template-columns: 30px 58px minmax(0, 1fr) auto; min-height: 82px; padding: 7px 8px; }
      .review-sprite { width: 54px; height: 54px; }
      .review-name { font-size: 16px; }
      .review-head { min-height: 54px; padding: 10px; }
      .review-count { font-size: 10px; }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('details');
  panel.className = 'review-panel';
  panel.setAttribute('aria-label', '출제 문제 확인');
  panel.innerHTML = `
    <summary class="review-head">
      <strong>출제 문제 확인</strong>
      <span id="reviewCount" class="review-count">0문제</span>
      <span class="review-chevron" aria-hidden="true">▶</span>
    </summary>
    <div class="review-filters" role="tablist" aria-label="결과 필터">
      <button class="review-filter active" type="button" data-filter="all">전체</button>
      <button class="review-filter" type="button" data-filter="correct">맞힌 문제</button>
      <button class="review-filter" type="button" data-filter="wrong">틀린 문제</button>
    </div>
    <div id="reviewList" class="review-list"></div>
  `;
  resultPanel.insertBefore(panel, resultActions);

  const reviewList = panel.querySelector('#reviewList');
  const reviewCount = panel.querySelector('#reviewCount');
  const filterButtons = [...panel.querySelectorAll('.review-filter')];
  const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  let attempts = [];
  let activeFilter = 'all';

  function closeReview() {
    panel.open = false;
  }

  function resetAttempts() {
    attempts = [];
    activeFilter = 'all';
    closeReview();
    filterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
    renderAttempts();
  }

  function findAnswerName(id) {
    if (id == null) return '';
    const button = [...answersEl.children].find(item => Number(item.dataset.id) === Number(id));
    return button?.textContent?.trim() || POKEMON.find(item => item.id === Number(id))?.name || '';
  }

  function recordAttempt(selectedId, timedOut = false) {
    if (!current) return;
    const expectedIndex = questionIndex;
    if (attempts.some(item => item.questionIndex === expectedIndex)) return;

    attempts.push({
      questionIndex: expectedIndex,
      id: current.id,
      name: current.name,
      correct: !timedOut && Number(selectedId) === current.id,
      timedOut,
      selectedId: timedOut ? null : Number(selectedId),
      selectedName: timedOut ? '' : findAnswerName(selectedId)
    });
  }

  function renderAttempts() {
    if (!reviewList) return;
    const filtered = attempts.filter(item => {
      if (activeFilter === 'correct') return item.correct;
      if (activeFilter === 'wrong') return !item.correct;
      return true;
    });

    const correctCount = attempts.filter(item => item.correct).length;
    reviewCount.textContent = `${attempts.length}문제 · 정답 ${correctCount} · 오답 ${attempts.length - correctCount}`;

    if (!filtered.length) {
      reviewList.innerHTML = '<div class="review-empty">해당하는 문제가 없어.</div>';
      return;
    }

    reviewList.innerHTML = filtered.map(item => {
      const status = item.correct ? '정답' : '오답';
      let answerText = '정답 처리';
      if (!item.correct && item.timedOut) answerText = '시간 초과';
      else if (!item.correct) answerText = `내 답: ${item.selectedName || '선택 없음'}`;

      return `
        <article class="review-item ${item.correct ? 'correct' : 'wrong'}">
          <span class="review-number">${String(item.questionIndex + 1).padStart(2, '0')}</span>
          <img class="review-sprite" src="${spriteBase}${item.id}.png" alt="" loading="lazy" />
          <div class="review-info">
            <strong class="review-name">${item.name}</strong>
            <span class="review-answer">${answerText}</span>
          </div>
          <span class="review-status">${status}</span>
        </article>
      `;
    }).join('');
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      renderAttempts();
    });
  });

  startButton.addEventListener('click', resetAttempts, true);
  retryButton.addEventListener('click', resetAttempts, true);

  const originalChooseAnswer = chooseAnswer;
  chooseAnswer = function chooseAnswerWithHistory(selectedId) {
    if (!locked) recordAttempt(selectedId, false);
    originalChooseAnswer(selectedId);
  };

  const originalHandleTimeout = handleTimeout;
  handleTimeout = function handleTimeoutWithHistory() {
    if (!locked) recordAttempt(null, true);
    originalHandleTimeout();
  };

  const originalFinishGame = finishGame;
  finishGame = function finishGameWithHistory() {
    originalFinishGame();
    activeFilter = 'all';
    filterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
    renderAttempts();
    closeReview();
  };

  resetAttempts();
})();
