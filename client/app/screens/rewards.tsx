import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import RewardHistoryItem from "../../components/RewardHistoryItem";
import { getRewards } from "../../services/rewardsService";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Feather, Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { useRouter } from "expo-router";

type Reward = {
  transaction_type: "credit" | "redeem";
  points: number;
  transaction_date: string;
  source?: string;
};

export default function RewardScreen() {
  const router = useRouter();
  const [rewards, setRewards] = useState<{
    totalPoints: number;
    cumulativePoints: number;
    level: string;
    history: Reward[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"credit" | "redeem">("credit");

  const fetchRewards = async () => {
    try {
      const data = await getRewards();
      if (data.success) {
        setRewards(data);
      } else {
        alert("Failed to load rewards");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRewards();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportPDF = async () => {
    if (!rewards || !rewards.history.length) {
      alert("No reward history to export");
      return;
    }
  
    const creditRows = rewards.history
      .filter((item) => item.transaction_type === "credit")
      .map(
        (item) =>
          `<tr><td>${formatDate(item.transaction_date)}</td><td style="color:green;">+${item.points}</td><td>${item.source || "-"}</td></tr>`
      )
      .join("");
  
    const redeemRows = rewards.history
      .filter((item) => item.transaction_type === "redeem")
      .map(
        (item) =>
          `<tr><td>${formatDate(item.transaction_date)}</td><td style="color:red;">-${item.points}</td><td>${item.source || "-"}</td></tr>`
      )
      .join("");
  
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h2 { text-align: center; margin-bottom: 30px; color: #006400; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            thead { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>♻️ Smart E-Waste – Reward Points Report</h2>
          <h3>Summary</h3>
          <table>
            <tr><td><strong>Total Available Points</strong></td><td>${rewards.totalPoints}</td></tr>
            <tr><td><strong>User Level</strong></td><td>${rewards.level}</td></tr>
            <tr><td><strong>Cumulative Points</strong></td><td>${rewards.cumulativePoints}</td></tr>
          </table>
          <h3 style="color:green;">Credited Transactions</h3>
          <table>
            <thead><tr><th>Date</th><th>Points</th><th>Source</th></tr></thead>
            <tbody>${creditRows || `<tr><td colspan="3">No credited rewards found</td></tr>`}</tbody>
          </table>
          <h3 style="color:red;">Redeemed Transactions</h3>
          <table>
            <thead><tr><th>Date</th><th>Points</th><th>Source</th></tr></thead>
            <tbody>${redeemRows || `<tr><td colspan="3">No redeemed rewards found</td></tr>`}</tbody>
          </table>
        </body>
      </html>
    `;
  
    try {
      const result = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri);
      } else {
        alert("Sharing is not available");
      }
    } catch {
      alert("Failed to export PDF");
    }
  };

  const filteredData = rewards?.history.filter((item) => item.transaction_type === selectedTab) || [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Rewards</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
            <Feather name="download" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Balance</Text>
              <Text style={styles.totalPoints}>{rewards?.totalPoints || 0}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={16} color={COLORS.warning} />
              <Text style={styles.levelText}>{rewards?.level || "Bronze I"}</Text>
            </View>
          </View>
          <View style={styles.summaryBottom}>
            <View style={styles.summaryStat}>
              <Text style={styles.statLabel}>Cumulative Points</Text>
              <Text style={styles.statValue}>{rewards?.cumulativePoints || 0}</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{rewards?.history.length || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "credit" && styles.activeTab]}
            onPress={() => setSelectedTab("credit")}
          >
            <Text style={[styles.tabText, selectedTab === "credit" && styles.activeTabText]}>Credited</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "redeem" && styles.activeTab]}
            onPress={() => setSelectedTab("redeem")}
          >
            <Text style={[styles.tabText, selectedTab === "redeem" && styles.activeTabText]}>Redeemed</Text>
          </TouchableOpacity>
        </View>

        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="list" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No {selectedTab} history found.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <RewardHistoryItem
                date={formatDate(item.transaction_date)}
                points={item.points}
                type={item.transaction_type}
                source={item.source}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary, flex: 1 },
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  totalPoints: { fontSize: 40, fontWeight: "800", color: COLORS.white, marginTop: 4 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  levelText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  summaryBottom: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 20,
    gap: 32,
  },
  summaryStat: {},
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" },
  statValue: { color: COLORS.white, fontSize: 18, fontWeight: "700", marginTop: 2 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBackground,
    padding: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: "700" },
  listContent: { paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 60 },
  emptyText: { marginTop: 16, color: COLORS.textSecondary, fontSize: 15, fontWeight: "500" },
});
