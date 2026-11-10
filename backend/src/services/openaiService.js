const { OpenAI } = require('openai');
const config = require('../config/config');
const { logError, logWarning } = require('../utils/logger');
const { extractFirstEmoji } = require('../utils/nutritionLabel');

const IMAGE_SYSTEM_PROMPT = 'You are a meticulous nutrition-label reader. You transcribe printed numbers exactly as they appear and never invent values. You answer with a single JSON object and nothing else.';

const buildImagePrompt = (previous) => {
  const recheck = previous
    ? `\n\nRE-CHECK: A previous read returned calories=${previous.calories}, carbs=${previous.carbs}g, fats=${previous.fats}g, protein=${previous.protein}g, which do not add up (calories should be roughly 4 x carbs + 9 x fats + 4 x protein). Read the label again digit by digit. Make sure you are using the same column for every value, and that you did not confuse similar digits (1/7, 3/8, 5/6, 0/8).`
    : '';

  return `Read the nutrition facts label in this image and return ONLY a JSON object with this structure:
{
  "name": "food name",
  "calories": number,
  "carbs": number,
  "fats": number,
  "protein": number,
  "serving_size": "serving size string",
  "emoji": "one emoji"
}

How to read the label:
- Use the PER SERVING column. If a label has several columns (per serving, per 100 g, per container), always take the per serving values. Only if the label shows nothing but per 100 g / per 100 ml values, use those.
- calories: the energy in kcal (the "Calories" line). If only kJ is printed, convert: kcal = kJ / 4.184, rounded to a whole number.
- carbs: "Total Carbohydrate" in grams. Do NOT use the Sugars, Fiber or Added Sugars sub-lines.
- fats: "Total Fat" in grams. Do NOT use the Saturated, Trans, Polyunsaturated or Monounsaturated sub-lines.
- protein: "Protein" in grams.
- Values must be plain numbers without units; decimals are allowed (e.g. 2.5). A value printed as "<1 g", "less than 1 g" or "0 g", or a line that is not on the label, must be 0.
- Ignore percent daily values (%DV), vitamins and minerals (sodium, cholesterol, calcium, ...). Ignore text in other languages when the same values are repeated.
- The photo may be slightly rotated, curved, or have glare. Read it carefully, but only return values you can actually read. Do NOT guess or fill in typical values.

When to return an error: if there is no clearly readable nutrition label with specific values, if the image is blurry or unclear, or if it shows a person, a face or a non-food object, return exactly:
{
  "error": true
}

Name: use the product name if it is visible. If you cannot recognize a specific food name, use the main unit from the label's Serving size (such as 'package', 'bowl', 'cup', etc.) as the name and add a positive adjective before it (such as 'Delicious', 'Tasty', 'Fresh', 'Yummy', 'Nutritious'), e.g. 'Delicious Package' or 'Tasty Bowl'. Do NOT use 'unknown food', 'packaged food', 'food item', or similar generic terms.

Emoji: the single most relevant emoji for the food or product (never a digit or a letter).

Do NOT include markdown, code blocks, or any text outside the JSON object.${recheck}`;
};

class OpenAIService {
  constructor() {
    this.openaiConfig = {
      apiKey: config.openai.apiKey,
      // Fail fast instead of hanging until the serverless function is killed
      timeout: 25000,
      maxRetries: 1
    };
    this._openai = null;
  }

  // Avoid opening a client during a health check or a Vercel cold start that
  // only serves non-AI routes.
  get openai() {
    if (!this._openai) {
      this._openai = new OpenAI(this.openaiConfig);
    }
    return this._openai;
  }

  /**
   * Read a nutrition-facts label from a photo.
   * @param {string} base64Image
   * @param {string} mimeType
   * @param {{ previous?: object }} [options] when set, asks the model to re-read
   *   the label because an earlier read was internally inconsistent.
   */
  async analyzeImage(base64Image, mimeType = 'image/jpeg', options = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: IMAGE_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: buildImagePrompt(options.previous) },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: "high" }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 400,
        temperature: 0
      });

      return response;
    } catch (error) {
      logError('OpenAI image analysis failed', error);
      throw new Error('Image analysis failed');
    }
  }

  async analyzeDescription(description) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Analyze this food description and estimate nutrition information based on common knowledge. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number,\n  \"emoji\": \"one emoji that best represents the food\"\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units.\n\nFood description: ${description}\n\nIMPORTANT: Provide nutrition values for the TOTAL amount described, not per unit.\n\nIf the description mentions quantities (like "2 eggs"), include that in the name. Provide realistic nutrition values based on common food items. This is estimation based on general knowledge, not extraction from nutrition labels.\n\nCRITICAL: If any nutrition value (carbs, fats, protein) is not applicable or would be 0 for the described food, you MUST return 0 for that field. Do NOT leave any nutrition field blank or undefined. This ensures all nutrition fields are properly filled for the user interface.\n\nIf you cannot understand the description or it's not related to food, return this JSON instead:\n{\n  \"error\": true\n}\n\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0
      });

      return response;
    } catch (error) {
      logError('OpenAI description analysis failed', error);
      throw new Error('Description analysis failed');
    }
  }

  /**
   * 根据食物名或描述生成正向相关emoji
   * @param {string} foodNameOrDesc
   * @returns {Promise<string>} emoji
   */
  async getFoodEmoji(foodNameOrDesc) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Return the most relevant emoji based on the given food name or description. Respond with a SINGLE emoji character only — no explanation, punctuation, extra emoji, or extra text. If no specific food-related emoji applies, return a positive, expressive human-face emoji that reflects the enjoyable experience of eating this food (not a generic emoji). Only a single emoji is allowed. Food description: ${foodNameOrDesc}`
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });
      const text = response.choices?.[0]?.message?.content?.trim() || '';
      // 只保留第一个真正的 emoji（\p{Emoji} 会把数字也算进去，所以不用它）
      return extractFirstEmoji(text) || '🍽️';
    } catch (error) {
      logWarning('OpenAI emoji generation failed; using fallback emoji');
      return '🍽️';
    }
  }
}

module.exports = new OpenAIService();
