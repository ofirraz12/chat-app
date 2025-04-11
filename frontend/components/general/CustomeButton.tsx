import { TouchableOpacity, Text, Image } from "react-native";
import {CostumeButtonParams} from "@/types/types";

export default function CostumeButton({children, className, onPress, Title, icon, iconWindStyle, iconStyle}: CostumeButtonParams){
    return(
        <TouchableOpacity 
         className={className?.TouchableOpacity}
         onPress={onPress}
         >
            {Title && (
              <Text className={className?.Text}>{Title}</Text>
            )}

            {icon && (
              <Image source={icon} style={iconStyle} className={`w-6 h-6 ml-4 ${iconWindStyle}`} />
            )}
            
        </TouchableOpacity>
)};