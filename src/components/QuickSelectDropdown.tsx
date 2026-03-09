import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import COLORS from "../constants/color";

interface QuickSelectDropdownProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
  freeType?: boolean;
  onFreeTypeChange?: (v: string) => void;
  keyboardType?: any;
}

export default function QuickSelectDropdown({
  label,
  options,
  value,
  onSelect,
  placeholder,
  freeType,
  onFreeTypeChange,
  keyboardType,
}: QuickSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>{label}</Text>
      {/* Free-type input */}
      <View style={[ddStyles.inputRow, focused && ddStyles.inputFocused]}>
        <TextInput
          style={ddStyles.input}
          value={value}
          onChangeText={onFreeTypeChange ?? onSelect}
          placeholder={placeholder}
          placeholderTextColor="#7d7d8d"
          keyboardType={keyboardType}
          autoCapitalize="none"
          selectionColor="#3c1f57"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {options.length > 0 && (
          <TouchableOpacity
            style={ddStyles.dropBtn}
            onPress={() => setOpen((v) => !v)}
          >
            <Text style={ddStyles.dropIcon}>{open ? "▲" : "▼"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Dropdown options */}
      {open && options.length > 0 && (
        <View style={ddStyles.dropdown}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[ddStyles.option, value === opt && ddStyles.optionActive]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  ddStyles.optionText,
                  value === opt && ddStyles.optionTextActive,
                ]}
              >
                {opt}
              </Text>
              {value === opt && <Text style={{ color: "#cecece" }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const ddStyles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: COLORS.inputBackgroundFocused,
    backgroundColor: "#d8cfdf",
  },
  dropBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  dropIcon: { color: COLORS.cardBackground, fontSize: 18 },
  dropdown: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    marginTop: 4,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#b6b6baa2",
  },
  optionActive: { backgroundColor: "#4285F412" },
  optionText: { color: "#aaa", fontSize: 14 },
  optionTextActive: { color: "#edebeb", fontWeight: "600" },
});
