import { getAppSettings } from '@/config';
import axios from 'axios';

const API = axios.create({ baseURL: `${getAppSettings().URL_backend}/usersettings` });

// Create default settings for a user
export const createUserSettings = async (userId: number) => {
  try {
    console.log("createUserSettings with: ", userId)
    const response = await API.post('/create', { userId });
    return response.data;
  } catch (error) {
    console.error('Error creating user settings:', error);
    throw error;
  }
};

// Get settings for a user
export const getUserSettings = async (userId: number) => {
  try {
    const response = await API.get(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// Update settings for a user
export const updateUserSettings = async (userId: number, settings: Record<string, any>) => {
  try {
    const response = await API.put('/update', { userId, settings });
    return response.data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};
