import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import axios from "@/api/axiosInstance";
import { getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { useBottomNavPadding } from "@/components/bottombar";

interface EarningEntry {
  transaction_id: number;
  points: number;
  source: string;
  transaction_type: string;
  transaction_date: string;
  request_code?: string;
}

export default function CollectorEarningsHistory() {
  useProtectedRoute();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [history, setHistory] = useState<EarningEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const user = await getUser();
          if (!user) return;
          const response = await axios.get(`/collector-earnings/${user.id}`);
          setHistory(response.data.data ?? []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy · h:mm a");
    } catch {
      return dateStr;
    }
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
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Earnings History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.transaction_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Feather
                  name={item.source?.toLowerCase().includes("bonus") ? "gift" : "package"}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.cardTitle}>
                  {item.request_code ? `Pickup ${item.request_code}` : item.source || "Earning"}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.transaction_date)}</Text>
              </View>
            </View>
            <Text style={styles.points}>+{item.points} pts</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="dollar-sign" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No earnings yet</Text>
            <Text style={styles.emptyText}>Complete pickups to start earning points.</Text>
          </View>
        }
        contentContainerStyle={
          history.length === 0
            ? [styles.emptyList, { paddingBottom: bottomPadding }]
            : { paddingBottom: bottomPadding }
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingHorizontal: 20,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { marginBottom: 12, padding: 8, alignSelf: "flex-start" },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  cardDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  points: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyList: { flexGrow: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginTop: 16 },
  emptyText: { color: COLORS.textSecondary, marginTop: 8 },
});
