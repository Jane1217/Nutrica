# Puzzle theme generator (prototype)

Generates a whole **theme** (a collection of puzzles, like "Magic Garden") and turns it into the data the
app needs. A puzzle is a 24x24 grid where every cell has a colour and a nutrient (1 carbs, 2 protein,
3 fats), in the same shape as `frontend/src/data/puzzles/carrot.js`.

```bash
# from backend/ (needs OPENAI_API_KEY in backend/.env and python3 with Pillow)
node scripts/puzzle-generator/generate.js "Breakfast Club" 6          # theme + pictures + copy -> work/breakfast_club/
node scripts/puzzle-generator/generate.js "Breakfast Club" 6 --redraw --candidates=4   # 4 drawings per puzzle (candidate_N.png)
python3 scripts/puzzle-generator/pixelate.py breakfast_club --all     # review sheet of every candidate -> work/breakfast_club/candidates_art.png
cp work/breakfast_club/<puzzle>/candidate_2.png work/breakfast_club/<puzzle>/source.png   # choose the clearest one by eye
python3 scripts/puzzle-generator/pixelate.py breakfast_club           # -> samples/breakfast_club/ (puzzles, theme.json, preview.png)
node scripts/puzzle-generator/validate.mjs scripts/puzzle-generator/samples/breakfast_club
node scripts/puzzle-generator/export-sql.mjs scripts/puzzle-generator/samples/breakfast_club   # SQL that publishes the theme
```

Review `samples/<theme>/preview.png` (picture -> 24x24 -> half filled -> nutrient map) before publishing.

## Theme types

- **collection** (default): a set of different foods, collected in any order (Magic Garden, Breakfast Club).
- **journey**: ONE character through ordered stages (egg, hatching, chick, young hen, hen). A stage can only be chosen
  once every earlier stage is collected (enforced in the puzzle picker, `utils/puzzles/journey.js`). The picture prompt
  carries a shared colour phrase (`palette_hint`) so every stage keeps the same colours, and each stage's completion
  line teases what comes next.

```bash
node scripts/puzzle-generator/generate.js "Hatch Day" 5 --type=journey --idea="one chick growing from an egg into a hen"
```

## The rules it follows

- **A theme is the unit.** Title, description, size (default 6, like Magic Garden) and the puzzles are decided
  together and every picture shares one style prompt. The size never changes after publishing, and the API only
  serves a theme that has all its puzzles.
- **Pixel shares follow the product's calorie split** (`frontend/src/utils/nutrition/nutrition.js`): calories are
  split 50% carbs / 30% fats / 20% protein, and painted cells are shared out the same way: **carbs 50%, fats 30%,
  protein 20%**, as close as the colour families allow (within 10 points; the hand-drawn puzzles range from 40% to
  79% carbs). Puzzle progress is then the share of the day's calorie goal reached through each nutrient. A user who
  follows the split fills all three together.
- **No limit on the number of cells.** The object is drawn as large as the 24x24 canvas allows, because a clear,
  detailed picture matters most (the validator only catches pictures that came out tiny).
- **One colour family per nutrient**, like the hand-drawn puzzles (carrot: orange reds / dark brown / greens): each
  nutrient is a few shades of a single hue, and every colour belongs to exactly one nutrient. The dark outline is
  one family and takes the body's hue (dark brown on a golden food, dark green on a green one).
- **Even fill.** The app fills each nutrient on its own, from the bottom up, left to right (`PixelArtGrid.jsx`), so
  a picture only fills evenly from bottom to top if every nutrient is spread over the same heights. `fill_scatter`
  measures that (0 = perfect; the hand-drawn puzzles score 0.03-0.17) and the grouping avoids scattered fills.

## How it works

1. `generate.js` asks a text model for the theme and its puzzle list, then for each puzzle an image on a flat
   **magenta** background (a green-screen colour no food uses, so near-white foods like rice are not mistaken
   for background) and its copy (completion line + 5 progress messages). The picture is requested as
   a chunky game-icon sprite that fills the canvas, in exactly three colour families (shaded body hue, dark outline,
   one accent hue) and with no plate, halo or thin details, which is what makes it readable at 24x24.
   `--redraw --candidates=N` keeps a reviewed theme and draws N pictures per puzzle to choose from.
2. `pixelate.py` finds the object by flood-filling the background from the border and **detects the picture's own
   pixel blocks** (size and phase, from where its colours change). When the object spans at most 24 blocks every
   cell is exactly one block (sampled in its middle), so nothing is resampled and no boundary gets blended;
   otherwise it falls back to a majority vote per cell (never an average, which makes muddy in-between shades,
   and a dark outline wins at a third of a cell). The palette is built in Lab colour space (k-means, several sizes).
   If the picture has an outline, every cell on the silhouette becomes the outline colour, so the outline is always
   the outermost layer (a glass wall or plate rim can never sit outside it). Lone speckle cells are removed, and a dark-magenta fringe where the outline blended with the magenta background is turned back into the outline colour.
   The palette is then cut into three colour families (the cut with the least hue spread inside the groups, the
   shares closest to 50/20/30 and the most even fill), each family becomes a nutrient, and each family's shades are
   pulled onto one hue.
3. `validate.mjs` loads every puzzle through the app's own `progress.js` and checks all the rules above.
4. `export-sql.mjs` prints the INSERTs for `puzzle_themes`, `generated_puzzles` and `collection_puzzles`
   (see `supabase/migrations/*_puzzle_themes.sql` for the tables).

## Not done yet

- Only `collection` themes. A recipe theme (ingredients that unlock a final character, like Salmon Nigiri Boy)
  needs a final artwork that is not a 24x24 grid.
- Picking the clearest of the candidates is still done by eye; a production version needs an automatic quality
  score (and to regenerate the bad ones).
- On-demand generation for users would need rate limits and content moderation.
