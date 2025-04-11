import {router} from "expo-router"
import { useAuth } from "@/context/authContext";
import CostumeButton from "@/components/general/CustomeButton"
import AsyncStorage from "@react-native-async-storage/async-storage";

function LogoutButton() {
    const { logout, user, setUser } = useAuth();

    function handleLogout(){
        if (user){
            logout(Number(user.id), true);
            AsyncStorage.removeItem("user")
            setUser(null);
            router.push("/(auth)/login");
        }
        
    }

    return (
        <CostumeButton
            onPress={handleLogout} 
            className={{ TouchableOpacity: "w-20 py-3 px-6 self-end", Text: "text-black" }}
            Title="Exit"
        />
    );
}

export default LogoutButton;
