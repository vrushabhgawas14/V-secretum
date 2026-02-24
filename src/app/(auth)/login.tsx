import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { loginWithGoogle } from "../../services/apiService";
import { useAuthStore } from "../../store/authStore";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export default function login() {
  const { setUser } = useAuthStore();

  // Replace the fetchUserInfo function in login.tsx with this:
  const fetchUserInfo = async (token: string) => {
    // 1. Get user info from Google
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const googleUser = await res.json();

    // 2. Register/login with YOUR backend — this gives back a JWT
    const user = await loginWithGoogle({
      googleId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      photoUrl: googleUser.picture,
    });

    // 3. Store user in Zustand
    setUser({
      _id: user._id, // Might remove this later
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      photoUrl: user.photoUrl,
    });

    // 4. Navigate (same as before)
    const pin = await SecureStore.getItemAsync("app_pin");
    router.replace(pin ? "/(auth)/pin-lock" : "/(auth)/pin-setup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 V Secretum</Text>
      <Text style={styles.subtitle}>Your personal password manager</Text>
      <TouchableOpacity style={styles.googleBtn}>
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
