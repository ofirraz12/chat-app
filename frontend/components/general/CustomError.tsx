import {Text} from "react-native";
import {CostumeErrParams} from "@/types/types";

export default function CostumeErr({children, className}: CostumeErrParams){
    return(
        <Text className={className}>{children}</Text>
)};