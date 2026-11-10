#!/usr/bin/env python3
"""
Prototype: turn a generated picture into a Nutrica puzzle (24x24 cells).

    python3 scripts/puzzle-generator/pixelate.py banana egg salmon_sushi

Reads  work/<id>/source.png + work/<id>/meta.json   (made by generate.js)
Writes samples/<id>.js   - same shape as frontend/src/data/puzzles/carrot.js
       samples/<id>.svg  - the finished artwork (the app's "puzzle complete" image)
       work/preview.png  - contact sheet: source -> 24x24 -> half filled (+ the hand-drawn carrot)

Pure Python + Pillow, no other dependencies.
"""
import json
import math
import os
import random
import re
import sys
from itertools import product

from PIL import Image, ImageDraw

GRID = 24
BG_HEX = '#F3F3EC'          # the app's puzzle background colour (cell value 0)
OUTLINE_BONUS = 0.03        # hand-drawn puzzles use the darkest colour (protein) as the outline
HERE = os.path.dirname(os.path.abspath(__file__))


def hex_of(rgb):
    return '#%02X%02X%02X' % tuple(int(round(c)) for c in rgb)


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
    """Flood fill the background inwards from the border. Everything the fill cannot reach is
    the object, so light areas enclosed by the outline (rice, egg white) stay part of it."""
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


def cut_cells(img):
    bg = background_colour(img)
    w, h = img.size
    px = img.load()
    is_bg, step = foreground_mask(img, bg)
    fg_pts = [(cx * step, cy * step) for cy, row in enumerate(is_bg) for cx, v in enumerate(row) if not v]
    xs, ys = [p[0] for p in fg_pts], [p[1] for p in fg_pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    side = max(x1 - x0, y1 - y0) * 1.1
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


def quantise(cells, k):
    pts = [c for row in cells for c in row if c]
    centres = kmeans(pts, min(k, len(pts)))
    merged = []
    for c in centres:                                # merge near-duplicates
        if all(dist2(c, m) > 22 ** 2 for m in merged):
            merged.append(c)
    index = [[None] * GRID for _ in range(GRID)]
    for y in range(GRID):
        for x in range(GRID):
            if cells[y][x]:
                index[y][x] = min(range(len(merged)), key=lambda i: dist2(cells[y][x], merged[i]))
    return [keep_visible(c) for c in merged], index


def keep_visible(rgb, min_dist=22):
    """Near-white foods (rice, egg white) vanish on the puzzle's off-white background: shade
    them slightly until they stand out."""
    bg = tuple(int(BG_HEX[i:i + 2], 16) for i in (1, 3, 5))
    for _ in range(12):
        if dist2(rgb, bg) >= min_dist ** 2:
            break
        rgb = tuple(c * 0.97 for c in rgb)
    return rgb


# ---- 3. give every colour to carbs (1), protein (2) or fats (3) -------------------------
def assign_nutrients(palette, index, shares):
    counts = [0] * len(palette)
    for row in index:
        for i in row:
            if i is not None:
                counts[i] += 1
    total = sum(counts)
    floor = {k: max(0.08, shares.get(k, 0)) for k in ('carbs', 'protein', 'fats')}
    norm = sum(floor.values())
    target = {1: floor['carbs'] / norm, 2: floor['protein'] / norm, 3: floor['fats'] / norm}
    darkest = min(range(len(palette)), key=lambda i: luminance(palette[i]))

    best, best_score = None, 1e9
    for combo in product((1, 2, 3), repeat=len(palette)):
        sums = {1: 0, 2: 0, 3: 0}
        for i, n in enumerate(combo):
            sums[n] += counts[i]
        if any(sums[n] == 0 for n in (1, 2, 3)):     # every nutrient needs pixels to fill
            continue
        score = sum(abs(sums[n] / total - target[n]) for n in (1, 2, 3))
        if combo[darkest] != 2:
            score += OUTLINE_BONUS
        if score < best_score:
            best, best_score = combo, score
    if best is None:
        raise ValueError('palette too small to cover carbs, protein and fats')
    return list(best), counts, target


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
def write_puzzle(pid, meta, palette, index, nutrient_of):
    names = {1: 'C', 2: 'P', 3: 'F'}
    order, label = [], {}
    for n in (1, 2, 3):
        members = sorted([i for i, v in enumerate(nutrient_of) if v == n],
                         key=lambda i: -luminance(palette[i]))      # light first, like carrot.js
        for j, i in enumerate(members, 1):
            label[i] = f'{names[n]}{j}'
            order.append(i)

    lines = ["// Generated by backend/scripts/puzzle-generator (prototype) - review before shipping.",
             f"const B = {{ color: '{BG_HEX}', nutrient: 0 }};"]
    for i in order:
        lines.append(f"const {label[i]} = {{ color: '{hex_of(palette[i])}', nutrient: {nutrient_of[i]} }};")

    counts = {}
    for i in range(len(palette)):
        counts[i] = sum(row.count(i) for row in index)
    body = max((i for i in range(len(palette)) if nutrient_of[i] != 2), key=lambda i: counts[i])
    bg = tuple(c + (255 - c) * 0.55 for c in palette[body])

    rows = []
    for y, row in enumerate(index, 1):
        rows.append(f"    // {y}\n    [" + ','.join('B' if i is None else label[i] for i in row) + '],')
    js = json.dumps
    lines += ['', f"const {pid} = {{", f"  id: {js(pid)},", f"  name: {js(meta['name'])},",
              f"  description: {js(meta['description'])},", '  descriptions: [',
              *[f"    {js(d)}," for d in meta['descriptions']], '  ],',
              f"  img: '/assets/puzzles/puzzle_{pid}.svg',", f"  bgColor: '{hex_of(bg)}',",
              '  pixelMap: [', *rows, '  ]', '};', '',
              f"export const {pid}ColorOrder = [{', '.join(label[i] + '.color' for i in order)}];",
              f"export default {pid};", '']
    out_dir = os.path.join(HERE, 'samples')
    os.makedirs(out_dir, exist_ok=True)
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
    return order, label


# ---- 6. preview sheet ---------------------------------------------------------------
def render(index, palette, nutrient_of, fill=1.0, cell=14):
    img = Image.new('RGB', (GRID * cell, GRID * cell), BG_HEX)
    d = ImageDraw.Draw(img)
    for x in range(GRID + 1):
        d.line([(x * cell, 0), (x * cell, GRID * cell)], fill='#E7E7DE')
        d.line([(0, x * cell), (GRID * cell, x * cell)], fill='#E7E7DE')
    per = {1: [], 2: [], 3: []}
    for i in range(len(palette)):
        per[nutrient_of[i]].append(i)
    order = {n: sorted(v, key=lambda i: -luminance(palette[i])) for n, v in per.items()}
    for n in (1, 2, 3):                                   # fill each nutrient's cells in colour order
        cells = [(y, x) for i in order[n] for y in range(GRID) for x in range(GRID) if index[y][x] == i]
        for y, x in cells[:round(len(cells) * fill)]:
            d.rectangle([x * cell, y * cell, (x + 1) * cell - 1, (y + 1) * cell - 1],
                        fill=hex_of(palette[index[y][x]]))
    return img


def load_hand_drawn(path):
    src = open(path).read()
    consts = {m[0]: (m[1], int(m[2])) for m in re.findall(r"const (\w+) = \{ color: '(#\w+)', nutrient: (\d) \}", src)}
    rows = re.findall(r'^\s*\[((?:[A-Z]\d?,?)+)\],?$', src, re.M)
    palette, nutrient_of, lookup = [], [], {}
    for name, (colour, nutrient) in consts.items():
        if name == 'B':
            continue
        lookup[name] = len(palette)
        palette.append(tuple(int(colour[i:i + 2], 16) for i in (1, 3, 5)))
        nutrient_of.append(nutrient)
    index = [[None if c == 'B' else lookup[c] for c in r.split(',') if c] for r in rows]
    return index, palette, nutrient_of


def main():
    ids = sys.argv[1:]
    if not ids:
        sys.exit('usage: pixelate.py <id> [id...]')
    sheet_rows, report = [], []
    for pid in ids:
        meta = json.load(open(os.path.join(HERE, 'work', pid, 'meta.json')))
        src = Image.open(os.path.join(HERE, 'work', pid, 'source.png')).convert('RGB')
        cells = cut_cells(src)
        palette, index = quantise(cells, 8)
        nutrient_of, counts, target = assign_nutrients(palette, index, meta['shares'])
        fg = sum(counts)
        share = largest_component_share(index)
        got = {n: sum(c for c, v in zip(counts, nutrient_of) if v == n) / fg for n in (1, 2, 3)}
        write_puzzle(pid, meta, palette, index, nutrient_of)
        report.append((pid, fg, len(palette), share, got, target))
        sheet_rows.append((src.resize((336, 336)), render(index, palette, nutrient_of, 1.0),
                           render(index, palette, nutrient_of, 0.5)))

    hand = os.path.join(HERE, '../../../frontend/src/data/puzzles/carrot.js')
    if os.path.exists(hand):
        i, p, n = load_hand_drawn(hand)
        sheet_rows.append((Image.new('RGB', (336, 336), 'white'), render(i, p, n, 1.0), render(i, p, n, 0.5)))

    pad = 12
    sheet = Image.new('RGB', (3 * 340 + 4 * pad, len(sheet_rows) * 340 + pad), 'white')
    for r, (a, b, c) in enumerate(sheet_rows):
        for k, im in enumerate((a, b, c)):
            sheet.paste(im, (pad + k * (340 + pad), pad + r * 340))
    sheet.save(os.path.join(HERE, 'work', 'preview.png'))

    print(f"{'puzzle':14} {'cells':>5} {'colours':>7} {'connected':>9}   carbs/protein/fats (got vs target)")
    for pid, fg, k, share, got, target in report:
        print(f"{pid:14} {fg:5d} {k:7d} {share:9.0%}   "
              + ' '.join(f'{got[n]:.2f}/{target[n]:.2f}' for n in (1, 2, 3)))


if __name__ == '__main__':
    main()
