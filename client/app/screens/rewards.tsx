import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../styles/rewardsStyles";
import RewardHistoryItem from "../../components/RewardHistoryItem";
import { getRewards } from "../../services/rewardsService";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import BottomBar from "../../components/bottombar";

type Reward = {
  transaction_type: "credit" | "redeem";
  points: number;
  transaction_date: string;
};

export default function RewardScreen() {
  const [rewards, setRewards] = useState<{
    totalPoints: number;
    cumulativePoints: number;
    level: number;
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
      setLoading(true);
      fetchRewards();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
          `<tr><td>${formatDate(item.transaction_date)}</td><td>+${item.points}</td></tr>`
      )
      .join("");

    const redeemRows = rewards.history
      .filter((item) => item.transaction_type === "redeem")
      .map(
        (item) =>
          `<tr><td>${formatDate(item.transaction_date)}</td><td>-${item.points}</td></tr>`
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 16px;">
          <h2>Smart E-Waste – Reward History</h2>
          <p><strong>Total Available Points:</strong> ${rewards.totalPoints}</p>
          <p><strong>Level:</strong> ${rewards.level}</p>
          <p><strong>Cumulative Points:</strong> ${rewards.cumulativePoints}</p>

          <h3>Credited</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%; margin-bottom: 24px;">
            <tr><th>Date</th><th>Points</th></tr>
            ${creditRows || `<tr><td colspan="2">No credited rewards</td></tr>`}
          </table>

          <h3>Redeemed</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%;">
            <tr><th>Date</th><th>Points</th></tr>
            ${redeemRows || `<tr><td colspan="2">No redeemed rewards</td></tr>`}
          </table>
        </body>
      </html>
    `;

    try {
      const result = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        return alert("Sharing is not available on this device");
      }
      await Sharing.shareAsync(result.uri);
    } catch {
      alert("Failed to export PDF");
    }
  };

  const renderItem = ({ item }: { item: Reward }) => (
    <RewardHistoryItem
      date={formatDate(item.transaction_date)}
      points={item.points}
      type={item.transaction_type}
    />
  );

  const filteredData =
    rewards?.history.filter((item) => item.transaction_type === selectedTab) || [];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reward Dashboard</Text>
        <Text style={styles.totalPoints}>Total Available Points: {rewards?.totalPoints}</Text>
        <Text style={styles.totalPoints}>
          Level: {rewards?.level ?? "-"} | Cumulative Points: {rewards?.cumulativePoints ?? "-"}
        </Text>

        <View style={styles.tabBarAlt}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "credit" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("credit")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "credit" && styles.activeTabText,
              ]}
            >
              Credited
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "redeem" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("redeem")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "redeem" && styles.activeTabText,
              ]}
            >
              Redeemed
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
          <Text style={styles.exportText}>Export as PDF</Text>
        </TouchableOpacity>

        {filteredData.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No {selectedTab} history found.
          </Text>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
      <BottomBar />
    </SafeAreaView>
  );
}
