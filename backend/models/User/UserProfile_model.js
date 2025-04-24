import { pool } from '../../config/db.js';
import isAgeValid from '../../utils/validation functions/isAgeValid.js';

const MAX_AGE = 120;
const MIN_AGE = 5;

// add profile picture
const addProfilePicture = async (pictureName, userId) => {
  console.log(pictureName, userId)
  try {
    const result = await pool.query(
      `UPDATE user_profile 
       SET profile_picture = $1, updated_at = NOW() 
       WHERE user_id = $2 
       RETURNING *`,
      [pictureName, userId] // Use parameterized query
    );
    console.log(result.rows)
    if (result.rows.length === 0) {
      // No rows were updated
      return { success: false, message: "Profile picture wasn't uploaded. User ID not found." };
    }

    return { success: true, message: 'Profile picture successfully uploaded' };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, message: 'Error adding profile picture to the database' };
  }
};
  
// Create a user profile
const createProfile = async (userId) => {
  try {
    const result = await pool.query(
      'INSERT INTO user_profile (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      [userId]
    );
    return { success: true, profile: result.rows[0] };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, message: 'Error creating user profile' };
  }
};

// Update the user's profile
const updateProfile = async (userId, profileInfo) => {
  const { age, bio } = profileInfo;

  // Validate age
  const validationResult = isAgeValid(age, MAX_AGE, MIN_AGE);
  if (!validationResult.success) {
    return validationResult;
  }

  try {
    const result = await pool.query(
      'UPDATE user_profile SET age = $2, bio = $3, updated_at = NOW() WHERE user_id = $1 RETURNING *',
      [userId, age, bio]
    );
    if (result.rows.length === 0) {
      return { success: false, message: 'Failed to update profile in the database' };
    }
    return { success: true, profile: result.rows[0] };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Error updating profile' };
  }
};

// Delete the user's profile
const deleteProfile = async (userId) => {
    try {
      const result = await pool.query(
        'DELETE FROM user_profile WHERE user_id = $1 RETURNING *',
        [userId]
      );
      if (result.rows.length === 0) {
        return { success: false, message: 'Profile not found or already deleted' };
      }
      return { success: true, message: 'Profile successfully deleted' };
    } catch (error) {
      console.error('Error deleting profile:', error);
      return { success: false, message: 'Error deleting profile' };
    }
};

// Get the user's profile
const getProfile = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_profile WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return { success: false, message: 'Profile not found' };
    }
    return { success: true, profile: result.rows[0] };
  } catch (error) {
    console.error('Error retrieving profile:', error);
    return { success: false, message: 'Error retrieving profile' };
  }
};

export { 
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  addProfilePicture,
};
