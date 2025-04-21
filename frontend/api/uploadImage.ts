import { getAppSettings } from "@/config";
import axios from "axios";

const { URL_backend} = getAppSettings();

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await axios.post(`${URL_backend}/userprofile/updateProfilePicture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('picture uploaded successfully:', response.data);
    
  } catch (error) {
    console.error('Error sending picture:', error);
  }

};