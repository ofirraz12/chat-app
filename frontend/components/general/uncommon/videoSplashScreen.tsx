import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as SplashScreen from "expo-splash-screen";

interface VideoSplashScreenProps {
  onFinish: () => void; // Callback when the video finishes
}

export default function VideoSplashScreen({ onFinish }: VideoSplashScreenProps) {
  const videoRef = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Prevent the native splash screen from auto-hiding
  useEffect(() => {
    if (Platform.OS !== "web") {
      SplashScreen.preventAutoHideAsync().catch(() => {});
    } else {
      // Immediately finish splash for web
      onFinish();
    }
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    SplashScreen.hideAsync().catch(() => {});
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && "didJustFinish" in status && status.didJustFinish) {
      // Trigger onFinish callback when the video finishes
      onFinish();
    }
  };

  // Skip rendering video for web (PC)
  if (Platform.OS === "web") {
    return null;
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("@/assets/videos/splash-video.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        onReadyForDisplay={handleVideoLoad}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Black background while the video loads
  },
  video: {
    width,
    height,
  },
});
