import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";

// Map your permission keys to their corresponding request methods
const PERMISSION_HANDLERS = {
  camera_permission: Camera.requestCameraPermissionsAsync,
  gallery_permission: MediaLibrary.requestPermissionsAsync,
} as const;

// Define the valid keys for the permission handlers
type PermissionKey = keyof typeof PERMISSION_HANDLERS;

/**
 * Request permission dynamically based on the key.
 * @param permissionKey - The permission key (e.g., "camera_permission", "gallery_permission").
 * @returns `true` if permission is granted, otherwise `false`.
 */
export const requestPermission = async (permissionKey: PermissionKey): Promise<boolean> => {
  const handler = PERMISSION_HANDLERS[permissionKey];

  if (!handler) {
    console.warn(`Permission handler for ${permissionKey} not found.`);
    return false;
  }

  try {
    const { status } = await handler();
    return status === "granted";
  } catch (error) {
    console.error(`Error requesting ${permissionKey}:`, error);
    return false;
  }
};
