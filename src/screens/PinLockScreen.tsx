import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { useAuthStore } from "../store/authStore";
import { router } from "expo-router";

export default function PinLockScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { setPinVerified } = useAuthStore();

  React.useEffect(() => {
    tryBiometric();
  }, []);

  const tryBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to open PassVault",
      });
      if (result.success) unlockApp();
    }
  };

  const unlockApp = () => {
    setPinVerified(true);
    router.replace("Home");
  };

  const handleDigit = (digit: string) => {
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) verifyPin(newPin);
  };

  const verifyPin = async (enteredPin: string) => {
    const savedPin = await SecureStore.getItemAsync("app_pin");
    if (enteredPin === savedPin) {
      unlockApp();
    } else {
      setError("Wrong PIN, try again");
      setPin("");
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, pin.length > i && styles.dotFilled]}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {digits.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, !d && styles.emptyKey]}
            onPress={() => {
              if (!d) return;
              if (d === "⌫") setPin((p) => p.slice(0, -1));
              else if (pin.length < 4) handleDigit(d);
            }}
          >
            <Text style={styles.keyText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "600", marginBottom: 32 },
  dots: { flexDirection: "row", gap: 16, marginBottom: 16 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  dotFilled: { backgroundColor: "#4285F4" },
  error: { color: "#ff4444", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: 240, marginTop: 24 },
  key: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyKey: { opacity: 0 },
  keyText: { color: "#fff", fontSize: 24, fontWeight: "500" },
});
