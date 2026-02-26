import { View, Text, Button } from "react-native";
import React from "react";
import { useAuthStore } from "../../store/authStore";

export default function pinSetup() {
  const { logout } = useAuthStore();
  return (
    <View>
      <Text>pinSetup</Text>
      <Button title="Logout" onPress={logout}></Button>
    </View>
  );
}
