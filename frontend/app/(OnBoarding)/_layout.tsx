import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
    </Stack>
  )
}