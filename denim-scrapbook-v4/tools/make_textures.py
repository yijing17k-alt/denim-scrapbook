"""Generates the seamless material textures in assets/textures/.

    python3 tools/make_textures.py

Needs numpy, scipy and Pillow. Tweak the colours below and re-run to
re-tint the denim or paper; the CSS picks the files up automatically.
"""
import os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def periodic_noise(n, sigma, amp):
    """Smooth noise that tiles seamlessly (wrap-mode blur)."""
    a = gaussian_filter(rng.standard_normal((n, n)), sigma, mode='wrap')
    a = a / (np.abs(a).max() + 1e-9)
    return a * amp


# ------------------------------------------------------------------ denim
def denim(size=768, scale=2, pitch=4):   # (size*scale) must divide by 4*pitch to tile
    n = size * scale
    t = pitch                       # thread width at render scale
    y, x = np.mgrid[0:n, 0:n]
    i, j = x // t, y // t           # warp column, weft row
    cols, rows = n // t + 1, n // t + 1
    # 3/1 right-hand twill: warp floats over 3 picks, under 1
    warp_up = ((i + j) % 4) != 3

    u = (x % t) / t                 # position across a warp thread
    v = (y % t) / t                 # position across a weft thread
    jitter = rng.normal(0, 0.12, cols)[i % cols]
    warp_round = 0.66 + 0.34 * np.sin(np.pi * np.clip(u + jitter, 0, 1))
    weft_round = 0.78 + 0.22 * np.sin(np.pi * v)

    # per-thread dye variation + slubs (thicker, lighter patches along a thread)
    thread_tone = 1 + rng.normal(0, 0.11, cols)[i % cols]
    slub_phase = rng.uniform(0, 2 * np.pi, cols)[i % cols]
    slub_freq = rng.integers(2, 6, cols)[i % cols]
    slub = 1 + 0.10 * np.clip(np.sin(2 * np.pi * slub_freq * y / n + slub_phase), 0.55, 1) - 0.055
    cell = 1 + rng.normal(0, 0.035, (rows + 1, cols + 1))[j % rows, i % cols]

    indigo = np.array([62, 88, 120], float)
    ecru = np.array([118, 136, 160], float)   # weft only peeks through: keep it close to the indigo
    warp_rgb = indigo[None, None] * (warp_round * thread_tone * slub * cell)[..., None]
    weft_rgb = ecru[None, None] * (weft_round * (1 + rng.normal(0, 0.03, (rows + 1, 1))[j % rows, 0]))[..., None]
    img = np.where(warp_up[..., None], warp_rgb, weft_rgb)

    # soft fades and grain
    # washes: broad soft fades + faint vertical yarn streaks (ring-spun warp)
    fade = periodic_noise(n, 140, 0.13)[..., None] + periodic_noise(n, 36, 0.045)[..., None]
    streak = gaussian_filter(rng.standard_normal(n), 3, mode='wrap')
    fade = fade + (streak / np.abs(streak).max() * 0.035)[None, :, None]
    grain = periodic_noise(n, 0.8, 0.04)[..., None]
    img = img * (1 + fade + grain)
    img = gaussian_filter(img, (0.6, 0.6, 0), mode='wrap')
    neps = rng.random((n, n)) < 0.0012
    img[neps] = img[neps] * 0.4 + 150
    img = np.clip(img, 0, 255).astype(np.uint8)
    im = Image.fromarray(img).resize((size, size), Image.LANCZOS)
    im.save(os.path.join(OUT, 'denim.jpg'), quality=86, optimize=True)
    print('denim mean', np.asarray(im).reshape(-1, 3).mean(0).round())


# ------------------------------------------------------------------ paper
def paper(name, base, size=512, fibers=260, fiber_alpha=18, mottle=0.03, grain=0.035):
    n = size
    img = np.ones((n, n, 3)) * np.array(base, float)
    img *= 1 + periodic_noise(n, 34, mottle)[..., None]
    img *= 1 + periodic_noise(n, 0.7, grain)[..., None]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    layer = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(fibers):
        x0, y0 = rng.uniform(0, n, 2)
        ang = rng.uniform(0, np.pi)
        ln = rng.uniform(6, 26)
        bend = rng.uniform(-0.4, 0.4)
        pts = [(x0 + np.cos(ang + bend * k / 6) * ln * k / 6, y0 + np.sin(ang + bend * k / 6) * ln * k / 6) for k in range(7)]
        light = rng.random() < 0.5
        col = (255, 255, 250, fiber_alpha) if light else (120, 96, 70, fiber_alpha)
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.line([(px + ox, py + oy) for px, py in pts], fill=col, width=1)
    im = Image.alpha_composite(im, layer).convert('RGB')
    im.save(os.path.join(OUT, name), quality=88, optimize=True)


# ------------------------------------------------------------------ ticking stripe (desk)
def ticking(period=480, height=480):
    """Cream ticking fabric: wide seafoam stripes and thin tan stripes, each
    woven as fine diagonal twill lines. One tile = one stripe repeat (2x scale)."""
    W, H = period, height
    y, x = np.mgrid[0:H, 0:W]
    cream = np.array([226, 220, 202], float)
    img = np.ones((H, W, 3)) * cream
    # (start, end, colour) in tile pixels
    bands = [(64, 90, (140, 176, 166)), (220, 230, (168, 150, 124)), (246, 258, (168, 150, 124)),
             (262, 404, (140, 176, 166)), (404, 420, (168, 150, 124))]
    twill = ((x + y) % 10) < 6                        # 45° lines, tiles every 10px
    for a, b, col in bands:
        m = (x >= a) & (x < b) & twill
        img[m] = np.array(col, float)
        edge = (x >= a) & (x < b) & ~twill
        img[edge] = img[edge] * 0.985
    img *= 1 + periodic_noise(W, 30, 0.02)[:H, :W, None] if H == W else 1
    img *= 1 + periodic_noise(W, 0.7, 0.03)[..., None]
    img = gaussian_filter(img, (0.5, 0.5, 0), mode='wrap')
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'ticking.jpg'), quality=88, optimize=True)


# ------------------------------------------------------------------ worn black leather (binder)
def leather(size=640):
    n = size
    base = np.array([38, 37, 36], float)
    img = np.ones((n, n, 3)) * base
    # pebble grain: cellular-ish bumps from blurred noise, lit from the top-left
    g = periodic_noise(n, 1.2, 1.0)
    lit = np.roll(g, (1, 1), (0, 1)) - g
    img *= 1 + lit[..., None] * 0.55
    # broad mottling + worn, lighter grey patches where the finish has rubbed off
    img *= 1 + periodic_noise(n, 70, 0.22)[..., None]
    wear = np.clip(periodic_noise(n, 22, 1.0) * 0.8 + periodic_noise(n, 5, 0.35) - 0.42, 0, 1)
    img += (wear * 46)[..., None]
    # fine scratches
    sc = Image.new('L', (n, n), 0); d = ImageDraw.Draw(sc)
    for _ in range(70):
        x0, y0 = rng.uniform(0, n, 2); ang = rng.uniform(0, np.pi); ln = rng.uniform(8, 40)
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.line([(x0 + ox, y0 + oy), (x0 + ox + np.cos(ang) * ln, y0 + oy + np.sin(ang) * ln)], fill=int(rng.uniform(20, 60)), width=1)
    img += np.asarray(sc, float)[..., None] * 0.5
    img *= 1 + periodic_noise(n, 0.8, 0.06)[..., None]
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'leather.jpg'), quality=86, optimize=True)


# ------------------------------------------------------------------ crumpled note paper
def crumple(size=640):
    n = size
    img = np.ones((n, n, 3)) * np.array([238, 234, 224], float)
    # creases: sharp ridges from |noise|
    for s, a in ((48, 0.035), (20, 0.02)):
        r = periodic_noise(n, s, 1.0)
        ridge = 1 - np.clip(np.abs(r) * 4, 0, 1)
        img *= 1 - (gaussian_filter(ridge, 1.2, mode='wrap') * a)[..., None]
        sh = np.roll(r, (3, 3), (0, 1)) - r
        img *= 1 + (sh * a * 4)[..., None]
    img *= 1 + periodic_noise(n, 40, 0.03)[..., None]
    img *= 1 + periodic_noise(n, 0.7, 0.03)[..., None]
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'crumple.jpg'), quality=86, optimize=True)


# ------------------------------------------------------------------ cover grain (neutral)
def cover_grain():
    """The leather texture re-centred on mid-grey, so CSS can lay it over any
    cover colour (overlay blend) and keep the grain, wear and scratches."""
    src = np.asarray(Image.open(os.path.join(OUT, 'leather.jpg')).convert('L'), float)
    g = (src - src.mean()) * 2.2 + 128
    Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).convert('RGB').save(os.path.join(OUT, 'cover-grain.jpg'), quality=88, optimize=True)


denim()
ticking()
leather()
cover_grain()
crumple()
paper('paper.jpg', (244, 235, 221))
paper('kraft.jpg', (200, 174, 138), fibers=520, fiber_alpha=34, mottle=0.05, grain=0.05)
print('done')
