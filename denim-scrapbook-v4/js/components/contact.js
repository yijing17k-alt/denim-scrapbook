/* Spread 4 — Contact
   Left : big lettering + the envelope with your note (tap to open)
   Right: email + social links as a labelled list, and a résumé folder */
(function () {
  const UI = window.UI;

  UI.contact = {
    left() {
      const c = window.SITE.contact;
      const email = c.email ? `href="mailto:${UI.esc(c.email)}"` : 'href="#" data-missing="email"';
      return `
      <div class="page page--left paper contact-left">
        <span class="head-doodle head-doodle--twinkle" aria-hidden="true">${ART.doodle.twinkle()}</span>
        <h2 class="lettering lettering--xxl contact-title" tabindex="-1" data-focus>${UI.letters(c.title, { seed: 4, bounce: 1.5 })}</h2>
        <span class="head-doodle head-doodle--cstar" aria-hidden="true">${ART.doodle.starGrey()}</span>
        ${[c.note, c.signoff].some(UI.isPh) ? UI.hint('write your note in content.js') : ''}
        <div class="envelope-wrap">
          <div class="envelope" data-envelope>
            <div class="env-back" aria-hidden="true"></div>
            <div class="letter" id="contact-letter">
              <p class="letter-hi">hi there,</p>
              <p class="letter-note">${UI.txt(c.note)}</p>
              <p class="letter-sign">— ${UI.txt(c.signoff)}</p>
              <a class="letter-reply" ${email} tabindex="-1">write back <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 L11 5 M6 5 L11 5 L11 10"/></svg></a>
            </div>
            <div class="env-front" aria-hidden="true"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><path class="ef-body" d="M1.5 1.5 L80 64 L158.5 1.5 L158.5 98.5 L1.5 98.5Z"/><path class="ef-line" d="M1.5 98.5 L66 58 M158.5 98.5 L94 58"/></svg></div>
            <div class="env-flap" aria-hidden="true"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><path class="fl-body" d="M1.5 1.5 L158.5 1.5 L80 66Z"/></svg><span class="seal">${ART.felt('red')}</span></div>
            <button class="env-toggle" type="button" aria-expanded="false" aria-controls="contact-letter">
              <span class="sr-only">Open the envelope to read my note</span></button>
          </div>
          <p class="env-hint hand-note" aria-hidden="true">tap the envelope ↑</p>
        </div>
        <p class="closing hand-note">${UI.esc(c.closing || '')}</p>
      </div>`;
    },

    right() {
      const c = window.SITE.contact;
      const r = window.SITE.resume || {};
      const mail = c.email ? `href="mailto:${UI.esc(c.email)}"` : 'href="#" data-missing="email"';
      const socials = (c.socials || []).map((s) => {
        const link = s.url ? `href="${UI.esc(s.url)}" target="_blank" rel="noopener noreferrer"` : 'href="#" data-missing="link"';
        return `<li class="info-row">
          <span class="info-label">${UI.esc(s.label)}</span>
          <a class="info-value" ${link} aria-label="${UI.esc(s.label)}${s.url ? ' (opens in a new tab)' : ' (link not added yet)'}">${UI.txt(s.handle || s.url || '')}</a>
        </li>`;
      }).join('');

      return `
      <div class="page page--right paper contact-right">
        <dl class="info">
          <div class="info-row info-row--email">
            <dt class="info-label">Email address</dt>
            <dd><a class="info-value ml-addr" ${mail}>${c.email ? UI.esc(c.email) : '<span class="is-ph">your email address</span>'}</a></dd>
            <dd class="info-actions">
              <a class="mini-btn" ${mail}><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M3 5.5 L10 11 L17 5.5"/></svg>write to me</a>
              <button class="mini-btn" type="button" data-copy-email><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6.5" y="6.5" width="10" height="10" rx="2"/><path d="M13 4 L5 4 C4 4 3.5 4.5 3.5 5.5 L3.5 13"/></svg>copy</button>
            </dd>
          </div>
        </dl>
        <ul class="info info--socials">${socials}</ul>
        <a class="resume-folder" ${UI.resumeAttrs()} aria-label="Résumé: ${r.file ? (r.download ? 'download the PDF' : 'open the PDF in a new tab') : 'not added yet'}">
          <span class="rf-back" aria-hidden="true"></span>
          <span class="rf-sheet" aria-hidden="true"></span>
          <span class="rf-front"><span class="rf-label">${UI.esc(r.title || 'Résumé')}</span><span class="rf-note">${r.file ? (r.download ? 'download PDF' : 'open PDF') : 'coming soon'}</span></span>
        </a>
        ${!c.email || (c.socials || []).some((s) => !s.url) ? UI.hint('add email & links in content.js') : ''}
      </div>`;
    },

    init(spread) {
      const env = spread.querySelector('[data-envelope]');
      if (env && !env.dataset.ready) {
        env.dataset.ready = '1';
        const btn = env.querySelector('.env-toggle');
        const reply = env.querySelector('.letter-reply');
        btn.addEventListener('click', () => {
          const open = !env.classList.contains('is-open');
          env.classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', open);
          btn.querySelector('.sr-only').textContent = open ? 'Close the envelope' : 'Open the envelope to read my note';
          reply.tabIndex = open ? 0 : -1;
        });
      }
      spread.querySelectorAll('[data-copy-email]').forEach((b) => b.addEventListener('click', async () => {
        const email = window.SITE.contact.email;
        if (!email) return UI.toast('Email not added yet — set contact.email in js/content.js');
        try { await navigator.clipboard.writeText(email); UI.toast('Email copied ✓'); }
        catch { UI.toast(email); }
      }));
    },
  };
})();
