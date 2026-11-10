# Puzzle theme generator (prototype)

Generates a whole **theme** (a collection of puzzles, like "Magic Garden") and turns it into the data the
app needs. A puzzle is a 24x24 grid where every cell has a colour and a nutrient (1 carbs, 2 protein,
3 fats), in the same shape as `frontend/src/data/puzzles/carrot.js`.

```bash
# from backend/ (needs OPENAI_API_KEY in backend/.env and python3 with Pillow)
node scripts/puzzle-generator/generate.js "Breakfast Club" 6          # theme + pictures + copy -> work/breakfast_club/
python3 scripts/puzzle-generator/pixelate.py breakfast_club           # -> samples/breakfast_club/ (puzzles, theme.json, preview.png)
node scripts/puzzle-generator/validate.mjs scripts/puzzle-generator/samples/breakfast_club
node scripts/puzzle-generator/export-sql.mjs scripts/puzzle-generator/samples/breakfast_club   # SQL that publishes the theme
```

Review `samples/<theme>/preview.png` (picture -> 24x24 -> half filled -> nutrient map) before publishing.

## The rules it follows

- **A theme is the unit.** Title, description, size (default 6, like Magic Garden) and the puzzles are decided
  together and every picture shares one style prompt. The size never changes after publishing, and the API only
  serves a theme that has all its puzzles.
- **Pixel shares come from the daily goals** (`frontend/src/utils/nutrition/nutrition.js`): calories are split
  50% carbs / 30% fats / 20% protein, i.e. 60% / 24% / 16% of the goal *grams*. Pixels are shared out the same
  way (+-4 points), so one pixel is worth the same number of grams for every nutrient: a user who follows the
  split fills all three together, and puzzle progress equals total grams eaten / total goal grams.
- **No limit on the number of cells.** The object is drawn as large as the 24x24 canvas allows, because a clear,
  detailed picture matters most (the validator only catches pictures that came out tiny).
- **Colour roles**: protein = the darkest colours (outline and shadow), fats = the accent colours, carbs = the body.
  Every colour belongs to exactly one nutrient.
- The app fills each nutrient from the bottom up, left to right (`PixelArtGrid.jsx`).

## How it works

1. `generate.js` asks a text model for the theme and its puzzle list, then for each puzzle an image on a flat
   **magenta** background (a green-screen colour no food uses, so near-white foods like rice are not mistaken
   for background) and its copy (completion line + 5 progress messages).
2. `pixelate.py` finds the object by flood-filling the background from the border, scales it to fill the
   canvas, reduces it to a small palette (k-means, trying several sizes), assigns colours to nutrients to
   match the shares (splitting a colour into two shades when finer steps are needed) and writes the puzzle.
3. `validate.mjs` loads every puzzle through the app's own `progress.js` and checks all the rules above.
4. `export-sql.mjs` prints the INSERTs for `puzzle_themes`, `generated_puzzles` and `collection_puzzles`
   (see `supabase/migrations/*_puzzle_themes.sql` for the tables).

## Not done yet

- Only `collection` themes. A recipe theme (ingredients that unlock a final character, like Salmon Nigiri Boy)
  needs a final artwork that is not a 24x24 grid.
- Quality still needs a human look at the preview: some pictures come out with ragged outlines or scattered
  accent cells; a production version should score each result and regenerate the bad ones.
- On-demand generation for users would need rate limits and content moderation.
