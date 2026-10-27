/* =====================================================================
   ART — the illustration kit. Every piece is original SVG drawn in code,
   following the design PDF's visual language:
     • felt patches  – stars cut from denim-blue or brick-red felt, with a
                       fuzzy edge, a fabric grain and a white running stitch
     • ink doodles   – loose brown pen drawings (one ink colour, a slightly
                       wobbly line, open sketchy ends)
     • pixel accents – the Tamagotchi shell, sparkles and a little heart,
                       drawn on a crisp pixel grid
     • hardware      – chrome binder rings
   Light comes from the top-left everywhere; shadows fall down-right.
   Colours come from css/theme.css where a piece is styled by CSS, and are
   written in here (matching the theme) where SVG needs them directly.
   ===================================================================== */
(function () {
  const INK = '#51372B';
  const svg = (vb, inner, cls = '', label = '') =>
    `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"'}>${inner}</svg>`;

  /* ---------- shared definitions (inserted once into the page) ---------- */
  const defs = `
  <svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
    <defs>
      <!-- lettering: a rough, hand-cut outline -->
      <filter id="rough" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <!-- pen doodles: a gentle wobble along the line -->
      <filter id="ink" x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="3" result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <!-- felt: fuzzy edge + fibre grain, then a soft contact shadow -->
      <filter id="felt" x="-15%" y="-15%" width="135%" height="135%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="9" result="fz"/>
        <feDisplacementMap in="SourceGraphic" in2="fz" scale="3" xChannelSelector="R" yChannelSelector="G" result="edge"/>
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="2" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 -.18" result="grain"/>
        <feComposite in="grain" in2="edge" operator="in" result="grainIn"/>
        <feMerge result="cloth"><feMergeNode in="edge"/><feMergeNode in="grainIn"/></feMerge>
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/><feOffset in="b" dx="1.6" dy="2.6" result="o"/>
        <feFlood flood-color="#3A2A22" flood-opacity=".32"/><feComposite in2="o" operator="in" result="sh"/>
        <feMerge><feMergeNode in="sh"/><feMergeNode in="cloth"/></feMerge>
      </filter>
      <filter id="soft-blur" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="lift" x="-10%" y="-10%" width="125%" height="125%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/><feOffset in="b" dx="1.5" dy="2.5" result="o"/>
        <feFlood flood-color="#3A2A22" flood-opacity=".22"/><feComposite in2="o" operator="in" result="s"/>
        <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <!-- chrome for the binder rings (light from above) -->
      <linearGradient id="g-wire" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8F959F"/><stop offset=".2" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#D3D7DD"/><stop offset=".8" stop-color="#7B818C"/><stop offset="1" stop-color="#5A606B"/>
      </linearGradient>
      <!-- sea (inside the Tamagotchi) -->
      <linearGradient id="g-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D6F1EE"/><stop offset=".55" stop-color="#9FD9D1"/><stop offset="1" stop-color="#6FBFB6"/>
      </linearGradient>
      <linearGradient id="g-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".36" stop-color="#fff" stop-opacity=".05"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <pattern id="lcd" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0 H3 M0 0 V3" stroke="#2A3A4A" stroke-width=".35" stroke-opacity=".12"/></pattern>
      <!-- the Tamagotchi screen window: the scene is clipped to exactly this -->
      <clipPath id="tama-screen-clip" clipPathUnits="userSpaceOnUse"><rect x="80" y="90" width="140" height="110" rx="5"/></clipPath>
    </defs>
  </svg>`;

  /* ---------- geometry helpers ---------- */
  const starPath = (cx, cy, R, r, n = 5, rot = -90) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = ((rot + (i * 180) / n) * Math.PI) / 180;
      const rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(rad)).toFixed(1) + ' ' + (cy + rr * Math.sin(rad)).toFixed(1);
    }
    return d + 'Z';
  };
  /* a star with softly rounded points, like a cut felt patch */
  const softStar = (cx, cy, R, r, rot = -90) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = ((rot + i * 36) * Math.PI) / 180, rr = i % 2 ? r : R;
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    let d = '';
    for (let i = 0; i < 10; i++) {
      const p = pts[i], prev = pts[(i + 9) % 10], next = pts[(i + 1) % 10];
      const t = i % 2 ? .12 : .16;
      const a = [p[0] + (prev[0] - p[0]) * t, p[1] + (prev[1] - p[1]) * t];
      const b = [p[0] + (next[0] - p[0]) * t, p[1] + (next[1] - p[1]) * t];
      d += `${i ? 'L' : 'M'}${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
    }
    return d + 'Z';
  };
  const scallop = (cx = 60, cy = 66, R = 46, n = 7) => {
    const a0 = 194, a1 = 346, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    let d = `M${cx} ${cy + 36} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i <= n; i++) {
      const am = ((a0 + ((a1 - a0) * (i - 0.5)) / n) * Math.PI) / 180;
      d += ` Q${(cx + (R + 9) * Math.cos(am)).toFixed(1)} ${(cy + (R + 9) * Math.sin(am)).toFixed(1)} ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    }
    d += ' Z';
    const ridges = pts.slice(1, -1).map((p) => `M${cx} ${cy + 32} L${p[0].toFixed(1)} ${(p[1] + 3).toFixed(1)}`).join(' ');
    return { d, ridges, pts };
  };

  /* =================== FELT PATCHES =================== */
  const FELT = {
    blue: ['#4E79A8', '#6A92BF', '#3A5F8A'],
    red: ['#984848', '#B25E5C', '#763333'],
  };
  const felt = (tone = 'blue') => {
    const [base, hi, lo] = FELT[tone] || FELT.blue;
    const d = softStar(60, 63, 50, 23);
    return svg('0 0 120 120', `
      <g filter="url(#felt)">
        <path d="${d}" fill="${base}"/>
        <path d="${softStar(57, 59, 36, 15)}" fill="${hi}" opacity=".35"/>
        <path d="${softStar(64, 68, 40, 17)}" fill="${lo}" opacity=".3"/>
      </g>
      <path d="${softStar(60, 63, 41.5, 18.5)}" fill="none" stroke="#F4F1E8" stroke-width="2" stroke-dasharray="3.2 2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`, 'felt');
  };

  /* =================== INK DOODLES (brown pen) =================== */
  const pen = (inner, w = 2.4) => `<g filter="url(#ink)" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
  const doodle = {
    /* a little sprout with a curl — sits by "Skills" */
    sprout: () => svg('0 0 60 70', pen(`
      <path d="M30 66 C28 52 30 42 34 32 C38 22 46 18 50 10"/>
      <path d="M34 34 C24 30 16 34 12 42 C20 46 30 42 34 34Z" fill="#9DBFB4" fill-opacity=".85"/>
      <path d="M50 10 C54 4 46 0 42 6 C40 10 46 12 48 8"/>
      <path d="M20 40 L28 37"/>`)),
    /* paper plane */
    plane: () => svg('0 0 80 60', pen(`
      <path d="M4 30 L76 6 L44 54 L36 34 Z" fill="#F4F4EC"/>
      <path d="M36 34 L76 6"/><path d="M36 34 L34 46 L44 40"/>`, 2.2)),
    /* small vintage camera — sits by "Languages" in the PDF */
    camera: () => svg('0 0 90 64', pen(`
      <path d="M6 18 L26 18 L32 10 L56 10 L62 18 L84 18 L84 58 L6 58 Z" fill="#F4F4EC"/>
      <circle cx="45" cy="37" r="15"/><circle cx="45" cy="37" r="9" fill="#C9C2B8"/><circle cx="45" cy="37" r="4" fill="${INK}"/>
      <path d="M41 33 C43 31 46 31 48 32" stroke="#fff" stroke-width="1.6"/>
      <rect x="66" y="23" width="11" height="7" rx="1.5"/><path d="M12 26 L22 26 M12 50 L20 50"/>
      <path d="M10 22 C10 22 14 22 16 22" stroke-width="3"/>`, 2.2)),
    /* scribbled outline star */
    star: () => svg('0 0 70 70', pen(`
      <path d="${starPath(35, 37, 31, 13)}"/>`, 2.2)),
    /* four-point twinkle (outline, soft grey fill) */
    twinkle: () => svg('0 0 60 60', pen(`<path d="M30 3 C32 22 38 28 57 30 C38 32 32 38 30 57 C28 38 22 32 3 30 C22 28 28 22 30 3Z" fill="#C9C9C4"/>`, 2.2)),
    /* five-point star outline in grey (PDF "Works" corner) */
    starGrey: () => svg('0 0 60 60', pen(`<path d="${starPath(30, 32, 26, 11)}" fill="#D3D3CE"/>`, 2)),
    /* little squiggle */
    curl: () => svg('0 0 40 30', pen(`<path d="M4 22 C10 6 20 6 18 16 C16 24 8 18 14 12 C20 6 30 10 36 4"/>`, 2)),
  };

  /* hand-drawn arrows */
  const arrow = () => svg('0 0 80 30', `<g filter="url(#ink)" fill="none" stroke="var(--arrow, #E4572E)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 18 C24 14 44 13 72 15"/><path d="M58 5 C64 9 69 12 73 15 C67 18 62 21 56 26"/><path d="M8 21 C28 18 46 17 66 18" stroke-width="1.6" opacity=".6"/></g>`, 'arrow');
  const strapArrow = () => svg('0 0 70 40', `<g filter="url(#ink)" stroke-linejoin="round" stroke-linecap="round">
      <path d="M4 15 L40 14 L38 4 L66 20 L38 36 L40 26 L4 26 Z" fill="#22344C" stroke="#EAA6B7" stroke-width="4.2"/>
      <path d="M12 20 L52 20" stroke="#F6CBD5" stroke-width="1.6" fill="none" opacity=".75"/></g>`, 'strap-arrow');

  /* =================== PIXEL ACCENTS =================== */
  const px = (cells, size, fill) => cells.map(([x, y]) => `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" fill="${fill}"/>`).join('');
  const pixel = {
    heart: () => {
      const map = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
      const cells = [], hi = [[1, 1], [2, 1]];
      map.forEach((row, y) => [...row].forEach((ch, x) => ch === 'X' && cells.push([x, y])));
      return svg('0 0 70 60', `<g shape-rendering="crispEdges">${px(cells, 10, '#F2B4BC')}${px(hi, 10, '#FBD9DD')}${px([[5, 2], [4, 3]], 10, '#E592A0')}</g>`, 'pixel');
    },
    sparkles: () => {
      const s = (ox, oy, k) => {
        const c = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [2, 4]];
        return px(c.map(([x, y]) => [x + ox, y + oy]), k, '#F2C14E') + px([[ox + 2, oy + 2]], k, '#FFF3C4');
      };
      return svg('0 0 90 80', `<g shape-rendering="crispEdges">${s(0, 3, 9)}${s(5, 0, 8)}${s(6, 5, 7)}</g>`, 'pixel');
    },
  };

  /* =================== BINDER RING (light from above) =================== */
  const ring = () => svg('0 0 100 40', `
    <ellipse cx="12" cy="24" rx="6.6" ry="5.4" fill="#E3DFD2"/><ellipse cx="88" cy="24" rx="6.6" ry="5.4" fill="#E3DFD2"/>
    <ellipse cx="12" cy="24" rx="4.8" ry="3.9" fill="#26231F"/><ellipse cx="88" cy="24" rx="4.8" ry="3.9" fill="#26231F"/>
    <path d="M12 27 C30 32 70 32 88 27" fill="none" stroke="#6E747E" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>
    <path d="M14 27 C32 16 72 16 90 28" fill="none" stroke="#2A1E18" stroke-opacity=".28" stroke-width="5" stroke-linecap="round" filter="url(#soft-blur)" transform="translate(1.5 3.5)"/>
    <path d="M12 24 C30 11 70 11 88 24" fill="none" stroke="url(#g-wire)" stroke-width="5.6" stroke-linecap="round"/>
    <path d="M20 17.8 C34 12.4 62 12.2 78 16.2" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>`, 'ring');

  /* =================== SCUBA DIVER (v1 drawing, restored) =================== */
  function diverArt() {
    const k = `stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"`;
    return `
      <path fill="none" stroke="#6d7486" stroke-width="2.6" stroke-linecap="round" d="M8 -15 C22 -24 38 -14 34 1"/>
      <g class="fin fin-1"><path fill="#E88AA3" ${k} stroke-width="1.8" d="M-36 -3 L-56 -14 C-61 -7 -61 1 -56 6Z"/></g>
      <g class="fin fin-2"><path fill="#E88AA3" ${k} stroke-width="1.8" d="M-36 6 L-56 2 C-61 9 -61 17 -56 22Z"/></g>
      <path fill="none" stroke="#24324F" stroke-width="8.5" stroke-linecap="round" d="M-14 -2 L-36 -3.5"/>
      <path fill="none" stroke="#24324F" stroke-width="8.5" stroke-linecap="round" d="M-14 6 L-36 7"/>
      <rect fill="#F6CAD5" ${k} stroke-width="1.8" x="-22" y="-19" width="30" height="11" rx="5.5"/>
      <rect fill="#E88AA3" x="-12" y="-19" width="4" height="11"/>
      <rect fill="#C9CCD3" ${k} stroke-width="1.4" x="7" y="-18" width="6" height="7" rx="1.5"/>
      <rect fill="#2E4166" ${k} stroke-width="1.8" x="-19" y="-9" width="32" height="20" rx="9"/>
      <path fill="none" stroke="#E88AA3" stroke-width="3" d="M-6 -8 L-6 10"/>
      <path fill="none" stroke="#24324F" stroke-width="6.5" stroke-linecap="round" d="M8 3 C15 9 21 11 27 10"/>
      <circle cx="28.5" cy="10" r="3.2" fill="#f4cdb7" ${k} stroke-width="1.2"/>
      <g class="ponytail"><path fill="#3b2b2e" d="M13 -8 C2 -17 -6 -12 -14 -20 C-8 -8 2 -5 13 -3Z"/></g>
      <circle cx="22" cy="-4" r="11.5" fill="#f7d6c3" ${k} stroke-width="1.8"/>
      <path fill="#3b2b2e" d="M11 -2 C9 -14 18 -18 26 -16 C32 -15 35 -11 34 -8 C28 -12 20 -11 16 -4 C15 -1 13 2 11 -2Z"/>
      <path fill="none" stroke="#D4708D" stroke-width="2.4" d="M12 -6.5 L25 -9"/>
      <rect x="23.5" y="-12" width="13" height="10" rx="3.4" fill="#e8f7f5" fill-opacity=".9" stroke="#E88AA3" stroke-width="2.4"/>
      <circle fill="${INK}" cx="30.5" cy="-7" r="1.6"/><path fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" d="M26 -10 L28 -10.8"/>
      <circle cx="25" cy="1.5" r="2.2" fill="#F6CAD5" opacity=".9"/>
      <rect x="30" y="-0.5" width="6" height="5.5" rx="2" fill="#6d7486"/><circle cx="36.5" cy="2.2" r="2.8" fill="#8e939d" stroke="${INK}" stroke-width="1"/>`;
  }

  /* =================== TAMAGOTCHI — pixel shell (300 × 362) ===================
     30 × 36 cells of 10 units. Screen window: x 80–220, y 90–200
     (cells 8–21 × 9–19); the scene is clipped to exactly that window. */
  const TAMA = { o: '#B06888', d: '#E7A6BF', m: '#F4CCDA', l: '#FBE3EC', g: '#F6D27A', gd: '#D6A740', gl: '#FFF0B8', s: '#6E7F92' };
  function tamaCells() {
    const COLS = 30, ROWS = 36, cx = 15, cy = 19.6;
    const inside = (c, r) => {
      const x = (c + .5 - cx) / 14.6, y = (r + .5 - cy) / (r + .5 < cy ? 18.4 : 15.6);
      return x * x + y * y <= 1;
    };
    const set = new Set();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (inside(c, r)) set.add(c + ',' + r);
    return { set, cx, cy };
  }
  function tamagotchiBody() {
    const C = 10, { set, cx, cy } = tamaCells();
    const has = (c, r) => set.has(c + ',' + r);
    const edge = (c, r) => { for (let d = 1; d <= 3; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) if (!has(c + dx, r + dy)) return d; return 9; };
    let shell = '';
    set.forEach((key) => {
      const [c, r] = key.split(',').map(Number);
      const e = edge(c, r), side = (c + .5 - cx) / 14.6 + (r + .5 - cy) / 17;
      let k = 'm';
      if (e === 1) k = 'o'; else if (e === 2 && side > .15) k = 'd'; else if (e <= 3 && side < -.55) k = 'l';
      shell += `<rect x="${c * C}" y="${r * C}" width="${C}" height="${C}" fill="${TAMA[k]}"/>`;
    });
    /* gold scalloped frame around the screen (screen = cells 8..21 × 9..19) */
    let frame = '';
    for (let r = 7; r <= 21; r++) for (let c = 6; c <= 23; c++) {
      const inScreen = c >= 8 && c <= 21 && r >= 9 && r <= 19;
      if (inScreen) continue;
      const ring = Math.max(c < 8 ? 8 - c : c > 21 ? c - 21 : 0, r < 9 ? 9 - r : r > 19 ? r - 19 : 0);
      const corner = (c <= 6 || c >= 23) && (r <= 7 || r >= 21);
      if (corner) continue;
      const lit = r < 9 || c < 8;                       /* top-left side catches the light */
      if (ring === 1) frame += `<rect x="${c * C}" y="${r * C}" width="${C}" height="${C}" fill="${lit ? TAMA.gl : TAMA.g}"/>`;
      else if (ring === 2 && (c + r) % 2 === 0) {     /* scallops: every other cell bumps out */
        frame += `<rect x="${c * C}" y="${r * C}" width="${C}" height="${C}" fill="${lit ? TAMA.g : TAMA.gd}"/>`;
      }
    }
    /* dark pixel bezel with notched corners */
    let bezel = '';
    for (let c = 8; c <= 21; c++) { bezel += `<rect x="${c * C}" y="85" width="${C}" height="5" fill="${TAMA.s}"/><rect x="${c * C}" y="200" width="${C}" height="5" fill="${TAMA.s}"/>`; }
    for (let r = 9; r <= 19; r++) { bezel += `<rect x="75" y="${r * C}" width="5" height="${C}" fill="${TAMA.s}"/><rect x="220" y="${r * C}" width="5" height="${C}" fill="${TAMA.s}"/>`; }
    /* strap loop at the top-left, as in the PDF */
    const strap = [[5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [6, 1], [7, 1], [6, 2], [6, 3], [6, 4]].map(([c, r]) =>
      `<rect x="${c * C}" y="${r * C}" width="${C}" height="${C}" fill="${c === 5 ? TAMA.o : (r === 1 ? TAMA.o : TAMA.d)}"/>`).join('');
    /* pixel shine, top-left */
    const shine = [[4, 10], [4, 11], [5, 8], [6, 6], [4, 13]].map(([c, r]) => `<rect x="${c * C + 2}" y="${r * C + 2}" width="6" height="6" fill="#FFFFFF" opacity=".85"/>`).join('');
    /* button wells (the real buttons sit on top of these, see .tama-btn) */
    const wells = [110, 150, 190].map((x) => `<rect x="${x - 15}" y="${255}" width="30" height="20" fill="${TAMA.d}" opacity=".55"/>`).join('');
    return `
    <ellipse cx="156" cy="352" rx="112" ry="9" fill="#3A2A22" opacity=".18" filter="url(#soft-blur)"/>
    <g shape-rendering="crispEdges">${strap}${shell}${shine}${frame}${bezel}${wells}</g>`;
  }
  /* glass over the screen: faint LCD grid + reflection */
  const tamagotchiGlass = () => `
    <g clip-path="url(#tama-screen-clip)">
      <rect x="80" y="90" width="140" height="110" fill="url(#lcd)"/>
      <rect x="80" y="90" width="140" height="110" fill="url(#g-glass)"/>
    </g>`;

  /* Underwater scene (v1, 200 units wide; rows 8–165 show through the window) — shown through the clipped window */
  const tamagotchiScene = () => `
    <rect width="200" height="170" fill="url(#g-sea)"/>
    <path fill="url(#g-ray)" d="M40 0 L62 0 L40 170 L10 170Z" opacity=".5"/>
    <path fill="url(#g-ray)" d="M120 0 L134 0 L128 170 L104 170Z" opacity=".4"/>
    <g class="fishy fish-a"><path fill="#F6CAD5" stroke="${INK}" stroke-width="1.2" d="M0 0 C6 -6 16 -6 20 0 C16 6 6 6 0 0Z M20 0 L27 -5 L27 5Z"/><circle cx="5" cy="-1" r="1.1" fill="${INK}"/></g>
    <g class="fishy fish-b"><path fill="#fff4c9" stroke="${INK}" stroke-width="1.1" d="M0 0 C5 -5 13 -5 16 0 C13 5 5 5 0 0Z M16 0 L22 -4 L22 4Z"/><circle cx="4" cy="-.8" r="1" fill="${INK}"/></g>
    <path fill="#F1DFB6" d="M0 146 C40 136 80 152 120 143 C150 137 178 147 200 140 L200 170 L0 170Z"/>
    <g fill="#d9c08c" opacity=".7"><circle cx="30" cy="158" r="1.4"/><circle cx="86" cy="160" r="1.2"/><circle cx="140" cy="156" r="1.4"/><circle cx="176" cy="162" r="1.2"/></g>
    <g class="weed" style="transform-origin:20px 150px"><path fill="none" stroke="#5fae96" stroke-width="5" stroke-linecap="round" d="M20 150 C14 136 26 126 18 112 C12 102 22 94 18 86"/></g>
    <g class="weed weed-2" style="transform-origin:32px 152px"><path fill="none" stroke="#7cc2a6" stroke-width="4" stroke-linecap="round" d="M32 152 C28 142 36 134 32 124"/></g>
    <g class="weed" style="transform-origin:182px 148px"><path fill="none" stroke="#5fae96" stroke-width="5" stroke-linecap="round" d="M182 148 C188 134 176 124 184 110 C188 102 180 96 184 90"/></g>
    <g stroke="#E88AA3" stroke-width="4" stroke-linecap="round" fill="none"><path d="M150 150 L150 132 M150 140 L141 128 M150 137 L158 124 M141 128 L138 120"/></g>
    <path fill="#fffaf1" stroke="${INK}" stroke-width="1" d="M72 154 L64 146 C66 140 78 140 80 146Z"/>
    <path fill="#F6CAD5" stroke="${INK}" stroke-width="1" d="${starPath(116, 156, 7, 3)}"/>
    <g class="ambient-bubbles"><circle class="bub b1" cx="56" cy="150" r="2.6"/><circle class="bub b2" cx="166" cy="150" r="2"/><circle class="bub b3" cx="96" cy="150" r="1.8"/></g>
    <g class="diver-pos"><g class="diver-face"><g class="diver-bob"><g class="diver-spin">
      ${diverArt()}
      <g class="reg-bubbles"><circle class="bub r1" cx="40" cy="-2" r="2.4"/><circle class="bub r2" cx="42" cy="-2" r="1.6"/><circle class="bub r3" cx="39" cy="-2" r="2"/></g>
    </g></g></g></g>`;

  window.ART = { defs, svg, felt, doodle, arrow, strapArrow, pixel, ring, scallop, starPath, tamagotchiBody, tamagotchiGlass, tamagotchiScene };
})();
