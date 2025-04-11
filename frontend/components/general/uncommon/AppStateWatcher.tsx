// File: /components/AppStateWatcher.tsx
import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { useAppSettings } from '@/context/appSettingsContext';
import { logoutUser } from '@/api/authApi';

export default function AppStateWatcher() {
  const { user, setUser, restoreUser } = useAuth();
  const { UserSettings } = useAppSettings();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  console.log("appstatus:", appState)
  // restore session
  if (!user && appState == 'active'){
    restoreUser()
  }

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {

      // Foreground
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      } 
      // Background
      else if (nextAppState === 'background') {
        console.log('App has gone to the background.');
        if (!UserSettings.persist_auth && user?.id) {
          console.log('PersistAuth is false. Clearing user session and setting activity to false...');
          // Mark user inactive in backend
          const logoutResult = await logoutUser(Number(user.id));
          if (logoutResult?.success) {
            console.log('User activity set to false in the backend.');
          } else {
            console.error('Failed to update user activity in the backend.');
          }
          // Clear from AsyncStorage and context
          await AsyncStorage.removeItem('user');
          setUser(null);
          // Redirect to login
          router.replace('/(auth)/login');
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState, UserSettings.persist_auth, user, setUser]);

  return null;
}
