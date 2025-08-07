import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,  // 启用自动刷新token
    persistSession: true,    // 持久化session，保持登录状态
    detectSessionInUrl: true // 在URL中检测session
  }
});
