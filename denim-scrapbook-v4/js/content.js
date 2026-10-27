/* =====================================================================
   CONTENT & SETTINGS — the only file you need for everyday updates.
   ---------------------------------------------------------------------
   • Text wrapped in [square brackets] is treated as a PLACEHOLDER and is
     shown in a softer style. Replace it with your own words (and drop the
     brackets) and it will render normally.
   • Colours and fonts live in css/theme.css.
   • Everything here is plain JavaScript: keep the commas and quotes.
   ===================================================================== */

window.SITE = {

  /* -------------------------------------------------------------------
     LAYOUT SETTINGS (sizes are in "book units": the open book is 1000
     units wide on desktop, so everything scales with the screen).
     ------------------------------------------------------------------- */
  settings: {
    book: {
      maxWidth: 1280,        // px — largest the open book will ever get
      aspect: 1.7,           // width ÷ height of the open binder
      stackBelow: 900,       // px — narrower screens switch to the stacked notepad layout
    },
    spiral: {
      rings: 6,              // number of binder rings (split into two groups, like a ring binder)
      ringSize: 1.2,         // 1 = default, 1.2 = 20% chunkier rings
    },
    works: {
      thumbHeight: 300,      // desktop thumbnail frame height (book units)
      thumbHeightMobile: 280,// mobile thumbnail frame height (px)
      gap: 34,               // space between thumbnails (book units / px on mobile)
      frameBorder: 10,       // cream border around each thumbnail (book units)
      maxFrameWidth: 78,     // % of the carousel width a single (landscape) frame may take
      defaultAspect: '16:9', // used when a project doesn't say '16:9', '9:16' or 'auto'
    },
    showPlaceholderHints: true, // small "placeholder" notes beside unfinished content — set false when done
    pageTurnMs: 850,            // page-turn speed
    introAnimation: true,       // book opens on first visit
  },

  /* Labels shown on the notebook tabs (order is fixed: about, education, works, contact) */
  nav: {
    about: 'About Me',
    education: 'Experiences & Skills',
    works: 'Works',
    contact: 'Contact',
  },

  /* -------------------------------------------------------------------
     1 · ABOUT ME
     ------------------------------------------------------------------- */
  about: {
    title: 'About Me',
    coverNote: 'flip through',           // little note on the binder strap (opening animation)
    introHeading: 'hello & welcome',      // heading on the torn paper note
    intro: [
      '[A short introduction goes here — who you are and what you make. Two or three sentences work best.]',
      '[Optionally, a second line: what you are working on now, or what you love making.]',
    ],
    // The first intro paragraph sits on the torn note (left page); any further
    // paragraphs sit under the Tamagotchi (right page).

    // Film strip on the left page: up to 3 photos (put the files in assets/images/).
    // Leave '' for an empty frame.
    photos: ['', '', ''],
    // A cut-out photo of you (a PNG with a transparent background works best).
    // Leave '' to show a soft paper silhouette instead.
    portrait: '',
    coverKicker: 'portfolio — vol. 01',   // small line under the title on the cover label
    // Decorations on the About Me spread. page = 'left' | 'right';
    // x / y = centre position in % of that page, size = width in % of the page,
    // rotate = degrees. art = one of:
    //   felt-blue, felt-red (felt star patches) · sparkles, heart (pixel)
    //   star, twinkle, star-grey, plane, sprout, curl (ink doodles)
    stickers: [
      { page: 'left',  art: 'felt-red',  x: 10, y: 39, size: 15, rotate: -14 },
      { page: 'right', art: 'sparkles',  x: 17, y: 14, size: 12, rotate: 0 },
      { page: 'right', art: 'heart',     x: 85, y: 22, size: 8,  rotate: 0 },
    ],
  },

  /* -------------------------------------------------------------------
     2 · EXPERIENCES & SKILLS
     ------------------------------------------------------------------- */
  education: {
    title: 'Education',
    // One entry per school / programme — add, remove or reorder freely.
    // Entries read left to right, joined by a little arrow (oldest first).
    entries: [
      { school: '[College / university name]', qualification: '[Programme / qualification]', years: '[Years]', note: '' },
    ],
  },

  experience: {
    title: 'Experiences',
    // One entry per role. description is optional.
    // image: optional logo or photo for the sketched frame above each role
    //        (put the file in assets/images/). Leave '' for an empty frame.
    entries: [
      { role: '[Role / position]', org: '[Company, studio or client]', years: '[Years]', description: '[One line about what you did there]', image: '' },
      { role: '[Role / position]', org: '[Company, studio or client]', years: '[Years]', description: '', image: '' },
    ],
  },

  /* Résumé — opened from the résumé folder on the Contact page.
     1. Put your PDF in  assets/resume/  (e.g. assets/resume/resume.pdf)
     2. Set file: 'assets/resume/resume.pdf'
     Leave file empty ('') until it is uploaded — the site will say "not added yet". */
  resume: {
    file: '',
    download: false,          // true = download the file instead of opening it in a new tab
    label: 'my résumé',
    title: 'Résumé',
    note: 'the full version, as a PDF',
  },

  skills: {
    title: 'Skills',
    // value = 0–100. placeholder: true shows a "sample values" hint until you edit it.
    // Each skill shows as a small app tile with a bar underneath:
    //   short : 1–3 letters on the tile (e.g. 'Pr', 'Ae', 'Fi')
    //   icon  : optional image for the tile instead (put it in assets/images/)
    //   tint  : tile colour — 'ink' | 'plum' | 'blue' | 'brick' | 'sage' | 'pink'
    items: [
      { name: '[Software 1]', short: '1', value: 85, tint: 'ink',   placeholder: true },
      { name: '[Software 2]', short: '2', value: 75, tint: 'brick', placeholder: true },
      { name: '[Software 3]', short: '3', value: 65, tint: 'blue',  placeholder: true },
      { name: '[Software 4]', short: '4', value: 60, tint: 'plum',  placeholder: true },
      { name: '[Software 5]', short: '5', value: 45, tint: 'sage',  placeholder: true },
    ],
  },

  languages: {
    title: 'Languages',
    // value = 0–100 (shown as a ring that fills up). level = optional label, e.g. 'Fluent'.
    items: [
      { name: 'Malay',            value: 50, level: '', placeholder: true },
      { name: 'English',          value: 50, level: '', placeholder: true },
      { name: 'Mandarin Chinese', value: 50, level: '', placeholder: true },
      { name: 'Hokkien',          value: 50, level: '', placeholder: true },
    ],
  },

  /* -------------------------------------------------------------------
     3 · WORKS — folders of projects
     ---------------------------------------------------------------------
     Add / remove / reorder folders freely. For each project:
       image   : path to the thumbnail inside assets/works/ (jpg, png, webp, svg)
       aspect  : '16:9' (landscape), '9:16' (vertical) or 'auto' (read from the image)
       url     : the YouTube / Vimeo / Instagram / any link — opens in a new tab.
                 Leave '' until you have it (the thumbnail will say "link coming soon").
       title, description, date : optional
     pattern: the folder fabric — 'stripe-pink' | 'stripe-brown' | 'gingham-blue'
              | 'stripe-stars' | 'plaid' (any folder without one picks in turn)
     ------------------------------------------------------------------- */
  works: {
    title: 'Works',
    note: 'pick a folder ↓',
    folders: [
      {
        id: 'video-production', name: 'Video Production', color: 'denim', pattern: 'stripe-pink',
        projects: [
          { image: 'assets/works/sample-landscape-1.svg', aspect: '16:9', title: '[Project title]', description: '', date: '', url: '' },
          { image: 'assets/works/sample-portrait-1.svg',  aspect: '9:16', title: '[Project title]', description: '', date: '', url: '' },
          { image: 'assets/works/sample-landscape-2.svg', aspect: '16:9', title: '[Project title]', description: '', date: '', url: '' },
          { image: 'assets/works/sample-landscape-3.svg', aspect: '16:9', title: '[Project title]', description: '', date: '', url: '' },
          { image: 'assets/works/sample-portrait-2.svg',  aspect: '9:16', title: '[Project title]', description: '', date: '', url: '' },
        ],
      },
      {
        id: 'social-media', name: 'Social Media & Reels', color: 'pink', pattern: 'gingham-blue',
        projects: [
          { image: 'assets/works/sample-portrait-3.svg',  aspect: '9:16', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-portrait-4.svg',  aspect: '9:16', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-portrait-1.svg',  aspect: '9:16', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-landscape-4.svg', aspect: '16:9', title: '[Project title]', url: '' },
        ],
      },
      {
        id: 'documentary', name: 'Documentary', color: 'cream', pattern: 'stripe-brown',
        projects: [
          { image: 'assets/works/sample-landscape-5.svg', aspect: '16:9', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-landscape-6.svg', aspect: '16:9', title: '[Project title]', url: '' },
        ],
      },
      {
        id: 'motion-graphics', name: 'Motion Graphics', color: 'sky', pattern: 'stripe-stars',
        projects: [
          { image: 'assets/works/sample-landscape-2.svg', aspect: '16:9', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-portrait-2.svg',  aspect: '9:16', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-landscape-5.svg', aspect: '16:9', title: '[Project title]', url: '' },
        ],
      },
      {
        id: 'other-projects', name: 'Other Projects', color: 'pink', pattern: 'plaid',
        projects: [
          { image: 'assets/works/sample-landscape-3.svg', aspect: '16:9', title: '[Project title]', url: '' },
          { image: 'assets/works/sample-portrait-4.svg',  aspect: '9:16', title: '[Project title]', url: '' },
        ],
      },
    ],
  },

  /* -------------------------------------------------------------------
     4 · CONTACT
     ------------------------------------------------------------------- */
  contact: {
    title: "Let's keep in touch",
    note: '[A short, friendly note to visitors — e.g. what kind of projects or collaborations you are open to.]',
    signoff: '[your name]',
    email: '',                       // e.g. 'hello@yourdomain.com' — leave '' until ready
    // Social links: label + url. Leave url '' until ready. Add or remove rows freely.
    socials: [
      { label: 'Instagram', handle: '[@handle]', url: '' },
      { label: 'LinkedIn',  handle: '[profile]', url: '' },
      { label: 'YouTube',   handle: '[channel]', url: '' },
      { label: 'Vimeo',     handle: '[profile]', url: '' },
    ],
    closing: 'thanks for flipping through',
  },
};
