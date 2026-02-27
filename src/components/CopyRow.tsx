import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";

interface CopyRowProps {
  label: string;
  value: string;
  secret?: boolean;
}

export default function CopyRow({ label, value, secret }: CopyRowProps) {
  const [revealed, setRevealed] = useState(!secret);
  const [copied, setCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCopy = async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopied(true);
    
    // Feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setCopied(false), 2000);
  };

  if (!value) return null;

  return (
    <View style={rowStyles.wrapper}>
      <Text style={rowStyles.label}>{label}</Text>
      <View style={rowStyles.row}>
        <Text
          style={rowStyles.value}
          numberOfLines={secret && !revealed ? 1 : undefined}
        >
          {secret && !revealed ? "••••••••••••••••" : value}
        </Text>
        <View style={rowStyles.actions}>
          {secret && (
            <TouchableOpacity
              style={rowStyles.actionBtn}
              onPress={() => setRevealed((v) => !v)}
            >
              <Text style={rowStyles.actionText}>
                {revealed ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          )}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[rowStyles.actionBtn, copied && rowStyles.copiedBtn]}
              onPress={handleCopy}
            >
              <Text
                style={[rowStyles.actionText, copied && rowStyles.copiedText]}
              >
                {copied ? "✓ Done" : "Copy"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 }, // Increased margin for better spacing between rows
  label: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    backgroundColor: "#151528",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  value: { color: "#fff", fontSize: 15, flex: 1, marginRight: 8 },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    backgroundColor: "#1e1e3a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copiedBtn: {
    backgroundColor: "#00c48c22",
    borderWidth: 1,
    borderColor: "#00c48c44",
  },
  actionText: { color: "#4285F4", fontSize: 12, fontWeight: "700" },
  copiedText: { color: "#00c48c" },
});