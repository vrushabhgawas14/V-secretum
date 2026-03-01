import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { getProfile, updateSavedFields } from "../../services/apiService";
import COLORS from "../../constants/color";
import * as SecureStore from "expo-secure-store";

const categoryMeta = [
  { key: "all", label: "All", emoji: "🗂️", color: "#fff" },
  { key: "important", label: "Important", emoji: "🔴", color: "#ff4444" },
  { key: "least_important", label: "Least Imp", emoji: "🟡", color: "#ffaa00" },
  { key: "work", label: "Work", emoji: "💼", color: "#4285F4" },
  { key: "other", label: "Other", emoji: "📁", color: "#888888" },
];

export default function Profile() {
  const { user, updateUser, logout, setSavedFields } = useAuthStore();

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [savedEmails, setSavedEmails] = useState<string[]>(
    user?.savedEmails ?? []
  );
  const [savedPhones, setSavedPhones] = useState<string[]>(
    user?.savedPhones ?? []
  );
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setCounts(data.counts);
        setSavedEmails(data.user.savedEmails || []);
        setSavedPhones(data.user.savedPhones || []);
        if (user) {
          updateUser({
            savedEmails: data.user.savedEmails,
            savedPhones: data.user.savedPhones,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return Alert.alert("Invalid", "Please enter a valid email address.");
    }
    if (savedEmails.includes(trimmed)) {
      return Alert.alert("Duplicate", "This email is already saved.");
    }
    setSavedEmails((prev) => [...prev, trimmed]);
    setNewEmail("");
  };

  const handleAddPhone = () => {
    const trimmed = newPhone.trim();
    if (!trimmed) return;
    if (savedPhones.includes(trimmed)) {
      return Alert.alert("Duplicate", "This phone is already saved.");
    }
    setSavedPhones((prev) => [...prev, trimmed]);
    setNewPhone("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSavedFields(savedEmails, savedPhones);
      setSavedFields(savedEmails, savedPhones); // update store
      Alert.alert("Saved", "Your quick-select fields have been updated.");
    } catch {
      Alert.alert("Error", "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleResetPin = () => {
    Alert.alert(
      "Reset PIN",
      "This will ask you to set a new PIN on Setup Screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("app_pin");
            router.replace("/(auth)/pin-setup");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        {user?.photoUrl ? (
          <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {user?.name?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Password counts */}
      <Text style={styles.sectionLabel}>PASSWORDS SUMMARY</Text>
      <View style={styles.countsGrid}>
        {categoryMeta.map((cat) => (
          <View key={cat.key} style={styles.countCard}>
            <Text style={styles.countEmoji}>{cat.emoji}</Text>
            <Text style={[styles.countNumber, { color: cat.color }]}>
              {counts[cat.key] ?? 0}
            </Text>
            <Text style={styles.countLabel}>{cat.label}</Text>
          </View>
        ))}
      </View>

      {/* Saved Emails */}
      <Text style={styles.sectionLabel}>QUICK-SELECT EMAILS</Text>
      <View style={styles.card}>
        {savedEmails.length === 0 && (
          <Text style={styles.emptyHint}>No emails saved yet</Text>
        )}
        {savedEmails.map((email, i) => (
          <View key={i} style={styles.chipRow}>
            <Text style={styles.chipText}>✉️ {email}</Text>
            <TouchableOpacity
              onPress={() => setSavedEmails((p) => p.filter((_, j) => j !== i))}
            >
              <Text style={styles.chipRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Add email..."
            placeholderTextColor="#3a3a5a"
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={handleAddEmail}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddEmail}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Saved Phones */}
      <Text style={styles.sectionLabel}>QUICK-SELECT PHONES</Text>
      <View style={styles.card}>
        {savedPhones.length === 0 && (
          <Text style={styles.emptyHint}>No phone numbers saved yet</Text>
        )}
        {savedPhones.map((phone, i) => (
          <View key={i} style={styles.chipRow}>
            <Text style={styles.chipText}>📱 {phone}</Text>
            <TouchableOpacity
              onPress={() => setSavedPhones((p) => p.filter((_, j) => j !== i))}
            >
              <Text style={styles.chipRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder="Add phone..."
            placeholderTextColor="#3a3a5a"
            keyboardType="phone-pad"
            onSubmitEditing={handleAddPhone}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPhone}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save changes button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      {/* Settings */}
      <Text style={styles.sectionLabel}>SETTINGS</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.settingRow} onPress={handleResetPin}>
          <Text style={styles.settingIcon}>🔑</Text>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Reset Lock PIN</Text>
            <Text style={styles.settingSubtitle}>
              Set a new PIN on Setup Screen
            </Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.settingDivider} />
        <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
          <Text style={styles.settingIcon}>🚪</Text>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: "#ff4444" }]}>
              Logout
            </Text>
            <Text style={styles.settingSubtitle}>Sign out of your account</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: "#4285F4", fontSize: 18 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  userCard: {
    backgroundColor: "#151528",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#1e1e3a",
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4285F422",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitial: { color: "#4285F4", fontSize: 32, fontWeight: "800" },
  userName: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 4 },
  userEmail: { color: "#555", fontSize: 13 },

  sectionLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
    marginTop: 8,
  },

  countsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  countCard: {
    flex: 1,
    minWidth: "28%",
    backgroundColor: "#151528",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e1e3a",
  },
  countEmoji: { fontSize: 20, marginBottom: 6 },
  countNumber: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  countLabel: { color: "#555", fontSize: 11, textAlign: "center" },

  card: {
    backgroundColor: "#151528",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    padding: 14,
    marginBottom: 20,
  },
  emptyHint: {
    color: "#333",
    fontSize: 13,
    paddingVertical: 4,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e3a",
  },
  chipText: { color: "#ccc", fontSize: 14, flex: 1 },
  chipRemove: {
    color: "#ff4444",
    fontSize: 14,
    paddingLeft: 12,
    fontWeight: "700",
  },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  addInput: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1e1e3a",
  },
  addBtn: {
    backgroundColor: "#4285F422",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#4285F444",
  },
  addBtnText: { color: "#4285F4", fontWeight: "700", fontSize: 13 },

  saveBtn: {
    backgroundColor: "#4285F4",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 28,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingIcon: { fontSize: 20, marginRight: 14 },
  settingInfo: { flex: 1 },
  settingTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: { color: "#555", fontSize: 12 },
  settingArrow: { color: "#333", fontSize: 22 },
  settingDivider: { height: 1, backgroundColor: "#1e1e3a", marginVertical: 2 },
});
