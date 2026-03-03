import { Stack, router } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useEffect, useRef } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import COLORS from "../constants/color";

export default function RootLayout() {
  const { user, isHydrated, hydrate, setPinVerified } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (hasRedirected.current) return; // ADD this guard
    hasRedirected.current = true;

    const redirect = async () => {
      // console.log("User in Layout: ", user);
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }
      const pin = await SecureStore.getItemAsync("app_pin");
      router.replace(pin ? "/(auth)/pin-lock" : "/(auth)/pin-setup");
    };

    redirect();
  }, [isHydrated, user]);

  // Lock app when sent to background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        setPinVerified(false);
        // console.log("App locked when closed in background");
      }
    });
    return () => sub.remove();
  }, []);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.darkBackground,
        }}
      >
        <ActivityIndicator size="large" color="#393838" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
