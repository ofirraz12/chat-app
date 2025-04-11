import React from "react";
import { View, StyleSheet, SafeAreaView, Text } from "react-native";
import PostGrid from "@/components/profile/PostGrid";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { responsiveHeight as RH, responsiveWidth as RW } from "react-native-responsive-dimensions";

function UserProfile() {
    
    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section - Takes only as much space as needed */}
            <View style={styles.header}>
                <ProfileHeader />
            </View>

            <View>
                <Text>user profile content</Text>
            </View>
        </SafeAreaView>
    );
}

export default UserProfile;

// 📌 Styles
const styles = StyleSheet.create({
    container: {
        paddingTop: RH(2),
        backgroundColor: "#fff",
        height: RH(90)
    },
    header: {
        minHeight: RH(23),

    },
    grid: {
        flex: 1,
    },
});
