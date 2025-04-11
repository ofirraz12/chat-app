declare interface InputFieldParams{
    InputFieldprops: {
        lableName: string;
        placeHolder?: string;
    };
    onChangeProp?: (data: string) => void;
    value?: string;
};

declare interface InputLabelParams{
    LableName: string;
};

declare interface CostumeButtonParams{
    children?: React.ReactNode;
    className?: {TouchableOpacity: string, Text: string};
    onPress: () => void;
    Title?: string;
    icon?: any;
    iconWindStyle?: string | object;
    iconStyle?: object;
};

declare interface CostumeErrParams{
    children?: React.ReactNode;
    className?: string;
};


export { InputLabelParams, InputFieldParams, CostumeButtonParams, CostumeErrParams }