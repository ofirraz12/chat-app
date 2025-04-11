import { View, Text, Alert, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";
import H1 from "@/components/general/Header";
import InputField from "@/components/general/InputFiled";
import CostumeErr from "@/components/general/CustomError"
import { RegisterInputFieldsObject } from "@/lib/consts";
import CostumeButton from "@/components/general/CustomeButton"
import {icons} from "@/lib/consts"
import { useState, useMemo } from "react";
import { useAuth } from '@/context/authContext';

export default function Register() {
  const { user, register, logout } = useAuth();

  const RegisterInputFieldsNames = useMemo(() => {
    return RegisterInputFieldsObject.map((field) => field.lableName);
  }, [RegisterInputFieldsObject]);
  
  const [err, setErr] = useState("")
  const [registerInfo, setRegisterInfo] = useState(Object.fromEntries(RegisterInputFieldsNames.map(FieldName => [FieldName, ""])));


  function handleInfoChange(text: string, FieldName: string) {
    setRegisterInfo((prev) => ({...prev,[FieldName]: text}));
}

async function onRegister() {
  setErr("");
  const result = await register(registerInfo.name, registerInfo.email, registerInfo.password);
  if (result == "register-true"){
      router.push("/(OnBoarding)/welcome")
  } else {
    setErr("register failed");
  }
}

  return (
    <View className="flex-1 items-center bg-white h-full w-full">
      {/* back to login button */}
      <View className="w-full items-end mt-2 l-1">
        <CostumeButton
          onPress={() => router.push("/(auth)/login")}
          className={{ TouchableOpacity: "p-2", Text: "text-black" }}
          icon={icons.BackArrow}
          iconWindStyle="justify-center"
          iconStyle={{
            width: responsiveWidth(8),
            height: responsiveHeight(4),
          }}
        />
      </View>

      <H1 className="mb-10">register page</H1>

      <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      style = {{
        width: responsiveWidth(100),
        height: responsiveHeight(80),
        marginBottom: responsiveHeight(5),
        }}>

      <View className="flex-col w-96 h-fit bg-slate-100 rounded-xl p-6"> 
        {/* input fileds grid */}
        {RegisterInputFieldsObject.map((FieldObject, index) => ( 
          <View key={index} className="space-y-4 mb-6">
            <InputField 
              InputFieldprops={FieldObject}
              onChangeProp={(data) => handleInfoChange(data, FieldObject.lableName)}
              value={registerInfo[FieldObject.lableName]}>
            </InputField>
          </View>
        ))}

        <CostumeErr className="text-center mb-3 text-red-500">{err}</CostumeErr>

        <CostumeButton
        onPress={onRegister}
        className={{TouchableOpacity: "bg-blue-500 py-3 px-6 rounded-3xl shadow-md mb-4", Text: "text-white text-center"}}
        Title="Register"
        />

        <Text className="text-center mb-4">-or-</Text>
        <Text className="text-center mb-4">Register with</Text>
        
        {/* auth with socials */}
        <View className="h-20 w-full flex-wrap content-around">
          <CostumeButton
          onPress={()=>{Alert.alert("auth with twitter")}}
          className={{TouchableOpacity: "w-20 py-3", Text: "text-black"}}
          icon={icons.twitterIcon}
          iconWindStyle="self-center justify-center right-2"
          iconStyle={{
            width: responsiveWidth(6),
            height: responsiveHeight(4),  
            resizeMode: 'contain',        
            justifyContent: 'center',
            alignItems: 'center',
          }}
          />
        
          <CostumeButton
          onPress={()=>{Alert.alert("auth with Facebook")}}
          className={{TouchableOpacity: "w-20 py-3", Text: "text-black"}}
          icon={icons.facebookIcon}
          iconWindStyle="self-center justify-center right-2"
          iconStyle={{
            width: responsiveWidth(6),
            height: responsiveHeight(4),  
            resizeMode: 'contain',        
            justifyContent: 'center',
            alignItems: 'center',
          }}
          
          />
        </View>

      </View>
      </ScrollView>
    </View>
  );
}
