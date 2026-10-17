(() => {
  const root = document.documentElement;
  const body = document.body;
  const options = document.getElementById('gameOptions');

  const style = document.createElement('style');
  style.textContent = `
    html.app-gesture-lock,
    html.app-gesture-lock body {
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
    }

    html.app-gesture-lock .game-root {
      overscroll-behavior: none !important;
    }

    html.app-gesture-lock body.screen-start.options-open .game-options {
      overscroll-behavior-y: contain !important;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);

  let touchStartY = 0;

  function isLockedScreen() {
    return body.classList.contains('screen-start') || body.classList.contains('screen-quiz');
  }

  function syncLockClass() {
    root.classList.toggle('app-gesture-lock', isLockedScreen());
    if (isLockedScreen()) {
      try {
        window.scrollTo(0, 0);
        root.scrollTop = 0;
        body.scrollTop = 0;
      } catch (_) {}
    }
  }

  document.addEventListener('touchstart', event => {
    if (!isLockedScreen()) return;
    touchStartY = event.touches?.[0]?.clientY ?? 0;
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', event => {
    if (!isLockedScreen()) return;

    const target = event.target instanceof Element ? event.target : null;
    const optionScroller = body.classList.contains('screen-start') &&
      options?.open && target?.closest('.game-options') ? options : null;

    if (!optionScroller) {
      if (event.cancelable) event.preventDefault();
      return;
    }

    const currentY = event.touches?.[0]?.clientY ?? touchStartY;
    const deltaY = currentY - touchStartY;
    const atTop = optionScroller.scrollTop <= 0;
    const atBottom = Math.ceil(optionScroller.scrollTop + optionScroller.clientHeight) >= optionScroller.scrollHeight;

    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
      if (event.cancelable) event.preventDefault();
    }
  }, { passive: false, capture: true });

  document.addEventListener('touchend', () => {
    touchStartY = 0;
  }, { passive: true, capture: true });

  window.addEventListener('scroll', () => {
    if (!isLockedScreen()) return;
    try { window.scrollTo(0, 0); } catch (_) {}
  }, { passive: true });

  const observer = new MutationObserver(syncLockClass);
  observer.observe(body, { attributes: true, attributeFilter: ['class'] });

  options?.addEventListener('toggle', syncLockClass);
  window.addEventListener('pageshow', syncLockClass, { passive: true });

  syncLockClass();
})();
