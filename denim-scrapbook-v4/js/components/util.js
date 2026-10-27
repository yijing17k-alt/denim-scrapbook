/* Small shared helpers used by every component. */
(function () {
  const UI = (window.UI = window.UI || {});

  UI.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* "[Like this]" in content.js = placeholder → shown softly, without brackets */
  UI.isPh = (s) => typeof s === 'string' && /^\s*\[.*\]\s*$/.test(s);
  UI.txt = (s) => (UI.isPh(s) ? `<span class="is-ph">${UI.esc(String(s).trim().slice(1, -1))}</span>` : UI.esc(s));

  /* Sticker lettering (the PDF's outlined, bouncy hand-cut headings).
     Returns the visible letters plus a screen-reader copy of the text.
     bounce: 1 = default, 0 = flat. Words never break mid-word. */
  const JIT = [[-2, -3], [3, 2], [-1, -1], [2, 4], [-3, 0], [1, -3], [3, 2], [-2, 2], [2, -2], [-1, 3], [0, 0], [2, -1]];
  UI.letters = (text, { bounce = 1, seed = 0 } = {}) => {
    let k = seed;
    const words = String(text || '').trim().split(/\s+/).map((w) => `<b class="lt-w">${[...w].map((ch) => {
      const [r, y] = JIT[k++ % JIT.length];
      return `<i data-c="${UI.esc(ch)}" style="--r:${(r * bounce).toFixed(1)}deg;--y:${(y * bounce * .012).toFixed(3)}em">${UI.esc(ch)}</i>`;
    }).join('')}</b>`).join(' ');
    return `<span class="sr-only">${UI.esc(text)}</span><span class="lt" aria-hidden="true">${words}</span>`;
  };

  UI.hint = (label = 'placeholder') =>
    window.SITE.settings.showPlaceholderHints ? `<span class="ph-hint" aria-hidden="true">${UI.esc(label)}</span>` : '';

  UI.reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  UI.isStacked = () => window.innerWidth < (window.SITE.settings.book.stackBelow || 900);

  /* Gentle toast for actions that aren't configured yet */
  let toastTimer;
  UI.toast = (msg) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
  };

  /* Résumé link attributes (shared by Education + Contact) */
  UI.resumeAttrs = () => {
    const r = window.SITE.resume || {};
    if (!r.file) return 'href="#" data-missing="resume"';
    return r.download ? `href="${UI.esc(r.file)}" download` : `href="${UI.esc(r.file)}" target="_blank" rel="noopener noreferrer"`;
  };

  /* Any link marked data-missing shows a helpful note instead of a dead click */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-missing]');
    if (!a) return;
    e.preventDefault();
    const what = a.dataset.missing;
    UI.toast(
      what === 'resume' ? 'Résumé not added yet — set resume.file in js/content.js'
      : what === 'email' ? 'Email not added yet — set contact.email in js/content.js'
      : what === 'link' ? 'Link coming soon — add the url in js/content.js'
      : 'Not set up yet'
    );
  });

  /* Push layout settings from content.js into CSS variables */
  UI.applySettings = () => {
    const s = window.SITE.settings, r = document.documentElement.style;
    r.setProperty('--book-max-w', s.book.maxWidth + 'px');
    r.setProperty('--book-aspect', s.book.aspect);
    r.setProperty('--ring-scale', s.spiral.ringSize);
    r.setProperty('--thumb-h', s.works.thumbHeight);
    r.setProperty('--thumb-h-mobile', s.works.thumbHeightMobile + 'px');
    r.setProperty('--thumb-gap', s.works.gap);
    r.setProperty('--thumb-border', s.works.frameBorder);
    r.setProperty('--thumb-max-w', s.works.maxFrameWidth);
    r.setProperty('--turn-ms', s.pageTurnMs + 'ms');
  };
})();
