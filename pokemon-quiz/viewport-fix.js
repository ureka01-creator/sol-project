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

    body.screen-start.options-closed {
      height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      min-height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      max-height: calc(var(--vv-top, 0px) + var(--vv-height, 100dvh)) !important;
      overflow: hidden !important;
      overscroll-behavior: none;
    }

    body.screen-start.options-closed .game-root {
      height: var(--vv-height, 100dvh) !important;
      min-height: 0 !important;
      max-height: var(--vv-height, 100dvh) !important;
      margin-top: var(--vv-top, 0px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      padding: 8px 10px !important;
    }

    body.screen-start.options-closed .start-scene.active {
      width: min(100%, 900px);
      margin: 0 auto !important;
      overflow: visible !important;
      flex: 0 0 auto;
    }

    body.screen-start.options-open {
      height: auto !important;
      min-height: var(--vv-height, 100dvh) !important;
      max-height: none !important;
      overflow-y: auto !important;
      overscroll-behavior-y: auto;
    }

    body.screen-start.options-open .game-root {
      height: auto !important;
      min-height: var(--vv-height, 100dvh) !important;
      max-height: none !important;
      margin-top: 0 !important;
      display: grid !important;
      place-items: start center !important;
      align-content: start !important;
      overflow: visible !important;
      padding: max(8px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)) !important;
    }
  `;
  document.head.appendChild(style);

  function forceScrollTop() {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
  }

  function syncOptionsState() {
    const onStart = body.classList.contains('screen-start');
    const open = Boolean(gameOptions?.open);
    body.classList.toggle('options-open', onStart && open);
    body.classList.toggle('options-closed', onStart && !open);
    if (onStart && !open) forceScrollTop();
  }

  function syncScreenState(name) {
    const onStart = name === 'start';
    body.classList.toggle('screen-start', onStart);
    if (!onStart) body.classList.remove('options-open', 'options-closed');
    syncViewportMetrics();
    syncOptionsState();
  }

  function resyncViewport() {
    syncViewportMetrics();
    if (body.classList.contains('screen-start') && !gameOptions?.open) forceScrollTop();
  }

  gameOptions?.addEventListener('toggle', () => {
    syncOptionsState();
    requestAnimationFrame(resyncViewport);
    setTimeout(resyncViewport, 80);
  });

  const initialScreen = document.getElementById('startScreen')?.classList.contains('active') ? 'start' : 'quiz';
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