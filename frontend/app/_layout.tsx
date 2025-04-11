import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, router } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import VideoSplashScreen from "@/components/general/uncommon/videoSplashScreen"; 
import "../global.css";
import { AuthProvider } from "@/context/authContext";
import { AppSettingsProvider } from "@/context/appSettingsContext";
import AppStateWatcher from '@/components/general/uncommon/AppStateWatcher';
import AuthGuard from '@/components/auth/AuthGuard';


SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  const [showSplashVideo, setshowSplashVideo] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setIsMounted(true);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !isMounted) {
    return null; 
  }

  if (showSplashVideo) {
    return (
      <VideoSplashScreen
        onFinish={() => {
          setTimeout(() => setshowSplashVideo(false), 500); 
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <AppSettingsProvider>
          <AppStateWatcher />
          <AuthGuard />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(OnBoarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AppSettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
