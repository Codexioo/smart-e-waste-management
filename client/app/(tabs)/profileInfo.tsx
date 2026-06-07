import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { getToken } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import COLORS from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type UserProfile = {
  username: string;
  email: string;
  telephone: string;
  address: string;
  profile_image?: string;
  level: string;
  total_reward_points: number;
  cumulative_reward_points: number;
  create_date: string;
  create_time: string;
};

export default function ProfileInfo() {
  useProtectedRoute();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const token = await getToken();
          if (!token) {
            router.replace("/(auth)");
            return;
          }

          const response = await axios.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(response.data);
        } catch (error) {
          console.error("Profile load error:", error);
        } finally {
          setIsProfileLoading(false);
        }
      };

      fetchProfile();
    }, [])
  );

  if (isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const levels = [
    { name: "Bronze I", min: 0 },
    { name: "Bronze II", min: 200 },
    { name: "Silver I", min: 500 },
    { name: "Silver II", min: 1000 },
    { name: "Gold I", min: 1500 },
    { name: "Gold II", min: 2000 },
    { name: "Platinum I", min: 3000 },
    { name: "Platinum II", min: 4000 },
    { name: "Diamond", min: 5000 },
    { name: "Eco Legend", min: 7000 },
  ];

  const points = user?.cumulative_reward_points ?? 0;
  let currentMin = 0;
  let nextMin = 10000;

  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].min) {
      currentMin = levels[i].min;
      nextMin = levels[i + 1]?.min ?? levels[i].min + 1000;
    }
  }

  const progressPercent = Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100);
  const currentLevelIndex = levels.findIndex((lvl) => lvl.min === currentMin);
  const currentLevelNum = currentLevelIndex + 1;
  const nextLevelNum = currentLevelNum + 1;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => router.push("/screens/profile")}>
            <Feather name="edit-3" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.imageWrapper}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={60} color={COLORS.border} />
              </View>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>LV {currentLevelNum}</Text>
            </View>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.total_reward_points ?? 0}</Text>
            <Text style={styles.statLabel}>Current Balance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.cumulative_reward_points ?? 0}</Text>
            <Text style={styles.statLabel}>Lifetime Points</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>{user?.level}</Text>
              <Text style={styles.levelSubtitle}>Progress to next level</Text>
            </View>
            <Ionicons name="trophy" size={24} color={COLORS.warning} />
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{points - currentMin} / {nextMin - currentMin} XP</Text>
              <Text style={styles.progressPercent}>{Math.floor(progressPercent)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.levelFooter}>
              <Text style={styles.levelFooterText}>Level {currentLevelNum}</Text>
              <Text style={styles.levelFooterText}>Level {nextLevelNum}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            {[
              { icon: "phone", label: "Phone", value: user?.telephone },
              { icon: "map-pin", label: "Address", value: user?.address },
              { icon: "calendar", label: "Joined", value: user?.create_date },
            ].map((item, index) => (
              <View key={index} style={[styles.infoRow, index === 2 && styles.noBorder]}>
                <View style={styles.infoIconContainer}>
                  <Feather name={item.icon as any} size={18} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  placeholderImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelBadge: {
    position: "absolute",
    bottom: -5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  levelBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  username: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  levelCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  levelSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressSection: {},
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  levelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelFooterText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
});
