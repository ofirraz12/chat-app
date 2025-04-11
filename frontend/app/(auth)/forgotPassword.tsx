import { View, Text, Alert } from "react-native";
import { Link } from "expo-router";
import H1 from "@/components/general/Header";
import InputField from "@/components/general/InputFiled";
import CostumeButton from "@/components/general/CustomeButton";
import CostumeErr from "@/components/general/CustomError";
import { useState } from "react";

export default function forgotPassword() {

    const [email, setEmail] = useState("")
    const [err, setErr] = useState("")

    function handlePasswordChange(data: string){
        setEmail(data)
    }

    function handlePasswordReset(){
        if(email){
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setErr("Invalid email format.");
                return
            }

            Alert.alert("sending request to email...", email)
        }
    }


    return(
    <View className="flex-1 items-center bg-white h-full">
        <H1 className="mt-10">reset password</H1>
        <View className="flex-1 items-center bg-white h-full justify-center">
        <View className="flex-col w-5/6 h-fit m bg-slate-100 rounded-xl p-6">
            <View className="mt-5 space-y-2 mb-6">
                <InputField 
                    InputFieldprops={{lableName: "email", placeHolder: "example@gmail.com"}}
                    onChangeProp={(data) => handlePasswordChange(data)}
                    value={email}>
                </InputField>
            </View>

            <CostumeErr className="text-center mb-4 text-red-500">{err}</CostumeErr>

            <CostumeButton
            onPress={handlePasswordReset}
            className={
                {TouchableOpacity: "bg-blue-500 py-3 px-6 rounded-3xl shadow-md mb-4", Text: "text-white text-center"}}
            Title="send"
            />
        </View>

        <Link
            href="/(auth)/login"
            className="bg-blue-500 text-white py-3 px-6 rounded-3xl text-center shadow-md mb-4 mt-5">
            Go to login
        </Link>

        </View>
    </View>
    
)}