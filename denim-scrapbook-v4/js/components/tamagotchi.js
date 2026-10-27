/* Underwater Tamagotchi — three working buttons move the diver.
   Left  : swim one step left      Right : swim one step right
   Middle: return to centre; if already centred, she does a little somersault. */
(function () {
  const UI = window.UI;
  const STEPS = 2;          // how many steps she can swim each way
  const STEP_X = 22;        // distance per step (screen units, screen is 200 wide) — keeps her whole body inside the window
  const CENTER = { x: 100, y: 80 };

  /* gold pixel-diamond button faces (the arrow/dot shows what each one does) */
  const face = (glyph) => `<svg viewBox="0 0 50 50" aria-hidden="true" shape-rendering="crispEdges">
      <path d="M20 0 H30 V5 H35 V10 H40 V15 H45 V20 H50 V30 H45 V35 H40 V40 H35 V45 H30 V50 H20 V45 H15 V40 H10 V35 H5 V30 H0 V20 H5 V15 H10 V10 H15 V5 H20Z" fill="#D6A740"/>
      <path d="M20 5 H30 V10 H35 V15 H40 V20 H45 V30 H40 V35 H35 V40 H30 V45 H20 V40 H15 V35 H10 V30 H5 V20 H10 V15 H15 V10 H20Z" fill="#F6D27A"/>
      <path d="M20 10 H25 V15 H15 V20 H10 V25 H15 V20 H20Z" fill="#FFF0B8"/>
      ${glyph}</svg>`;
  const glyphs = {
    l: '<path d="M27 17 H30 V33 H27 V30 H24 V27 H21 V23 H24 V20 H27Z" fill="#8A6420"/>',
    r: '<path d="M20 17 H23 V20 H26 V23 H29 V27 H26 V30 H23 V33 H20Z" fill="#8A6420"/>',
    c: '<rect x="21" y="21" width="8" height="8" fill="#B06888"/>',
  };

  UI.tamagotchi = {
    html() {
      return `
      <div class="tama" data-tama>
        <svg class="tama-body" viewBox="0 0 300 362" aria-hidden="true" focusable="false">
          ${ART.tamagotchiBody()}
          <g clip-path="url(#tama-screen-clip)">
            <svg class="tama-screen" x="80" y="90" width="140" height="110" viewBox="0 8 200 157" preserveAspectRatio="xMidYMid slice" overflow="hidden">
              ${ART.tamagotchiScene()}
            </svg>
          </g>
          ${ART.tamagotchiGlass()}
        </svg>
        <div class="tama-buttons" role="group" aria-label="Diver controls">
          <button type="button" class="tama-btn tama-btn--l" data-act="left" aria-label="Swim left">${face(glyphs.l)}</button>
          <button type="button" class="tama-btn tama-btn--c" data-act="center" aria-label="Back to the middle, or do a somersault">${face(glyphs.c)}</button>
          <button type="button" class="tama-btn tama-btn--r" data-act="right" aria-label="Swim right">${face(glyphs.r)}</button>
        </div>
        <p class="sr-only" aria-live="polite" data-tama-status></p>
      </div>`;
    },

    /* Wire up a rendered device (called once for the live page) */
    init(root) {
      if (!root || root.dataset.ready) return;
      root.dataset.ready = '1';
      const pos = root.querySelector('.diver-pos');
      const face = root.querySelector('.diver-face');
      const spin = root.querySelector('.diver-spin');
      const status = root.querySelector('[data-tama-status]');
      let step = 0, facing = 1, swimTimer, spinning = false;

      const render = () => {
        pos.style.transform = `translate(${CENTER.x + step * STEP_X}px, ${CENTER.y}px)`;
        face.style.transform = `scaleX(${facing})`;
      };
      render();

      const swim = () => {
        root.classList.add('is-swimming');
        clearTimeout(swimTimer);
        swimTimer = setTimeout(() => root.classList.remove('is-swimming'), 900);
      };
      const bump = () => {
        root.classList.remove('is-bump');
        void root.offsetWidth;
        root.classList.add('is-bump');
      };

      const act = (a) => {
        if (a === 'left' || a === 'right') {
          const d = a === 'left' ? -1 : 1;
          facing = d;
          if (Math.abs(step + d) > STEPS) { bump(); render(); status.textContent = 'She is at the edge of the screen'; return; }
          step += d; swim();
          status.textContent = `Diver swam ${a}`;
        } else {
          if (step !== 0) { facing = step > 0 ? -1 : 1; step = 0; swim(); status.textContent = 'Diver is back in the middle'; }
          else if (!spinning) {
            spinning = true;
            root.classList.add('is-spin');
            status.textContent = 'Diver did a somersault';
            setTimeout(() => { root.classList.remove('is-spin'); spinning = false; }, UI.reducedMotion() ? 50 : 1100);
          }
        }
        render();
      };

      root.querySelectorAll('.tama-btn').forEach((b) => {
        b.addEventListener('click', () => act(b.dataset.act));
      });
      /* arrow keys work while any device button has focus */
      root.addEventListener('keydown', (e) => {
        if (!e.target.closest('.tama-btn')) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); act('left'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); act('right'); }
      });
    },
  };
})();
