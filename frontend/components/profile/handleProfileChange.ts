import * as ImagePicker from 'expo-image-picker'    
    

export async function SelectProfilePic(){
    
    let ProfilePic = ''
    console.log('changing profile picture!')
    {/*asking permissions*/}  
    const { granted } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!granted) {
        // Request permission if not already granted
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
        if (!permissionResult.granted) {
          alert("Permission to access the media library is required!");
          return;
        }
    }

    try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, 
          quality: 1, 
        });

        if (result.canceled) {
          console.log("User canceled image selection");
          return;
        }
        console.log("Selected image:", result.assets[0].uri);
        return result.assets[0].uri;

    } catch (error) {
            console.error("Error selecting image:", error);
        }

}