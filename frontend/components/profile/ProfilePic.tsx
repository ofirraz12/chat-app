import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity  } from 'react-native';
import { ProfilePicType } from '@/types/profile';

const ProfilePic = ({ ProfilePicStyle, ProfilePicUri, ProfilePicFunction }: ProfilePicType) => {

    return (
      <TouchableOpacity onPress={ProfilePicFunction} activeOpacity={0.8}>
        <Image
          style={[styles.image, ProfilePicStyle.styles]}
          className={ProfilePicStyle.className}
          source={{
            uri: ProfilePicUri ||'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
            }}    
        />
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    image: {
      resizeMode: 'cover',
    },
  });

export default ProfilePic;