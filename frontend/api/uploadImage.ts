import axios from "axios";

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await axios.post("http://192.168.1.32:5000/api/userprofile/updateProfilePicture", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('picture uploaded successfully:', response.data);
    
  } catch (error) {
    console.error('Error sending picture:', error);
  }

};