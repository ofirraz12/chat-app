import React, {useEffect} from 'react';
import { router, Stack } from "expo-router";
import { useAuth } from '@/context/authContext'

export default function AuthLayout() {
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/(OnBoarding)/welcome");
    }
  }, [user]);

  if (!isInitialized) {
    return null; // Optionally show a loading indicator
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return null;
}
