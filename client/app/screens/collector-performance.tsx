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

function getRingBorderColors(rate: number) {
  const active = COLORS.primary;
  const track = COLORS.border;
  return {
    borderTopColor: rate > 0 ? active : track,
    borderRightColor: rate > 25 ? active : track,
    borderBottomColor: rate > 50 ? active : track,
    borderLeftColor: rate > 75 ? active : track,
  };
}

function CompletionGauge({ rate }: { rate: number }) {
  return (
    <View style={styles.gaugeCard}>
      <View style={[styles.gaugeRing, getRingBorderColors(rate)]}>
        <View style={styles.gaugeRingInner}>
          <Text style={styles.gaugeValue}>{rate}%</Text>
        </View>
      </View>
      <Text style={styles.gaugeLabel}>Completion Rate</Text>
    </View>
  );
}

export default function CollectorPerformance() {
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

  const rate = stats?.completion_rate ?? 0;
  const achievements = getAchievements(stats);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Performance</Text>

      <CompletionGauge rate={rate} />

      <View style={styles.statsGrid}>
        <StatBox label="Total Assigned" value={totalAssigned(stats)} icon="inbox" color="#D97706" />
        <StatBox label="Completed" value={stats?.completed_count ?? 0} icon="check-circle" color="#22C55E" />
        <StatBox label="In Progress" value={stats?.in_progress_count ?? 0} icon="truck" color="#2563EB" />
        <StatBox label="Cancelled" value={stats?.cancelled_count ?? 0} icon="x-circle" color="#EF4444" />
      </View>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievements}>
        {achievements.map((a) => (
          <View key={a.title} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
            <View style={[styles.achievementIcon, { backgroundColor: a.color + "20" }]}>
              <Feather name={a.icon} size={22} color={a.unlocked ? a.color : COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.achievementTitle, !a.unlocked && { color: COLORS.textMuted }]}>{a.title}</Text>
              <Text style={styles.achievementDesc}>{a.description}</Text>
            </View>
            {a.unlocked && <Feather name="check" size={18} color={COLORS.primary} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function totalAssigned(stats: CollectorStats | null) {
  if (!stats) return 0;
  return (stats.assigned_count ?? 0) + (stats.in_progress_count ?? 0) + (stats.completed_count ?? 0);
}

function getAchievements(stats: CollectorStats | null) {
  const completed = stats?.completed_count ?? 0;
  const rate = stats?.completion_rate ?? 0;
  return [
    {
      title: "First Pickup",
      description: "Complete your first pickup",
      icon: "star" as const,
      color: "#F59E0B",
      unlocked: completed >= 1,
    },
    {
      title: "Streak Master",
      description: "Complete 5 pickups",
      icon: "zap" as const,
      color: "#8B5CF6",
      unlocked: completed >= 5,
    },
    {
      title: "Top Performer",
      description: "Maintain 80%+ completion rate",
      icon: "award" as const,
      color: "#22C55E",
      unlocked: rate >= 80 && completed >= 3,
    },
    {
      title: "Eco Champion",
      description: "Complete 20 pickups",
      icon: "globe" as const,
      color: "#0EA5E9",
      unlocked: completed >= 20,
    },
  ];
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: Platform.OS === "ios" ? 56 : 36, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { marginBottom: 8, padding: 8, alignSelf: "flex-start" },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 24 },
  gaugeCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeRing: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gaugeRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeValue: { fontSize: 36, fontWeight: "800", color: COLORS.primary },
  gaugeLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statBox: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  statValue: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 12 },
  achievements: { gap: 12 },
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  achievementLocked: { opacity: 0.6 },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  achievementDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
