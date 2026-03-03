import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { signIn } from "../../services/apiService";
import { useAuthStore } from "../../store/authStore";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import COLORS from "../../constants/color";

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
      <Text style={styles.subtitle}>Your Personal Password Manager</Text>

      {loading ? (
        <View style={[styles.customGoogleBtn, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.customGoogleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require("../../../assets/google.png")}
              style={styles.googleIcon}
            />
          </View>
          <Text style={styles.googleBtnText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkBackground,
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.offWhite, marginBottom: 48 },
  customGoogleBtn: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    width: 250,
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
    elevation: 8,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  googleIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  googleBtnText: {
    flex: 1,
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 24,
  },
});
