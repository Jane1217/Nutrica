#!/usr/bin/env node
/**
 * Prototype: generate Nutrica puzzle source material with OpenAI.
 *
 *   node scripts/puzzle-generator/generate.js banana egg sushi
 *
 * For each food it writes, into scripts/puzzle-generator/work/<id>/:
 *   source.png  - a pixel-art style picture from the image model
 *   meta.json   - name, description, 5 progress messages, target macro shares
 *
 * Then run pixelate.py to turn the picture into a 24x24 puzzle file.
 * Uses OPENAI_API_KEY from backend/.env. One image + one small text call per food.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const IMAGE_MODEL = process.env.PUZZLE_IMAGE_MODEL || 'gpt-image-1-mini';
const TEXT_MODEL = 'gpt-4.1-mini';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const imagePrompt = (food) => (
  `Pixel art sprite of a single ${food}, drawn like a retro game item. Chunky pixels, flat colors, `
  + 'a bold dark outline, at most 8 colors, simple readable shape, the object centered and filling about '
  + '70% of the frame, on a perfectly plain, flat, solid magenta background (#FF00FF) like a green-screen, with no magenta anywhere on the object. '
  + 'No text, no shadow, no gradient, no dithering, no border, no other objects.'
);

const metaPrompt = (food) => `You write copy for Nutrica, a friendly nutrition-tracking game where each day the user fills a pixel-art "${food}" puzzle by reaching their carbs, protein and fat goals.
Return ONLY JSON:
{
  "name": "short display name, Title Case",
  "description": "one warm sentence shown when the puzzle is complete",
  "descriptions": ["5 short messages for progress <25%, <50%, <75%, <90%, and 90-99%, in that order; encouraging, playful, referring to the ${food}, each under 120 characters"],
  "shares": { "carbs": number, "protein": number, "fats": number }
}
"shares" is the real share of calories of a typical serving of ${food} from each macro; the three numbers are between 0 and 1 and sum to 1 (round to 2 decimals).`;

async function main() {
  const foods = process.argv.slice(2);
  if (foods.length === 0) {
    console.error('usage: node generate.js <food> [food...]');
    process.exit(1);
  }
  for (const food of foods) {
    const id = food.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const dir = path.join(__dirname, 'work', id);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`[${id}] generating picture with ${IMAGE_MODEL} ...`);
    const image = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: imagePrompt(food),
      size: '1024x1024',
      quality: 'low',
      n: 1,
    });
    fs.writeFileSync(path.join(dir, 'source.png'), Buffer.from(image.data[0].b64_json, 'base64'));

    console.log(`[${id}] writing copy ...`);
    const text = await client.chat.completions.create({
      model: TEXT_MODEL,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: metaPrompt(food) }],
    });
    const meta = JSON.parse(text.choices[0].message.content);
    meta.id = id;
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
    console.log(`[${id}] done: ${meta.name}`);
  }
}

main().catch((error) => { console.error('FAILED:', error.message); process.exit(1); });
