import { pool } from '../config/db.js';

// Create settings for a user
const createSettings = async (userId, settings = {}) => {
  try {
    const keys = Object.keys(settings);
    const values = Object.values(settings);
    const columns = keys.length ? `, ${keys.join(', ')}` : '';
    const placeholders = keys.length ? `, ${keys.map((_, i) => `$${i + 2}`).join(', ')}` : '';

    const query = `
      INSERT INTO user_settings (user_id${columns})
      VALUES ($1${placeholders})
      RETURNING *`;

    const result = await pool.query(query, [userId, ...values]);
    return { success: true, settings: result.rows[0] };
  } catch (error) {
    console.error('Error creating settings:', error);
    return { success: false, message: 'Error creating settings' };
  }
};

// Get settings for a user
const getSettings = async (userId) => {
  try {
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return { success: false, message: 'Settings not found' };
    }
    return { success: true, settings: result.rows[0] };
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return { success: false, message: 'Error retrieving settings' };
  }
};

// Update settings dynamically for a user
const updateSettings = async (userId, settings = {}) => {
  try {
    const keys = Object.keys(settings);
    const values = Object.values(settings);

    if (keys.length === 0) {
      return { success: false, message: 'No settings provided for update' };
    }

    const updates = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    const query = `
      UPDATE user_settings
      SET ${updates}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *`;

    const result = await pool.query(query, [userId, ...values]);
    if (result.rows.length === 0) {
      return { success: false, message: 'Failed to update settings' };
    }
    return { success: true, settings: result.rows[0] };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, message: 'Error updating settings' };
  }
};

export { createSettings, getSettings, updateSettings };
