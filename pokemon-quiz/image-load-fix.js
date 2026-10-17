(() => {
  loadQuestionImage = function decodedQuestionImage(pokemon, token) {
    pokemonImage.classList.remove('ready');
    pokemonImage.removeAttribute('src');
    pokemonImage.alt = `${pokemon.name} 그림`;
    pokemonImage.dataset.fallback = '0';
    pokemonImage.decoding = 'async';
    pokemonImage.fetchPriority = 'high';
    loadingBadge.classList.remove('hidden');
    loadingBadge.textContent = 'SEARCHING...';

    let settled = false;
    let slowTimer = null;

    const beginAfterPaint = async () => {
      if (settled || token !== questionToken) return;

      try {
        if (typeof pokemonImage.decode === 'function') await pokemonImage.decode();
      } catch (_) {
        // onload + naturalWidth below is the final validity check.
      }

      if (settled || token !== questionToken) return;
      if (!pokemonImage.complete || pokemonImage.naturalWidth <= 0) return;

      settled = true;
      clearTimeout(slowTimer);
      pokemonImage.classList.add('ready');

      // Give Safari two paint frames before the timer becomes active.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (token !== questionToken) return;
          startCountdown(token);
        });
      });
    };

    const useSpriteFallback = () => {
      if (settled || token !== questionToken) return;
      if (pokemonImage.dataset.fallback === '1') {
        loadingBadge.textContent = 'RETRYING...';
        slowTimer = setTimeout(() => {
          if (settled || token !== questionToken) return;
          pokemonImage.dataset.fallback = '0';
          pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
        }, 500);
        return;
      }

      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    };

    pokemonImage.onload = beginAfterPaint;
    pokemonImage.onerror = useSpriteFallback;

    // If full artwork is slow on mobile data, switch to the much smaller sprite.
    slowTimer = setTimeout(() => {
      if (settled || token !== questionToken || pokemonImage.dataset.fallback === '1') return;
      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    }, 2200);

    pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
  };
})();