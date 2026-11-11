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
  * Daily goals are split 50% carbs / 30% fats / 20% protein of calories. Pixels are shared out the same
    way as closely as the colour families allow (carbs 50%, fats 30%, protein 20% of the painted cells).
  * Every nutrient is ONE colour family (a few shades of a single hue) and every colour belongs to exactly one
    nutrient, like the hand-drawn puzzles. The dark outline is a family of its own.
  * The app fills each nutrient bottom-up on its own, so the grouping prefers cuts that fill evenly (fill_scatter).
  * There is no limit on the number of painted cells: the object is drawn as large as the 24x24 canvas allows.
Usage:  pixelate.py <theme>          build the puzzles from work/<theme>/<puzzle>/source.png
        pixelate.py <theme> --all    review every candidate_N.png (work/<theme>/candidates_art.png)
Pure Python + Pillow.
"""
import json
import math
import os
import random
import sys
from itertools import product

from PIL import Image, ImageDraw

GRID = 24
BG_HEX = '#F3F3EC'                       # the puzzle background colour (nutrient 0)
FILL_MARGIN = 1.09                       # canvas / object size: about one empty cell around the picture
SPLIT_KCAL = {'carbs': 0.50, 'fats': 0.30, 'protein': 0.20}      # nutrition.js
TARGET = {1: SPLIT_KCAL['carbs'], 2: SPLIT_KCAL['protein'], 3: SPLIT_KCAL['fats']}   # nutrient 1 carbs, 2 protein, 3 fats
SCATTER_WEIGHT = 900                     # cost of an unevenly filling picture (see fill_scatter)
SHARE_LIMIT = 0.10                       # max share error per nutrient: colours are discrete and each nutrient is one colour family
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


def fix_magenta_fringe(palette, index):
    """The pictures are drawn on a magenta background, so where a dark outline is anti-aliased against it a few
    cells come out dark pink. A colour that is magenta-ish and sits (almost) only on the silhouette edge is that
    fringe, not part of the food: give those cells the outline colour (the darkest one) instead."""
    if not palette:
        return index
    dark = min(range(len(palette)), key=lambda i: luminance(palette[i]))
    if luminance(palette[dark]) >= 110:
        return index
    edge = set()
    for y in range(GRID):
        for x in range(GRID):
            if index[y][x] is None:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < GRID and 0 <= ny < GRID) or index[ny][nx] is None:
                    edge.add((x, y))
                    break
    counts = counts_of(palette, index)
    for i, rgb in enumerate(palette):
        if i == dark or not counts[i]:
            continue
        L, C, h = lch(rgb_to_lab(rgb))
        hue = math.degrees(h) % 360
        on_edge = sum(1 for (x, y) in edge if index[y][x] == i)
        if C > 25 and 290 <= hue <= 355 and on_edge / counts[i] >= 0.6:
            for (x, y) in edge:
                if index[y][x] == i:
                    index[y][x] = dark
            for y in range(GRID):
                for x in range(GRID):
                    if index[y][x] == i:        # the few interior cells of the same fringe colour
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
    index = fix_magenta_fringe(palette, index)
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


def lab_to_rgb(lab):
    L, a, b = lab
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    inv = lambda t: t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    x, y, z = 0.95047 * inv(fx), inv(fy), 1.08883 * inv(fz)
    r = 3.2406 * x - 1.5372 * y - 0.4986 * z
    g = -0.9689 * x + 1.8758 * y + 0.0415 * z
    bl = 0.0557 * x - 0.2040 * y + 1.0570 * z
    gamma = lambda v: 12.92 * v if v <= 0.0031308 else 1.055 * max(v, 0) ** (1 / 2.4) - 0.055
    return tuple(max(0.0, min(255.0, 255 * gamma(v))) for v in (r, g, bl))


def lch(lab):
    return lab[0], math.hypot(lab[1], lab[2]), math.atan2(lab[2], lab[1])


def from_lch(L, C, h):
    return (L, C * math.cos(h), C * math.sin(h))


# ---- 3. give every colour to carbs (1), protein (2) or fats (3) -------------------------
def counts_of(palette, index):
    counts = [0] * len(palette)
    for row in index:
        for i in row:
            if i is not None:
                counts[i] += 1
    return counts


def fit_families(palette, index):
    """The hand-drawn puzzles give each nutrient ONE colour family: a few shades of the same hue (carrot: orange
    reds, a dark brown, greens). So the palette is cut into three groups whose colours are as close as possible
    to each other (little spread of hue inside a group), and the groups are the nutrients. Among the cuts that
    keep the groups coherent, the one whose pixel shares are closest to TARGET (50/20/30) wins."""
    counts = counts_of(palette, index)
    total = sum(counts)
    n = len(palette)
    feats = []
    for c in palette:
        L, a, b = rgb_to_lab(c)
        feats.append((0.45 * L, a, b))                           # hue matters more than lightness
    sq = [f[0] ** 2 + f[1] ** 2 + f[2] ** 2 for f in feats]
    ranked = []
    for assign in product((1, 2, 3), repeat=n):
        w = [0, 0, 0, 0]
        sx, sy, sz, s2 = [0.0] * 4, [0.0] * 4, [0.0] * 4, [0.0] * 4
        for i in range(n):
            g, c = assign[i], counts[i]
            w[g] += c
            sx[g] += c * feats[i][0]
            sy[g] += c * feats[i][1]
            sz[g] += c * feats[i][2]
            s2[g] += c * sq[i]
        if min(w[1], w[2], w[3]) < 0.07 * total:                 # every nutrient needs a real share of the picture
            continue
        spread = sum(s2[g] - (sx[g] ** 2 + sy[g] ** 2 + sz[g] ** 2) / w[g] for g in (1, 2, 3)) / total
        err = max(abs(w[g] / total - TARGET[g]) for g in (1, 2, 3))
        ranked.append((spread + 2500 * err ** 2, assign, spread, {g: w[g] / total for g in (1, 2, 3)}))
    if not ranked:
        raise ValueError('palette too small to cover carbs, protein and fats')
    ranked.sort(key=lambda r: r[0])
    best = None
    for cost, assign, spread, shares in ranked[:25]:              # among the coherent cuts, prefer one that fills bottom-up
        grid = [[0 if i is None else assign[i] for i in row] for row in index]
        scatter = fill_scatter(grid)
        total_cost = cost + SCATTER_WEIGHT * scatter
        if best is None or total_cost < best[0]:
            best = (total_cost, assign, spread, shares, scatter)
    _, assign, spread, shares, scatter = best
    return list(assign), shares, spread, scatter


def unify_hues(palette, index, nutrient_of):
    """Pull every group onto one hue: shades of the same family only differ in lightness (and a little in
    saturation). The dark group (outline, deep shadow) takes the hue of the biggest coloured group, which makes it
    a dark brown / dark green rather than a grey."""
    counts = counts_of(palette, index)
    labs = [rgb_to_lab(c) for c in palette]
    groups = {g: [i for i in range(len(palette)) if nutrient_of[i] == g] for g in (1, 2, 3)}

    def mean_hue(members):
        x = sum(counts[i] * lch(labs[i])[1] * math.cos(lch(labs[i])[2]) for i in members if lch(labs[i])[1] >= 10)
        y = sum(counts[i] * lch(labs[i])[1] * math.sin(lch(labs[i])[2]) for i in members if lch(labs[i])[1] >= 10)
        return math.atan2(y, x) if (x or y) else None

    mean_l = {g: sum(counts[i] * labs[i][0] for i in m) / max(1, sum(counts[i] for i in m)) for g, m in groups.items()}
    dark = [g for g in groups if mean_l[g] < 40]
    coloured = [g for g in groups if g not in dark]
    body = max(coloured or groups, key=lambda g: sum(counts[i] for i in groups[g]))
    out = list(palette)
    for g, members in groups.items():
        hue = mean_hue(groups[body] if g in dark else members)
        for i in members:
            L, C, h = lch(labs[i])
            if g in dark:
                if hue is None:
                    continue
                new = from_lch(L, min(max(C, 10), 24), hue)
            elif hue is not None and C >= 8:
                dh = math.atan2(math.sin(hue - h), math.cos(hue - h))
                new = from_lch(L, C, h + 0.85 * dh)
            else:
                continue
            out[i] = lab_to_rgb(new)
    return out


PROGRESS_CASES = [(.3, .3, .3), (.5, .5, .5), (.7, .7, .7), (.5, .3, .7), (.3, .7, .5), (.7, .5, .3), (.6, .4, .5)]


def fill_scatter(nutrients):
    """How far the way the app fills the picture is from a clean bottom-to-top fill. The app fills every nutrient
    on its own, bottom row first, so the picture only fills evenly if each nutrient's cells are spread over the
    same heights. For several progress mixes (carbs, protein, fats) this is the share of (filled, unfilled)
    cell pairs where the filled cell sits ABOVE the unfilled one: 0 = perfectly bottom-up, 0.5 = random.
    `nutrients` is a 24x24 grid of 0 (empty) or the nutrient 1/2/3."""
    order = {1: [], 2: [], 3: []}
    for y in range(GRID - 1, -1, -1):
        for x in range(GRID):
            if nutrients[y][x]:
                order[nutrients[y][x]].append(y)
    scores = []
    for mix in PROGRESS_CASES:
        filled, empty = [0] * GRID, [0] * GRID
        for n, p in zip((1, 2, 3), mix):
            take = round(len(order[n]) * p)
            for j, y in enumerate(order[n]):
                (filled if j < take else empty)[y] += 1
        f_total, e_total = sum(filled), sum(empty)
        if not f_total or not e_total:
            continue
        inversions = sum(filled[a] * empty[b] for a in range(GRID) for b in range(a + 1, GRID))   # a is above b
        scores.append(inversions / (f_total * e_total))
    return sum(scores) / len(scores)


def despeckle(index):
    """A cell with no neighbour of its own colour is noise from the resampling, not a detail: take the colour
    most of its neighbours have."""
    out = [row[:] for row in index]
    for y in range(GRID):
        for x in range(GRID):
            c = index[y][x]
            if c is None:
                continue
            near = [index[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                    if (dx or dy) and 0 <= x + dx < GRID and 0 <= y + dy < GRID]
            if c not in near:
                colours = [v for v in near if v is not None]
                if len(colours) >= 5:
                    out[y][x] = max(set(colours), key=colours.count)
    return out


def fit_to_rules(palette, index):
    index = despeckle(index)
    used = sorted({i for row in index for i in row if i is not None})
    remap = {old: new for new, old in enumerate(used)}
    index = [[None if i is None else remap[i] for i in row] for row in index]
    palette = [palette[i] for i in used]
    nutrient_of, shares, spread, scatter = fit_families(palette, index)
    palette = unify_hues(palette, index, nutrient_of)
    unique = []
    for c in palette:
        unique.append(distinct_colour(unique, c))
    return unique, index, nutrient_of, shares, spread, scatter


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


def process(path):
    """Cut one picture into a puzzle: try a few palette sizes, keep the cut with the most coherent colour
    families and the pixel shares closest to the rules."""
    src = Image.open(path).convert('RGB')
    prepared = Source(src)
    best = None
    for k in (10, 9, 8, 7):
        palette, index = cut_index(prepared, k)
        palette, index, nutrient_of, shares, spread, scatter = fit_to_rules(palette, index)
        error = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3))
        score = spread + 2500 * error ** 2 + SCATTER_WEIGHT * scatter
        if best is None or score < best['score']:
            best = dict(score=score, palette=palette, index=index, nutrient_of=nutrient_of, shares=shares,
                        spread=spread, scatter=scatter, blocks=prepared.block_info)
    best['src'] = src
    return best


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        sys.exit('usage: pixelate.py <theme_id> [--all]')
    theme_id = args[0]
    theme = json.load(open(os.path.join(HERE, 'work', theme_id, 'theme.json')))
    out_dir = os.path.join(HERE, 'samples', theme_id)

    if '--all' in sys.argv:
        # review every drawn candidate (candidate_N.png) so the best picture can be chosen by eye
        pad, size = 8, 244
        names = [meta for meta in theme['puzzles']]
        cols = 4
        sheet = Image.new('RGB', (cols * 2 * size + (cols * 2 + 1) * pad, len(names) * (size + pad) + pad), 'white')
        for r, meta in enumerate(names):
            for c in range(cols):
                path = os.path.join(HERE, 'work', theme_id, meta['id'], f'candidate_{c + 1}.png')
                if not os.path.exists(path):
                    continue
                got = process(path)
                sheet.paste(got['src'].resize((size, size)), (pad + c * 2 * (size + pad), pad + r * (size + pad)))
                sheet.paste(render(got['index'], got['palette'], got['nutrient_of'], 'art', 1.0).resize((size, size)),
                            (pad + (c * 2 + 1) * (size + pad), pad + r * (size + pad)))
                print(f"{meta['name']:16} candidate {c + 1}: shares " + '/'.join(f'{got["shares"][x]:.2f}' for x in (1, 2, 3))
                      + f"  spread {got['spread']:.0f}  scatter {got['scatter']:.2f}")
        sheet.save(os.path.join(HERE, 'work', theme_id, 'candidates_art.png'))
        return

    os.makedirs(out_dir, exist_ok=True)
    rows, report = [], []
    for meta in theme['puzzles']:
        got = process(os.path.join(HERE, 'work', theme_id, meta['id'], 'source.png'))
        palette, index, nutrient_of, shares = got['palette'], got['index'], got['nutrient_of'], got['shares']
        write_puzzle(out_dir, meta, palette, index, nutrient_of)
        fg = sum(counts_of(palette, index))
        report.append((meta['name'], fg, len(palette), largest_component_share(index), shares, got['blocks']))
        rows.append((got['src'].resize((240, 240)), render(index, palette, nutrient_of, 'art', 1.0),
                     render(index, palette, nutrient_of, 'art', 0.5), render(index, palette, nutrient_of, 'map', 1.0)))

    theme_out = {k: theme[k] for k in ('id', 'title', 'description', 'type', 'count')}
    theme_out['bg_color'] = theme.get('bg_color') or '#F8D77A'
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
    for name, fg, k, comp, shares, blocks in report:
        ok = max(abs(shares[x] - TARGET[x]) for x in (1, 2, 3)) <= SHARE_LIMIT
        print(f"{name:16} {fg:5d} {k:7d} {comp:9.0%}   " + ' '.join(f'{shares[x]:.2f}' for x in (1, 2, 3))
              + ('' if ok else '  <-- outside the rules'))


if __name__ == '__main__':
    main()
