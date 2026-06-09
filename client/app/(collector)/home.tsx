import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import axios from "@/api/axiosInstance";
import { getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { CollectorStats } from "@/utils/collector";
import { useBottomNavPadding } from "@/components/bottombar";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CollectorHome() {
  useProtectedRoute();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [online, setOnline] = useState(true);

  const loadStats = async () => {
    try {
      const user = await getUser();
      if (!user) return;
      const response = await axios.get(`/collector-stats/${user.id}`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to load collector stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const weeklyData = buildWeeklyChart(stats?.weekly_earnings ?? []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const name = stats?.user?.username ?? "Collector";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} tintColor={COLORS.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.greeting}>Hello, {name}</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: online ? COLORS.primary : COLORS.textMuted }]} />
              <Text style={styles.onlineText}>{online ? "Online" : "Offline"}</Text>
            </View>
          </View>
        </View>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ false: COLORS.border, true: COLORS.primary + "60" }}
          thumbColor={online ? COLORS.primary : COLORS.textMuted}
        />
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.cardTitle}>Earnings</Text>
        <View style={styles.earningsRow}>
          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>Today</Text>
            <Text style={styles.earningsValue}>{stats?.today_earnings ?? 0} pts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earningsItem}>
            <Text style={styles.earningsLabel}>This Week</Text>
            <Text style={styles.earningsValue}>{stats?.week_earnings ?? 0} pts</Text>
          </View>
        </View>
        <View style={styles.miniChart}>
          {weeklyData.map((d) => (
            <View key={d.label} style={styles.barCol}>
              <View style={[styles.bar, { height: Math.max(8, d.height) }]} />
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/screens/collector-earnings")}>
          <Text style={styles.linkText}>View Earnings Overview</Text>
          <Feather name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Active Pickups</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <Feather name="inbox" size={22} color="#D97706" />
          <Text style={styles.statValue}>{stats?.assigned_count ?? 0}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
          <Feather name="truck" size={22} color="#2563EB" />
          <Text style={styles.statValue}>{stats?.in_progress_count ?? 0}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lifetime Stats</Text>
      <View style={styles.lifetimeCard}>
        <View style={styles.lifetimeRow}>
          <View style={styles.lifetimeItem}>
            <Text style={styles.lifetimeValue}>{stats?.completed_count ?? 0}</Text>
            <Text style={styles.lifetimeLabel}>Completed Tasks</Text>
          </View>
          <View style={styles.lifetimeItem}>
            <Text style={[styles.lifetimeValue, { color: COLORS.primary }]}>{stats?.total_earnings ?? 0}</Text>
            <Text style={styles.lifetimeLabel}>Total Earnings (pts)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/screens/collector-performance")}>
          <Text style={styles.linkText}>View Performance</Text>
          <Feather name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function buildWeeklyChart(weekly: { day: string; points: number }[]) {
  const max = Math.max(...weekly.map((w) => w.points), 1);
  const today = new Date();
  const days: { label: string; height: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const entry = weekly.find((w) => w.day === iso);
    const points = entry?.points ?? 0;
    days.push({
      label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      height: (points / max) * 60,
    });
  }
  return days;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  earningsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 16 },
  earningsRow: { flexDirection: "row", marginBottom: 20 },
  earningsItem: { flex: 1, alignItems: "center" },
  earningsLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  earningsValue: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  divider: { width: 1, backgroundColor: COLORS.border },
  miniChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80, marginBottom: 12 },
  barCol: { alignItems: "center", flex: 1 },
  bar: { width: 12, backgroundColor: COLORS.primary, borderRadius: 6, marginBottom: 6 },
  barLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 12 },
  linkText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 12 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  statValue: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  lifetimeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lifetimeRow: { flexDirection: "row", marginBottom: 8 },
  lifetimeItem: { flex: 1, alignItems: "center" },
  lifetimeValue: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  lifetimeLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: "center" },
});
