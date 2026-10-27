/* Spread 3 — Works: paper folders that open into a thumbnail carousel.
   All folders/projects come from SITE.works in content.js. */
(function () {
  const UI = window.UI;
  const TILTS = [-3, 2.5, -1.5, 3, -2, 1.5, -3, 2.4];
  /* folder fabrics (see .pat--* in css/sections.css); folders without a
     `pattern` in content.js take these in turn */
  const PATS = ['stripe-pink', 'gingham-blue', 'stripe-brown', 'stripe-stars', 'plaid'];
  const patOf = (f, i) => f.pattern || PATS[i % PATS.length];

  /* Desktop "scattered on the page" positions: centre x/y in % of the page,
     w = folder width in % of the page. Pages with more folders than listed
     here fall back to a neat 2-column grid. */
  const SCATTER = {
    left: {
      1: [{ x: 50, y: 60, w: 64 }],
      2: [{ x: 38, y: 50, w: 50 }, { x: 63, y: 74, w: 50 }],
      3: [{ x: 31, y: 46, w: 46 }, { x: 70, y: 54, w: 44 }, { x: 45, y: 80, w: 46 }],
    },
    right: {
      1: [{ x: 50, y: 50, w: 64 }],
      2: [{ x: 38, y: 34, w: 50 }, { x: 63, y: 70, w: 50 }],
      3: [{ x: 36, y: 27, w: 47 }, { x: 67, y: 50, w: 47 }, { x: 41, y: 73, w: 47 }],
      4: [{ x: 31, y: 28, w: 44 }, { x: 70, y: 34, w: 42 }, { x: 31, y: 68, w: 44 }, { x: 70, y: 74, w: 42 }],
    },
  };
  const listHTML = (items, offset, side) => {
    const pos = SCATTER[side][items.length];
    return `<ul class="folders ${pos ? 'is-scatter' : ''}">${items.map((f, i) => folderHTML(f, i + offset, pos && pos[i])).join('')}</ul>`;
  };

  const ratioOf = (aspect) => {
    const a = aspect || window.SITE.settings.works.defaultAspect || '16:9';
    if (a === 'auto') return null;
    const [w, h] = String(a).split(':').map(Number);
    return w && h ? w / h : 16 / 9;
  };
  const folders = () => window.SITE.works.folders || [];
  const findFolder = (id) => folders().find((f) => f.id === id);

  const folderHTML = (f, i, p) => {
    const n = (f.projects || []).length;
    const peeks = (f.projects || []).slice(0, 2)
      .map((p, k) => `<span class="peek peek--${k + 1}"><img src="${UI.esc(p.image)}" alt="" loading="lazy" decoding="async"></span>`).join('');
    return `
    <li class="folder-slot" style="--tilt:${TILTS[i % TILTS.length]}deg;${p ? `--fx:${p.x}%;--fy:${p.y}%;--fw:${p.w}%` : ''}">
      <a class="folder folder--${UI.esc(f.color || 'denim')} pat--${UI.esc(patOf(f, i))}" href="#works/${encodeURIComponent(f.id)}" data-folder="${UI.esc(f.id)}"
         aria-label="Open the ${UI.esc(f.name)} folder (${n} ${n === 1 ? 'project' : 'projects'})">
        <span class="folder-back" aria-hidden="true"><span class="folder-tab"></span></span>
        <span class="folder-papers" aria-hidden="true"><span class="paper-sheet"></span>${peeks}</span>
        <span class="folder-front" aria-hidden="true">
          <span class="folder-label">${UI.esc(f.name)}</span>
          <span class="folder-count">${n} ${n === 1 ? 'project' : 'projects'}</span>
        </span>
      </a>
    </li>`;
  };

  UI.works = {
    left() {
      const w = window.SITE.works, list = folders();
      const nLeft = Math.floor(list.length / 2);
      return `
      <div class="page page--left paper works-left">
        <header class="works-head">
          <span class="tape tape--title" aria-hidden="true"></span>
          <h2 class="lettering lettering--xl lettering--airy" tabindex="-1" data-focus>${UI.letters(w.title || 'Works', { seed: 1, bounce: 1.6 })}</h2>
          <span class="head-doodle head-doodle--stargrey" aria-hidden="true">${ART.doodle.starGrey()}</span>
          <p class="hand-note">${UI.esc(w.note || '')}</p>
        </header>
        <span class="deco-fixed deco-fixed--works-blue" aria-hidden="true">${ART.felt('blue')}</span>
        ${listHTML(list.slice(0, nLeft), 0, 'left')}
      </div>`;
    },

    right() {
      const list = folders();
      const nLeft = Math.floor(list.length / 2);
      return `
      <div class="page page--right paper works-right">
        <span class="deco-fixed deco-fixed--works-red" aria-hidden="true">${ART.felt('red')}</span>
        <p class="works-tip hand-note" aria-hidden="true">click one to peek inside</p>
        ${listHTML(list.slice(nLeft), nLeft, 'right')}
      </div>`;
    },

    init() {
      if (this._ready) return;
      this._ready = true;
      buildBrowser();
    },

    open: (id, opts) => openFolder(id, opts),
    close: (opts) => closeFolder(opts),
    isOpen: () => !!state.openId,
  };

  /* ===================== Folder browser ===================== */
  const state = { openId: null, busy: null, sourceEl: null };
  let fb, sheet, cover, track, prevBtn, nextBtn, titleEl, countEl;

  function buildBrowser() {
    fb = document.createElement('div');
    fb.className = 'fb';
    fb.hidden = true;
    fb.innerHTML = `
      <div class="fb-veil" data-close></div>
      <div class="fb-sheet" role="dialog" aria-modal="true" aria-labelledby="fb-title">
        <div class="fb-inside">
          <header class="fb-head">
            <a class="fb-back" href="#works" data-back><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4 L6 10 L12 16"/></svg><span>all folders</span></a>
            <div class="fb-titlebox"><h2 id="fb-title" class="fb-title" tabindex="-1"></h2><span class="fb-count"></span></div>
            <button class="fb-close" type="button" data-back aria-label="Close folder"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5 L15 15 M15 5 L5 15"/></svg></button>
          </header>
          <div class="fb-stage">
            <button class="fb-nav fb-prev" type="button" aria-label="Scroll to previous projects"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4 L6 10 L12 16"/></svg></button>
            <div class="fb-track" tabindex="0" aria-label="Projects — scroll sideways"></div>
            <button class="fb-nav fb-next" type="button" aria-label="Scroll to more projects"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4 L14 10 L8 16"/></svg></button>
          </div>
          <p class="fb-hint" aria-hidden="true">drag, swipe or scroll sideways · click a thumbnail to watch</p>
        </div>
        <div class="fb-cover" aria-hidden="true"><span class="folder-label"></span></div>
      </div>`;
    sheet = fb.querySelector('.fb-sheet');
    cover = fb.querySelector('.fb-cover');
    track = fb.querySelector('.fb-track');
    prevBtn = fb.querySelector('.fb-prev');
    nextBtn = fb.querySelector('.fb-next');
    titleEl = fb.querySelector('.fb-title');
    countEl = fb.querySelector('.fb-count');
    (document.querySelector('.pages') || document.body).appendChild(fb);

    fb.addEventListener('click', (e) => {
      if (e.target.closest('[data-back], [data-close]')) { e.preventDefault(); UI.works.requestClose(); }
    });
    document.addEventListener('keydown', (e) => {
      if (fb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); UI.works.requestClose(); }
      if (e.key === 'Tab') trapFocus(e);
    });
    prevBtn.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.7, behavior: UI.reducedMotion() ? 'auto' : 'smooth' }));
    nextBtn.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.7, behavior: UI.reducedMotion() ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    enableDragScroll(track);
  }

  /* close from inside the browser: go back in history if we pushed the entry */
  UI.works.requestClose = () => {
    if (state.pushed && history.length > 1) { state.pushed = false; history.back(); }
    else location.hash = '#works';
  };
  UI.works.markPushed = () => { state.pushed = true; };

  function thumbHTML(p, i) {
    const r = ratioOf(p.aspect);
    const title = p.title ? `<span class="thumb-title">${UI.txt(p.title)}</span>` : '';
    const meta = [p.category, p.date].filter(Boolean).map((m) => `<span class="thumb-meta">${UI.txt(m)}</span>`).join('');
    const desc = p.description ? `<span class="thumb-desc">${UI.txt(p.description)}</span>` : '';
    const label = (String(p.title || 'Project').replace(/[\[\]]/g, '')) + (p.url ? ' (opens in a new tab)' : ' (link coming soon)');
    const link = p.url
      ? `href="${UI.esc(p.url)}" target="_blank" rel="noopener noreferrer"`
      : `href="#" data-missing="link"`;
    return `
    <a class="thumb ${r && r < 1 ? 'is-portrait' : 'is-landscape'}" ${link} style="--r:${r || 16 / 9};--i:${i}" ${r ? '' : 'data-auto'} aria-label="${UI.esc(label)}" draggable="false">
      <span class="thumb-frame">
        <img src="${UI.esc(p.image)}" alt="${UI.esc(String(p.title || '').replace(/[\[\]]/g, ''))}" loading="lazy" decoding="async" draggable="false">
        <span class="thumb-play" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M7 5 L15 10 L7 15Z"/></svg></span>
        ${p.url ? '' : '<span class="thumb-soon" aria-hidden="true">link coming soon</span>'}
      </span>
      <span class="thumb-cap">${title}${meta}${desc}</span>
    </a>`;
  }

  function fill(f) {
    const n = (f.projects || []).length;
    titleEl.textContent = f.name;
    countEl.textContent = `${n} ${n === 1 ? 'project' : 'projects'}`;
    cover.querySelector('.folder-label').textContent = f.name;
    sheet.className = `fb-sheet folder--${f.color || 'denim'} pat--${patOf(f, folders().indexOf(f))}`;
    track.innerHTML = n ? f.projects.map(thumbHTML).join('') : '<p class="fb-empty">No projects in this folder yet — add some in js/content.js</p>';
    track.scrollLeft = 0;
    track.querySelectorAll('.thumb[data-auto] img').forEach((img) => {
      const set = () => img.naturalWidth && img.closest('.thumb').style.setProperty('--r', img.naturalWidth / img.naturalHeight);
      img.complete ? set() : img.addEventListener('load', set, { once: true });
    });
    requestAnimationFrame(updateNav);
  }

  function updateNav() {
    if (!track || fb.hidden) return;
    const max = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= max;
    fb.classList.toggle('no-overflow', max <= 0);
  }

  function rectFrom(el) {
    const a = el.getBoundingClientRect(), b = sheet.getBoundingClientRect();
    return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  }

  async function openFolder(id, { animate = true } = {}) {
    const f = findFolder(id);
    if (!f) return false;
    if (state.openId === id) return true;
    if (state.busy) await state.busy;
    if (state.openId) await closeFolder({ animate: false });
    state.openId = id;
    fill(f);
    fb.hidden = false;
    document.documentElement.classList.add('folder-open');
    state.sourceEl = document.querySelector(`.spread.is-current .folder[data-folder="${CSS.escape(id)}"]`);
    const motion = animate && !UI.reducedMotion();

    state.busy = (async () => {
      if (motion) {
        if (state.sourceEl) state.sourceEl.classList.add('is-lifted');
        fb.classList.add('is-opening');
        const from = state.sourceEl ? rectFrom(state.sourceEl) : 'scale(.92)';
        const a1 = sheet.animate([{ transform: from, opacity: state.sourceEl ? 1 : 0 }, { transform: 'none', opacity: 1 }],
          { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' });
        fb.querySelector('.fb-veil').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'both' });
        await a1.finished.catch(() => {});
        const a2 = cover.animate([{ transform: 'rotateY(0deg)', opacity: 1 }, { transform: 'rotateY(-150deg)', opacity: 1, offset: .85 }, { transform: 'rotateY(-170deg)', opacity: 0 }],
          { duration: 520, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
        await a2.finished.catch(() => {});
        fb.classList.remove('is-opening');
      }
      fb.classList.add('is-open');
      if (state.sourceEl) state.sourceEl.classList.remove('is-lifted');
      titleEl.focus({ preventScroll: true });
      updateNav();
    })();
    await state.busy;
    state.busy = null;
    return true;
  }

  async function closeFolder({ animate = true } = {}) {
    if (!state.openId) return;
    if (state.busy) await state.busy;
    const src = document.querySelector(`.spread.is-current .folder[data-folder="${CSS.escape(state.openId)}"]`);
    const motion = animate && !UI.reducedMotion() && !fb.hidden;
    state.busy = (async () => {
      fb.classList.remove('is-open');
      if (motion) {
        const a1 = cover.animate([{ transform: 'rotateY(-170deg)', opacity: 0 }, { transform: 'rotateY(-150deg)', opacity: 1, offset: .15 }, { transform: 'rotateY(0deg)', opacity: 1 }],
          { duration: 380, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
        await a1.finished.catch(() => {});
        const to = src ? rectFrom(src) : 'scale(.92)';
        fb.querySelector('.fb-veil').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: 'both' });
        const a2 = sheet.animate([{ transform: 'none', opacity: 1 }, { transform: to, opacity: src ? 1 : 0 }],
          { duration: 380, easing: 'cubic-bezier(.5,0,.75,0)' });
        await a2.finished.catch(() => {});
      }
      cover.getAnimations().forEach((a) => a.cancel());
      fb.querySelector('.fb-veil').getAnimations().forEach((a) => a.cancel());
      fb.hidden = true;
      document.documentElement.classList.remove('folder-open');
      track.innerHTML = '';
      state.openId = null;
      state.pushed = false;
      if (src && animate) src.focus({ preventScroll: true });
    })();
    await state.busy;
    state.busy = null;
  }

  function trapFocus(e) {
    const f = [...sheet.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Drag-to-scroll with the mouse; touch keeps native swiping. */
  function enableDragScroll(el) {
    let down = false, moved = false, startX = 0, startLeft = 0, id = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft; id = e.pointerId;
    });
    el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; el.classList.add('is-dragging'); el.setPointerCapture(id); }
      if (moved) el.scrollLeft = startLeft - dx;
    });
    const end = () => {
      if (!down) return;
      down = false;
      if (moved) {
        el.classList.remove('is-dragging');
        setTimeout(() => (moved = false), 0);
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    el.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }, { passive: false });
  }
})();
