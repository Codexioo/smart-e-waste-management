import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Linking,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import axios from "@/api/axiosInstance";
import { clearStorage, getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import BottomBar, { useBottomNavPadding } from "@/components/bottombar";
import COLORS from "@/constants/colors";

interface AssignedRequest {
  id: number;
  request_code: string;
  customer_name: string;
  customer_email: string;
  customer_telephone: string;
  district: string;
  city: string;
  address: string;
  waste_types: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  create_date?: string;
}

const DEFAULT_REGION = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function CollectorDashboard() {
  useProtectedRoute();

  const router = useRouter();
  const [requests, setRequests] = useState<AssignedRequest[]>([]);
  const [collectorName, setCollectorName] = useState("");
  const [collectorId, setCollectorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssignedRequest | null>(null);
  const [wasteWeight, setWasteWeight] = useState("");
  const [completing, setCompleting] = useState(false);
  const bottomPadding = useBottomNavPadding();

  const closeDetailModal = () => {
    setSelectedRequest(null);
    setWasteWeight("");
  };

  const fetchAssignedRequests = async () => {
    try {
      const user = await getUser();
      if (!user) return;

      setCollectorName(user.username);
      setCollectorId(user.id);

      const response = await axios.get(`/collector-requests/${user.id}`);
      setRequests(response.data.data ?? []);
    } catch (error) {
      console.error("Error fetching assigned requests:", error);
      Alert.alert("Error", "Failed to load assigned pickups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssignedRequests();
    }, [])
  );

  const handleComplete = async (requestId: number) => {
    if (!collectorId) return;

    const weight = parseFloat(wasteWeight);
    if (!wasteWeight.trim() || Number.isNaN(weight) || weight <= 0) {
      Alert.alert("Required", "Please enter the collected waste weight in kg.");
      return;
    }

    Alert.alert(
      "Complete Pickup",
      `Confirm ${weight} kg collected? Customer will receive ${Math.floor(weight * 10)} reward points.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              setCompleting(true);
              const response = await axios.put(`/collector-requests/${requestId}/complete`, {
                collectorId,
                waste_weight: weight,
              });
              Alert.alert(
                "Success",
                `Pickup completed! ${response.data.creditedPoints} points awarded to customer.`
              );
              closeDetailModal();
              fetchAssignedRequests();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Failed to complete pickup."
              );
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert("Error", "Unable to open phone dialer.");
    });
  };

  const handleLogout = async () => {
    try {
      await clearStorage();
      router.replace("/(auth)");
    } catch {
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  const hasLocation = (item: AssignedRequest) =>
    item.latitude != null && item.longitude != null;

  const getMapRegion = (item: AssignedRequest) => {
    if (hasLocation(item)) {
      return {
        latitude: item.latitude!,
        longitude: item.longitude!,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return DEFAULT_REGION;
  };

  const assignedCount = requests.filter((r) => r.status === "Assigned").length;

  const renderItem = ({ item }: { item: AssignedRequest }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => setSelectedRequest(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.requestCode}>{item.request_code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.customerName}>{item.customer_name}</Text>
      <Text style={styles.detail}>
        {item.city}, {item.district}
      </Text>
      <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
      <Text style={styles.wasteTypes}>Waste: {item.waste_types}</Text>

      <View style={styles.tapHint}>
        <Feather name="map-pin" size={14} color={COLORS.secondary} />
        <Text style={styles.tapHintText}>Tap to view map & contact</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={24} color={COLORS.white} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.greeting}>Welcome, {collectorName}</Text>
          <Text style={styles.subtitle}>
            {assignedCount} active pickup{assignedCount !== 1 ? "s" : ""} assigned
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.collectBtn}
        onPress={() => router.push("/screens/driver")}
      >
        <View style={styles.collectIconContainer}>
          <Feather name="truck" size={20} color={COLORS.white} />
        </View>
        <Text style={styles.collectBtnText}>Collect Waste & Award Points</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAssignedRequests();
            }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No assigned pickups yet</Text>
            <Text style={styles.emptyText}>
              Pickups assigned by the admin will appear here.
            </Text>
          </View>
        }
        contentContainerStyle={[
          requests.length === 0 ? styles.emptyList : undefined,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={selectedRequest !== null}
        animationType="slide"
        transparent
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRequest.request_code}</Text>
                  <Pressable onPress={closeDetailModal} style={styles.closeBtn}>
                    <Feather name="x" size={24} color={COLORS.textPrimary} />
                  </Pressable>
                </View>

                <View style={styles.modalCustomerCard}>
                  <Text style={styles.modalCustomer}>{selectedRequest.customer_name}</Text>
                  <Text style={styles.modalDetail}>{selectedRequest.customer_email}</Text>
                  <Text style={styles.modalDetail}>
                    {selectedRequest.address}, {selectedRequest.city}, {selectedRequest.district}
                  </Text>
                  <View style={styles.modalWasteBadge}>
                    <Text style={styles.modalWasteText}>Waste: {selectedRequest.waste_types}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.phoneRow}
                  onPress={() => handleCall(selectedRequest.customer_telephone)}
                >
                  <View style={styles.phoneIconContainer}>
                    <Feather name="phone" size={20} color={COLORS.white} />
                  </View>
                  <View>
                    <Text style={styles.phoneLabel}>Call Customer</Text>
                    <Text style={styles.phoneText}>
                      {selectedRequest.customer_telephone || "No phone number"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.mapLabel}>Customer Location</Text>
                {hasLocation(selectedRequest) ? (
                  <MapView style={styles.map} region={getMapRegion(selectedRequest)}>
                    <Marker
                      coordinate={{
                        latitude: selectedRequest.latitude!,
                        longitude: selectedRequest.longitude!,
                      }}
                      title={selectedRequest.customer_name}
                      description={selectedRequest.address}
                    />
                  </MapView>
                ) : (
                  <View style={styles.noMapBox}>
                    <Feather name="map-pin" size={32} color={COLORS.border} />
                    <Text style={styles.noMapText}>Location not available</Text>
                  </View>
                )}

                {selectedRequest.status === "Assigned" && (
                  <View style={styles.completeSection}>
                    <Text style={styles.weightLabel}>Collected Waste Weight (kg) *</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={wasteWeight}
                      onChangeText={setWasteWeight}
                      placeholder="e.g. 5.5"
                      keyboardType="decimal-pad"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    {wasteWeight ? (
                      <Text style={styles.pointsPreview}>
                        Customer will earn {Math.floor(parseFloat(wasteWeight) * 10) || 0} points
                      </Text>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.completeBtn, completing && styles.completeBtnDisabled]}
                      onPress={() => handleComplete(selectedRequest.id)}
                      disabled={completing}
                    >
                      {completing ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <Text style={styles.completeBtnText}>Mark Completed</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <BottomBar />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
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
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 12,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  collectBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  collectIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  collectBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestCode: {
    fontWeight: "800",
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  status: {
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  detail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  address: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "500",
  },
  wasteTypes: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
    marginTop: 4,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tapHintText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "90%",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  modalCustomerCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalCustomer: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalDetail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  modalWasteBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  modalWasteText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },
  phoneLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  phoneText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  map: {
    width: "100%",
    height: 240,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noMapBox: {
    height: 200,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  noMapText: {
    color: COLORS.textMuted,
    marginTop: 12,
    fontWeight: "600",
  },
  completeSection: {
    marginTop: 8,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  weightLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pointsPreview: {
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 20,
    fontSize: 14,
  },
  completeBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  completeBtnDisabled: {
    opacity: 0.6,
  },
  completeBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyBox: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 22,
    fontSize: 15,
  },
});
