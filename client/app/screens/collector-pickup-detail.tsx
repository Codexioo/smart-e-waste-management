import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import axios from "@/api/axiosInstance";
import { getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { PickupRequest, getPickupDisplayStatus } from "@/utils/collector";
import { useBottomNavPadding } from "@/components/bottombar";

const DEFAULT_REGION = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const STEPS = ["Assigned", "Collected", "Completed"];

export default function CollectorPickupDetail() {
  useProtectedRoute();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [pickup, setPickup] = useState<PickupRequest | null>(null);
  const [collectorId, setCollectorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [wasteWeight, setWasteWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const loadPickup = async () => {
    try {
      const user = await getUser();
      if (!user || !id) return;
      setCollectorId(user.id);
      const response = await axios.get(`/collector-requests/${user.id}/${id}`);
      const data = response.data.data;
      setPickup(data);
      if (data.waste_weight) setWasteWeight(String(data.waste_weight));
    } catch (error) {
      console.error("Failed to load pickup:", error);
      Alert.alert("Error", "Could not load pickup details.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPickup();
    }, [id])
  );

  const currentStep = () => {
    if (!pickup) return 0;
    if (pickup.status === "completed") return 2;
    if (pickup.collected_at || pickup.waste_weight) return 1;
    if (pickup.started_at) return 1;
    return 0;
  };

  const handleCall = () => {
    if (!pickup?.customer_telephone) return;
    Linking.openURL(`tel:${pickup.customer_telephone.replace(/\s/g, "")}`);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleStartPickup = async () => {
    if (!collectorId || !pickup) return;
    try {
      setSubmitting(true);
      await axios.put(`/collector-requests/${pickup.id}/start`, { collectorId });
      await loadPickup();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to start pickup.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCollected = async () => {
    if (!collectorId || !pickup) return;
    const weight = parseFloat(wasteWeight);
    if (!wasteWeight.trim() || Number.isNaN(weight) || weight <= 0) {
      Alert.alert("Required", "Please enter collected waste weight in kg.");
      return;
    }

    Alert.alert(
      "Mark as Collected",
      `Confirm ${weight} kg collected? You earn ${Math.floor(weight * 10)} pts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setSubmitting(true);
              const response = await axios.put(`/collector-requests/${pickup.id}/collect`, {
                collectorId,
                waste_weight: weight,
              });
              Alert.alert(
                "Success",
                `Pickup completed! You earned ${response.data.collectorPoints} pts.`
              );
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "Failed to complete pickup.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!pickup) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Pickup not found</Text>
      </View>
    );
  }

  const step = currentStep();
  const hasLocation = pickup.latitude != null && pickup.longitude != null;
  const isCompleted = pickup.status === "completed";

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Pickup Details</Text>
      <Text style={styles.code}>{pickup.request_code}</Text>
      <Text style={styles.status}>{getPickupDisplayStatus(pickup)}</Text>

      <View style={styles.stepper}>
        {STEPS.map((label, index) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, index <= step && styles.stepDotActive]}>
              {index < step ? (
                <Feather name="check" size={12} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNum}>{index + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, index <= step && styles.stepLabelActive]}>{label}</Text>
            {index < STEPS.length - 1 && <View style={[styles.stepLine, index < step && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.customerName}>{pickup.customer_name}</Text>
        <Text style={styles.detail}>{pickup.address}</Text>
        <Text style={styles.detail}>{pickup.city}, {pickup.district}</Text>
        <Text style={styles.waste}>Waste: {pickup.waste_types}</Text>
      </View>

      <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
        <Feather name="phone" size={20} color={COLORS.white} />
        <View>
          <Text style={styles.callLabel}>Call Customer</Text>
          <Text style={styles.callNumber}>{pickup.customer_telephone || "No phone"}</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Customer Location</Text>
      {hasLocation ? (
        <MapView
          style={styles.map}
          region={{
            latitude: pickup.latitude!,
            longitude: pickup.longitude!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: pickup.latitude!, longitude: pickup.longitude! }}
            title={pickup.customer_name}
            description={pickup.address}
          />
        </MapView>
      ) : (
        <View style={styles.noMap}>
          <Feather name="map-pin" size={32} color={COLORS.border} />
          <Text style={styles.noMapText}>Location not available</Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Pickup Notes</Text>
      <View style={styles.notesBox}>
        <Text style={styles.notesText}>
          {pickup.address ? `Please collect from: ${pickup.address}` : "No additional notes from customer."}
        </Text>
      </View>

      {!isCompleted && !pickup.started_at && (
        <TouchableOpacity
          style={[styles.collectBtn, submitting && { opacity: 0.6 }]}
          onPress={handleStartPickup}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.collectBtnText}>Start Pickup</Text>
          )}
        </TouchableOpacity>
      )}

      {!isCompleted && pickup.started_at && (
        <View style={styles.updateSection}>
          <Text style={styles.sectionLabel}>Update Status</Text>
          <Text style={styles.weightLabel}>Collected items (kg)</Text>
          <View style={styles.weightStepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => {
                const v = Math.max(0, (parseFloat(wasteWeight) || 0) - 0.5);
                setWasteWeight(v > 0 ? String(v) : "");
              }}
            >
              <Feather name="minus" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TextInput
              style={styles.weightInput}
              value={wasteWeight}
              onChangeText={setWasteWeight}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setWasteWeight(String((parseFloat(wasteWeight) || 0) + 0.5))}
            >
              <Feather name="plus" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.photoLabel}>Photos (Optional)</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
            <Feather name="camera" size={20} color={COLORS.primary} />
            <Text style={styles.photoBtnText}>{photoUri ? "Photo added" : "Add Photo"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.collectBtn, submitting && { opacity: 0.6 }]}
            onPress={handleMarkCollected}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.collectBtnText}>Mark as Collected</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedBox}>
          <Feather name="check-circle" size={24} color={COLORS.primary} />
          <Text style={styles.completedText}>
            Completed — {pickup.waste_weight ?? "—"} kg collected
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: Platform.OS === "ios" ? 56 : 36, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: COLORS.error, fontWeight: "600" },
  backBtn: { marginBottom: 12, alignSelf: "flex-start", padding: 8 },
  title: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  code: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary, marginTop: 4 },
  status: { fontSize: 13, color: COLORS.primary, fontWeight: "700", marginTop: 4, marginBottom: 20 },
  stepper: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepNum: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600", textAlign: "center" },
  stepLabelActive: { color: COLORS.primary },
  stepLine: {
    position: "absolute",
    top: 14,
    left: "60%",
    right: "-40%",
    height: 2,
    backgroundColor: COLORS.border,
    zIndex: -1,
  },
  stepLineActive: { backgroundColor: COLORS.primary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customerName: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  detail: { color: COLORS.textSecondary, marginTop: 4, fontSize: 14 },
  waste: { color: COLORS.primary, fontWeight: "600", marginTop: 10 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },
  callLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  callNumber: { color: COLORS.white, fontSize: 17, fontWeight: "700" },
  sectionLabel: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 10 },
  map: { width: "100%", height: 200, borderRadius: 20, marginBottom: 20 },
  noMap: {
    height: 160,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  noMapText: { color: COLORS.textMuted, marginTop: 8 },
  notesBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesText: { color: COLORS.textSecondary, lineHeight: 22 },
  updateSection: { marginTop: 8 },
  weightLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 10 },
  weightStepper: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
  },
  photoLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    marginBottom: 20,
  },
  photoBtnText: { color: COLORS.primary, fontWeight: "600" },
  collectBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  collectBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.primary + "15",
    padding: 16,
    borderRadius: 16,
  },
  completedText: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
});
