import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TabView,
  SceneMap,
  TabBar,
  NavigationState,
  SceneRendererProps,
} from "react-native-tab-view";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../styles/rewardsStyles";
import RewardHistoryItem from "../../components/RewardHistoryItem";
import { getRewards } from "../../services/rewardsService";

type Reward = {
  transaction_type: "credit" | "redeem";
  points: number;
  transaction_date: string;
};

export default function RewardScreen() {
  const layout = useWindowDimensions();

  const [rewards, setRewards] = useState<{
    totalPoints: number;
    history: Reward[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "credit", title: "Credited" },
    { key: "redeem", title: "Redeemed" },
  ]);

  const fetchRewards = async () => {
    try {
      const email = "chamikara38@gmail.com";
      const data = await getRewards(email);
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
          <p><strong>Total Points:</strong> ${rewards.totalPoints}</p>

          <h3>Credited</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%; margin-bottom: 20px;">
            <tr><th>Date</th><th>Points</th></tr>
            ${creditRows}
          </table>

          <h3>Redeemed</h3>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%;">
            <tr><th>Date</th><th>Points</th></tr>
            ${redeemRows}
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

  const CreditHistory = () => (
    <FlatList
      data={rewards?.history.filter((item) => item.transaction_type === "credit")}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <RewardHistoryItem
          date={formatDate(item.transaction_date)}
          points={item.points}
          type="credit"
        />
      )}
    />
  );

  const RedeemHistory = () => (
    <FlatList
      data={rewards?.history.filter((item) => item.transaction_type === "redeem")}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <RewardHistoryItem
          date={formatDate(item.transaction_date)}
          points={item.points}
          type="redeem"
        />
      )}
    />
  );

  const renderScene = SceneMap({
    credit: CreditHistory,
    redeem: RedeemHistory,
  });

  const renderTabBar = (props: SceneRendererProps & {
    navigationState: NavigationState<{ key: string; title: string }>;
  }) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "green" }}
      style={{ backgroundColor: "black", marginBottom: 10 }}
      tabStyle={{ paddingVertical: 6 }}
    />
  );

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
        <Text style={styles.totalPoints}>Total Points: {rewards?.totalPoints}</Text>

        <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
          <Text style={styles.exportText}>Export as PDF</Text>
        </TouchableOpacity>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </SafeAreaView>
  );
}
