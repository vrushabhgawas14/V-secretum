import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../store/authStore";
import { getAllPasswords } from "../services/mongoService";
import { PasswordEntry, Category } from "../types";

const CATEGORIES: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "🔴 Important", value: "important" },
  { label: "🟡 Least Imp", value: "least_important" },
  { label: "💼 Work", value: "work" },
  { label: "📁 Other", value: "other" },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filtered, setFiltered] = useState<PasswordEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const data = await getAllPasswords(user.id);
    setPasswords(data);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let result = passwords;
    if (activeCategory !== "all")
      result = result.filter((p) => p.category === activeCategory);
    if (search)
      result = result.filter(
        (p) =>
          p.app_title.toLowerCase().includes(search.toLowerCase()) ||
          p.username?.toLowerCase().includes(search.toLowerCase()) ||
          p.website?.toLowerCase().includes(search.toLowerCase()),
      );
    setFiltered(result);
  }, [search, activeCategory, passwords]);

  const categoryColor: Record<Category, string> = {
    important: "#ff4444",
    least_important: "#ffaa00",
    work: "#4285F4",
    other: "#888",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PassVault</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddPassword", {})}
        >
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search by name, username, site..."
        placeholderTextColor="#555"
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Filter */}
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.app_title}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("PasswordDetail", { entry: item })
            }
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: categoryColor[item.category] },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.app_title}</Text>
              <Text style={styles.cardSub}>{item.username}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No passwords found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    padding: 16,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  addBtn: { color: "#4285F4", fontSize: 16, fontWeight: "600" },
  search: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  catList: { marginBottom: 12 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a1a2e",
    marginRight: 8,
  },
  catChipActive: { backgroundColor: "#4285F4" },
  catText: { color: "#aaa", fontSize: 13 },
  catTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardSub: { color: "#888", fontSize: 13, marginTop: 2 },
  arrow: { color: "#555", fontSize: 24 },
  empty: { color: "#555", textAlign: "center", marginTop: 60, fontSize: 16 },
});
