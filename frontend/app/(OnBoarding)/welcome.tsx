import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useAuth } from "@/context/authContext";
import { useAppSettings } from "@/context/appSettingsContext";
import { updateUserSettings } from "@/api/userSettingsApi";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import LogoutButton from "@/components/auth/logoutButton";
import { icons } from "@/lib/consts";

export default function Welcome() {
  const { user } = useAuth();
  const { UserSettings, updateSetting } = useAppSettings();
  const [isModalVisible, setIsModalVisible] = useState(true);

  const Permissions = ["camera_permission", "gallery_permission"];

  // Function to determine needed permissions
  const getNeededPermissions = (): string[] => {
    const permissionList: string[] = [];
    for (const key of Permissions) {
      if (!UserSettings[key]) {
        // Add only permissions that are not granted
        permissionList.push(key);
      }
    }
    return permissionList;
  };

  // State for permissions that are still `false`
  const [falsePermissionsList, setFalsePermissionsList] = useState<string[]>([]);

  // Update falsePermissionsList and modal visibility whenever UserSettings changes
  useEffect(() => {
    const list = getNeededPermissions();
    setFalsePermissionsList(list);
    setIsModalVisible(list.length > 0); // Show modal only if there are permissions to ask for
  }, [UserSettings]);

  // Function to request a specific permission
  const requestPermission = async (key: "camera_permission" | "gallery_permission") => {
    if (!user || !falsePermissionsList.includes(key)) return; // Only request if in falsePermissionsList

    try {
      let status, granted;

      if (key === "camera_permission") {
        ({ status } = await Camera.requestCameraPermissionsAsync());
      } else if (key === "gallery_permission") {
        ({ status } = await MediaLibrary.requestPermissionsAsync());
      }

      granted = status === "granted";

      // Update settings and notify the backend
      updateSetting(key, granted);
      await updateUserSettings(Number(user.id), { [key]: granted });

      if (!granted) {
        Alert.alert(
          "Permission Denied",
          `${key.replace("_", " ")} access is required for certain features.`
        );
      }
    } catch (error) {
      console.error(`Error requesting ${key} permission:`, error);
    }
  };

  // Function to handle "Allow All" permissions
  const handleAllowAllPermissions = async () => {
    for (const permission of falsePermissionsList) {
      await requestPermission(permission as "camera_permission" | "gallery_permission");
    }
    setIsModalVisible(false); // Close the modal
  };

  return (
    <View className="flex-1 items-center bg-grey-300 px-4 py-6">
      {/* Logout Button */}
      <LogoutButton />

      <Text className="text-5xl font-extrabold text-gray-900 mb-6 sm:text-6xl">
        On Boarding
      </Text>

      <Text className="text-xl text-gray-700 mb-8">
        Hello, <Text className="font-semibold">{user?.name || "Guest"}!</Text>
      </Text>

      <View style={{width: responsiveWidth(35), height: responsiveHeight(22)}}></View>

      <Text className="text-lg text-gray-600 mb-8 text-center max-w-lg leading-relaxed">
        This app helps you keep your information secure and accessible only to
        you.
      </Text>

      <Link
        href="/(main)/userProfile"
        className="bg-blue-500 text-white text-lg font-medium py-3 px-8 rounded-full shadow-lg hover:bg-blue-600"
      >
        Next
      </Link>

      {/* Modal for Permissions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Permissions Required</Text>
            <Text style={styles.modalText}>
              To enhance your experience, we need access to the following
              permissions:
            </Text>
            {falsePermissionsList.map((permission, index) => (
              <TouchableOpacity
                key={index}
                style={styles.permissionButton}
                onPress={() => requestPermission(permission as "camera_permission" | "gallery_permission")}
              >
                <Text style={styles.permissionText}>
                  {permission.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.allowAllButton}
              onPress={handleAllowAllPermissions}
            >
              <Text style={styles.allowAllText}>Allow All Permissions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: responsiveFontSize(2),
    textAlign: "center",
    marginBottom: 15,
  },
  permissionButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
  },
  permissionText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  allowAllButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
  },
  allowAllText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
