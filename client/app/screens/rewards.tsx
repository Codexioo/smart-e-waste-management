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
  source?: string;
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
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #222;
            }
            h2 {
              text-align: center;
              margin-bottom: 30px;
              color: #006400;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: left;
            }
            thead {
              background-color: #f0f0f0;
            }
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
            <thead>
              <tr><th>Date</th><th>Points</th><th>Source</th></tr>
            </thead>
            <tbody>
              ${creditRows || `<tr><td colspan="3">No credited rewards found</td></tr>`}
            </tbody>
          </table>
  
          <h3 style="color:red;">Redeemed Transactions</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Points</th><th>Source</th></tr>
            </thead>
            <tbody>
              ${redeemRows || `<tr><td colspan="3">No redeemed rewards found</td></tr>`}
            </tbody>
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
