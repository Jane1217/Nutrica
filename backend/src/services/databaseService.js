const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

class DatabaseService {
  constructor() {
    const supabaseConfig = {};

    // Use proxy in development environment
    if (config.openai.proxy) {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyUrl = `${config.openai.proxy.protocol}://${config.openai.proxy.host}:${config.openai.proxy.port}`;
      supabaseConfig.global = {
        fetch: (url, options = {}) => {
          const agent = new HttpsProxyAgent(proxyUrl);
          return fetch(url, {
            ...options,
            agent
          });
        }
      };
      console.log(`Supabase using proxy: ${proxyUrl}`);
    }

    this.supabase = createClient(
      config.database.supabaseUrl,
      config.database.supabaseKey,
      supabaseConfig
    );
    this.bucketName = 'nutrition-images';
  }

  async insertFood({ user_id, name, nutrition, number_of_servings, time, emoji }) {
    try {
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
      return data;
    } catch (error) {
      // 新增：打印完整error对象
      console.error('Supabase insert error:', error);
      throw new Error('Insert food error: ' + error.message);
    }
  }
}

module.exports = new DatabaseService(); 