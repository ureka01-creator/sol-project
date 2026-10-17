(() => {
  const root = document.documentElement;
  const body = document.body;
  const gameOptions = document.getElementById('gameOptions');

  const style = document.createElement('style');
  style.textContent = `
    html, body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    /* Main and quiz use exactly the same outer width. */
    .start-scene,
    .quiz-scene {
      width: min(100%, 860px) !important;
    }

    /* Lock interactive screens to Safari's measured visible viewport. */
    body.screen-start,
    body.screen-quiz {
      height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      min-height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      max-height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      overflow: hidden !important;
      overscroll-behavior: none;
    }

    body.screen-start .game-root,
    body.screen-quiz .game-root {
      width: 100%;
      height: var(--vv-height, 100dvh) !important;
      min-height: 0 !important;
      max-height: var(--vv-height, 100dvh) !important;
      margin-top: var(--vv-top, 0px) !important;
      padding: 8px 10px !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    body.screen-start .start-scene.active,
    body.screen-quiz .quiz-scene.active {
      margin: 0 auto !important;
      flex: 0 0 auto;
    }

    /* MAIN: closed options stays centered. */
    body.screen-start.options-closed .start-panel {
      max-height: calc(var(--vv-height, 100dvh) - 16px);
      overflow: hidden;
    }

    /* Short visible viewports: shrink the title screen itself, using measured viewport height. */
    body.vv-compact.screen-start.options-closed .start-display {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    body.vv-compact.screen-start.options-closed .start-copy {
      padding-top: 12px;
    }

    body.vv-compact.screen-start.options-closed .start-copy h1 {
      margin-top: 6px;
      font-size: 46px;
    }

    body.vv-compact.screen-start.options-closed .starter-stage {
      height: 170px;
    }

    body.vv-compact.screen-start.options-closed .starter-stage img,
    body.vv-compact.screen-start.options-closed .starter-stage .starter-main {
      width: 140px !important;
      height: 140px !important;
    }

    /* MAIN: opening options must not grow the whole page. */
    body.screen-start.options-open .start-scene.active {
      height: calc(var(--vv-height, 100dvh) - 16px);
      min-height: 0;
    }

    body.screen-start.options-open .start-panel {
      height: 100%;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    body.screen-start.options-open .start-top {
      flex: 0 0 auto;
    }

    body.screen-start.options-open .start-display {
      flex: 0 0 auto;
      min-height: 0;
      margin-top: 8px;
      margin-bottom: 8px;
    }

    body.screen-start.options-open .start-copy {
      padding: 10px 16px 8px;
    }

    body.screen-start.options-open .start-copy h1 {
      margin: 4px 0 0;
      font-size: 36px;
    }

    body.screen-start.options-open .starter-stage {
      display: none !important;
    }

    body.screen-start.options-open .start-controls {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding-top: 10px;
      padding-bottom: 10px;
      overflow: hidden;
    }

    body.screen-start.options-open .title-music-btn {
      flex: 0 0 auto;
      min-height: 38px;
      margin-bottom: 8px;
    }

    /* Scroll the option card itself so every setting remains reachable on short iPhones. */
    body.screen-start.options-open .game-options {
      flex: 1 1 0;
      min-height: 0;
      margin-bottom: 8px;
      display: block;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    body.screen-start.options-open .game-options::-webkit-scrollbar {
      display: none;
    }

    body.screen-start.options-open .game-options > summary {
      position: sticky;
      top: 0;
      z-index: 2;
      background: #f4f0df;
    }

    body.screen-start.options-open .options-body {
      height: auto !important;
      overflow: visible;
    }

    body.screen-start.options-open .start-btn {
      flex: 0 0 auto;
      margin-top: 0;
    }

    /* QUIZ: the whole game must fit in one measured viewport. */
    body.screen-quiz .quiz-scene.active {
      height: calc(var(--vv-height, 100dvh) - 16px);
      min-height: 0;
      max-height: calc(var(--vv-height, 100dvh) - 16px);
      overflow: hidden;
    }

    body.screen-quiz .game-frame {
      height: 100%;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 7px;
    }

    body.screen-quiz .hud {
      flex: 0 0 auto;
    }

    body.screen-quiz .progress-line {
      flex: 0 0 8px;
    }

    body.screen-quiz .battle-stage {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 7px;
    }

    body.screen-quiz .streak-line,
    body.screen-quiz .timer-panel,
    body.screen-quiz .command-box {
      flex: 0 0 auto;
    }

    body.screen-quiz .pokemon-stage {
      flex: 1 1 auto;
      min-height: 0 !important;
      height: auto !important;
      max-height: none !important;
    }

    body.screen-quiz .timer-panel {
      margin: 6px 0;
    }

    /* Keep four answers compact on phones, including narrow iPhones. */
    @media (max-width: 620px) {
      body.screen-quiz .hud-btn,
      body.screen-quiz .hud-center,
      body.screen-quiz .hud-score {
        min-height: 38px;
      }

      body.screen-quiz .game-frame {
        padding: 6px;
      }

      body.screen-quiz .battle-stage {
        padding: 6px;
      }

      body.screen-quiz .streak-line {
        margin-bottom: 4px;
      }

      body.screen-quiz .timer-panel {
        margin: 5px 0;
      }

      body.screen-quiz .message-line {
        min-height: 34px;
        padding: 5px 9px;
        font-size: 13px;
      }

      body.screen-quiz .answer-menu {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      body.screen-quiz .answer-btn {
        min-height: 52px !important;
        padding: 7px 8px 7px 40px;
        font-size: clamp(15px, 3.8vw, 20px);
        border-right: 2px solid #0f1114 !important;
        border-bottom: 2px solid #0f1114 !important;
      }

      body.screen-quiz .answer-btn:nth-child(even) {
        border-right: 0 !important;
      }

      body.screen-quiz .answer-btn:nth-last-child(-n+2) {
        border-bottom: 0 !important;
      }

      body.screen-quiz .answer-btn::before {
        left: 9px;
        width: 24px;
        height: 24px;
      }
    }
  `;
  document.head.appendChild(style);

  function forceScrollTop() {
    try {
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      body.scrollTop = 0;
    } catch (_) {}
  }

  function readViewport() {
    const viewport = window.visualViewport;
    const height = Math.max(1, Math.round(viewport?.height || window.innerHeight || root.clientHeight));
    const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
    return { height, top };
  }

  function syncViewportMetrics() {
    const { height, top } = readViewport();
    root.style.setProperty('--vv-height', `${height}px`);
    root.style.setProperty('--vv-top', `${top}px`);
    body.classList.toggle('vv-compact', height < 670);
  }

  function syncOptionsState() {
    const onStart = body.classList.contains('screen-start');
    const open = Boolean(gameOptions?.open);
    body.classList.toggle('options-open', onStart && open);
    body.classList.toggle('options-closed', onStart && !open);
  }

  function syncScreenState(name) {
    body.classList.toggle('screen-start', name === 'start');
    body.classList.toggle('screen-quiz', name === 'quiz');
    body.classList.toggle('screen-result', name === 'result');
    if (name !== 'start') body.classList.remove('options-open', 'options-closed');
    syncViewportMetrics();
    syncOptionsState();
    if (name === 'start' || name === 'quiz') forceScrollTop();
  }

  function resyncViewport() {
    syncViewportMetrics();
    if (body.classList.contains('screen-start') || body.classList.contains('screen-quiz')) {
      forceScrollTop();
    }
  }

  gameOptions?.addEventListener('toggle', () => {
    syncOptionsState();
    requestAnimationFrame(resyncViewport);
    setTimeout(resyncViewport, 80);
  });

  let initialScreen = 'result';
  if (document.getElementById('startScreen')?.classList.contains('active')) initialScreen = 'start';
  else if (document.getElementById('quizScreen')?.classList.contains('active')) initialScreen = 'quiz';
  syncScreenState(initialScreen);

  const originalSwitchScreen = switchScreen;
  switchScreen = function switchScreenWithMeasuredViewport(name) {
    originalSwitchScreen(name);
    syncScreenState(name);
    requestAnimationFrame(resyncViewport);
    setTimeout(resyncViewport, 80);
  };

  window.addEventListener('resize', resyncViewport, { passive: true });
  window.addEventListener('pageshow', resyncViewport, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(resyncViewport, 80), { passive: true });
  window.visualViewport?.addEventListener('resize', resyncViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', resyncViewport, { passive: true });
})();