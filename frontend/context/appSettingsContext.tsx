import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { getUserSettings, updateUserSettings } from '@/api/userSettingsApi';
import { AppSettingsType } from '@/types/settings';

const AppSettingsContext = createContext<AppSettingsType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Access the user object from AuthContext
  const [UserSettings, setUserSettings] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        console.log('No user id provided, skipping settings fetch.');
        setIsInitialized(true);
        return;
      }

      try {
        console.log(`Fetching settings for user id: ${user.id}`);
        const response = await getUserSettings(Number(user.id));
        if (response.success) {
          setUserSettings(response.settings); // Save all settings dynamically
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const updateSetting = async (key: string, value: any) => {
    if (!user?.id) return;

    try {
      const updatedSettings = { ...UserSettings, [key]: value };
      const response = await updateUserSettings(Number(user.id), { [key]: value });
      if (response.success) {
        setUserSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating user setting:', error);
    }
  };

  return (
    <AppSettingsContext.Provider value={{ UserSettings, updateSetting, isInitialized }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
