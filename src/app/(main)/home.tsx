import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { getAllPasswords } from "../../services/apiService";
import { PasswordEntry, Category } from "../../types";
import COLORS from "../../constants/color";

const CATEGORIES: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "🔴 IMP", value: "important" },
  { label: "🟢 Socials", value: "socials" },
  { label: "🟡 Least IMP", value: "least_important" },
  { label: "💼 Work", value: "work" },
  { label: "📁 Other", value: "other" },
];

const categoryColor: Record<Category, string> = {
  important: "#ff6060",
  socials: "#00eaac",
  least_important: "#ffbe3c",
  work: "#949dff",
  other: "#ddaaff",
};

export default function Home() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filtered, setFiltered] = useState<PasswordEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user || !user._id) return;
    setRefreshing(true);
    try {
      const data = await getAllPasswords();
      setPasswords(data);
    } catch {
      Alert.alert("Error", "Failed to load passwords.");
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter whenever search or category changes
  useEffect(() => {
    let result = passwords;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.username?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phoneNumber?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeCategory, passwords]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>V Secretum</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(main)/add-password")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(main)/profile")}
          >
            {user?.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileInitial}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search title, username, site..."
        placeholderTextColor="#b4b4b4"
        value={search}
        onChangeText={setSearch}
        selectionColor={COLORS.offWhite}
      />

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(i) => i.value}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              activeCategory === item.value && styles.catChipActive,
            ]}
            onPress={() => setActiveCategory(item.value)}
          >
            <Text
              style={[
                styles.catText,
                activeCategory === item.value && styles.catTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Password list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.title}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={load}
            tintColor={COLORS.loader}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(main)/${item._id}`)}
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: categoryColor[item.category] + "60" },
                ]}
              >
                <Text
                  style={[
                    styles.iconText,
                    { color: categoryColor[item.category] },
                  ]}
                >
                  {item.title[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {item.username || item.email || item.phoneNumber || ""}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search
                ? "No results found"
                : "No passwords yet\nTap + to get started"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.homePageCard,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: { width: 36, height: 36, borderRadius: 18 },
  profileInitial: { color: "#4285F4", fontWeight: "700", fontSize: 15 },
  title: { color: COLORS.textDark, fontSize: 28, fontWeight: "bold" },
  addButton: {
    backgroundColor: COLORS.homePageCard,
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addButtonText: { color: COLORS.white, fontWeight: "600", fontSize: 20 },
  search: {
    backgroundColor: COLORS.homePageCard,
    color: COLORS.white,
    borderRadius: 10,
    padding: 12,
    paddingStart: 16,
    marginBottom: 12,
    fontSize: 14,
  },
  catList: { marginBottom: 12, flexGrow: 0 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.homePageCard,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: "#ded6e4" },
  catText: { color: COLORS.offWhite, fontSize: 13 },
  catTextActive: { color: COLORS.textDark, fontWeight: "600" },
  card: {
    backgroundColor: COLORS.homePageCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 18, fontWeight: "700" },
  cardTitle: { color: COLORS.white, fontSize: 15, fontWeight: "600" },
  cardSub: { color: "#cfcfcf", fontSize: 12, marginTop: 2, maxWidth: 200 },
  arrow: { color: "#d5d5d5", fontSize: 24 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: {
    color: "#555",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
});
