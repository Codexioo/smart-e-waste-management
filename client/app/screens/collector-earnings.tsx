import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import axios from "@/api/axiosInstance";
import { getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { CollectorStats } from "@/utils/collector";
import { useBottomNavPadding } from "@/components/bottombar";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CollectorEarnings() {
  useProtectedRoute();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const user = await getUser();
          if (!user) return;
          const response = await axios.get(`/collector-stats/${user.id}`);
          setStats(response.data.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const weekly = buildWeeklyChart(stats?.weekly_earnings ?? []);
  const maxBar = Math.max(...weekly.map((w) => w.points), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Earnings Overview</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={styles.summaryValue}>{stats?.today_earnings ?? 0}</Text>
          <Text style={styles.summaryUnit}>pts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Week</Text>
          <Text style={styles.summaryValue}>{stats?.week_earnings ?? 0}</Text>
          <Text style={styles.summaryUnit}>pts</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Earnings</Text>
        <View style={styles.chart}>
          {weekly.map((d) => (
            <View key={d.label} style={styles.barCol}>
              <Text style={styles.barPoints}>{d.points > 0 ? d.points : ""}</Text>
              <View style={[styles.bar, { height: Math.max(12, (d.points / maxBar) * 120) }]} />
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalCard}>
        <Feather name="trending-up" size={24} color={COLORS.primary} />
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.totalLabel}>Lifetime Earnings</Text>
          <Text style={styles.totalValue}>{stats?.total_earnings ?? 0} pts</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => router.push("/screens/collector-earnings-history")}
      >
        <Text style={styles.historyBtnText}>View Earnings History</Text>
        <Feather name="chevron-right" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

function buildWeeklyChart(weekly: { day: string; points: number }[]) {
  const today = new Date();
  const days: { label: string; points: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const entry = weekly.find((w) => w.day === iso);
    days.push({
      label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      points: entry?.points ?? 0,
    });
  }
  return days;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: Platform.OS === "ios" ? 56 : 36, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { marginBottom: 12, padding: 8, alignSelf: "flex-start" },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 20 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  summaryValue: { fontSize: 28, fontWeight: "800", color: COLORS.primary, marginTop: 6 },
  summaryUnit: { fontSize: 12, color: COLORS.textMuted },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 20, color: COLORS.textPrimary },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 160 },
  barCol: { alignItems: "center", flex: 1 },
  barPoints: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4, height: 14 },
  bar: { width: 16, backgroundColor: COLORS.primary, borderRadius: 8, marginBottom: 6 },
  barLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600" },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "12",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  totalValue: { fontSize: 24, fontWeight: "800", color: COLORS.primary, marginTop: 4 },
  historyBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
  },
  historyBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
});
