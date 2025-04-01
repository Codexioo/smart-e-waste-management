import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../api/axiosInstance";
import { Feather } from "@expo/vector-icons";
import useProtectedRoute from "@/hooks/useProtectedRoute";

export default function UserDashboard() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  interface PickupItem {
    city: string;
    district: string;
    address: string;
    create_date?: string;
    status: string;
  }

  const [pickupHistory, setPickupHistory] = useState<PickupItem[]>([]);
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

  const renderItem = ({ item }: { item: PickupItem }) => (
    <View style={styles.listCard}>
      <View style={styles.listHeader}>
        <Text style={styles.listDate}>{item.create_date?.split("T")[0]}</Text>
        <Text
          style={[styles.status, { color: getStatusColor(item.status) }]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <Text style={styles.listLocation}>
        {item.city}, {item.district}
      </Text>
      <Text style={styles.listAddress}>{item.address}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Welcome Back 👋</Text>

            {/* Rewards */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reward Points</Text>
              <Text style={styles.points}>45,678</Text>
              <Text style={styles.growth}>+20% this month</Text>
              <TouchableOpacity style={styles.reportBtn}>
                <Text style={styles.reportText}>Download Summary</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => router.push("/screens/request")}
              >
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.actionText}>Request Pickup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.storeButton}>
                <Feather name="shopping-bag" size={18} color="#fff" />
                <Text style={styles.actionText}>Store</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              placeholder="Search by city"
              style={styles.searchBar}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No pickup history found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "orange";
    case "accepted":
      return "blue";
    case "completed":
      return "green";
    case "rejected":
      return "red";
    default:
      return "gray";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  points: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  growth: {
    color: "#e0ffe0",
    marginTop: 5,
  },
  reportBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  reportText: {
    color: "#fff",
    textDecorationLine: "underline",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
  },
  storeButton: {
    backgroundColor: "#4285F4",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  listCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  listDate: {
    fontWeight: "600",
    color: "#333",
  },
  status: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  listLocation: {
    color: "#444",
    marginBottom: 3,
  },
  listAddress: {
    color: "#666",
  },
  empty: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});