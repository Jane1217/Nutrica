import { supabase } from '../../supabaseClient';

// 获取当前用户信息
// 读取本地会话中的用户（无网络往返）。首页加载时会多处调用它，
// 以前每次都用 getUser() 向认证服务器发一次请求；updateUser 会同步更新本地会话，
// 所以 user_metadata 不会过期。
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
  return session?.user ?? null;
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
export function getDisplayCalories(userInfo, latestCalories = 0) {
  if (userInfo?.calculatedCalories && userInfo.calculatedCalories > 0) {
    return userInfo.calculatedCalories;
  }
  return latestCalories && latestCalories > 0 ? latestCalories : 0;
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