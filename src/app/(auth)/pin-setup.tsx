import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import COLORS from "../../constants/color";

export default function PinSetup() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"set" | "confirm">("set");

  const handleDigit = (digit: string) => {
    const current = step === "set" ? pin : confirmPin;
    if (current.length >= 4) return;

    const newVal = current + digit;

    if (step === "set") {
      setPin(newVal);
      if (newVal.length === 4) setTimeout(() => setStep("confirm"), 300);
    } else {
      setConfirmPin(newVal);
      if (newVal.length === 4) verifyAndSave(newVal);
    }
  };

  const handleBackspace = () => {
    if (step === "set") setPin((p) => p.slice(0, -1));
    else setConfirmPin((p) => p.slice(0, -1));
  };

  const verifyAndSave = async (entered: string) => {
    if (pin === entered) {
      await SecureStore.setItemAsync("app_pin", pin);
      router.replace("/(main)/home");
    } else {
      Alert.alert("PIN Mismatch", "PINs did not match. Please try again.");
      setPin("");
      setConfirmPin("");
      setStep("set");
    }
  };

  const currentPin = step === "set" ? pin : confirmPin;
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === "set" ? "Create a PIN" : "Confirm your PIN"}
      </Text>
      <Text style={styles.subtitle}>
        {step === "set"
          ? "This PIN protects your vault"
          : "Enter the same PIN again"}
      </Text>

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, currentPin.length > i && styles.dotFilled]}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {digits.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.key, d === "" && styles.emptyKey]}
            onPress={() => {
              if (!d) return;
              if (d === "⌫") handleBackspace();
              else handleDigit(d);
            }}
            disabled={d === ""}
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
    backgroundColor: COLORS.darkBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: { color: COLORS.offWhite, fontSize: 14, marginBottom: 40 },
  dots: { flexDirection: "row", gap: 16, marginBottom: 200 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  dotFilled: { backgroundColor: "#4285F4" },
  grid: { flexDirection: "row", flexWrap: "wrap", width: 300 },
  key: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyKey: { opacity: 0 },
  keyText: { color: "#fff", fontSize: 24, fontWeight: "500" },
});
