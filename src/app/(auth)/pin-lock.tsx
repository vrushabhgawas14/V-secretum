import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/color";

export default function PinLock() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { setPinVerified } = useAuthStore();

  useEffect(() => {
    tryBiometric();
  }, []);

  const tryBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to Secretum",
        promptSubtitle: "Verify identity",
        fallbackLabel: "Use PIN",
      });
      if (result.success) unlockApp();
    }
  };

  const unlockApp = () => {
    setPinVerified(true);
    router.replace("/(main)/home");
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) verifyPin(newPin);
  };

  const verifyPin = async (entered: string) => {
    const saved = await SecureStore.getItemAsync("app_pin");
    if (entered === saved) {
      unlockApp();
    } else {
      setError("Wrong PIN, try again");
      setTimeout(() => {
        setPin("");
        setError("");
      }, 800);
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      <Text style={styles.subtitle}>to access V Secretum</Text>

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.errorPlaceholder}> </Text>
      )}

      <View style={styles.grid}>
        {digits.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, d === "" && styles.emptyKey]}
            onPress={() => {
              if (!d) return;
              if (d === "⌫") setPin((p) => p.slice(0, -1));
              else handleDigit(d);
            }}
            disabled={d === ""}
          >
            <Text style={styles.keyText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometric}>
        <Text style={styles.biometricText}>Use Fingerprint / Face ID</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#888", fontSize: 14, marginBottom: 32 },
  dots: { flexDirection: "row", gap: 16, marginBottom: 12 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  dotFilled: { backgroundColor: "#4285F4" },
  dotError: { borderColor: "#ff4444", backgroundColor: "#ff4444" },
  error: { color: "#ff4444", fontSize: 13, marginBottom: 16 },
  errorPlaceholder: { fontSize: 13, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: 300, marginTop: 20 },
  key: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyKey: { opacity: 0 },
  keyText: { color: "#fff", fontSize: 24, fontWeight: "500" },
  biometricBtn: {
    marginTop: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3e77d2b8",
    padding: 10,
    paddingHorizontal: 20,
  },
  biometricText: { color: "#4285F4", fontSize: 14 },
});
