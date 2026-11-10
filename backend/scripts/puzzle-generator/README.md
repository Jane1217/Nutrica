# Puzzle generator (prototype)

Turns a food name into a Nutrica puzzle: a 24x24 pixel grid where each cell has a colour and a
nutrient (1 carbs, 2 protein, 3 fats), in the same shape as `frontend/src/data/puzzles/carrot.js`.

```bash
# from backend/ (needs OPENAI_API_KEY in backend/.env and python3 with Pillow)
node scripts/puzzle-generator/generate.js banana egg "salmon sushi"   # picture + copy -> work/<id>/
python3 scripts/puzzle-generator/pixelate.py banana egg salmon_sushi  # -> samples/<id>.js, .svg, work/preview.png
node scripts/puzzle-generator/validate.mjs scripts/puzzle-generator/samples/*.js
```

## How it works

1. `generate.js` asks the image model for a single pixel-art sprite on a flat **magenta** background
   (a green-screen colour no food uses, so near-white foods like rice or egg white are not mistaken
   for background) and asks a text model for the name, the completion line, the 5 progress
   messages and the food's real macro shares.
2. `pixelate.py` finds the object by flood-filling the background from the border, crops it to a square,
   averages it into 24x24 cells, reduces it to <= 8 colours (k-means), and gives every colour to carbs,
   protein or fats so the pixel counts match the food's real macro shares (each nutrient keeps at
   least 8%, so every row of the nutrition pool has something to fill).
3. `validate.mjs` loads the result through the app's own `progress.js` and checks the grid, that full
   nutrition completes the puzzle, that half nutrition is about half, and that `colorOrder` is complete.

`samples/` holds three generated puzzles and `samples/preview.png` (picture -> 24x24 -> half filled,
with the hand-drawn carrot underneath for comparison).

## Not done yet

- The puzzles are not wired into the app (no database table, no picker entry, no `colorOrders` entry).
- Quality still needs a human look: some pictures come out with ragged outlines; a production version
  should score each result and regenerate the bad ones.
- On-demand generation for users would need rate limits and content moderation.
