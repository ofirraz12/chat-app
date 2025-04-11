import { View, Text, Alert, ScrollView } from "react-native";
import {useEffect} from 'react'
import { Link, router } from "expo-router";
import { responsiveHeight, responsiveWidth, responsiveFontSize} from "react-native-responsive-dimensions";
import H1 from "@/components/general/Header";
import InputField from "@/components/general/InputFiled";
import CostumeErr from "@/components/general/CustomError"
import { LoginInputFieldsObject } from "@/lib/consts";
import CostumeButton from "@/components/general/CustomeButton"
import {icons} from "@/lib/consts"
import { useState, useMemo } from "react";
import { useAuth } from '@/context/authContext';

export default function Login() {
  const { user, login, logout } = useAuth();

  const LoginInputFieldsNames = useMemo(() => {
    return LoginInputFieldsObject.map((field) => field.lableName);
  }, [LoginInputFieldsObject]);
  
  const [err, setErr] = useState("")
  const [loginInfo, setLoginInfo] = useState(Object.fromEntries(LoginInputFieldsNames.map(FieldName => [FieldName, ""])));


  function handleInfoChange(text: string, FieldName: string) {
    setLoginInfo((prev) => ({...prev,[FieldName]: text}));
}

  async function onLogin() {
    setErr("");
    const result = await login(loginInfo.email, loginInfo.password);
    if (result){
      if (result == "login successfuly"){
          router.push("/(OnBoarding)/welcome")
      } else {
        setErr(result);
      }
    }
  }

  useEffect(() => {
    if (user) {
      console.log("User state updated, redirecting to welcome screen...");
      router.push("/(OnBoarding)/welcome");
    }
  }, [user]);

  return (
    <View className="flex-1 items-center bg-white h-full w-full">

      <H1 className="my-10">login page</H1>
      
      <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      style = {{
        width: responsiveWidth(100),
        height: responsiveHeight(80),
        marginBottom: responsiveHeight(5),
        }}>

      <View className="flex-col w-96 h-fit m bg-slate-100 rounded-xl p-6"> 
        {/* input fileds grid */}
        {LoginInputFieldsObject.map((FieldObject, index) => ( 
          <View key={index} className="mb-6">
            <InputField 
              InputFieldprops={FieldObject}
              onChangeProp={(data) => handleInfoChange(data, FieldObject.lableName)}
              value={loginInfo[FieldObject.lableName]}>
            </InputField>
          </View>
        ))}
        
        <Link
          href="/(auth)/forgotPassword"
          className="text-center mb-5">
          forgot password?
        </Link>

        <CostumeErr className="text-center mb-16 text-red-500">{err}</CostumeErr>

        <CostumeButton
        onPress={onLogin}
        className={{TouchableOpacity: "bg-blue-500 py-3 px-6 rounded-3xl shadow-md mb-4", Text: "text-white text-center"}}
        Title="Login"
        />

        <Text className="text-center mb-4">-or-</Text>
        <Text className="text-center mb-4">login with</Text>
        
        {/* auth with socials */}
        <View className="h-20 w-full flex-wrap content-around">
          <CostumeButton
          onPress={()=>{Alert.alert("auth with twitter")}}
          className={{TouchableOpacity: "w-20 py-3", Text: "text-black"}}
          icon={icons.twitterIcon}
          iconWindStyle="self-center justify-center right-2"
          iconStyle={{
            width: responsiveWidth(8),
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
            width: responsiveWidth(8),
            height: responsiveHeight(4),  
            resizeMode: 'contain',        
            justifyContent: 'center',
            alignItems: 'center',
          }}
          
          />
        </View>

        <Text className="text-center mb-4">dont have an acount?</Text>

        <Link
          href="/(auth)/register"
          className="text-center">
          Go to register
        </Link>

      </View>
      </ScrollView>
    </View>
  );
}
