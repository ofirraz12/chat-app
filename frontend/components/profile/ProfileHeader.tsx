import { View, Text, StyleSheet, Modal, TextInput, Button } from "react-native";
import ProfilePic from "@/components/profile/ProfilePic";
import {responsiveWidth as RW, responsiveHeight as RH} from 'react-native-responsive-dimensions'
import { useAuth } from "@/context/authContext";
import LogoutButton from '@/components/auth/logoutButton'
import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "@/api/userProfileApi";
import { uploadImage } from '@/api/uploadImage'
import { SelectProfilePic } from '@/components/profile/handleProfileChange'
import { Platform } from 'react-native';
import { icons } from "@/lib/consts";
import CostumeButton from "@/components/general/CustomeButton";

function ProfileHeader(){
  const { user } = useAuth();
  const [userProfile, setuserProfile] = useState({
    age: 0,
    bio: '',
    profilePic: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ age: "", bio: "", profilePic: userProfile.profilePic });


  async function handleProfilePic() {
    try {
      const updatedImage = await SelectProfilePic();
      if (updatedImage) {
        setuserProfile((prevProfile) => ({
          ...prevProfile,
          profilePic: updatedImage,
        }));
        await uploadProfilePicture(updatedImage);
      }
    } catch (error) {
      console.error("Error handling profile picture press:", error);
    }
  }

  const uploadProfilePicture = async (imageUri: string) => {
    if (user) {
      try {
        const uri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');
        const fileType = uri.split('.').pop();
        const fileName = `${user.id}_profilePicture.${fileType}`;
  
        const file = {
          uri,
          name: fileName, 
          type: 'image/jpeg',
        };
  
        const formData = new FormData();
        formData.append('profilePicture', file as any); 
        formData.append('userId', user.id as any);
        await uploadImage(formData);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user?.id) {
          const result = await getUserProfile(user.id);
          setuserProfile({
            age: result.profile.age,
            bio: result.profile.bio,
            profilePic: result.profilePicUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
  
    fetchProfileData();
  }, [user]);

  if (!user) return null;

  return (

    <View style={styles.container}>

    {isEditing && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditing}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Edit Profile</Text>

            {/* Input Fields */}
            <TextInput
              style={styles.input}
              placeholder="Enter age"
              value={tempProfile.age.toString()}
              keyboardType="numeric"
              onChangeText={(text) => setTempProfile({ ...tempProfile, age: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter bio"
              value={tempProfile.bio}
              onChangeText={(text) => setTempProfile({ ...tempProfile, bio: text })}
            />

            {/* Save & Cancel Buttons */}
            <Button
              title="Save"
              onPress={async () => {
                if (user.id) {
                  const updatedInfo = {
                    age: String(tempProfile.age.trim() !== "" ? tempProfile.age : userProfile.age),
                    bio: tempProfile.bio.trim() !== "" ? tempProfile.bio : userProfile.bio,
                  };
            
                  try {
                    await updateUserProfile(user.id, updatedInfo);
                    
                    setuserProfile((prev) => ({
                      ...prev,
                      age: Number(updatedInfo.age),
                      bio: updatedInfo.bio,
                    }));
            
                    setIsEditing(false);
                  } catch (error) {
                    console.error("Error updating profile:", error);
                    alert("Failed to update profile");
                  }
                } else {
                  alert("No user to update info");
                }
              }}
            />

            <Button title="Cancel" onPress={() => setIsEditing(false)} />
          </View>
        </View>
      </Modal>
    )}
  
      <View style={styles.profileContainer}>
        <View style={styles.profilePicContainer}>
          <ProfilePic 
            ProfilePicStyle={{
              className: "", 
              styles: {
                width: RH(16),
                height: RH(16),
                borderRadius: RH(8),
              }
            }}
            ProfilePicUri={userProfile.profilePic}
            ProfilePicFunction={handleProfilePic}
          />
        </View>

        <View style={styles.profileDataContainer}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>
              {user.name}, {userProfile.age}
            </Text>

            <CostumeButton
              onPress={() => setIsEditing(true)}
              className={{ TouchableOpacity: "", Text: "" }}
              icon={icons.editIcon}
              iconWindStyle="self-end right-5"
              iconStyle={{
                width: RW(5),
                height: RH(5),
                resizeMode: 'contain',        
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />

          </View>
          <View style={styles.profileBioContainer}>
            <Text style={styles.profileBio}>bio: {userProfile.bio}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  width: RW(100),
  height: RH(100),
  margin: 0,
  padding: 0,
},
modalContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
},
modalContent: {
  width: RW(80),
  padding: RH(2),
  backgroundColor: "white",
  borderRadius: RH(2),
  alignItems: "center",
},
input: {
  width: "100%",
  borderBottomWidth: 1,
  marginVertical: RH(1),
  padding: RH(1),
},
profileContainer: {
  height: RH(20),
  flexDirection: 'row',
  alignItems: 'center',
},
profilePicContainer: {
  marginLeft: RW(5),
},
profileDataContainer: {
  flexDirection: 'column',
  height: RH(17),
  width: RH(28),
  marginTop: RH(3),
  gap: RH(2),
  marginLeft: RH(2),
},
profileHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: RH(28),
},
profileName: {
  fontSize: RH(4),
},
profileBioContainer: {
  fontSize: RW(5),
  width: RH(27),
  overflow: "hidden",
},
profileBio: {
  fontSize: RH(2),
},
});

export default ProfileHeader;
