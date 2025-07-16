const { logInfo, logError } = require('../utils/logger');

class NutritionService {
  constructor() {
    // 使用免费的 USDA 营养数据库 API
    this.apiUrl = 'https://api.nal.usda.gov/fdc/v1';
    this.apiKey = 'DEMO_KEY'; // 免费使用，每天限制 1000 次请求
    
    // 备用：使用 Edamam 营养数据库（需要注册获取免费 API key）
    this.edamamUrl = 'https://api.edamam.com/api/nutrition-data';
    this.edamamAppId = 'your_app_id'; // 需要注册获取
    this.edamamAppKey = 'your_app_key'; // 需要注册获取
  }

  async analyzeImage(base64Image) {
    try {
      logInfo('Nutrition API: Analyzing image (using fallback)');
      
      // 由于图片识别需要专门的 AI 服务，这里使用模拟响应
      // 你可以集成 Google Vision API 或其他免费图像识别服务
      return this.getRandomFoodResponse();
    } catch (error) {
      logError('Nutrition API: Image analysis failed', error);
      return this.getDefaultFoodResponse();
    }
  }

  async analyzeDescription(description) {
    try {
      logInfo(`Nutrition API: Analyzing description: ${description}`);
      
      // 尝试从 USDA 数据库获取营养信息
      const foodData = await this.searchUSDAFood(description);
      
      if (foodData) {
        return {
          choices: [{
            message: {
              content: JSON.stringify(foodData)
            }
          }]
        };
      }
      
      // 如果 USDA 没有找到，尝试 Edamam
      const edamamData = await this.searchEdamamFood(description);
      
      if (edamamData) {
        return {
          choices: [{
            message: {
              content: JSON.stringify(edamamData)
            }
          }]
        };
      }
      
      // 如果都没有找到，使用本地数据库
      return this.getLocalFoodData(description);
      
    } catch (error) {
      logError('Nutrition API: Description analysis failed', error);
      return this.getLocalFoodData(description);
    }
  }

  async searchUSDAFood(query) {
    try {
      const response = await fetch(
        `${this.apiUrl}/foods/search?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&pageSize=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        const nutrients = food.foodNutrients || [];
        
        return {
          name: food.description,
          calories: this.extractNutrient(nutrients, 'Energy'),
          carbs: this.extractNutrient(nutrients, 'Carbohydrate, by difference'),
          fats: this.extractNutrient(nutrients, 'Total lipid (fat)'),
          protein: this.extractNutrient(nutrients, 'Protein'),
          serving_size: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit}` : "100g"
        };
      }
      
      return null;
    } catch (error) {
      logError('USDA API search failed', error);
      return null;
    }
  }

  async searchEdamamFood(query) {
    try {
      const response = await fetch(
        `${this.edamamUrl}?app_id=${this.edamamAppId}&app_key=${this.edamamAppKey}&ingr=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Edamam API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.totalNutrients) {
        return {
          name: query,
          calories: data.calories || 0,
          carbs: data.totalNutrients.CHOCDF?.quantity || 0,
          fats: data.totalNutrients.FAT?.quantity || 0,
          protein: data.totalNutrients.PROCNT?.quantity || 0,
          serving_size: "100g"
        };
      }
      
      return null;
    } catch (error) {
      logError('Edamam API search failed', error);
      return null;
    }
  }

  extractNutrient(nutrients, name) {
    const nutrient = nutrients.find(n => n.nutrientName === name);
    return nutrient ? nutrient.value : 0;
  }

  getLocalFoodData(description) {
    // 本地食物数据库作为备用
    const foodDatabase = {
      'apple': { name: 'Apple', calories: 95, carbs: 25, fats: 0.3, protein: 0.5 },
      'banana': { name: 'Banana', calories: 105, carbs: 27, fats: 0.4, protein: 1.3 },
      'orange': { name: 'Orange', calories: 62, carbs: 15, fats: 0.2, protein: 1.2 },
      'bread': { name: 'Bread', calories: 79, carbs: 15, fats: 1, protein: 3 },
      'rice': { name: 'Rice', calories: 130, carbs: 28, fats: 0.3, protein: 2.7 },
      'chicken': { name: 'Chicken Breast', calories: 165, carbs: 0, fats: 3.6, protein: 31 },
      'fish': { name: 'Fish', calories: 120, carbs: 0, fats: 4, protein: 22 },
      'egg': { name: 'Egg', calories: 70, carbs: 0.6, fats: 5, protein: 6 },
      'milk': { name: 'Milk', calories: 103, carbs: 12, fats: 2.4, protein: 8 },
      'pizza': { name: 'Pizza', calories: 266, carbs: 33, fats: 10, protein: 11 },
      'burger': { name: 'Burger', calories: 354, carbs: 30, fats: 17, protein: 16 },
      'salad': { name: 'Salad', calories: 20, carbs: 4, fats: 0.2, protein: 1.5 }
    };

    const lowerDesc = description.toLowerCase();
    for (const [key, food] of Object.entries(foodDatabase)) {
      if (lowerDesc.includes(key)) {
        return {
          choices: [{
            message: {
              content: JSON.stringify(food)
            }
          }]
        };
      }
    }

    return this.getDefaultFoodResponse();
  }

  getRandomFoodResponse() {
    const foods = [
      { name: 'Apple', calories: 95, carbs: 25, fats: 0.3, protein: 0.5 },
      { name: 'Banana', calories: 105, carbs: 27, fats: 0.4, protein: 1.3 },
      { name: 'Chicken Breast', calories: 165, carbs: 0, fats: 3.6, protein: 31 },
      { name: 'Rice', calories: 130, carbs: 28, fats: 0.3, protein: 2.7 },
      { name: 'Pizza', calories: 266, carbs: 33, fats: 10, protein: 11 }
    ];

    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            ...randomFood,
            serving_size: "1 serving"
          })
        }
      }]
    };
  }

  async getFoodEmoji(foodNameOrDesc) {
    try {
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
      logError('Nutrition API: Emoji generation failed', error);
      return '🍽️';
    }
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

module.exports = new NutritionService(); 