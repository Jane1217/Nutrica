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