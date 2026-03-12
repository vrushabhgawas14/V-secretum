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
  important: { label: "Important", color: "#770000", emoji: "🔴" },
  socials: { label: "Socials", color: "#033e2e", emoji: "✨" },
  least_important: { label: "Least Important", color: "#5c4009", emoji: "🟡" },
  work: { label: "Work", color: "#000752", emoji: "💼" },
  other: { label: "Other", color: "#38005e", emoji: "📁" },
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
    getPasswordWithID(user._id!, id, user.googleId).then((result) => {
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
      "Delete Password",
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
              router.replace("/(main)/home");
            } catch {
              Alert.alert("Error", "Failed to delete. Try again.");
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.loader} />
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
          <CopyRow label="Username" value={entry.username || ""} />
          <CopyRow label="Email" value={entry.email || ""} />
          <CopyRow label="Phone Number" value={entry.phoneNumber || ""} />
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
            <View style={styles.card}>
              <CopyRow label="NOTES" value={entry.notes} />
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
            <Text style={styles.deleteBtnText}>Delete Password</Text>
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
    borderBottomColor: COLORS.homePageCard,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.homePageCard,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: COLORS.offWhite, fontSize: 18 },
  headerTitle: { color: COLORS.textDark, fontSize: 18, fontWeight: "900" },
  editBtn: {
    backgroundColor: COLORS.button,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editText: { color: COLORS.offWhite, fontWeight: "700", fontSize: 14 },

  // Hero
  content: { padding: 20 },
  hero: {
    flexDirection: "row",
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
    flexShrink: 0,
    borderWidth : 1,
    borderColor : COLORS.homePageCard
  },
  heroLetter: {
    fontSize: 28,
    fontWeight: "800",
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: COLORS.textDark,
    fontSize: 22,
    fontWeight: "800",
  },
  heroWebsite: {
    color: "#555",
    fontSize: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    borderColor : COLORS.homePageCard,
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

  divider: { height: 1, backgroundColor: "#1a1a2e", marginVertical: 10 },

  // Sections
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e1e3a",
    padding: 14,
    marginBottom: 20,
  },
  fieldSep: { height: 1, backgroundColor: COLORS.offWhite, marginVertical: 0 },
  notesText: { color: "#ccc", fontSize: 14, lineHeight: 22 },

  // Timestamps
  timestamps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  timestampText: { color: COLORS.textSecondary, fontSize: 11 },

  // Delete
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#060000",
    backgroundColor: "#1a1a2e",
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
