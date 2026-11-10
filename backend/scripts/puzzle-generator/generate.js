#!/usr/bin/env node
/**
 * Prototype: generate a whole Nutrica THEME (a collection of puzzles) with OpenAI.
 *
 *   node scripts/puzzle-generator/generate.js "Breakfast Club" 6
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

const themePrompt = (title, count) => `You design themes for Nutrica, a friendly nutrition-tracking game. Each day the user fills a pixel-art puzzle of one food by reaching their carbs, protein and fat goals, and collects the puzzles of a theme. The existing theme is "Magic Garden": 6 garden vegetables (Carrot, Avocado, Tomato, Corn, Broccoli, Pumpkin).
Design the theme "${title}" with exactly ${count} puzzles. Every puzzle is ONE real food that clearly belongs to the theme and is easy to recognise as a small pixel-art sprite. The foods must be different from each other and cover a mix of carb-rich, protein-rich and fat-rich foods where the theme allows.
Return ONLY JSON:
{
  "title": "${title}",
  "description": "2-3 warm sentences in the style of: Complete daily nutrition challenge and collect ${count} nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.",
  "puzzles": [ { "name": "Short Name (1-2 words, Title Case)", "food": "what to draw, e.g. a ripe banana" } ]
}`;

const imagePrompt = (food, title) => (
  `Pixel art sprite of ${food}, one item from a themed set called "${title}", drawn like a retro game item. `
  + 'Chunky pixels, flat colors, a bold dark outline, at most 8 colors, simple readable shape, the object centered '
  + 'and filling about 70% of the frame, on a perfectly plain, flat, solid magenta background (#FF00FF) like a green-screen, '
  + 'with no magenta anywhere on the object. No text, no shadow, no gradient, no dithering, no border, no other objects.'
);

const copyPrompt = (name, title) => `You write copy for Nutrica, a friendly nutrition-tracking game where each day the user fills a pixel-art "${name}" puzzle (theme: ${title}) by reaching their carbs, protein and fat goals.
Return ONLY JSON:
{
  "description": "one warm sentence shown when the puzzle is complete, under 110 characters",
  "descriptions": ["exactly 5 short messages for progress <25%, <50%, <75%, <90%, and 90-99%, in that order; encouraging, playful, referring to the ${name}, each under 110 characters"]
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

async function main() {
  const [title, countArg] = process.argv.slice(2);
  const count = Number(countArg || 6);
  if (!title || !Number.isInteger(count) || count < 2 || count > 12) {
    console.error('usage: node generate.js "<Theme title>" [count 2-12, default 6]');
    process.exit(1);
  }

  const themeId = slug(title);
  const dir = path.join(__dirname, 'work', themeId);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`[${themeId}] designing the theme (${count} puzzles) ...`);
  const theme = await chatJson(themePrompt(title, count), 0.8);
  if (!Array.isArray(theme.puzzles) || theme.puzzles.length !== count) {
    throw new Error(`the model returned ${theme.puzzles?.length} puzzles instead of ${count}`);
  }
  theme.id = themeId;
  theme.type = 'collection';
  theme.count = count;
  theme.puzzles = theme.puzzles.map((p, i) => ({ id: `ai_${slug(p.name)}`, name: p.name, food: p.food, slot: i + 1 }));

  for (const puzzle of theme.puzzles) {
    const pdir = path.join(dir, puzzle.id);
    fs.mkdirSync(pdir, { recursive: true });
    console.log(`[${themeId}] ${puzzle.slot}/${count} ${puzzle.name}: picture with ${IMAGE_MODEL} ...`);
    const image = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: imagePrompt(puzzle.food, title),
      size: '1024x1024',
      quality: 'low',
      n: 1,
    });
    fs.writeFileSync(path.join(pdir, 'source.png'), Buffer.from(image.data[0].b64_json, 'base64'));

    const copy = await chatJson(copyPrompt(puzzle.name, title), 0.7);
    if (!Array.isArray(copy.descriptions) || copy.descriptions.length !== 5) {
      throw new Error(`${puzzle.name}: the model did not return 5 progress messages`);
    }
    puzzle.description = copy.description;
    puzzle.descriptions = copy.descriptions;
    fs.writeFileSync(path.join(pdir, 'meta.json'), JSON.stringify(puzzle, null, 2));
  }

  fs.writeFileSync(path.join(dir, 'theme.json'), JSON.stringify(theme, null, 2));
  console.log(`[${themeId}] done: ${theme.puzzles.map((p) => p.name).join(', ')}`);
}

main().catch((error) => { console.error('FAILED:', error.message); process.exit(1); });
