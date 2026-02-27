import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { deletePassword, getPasswordWithID } from "../../services/apiService";
import { PasswordEntry, Category } from "../../types";
import COLORS from "../../constants/color";
import CopyRow from "../../components/CopyRow";

// ─── Category metadata ────────────────────────────────────────────────────────

const categoryMeta: Record<
  Category,
  { label: string; color: string; emoji: string }
> = {
  important: { label: "Important", color: "#ff4444", emoji: "🔴" },
  least_important: { label: "Least Important", color: "#ffaa00", emoji: "🟡" },
  work: { label: "Work", color: "#4285F4", emoji: "💼" },
  other: { label: "Other", color: "#888888", emoji: "📁" },
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PasswordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [entry, setEntry] = useState<PasswordEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Animate in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    if (!user || !id) return;
    getPasswordWithID(user._id!, id).then((result) => {
      setEntry(result);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      `Delete "${entry?.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!entry?._id) return;
            setDeleting(true);
            try {
              await deletePassword(entry._id);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete. Try again.");
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!entry) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundEmoji}>🔍</Text>
        <Text style={styles.notFoundText}>Entry not found</Text>
        <TouchableOpacity
          style={styles.backLinkBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backLinkText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = categoryMeta[entry.category];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            router.push({
              pathname: "/(main)/add-password",
              params: { entryId: entry._id },
            })
          }
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero block */}
        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, { backgroundColor: meta.color + "22" }]}
          >
            <Text style={[styles.heroLetter, { color: meta.color }]}>
              {entry.title[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.heroTitle}>{entry.title}</Text>
            {/* {entry.website ? (
              <Text style={styles.heroWebsite}>{entry.website}</Text>
            ) : null} */}
            <View
              style={[
                styles.categoryBadge,
                {
                  borderColor: meta.color + "60",
                  backgroundColor: meta.color + "18",
                },
              ]}
            >
              <Text style={styles.categoryBadgeText}>{meta.emoji} </Text>
              <Text style={[styles.categoryBadgeText, { color: meta.color }]}>
                {meta.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Credentials */}
        <Text style={styles.sectionTitle}>CREDENTIALS</Text>
        <View style={styles.card}>
          <CopyRow label="Username / Email" value={entry.username || ""} />
          {entry.username ? <View style={styles.fieldSep} /> : null}
          <CopyRow label="Password" value={entry.password} secret />
        </View>

        {/* Website */}
        {entry.website ? (
          <>
            <Text style={styles.sectionTitle}>WEBSITE</Text>
            <View style={styles.card}>
              <CopyRow label="URL" value={entry.website} />
            </View>
          </>
        ) : null}

        {/* Notes */}
        {entry.notes ? (
          <>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{entry.notes}</Text>
            </View>
          </>
        ) : null}

        {/* Timestamps */}
        <View style={styles.timestamps}>
          <Text style={styles.timestampText}>
            Created{" "}
            {new Date(entry.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.timestampText}>
            Updated{" "}
            {new Date(entry.updatedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator color="#ff4444" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete Entry</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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

  // Header
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  editBtn: {
    backgroundColor: "#4285F422",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editText: { color: "#4285F4", fontWeight: "700", fontSize: 14 },

  // Hero
  content: { padding: 20 },
  hero: {
    flexDirection: "row",        // ← key change, was column
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 4,
    gap: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,               // prevents icon from shrinking
  },
  heroLetter: {
    fontSize: 28,                // slightly smaller than before
    fontWeight: "800",
  },
  heroInfo: {
    flex: 1,                     // takes remaining width
    gap: 4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,                // tighter than before
    fontWeight: "800",
  },
  heroWebsite: {
    color: "#555",
    fontSize: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",     // ← hugs content width, doesn't stretch
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  categoryBadgeEmoji: {
    fontSize: 11,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  divider: { height: 1, backgroundColor: "#1a1a2e", marginVertical: 20 },

  // Sections
  sectionTitle: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#151528",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    padding: 14,
    marginBottom: 20,
  },
  fieldSep: { height: 1, backgroundColor: "#1e1e3a", marginVertical: 10 },
  notesText: { color: "#ccc", fontSize: 14, lineHeight: 22 },

  // Timestamps
  timestamps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timestampText: { color: "#333", fontSize: 11 },

  // Delete
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#ff444440",
    backgroundColor: "#ff444412",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  deleteBtnText: { color: "#ff4444", fontSize: 15, fontWeight: "700" },

  // Not found
  notFoundEmoji: { fontSize: 48, marginBottom: 12 },
  notFoundText: { color: "#555", fontSize: 16, marginBottom: 20 },
  backLinkBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  backLinkText: { color: "#4285F4", fontSize: 15 },
});
