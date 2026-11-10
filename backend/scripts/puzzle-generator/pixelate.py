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


def cut_cells(img, is_bg, step, margin):
    w, h = img.size
    px = img.load()
    pts = [(cx * step, cy * step) for cy, row in enumerate(is_bg) for cx, v in enumerate(row) if not v]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    side = max(x1 - x0, y1 - y0) * margin
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    left, top = cx - side / 2, cy - side / 2
    cell = side / GRID

    cells = [[None] * GRID for _ in range(GRID)]
    for gy in range(GRID):
        for gx in range(GRID):
            sx0, sy0 = int(left + gx * cell), int(top + gy * cell)
            sx1, sy1 = int(left + (gx + 1) * cell), int(top + (gy + 1) * cell)
            total = fg = 0
            r = g = b = 0
            for y in range(max(sy0, 0), min(sy1, h), step):
                for x in range(max(sx0, 0), min(sx1, w), step):
                    total += 1
                    if not is_bg[y // step][x // step]:
                        p = px[x, y]
                        fg += 1
                        r += p[0]; g += p[1]; b += p[2]
            if total and fg / total >= 0.5:
                cells[gy][gx] = (r / fg, g / fg, b / fg)
    return cells


def cells_for_puzzle(img):
    """Draw the object as large as the canvas allows (the more cells, the clearer the picture)."""
    bg = background_colour(img)
    is_bg, step = foreground_mask(img, bg)
    cells = cut_cells(img, is_bg, step, FILL_MARGIN)
    return cells, sum(1 for row in cells for c in row if c)


# ---- 2. reduce to a small palette -----------------------------------------------------
def kmeans(points, k, seed=7, iters=25):
    rnd = random.Random(seed)
    centres = [rnd.choice(points)]
    while len(centres) < k:                          # k-means++ seeding
        d = [min(dist2(p, c) for c in centres) for p in points]
        total = sum(d)
        if total == 0:
            break
        pick, acc = rnd.random() * total, 0
        for p, w in zip(points, d):
            acc += w
            if acc >= pick:
                centres.append(p)
                break
    for _ in range(iters):
        groups = [[] for _ in centres]
        for p in points:
            groups[min(range(len(centres)), key=lambda i: dist2(p, centres[i]))].append(p)
        new = [tuple(sum(v[i] for v in g) / len(g) for i in range(3)) if g else centres[j]
               for j, g in enumerate(groups)]
        if new == centres:
            break
        centres = new
    return centres


def keep_visible(rgb, min_dist=22):
    """Near-white foods vanish on the off-white puzzle background: shade them until they show."""
    bg = tuple(int(BG_HEX[i:i + 2], 16) for i in (1, 3, 5))
    for _ in range(12):
        if dist2(rgb, bg) >= min_dist ** 2:
            break
        rgb = tuple(c * 0.97 for c in rgb)
    return rgb


def distinct_colour(palette, rgb):
    """A colour belongs to exactly one nutrient, so no two palette entries may share a hex value."""
    taken = {hex_of(c) for c in palette}
    for _ in range(40):
        if hex_of(rgb) not in taken:
            return rgb
        rgb = tuple(c + (255 - c) * 0.03 if c < 250 else c - 3 for c in rgb)
    raise ValueError('could not find a distinct colour')


def quantise(cells, k=8):
    pts = [c for row in cells for c in row if c]
    merged = []
    for c in kmeans(pts, min(k, len(pts))):
        if all(dist2(c, m) > 22 ** 2 for m in merged):
            merged.append(c)
    index = [[None] * GRID for _ in range(GRID)]
    for y in range(GRID):
        for x in range(GRID):
            if cells[y][x]:
                index[y][x] = min(range(len(merged)), key=lambda i: dist2(cells[y][x], merged[i]))
    palette = []
    for c in merged:
        palette.append(distinct_colour(palette, keep_visible(c)))
    return palette, index


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
    for _ in range(5):
        if max(abs(shares[k] - TARGET[k]) for k in (1, 2, 3)) <= TOLERANCE:
            break
        counts = counts_of(palette, index)
        candidates = [i for i in range(len(palette)) if counts[i] >= 10]
        if not candidates or len(palette) >= 11:
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
        cells, count = cells_for_puzzle(src)
        best = None                           # try a few palette sizes, keep the one closest to the rules
        for k in (8, 7, 9, 6, 10):
            palette, index = quantise(cells, k)
            nutrient_of, shares = fit_to_rules(palette, index)
            error = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3))
            if best is None or error < best[0]:
                best = (error, palette, index, nutrient_of, shares)
            if error <= TOLERANCE:
                break
        _, palette, index, nutrient_of, shares = best
        write_puzzle(out_dir, meta, palette, index, nutrient_of)
        fg = sum(counts_of(palette, index))
        report.append((meta['name'], fg, len(palette), largest_component_share(index), shares))
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
    print(f"{'puzzle':16} {'cells':>5} {'colours':>7} {'connected':>9}   carbs/protein/fats")
    for name, fg, k, comp, shares in report:
        ok = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3)) <= TOLERANCE + 0.02
        print(f"{name:16} {fg:5d} {k:7d} {comp:9.0%}   " + ' '.join(f'{shares[x]:.2f}' for x in (1, 2, 3))
              + ('' if ok else '  <-- outside the rules'))


if __name__ == '__main__':
    main()
