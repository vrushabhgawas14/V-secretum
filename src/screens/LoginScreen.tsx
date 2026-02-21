import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { setUser } = useAuthStore();

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: "YOUR_IOS_CLIENT_ID",
        androidClientId: "YOUR_ANDROID_CLIENT_ID",
        webClientId: "YOUR_WEB_CLIENT_ID",
    });

    React.useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            fetchUserInfo(authentication?.accessToken!);
        }
    }, [response]);

    const fetchUserInfo = async (token: string) => {
        const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json();
        setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            photoUrl: user.picture,
        });

        // Check if PIN is already set
        const pin = await SecureStore.getItemAsync("app_pin");
        if (pin) {
            router.replace('/(auth)/pin-lock');
        } else {
            router.replace('/(auth)/pin-setup');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔐 PassVault</Text>
            <Text style={styles.subtitle}>Your personal password manager</Text>
            <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => promptAsync()}
                disabled={!request}
            >
                <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f0f1a",
        padding: 24,
    },
    title: { fontSize: 36, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#aaa", marginBottom: 48 },
    googleBtn: {
        backgroundColor: "#4285F4",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    googleBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
