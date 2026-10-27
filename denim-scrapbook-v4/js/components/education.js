/* Spread 2 — Experiences & Skills
   Left : Education + Experience, read left → right with hand-drawn arrows
   Right: Skills (app tiles with bars) + Languages (rings)
   The résumé lives in a folder on the Contact page (see contact.js). */
(function () {
  const UI = window.UI;
  const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
  const plain = (s) => String(s || '').replace(/[\[\]]/g, '');

  /* entries joined by arrows; `top` adds an optional sketched image frame */
  const flow = (items, render) => items.map((d, i) =>
    `${i ? `<li class="flow-arrow" aria-hidden="true">${ART.arrow()}</li>` : ''}<li class="flow-item">${render(d)}</li>`).join('');

  const eduItem = (d) => `
    <h4 class="item-title">${UI.txt(d.school)}</h4>
    <ul class="item-lines">
      ${d.qualification ? `<li>${UI.txt(d.qualification)}</li>` : ''}
      ${d.years ? `<li>${UI.txt(d.years)}</li>` : ''}
      ${d.note ? `<li>${UI.txt(d.note)}</li>` : ''}
    </ul>`;

  const expItem = (d) => `
    <span class="sketch-frame ${d.image ? 'has-img' : ''}">${d.image ? `<img src="${UI.esc(d.image)}" alt="" loading="lazy" decoding="async">` : ''}</span>
    <h4 class="item-title">${UI.txt(d.role)}</h4>
    <ul class="item-lines">
      ${d.org ? `<li>${UI.txt(d.org)}</li>` : ''}
      ${d.years ? `<li>${UI.txt(d.years)}</li>` : ''}
      ${d.description ? `<li>${UI.txt(d.description)}</li>` : ''}
    </ul>`;

  const RING_R = 15.9155; // circumference = 100

  UI.education = {
    left() {
      const S = window.SITE, e = S.education || {}, x = S.experience || {};
      const eduPh = (e.entries || []).some((d) => [d.school, d.qualification, d.years].some(UI.isPh));
      const expPh = (x.entries || []).some((d) => [d.role, d.org, d.years].some(UI.isPh));
      return `
      <div class="page page--left paper xp-left">
        <h2 class="sr-only" tabindex="-1" data-focus>${UI.esc(S.nav.education)}</h2>
        <section class="xp-block" aria-labelledby="edu-h">
          <h3 class="lettering lettering--lg lettering--airy" id="edu-h">${UI.letters(e.title || 'Education', { seed: 2 })}</h3>
          ${eduPh ? UI.hint('add your school in content.js') : ''}
          <ol class="flow flow--edu">${flow(e.entries || [], eduItem)}</ol>
        </section>
        <section class="xp-block" aria-labelledby="exp-h">
          <h3 class="lettering lettering--lg lettering--airy" id="exp-h">${UI.letters(x.title || 'Experiences', { seed: 5, bounce: 1.4 })}</h3>
          ${expPh ? UI.hint('add your roles in content.js') : ''}
          <ol class="flow flow--exp">${flow(x.entries || [], expItem)}</ol>
        </section>
      </div>`;
    },

    right() {
      const sk = window.SITE.skills || {}, lg = window.SITE.languages || {};
      const tiles = (sk.items || []).map((s) => {
        const v = clamp(s.value);
        const face = s.icon
          ? `<img src="${UI.esc(s.icon)}" alt="" decoding="async">`
          : `<span>${UI.esc(s.short || plain(s.name).slice(0, 2))}</span>`;
        return `
        <li class="tile-item">
          <span class="tile tile--${UI.esc(s.tint || 'ink')} ${s.icon ? 'has-icon' : ''}" aria-hidden="true">${face}</span>
          <span class="tile-name">${UI.txt(s.name)}</span>
          <span class="bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${UI.esc(plain(s.name))} proficiency, ${v}%">
            <span class="bar-fill" style="--v:${v}"></span></span>
        </li>`;
      }).join('');

      const rings = (lg.items || []).map((l, i) => {
        const v = clamp(l.value);
        return `
        <li class="ring-item" style="--i:${i}">
          <span class="ring-name">${UI.txt(l.name)}</span>
          <svg class="donut" viewBox="0 0 40 40" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="${UI.esc(plain(l.name))} proficiency${l.level ? ': ' + UI.esc(l.level) : ''}">
            <circle class="donut-track" cx="20" cy="20" r="${RING_R}"/>
            <circle class="donut-fill" cx="20" cy="20" r="${RING_R}" style="--v:${v}"/>
          </svg>
          ${l.level ? `<span class="ring-level">${UI.esc(l.level)}</span>` : ''}
        </li>`;
      }).join('');

      const skPh = (sk.items || []).some((s) => s.placeholder || UI.isPh(s.name));
      const lgPh = (lg.items || []).some((l) => l.placeholder);

      return `
      <div class="page page--right paper xp-right">
        <section class="skills" aria-labelledby="skills-h">
          <div class="xp-head">
            <span class="head-doodle head-doodle--sprout" aria-hidden="true">${ART.doodle.sprout()}</span>
            <h3 class="lettering lettering--lg lettering--airy" id="skills-h">${UI.letters(sk.title || 'Skills', { seed: 7 })}</h3>
            <span class="head-doodle head-doodle--curl" aria-hidden="true">${ART.doodle.curl()}</span>
            <span class="head-doodle head-doodle--camera head-doodle--at-top" aria-hidden="true">${ART.doodle.camera()}</span>
          </div>
          ${skPh ? UI.hint('sample values') : ''}
          <ul class="tiles">${tiles}</ul>
        </section>
        <section class="languages" aria-labelledby="lang-h">
          <div class="xp-head">
            <span class="head-doodle head-doodle--plane head-doodle--at-side" aria-hidden="true">${ART.doodle.plane()}</span>
            <h3 class="lettering lettering--lg lettering--airy" id="lang-h">${UI.letters(lg.title || 'Languages', { seed: 3 })}</h3>
            <span class="head-doodle head-doodle--star" aria-hidden="true">${ART.doodle.star()}</span>
          </div>
          ${lgPh ? UI.hint('set your levels') : ''}
          <ul class="rings">${rings}</ul>
        </section>
      </div>`;
    },

    init() {},
  };
})();
