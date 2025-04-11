import { Text, View } from "react-native";

type H1Props = {
    children: React.ReactNode;
    className?: string;
};

export default function H1({className, children}: H1Props) {
  
  return (
        <Text className={`text-5xl font-Jakarta ${ className}`}>
            {children}
        </Text>
  );
}