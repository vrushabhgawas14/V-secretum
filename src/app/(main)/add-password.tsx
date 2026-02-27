import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import {
  addPassword,
  updatePassword,
  getAllPasswords,
} from "../../services/apiService";
import { Category, PasswordEntry } from "../../types";
import COLORS from "../../constants/color";
import Field from "../../components/Field";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: {
  label: string;
  value: Category;
  emoji: string;
  color: string;
}[] = [
  { label: "Imp", value: "important", emoji: "🔴", color: "#ff4444" },
  {
    label: "Least Imp",
    value: "least_important",
    emoji: "🟡",
    color: "#ffaa00",
  },
  { label: "Work", value: "work", emoji: "💼", color: "#4285F4" },
  { label: "Other", value: "other", emoji: "📁", color: "#888" },
];

// ─── Password Strength ────────────────────────────────────────────────────────

const getStrength = (
  pwd: string,
): { score: number; label: string; color: string } => {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 7) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ff4444" };
  if (score <= 3) return { score, label: "Fair", color: "#ffaa00" };
  if (score === 4) return { score, label: "Good", color: "#4285F4" };
  return { score, label: "Strong", color: "#00c48c" };
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddPassword() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const { user } = useAuthStore();
  const isEdit = !!entryId;

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(isEdit);

  // Animate form in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load existing entry in edit mode
  useEffect(() => {
    if (!isEdit || !user || !user._id) return;
    getAllPasswords(user._id)
      .then((entries) => {
        const entry = entries.find((e) => e._id === entryId);
        if (entry) {
          setTitle(entry.title);
          setUsername(entry.username || "");
          setPassword(entry.password);
          setWebsite(entry.website || "");
          setNotes(entry.notes || "");
          setCategory(entry.category);
        }
        setLoadingEntry(false);
      })
      .catch(() => setLoadingEntry(false));
  }, [entryId]);

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert("Required", "Please enter a title.");
    if (!password.trim())
      return Alert.alert("Required", "Please enter a password.");
    if (!user) return;

    setLoading(true);
    try {
      const entry: Partial<PasswordEntry> = {
        owner: user._id,
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        website: website.trim(),
        notes: notes.trim(),
        category,
      };
      if (isEdit && entryId) {
        await updatePassword(entryId, entry, user._id!);
      } else {
        console.log("Entry : ", entry);
        console.log("User ID for Add password : ", user._id);
        await addPassword(entry, user._id!);
      }
      router.replace("/(main)/home");
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(password);

  if (loadingEntry) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Entry" : "New Entry"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Field
          label="Title"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Gmail, Telegram, Netflix"
          autoCapitalize="words"
        />

        {/* Username */}
        <View style={styles.fieldGap} />
        <Field
          label="Username / Email"
          value={username}
          onChangeText={setUsername}
          placeholder="you@example.com"
          keyboardType="email-address"
        />

        {/* Password */}
        <View style={styles.fieldGap} />
        <Field
          label="Password"
          required
          value={password}
          onChangeText={setPassword}
          placeholder="Enter or generate a password"
          secureTextEntry={!showPwd}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowPwd((v) => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showPwd ? "🙈" : "👀"}</Text>
            </TouchableOpacity>
          }
        />

        {/* Strength meter */}
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        i <= strength.score ? strength.color : "#1e1e3a",
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        {/* Category */}
        <View style={styles.fieldGap} />
        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            return (
              <Pressable
                key={cat.value}
                style={[
                  styles.catChip,
                  active && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + "18",
                  },
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.catLabel,
                    active && { color: cat.color, fontWeight: "700" },
                  ]}
                >
                  {cat.label}
                </Text>
                {active && (
                  <View
                    style={[styles.catDot, { backgroundColor: cat.color }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Website */}
        <View style={styles.fieldGap} />
        <Field
          label="Website"
          value={website}
          onChangeText={setWebsite}
          placeholder="https://example.com"
          keyboardType="url"
        />

        {/* Notes */}
        <View style={styles.fieldGap} />
        <Field
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any extra info..."
          multiline
        />

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? "Update Entry" : "Save Entry"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
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
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: { padding: 20, paddingTop: 24 },
  fieldGap: { height: 16 },
  sectionLabel: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBars: { flexDirection: "row", gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "700",
    width: 44,
    textAlign: "right",
  },

  // Generate
  generateBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4285F4",
    borderStyle: "dashed",
    alignItems: "center",
  },
  generateText: { color: "#4285F4", fontSize: 13, fontWeight: "600" },

  // Category
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    backgroundColor: "#151528",
  },
  catEmoji: { fontSize: 14 },
  catLabel: { color: "#888", fontSize: 13 },
  catDot: { width: 5, height: 5, borderRadius: 3, marginLeft: 2 },

  // Save
  saveBtn: {
    marginTop: 32,
    backgroundColor: "#4285F4",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Eye
  eyeBtn: { paddingLeft: 10, paddingVertical: 14 },
  eyeText: { fontSize: 18 },
});
