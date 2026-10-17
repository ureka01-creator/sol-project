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

    /* Main and quiz share the exact same outer frame. */
    .start-scene,
    .quiz-scene {
      width: min(100%, 860px) !important;
    }

    /* Safari visualViewport.height is already the visible area.
       Do not add visualViewport.offsetTop again. */
    body.screen-start,
    body.screen-quiz {
      height: var(--vv-height, 100dvh) !important;
      min-height: var(--vv-height, 100dvh) !important;
      max-height: var(--vv-height, 100dvh) !important;
      overflow: hidden !important;
      overscroll-behavior: none;
    }

    body.screen-start .game-root,
    body.screen-quiz .game-root {
      width: 100%;
      height: var(--vv-height, 100dvh) !important;
      min-height: 0 !important;
      max-height: var(--vv-height, 100dvh) !important;
      margin: 0 !important;
      padding: 8px 10px !important;
      overflow: hidden !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    body.screen-start .start-scene.active,
    body.screen-quiz .quiz-scene.active {
      width: min(100%, 860px) !important;
      height: calc(var(--vv-height, 100dvh) - 16px) !important;
      min-height: 0 !important;
      max-height: calc(var(--vv-height, 100dvh) - 16px) !important;
      margin: 0 auto !important;
      overflow: hidden !important;
      flex: 0 0 auto;
    }

    /* MAIN: same total height as in-game. */
    body.screen-start .start-panel {
      height: 100%;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    body.screen-start .start-top {
      flex: 0 0 auto;
    }

    body.screen-start .start-display {
      flex: 1 1 auto;
      min-height: 0;
      margin: 10px 14px;
      display: flex;
      flex-direction: column;
    }

    body.screen-start .start-copy {
      flex: 0 0 auto;
      padding-top: 14px;
      padding-bottom: 2px;
    }

    body.screen-start .starter-stage {
      flex: 1 1 auto;
      min-height: 0;
      height: auto !important;
      align-items: center !important;
      padding-bottom: 4px;
    }

    body.screen-start .starter-stage img,
    body.screen-start .starter-stage .starter-main {
      width: min(28vw, 188px) !important;
      height: min(28vw, 188px) !important;
      max-width: 30%;
      max-height: 92% !important;
      object-fit: contain;
    }

    body.screen-start .start-controls {
      flex: 0 0 auto;
      padding: 10px 14px 12px;
    }

    body.screen-start .title-music-btn {
      margin-bottom: 8px;
    }

    body.screen-start .game-options {
      margin-bottom: 8px;
    }

    body.screen-start .start-btn {
      margin-top: 0;
    }

    /* Opening options keeps the same frame and scrolls only the options card. */
    body.screen-start.options-open .start-display {
      flex: 0 0 auto;
      margin-top: 8px;
      margin-bottom: 8px;
    }

    body.screen-start.options-open .start-copy {
      padding: 8px 16px 7px;
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
      overflow: hidden;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    body.screen-start.options-open .title-music-btn {
      flex: 0 0 auto;
      min-height: 38px;
      margin-bottom: 7px;
    }

    body.screen-start.options-open .game-options {
      flex: 1 1 0;
      min-height: 0;
      display: block;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      margin-bottom: 7px;
    }

    body.screen-start.options-open .game-options::-webkit-scrollbar {
      display: none;
    }

    body.screen-start.options-open .game-options > summary {
      position: sticky;
      top: 0;
      z-index: 3;
      background: #f4f0df;
    }

    body.screen-start.options-open .options-body {
      height: auto !important;
      overflow: visible !important;
    }

    body.screen-start.options-open .start-btn {
      flex: 0 0 auto;
      margin-top: 0;
    }

    /* QUIZ: one measured viewport, no page scrolling. */
    body.screen-quiz .game-frame {
      height: 100%;
      min-height: 0;
      max-height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 7px;
    }

    body.screen-quiz .hud,
    body.screen-quiz .progress-line {
      flex: 0 0 auto;
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
      margin: 5px 0;
    }

    @media (max-width: 620px) {
      body.screen-start .start-copy h1 {
        font-size: clamp(38px, 10vw, 52px);
      }

      body.screen-start .start-top {
        min-height: 42px;
        padding-top: 7px;
        padding-bottom: 7px;
      }

      body.screen-start .title-music-btn {
        min-height: 42px;
      }

      body.screen-start .game-options > summary {
        min-height: 48px;
      }

      body.screen-start .start-btn {
        min-height: 52px;
      }

      body.screen-quiz .hud-btn,
      body.screen-quiz .hud-center,
      body.screen-quiz .hud-score {
        min-height: 38px;
      }

      body.screen-quiz .game-frame,
      body.screen-quiz .battle-stage {
        padding: 6px;
      }

      body.screen-quiz .streak-line {
        margin-bottom: 4px;
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

  function readViewportHeight() {
    const viewport = window.visualViewport;
    return Math.max(1, Math.round(viewport?.height || window.innerHeight || root.clientHeight));
  }

  function syncViewportMetrics() {
    root.style.setProperty('--vv-height', `${readViewportHeight()}px`);
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
})();