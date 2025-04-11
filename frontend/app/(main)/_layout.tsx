import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { icons } from "@/lib/consts";
import { responsiveHeight as RH } from "react-native-responsive-dimensions";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: RH(8),
        },
      }}
      >
        <Tabs.Screen
          name="userProfile"
          options={{
            headerShown: false,
            tabBarShowLabel: false, 
            tabBarIcon: () => (
              <Image
                source={icons.ProfileIcon}
                style={styles.icon} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            headerShown: false,
            tabBarShowLabel: false, 
            tabBarIcon: () => (
              <Image
                source={icons.plusIcon}
                style={styles.icon} 
              />
            ),
          }}
        />
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: () => (
            <Image
              source={icons.HomeIcon}
              style={styles.icon} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: RH(5),
    height: RH(5),
    resizeMode: "contain", 
    marginTop: RH(2.5),
  },
});
