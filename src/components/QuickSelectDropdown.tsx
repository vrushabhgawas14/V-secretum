import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>{label}</Text>
      {/* Free-type input */}
      <View style={ddStyles.inputRow}>
        <TextInput
          style={ddStyles.input}
          value={value}
          onChangeText={onFreeTypeChange ?? onSelect}
          placeholder={placeholder}
          placeholderTextColor="#3a3a5a"
          keyboardType={keyboardType}
          autoCapitalize="none"
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
              {value === opt && <Text style={{ color: "#4285F4" }}>✓</Text>}
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
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  dropBtn: { paddingHorizontal: 14, paddingVertical: 14 },
  dropIcon: { color: "#4285F4", fontSize: 11 },
  dropdown: {
    backgroundColor: "#1c1c32",
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
  },
  optionActive: { backgroundColor: "#4285F412" },
  optionText: { color: "#aaa", fontSize: 14 },
  optionTextActive: { color: "#fff", fontWeight: "600" },
});
