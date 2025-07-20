// 计算三大营养素
export function calculateNutritionFromCalories(calories) {
  const carbs = Math.round((0.50 * calories) / 4);
  const fats = Math.round((0.30 * calories) / 9);
  const protein = Math.round((0.20 * calories) / 4);
  return { carbs, fats, protein };
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
  if (!userId) return { calories: 2000, carbs: 200, protein: 150, fats: 65 };
  
  const { data, error } = await supabase
    .from('nutrition_goal')
    .select('calories, carbs, fats, protein')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('获取营养目标失败:', error);
    return { calories: 2000, carbs: 200, protein: 150, fats: 65 };
  }
  
  if (data && data.length > 0) {
    return {
      calories: data[0].calories || 2000,
      carbs: data[0].carbs || 200,
      protein: data[0].protein || 150,
      fats: data[0].fats || 65
    };
  }
  
  return { calories: 2000, carbs: 200, protein: 150, fats: 65 };
}

// 获取今日营养摄入数据
export async function fetchTodayNutrition(supabase, userId) {
  if (!userId) return { calories: 0, carbs: 0, protein: 0, fats: 0 };
  
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const { data, error } = await supabase
    .from('food')
    .select('nutrition')
    .eq('user_id', userId)
    .gte('time', startOfDay.toISOString())
    .lte('time', endOfDay.toISOString());
  
  if (error) {
    console.error('获取今日营养数据失败:', error);
    return { calories: 0, carbs: 0, protein: 0, fats: 0 };
  }
  
  // 计算今日总摄入
  const totalNutrition = data?.reduce((acc, food) => ({
    calories: acc.calories + (food.nutrition?.calories || 0),
    carbs: acc.carbs + (food.nutrition?.carbs || 0),
    protein: acc.protein + (food.nutrition?.protein || 0),
    fats: acc.fats + (food.nutrition?.fats || 0)
  }), { calories: 0, carbs: 0, protein: 0, fats: 0 }) || { calories: 0, carbs: 0, protein: 0, fats: 0 };
  
  return totalNutrition;
}

// 检查营养目标是否达成
export function checkNutritionGoal(current, goal) {
  return current >= goal;
}

// 获取营养完成百分比
export function getNutritionPercentage(current, goal) {
  if (goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
} 