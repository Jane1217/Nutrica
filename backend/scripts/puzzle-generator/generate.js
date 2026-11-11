#!/usr/bin/env node
/**
 * Prototype: generate a whole Nutrica THEME (a collection of puzzles) with OpenAI.
 *
 *   node scripts/puzzle-generator/generate.js "Breakfast Club" 6
 *   node scripts/puzzle-generator/generate.js "Hatch Day" 5 --type=journey --idea="a chick growing from an egg into a hen"
 *   node scripts/puzzle-generator/generate.js "Breakfast Club" 6 --redraw    # keep the theme, draw new pictures
 *   node scripts/puzzle-generator/generate.js "Breakfast Club" 6 --recopy    # keep the pictures, write the copy again
 *   ... --redraw --only=ai_bacon --candidates=4      # draw 4 pictures to choose from (work/<id>/candidate_N.png)
 *   ... --redraw --only=ai_bacon                                             # redraw a single puzzle
 *
 * Writes into scripts/puzzle-generator/work/<theme_id>/:
 *   theme.json                  title, description, the puzzle list
 *   <puzzle_id>/source.png      a pixel-art picture from the image model
 *   <puzzle_id>/meta.json       name, description, 5 progress messages
 *
 * Then run pixelate.py <theme_id> to turn the pictures into 24x24 puzzles.
 * A theme is the unit: its title, size (default 6, like Magic Garden) and puzzles are decided
 * together, and every picture shares one style prompt so the set looks consistent.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const IMAGE_MODEL = process.env.PUZZLE_IMAGE_MODEL || 'gpt-image-1-mini';
const TEXT_MODEL = 'gpt-4.1-mini';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

// The hand-drawn themes and puzzles set the voice (see frontend/src/data/puzzles): short, witty, the food
// has a personality, no emoji, no generic cheering. These examples are fed to the model as the style guide.
const STYLE_EXAMPLES = `Theme descriptions (110-165 characters, 2-3 short sentences):
- "Complete daily nutrition challenge and collect 6 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care."
- "Collect two puzzles to unlock Salmon Nigiri Boy! The cutest sushi sidekick with a wink and a salmon-sized heart"
Puzzle messages, in progress order (<25%, <50%, <75%, <90%, 90-99%) and the completion line, 36-80 characters each:
Tomato: "Still a green blob on the vine. Not quite salad material yet." / "Getting a little red in the cheeks. Someone's blushing with nutrients!" / "Juicy things are happening. You're halfway to ketchup-level commitment." / "Looking ripe, tasting right. You're basically sun-dried on the inside." / completion "Brimming with lycopene and main character energy."
Corn: "This cob's got potential, you just can't taste it yet." / "A few kernels are starting to believe. You're heating up!" / "Halfway to golden glory. Keep it corny, in the best way." / "You're getting butter-worthy. This cob's got confidence." / completion "Fully golden, slightly dramatic. Basically one microwave from stardom."
Salmon: "Just a translucent whisper of protein. Still waiting to be sliced into greatness." / "The marbling's waking up. A little swirl, a little chill, a little wow." / "Half sashimi, half suggestion. Still slippery, still mysterious." / "Pink, plump, and nearly ceremonial. Soy sauce is watching closely." / completion "Precision, poise, and a blush of pink. The salmon stands nearly whole."`;

// A journey follows ONE character through ordered stages (egg, chick, hen ...). Stage n is unlocked by collecting
// stage n-1, so the order matters and the stages must look clearly different from each other.
const journeyPrompt = (title, count, idea) => `You design themes for Nutrica, a friendly nutrition-tracking game. Each day the user fills a pixel-art puzzle of one food by reaching their carbs, protein and fat goals, and collects puzzles. Existing themes are collections of different foods ("Magic Garden": Carrot, Avocado, Tomato, Corn, Broccoli, Pumpkin).
Design a new kind of theme, a JOURNEY called "${title}" with exactly ${count} puzzles. A journey follows ONE character or food through ${count} stages in order: ${idea}. The player must collect each stage to unlock the next, like watching it grow.
Every puzzle is one stage, drawn as a small pixel-art sprite. The stages must be easy to tell apart (a different shape or pose each time) and get more impressive towards the last stage. The character keeps the same colours in every stage.

Write in the voice of the existing themes:
${STYLE_EXAMPLES}

Return ONLY JSON:
{
  "title": "${title}",
  "description": "110-165 characters (never longer), 2-3 short sentences: invite the player to follow the journey, say that each stage unlocks the next, then one playful line. No emoji.",
  "bg_color": "ONE flat hex colour for the theme's page background, a soft but clearly coloured tone with the same lightness as #A9C971 and #FBBC91 that fits the journey (never cold blue or grey).",
  "palette_hint": "the THREE colour families used in every stage, as one short phrase: the main body hue, the very dark outline, one contrasting accent hue, for example 'creamy white shell, golden yellow fluff, orange beak'",
  "puzzles": [ { "name": "Stage name (1-2 words, Title Case, e.g. Egg)", "food": "exactly what to draw at this stage, always the same character in the same colours, e.g. a plain cream egg standing upright" } ]
}`;

const themePrompt = (title, count, type = 'collection', idea = '') => (type === 'journey' ? journeyPrompt(title, count, idea) : `You design themes for Nutrica, a friendly nutrition-tracking game. Each day the user fills a pixel-art puzzle of one food by reaching their carbs, protein and fat goals, and collects the puzzles of a theme. The existing theme is "Magic Garden": 6 garden vegetables (Carrot, Avocado, Tomato, Corn, Broccoli, Pumpkin).
Design the theme "${title}" with exactly ${count} puzzles. Every puzzle is ONE real food that clearly belongs to the theme and is easy to recognise as a small pixel-art sprite. The foods must be different from each other and cover a mix of carb-rich, protein-rich and fat-rich foods where the theme allows.

Write in the voice of the existing themes:
${STYLE_EXAMPLES}

Return ONLY JSON:
{
  "title": "${title}",
  "description": "110-165 characters (never longer), 2-3 short sentences like the Magic Garden description: invite the player to collect ${count} puzzles in the theme, then one or two short playful lines. No emoji.",
  "bg_color": "ONE flat hex colour for the theme's page background, in the mood of the theme, a soft but clearly coloured tone with the same lightness as #A9C971 (green garden) and #FBBC91 (peach recipe). Pick a colour that belongs to the theme (for example warm yellow-orange for a sunny breakfast); never a cold blue or grey unless the theme is about the sea or sky.",
  "puzzles": [ { "name": "Short Name (1-2 words, Title Case)", "food": "what to draw, e.g. a ripe banana" } ]
}`);

// The hand-drawn puzzles (carrot, tomato, salmon ...) share one look: a single chunky object that fills the
// canvas, a dark outline, and exactly three colour families (one per nutrient): a main body hue shaded in
// 3-5 steps, the dark outline, and one contrasting accent hue. The picture is asked for in that shape so the
// pixelation only has to cut it, not repair it.
const imagePrompt = (food, title, hint = '') => (
  `Polished retro game pixel art sprite of ${food}, one item of a themed set called "${title}", in the style of the food icons of a `
  + 'cosy farming game. Drawn on a tiny 24 by 24 pixel canvas: every visible pixel is a large, clear square (about 3% of the image width) '
  + 'and the sprite fills almost the whole canvas (21 to 22 pixels tall or wide), centered, with a compact chunky silhouette that is close to square. '
  + (hint ? `The whole set shares these three colour families, use them: ${hint}. ` : '')
  + 'Use exactly THREE colour families: (1) one main hue for the body of the food, shaded in 3 to 5 steps from light highlight to dark shade; '
  + '(2) a single very dark brown outline, one pixel thick, running all the way around the OUTSIDE of the sprite with nothing outside it; '
  + '(3) one contrasting accent hue with 1 or 2 shades for small details (berries, butter, a leaf, a slice). '
  + 'Show only the food itself: no plate, tray, table, steam, sparkles, text or shadow, and no white or grey parts. '
  + 'Flat side-on view for glasses and bowls (never an elliptical rim or opening) and fill containers to the brim. '
  + 'Flat colours, no anti-aliasing, no dithering, no gradient. Plain, flat, solid magenta background (#FF00FF) like a green-screen, with no magenta on the sprite.'
);

const copyPrompt = (name, title, stage = null) => `You write copy for Nutrica, a friendly nutrition-tracking game where each day the user fills a pixel-art "${name}" puzzle (theme: ${title}) by reaching their carbs, protein and fat goals.
Match the voice of the existing puzzles exactly:
${STYLE_EXAMPLES}

Rules:
- Give the ${name} a personality: a specific joke about how this food looks, cooks, tastes or behaves. Every message has its own joke or image; never generic cheering.
- NEVER use "Great job", "Keep going", "Keep it up", "Almost there" or "So close", and no emoji. At most ONE exclamation mark across all six lines.
- The five progress messages go from "barely started" (<25%), <50%, <75%, <90%, to 90-99% (nearly perfect). 36-80 characters each, one or two short sentences.
- Every line must read naturally and make sense on its own: no nonsense phrases, no pun or word repeated across the six lines, no vague filler like "breakfast legend" or "swagger".
- The completion line is 40-72 characters, one or two short sentences, with a different joke from the fifth message.${stage ? `
- This puzzle is stage ${stage.index} of ${stage.count} of the journey "${title}" (${stage.idea}). The five progress messages are about how this ONE picture is coming together (barely started, then filling in, then nearly finished) and describe only what a ${name} looks like and does, never an earlier or later stage and never "shell", "egg" or "chick" unless the ${name} really is one. ${stage.index < stage.count ? 'Only the completion line may look ahead: it teases that something new is coming, without naming the next stage.' : 'This is the final stage: the completion line celebrates arriving at the end of the journey.'}` : ''}
Return ONLY JSON:
{
  "description": "the completion line",
  "descriptions": ["exactly 5 progress messages in that order"]
}`;

async function chatJson(prompt, temperature) {
  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    temperature,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });
  return JSON.parse(response.choices[0].message.content);
}

// ---- copy checks: the same rules validate.mjs enforces, applied while writing so bad lines are retried ----
const EMOJI = /\p{Extended_Pictographic}/u;
const CLICHE = /great job|keep going|keep it up|almost there|so close|legend|swagger/i;
const lineIssues = (label, text, min, max) => {
  const out = [];
  if (typeof text !== 'string') return [`${label} is missing`];
  if (text.length < min || text.length > max) out.push(`${label} is ${text.length} characters, must be ${min}-${max}`);
  if (EMOJI.test(text)) out.push(`${label} has an emoji`);
  if (CLICHE.test(text)) out.push(`${label} uses a banned cheer or filler word`);
  return out;
};
const trigrams = (text) => {
  const words = text.toLowerCase().replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i + 2 < words.length; i += 1) out.add(words.slice(i, i + 3).join(' '));
  return out;
};

// Writes the copy for one puzzle and retries (with the problems fed back) until it passes the checks.
async function writeCopy(name, title, usedTrigrams, stage = null) {
  let feedback = '';
  let best = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const copy = await chatJson(copyPrompt(name, title, stage) + feedback, 0.9);
    const lines = Array.isArray(copy.descriptions) ? copy.descriptions : [];
    const issues = [];
    if (lines.length !== 5) issues.push(`needs exactly 5 progress messages, got ${lines.length}`);
    issues.push(...lineIssues('completion line', copy.description, 40, 72));
    lines.forEach((line, i) => issues.push(...lineIssues(`message ${i + 1}`, line, 36, 80)));
    const all = [copy.description, ...lines].filter((l) => typeof l === 'string');
    if ((all.join(' ').match(/!/g) || []).length > 1) issues.push('more than one exclamation mark');
    const repeated = [];
    all.forEach((line) => trigrams(line).forEach((g) => { if (usedTrigrams.has(g)) repeated.push(g); }));
    if (repeated.length) issues.push(`repeats wording used by other puzzles: "${[...new Set(repeated)].slice(0, 4).join('", "')}"`);
    if (!best || issues.length < best.issues.length) best = { copy, issues };
    if (issues.length === 0) break;
    feedback = `\n\nYour previous attempt had these problems, write it again and fix every one of them:\n- ${issues.join('\n- ')}`;
  }
  if (best.issues.length) console.log(`  (${name}: still ${best.issues.length} issue(s) after retries: ${best.issues.join('; ')})`);
  all_trigrams(best.copy).forEach((g) => usedTrigrams.add(g));
  return best.copy;
}
const all_trigrams = (copy) => {
  const out = new Set();
  [copy.description, ...(copy.descriptions || [])].filter((l) => typeof l === 'string').forEach((l) => trigrams(l).forEach((g) => out.add(g)));
  return out;
};

// The theme description, retried until it is 110-165 characters without emoji.
async function writeTheme(title, count, type = 'collection', idea = '') {
  let feedback = '';
  let best = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const theme = await chatJson(themePrompt(title, count, type, idea) + feedback, 0.8);
    const issues = lineIssues('description', theme.description, 110, 165);
    if (!Array.isArray(theme.puzzles) || theme.puzzles.length !== count) issues.push(`needs exactly ${count} puzzles`);
    if (!best || issues.length < best.issues.length) best = { theme, issues };
    if (issues.length === 0) break;
    feedback = `\n\nYour previous attempt had these problems, write it again and fix them:\n- ${issues.join('\n- ')}`;
  }
  return best.theme;
}

async function main() {
  const args = process.argv.slice(2);
  const redraw = args.includes('--redraw');
  const recopy = args.includes('--recopy');
  const [title, countArg] = args.filter((a) => !a.startsWith('--'));
  const count = Number(countArg || 6);
  const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const type = flag('type') || 'collection';                    // collection | journey
  const idea = flag('idea') || '';                              // journey: what grows into what
  if (!['collection', 'journey'].includes(type) || (type === 'journey' && !idea)) {
    console.error('usage: --type=collection | --type=journey --idea="a chick growing from an egg into a hen"');
    process.exit(1);
  }
  if (!title || !Number.isInteger(count) || count < 2 || count > 12) {
    console.error('usage: node generate.js "<Theme title>" [count 2-12, default 6]');
    process.exit(1);
  }

  const themeId = slug(title);
  const dir = path.join(__dirname, 'work', themeId);
  fs.mkdirSync(dir, { recursive: true });

  if (recopy) {
    // keep the pictures; write the theme description, background colour and every puzzle's copy again
    const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
    const fresh = await writeTheme(title, theme.count, theme.type || 'collection', theme.idea || '');
    theme.description = fresh.description;
    if (/^#[0-9A-Fa-f]{6}$/.test(fresh.bg_color || '')) theme.bg_color = fresh.bg_color;
    const used = new Set();
    for (const puzzle of theme.puzzles) {
      console.log(`[${themeId}] ${puzzle.slot}/${theme.count} ${puzzle.name}: writing copy ...`);
      const stage = theme.type === 'journey' ? { index: puzzle.slot, count: theme.count, idea: theme.idea } : null;
      const copy = await writeCopy(puzzle.name, title, used, stage);
      puzzle.description = copy.description;
      puzzle.descriptions = copy.descriptions;
      fs.writeFileSync(path.join(dir, puzzle.id, 'meta.json'), JSON.stringify(puzzle, null, 2));
    }
    fs.writeFileSync(path.join(dir, 'theme.json'), JSON.stringify(theme, null, 2));
    console.log(`[${themeId}] copy rewritten, background ${theme.bg_color}`);
    return;
  }

  if (redraw) {
    // keep the reviewed theme, names and copy; only draw the pictures again
    const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
    const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);   // e.g. --only=ai_bacon
    const candidates = Number((args.find((a) => a.startsWith('--candidates=')) || '').slice('--candidates='.length)) || 1;
    for (const puzzle of theme.puzzles.filter((p) => !only || p.id === only)) {
      console.log(`[${themeId}] ${puzzle.slot}/${theme.count} ${puzzle.name}: ${candidates} new picture(s) with ${IMAGE_MODEL} ...`);
      for (let i = 1; i <= candidates; i += 1) {
        const image = await client.images.generate({
          model: IMAGE_MODEL, prompt: imagePrompt(puzzle.food, title, theme.palette_hint), size: '1024x1024', quality: 'low', n: 1,
        });
        const bytes = Buffer.from(image.data[0].b64_json, 'base64');
        // candidate_N.png are for choosing by eye; source.png (the one pixelate.py reads) is the first
        fs.writeFileSync(path.join(dir, puzzle.id, `candidate_${i}.png`), bytes);
        if (i === 1) fs.writeFileSync(path.join(dir, puzzle.id, 'source.png'), bytes);
      }
    }
    console.log(`[${themeId}] redrawn: ${theme.puzzles.map((p) => p.name).join(', ')}`);
    return;
  }

  console.log(`[${themeId}] designing the theme (${count} puzzles) ...`);
  const theme = await writeTheme(title, count, type, idea);
  if (!Array.isArray(theme.puzzles) || theme.puzzles.length !== count) {
    throw new Error(`the model returned ${theme.puzzles?.length} puzzles instead of ${count}`);
  }
  const used = new Set();
  if (!/^#[0-9A-Fa-f]{6}$/.test(theme.bg_color || '')) theme.bg_color = '#F8D77A';
  theme.id = themeId;
  theme.type = type;
  if (type === 'journey') theme.idea = idea;
  theme.count = count;
  theme.puzzles = theme.puzzles.map((p, i) => ({ id: `ai_${slug(p.name)}`, name: p.name, food: p.food, slot: i + 1 }));

  for (const puzzle of theme.puzzles) {
    const pdir = path.join(dir, puzzle.id);
    fs.mkdirSync(pdir, { recursive: true });
    console.log(`[${themeId}] ${puzzle.slot}/${count} ${puzzle.name}: picture with ${IMAGE_MODEL} ...`);
    const image = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: imagePrompt(puzzle.food, title, theme.palette_hint),
      size: '1024x1024',
      quality: 'low',
      n: 1,
    });
    fs.writeFileSync(path.join(pdir, 'source.png'), Buffer.from(image.data[0].b64_json, 'base64'));

    const stage = type === 'journey' ? { index: puzzle.slot, count, idea } : null;
    const copy = await writeCopy(puzzle.name, title, used, stage);
    puzzle.description = copy.description;
    puzzle.descriptions = copy.descriptions;
    fs.writeFileSync(path.join(pdir, 'meta.json'), JSON.stringify(puzzle, null, 2));
  }

  fs.writeFileSync(path.join(dir, 'theme.json'), JSON.stringify(theme, null, 2));
  console.log(`[${themeId}] done: ${theme.puzzles.map((p) => p.name).join(', ')}`);
}

main().catch((error) => { console.error('FAILED:', error.message); process.exit(1); });
