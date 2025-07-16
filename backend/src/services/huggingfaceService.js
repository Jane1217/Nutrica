const { logInfo, logError } = require('../utils/logger');

class HuggingFaceService {
  constructor() {
    this.apiUrl = 'https://api-inference.huggingface.co/models';
    this.models = {
      imageClassification: 'microsoft/DialoGPT-medium', // 可以替换为图像分类模型
      textGeneration: 'microsoft/DialoGPT-medium'
    };
  }

  async analyzeImage(base64Image) {
    try {
      logInfo('HuggingFace: Analyzing image');
      
      // 使用 Hugging Face 的图像分类模型
      const response = await fetch(`${this.apiUrl}/google/vit-base-patch16-224`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer hf_xxx', // 需要替换为你的 Hugging Face token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `data:image/jpeg;base64,${base64Image}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      logInfo(`HuggingFace: Image analysis result: ${JSON.stringify(result)}`);

      // 解析结果并转换为营养信息
      return this.parseImageResult(result);
    } catch (error) {
      logError('HuggingFace: Image analysis failed', error);
      // 如果 Hugging Face 失败，返回默认结果
      return this.getDefaultFoodResponse();
    }
  }

  async analyzeDescription(description) {
    try {
      logInfo(`HuggingFace: Analyzing description: ${description}`);
      
      // 使用文本生成模型
      const response = await fetch(`${this.apiUrl}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer hf_xxx', // 需要替换为你的 Hugging Face token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Analyze this food: ${description}. Return nutrition info in JSON format.`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      logInfo(`HuggingFace: Description analysis result: ${JSON.stringify(result)}`);

      return this.parseDescriptionResult(result, description);
    } catch (error) {
      logError('HuggingFace: Description analysis failed', error);
      return this.getDefaultFoodResponse();
    }
  }

  async getFoodEmoji(foodNameOrDesc) {
    try {
      logInfo(`HuggingFace: Generating emoji for: ${foodNameOrDesc}`);
      
      // 简单的 emoji 映射
      const emojiMap = {
        'apple': '🍎', 'banana': '🍌', 'orange': '🍊',
        'bread': '🍞', 'rice': '🍚', 'pasta': '🍝',
        'chicken': '🍗', 'fish': '🐟', 'egg': '🥚',
        'milk': '🥛', 'yogurt': '🥛', 'pizza': '🍕',
        'burger': '🍔', 'salad': '🥗', 'soup': '🍲'
      };

      const lowerText = foodNameOrDesc.toLowerCase();
      for (const [food, emoji] of Object.entries(emojiMap)) {
        if (lowerText.includes(food)) {
          return emoji;
        }
      }

      return '🍽️';
    } catch (error) {
      logError('HuggingFace: Emoji generation failed', error);
      return '🍽️';
    }
  }

  parseImageResult(result) {
    // 解析 Hugging Face 的图像分类结果
    // 这里需要根据实际返回的数据结构进行调整
    const foodName = result[0]?.label || 'Unknown Food';
    
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            name: foodName,
            calories: this.getCaloriesForFood(foodName),
            carbs: this.getCarbsForFood(foodName),
            fats: this.getFatsForFood(foodName),
            protein: this.getProteinForFood(foodName),
            serving_size: "1 serving"
          })
        }
      }]
    };
  }

  parseDescriptionResult(result, description) {
    // 解析文本生成结果
    const foodName = this.extractFoodName(description);
    
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            name: foodName,
            calories: this.getCaloriesForFood(foodName),
            carbs: this.getCarbsForFood(foodName),
            fats: this.getFatsForFood(foodName),
            protein: this.getProteinForFood(foodName)
          })
        }
      }]
    };
  }

  extractFoodName(description) {
    const foodKeywords = [
      'apple', 'banana', 'orange', 'bread', 'rice', 'pasta',
      'chicken', 'fish', 'egg', 'milk', 'yogurt', 'pizza',
      'burger', 'salad', 'soup'
    ];

    const lowerDesc = description.toLowerCase();
    for (const food of foodKeywords) {
      if (lowerDesc.includes(food)) {
        return food.charAt(0).toUpperCase() + food.slice(1);
      }
    }

    return 'Delicious Food';
  }

  getCaloriesForFood(foodName) {
    const caloriesMap = {
      'Apple': 95, 'Banana': 105, 'Orange': 62,
      'Bread': 79, 'Rice': 130, 'Pasta': 131,
      'Chicken': 165, 'Fish': 120, 'Egg': 70,
      'Milk': 103, 'Yogurt': 59, 'Pizza': 266,
      'Burger': 354, 'Salad': 20, 'Soup': 50
    };
    return caloriesMap[foodName] || 150;
  }

  getCarbsForFood(foodName) {
    const carbsMap = {
      'Apple': 25, 'Banana': 27, 'Orange': 15,
      'Bread': 15, 'Rice': 28, 'Pasta': 25,
      'Chicken': 0, 'Fish': 0, 'Egg': 0.6,
      'Milk': 12, 'Yogurt': 3.6, 'Pizza': 33,
      'Burger': 30, 'Salad': 4, 'Soup': 8
    };
    return carbsMap[foodName] || 20;
  }

  getFatsForFood(foodName) {
    const fatsMap = {
      'Apple': 0.3, 'Banana': 0.4, 'Orange': 0.2,
      'Bread': 1, 'Rice': 0.3, 'Pasta': 1.1,
      'Chicken': 3.6, 'Fish': 4, 'Egg': 5,
      'Milk': 2.4, 'Yogurt': 0.4, 'Pizza': 10,
      'Burger': 17, 'Salad': 0.2, 'Soup': 1
    };
    return fatsMap[foodName] || 5;
  }

  getProteinForFood(foodName) {
    const proteinMap = {
      'Apple': 0.5, 'Banana': 1.3, 'Orange': 1.2,
      'Bread': 3, 'Rice': 2.7, 'Pasta': 5,
      'Chicken': 31, 'Fish': 22, 'Egg': 6,
      'Milk': 8, 'Yogurt': 10, 'Pizza': 11,
      'Burger': 16, 'Salad': 1.5, 'Soup': 3
    };
    return proteinMap[foodName] || 8;
  }

  getDefaultFoodResponse() {
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            name: 'Delicious Food',
            calories: 150,
            carbs: 20,
            fats: 5,
            protein: 8,
            serving_size: "1 serving"
          })
        }
      }]
    };
  }
}

module.exports = new HuggingFaceService(); 