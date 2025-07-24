/**
 * 前端格式化工具函数
 */

// 格式化今天日期
export const formatToday = () => {
  const d = new Date();
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${week[d.getDay()]}, ${month[d.getMonth()]} ${d.getDate()}`;
};

// 格式化指定日期
export const formatDate = (date) => {
  const d = new Date(date);
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${week[d.getDay()]}, ${month[d.getMonth()]} ${d.getDate()}`;
};

// 获取相对日期文本（Today, Yesterday, 或空字符串）
export const getRelativeDateText = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return ''; // 超过昨天的日期不显示相对文本
  }
};

// 格式化食物时间显示 (2025/7/15 4:26PM)
export const formatFoodTime = (timeStr) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  let hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${year}/${month}/${day} ${hour}:${min}${ampm}`;
};

// 倍数计算营养值
export function multiplyNutrition(nutrition, servings) {
  const s = Number(servings) || 1;
  const safe = v => {
    if (typeof v !== 'string' && typeof v !== 'number') return 0;
    // 提取数字部分
    const match = String(v).match(/-?\d+(\.\d+)?/);
    if (!match) return 0;
    const n = Number(match[0]);
    return isNaN(n) ? 0 : n * s;
  };
  return {
    calories: safe(nutrition.calories),
    carbs: safe(nutrition.carbs),
    fats: safe(nutrition.fats),
    protein: safe(nutrition.protein),
  };
}

// 计算营养总量（根据份数）
export const calculateNutritionTotal = (baseValue, servings) => {
  const base = parseFloat(baseValue) || 0;
  const servingCount = parseFloat(servings) || 1;
  return (base * servingCount).toString();
};

// 智能格式化食物时间：Today, 5:00PM; Yesterday, 4:25AM; Jul 7, 6:20AM
export const formatFoodTimeSmart = (timeStr) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  // 12小时制时间
  let hour = d.getHours();
  const min = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const timeStr12 = `${hour}:${min}${ampm}`;
  if (isToday) return `Today, ${timeStr12}`;
  if (isYesterday) return `Yesterday, ${timeStr12}`;
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${month} ${d.getDate()}, ${timeStr12}`;
}; 

// 日期格式化
export function formatDateString(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });
}

// puzzleName首字母大写
export function capitalizePuzzleName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// 营养数据标准化
export function normalizeNutritionData(nutrition) {
  if (!nutrition) return { carbs: 0, protein: 0, fats: 0 };
  return {
    carbs: nutrition.carbs || 0,
    protein: nutrition.protein || 0,
    fats: nutrition.fats || 0
  };
}

// 获取昵称（优先query）
export function getUserNameFromQuery(query, fallback = '') {
  return query?.get('nickname') || fallback || '';
} 