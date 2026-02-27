import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";

interface FieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  required,
  rightElement,
  ...rest // This catches any other standard TextInput props
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>
        {label}
        {required && <Text style={{ color: "#ff4444" }}> *</Text>}
      </Text>
      <View style={[fieldStyles.inputRow, focused && fieldStyles.inputFocused]}>
        <TextInput
          style={[fieldStyles.input, multiline && fieldStyles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#3a3a5a"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightElement}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151528",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: "#4285F4" },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },
  multiline: { height: 80, textAlignVertical: "top", paddingTop: 14 },
});
