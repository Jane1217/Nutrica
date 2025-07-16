const { OpenAI } = require('openai');
const config = require('../config/config');

class OpenAIService {
  constructor() {
    const openaiConfig = {
      apiKey: config.openai.apiKey
    };

    // Use proxy in development environment
    if (config.openai.proxy) {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyUrl = `${config.openai.proxy.protocol}://${config.openai.proxy.host}:${config.openai.proxy.port}`;
      openaiConfig.httpAgent = new HttpsProxyAgent(proxyUrl);
      console.log(`Using proxy: ${proxyUrl}`);
    }

    this.openai = new OpenAI(openaiConfig);
  }

  async analyzeImage(base64Image) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this food image and extract nutrition information. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number,\n  \"serving_size\": \"serving size string, e.g. 1 package (454g)\"\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units. For example:\n- calories: 140 (not \"140 kcal\")\n- carbs: 1.2 (not \"1.2g\")\n- fats: 10 (not \"10g\")\n- protein: 12 (not \"12g\")\n\nIf you cannot recognize a specific food name, use the main unit from the nutrition label's Serving size (such as 'package', 'bowl', 'cup', etc.) as the name, and add a positive adjective before it (such as 'Delicious', 'Tasty', 'Fresh', 'Yummy', 'Nutritious'), e.g. 'Delicious Package' or 'Tasty Bowl'. Do NOT use 'unknown food', 'packaged food', 'food item', or similar generic/unknown terms. Always try to provide a positive, concrete name.\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.` 
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "high" }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      console.error('OpenAI Error Details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  async analyzeDescription(description) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Analyze this food description and extract nutrition information. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units. For example:\n- calories: 140 (not \"140 kcal\")\n- carbs: 1.2 (not \"1.2g\")\n- fats: 10 (not \"10g\")\n- protein: 12 (not \"12g\")\n\nFood description: ${description}\n\nIMPORTANT: Provide nutrition values for the TOTAL amount described, not per unit. For example:\n- "2 eggs" should return the total calories, carbs, fats, protein for 2 eggs combined\n- "1 slice of bread" should return the total nutrition for 1 slice\n- "3 cups of rice" should return the total nutrition for 3 cups\n\nIf the description mentions quantities (like "2 eggs"), include that in the name. Provide realistic nutrition values based on common food items. Do NOT include any markdown, code blocks, or extra text, only the JSON object.`
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      console.error('OpenAI Error Details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      throw new Error(`Description analysis failed: ${error.message}`);
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
      console.error('OpenAI Emoji API Error:', error);
      return '🍽️';
    }
  }
}

module.exports = new OpenAIService(); 