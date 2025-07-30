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
                text: `Analyze this food image and extract nutrition information. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number,\n  \"serving_size\": \"serving size string\"\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units.\n\nCRITICAL: If you cannot clearly see or recognize a nutrition label with specific values, return this JSON instead:\n{\n  \"error\": \"Nutrition facts not clearly visible or recognizable in the image\"\n}\n\nOnly return nutrition data if you can clearly see and read the nutrition facts label. Do NOT guess or provide default values. If the image is blurry, unclear, or doesn't contain a nutrition label, return the error JSON.\n\nIf you see a human face, person, or any non-food object, return the error JSON.\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.` 
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
            content: `Analyze this food description and extract nutrition information. Return ONLY a valid JSON object with the following structure:\n{\n  \"name\": \"food name\",\n  \"calories\": number,\n  \"carbs\": number,\n  \"fats\": number, \n  \"protein\": number\n}\n\nIMPORTANT: All nutrition values (calories, carbs, fats, protein) must be numbers without units.\n\nFood description: ${description}\n\nIMPORTANT: Provide nutrition values for the TOTAL amount described, not per unit.\n\nIf you cannot determine nutrition facts from the description, return this JSON instead:\n{\n  \"error\": \"Nutrition facts cannot be determined from the description\"\n}\n\nOnly return nutrition data if you can reasonably estimate the nutrition values. Do NOT guess or provide default values if the description is unclear or insufficient.\nDo NOT include any markdown, code blocks, or extra text, only the JSON object.`
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