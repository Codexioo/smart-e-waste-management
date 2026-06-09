import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import axios from "@/api/axiosInstance";
import { getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { useBottomNavPadding } from "@/components/bottombar";
import {
  PickupRequest,
  PickupFilter,
  filterPickups,
  getPickupDisplayStatus,
  getStatusColor,
  formatWasteTypes,
} from "@/utils/collector";

const TABS: { key: PickupFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export default function CollectorPickups() {
  useProtectedRoute();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [filter, setFilter] = useState<PickupFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collectorId, setCollectorId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const user = await getUser();
      if (!user) return;
      setCollectorId(user.id);
      const response = await axios.get(`/collector-requests/${user.id}`);
      setRequests(response.data.data ?? []);
    } catch (error) {
      console.error("Error fetching pickups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const handleStartPickup = async (item: PickupRequest) => {
    if (!collectorId) return;
    if (item.started_at) {
      router.push({ pathname: "/screens/collector-pickup-detail", params: { id: String(item.id) } });
      return;
    }
    try {
      await axios.put(`/collector-requests/${item.id}/start`, { collectorId });
      router.push({ pathname: "/screens/collector-pickup-detail", params: { id: String(item.id) } });
    } catch (error: any) {
      console.error("Start pickup failed:", error);
    }
  };

  const filtered = filterPickups(requests, filter);

  const renderItem = ({ item }: { item: PickupRequest }) => {
    const displayStatus = getPickupDisplayStatus(item);
    const statusColor = getStatusColor(displayStatus);
    const wasteTags = formatWasteTypes(item.waste_types);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.requestCode}>{item.request_code}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{displayStatus}</Text>
          </View>
        </View>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{item.city}, {item.district}</Text>
        </View>
        <View style={styles.tagsRow}>
          {wasteTags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        {item.status !== "completed" ? (
          <TouchableOpacity style={styles.startBtn} onPress={() => handleStartPickup(item)}>
            <Text style={styles.startBtnText}>
              {item.started_at ? "Continue Pickup" : "Start Pickup"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push({ pathname: "/screens/collector-pickup-detail", params: { id: String(item.id) } })}
          >
            <Text style={styles.viewBtnText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assigned Pickups</Text>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No pickups found</Text>
            <Text style={styles.emptyText}>Assigned pickups will appear here.</Text>
          </View>
        }
        contentContainerStyle={
          filtered.length === 0
            ? [styles.emptyList, { paddingBottom: bottomPadding }]
            : { paddingBottom: bottomPadding }
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 16 },
  tabs: { flexDirection: "row", backgroundColor: COLORS.inputBackground, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.white, shadowColor: COLORS.black, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  requestCode: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  customerName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  locationText: { color: COLORS.textSecondary, fontSize: 14 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  tag: { backgroundColor: COLORS.primary + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: COLORS.primary, fontSize: 12, fontWeight: "600" },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  startBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  viewBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  viewBtnText: { color: COLORS.textSecondary, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyList: { flexGrow: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { color: COLORS.textSecondary, marginTop: 8, textAlign: "center" },
});
