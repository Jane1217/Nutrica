/**
 * 前端格式化工具函数
 */

// 格式化日期
export const formatDate = (date) => {
  const d = new Date(date);
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${week[d.getDay()]}, ${month[d.getMonth()]} ${d.getDate()}`;
};

// 格式化今天日期
export const formatToday = () => {
  return formatDate(new Date());
};

// 格式化数字，添加单位
export const formatNumber = (value, unit = '') => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0' + unit;
  return num.toString() + unit;
};

// 格式化营养值
export const formatNutrition = (value, unit = 'g') => {
  return formatNumber(value, unit);
};

// 格式化卡路里
export const formatCalories = (value) => {
  return formatNumber(value, ' kcal');
};

// 计算营养总量（根据份数）
export const calculateNutritionTotal = (baseValue, servings) => {
  const base = parseFloat(baseValue) || 0;
  const servingCount = parseFloat(servings) || 1;
  return (base * servingCount).toString();
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 截断文本
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 格式化用户邮箱显示
export const formatUserEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  return username.substring(0, 3) + '***@' + domain;
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