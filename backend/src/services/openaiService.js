const { OpenAI } = require('openai');
const config = require('../config/config');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async analyzeImage(base64Image) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract nutrition facts from the image and return ONLY a valid JSON object (e.g., {\"Calories\": \"200 kcal\", \"Protein\": \"10g\"}). If unable to recognize, return {\"error\": \"Unable to recognize\"}. Do NOT include any markdown, code blocks, or extra text, only the JSON object." },
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
      console.error('OpenAI API 错误:', error);
      throw new Error('图像分析失败');
    }
  }

  async generateSummary(date, dailyData) {
    try {
      const prompt = `Based on the following nutrition facts for ${date}: ${JSON.stringify(dailyData)}, generate a concise daily diet summary. Include total calories, key nutrients, and a brief health advice. Return ONLY a valid JSON object with a "summary" field, e.g., {"summary": "Total: 600 kcal, Protein: 20g. Good balance, consider adding more fiber."}. Do NOT include any markdown, code blocks, or extra text, only the JSON object.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      });

      return response;
    } catch (error) {
      console.error('OpenAI API 错误:', error);
      throw new Error('总结生成失败');
    }
  }
}

module.exports = new OpenAIService(); 