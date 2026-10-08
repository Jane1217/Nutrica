const { OpenAI } = require('openai');
const config = require('../config/config');
const { logError, logWarning } = require('../utils/logger');

class OpenAIService {
  constructor() {
    this.openaiConfig = {
      apiKey: config.openai.apiKey
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

  async analyzeImage(base64Image, mimeType = 'image/jpeg') {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and extract nutrition information. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number,\n  \"serving_size\": \"serving size string\"\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units.\n\nCRITICAL: If you cannot clearly see or recognize a nutrition label with specific values, return this JSON instead:\n{\n  \"error\": true\n}\n\nOnly return nutrition data if you can clearly see and read the nutrition facts label. Do NOT guess or provide default values. If the image is blurry, unclear, or doesn't contain a nutrition label, return the error JSON.\n\nIf you see a human face, person, or any non-food object, return the error JSON.\n\nIf you cannot recognize a specific food name, use the main unit from the nutrition label's Serving size (such as 'package', 'bowl', 'cup', etc.) as the name, and add a positive adjective before it (such as 'Delicious', 'Tasty', 'Fresh', 'Yummy', 'Nutritious'), e.g. 'Delicious Package' or 'Tasty Bowl'. Do NOT use 'unknown food', 'packaged food', 'food item', or similar generic/unknown terms. Always try to provide a positive, concrete name.\n\nCRITICAL: If any nutrition value (carbs, fats, protein) is not listed on the nutrition label or shows as 0, you MUST return 0 for that field. Do NOT leave any nutrition field blank or undefined. This ensures all nutrition fields are properly filled for the user interface.\n\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.`
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: "high" }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.2
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
            content: `Analyze this food description and estimate nutrition information based on common knowledge. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units.\n\nFood description: ${description}\n\nIMPORTANT: Provide nutrition values for the TOTAL amount described, not per unit.\n\nIf the description mentions quantities (like "2 eggs"), include that in the name. Provide realistic nutrition values based on common food items. This is estimation based on general knowledge, not extraction from nutrition labels.\n\nCRITICAL: If any nutrition value (carbs, fats, protein) is not applicable or would be 0 for the described food, you MUST return 0 for that field. Do NOT leave any nutrition field blank or undefined. This ensures all nutrition fields are properly filled for the user interface.\n\nIf you cannot understand the description or it's not related to food, return this JSON instead:\n{\n  \"error\": true\n}\n\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
        temperature: 0.2
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
      // 只取第一个emoji字符
      const text = response.choices?.[0]?.message?.content?.trim() || '';
      // 只保留第一个emoji字符
      return text.match(/\p{Emoji}/u) ? text : '🍽️';
    } catch (error) {
      logWarning('OpenAI emoji generation failed; using fallback emoji');
      return '🍽️';
    }
  }
}

module.exports = new OpenAIService();
