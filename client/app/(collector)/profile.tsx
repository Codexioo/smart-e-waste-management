import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import axios from "@/api/axiosInstance";
import { clearStorage, getUser } from "@/utils/storage";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import COLORS from "@/constants/colors";
import { CollectorStats } from "@/utils/collector";
import { useBottomNavPadding } from "@/components/bottombar";

type MenuItem = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  route?: string;
  action?: () => void;
  danger?: boolean;
};

export default function CollectorProfile() {
  useProtectedRoute();
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const user = await getUser();
      if (!user) return;
      const response = await axios.get(`/collector-stats/${user.id}`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearStorage();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    { icon: "user", label: "Personal Information", route: "/screens/profile" },
    { icon: "dollar-sign", label: "Earnings & History", route: "/screens/collector-earnings-history" },
    { icon: "lock", label: "Change Password", route: "/(tabs)/settings" },
    { icon: "settings", label: "App Settings", route: "/(tabs)/settings" },
    { icon: "bar-chart-2", label: "Performance", route: "/screens/collector-performance" },
    { icon: "help-circle", label: "Help & Support" },
    { icon: "info", label: "About Us" },
    { icon: "log-out", label: "Logout", action: handleLogout, danger: true },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const user = stats?.user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.levelBadge}>
          <Feather name="award" size={14} color={COLORS.primary} />
          <Text style={styles.levelText}>{user?.level ?? "Collector"}</Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsValue}>{user?.total_reward_points ?? 0}</Text>
          <Text style={styles.pointsLabel}>Points Balance</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.action) item.action();
              else if (item.route) router.push(item.route as any);
            }}
          >
            <View style={[styles.menuIcon, item.danger && { backgroundColor: COLORS.error + "15" }]}>
              <Feather name={item.icon} size={20} color={item.danger ? COLORS.error : COLORS.primary} />
            </View>
            <Text style={[styles.menuLabel, item.danger && { color: COLORS.error }]}>{item.label}</Text>
            {!item.danger && <Feather name="chevron-right" size={20} color={COLORS.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: Platform.OS === "ios" ? 60 : 40, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 20 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  levelText: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
  pointsBox: { marginTop: 20, alignItems: "center" },
  pointsValue: { fontSize: 32, fontWeight: "800", color: COLORS.primary },
  pointsLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  version: { textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 24 },
});
