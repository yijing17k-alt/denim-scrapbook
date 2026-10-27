/* Notebook shell — builds the book, tabs, spiral and handles navigation:
   hash URLs (#about, #education, #works, #works/<folder-id>, #contact),
   browser back/forward, page-turn animation, keyboard arrows and the
   opening animation. Section content comes from the other components. */
(function () {
  const UI = window.UI;
  const SECTIONS = ['about', 'education', 'works', 'contact'];
  const COMP = { about: () => UI.about, education: () => UI.education, works: () => UI.works, contact: () => UI.contact };

  let current = -1;
  let flipping = null;          // { anim, done }
  let queue = Promise.resolve();
  let spreads = [];
  let userNav = false;
  const BASE_TITLE = document.title;

  const $ = (s, r = document) => r.querySelector(s);

  /* ---------------------------------------------------------------- build */
  function build(app) {
    const S = window.SITE;
    const nRings = S.settings.spiral.rings, split = Math.ceil(nRings / 2);
    const rings = Array.from({ length: nRings }, (_, i) => `<span class="ring-slot${i === split - 1 ? ' ring-slot--split' : ''}">${ART.ring()}</span>`).join('');
    const tabs = SECTIONS.map((id, i) => `
      <li><a class="tab tab--${i + 1}" href="#${id}" data-tab="${id}"><span>${UI.esc(S.nav[id])}</span></a></li>`).join('');

    app.innerHTML = `
    <div class="desk">
      <div class="book" id="book">
        <nav class="tabs" aria-label="Notebook sections"><ul>${tabs}</ul></nav>
        <div class="case">
          <span class="case-stitch" aria-hidden="true"></span>
          <a class="strap" href="#" aria-label="Next page"><span class="strap-arrow">${ART.strapArrow()}</span></a>
          <div class="pages">
            ${SECTIONS.map((id) => `<section class="spread spread--${id}" data-section="${id}" aria-label="${UI.esc(S.nav[id])}">${COMP[id]().left()}${COMP[id]().right()}</section>`).join('')}
            <div class="spine" aria-hidden="true">${rings}</div>
            <a class="corner corner--prev" href="#" data-dir="-1"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4 L6 10 L12 16"/></svg><span></span></a>
            <a class="corner corner--next" href="#" data-dir="1"><span></span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4 L14 10 L8 16"/></svg></a>
          </div>
        </div>
      </div>
      <p class="kbd-hint" aria-hidden="true">tip: use ← → to turn pages</p>
    </div>`;

    spreads = [...app.querySelectorAll('.spread')];
    spreads.forEach((s) => { s.inert = true; COMP[s.dataset.section]().init(s); });
  }

  /* --------------------------------------------------------------- state */
  function setCurrent(idx) {
    spreads.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle('is-current', on);
      s.inert = !on;
      s.setAttribute('aria-hidden', String(!on));
    });
    current = idx;
    document.documentElement.dataset.section = SECTIONS[idx];
    document.querySelectorAll('[data-tab]').forEach((t) => {
      const on = t.dataset.tab === SECTIONS[idx];
      t.classList.toggle('is-active', on);
      on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
    });
    const prev = $('.corner--prev'), next = $('.corner--next');
    const p = SECTIONS[idx - 1], n = SECTIONS[idx + 1];
    prev.hidden = !p;
    if (p) { prev.href = '#' + p; prev.querySelector('span').textContent = window.SITE.nav[p]; prev.setAttribute('aria-label', 'Previous page: ' + window.SITE.nav[p]); }
    if (n) { next.href = '#' + n; next.querySelector('span').textContent = window.SITE.nav[n]; next.setAttribute('aria-label', 'Next page: ' + window.SITE.nav[n]); }
    else { next.href = '#about'; next.querySelector('span').textContent = 'back to start'; next.setAttribute('aria-label', 'Back to the first page'); }
    const strap = $('.strap');
    if (strap) { strap.href = next.getAttribute('href'); strap.setAttribute('aria-label', next.getAttribute('aria-label')); }
    document.title = `${window.SITE.nav[SECTIONS[idx]]} · ${BASE_TITLE}`;
    requestAnimationFrame(() => spreads[idx].classList.add('is-seen'));
  }

  function focusSpread(idx) {
    if (!userNav) return;
    const h = spreads[idx].querySelector('[data-focus]');
    if (h) h.focus({ preventScroll: true });
  }

  /* --------------------------------------------------------- transitions */
  function cloneFace(page, rect, padSide, half) {
    const c = page.cloneNode(true);
    c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    c.removeAttribute('id');
    c.classList.add('page-clone');
    c.style.cssText = `position:absolute;top:0;${padSide === 'left' ? `left:${half}px` : 'left:0'};width:${rect.width}px;height:${rect.height}px;visibility:visible;`;
    return c;
  }

  async function flipTo(to) {
    const from = current;
    const dir = to > from ? 1 : -1;
    const pages = $('.pages');
    const oldS = spreads[from], newS = spreads[to];
    const oL = oldS.querySelector('.page--left'), oR = oldS.querySelector('.page--right');
    const nL = newS.querySelector('.page--left'), nR = newS.querySelector('.page--right');
    const pr = pages.getBoundingClientRect(), lr = oL.getBoundingClientRect(), rr = oR.getBoundingClientRect();
    const half = (rr.left - lr.right) / 2;
    const spineX = lr.right + half - pr.left;

    newS.classList.add('is-under');
    newS.classList.add('is-seen-pending');

    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    const W = (dir > 0 ? rr.width : lr.width) + half;
    leaf.style.cssText = `top:${rr.top - pr.top}px;height:${rr.height}px;width:${W}px;left:${dir > 0 ? spineX : spineX - W}px;transform-origin:${dir > 0 ? 'left' : 'right'} center;`;
    const front = document.createElement('div'), back = document.createElement('div');
    front.className = 'leaf-face leaf-front';
    back.className = 'leaf-face leaf-back';
    if (dir > 0) { front.appendChild(cloneFace(oR, rr, 'left', half)); back.appendChild(cloneFace(nL, lr, 'right', half)); oR.style.visibility = 'hidden'; }
    else { front.appendChild(cloneFace(oL, lr, 'right', half)); back.appendChild(cloneFace(nR, rr, 'left', half)); oL.style.visibility = 'hidden'; }
    front.firstChild.insertAdjacentHTML('beforeend', '<span class="leaf-shade"></span>');
    back.firstChild.insertAdjacentHTML('beforeend', '<span class="leaf-shade"></span>');
    leaf.append(front, back);
    pages.appendChild(leaf);

    const ms = window.SITE.settings.pageTurnMs || 850;
    const ease = 'cubic-bezier(.45,.05,.25,1)';
    const anim = leaf.animate(
      [{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${dir > 0 ? -90 : 90}deg) translateZ(0)`, offset: .5 }, { transform: `rotateY(${dir > 0 ? -180 : 180}deg)` }],
      { duration: ms, easing: ease, fill: 'forwards' });
    front.querySelector('.leaf-shade').animate([{ opacity: 0 }, { opacity: .32 }], { duration: ms / 2, easing: 'ease-in', fill: 'forwards' });
    back.querySelector('.leaf-shade').animate([{ opacity: .32 }, { opacity: .32, offset: .5 }, { opacity: 0 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });

    let finalize;
    const done = new Promise((res) => (finalize = res));
    flipping = { anim, done };
    await anim.finished.catch(() => {});
    oL.style.visibility = oR.style.visibility = '';
    newS.classList.remove('is-under', 'is-seen-pending');
    oldS.classList.remove('is-seen');
    setCurrent(to);
    leaf.remove();
    flipping = null;
    finalize();
  }

  async function stackedTo(to) {
    const oldS = spreads[current], newS = spreads[to];
    const book = $('#book');
    const reduce = UI.reducedMotion();
    if (!reduce) {
      oldS.style.transformOrigin = '50% 0';
      const a = oldS.animate([{ transform: 'none', opacity: 1 }, { transform: 'perspective(1400px) rotateX(-14deg) translateY(-14px)', opacity: 0 }],
        { duration: 300, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
      flipping = { anim: a, done: a.finished.catch(() => {}) };
      await a.finished.catch(() => {});
      a.cancel();
    }
    oldS.classList.remove('is-seen');
    setCurrent(to);
    const top = book.getBoundingClientRect().top + window.scrollY - 8;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
    if (!reduce) newS.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    flipping = null;
  }

  async function goTo(idx, { animate = true } = {}) {
    if (idx === current) return;
    // highlight the destination tab straight away; aria-current follows when the page lands
    document.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === SECTIONS[idx]));
    if (current < 0 || !animate) { if (current >= 0) spreads[current].classList.remove('is-seen'); setCurrent(idx); return; }
    if (UI.isStacked()) await stackedTo(idx);
    else if (UI.reducedMotion()) {
      const n = spreads[idx];
      spreads[current].classList.remove('is-seen');
      setCurrent(idx);
      n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
    } else await flipTo(idx);
    focusSpread(idx);
  }

  /* ----------------------------------------------------------- routing */
  const parse = (hash) => {
    const [sec, folder] = decodeURIComponent((hash || '').replace(/^#\/?/, '')).split('/');
    return { sec: SECTIONS.includes(sec) ? sec : 'about', folder: folder || null };
  };

  async function route(initial = false) {
    const { sec, folder } = parse(location.hash);
    const idx = SECTIONS.indexOf(sec);
    if (UI.works.isOpen() && (sec !== 'works' || !folder)) await UI.works.close({ animate: sec === 'works' && !initial });
    if (idx !== current) await goTo(idx, { animate: !initial });
    if (sec === 'works' && folder) {
      const ok = await UI.works.open(folder, { animate: !initial });
      if (!ok) history.replaceState(null, '', '#works');
    }
  }

  function enqueue(initial) {
    if (flipping && flipping.anim) { try { flipping.anim.finish(); } catch (e) {} }
    queue = queue.then(() => route(initial)).catch((e) => console.error(e));
    return queue;
  }

  /* ------------------------------------------------------- intro (book opens) */
  async function intro() {
    const S = window.SITE.settings;
    let seen = false;
    try { seen = sessionStorage.getItem('nb-opened') === '1'; sessionStorage.setItem('nb-opened', '1'); } catch (e) {}
    if (!S.introAnimation || seen || UI.reducedMotion() || UI.isStacked() || current !== 0) return;

    const book = $('#book'), pages = $('.pages'), caseEl = $('.case');
    const L = spreads[0].querySelector('.page--left'), R = spreads[0].querySelector('.page--right');
    const pr = pages.getBoundingClientRect(), lr = L.getBoundingClientRect(), rr = R.getBoundingClientRect();
    const half = (rr.left - lr.right) / 2;
    const W = rr.width + half;
    const cut = lr.right + half - caseEl.getBoundingClientRect().left; // case width left of the spine
    const leaf = document.createElement('div');
    leaf.className = 'leaf leaf--cover';
    leaf.style.cssText = `top:${rr.top - pr.top}px;height:${rr.height}px;width:${W}px;left:${lr.right + half - pr.left}px;transform-origin:left center;`;
    leaf.innerHTML = `
      <div class="leaf-face leaf-front"><div class="front-cover" style="left:${half}px;width:${rr.width}px">
        <span class="fc-stitch"></span>
        <span class="fc-label"><span class="lettering lettering--xl">${UI.letters('Portfolio', { seed: 6, bounce: 2 })}</span></span>
        <span class="fc-star s1">${ART.felt('blue')}</span><span class="fc-star s2">${ART.felt('red')}</span>
        <span class="leaf-shade"></span></div></div>
      <div class="leaf-face leaf-back"></div>`;
    const backClone = cloneFace(L, lr, 'right', half);
    backClone.insertAdjacentHTML('beforeend', '<span class="leaf-shade"></span>');
    leaf.querySelector('.leaf-back').appendChild(backClone);
    pages.appendChild(leaf);
    L.style.visibility = 'hidden';
    book.classList.add('is-intro');

    const dx = -(lr.width + half) / 2;
    const tBook = book.animate([{ transform: `translateX(${dx}px)` }, { transform: `translateX(${dx}px)`, offset: .25 }, { transform: 'none' }],
      { duration: 1500, easing: 'cubic-bezier(.45,.05,.25,1)' });
    const tCase = caseEl.animate([{ clipPath: `inset(-60px -80px -60px ${cut}px round 18px)` }, { clipPath: `inset(-60px -80px -60px ${cut}px round 18px)`, offset: .3 }, { clipPath: 'inset(-60px -80px -60px 0px round 18px)', offset: .62 }, { clipPath: 'inset(-60px -80px -60px 0px round 18px)' }],
      { duration: 1500, easing: 'ease-in-out' });
    const tLeaf = leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(0deg)', offset: .25 }, { transform: 'rotateY(-180deg)' }],
      { duration: 1500, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    leaf.querySelector('.leaf-front .leaf-shade').animate([{ opacity: 0 }, { opacity: 0, offset: .25 }, { opacity: .35, offset: .62 }], { duration: 1500, fill: 'forwards' });
    leaf.querySelector('.leaf-back .leaf-shade').animate([{ opacity: .35 }, { opacity: .35, offset: .62 }, { opacity: 0 }], { duration: 1500, fill: 'forwards' });

    let finalize;
    const done = new Promise((r) => (finalize = r));
    flipping = { anim: tLeaf, done };
    const skip = () => { [tBook, tCase, tLeaf].forEach((a) => { try { a.finish(); } catch (e) {} }); };
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    await tLeaf.finished.catch(() => {});
    [tBook, tCase].forEach((a) => { try { a.finish(); } catch (e) {} });
    L.style.visibility = '';
    leaf.remove();
    book.classList.remove('is-intro');
    window.removeEventListener('pointerdown', skip);
    window.removeEventListener('keydown', skip);
    flipping = null;
    finalize();
  }

  /* ----------------------------------------------------------------- init */
  UI.notebook = {
    async start(app) {
      const stack = () => document.documentElement.classList.toggle('is-stacked', UI.isStacked());
      stack();
      window.addEventListener('resize', stack);
      build(app);

      window.addEventListener('hashchange', () => { userNav = true; enqueue(false); });
      document.addEventListener('click', (e) => {
        if (e.target.closest('.folder')) UI.works.markPushed();
      });
      document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
        if (UI.works.isOpen()) return;
        if (e.target.closest('input, textarea, select, .tama, .fb-track, [contenteditable]')) return;
        if (e.key === 'ArrowRight' && current < SECTIONS.length - 1) location.hash = '#' + SECTIONS[current + 1];
        if (e.key === 'ArrowLeft' && current > 0) location.hash = '#' + SECTIONS[current - 1];
      });

      await enqueue(true);
      document.documentElement.classList.add('is-ready');
      queue = queue.then(intro);
    },
    sections: SECTIONS,
  };
})();
