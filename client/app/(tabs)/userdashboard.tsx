import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import styles from "../../styles/dashboard.styles";
import { useRouter } from "expo-router";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../api/axiosInstance"; // ✅ using your centralized axios instance
import * as FileSystem from 'expo-file-system';




export default function UserDashboard() {
  useProtectedRoute();

  const handleDownloadReport = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const url = `${axios.defaults.baseURL}/reward-summary`;
  
      if (Platform.OS === "web") {
        // 🟢 Web download using browser
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "reward-summary.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 📱 Native mobile download (iOS/Android)
        const fileUri = FileSystem.documentDirectory + "reward-summary.pdf";
        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          fileUri,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        const result = await downloadResumable.downloadAsync();
        if (result?.uri) {
          alert(`✅ Report downloaded to:\n${result.uri}`);
        } else {
          alert("⚠️ Failed to download the report.");
        }
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("❌ Error downloading the report.");
    }
  };
  
  

  const [searchTerm, setSearchTerm] = useState("");
  interface PickupHistoryItem {
    city: string;
    district: string;
    address: string;
  }

  const [pickupHistory, setPickupHistory] = useState<PickupHistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPickupHistory = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const response = await axios.get(`/user-requests/${user.id}`);
        setPickupHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching pickup history:", error);
      }
    };

    fetchPickupHistory();
  }, []);

  const filteredHistory = pickupHistory.filter((item) =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Reward Points Card */}
      <View style={styles.rewardCard}>
        <Text style={styles.cardTitle}>Rewarding Points</Text>
        <Text style={styles.rewardAmount}>$45,678.90</Text>
        <Text style={styles.rewardGrowth}>+20% month over month</Text>

        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadReport}>
            <Text style={styles.storeText}>+ Download reward summary report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => router.push("/screens/request")}
        >
          <Text style={styles.requestText}>+ Request E-Waste Pickup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.storeButton}>
          <Text style={styles.storeText}>+ In Store</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup History */}
      <Text style={styles.sectionTitle}>Pickup History</Text>
      <View style={styles.searchBar}>
        <FontAwesome name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search by city"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Feather name="database" size={24} color="#00A52C" />
              <View style={styles.textContainer}>
                <Text style={styles.listTitle}>
                  {item.city}, {item.district}
                </Text>
                <Text style={styles.listSubtitle}>{item.address}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
            No pickup history found.
          </Text>
        }
      />
    </View>
  );
}