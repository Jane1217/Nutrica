export const DEFAULT_NUTRITION_GOALS = Object.freeze({
  calories: 2000,
  carbs: 200,
  protein: 150,
  fats: 65,
});

export const EMPTY_NUTRITION = Object.freeze({
  calories: 0,
  carbs: 0,
  protein: 0,
  fats: 0,
});

const asNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

// Calculate macro targets from a calorie goal using the product's 50/30/20 split.
export function calculateNutritionFromCalories(calories) {
  const safeCalories = asNonNegativeNumber(calories);
  const carbs = Math.round((0.50 * safeCalories) / 4);
  const fats = Math.round((0.30 * safeCalories) / 9);
  const protein = Math.round((0.20 * safeCalories) / 4);
  return { carbs, fats, protein };
}

export function calculateNutritionProgress(current = EMPTY_NUTRITION, goals = DEFAULT_NUTRITION_GOALS) {
  const progressFor = (nutrient) => {
    const goal = asNonNegativeNumber(goals?.[nutrient]);
    if (goal === 0) return 0;
    return Math.min(asNonNegativeNumber(current?.[nutrient]) / goal, 1);
  };

  return {
    1: progressFor('carbs'),
    2: progressFor('protein'),
    3: progressFor('fats'),
  };
}

// 格式化foods数据
export function formatFoods(rawFoods) {
  return (rawFoods || []).map(item => ({
    name: item.name,
    emoji: item.emoji || '🍽️',
    time: item.time ? new Date(item.time).toISOString() : '',
    nutrition: [
      { type: 'Calories', value: (item.nutrition?.calories ?? '-') + 'kcal' },
      { type: 'Carbs', value: (item.nutrition?.carbs ?? '-') + 'g' },
      { type: 'Fats', value: (item.nutrition?.fats ?? '-') + 'g' },
      { type: 'Protein', value: (item.nutrition?.protein ?? '-') + 'g' },
    ]
  }));
}

// 获取用户最新的营养目标
export async function fetchNutritionGoals(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('nutrition_goal')
      .select('calories, carbs, protein, fats')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Failed to fetch nutrition goals:', error);
      return { ...DEFAULT_NUTRITION_GOALS };
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return { ...DEFAULT_NUTRITION_GOALS };
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    return { ...DEFAULT_NUTRITION_GOALS };
  }
}

// 获取今日营养摄入数据
export async function fetchTodayNutrition(supabase, userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('food')
      .select('nutrition')
      .eq('user_id', userId)
      .gte('time', today.toISOString())
      .lt('time', tomorrow.toISOString());

    if (error) {
      console.error('Failed to fetch today nutrition data:', error);
      return { ...EMPTY_NUTRITION };
    }

    // 计算今日总营养摄入
    const totalNutrition = data.reduce((acc, food) => {
      if (food.nutrition) {
        acc.calories += asNonNegativeNumber(food.nutrition.calories);
        acc.carbs += asNonNegativeNumber(food.nutrition.carbs);
        acc.protein += asNonNegativeNumber(food.nutrition.protein);
        acc.fats += asNonNegativeNumber(food.nutrition.fats);
      }
      return acc;
    }, { ...EMPTY_NUTRITION });

    return totalNutrition;
  } catch (error) {
    console.error('Error fetching today nutrition data:', error);
    return { ...EMPTY_NUTRITION };
  }
}

// 检查营养目标是否达成
export function checkNutritionGoal(current, goal) {
  return current >= goal;
}

// 获取营养完成百分比
export function getNutritionPercentage(current, goal) {
  const safeGoal = asNonNegativeNumber(goal);
  if (safeGoal === 0) return 0;
  return Math.min(Math.round((asNonNegativeNumber(current) / safeGoal) * 100), 100);
}
