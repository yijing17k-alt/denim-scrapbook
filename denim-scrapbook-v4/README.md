# Scrapbook Portfolio

A ring-binder scrapbook portfolio: **About Me** (torn note, film strip and an underwater Tamagotchi), **Experiences & Skills** (education, experience, skills and languages), **Works** (fabric folders → thumbnail carousel) and **Contact** (envelope, contact list and a résumé folder).

The visual design follows the design PDF: a denim-blue ring binder (with a worn leather grain) on cream-and-seafoam ticking fabric, off-white pages, brown hand-lettering, felt star patches, sage masking tape and small pixel-art accents.

Plain HTML/CSS/JS: no build step, no dependencies, no backend.

## Run it locally

Open `index.html` in a browser, or start a local server:

```bash
cd denim-scrapbook-v3
python3 -m http.server 8000      # then visit http://localhost:8000
```

To put it online, upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages…).

## Where things live

| What | File |
|---|---|
| **All your text, links, projects, skill values, layout settings** | `js/content.js` ← edit this one |
| Colours, fonts, textures | `css/theme.css` |
| Binder, rings, tabs, strap, page turn, lettering, mobile layout | `css/layout.css` |
| Each spread's composition | `css/sections.css` |
| Illustrations (all original SVG drawn in code) | `js/art.js` |
| Components | `js/components/`: `notebook.js` (shell, routing, page turns), `tamagotchi.js`, `about.js`, `education.js` (Experiences & Skills), `works.js`, `contact.js` |
| Thumbnails | `assets/works/` |
| Photos, portrait, logos, skill icons | `assets/images/` |
| Résumé PDF | `assets/resume/` |
| Fabric, leather and paper textures | `assets/textures/` (made by `tools/make_textures.py`) |

## Placeholders

Text in `content.js` wrapped in `[square brackets]` is a placeholder and shows in a softer colour. Replace it (and remove the brackets) and it displays normally.

Small red "placeholder" notes appear beside unfinished areas. When you're done, set `settings.showPlaceholderHints: false`.

## Common edits

**About Me**
- `about.introHeading` is the heading on the torn note.
- The first `about.intro` paragraph goes on the note. Any further paragraphs sit under the Tamagotchi.
- `about.photos`: up to three photos for the film strip, e.g. `'assets/images/me-1.jpg'`.
- `about.portrait`: a cut-out photo of you. A PNG with a transparent background works best. Until you add one, a white paper silhouette stands in.
- `about.stickers`: the felt stars, sparkles and heart. Each has its page, position, size and angle, and the art names are listed in the comment.

**Experiences & Skills**
- `education.entries` and `experience.entries` read left to right with a hand-drawn arrow between them. Add or remove rows freely.
- Each experience can have an `image` (a logo or photo) inside its sketched frame.
- `skills.items`: each skill is a small tile with a bar underneath.
  - `short` is the 1–3 letters on the tile.
  - `tint` picks the tile colour.
  - `icon` lets you use your own image instead, e.g. app icons you have the right to use.
  - `value` is 0–100.
- `languages.items`: each language is a ring that fills to `value` (0–100), with an optional `level` label.

**Résumé**: put the PDF in `assets/resume/` and set `resume.file: 'assets/resume/resume.pdf'`. It opens from the résumé folder on the Contact page. Set `download: true` to download it instead of opening it in a new tab.

**Email & socials**: `contact.email` becomes a real `mailto:` link and powers the Copy button. `contact.socials` takes `label`, `handle` and `url`, and you can add or remove rows freely.

## Works: folders & projects

```js
{ id: 'video-production', name: 'Video Production', pattern: 'stripe-pink',
  projects: [
    { image: 'assets/works/my-film.jpg', aspect: '16:9', title: 'My Film', date: '2025',
      description: 'Optional one-liner', url: 'https://youtu.be/…' },
  ] }
```

- `pattern` is the folder fabric: `stripe-pink`, `gingham-blue`, `stripe-brown`, `stripe-stars` or `plaid`. Folders without one take these in turn.
- Images only: the thumbnail links out to YouTube, Vimeo, Instagram and so on, in a new tab.
- `url: ''` shows "link coming soon" instead of a broken link.
- `aspect` can be `'16:9'`, `'9:16'` or `'auto'`. Portrait and landscape share one row, nothing is cropped.
- `id` becomes the link (`#works/video-production`), so keep it lowercase-with-dashes.

## Spacing & sizes (one place)

`settings` at the top of `content.js`:

| Setting | Controls |
|---|---|
| `works.thumbHeight` / `thumbHeightMobile` | thumbnail frame height |
| `works.gap` | space between thumbnails |
| `works.frameBorder` | paper border around each thumbnail |
| `works.maxFrameWidth` | max % of the carousel one frame may take |
| `book.maxWidth`, `book.aspect`, `book.stackBelow` | binder size, proportions, and where it switches to the phone layout |
| `spiral.rings`, `spiral.ringSize` | number and size of binder rings (split into two groups) |
| `pageTurnMs`, `introAnimation` | page-turn speed, opening animation |

## Fonts

The design PDF is set in **Providence Sans Pro**, a licensed font that isn't included here. The site uses **Coming Soon** (free, Open Font License), the closest match: the same light monoline hand, rounded open letters and airy spacing.

If you own a web licence for Providence Sans Pro, add its `@font-face` in `css/theme.css` and put its name first in `--font-display`, `--font-body` and `--font-hand`. The headings' outlined sticker lettering is built from the live font with CSS, so it will switch over too.

## Colours & materials

Palette tokens are at the top of `css/theme.css`:
- `--cover` / `--cover-deep` are the binder's denim blue and the strap's deeper shade. Change these to recolour the cover; the leather grain is laid over the colour, so the texture stays.
- `--ink` is the brown text and outlines.
- `--paper`, `--brick` and `--felt-blue` are the page white and the two felt-star colours.
- `--tape`, `--pink` and `--peach` are the masking tape, bar and ring colours.
- `--f-*` are the folder fabrics.

The ticking fabric, leather, cover grain and crumpled-paper textures come from `tools/make_textures.py`. It needs Python with numpy, scipy and Pillow. Change the colours there and run `python3 tools/make_textures.py` to regenerate them.

Light comes from the top-left everywhere: highlights sit on upper-left edges and shadows fall down and to the right.

## Navigation & accessibility

- Links: `#about`, `#education`, `#works`, `#works/<folder-id>`, `#contact`. Browser back/forward and direct links work.
- Paper tabs, page-corner links, the pink arrow on the strap, and the ← → keys all turn pages. Esc closes a folder.
- Tamagotchi: ◀ swims left, ● returns to the centre (press again for a somersault), ▶ swims right. Arrow keys work while a button is focused. The underwater scene is clipped to the screen window, and the diver always stays fully inside it.
- Headings are real text: the sticker lettering is decorative, and screen readers read the plain heading.
- "Reduce motion" is respected: page turns become fades and ambient animations stop.

## Still needs your setup

- Your real text, schools, roles, skills/levels, email, social URLs, photos, project images and links.
- Résumé PDF (see above).
- No contact form is included on purpose: without a backend, the email link is the honest, working option.
