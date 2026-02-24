import { useEffect } from "react";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../store/authStore";
import { Text, View } from "react-native";

export default function Index() {
  //   const { user } = useAuthStore();

  //   useEffect(() => {
  //     const redirect = async () => {
  //       if (!user) {
  //         router.replace("/(auth)/login");
  //         return;
  //       }
  //       const pin = await SecureStore.getItemAsync("app_pin");
  //       if (pin) {
  //         router.replace("/(auth)/pin-lock");
  //       } else {
  //         router.replace("/(auth)/pin-setup");
  //       }
  //     };
  //     redirect();
  //   }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello</Text>
      <Link href={"/(auth)/login"}>Login</Link>
      <Link href={"/(auth)/pin-lock"}>Pin Lock</Link>
      <Link href={"/(auth)/pin-setup"}>Pin Setup</Link>
      <Link href={"/(main)/home"}>Home</Link>
      <Link href={"/(main)/add-password"}>Add Password</Link>
    </View>
  ); // renders nothing, just redirects
}
