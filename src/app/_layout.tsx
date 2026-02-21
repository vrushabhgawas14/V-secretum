import { Stack } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { AppState } from "react-native";

export default function RootLayout() {
    const { setPinVerified } = useAuthStore();

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'background') setPinVerified(false);
        });
        return () => sub.remove();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
        </Stack>
    )
}