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

  const genButtons = [...document.querySelectorAll('.gen-btn')];
  const optionSummaryText = document.getElementById('optionSummaryText');
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
    const count = document.querySelector('.count-btn.selected')?.dataset.count || '10';
    const time = document.querySelector('.time-btn.selected')?.dataset.time || '3';
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

  [...document.querySelectorAll('.count-btn, .time-btn')].forEach(button => {
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
  function forceScrollTop() {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (_) {}
  }

  const originalSwitchScreen = switchScreen;
  switchScreen = function switchScreenWithScrollReset(name) {
    originalSwitchScreen(name);
    forceScrollTop();
    requestAnimationFrame(() => {
      forceScrollTop();
      requestAnimationFrame(forceScrollTop);
    });
    setTimeout(forceScrollTop, 80);
  };
})();
