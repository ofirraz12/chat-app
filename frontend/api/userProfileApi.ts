import axios from 'axios';
import { updateUserSettings } from './userSettingsApi';

// Initialize Axios with a base URL for your API
const API = axios.create({ baseURL: 'http://192.168.1.32:5000/api' });

const updateUserProfile = async (userId: number, profileInfo: {age: string, bio: string}) => {
  try {
    const response = await API.put('/userprofile/update', {userId, profileInfo})
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}


/**
 * Create a user profile
 * @param userId - The ID of the user
 * @returns The response data from the API
 */
const createUserProfile = async (userId: number) => {
  try {
    console.log("Creating user profile for userId:", userId);
    const response = await API.post('/userprofile/create', { userId });
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get a user profile
 * @param userId - The ID of the user
 * @returns The user profile data
 */
const getUserProfile = async (userId: number) => {
  try {
    console.log("Fetching user profile for userId:", userId);
    const response = await API.get(`/userprofile/${userId}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Delete a user profile
 * @param userId - The ID of the user
 * @returns The response data from the API
 */
const deleteUserProfile = async (userId: number) => {
  try {
    console.log("Deleting user profile for userId:", userId);
    const response = await API.delete(`/userprofile/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

/**
 * Check if a user profile is complete
 * @param userId - The ID of the user
 * @returns Whether the profile is complete
 */
const isUserProfileComplete = async (userId: number) => {
  try {
    console.log("Checking if user profile is complete for userId:", userId);
    const response = await API.get(`/userprofile/isComplete/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking user profile completeness:', error);
    throw error;
  }
};


export {
  updateUserProfile,
  createUserProfile,
  getUserProfile,
  deleteUserProfile,
  isUserProfileComplete,
};