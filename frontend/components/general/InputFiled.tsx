import { Text, TextInput } from "react-native";
import {InputLabelParams, InputFieldParams} from "@/types/types"
import {Fragment} from "react"
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";


type InputField = {

}

function InputLabel({LableName}: InputLabelParams){
    return (
    <Text>{LableName}</Text>
)};


export default function InputField({InputFieldprops, onChangeProp, value}: InputFieldParams){
    return(
        <Fragment>
            <InputLabel LableName={InputFieldprops.lableName}></InputLabel>
            <TextInput 
            onChangeText={onChangeProp}
            className="border-2 border-black rounded mt-2 pl-4"
            style = {{
                height: responsiveHeight(6),
                textAlignVertical: 'center',
            }}
            placeholder={InputFieldprops.placeHolder}
            value={value}
            ></TextInput>
        </Fragment>
    );
};