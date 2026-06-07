import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getUser, getToken } from "@/utils/storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import COLORS from "@/constants/colors";
import BottomBar, { useBottomNavPadding } from "@/components/bottombar";
import { useFocusEffect } from "@react-navigation/native";

interface PickupItem {
  id: number;
  city: string;
  district: string;
  address: string;
  create_date?: string;
  status: string;
}

export default function UserDashboard() {
  useProtectedRoute();

  const [searchTerm, setSearchTerm] = useState("");
  const [pickupHistory, setPickupHistory] = useState<PickupItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();

  const fetchData = async () => {
    try {
      const userData = await getUser();
      if (!userData) return;
      setUser(userData);
      const response = await axios.get(`/user-requests/${userData.id}`);
      setPickupHistory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDownloadReport = async () => {
    try {
      const token = await getToken();
      if (Platform.OS === "web") {
        const response = await fetch(`${axios.defaults.baseURL}/reward-summary`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "reward-summary.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await axios.get("/reward-summary-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const { user: userData, rewardHistory, pickupHistory: pHistory } = response.data;
  
        const rewardRows = rewardHistory.length > 0
          ? rewardHistory.map((item: any) =>
              `<tr><td>${item.transaction_date}</td><td>${item.transaction_type}</td><td>${item.points}</td></tr>`
            ).join("")
          : "<tr><td colspan='3'>No rewarding points</td></tr>";

        const pickupRows = pHistory.length > 0
          ? pHistory.map((item: any) =>
              `<tr><td>${item.collection_date}</td><td>${item.waste_type}</td><td>${item.waste_weight} kg</td></tr>`
            ).join("")
          : "<tr><td colspan='3'>No pickup records</td></tr>";

        const html = `
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h2>Smart E-Waste – Reward Summary</h2>
              <p><strong>Name:</strong> ${userData.username}</p>
              <p><strong>Total Reward Points:</strong> ${userData.total_reward_points}</p>
              <h3>Reward History</h3>
              <table border="1" cellspacing="0" cellpadding="8" style="width:100%;">
                <tr><th>Date</th><th>Transaction Type</th><th>Points</th></tr>
                ${rewardRows}
              </table>
              <h3 style="margin-top:24px;">Pickup History</h3>
              <table border="1" cellspacing="0" cellpadding="8" style="width:100%;">
                <tr><th>Date</th><th>Waste Type</th><th>Weight</th></tr>
                ${pickupRows}
              </table>
            </body>
          </html>
        `;
  
        const result = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri);
        } else {
          Alert.alert("✅ PDF Generated", `Path: ${result.uri}`);
        }
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("❌ Error generating the report.");
    }
  };

  const filteredHistory = pickupHistory.filter((item) =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }: { item: PickupItem }) => (
    <View style={styles.listCard}>
      <View style={styles.listHeader}>
        <View style={styles.dateContainer}>
          <Feather name="calendar" size={12} color={COLORS.textSecondary} />
          <Text style={styles.listDate}>{item.create_date?.split("T")[0]}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.listLocation}>{item.city}, {item.district}</Text>
      <Text style={styles.listAddress} numberOfLines={1}>{item.address}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <Ionicons name="leaf" size={24} color={COLORS.white} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.greeting}>Welcome Back 👋</Text>
                <Text style={styles.username}>{user?.username || "Eco Hero"}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/profileInfo")}>
                <Image 
                  source={require("../../assets/images/user.png")} 
                  style={styles.profilePic} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rewardCard}>
              <View>
                <Text style={styles.cardTitle}>Reward Balance</Text>
                <Text style={styles.points}>{user?.total_reward_points || 0}</Text>
                <Text style={styles.pointsLabel}>Points Earned</Text>
              </View>
              <TouchableOpacity style={styles.downloadIconBtn} onPress={handleDownloadReport}>
                <Feather name="download" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => router.push("/screens/request")}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name="plus" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Request Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.storeButton}
                onPress={() => router.push("../screens/shop")}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: COLORS.secondary + "20" }]}>
                  <Feather name="shopping-bag" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.actionText}>Visit Store</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pickup History</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                placeholder="Search by city..."
                style={styles.searchBar}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.empty}>No pickup history found.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending": return "#F59E0B";
    case "accepted": return "#3B82F6";
    case "assigned": return "#8B5CF6";
    case "completed": return "#22C55E";
    case "rejected": return "#EF4444";
    default: return "#64748B";
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40 
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: { 
    fontSize: 16, 
    color: COLORS.textSecondary,
    fontWeight: "500"
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rewardCard: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  points: { fontSize: 36, fontWeight: "800", color: COLORS.white },
  pointsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "500" },
  downloadIconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  requestButton: {
    backgroundColor: COLORS.white,
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  storeButton: {
    backgroundColor: COLORS.white,
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: COLORS.primary + "20",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionText: { 
    color: COLORS.textPrimary, 
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: COLORS.textPrimary,
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  listCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listDate: { 
    fontSize: 12, 
    color: COLORS.textSecondary,
    fontWeight: "500" 
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  status: { 
    fontSize: 11, 
    fontWeight: "700", 
    textTransform: "uppercase" 
  },
  listLocation: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: COLORS.textPrimary,
    marginBottom: 4 
  },
  listAddress: { 
    fontSize: 13, 
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  empty: { 
    textAlign: "center", 
    color: COLORS.textMuted, 
    marginTop: 12,
    fontSize: 14,
  },
});
