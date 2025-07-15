const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

class DatabaseService {
  constructor() {
    this.supabase = createClient(
      config.database.supabaseUrl,
      config.database.supabaseKey
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
      throw new Error('Insert food error: ' + error.message);
    }
  }
}

module.exports = new DatabaseService(); 