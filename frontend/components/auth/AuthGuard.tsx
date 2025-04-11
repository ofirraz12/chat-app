import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAppSettings } from '@/context/appSettingsContext';
import { useAuth } from '@/context/authContext';

export default function AuthGuard() {
  const { isInitialized, UserSettings } = useAppSettings();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth()

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isInitialized) {
      console.log('Settings initialized. AuthGuard check complete.');
    }

    if (isMounted && isInitialized && !UserSettings.persist_auth && !user) {
      console.log('No user found. Redirecting to login...');
      router.replace('/(auth)/login');
    }
  }, [isMounted, isInitialized, UserSettings.persist_auth]);

  if (!isMounted || !isInitialized) {
    return null; 
  }

  return null;
}
