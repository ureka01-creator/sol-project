(() => {
  const root = document.documentElement;
  const options = document.getElementById('gameOptions');

  const style = document.createElement('style');
  style.textContent = `
    body.screen-start.options-closed {
      height: var(--visual-height, 100dvh) !important;
      min-height: var(--visual-height, 100dvh) !important;
      max-height: var(--visual-height, 100dvh) !important;
      overflow: hidden !important;
    }

    body.screen-start.options-closed .game-root {
      height: var(--visual-height, 100dvh) !important;
      min-height: var(--visual-height, 100dvh) !important;
      max-height: var(--visual-height, 100dvh) !important;
      display: grid !important;
      place-items: center !important;
      align-content: center !important;
      overflow: hidden !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    body.screen-start.options-closed .start-scene.active {
      width: min(100%, 900px);
      margin: 0 auto !important;
      max-height: calc(var(--visual-height, 100dvh) - 16px) !important;
      overflow: visible !important;
    }

    body.screen-start.options-open .game-root {
      place-items: start center !important;
      align-content: start !important;
    }
  `;
  document.head.appendChild(style);

  function updateVisualHeight() {
    const viewport = window.visualViewport;
    const height = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight);
    if (height > 0) root.style.setProperty('--visual-height', `${height}px`);
  }

  function recenterClosedOptions() {
    updateVisualHeight();
    if (!document.body.classList.contains('screen-start') || options?.open) return;
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (_) {}
  }

  updateVisualHeight();
  recenterClosedOptions();

  window.addEventListener('resize', recenterClosedOptions, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(recenterClosedOptions, 80), { passive: true });
  window.visualViewport?.addEventListener('resize', recenterClosedOptions, { passive: true });
  window.visualViewport?.addEventListener('scroll', recenterClosedOptions, { passive: true });

  options?.addEventListener('toggle', () => {
    requestAnimationFrame(recenterClosedOptions);
    setTimeout(recenterClosedOptions, 80);
  });
})();
