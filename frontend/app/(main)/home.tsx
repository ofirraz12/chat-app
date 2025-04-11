import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import LogoutButton from "@/components/auth/logoutButton";
import { useAppSettings } from "@/context/appSettingsContext";
import { useAuth } from "@/context/authContext";
import { updateUserSettings } from "@/api/userSettingsApi";
import { requestPermission } from "@/components/auth/permissionHandler";

// Define valid permission keys
const PERMISSION_KEYS = ["camera_permission", "gallery_permission"] as const;
type PermissionKey = typeof PERMISSION_KEYS[number];

export default function Home() {
  const { UserSettings, updateSetting } = useAppSettings(); // Access app settings context
  const { user } = useAuth(); // Access user authentication context

  // Toggle PersistAuth state
  const togglePersistAuth = async () => {
    if (!user) {
      Alert.alert("Error", "No user logged in.");
      return;
    }

    try {
      const newValue = !UserSettings.persist_auth; // Toggle the current PersistAuth value
      const result = await updateUserSettings(Number(user.id), { persist_auth: newValue });
      if (result.success) {
        updateSetting("persist_auth", newValue);
        Alert.alert("Success", `Persist Auth ${newValue ? "enabled" : "disabled"}.`);
      } else {
        Alert.alert("Error", "Failed to update Persist Auth.");
      }
    } catch (error) {
      console.error("Error toggling PersistAuth:", error);
    }
  };

  // Handle permission requests
  const handlePermissionRequest = async (key: PermissionKey) => {
    if (!user) {
      Alert.alert("Error", "No user logged in.");
      return;
    }

    try {
      const granted = await requestPermission(key);
      if (granted) {
        const result = await updateUserSettings(Number(user.id), { [key]: true });
        if (result.success) {
          updateSetting(key, true);
          Alert.alert("Success", `${key.replace(/_/g, " ").toUpperCase()} permission granted.`);
        } else {
          Alert.alert("Error", `Failed to update ${key} permission.`);
        }
      } else {
        Alert.alert("Permission Denied", `${key.replace(/_/g, " ").toUpperCase()} permission denied.`);
        const result = await updateUserSettings(Number(user.id), { [key]: false });
        if (result.success) {
          updateSetting(key, false);
        }
      }
    } catch (error) {
      console.error(`Error requesting ${key} permission:`, error);
    }
  };

  return (
    <View className="flex-1 items-center bg-gray-300 px-4 py-6">
      {/* Logout Button */}
      <LogoutButton />

      <Text className="text-5xl font-extrabold text-gray-900 mb-6 sm:text-6xl">
        Home
      </Text>

      {/* Toggle Persist Auth */}
      <View className="flex items-center mt-8">
        <Text className="text-lg font-semibold mb-4">
          Persist Auth: {UserSettings.persist_auth ? "Enabled" : "Disabled"}
        </Text>

        <TouchableOpacity
          onPress={togglePersistAuth}
          style={{
            backgroundColor: UserSettings.persist_auth ? "green" : "red",
            paddingVertical: responsiveHeight(1.5),
            paddingHorizontal: responsiveWidth(8),
            borderRadius: responsiveWidth(2),
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: responsiveFontSize(2),
              fontWeight: "bold",
            }}
          >
            {UserSettings.persist_auth ? "Disable Persist Auth" : "Enable Persist Auth"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
