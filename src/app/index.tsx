import { View, ActivityIndicator } from "react-native";
import COLORS from "../constants/color";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size="large" color="#4285F4" />
    </View>
  );
}
