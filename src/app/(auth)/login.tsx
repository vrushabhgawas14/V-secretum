import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { signIn } from "../../services/apiService";
import { useAuthStore } from "../../store/authStore";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

export default function login() {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signIn();

      if (!user) return;

      // Save user to global state
      setUser({
        _id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      });

      // Redirect based on whether PIN exists
      const pin = await SecureStore.getItemAsync("app_pin");
      router.replace(pin ? "/(auth)/pin-lock" : "/(auth)/pin-setup");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 V Secretum</Text>
      <Text style={styles.subtitle}>Your personal password manager</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <GoogleSigninButton
          style={{ width: 250, height: 50 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={handleGoogleSignIn}
        />
      )}
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
});
