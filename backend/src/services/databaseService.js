const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

class DatabaseService {
  constructor() {
    this.supabaseConfig = {};
    this.cache = new Map();
    this.cacheTimeout = config.cache.defaultTTL;
    this.maxCacheSize = config.cache.maxSize;

    // Use proxy in development environment
    if (config.openai.proxy) {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyUrl = `${config.openai.proxy.protocol}://${config.openai.proxy.host}:${config.openai.proxy.port}`;
      this.supabaseConfig.global = {
        fetch: (url, options = {}) => {
          const agent = new HttpsProxyAgent(proxyUrl);
          return fetch(url, {
            ...options,
            agent,
            timeout: config.database.query.timeout
          });
        }
      };
      console.log(`Supabase using proxy: ${proxyUrl}`);
    }

    // 创建Supabase客户端实例
    this.supabase = createClient(
      config.database.supabaseUrl,
      config.database.supabaseServiceKey, // 使用服务端密钥，绕过RLS
      this.supabaseConfig
    );
    
    this.bucketName = 'nutrition-images';
    
    // 定期清理过期缓存
    setInterval(() => this.cleanExpiredCache(), config.cache.cleanupInterval);
  }

  // 重试机制
  async withRetry(operation, maxRetries = config.database.query.retryAttempts) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 只对网络错误和超时进行重试
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          console.log(`Database operation failed, retrying... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, config.database.query.retryDelay * attempt));
          continue;
        }
        
        throw error;
      }
    }
  }

  // 缓存管理
  getCacheKey(operation, params) {
    return `${operation}:${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    if (!config.cache.enabled) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    if (!config.cache.enabled) return;
    
    // 检查缓存大小限制
    if (this.cache.size >= this.maxCacheSize) {
      // 删除最旧的条目
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // 清除特定缓存
  clearCache(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async insertFood({ user_id, name, nutrition, number_of_servings, time, emoji }) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('food')
        .insert([{
          user_id,
          name,
          nutrition,
          number_of_servings,
          time,
          emoji
        }]);
      if (error) throw error;
      
      // 清除相关缓存
      this.clearCache('user_foods');
      this.clearCache('today_nutrition');
      
      return data;
    });
  }

  // 获取collection_puzzles数据（带缓存）
  async getCollectionPuzzles() {
    const cacheKey = this.getCacheKey('collection_puzzles', {});
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('collection_puzzles')
        .select('id, collection_type, puzzle_name, slot')
        .order('slot', { ascending: true });

      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    });
  }

  // 获取用户collections（带缓存）
  async getUserCollections(userId, collectionType = null) {
    const cacheKey = this.getCacheKey('user_collections', { userId, collectionType });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      let query = this.supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId);

      if (collectionType) {
        query = query.eq('collection_type', collectionType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    });
  }

  // 添加或更新用户collection
  async addUserCollection(userId, collectionData) {
    return this.withRetry(async () => {
      const { collection_type, puzzle_name, nutrition, count = 1 } = collectionData;
      
      if (!collection_type || !puzzle_name) {
        throw new Error('Missing required fields: collection_type and puzzle_name');
      }

      // 检查是否已存在该collection
      const { data: existingCollection, error: fetchError } = await this.supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('collection_type', collection_type)
        .eq('puzzle_name', puzzle_name)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      if (existingCollection) {
        // 检查是否今天已经收集过
        const lastCollectedDate = existingCollection.updated_at ? 
          existingCollection.updated_at.split('T')[0] : 
          existingCollection.created_at.split('T')[0];
        
        if (lastCollectedDate === today) {
          // 今天已经收集过了，返回现有数据
          return { count: existingCollection.count };
        }
        
        // 今天还没有收集过，增加count
        const { error: updateError } = await this.supabase
          .from('user_collections')
          .update({
            count: existingCollection.count + count,
            nutrition: nutrition || existingCollection.nutrition,
            updated_at: now
          })
          .eq('user_id', userId)
          .eq('collection_type', collection_type)
          .eq('puzzle_name', puzzle_name);

        if (updateError) throw updateError;

        // 清除相关缓存
        this.clearCache('user_collections');
        
        return { count: existingCollection.count + count };
      } else {
        // 创建新collection
        const { error: insertError } = await this.supabase
          .from('user_collections')
          .insert({
            user_id: userId,
            collection_type,
            puzzle_name,
            nutrition: nutrition || {},
            count,
            first_completed_at: now,
            created_at: now,
            updated_at: now
          });

        if (insertError) throw insertError;

        // 清除相关缓存
        this.clearCache('user_collections');
        
        return { count };
      }
    });
  }

  // 获取用户今日营养数据（带缓存）
  async getTodayNutrition(userId, date) {
    const cacheKey = this.getCacheKey('today_nutrition', { userId, date });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('daily_home_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) throw error;
      
      this.setCache(cacheKey, data);
      return data;
    });
  }

  // 保存daily_home_data
  async saveDailyHomeData(data) {
    return this.withRetry(async () => {
      const { error } = await this.supabase
        .from('daily_home_data')
        .upsert([{
          ...data,
          updated_at: new Date().toISOString()
        }], { onConflict: ['user_id', 'date'] });

      if (error) throw error;

      // 清除相关缓存
      this.clearCache('today_nutrition');
      this.clearCache('daily_home_data');
      
      return true;
    });
  }

  // 获取公开的collection数据（不需要认证）
  async getPublicCollection(userId, puzzleName) {
    return this.withRetry(async () => {
      const { data, error } = await this.supabase
        .from('user_collections')
        .select('nutrition, first_completed_at')
        .eq('user_id', userId)
        .eq('puzzle_name', puzzleName)
        .maybeSingle();

      if (error) throw error;
      return data;
    });
  }
}

// 导出单例实例
module.exports = new DatabaseService(); 
