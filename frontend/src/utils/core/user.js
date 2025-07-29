import { supabase } from '../../supabaseClient';

// 获取当前用户信息
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
  return user;
}

// 获取用户元数据
export async function getUserMetadata() {
  const user = await getCurrentUser();
  return user?.user_metadata || {};
}

// 更新用户元数据
export async function updateUserMetadata(metadata) {
  const { data, error } = await supabase.auth.updateUser({ data: metadata });
  if (error) {
    console.error('Failed to update user metadata:', error);
    throw error;
  }
  return data;
}

// 检查用户信息是否完整
export function isUserInfoComplete(userInfo) {
  return !!(userInfo?.name && userInfo?.gender && userInfo?.age && userInfo?.height && userInfo?.weight);
}

// 检查是否已经显示过用户信息弹窗
export function hasShownUserInfoModal() {
  return !!localStorage.getItem('nutrica_userinfo_shown');
}

// 设置用户信息弹窗已显示标记
export function setUserInfoModalShown() {
  localStorage.setItem('nutrica_userinfo_shown', '1');
}

// 清除用户信息弹窗标记
export function clearUserInfoModalShown() {
  localStorage.removeItem('nutrica_userinfo_shown');
}

// 获取显示用的卡路里值
export function getDisplayCalories(userInfo, latestCalories = 2000) {
  if (userInfo?.calculatedCalories) {
    return userInfo.calculatedCalories;
  }
  return latestCalories;
} 

// 获取认证token
export async function getAuthToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to get session:', error);
    return null;
  }
  return session?.access_token || null;
} 