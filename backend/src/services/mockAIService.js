const { logInfo, logError } = require('../utils/logger');

class MockAIService {
  // 预定义的食物数据库
  foodDatabase = {
    'apple': {
      name: 'Apple',
      calories: 95,
      carbs: 25,
      fats: 0.3,
      protein: 0.5,
      emoji: '🍎'
    },
    'banana': {
      name: 'Banana',
      calories: 105,
      carbs: 27,
      fats: 0.4,
      protein: 1.3,
      emoji: '🍌'
    },
    'orange': {
      name: 'Orange',
      calories: 62,
      carbs: 15,
      fats: 0.2,
      protein: 1.2,
      emoji: '🍊'
    },
    'bread': {
      name: 'Bread',
      calories: 79,
      carbs: 15,
      fats: 1,
      protein: 3,
      emoji: '🍞'
    },
    'rice': {
      name: 'Rice',
      calories: 130,
      carbs: 28,
      fats: 0.3,
      protein: 2.7,
      emoji: '🍚'
    },
    'chicken': {
      name: 'Chicken Breast',
      calories: 165,
      carbs: 0,
      fats: 3.6,
      protein: 31,
      emoji: '🍗'
    },
    'fish': {
      name: 'Fish',
      calories: 120,
      carbs: 0,
      fats: 4,
      protein: 22,
      emoji: '🐟'
    },
    'egg': {
      name: 'Egg',
      calories: 70,
      carbs: 0.6,
      fats: 5,
      protein: 6,
      emoji: '🥚'
    },
    'milk': {
      name: 'Milk',
      calories: 103,
      carbs: 12,
      fats: 2.4,
      protein: 8,
      emoji: '🥛'
    },
    'yogurt': {
      name: 'Yogurt',
      calories: 59,
      carbs: 3.6,
      fats: 0.4,
      protein: 10,
      emoji: '🥛'
    },
    'pizza': {
      name: 'Pizza',
      calories: 266,
      carbs: 33,
      fats: 10,
      protein: 11,
      emoji: '🍕'
    },
    'burger': {
      name: 'Burger',
      calories: 354,
      carbs: 30,
      fats: 17,
      protein: 16,
      emoji: '🍔'
    },
    'salad': {
      name: 'Salad',
      calories: 20,
      carbs: 4,
      fats: 0.2,
      protein: 1.5,
      emoji: '🥗'
    },
    'pasta': {
      name: 'Pasta',
      calories: 131,
      carbs: 25,
      fats: 1.1,
      protein: 5,
      emoji: '🍝'
    },
    'soup': {
      name: 'Soup',
      calories: 50,
      carbs: 8,
      fats: 1,
      protein: 3,
      emoji: '🍲'
    }
  };

  // 关键词匹配函数
  findFoodByKeywords(text) {
    const lowerText = text.toLowerCase();
    
    // 直接匹配
    for (const [key, food] of Object.entries(this.foodDatabase)) {
      if (lowerText.includes(key)) {
        return food;
      }
    }
    
    // 关键词匹配
    const keywordMap = {
      'fruit': 'apple',
      'red fruit': 'apple',
      'yellow fruit': 'banana',
      'citrus': 'orange',
      'grain': 'bread',
      'white grain': 'rice',
      'meat': 'chicken',
      'poultry': 'chicken',
      'seafood': 'fish',
      'protein': 'egg',
      'dairy': 'milk',
      'fermented': 'yogurt',
      'italian': 'pizza',
      'fast food': 'burger',
      'vegetables': 'salad',
      'noodles': 'pasta',
      'liquid': 'soup'
    };
    
    for (const [keyword, foodKey] of Object.entries(keywordMap)) {
      if (lowerText.includes(keyword)) {
        return this.foodDatabase[foodKey];
      }
    }
    
    return null;
  }

  async analyzeImage(base64Image) {
    try {
      logInfo('Mock AI: Analyzing image (simulated)');
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 随机选择一个食物（模拟识别结果）
      const foodKeys = Object.keys(this.foodDatabase);
      const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
      const food = this.foodDatabase[randomFoodKey];
      
      logInfo(`Mock AI: Identified food as ${food.name}`);
      
      return {
        choices: [{
          message: {
            content: JSON.stringify({
              name: food.name,
              calories: food.calories,
              carbs: food.carbs,
              fats: food.fats,
              protein: food.protein,
              serving_size: "1 serving"
            })
          }
        }]
      };
    } catch (error) {
      logError('Mock AI: Image analysis failed', error);
      throw new Error(`Mock image analysis failed: ${error.message}`);
    }
  }

  async analyzeDescription(description) {
    try {
      logInfo(`Mock AI: Analyzing description: ${description}`);
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 尝试匹配食物
      const food = this.findFoodByKeywords(description);
      
      if (food) {
        logInfo(`Mock AI: Found food: ${food.name}`);
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                name: food.name,
                calories: food.calories,
                carbs: food.carbs,
                fats: food.fats,
                protein: food.protein
              })
            }
          }]
        };
      } else {
        // 默认返回一个通用食物
        logInfo('Mock AI: No specific food found, using default');
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                name: 'Delicious Food',
                calories: 150,
                carbs: 20,
                fats: 5,
                protein: 8
              })
            }
          }]
        };
      }
    } catch (error) {
      logError('Mock AI: Description analysis failed', error);
      throw new Error(`Mock description analysis failed: ${error.message}`);
    }
  }

  async getFoodEmoji(foodNameOrDesc) {
    try {
      logInfo(`Mock AI: Generating emoji for: ${foodNameOrDesc}`);
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 尝试匹配食物获取emoji
      const food = this.findFoodByKeywords(foodNameOrDesc);
      if (food) {
        return food.emoji;
      }
      
      // 默认emoji
      const defaultEmojis = ['🍽️', '🥘', '🍴', '🥄', '🍽️'];
      return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
    } catch (error) {
      logError('Mock AI: Emoji generation failed', error);
      return '🍽️';
    }
  }
}

module.exports = new MockAIService(); 