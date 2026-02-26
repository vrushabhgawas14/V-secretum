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
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { getAllPasswords } from "../../services/apiService";
import { PasswordEntry, Category } from "../../types";
import COLORS from "../../constants/color";

const CATEGORIES: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "🔴 Important", value: "important" },
  { label: "🟡 Least Imp", value: "least_important" },
  { label: "💼 Work", value: "work" },
  { label: "📁 Other", value: "other" },
];

const categoryColor: Record<Category, string> = {
  important: "#ff4444",
  least_important: "#ffaa00",
  work: "#4285F4",
  other: "#888",
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
      const data = await getAllPasswords(user._id);
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
          p.website?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [search, activeCategory, passwords]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>V Secretum</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(main)/add-password")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search title, username, site..."
        placeholderTextColor="#555"
        value={search}
        onChangeText={setSearch}
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
            tintColor="#4285F4"
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
                  { backgroundColor: categoryColor[item.category] + "22" },
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
                  {item.username || item.website || "No username"}
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
                : "No passwords yet\nTap + Add to get started"}
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
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  search: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  catList: { marginBottom: 12, flexGrow: 0 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1a1a2e",
    marginRight: 8,
  },
  catChipActive: { backgroundColor: "#4285F4" },
  catText: { color: "#aaa", fontSize: 13 },
  catTextActive: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#1a1a2e",
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
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 18, fontWeight: "700" },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cardSub: { color: "#888", fontSize: 12, marginTop: 2, maxWidth: 200 },
  arrow: { color: "#555", fontSize: 24 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: {
    color: "#555",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
});
