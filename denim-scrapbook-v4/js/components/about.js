/* Spread 1 — About Me
   Left : "About Me" lettering, a torn note with your intro, film strip + cut-out portrait
   Right: the underwater Tamagotchi, with the rest of your intro underneath */
(function () {
  const UI = window.UI;

  const ARTS = {
    'felt-blue': () => ART.felt('blue'), 'felt-red': () => ART.felt('red'),
    sparkles: () => ART.pixel.sparkles(), heart: () => ART.pixel.heart(),
    star: () => ART.doodle.star(), twinkle: () => ART.doodle.twinkle(), 'star-grey': () => ART.doodle.starGrey(),
    plane: () => ART.doodle.plane(), sprout: () => ART.doodle.sprout(), curl: () => ART.doodle.curl(),
  };
  const stickers = (page) => (window.SITE.about.stickers || [])
    .filter((s) => (s.page || 'left') === page && ARTS[s.art])
    .map((s, i) => `<span class="deco deco--${s.art}" style="--x:${s.x}%;--y:${s.y}%;--s:${s.size};--r:${s.rotate || 0}deg;--i:${i}">${ARTS[s.art]()}</span>`)
    .join('');

  UI.about = {
    left() {
      const a = window.SITE.about;
      const first = (a.intro || [])[0];
      const photos = (a.photos || ['', '', '']).slice(0, 3);
      while (photos.length < 3) photos.push('');
      const frames = photos.map((src) => src
        ? `<span class="film-frame"><img src="${UI.esc(src)}" alt="" loading="lazy" decoding="async"></span>`
        : '<span class="film-frame is-empty"></span>').join('');
      return `
      <div class="page page--left paper about-left">
        <header class="about-head">
          <h1 class="lettering lettering--xl lettering--airy" tabindex="-1" data-focus>${UI.letters(a.title || 'About Me')}</h1>
        </header>
        <div class="note">
          <h2 class="note-title">${UI.esc(a.introHeading || '')}</h2>
          ${first ? `<p class="note-text">${UI.txt(first)}</p>` : ''}
          ${UI.isPh(first) ? UI.hint('your intro goes here') : ''}
        </div>
        <div class="film" aria-hidden="${photos.some(Boolean) ? 'false' : 'true'}">${frames}</div>
        <div class="portrait ${a.portrait ? '' : 'is-empty'}" ${a.portrait ? '' : 'aria-hidden="true"'}>${a.portrait ? `<img src="${UI.esc(a.portrait)}" alt="Portrait" decoding="async">`
          : `<svg viewBox="0 0 120 190" preserveAspectRatio="xMidYMax meet"><path d="M60 8 C44 8 34 21 34 38 C34 48 36 57 33 66 C30 76 24 84 26 96 C16 104 8 118 6 140 L2 190 L118 190 L114 140 C112 118 104 104 94 96 C96 84 90 76 87 66 C84 57 86 48 86 38 C86 21 76 8 60 8Z"/></svg>`}</div>
        <div class="decos" aria-hidden="true">${stickers('left')}</div>
      </div>`;
    },

    right() {
      const a = window.SITE.about;
      const rest = (a.intro || []).slice(1).map((p) => `<p>${UI.txt(p)}</p>`).join('');
      return `
      <div class="page page--right paper about-right">
        <div class="decos" aria-hidden="true">${stickers('right')}</div>
        <div class="tama-wrap">
          ${UI.tamagotchi.html()}
          <div class="press-me" aria-hidden="true"><span>press the buttons!</span>
            <svg viewBox="0 0 60 40"><path d="M50 6 C50 24 32 34 10 16 M10 16 L19.9 17.6 M10 16 L13.5 25.4"/></svg></div>
        </div>
        ${rest ? `<div class="intro-text">${rest}</div>` : ''}
      </div>`;
    },

    init(spread) {
      UI.tamagotchi.init(spread.querySelector('[data-tama]'));
    },
  };
})();
