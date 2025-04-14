import { getAppSettings } from "@/config";
import axios from "axios";

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await axios.post(`${getAppSettings().URL_backend}/userprofile/updateProfilePicture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('picture uploaded successfully:', response.data);
    
  } catch (error) {
    console.error('Error sending picture:', error);
  }

};