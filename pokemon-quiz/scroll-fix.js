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

    // iOS Safari can preserve the old result-screen scroll position after
    // a display:none/block screen swap. Reset immediately and again after
    // layout/toolbar reflow so the new screen always starts at its top.
    forceScrollTop();
    requestAnimationFrame(() => {
      forceScrollTop();
      requestAnimationFrame(forceScrollTop);
    });
    setTimeout(forceScrollTop, 80);
  };

  window.addEventListener('pageshow', () => {
    if (screens.start.classList.contains('active') || screens.quiz.classList.contains('active')) {
      forceScrollTop();
    }
  });
})();
