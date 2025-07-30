import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // 禁用自动刷新token，避免在公开页面报错
    persistSession: false,   // 不持久化session，避免token相关错误
    detectSessionInUrl: false // 不在URL中检测session
  }
});
