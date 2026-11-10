#!/usr/bin/env python3
"""
Prototype: turn a generated theme (pictures) into Nutrica puzzles (24x24 cells).

    python3 scripts/puzzle-generator/pixelate.py breakfast_club

Reads  work/<theme>/theme.json, work/<theme>/<puzzle>/source.png + meta.json   (made by generate.js)
Writes samples/<theme>/theme.json          the theme (title, type, size, colours, puzzle list)
       samples/<theme>/<puzzle>.js         same shape as frontend/src/data/puzzles/carrot.js
       samples/<theme>/<puzzle>.svg        the finished artwork
       samples/<theme>/preview.png         review sheet

The product rules it follows (see frontend/src/utils/nutrition/nutrition.js):
  * Daily goals are 50% carbs / 30% fats / 20% protein of calories, i.e. in grams per 1000 kcal:
    carbs 125, protein 50, fats 33.3  ->  60% / 24% / 16% of the goal grams.
    Pixels are shared out the same way, so one pixel is worth the same number of grams for every
    nutrient and a user who follows the split fills all three together.
  * Every colour belongs to exactly one nutrient (that is how the nutrition pool lists them).
  * Like the hand-drawn puzzles: protein is the darkest colours (outline and shadow), fats are the
    accent colours, carbs are the body. There is no limit on the number of painted cells: the object
    is drawn as large as the 24x24 canvas allows, because a clear, detailed picture matters most.
Pure Python + Pillow.
"""
import json
import os
import random
import sys
from itertools import combinations

from PIL import Image, ImageDraw

GRID = 24
BG_HEX = '#F3F3EC'                       # the puzzle background colour (nutrient 0)
FILL_MARGIN = 1.09                       # canvas / object size: about one empty cell around the picture
SPLIT_KCAL = {'carbs': 0.50, 'fats': 0.30, 'protein': 0.20}      # nutrition.js
KCAL_PER_GRAM = {'carbs': 4, 'fats': 9, 'protein': 4}
_grams = {k: SPLIT_KCAL[k] / KCAL_PER_GRAM[k] for k in SPLIT_KCAL}
TARGET = {1: _grams['carbs'] / sum(_grams.values()),             # 0.60
          2: _grams['protein'] / sum(_grams.values()),           # 0.24
          3: _grams['fats'] / sum(_grams.values())}              # 0.16
TOLERANCE = 0.04                         # max share error per nutrient
NUTRIENT_TINT = {0: BG_HEX, 1: '#F4A259', 2: '#5B3A29', 3: '#6BBF59'}
HERE = os.path.dirname(os.path.abspath(__file__))


def hex_of(rgb):
    return '#%02X%02X%02X' % tuple(int(round(max(0, min(255, c)))) for c in rgb)


def luminance(rgb):
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def dist2(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b))


# ---- 1. find the object and cut it into 24x24 cells -------------------------------------
def background_colour(img):
    w, h = img.size
    pts = [img.getpixel((x, y)) for x, y in [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3),
                                              (w // 2, 2), (w // 2, h - 3), (2, h // 2), (w - 3, h // 2)]]
    return tuple(sorted(c[i] for c in pts)[len(pts) // 2] for i in range(3))


def foreground_mask(img, bg, step=2, tol=70):
    """Flood fill the background inwards from the border; whatever it cannot reach is the object
    (so light areas enclosed by the outline, like rice or egg white, stay part of it)."""
    w, h = img.size
    px = img.load()
    cols, rows = (w + step - 1) // step, (h + step - 1) // step
    is_bg = [[False] * cols for _ in range(rows)]
    tol2 = tol ** 2
    stack = [(cx, cy) for cx in range(cols) for cy in (0, rows - 1)] + \
            [(cx, cy) for cy in range(rows) for cx in (0, cols - 1)]
    while stack:
        cx, cy = stack.pop()
        if not (0 <= cx < cols and 0 <= cy < rows) or is_bg[cy][cx]:
            continue
        if dist2(px[min(cx * step, w - 1), min(cy * step, h - 1)], bg) > tol2:
            continue
        is_bg[cy][cx] = True
        stack += [(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)]
    return is_bg, step


def keep_visible(rgb, min_dist=22):
    """Near-white foods vanish on the off-white puzzle background: shade them until they show."""
    bg = tuple(int(BG_HEX[i:i + 2], 16) for i in (1, 3, 5))
    for _ in range(12):
        if dist2(rgb, bg) >= min_dist ** 2:
            break
        rgb = tuple(c * 0.97 for c in rgb)
    return rgb


def rgb_to_lab(rgb):
    """Perceptual colour space: distances between shades match what the eye sees, so a dark outline
    and a dark shadow stay apart where plain RGB would merge them."""
    def lin(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def detect_blocks(img, is_bg, step):
    """The model draws "pixels" of its own. Find their size and where they start, so that a 24x24 cell can
    be exactly one of them. Returns (block size, x phase, y phase) or None if the picture is not blocky."""
    import cmath
    w, h = img.size
    px = img.load()
    xs, ys = [], []
    for y in range(0, h, 3):                                  # colour changes along rows
        for x in range(1, w):
            a, b = px[x - 1, y], px[x, y]
            if not is_bg[y // step][x // step] and sum(abs(i - j) for i, j in zip(a, b)) > 60:
                xs.append(x)
    for x in range(0, w, 3):                                  # colour changes along columns
        for y in range(1, h):
            a, b = px[x, y - 1], px[x, y]
            if not is_bg[y // step][x // step] and sum(abs(i - j) for i, j in zip(a, b)) > 60:
                ys.append(y)
    if len(xs) < 200 or len(ys) < 200:
        return None
    best = None
    size = 20.0
    while size <= 70.0:                                       # which block size makes the changes line up?
        zx = sum(cmath.exp(2j * cmath.pi * x / size) for x in xs[::2]) / len(xs[::2])
        zy = sum(cmath.exp(2j * cmath.pi * y / size) for y in ys[::2]) / len(ys[::2])
        score = (abs(zx) + abs(zy)) / 2
        if best is None or score > best[0]:
            best = (score, size, zx, zy)
        size += 0.25
    score, size, zx, zy = best
    if score < 0.45:                                          # changes do not line up: not blocky
        return None
    phase = lambda z: (cmath.phase(z) % (2 * cmath.pi)) / (2 * cmath.pi) * size
    return size, phase(zx), phase(zy)


class Source:
    """A picture prepared for cutting: where the object is, and a histogram of its colours."""

    def __init__(self, img):
        self.img = img
        self.px = img.load()
        bg = background_colour(img)
        self.is_bg, self.step = foreground_mask(img, bg)
        w, h = img.size
        pts = [(cx * self.step, cy * self.step) for cy, row in enumerate(self.is_bg)
               for cx, v in enumerate(row) if not v]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        blocks = detect_blocks(img, self.is_bg, self.step)
        self.aligned = False
        self.inset = 0.0
        if blocks:
            size, phx, phy = blocks
            first_x, last_x = int((x0 - phx) // size), int((x1 - phx) // size)
            first_y, last_y = int((y0 - phy) // size), int((y1 - phy) // size)
            span_x, span_y = last_x - first_x + 1, last_y - first_y + 1
            if max(span_x, span_y) <= GRID:                    # one picture pixel = one cell, no resampling
                self.aligned = True
                self.inset = 0.25                              # sample the middle of each block only
                self.cell = size
                self.left = phx + (first_x - (GRID - span_x) // 2) * size
                self.top = phy + (first_y - (GRID - span_y) // 2) * size
                self.block_info = (round(size, 1), span_x, span_y)
        if not self.aligned:
            side = max(x1 - x0, y1 - y0) * FILL_MARGIN
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            self.left, self.top, self.cell = cx - side / 2, cy - side / 2, side / GRID
            self.block_info = None
        # histogram of foreground colours in 5-bit bins (keeps clustering fast)
        self.bins = {}
        for (x, y) in pts:
            p = self.px[min(x, w - 1), min(y, h - 1)]
            key = (p[0] >> 3, p[1] >> 3, p[2] >> 3)
            n, r, g, b = self.bins.get(key, (0, 0, 0, 0))
            self.bins[key] = (n + 1, r + p[0], g + p[1], b + p[2])

    def bin_key(self, p):
        return (p[0] >> 3, p[1] >> 3, p[2] >> 3)


def weighted_kmeans(points, weights, k, seed=7, iters=30):
    rnd = random.Random(seed)
    centres = [points[rnd.choices(range(len(points)), weights)[0]]]
    while len(centres) < k:                                  # k-means++ seeding
        d = [min(dist2(p, c) for c in centres) * w for p, w in zip(points, weights)]
        if sum(d) == 0:
            break
        centres.append(points[rnd.choices(range(len(points)), d)[0]])
    assign = [0] * len(points)
    for _ in range(iters):
        changed = False
        for i, p in enumerate(points):
            j = min(range(len(centres)), key=lambda c: dist2(p, centres[c]))
            if j != assign[i]:
                assign[i], changed = j, True
        for j in range(len(centres)):
            members = [(points[i], weights[i]) for i in range(len(points)) if assign[i] == j]
            total = sum(w for _, w in members)
            if total:
                centres[j] = tuple(sum(p[d] * w for p, w in members) / total for d in range(3))
        if not changed:
            break
    return centres, assign


def enforce_outline(palette, index):
    """If the picture has an outline (dark colour around its edge), make it the OUTERMOST layer: every cell
    on the silhouette becomes the outline colour, so a glass wall, bowl rim or plate edge never sits outside it."""
    dark = min(range(len(palette)), key=lambda i: luminance(palette[i]))
    if luminance(palette[dark]) >= 110:
        return index
    edge = []
    for y in range(GRID):
        for x in range(GRID):
            if index[y][x] is None:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < GRID and 0 <= ny < GRID) or index[ny][nx] is None:
                    edge.append((x, y))
                    break
    if edge and sum(1 for x, y in edge if index[y][x] == dark) / len(edge) >= 0.6:   # the style uses outlines
        for x, y in edge:
            index[y][x] = dark
    return index


def cut_index(src, k):
    """24x24 grid of palette indexes. Every cell takes the colour that covers most of it (no averaging,
    so no muddy in-between shades), except that a dark outline wins when it covers a third of the cell:
    outlines are thinner than a cell and a plain majority vote would erase them."""
    keys = list(src.bins)
    weights = [src.bins[key][0] for key in keys]
    rgbs = [tuple(src.bins[key][i] / src.bins[key][0] for i in (1, 2, 3)) for key in keys]
    labs = [rgb_to_lab(c) for c in rgbs]
    centres, assign = weighted_kmeans(labs, weights, min(k, len(keys)))

    # palette colours = weighted mean RGB of each cluster; merge clusters that look the same
    members = {}
    for i, j in enumerate(assign):
        members.setdefault(j, []).append(i)
    clusters = []
    for j, idxs in members.items():
        total = sum(weights[i] for i in idxs)
        rgb = tuple(sum(rgbs[i][d] * weights[i] for i in idxs) / total for d in range(3))
        clusters.append([rgb, rgb_to_lab(rgb), idxs])
    merged = []
    for rgb, lab, idxs in sorted(clusters, key=lambda c: -sum(weights[i] for i in c[2])):
        for m in merged:
            if dist2(lab, m[1]) < 7 ** 2:
                m[2].extend(idxs)
                break
        else:
            merged.append([rgb, lab, list(idxs)])
    bin_to_palette = {}
    for pi, (_, _, idxs) in enumerate(merged):
        for i in idxs:
            bin_to_palette[keys[i]] = pi
    palette = [keep_visible(m[0]) for m in merged]
    dark = min(range(len(palette)), key=lambda i: luminance(palette[i]))
    has_outline = luminance(palette[dark]) < 110

    w, h = src.img.size
    index = [[None] * GRID for _ in range(GRID)]
    for gy in range(GRID):
        for gx in range(GRID):
            sx0, sy0 = int(src.left + (gx + src.inset) * src.cell), int(src.top + (gy + src.inset) * src.cell)
            sx1, sy1 = int(src.left + (gx + 1 - src.inset) * src.cell), int(src.top + (gy + 1 - src.inset) * src.cell)
            total = fg = 0
            votes = {}
            step = src.step
            for y in range((max(sy0, 0) + step - 1) // step * step, min(sy1, h), step):   # sample on the same grid
                for x in range((max(sx0, 0) + step - 1) // step * step, min(sx1, w), step):   # the histogram used
                    total += 1
                    if not src.is_bg[y // step][x // step]:
                        fg += 1
                        pi = bin_to_palette[src.bin_key(src.px[x, y])]
                        votes[pi] = votes.get(pi, 0) + 1
            if not total or fg / total < 0.5:
                continue
            if has_outline and votes.get(dark, 0) / fg >= 0.34:
                index[gy][gx] = dark
            else:
                index[gy][gx] = max(votes, key=votes.get)
    index = enforce_outline(palette, index)
    # drop unused colours and renumber
    used = sorted({i for row in index for i in row if i is not None})
    remap = {old: new for new, old in enumerate(used)}
    index = [[None if i is None else remap[i] for i in row] for row in index]
    palette = [palette[i] for i in used]
    unique = []
    for c in palette:
        unique.append(distinct_colour(unique, c))
    return unique, index


def distinct_colour(palette, rgb):
    """A colour belongs to exactly one nutrient, so no two palette entries may share a hex value."""
    taken = {hex_of(c) for c in palette}
    for _ in range(40):
        if hex_of(rgb) not in taken:
            return rgb
        rgb = tuple(c + (255 - c) * 0.03 if c < 250 else c - 3 for c in rgb)
    raise ValueError('could not find a distinct colour')


# ---- 3. give every colour to carbs (1), protein (2) or fats (3) -------------------------
def counts_of(palette, index):
    counts = [0] * len(palette)
    for row in index:
        for i in row:
            if i is not None:
                counts[i] += 1
    return counts


def assign_nutrients(palette, index):
    """Protein = the darkest colours, fats = the accent colours (furthest from the body colour),
    carbs = the body; the three shares follow TARGET (60/24/16)."""
    counts = counts_of(palette, index)
    total = sum(counts)
    n = len(palette)
    by_dark = sorted(range(n), key=lambda i: luminance(palette[i]))
    body = max((i for i in range(n) if i != by_dark[0]), key=lambda i: counts[i])
    spread = {i: dist2(palette[i], palette[body]) ** 0.5 / 441.7 for i in range(n)}   # 0..1

    best, best_score = None, 1e9
    for p in range(1, n - 1):                              # protein = the p darkest colours
        protein = set(by_dark[:p])
        if body in protein:
            continue
        rest = [i for i in range(n) if i not in protein and i != body]
        for size in range(1, len(rest) + 1):
            for fats in combinations(rest, size):          # fats = a subset of the remaining colours
                sums = {1: 0, 2: 0, 3: 0}
                for i in range(n):
                    sums[2 if i in protein else 3 if i in fats else 1] += counts[i]
                err = sum(abs(sums[k] / total - TARGET[k]) for k in (1, 2, 3))
                score = err - 0.02 * sum(spread[i] for i in fats) / len(fats)
                if score < best_score:
                    best, best_score = (protein, set(fats)), score
    if best is None:
        raise ValueError('palette too small to cover carbs, protein and fats')
    protein, fats = best
    nutrient_of = [2 if i in protein else 3 if i in fats else 1 for i in range(n)]
    shares = {k: sum(c for c, v in zip(counts, nutrient_of) if v == k) / total for k in (1, 2, 3)}
    return nutrient_of, shares


def split_colour(palette, index, which):
    """Give the upper half of one colour's cells a slightly lighter shade, so the nutrient
    shares can be tuned in finer steps (the hand-drawn puzzles use several shades too)."""
    rows = sorted(y for y in range(GRID) for x in range(GRID) if index[y][x] == which)
    cut = rows[len(rows) // 2]
    lighter = tuple(c + (255 - c) * 0.16 for c in palette[which])
    palette.append(distinct_colour(palette, keep_visible(lighter)))
    new = len(palette) - 1
    for y in range(GRID):
        for x in range(GRID):
            if index[y][x] == which and y < cut:
                index[y][x] = new


def fit_to_rules(palette, index):
    nutrient_of, shares = assign_nutrients(palette, index)
    for _ in range(8):
        if max(abs(shares[k] - TARGET[k]) for k in (1, 2, 3)) <= TOLERANCE:
            break
        counts = counts_of(palette, index)
        candidates = [i for i in range(len(palette)) if counts[i] >= 10]
        if not candidates or len(palette) >= 14:
            break
        split_colour(palette, index, max(candidates, key=lambda i: counts[i]))
        nutrient_of, shares = assign_nutrients(palette, index)
    return nutrient_of, shares


# ---- 4. checks ------------------------------------------------------------------------
def largest_component_share(index):
    seen, best, total = set(), 0, 0
    for y in range(GRID):
        for x in range(GRID):
            if index[y][x] is None:
                continue
            total += 1
            if (x, y) in seen:
                continue
            stack, size = [(x, y)], 0
            seen.add((x, y))
            while stack:
                cx, cy = stack.pop()
                size += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < GRID and 0 <= ny < GRID and index[ny][nx] is not None and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            best = max(best, size)
    return best / total if total else 0


# ---- 5. write the puzzle file -----------------------------------------------------------
def write_puzzle(out_dir, meta, palette, index, nutrient_of):
    pid = meta['id']
    names = {1: 'C', 2: 'P', 3: 'F'}
    order, label = [], {}
    for n in (1, 2, 3):
        members = sorted([i for i, v in enumerate(nutrient_of) if v == n],
                         key=lambda i: -luminance(palette[i]))      # light first, like carrot.js
        for j, i in enumerate(members, 1):
            label[i] = f'{names[n]}{j}'
            order.append(i)

    counts = counts_of(palette, index)
    body = max((i for i in range(len(palette)) if nutrient_of[i] == 1), key=lambda i: counts[i])
    bg = tuple(c + (255 - c) * 0.55 for c in palette[body])

    lines = ["// Generated by backend/scripts/puzzle-generator (prototype) - review before shipping.",
             f"const B = {{ color: '{BG_HEX}', nutrient: 0 }};"]
    for i in order:
        lines.append(f"const {label[i]} = {{ color: '{hex_of(palette[i])}', nutrient: {nutrient_of[i]} }};")
    rows = [f"    // {y}\n    [" + ','.join('B' if i is None else label[i] for i in row) + '],'
            for y, row in enumerate(index, 1)]
    js = json.dumps
    lines += ['', f"const {pid} = {{", f"  id: {js(pid)},", f"  name: {js(meta['name'])},",
              f"  description: {js(meta['description'])},", '  descriptions: [',
              *[f"    {js(d)}," for d in meta['descriptions']], '  ],',
              f"  img: '/assets/puzzles/puzzle_{pid}.svg',", f"  bgColor: '{hex_of(bg)}',",
              '  pixelMap: [', *rows, '  ]', '};', '',
              f"export const {pid}ColorOrder = [{', '.join(label[i] + '.color' for i in order)}];",
              f"export default {pid};", '']
    with open(os.path.join(out_dir, f'{pid}.js'), 'w') as f:
        f.write('\n'.join(lines))

    cell = 10
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{GRID * cell}" height="{GRID * cell}" '
           f'viewBox="0 0 {GRID * cell} {GRID * cell}" shape-rendering="crispEdges">']
    for y in range(GRID):
        for x in range(GRID):
            if index[y][x] is not None:
                svg.append(f'<rect x="{x * cell}" y="{y * cell}" width="{cell}" height="{cell}" '
                           f'fill="{hex_of(palette[index[y][x]])}"/>')
    svg.append('</svg>')
    with open(os.path.join(out_dir, f'{pid}.svg'), 'w') as f:
        f.write('\n'.join(svg))
    return bg


# ---- 6. review sheet ------------------------------------------------------------------
def render(index, palette, nutrient_of, mode='art', fill=1.0, cell=10):
    img = Image.new('RGB', (GRID * cell, GRID * cell), BG_HEX)
    d = ImageDraw.Draw(img)
    for x in range(GRID + 1):
        d.line([(x * cell, 0), (x * cell, GRID * cell)], fill='#E7E7DE')
        d.line([(0, x * cell), (GRID * cell, x * cell)], fill='#E7E7DE')
    # the app fills each nutrient from the bottom up, left to right (PixelArtGrid.jsx)
    per = {1: [], 2: [], 3: []}
    for y in range(GRID - 1, -1, -1):
        for x in range(GRID):
            if index[y][x] is not None:
                per[nutrient_of[index[y][x]]].append((y, x))
    for n in (1, 2, 3):
        for y, x in per[n][:round(len(per[n]) * fill)]:
            colour = hex_of(palette[index[y][x]]) if mode == 'art' else NUTRIENT_TINT[n]
            d.rectangle([x * cell, y * cell, (x + 1) * cell - 1, (y + 1) * cell - 1], fill=colour)
    return img


def main():
    if len(sys.argv) != 2:
        sys.exit('usage: pixelate.py <theme_id>')
    theme_id = sys.argv[1]
    theme = json.load(open(os.path.join(HERE, 'work', theme_id, 'theme.json')))
    out_dir = os.path.join(HERE, 'samples', theme_id)
    os.makedirs(out_dir, exist_ok=True)

    rows, report = [], []
    for meta in theme['puzzles']:
        src = Image.open(os.path.join(HERE, 'work', theme_id, meta['id'], 'source.png')).convert('RGB')
        prepared = Source(src)
        best = None                           # try a few palette sizes, keep the one closest to the rules
        for k in (10, 8, 12, 9, 7, 11):
            palette, index = cut_index(prepared, k)
            nutrient_of, shares = fit_to_rules(palette, index)
            error = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3))
            if best is None or error < best[0]:
                best = (error, palette, index, nutrient_of, shares)
            if error <= TOLERANCE:
                break
        _, palette, index, nutrient_of, shares = best
        write_puzzle(out_dir, meta, palette, index, nutrient_of)
        fg = sum(counts_of(palette, index))
        report.append((meta['name'], fg, len(palette), largest_component_share(index), shares, prepared.block_info))
        rows.append((src.resize((240, 240)), render(index, palette, nutrient_of, 'art', 1.0),
                     render(index, palette, nutrient_of, 'art', 0.5), render(index, palette, nutrient_of, 'map', 1.0)))

    theme_out = {k: theme[k] for k in ('id', 'title', 'description', 'type', 'count')}
    theme_out['bg_color'] = '#D8E8E7'
    theme_out['puzzles'] = [{'id': p['id'], 'name': p['name'], 'slot': p['slot']} for p in theme['puzzles']]
    json.dump(theme_out, open(os.path.join(out_dir, 'theme.json'), 'w'), indent=2)

    pad, size = 10, 244
    sheet = Image.new('RGB', (4 * size + 5 * pad, len(rows) * size + (len(rows) + 1) * pad), 'white')
    for r, imgs in enumerate(rows):
        for c, im in enumerate(imgs):
            sheet.paste(im, (pad + c * (size + pad), pad + r * (size + pad)))
    sheet.save(os.path.join(out_dir, 'preview.png'))

    print(f"theme {theme['title']!r}: {len(report)} puzzles; target shares carbs/protein/fats = "
          + '/'.join(f'{TARGET[k]:.2f}' for k in (1, 2, 3)))
    print(f"{'puzzle':16} {'cells':>5} {'colours':>7} {'connected':>9}   carbs/protein/fats   aligned to the picture's own pixels")
    for name, fg, k, comp, shares, blocks in report:
        ok = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3)) <= TOLERANCE + 0.02
        print(f"{name:16} {fg:5d} {k:7d} {comp:9.0%}   " + ' '.join(f'{shares[x]:.2f}' for x in (1, 2, 3))
              + ('' if ok else '  <-- outside the rules')
              + (f'   {blocks[0]}px blocks, {blocks[1]}x{blocks[2]}' if blocks else '   not blocky: resampled'))


if __name__ == '__main__':
    main()
