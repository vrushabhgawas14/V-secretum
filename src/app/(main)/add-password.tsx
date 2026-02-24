// src/app/(main)/add-password.tsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function AddPasswordScreen() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  // if entryId exists, it's edit mode

  return (
    <View>
      <Text>Password Details</Text>
    </View>
  );
}
