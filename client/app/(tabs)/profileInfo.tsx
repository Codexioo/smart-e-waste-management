import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import styles from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { getToken } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

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
            alert("Unauthorized. Please login again.");
            router.replace("/(auth)");
            return;
          }

          const response = await axios.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(response.data);
        } catch (error) {
          console.error("Profile load error:", error);
          alert("Failed to load profile.");
        } finally {
          setIsProfileLoading(false);
        }
      };

      fetchProfile();
    }, [])
  );

  if (isProfileLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
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
  const currentLevel = levels.findIndex((lvl) => lvl.min === currentMin) + 1;
  const nextLevel = currentLevel + 1;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        {user?.profile_image ? (
          <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle" size={120} color="#ccc" />
        )}
        <Text style={styles.username}>Hi, {user?.username}</Text>
        <Text style={styles.joinDate}>
          Joined {user?.create_date || "-"}
        </Text>
      </View>

      {/* <View style={styles.quoteBox}>
        <Text style={styles.quoteText}>
          'Pollution is nothing but the resources we are not harvesting. We allow them to be
          dispersed because we’ve been ignorant of their value.' – R. Buckminster Fuller
        </Text>
      </View> */}
      <View style={styles.labelRow}>
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{user?.total_reward_points ?? 0}</Text>
    <Text style={styles.statLabel}>Total Reward Points</Text>
  </View>
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{user?.cumulative_reward_points ?? 0}</Text>
    <Text style={styles.statLabel}>Cumulative Points</Text>
  </View>
</View>
      <View style={styles.levelBarBox}>
        <View style={styles.labelRow}>
          <Text style={styles.levelBarText}>{user?.level}</Text>
          <Text style={styles.levelBarText}>
            {points - currentMin}/{nextMin - currentMin}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progressPercent}%`, backgroundColor: "#fff" }]} />
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.levelBarText}>LV {currentLevel}</Text>
          <Text style={styles.levelBarText}>LV {nextLevel}</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        {[
          { label: "Email", value: user?.email },
          { label: "Phone", value: user?.telephone },
          { label: "Address", value: user?.address },
          { label: "Joined", value: `${user?.create_date} at ${user?.create_time}` },
        ].map((item, index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value || "-"}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
