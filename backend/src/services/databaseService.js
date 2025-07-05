const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

class DatabaseService {
  constructor() {
    this.supabase = createClient(
      config.database.supabaseUrl,
      config.database.supabaseKey
    );
    this.bucketName = 'nutrition-images';
    this.initializeBucket();
  }

  async initializeBucket() {
    try {
      // 检查存储桶是否存在
      const { data: buckets, error: listError } = await this.supabase
        .storage
        .listBuckets();

      if (listError) throw listError;

      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // 创建存储桶
        const { error: createError } = await this.supabase
          .storage
          .createBucket(this.bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
            fileSizeLimit: 5242880 // 5MB
          });

        if (createError) throw createError;
        console.log('存储桶创建成功');
      }
    } catch (error) {
      console.error('存储桶初始化错误:', error);
      throw new Error('存储桶初始化失败');
    }
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      // 确保存储桶存在
      await this.initializeBucket();

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('文件上传错误:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('文件上传错误:', error);
      throw new Error('文件上传失败');
    }
  }

  async getFileUrl(fileName) {
    try {
      const { data } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      if (!data.publicUrl) {
        throw new Error('无法获取文件URL');
      }

      return data.publicUrl;
    } catch (error) {
      console.error('获取文件URL错误:', error);
      throw new Error('获取文件URL失败');
    }
  }

  async insertMeal(detectedData, mealTime, userId) {
    try {
      const { error } = await this.supabase.from('meals').insert({
        detected_data: detectedData,
        meal_time: mealTime,
        user_id: userId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('数据库插入错误:', error);
      throw new Error(`数据库错误: ${error.message}`);
    }
  }

  async getMealsByDate(date) {
    try {
      const { data: meals, error } = await this.supabase
        .from('meals')
        .select('detected_data')
        .gte('meal_time', `${date}T00:00:00Z`)
        .lte('meal_time', `${date}T23:59:59Z`);

      if (error) throw error;
      return meals;
    } catch (error) {
      console.error('查询meals错误:', error);
      throw new Error(`查询meals错误: ${error.message}`);
    }
  }

  async insertDailySummary(summaryDate, summaryText, userId) {
    try {
      const { error } = await this.supabase.from('daily_summaries').insert({
        summary_date: summaryDate,
        summary_text: summaryText,
        user_id: userId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('插入daily_summaries错误:', error);
      throw new Error(`插入daily_summaries错误: ${error.message}`);
    }
  }

  async getMealsByRange(userId, from, to) {
    try {
      const query = this.supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId);
      if (from) query.gte('time', from);
      if (to) query.lte('time', to);
      const { data, error } = await query.order('time', { ascending: true });
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('查询meals错误: ' + error.message);
    }
  }

  async insertMeal({ user_id, name, nutrition, time, serving }) {
    try {
      const { error } = await this.supabase.from('meals').insert({
        user_id, name, nutrition, time, serving
      });
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('插入meals错误: ' + error.message);
    }
  }

  async deleteMeal(id) {
    try {
      const { error } = await this.supabase.from('meals').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('删除meals错误: ' + error.message);
    }
  }

  async updateMeal(id, { name, nutrition, time, serving }) {
    try {
      const { error } = await this.supabase.from('meals').update({
        name, nutrition, time, serving
      }).eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('更新meals错误: ' + error.message);
    }
  }
}

module.exports = new DatabaseService(); 