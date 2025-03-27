import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import styles from "../../styles/dashboard.styles";
import { useRouter } from "expo-router";
import useProtectedRoute from "@/hooks/useProtectedRoute";

export default function UserDashboard() {
  useProtectedRoute();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Reward Points Card */}
      <View style={styles.rewardCard}>
        <Text style={styles.cardTitle}>Rewarding Points</Text>
        <Text style={styles.rewardAmount}>$45,678.90</Text>
        <Text style={styles.rewardGrowth}>+20% month over month</Text>

        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.storeText}>
              + Download reward summary report
            </Text>
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
          placeholder="Search"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* FlatList with no data for now */}
      <FlatList
        data={[]} // 🔄 will be replaced with real pickup history
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Feather name="database" size={24} color="#00A52C" />
              <View style={styles.textContainer}>
                <Text style={styles.listTitle}>{}</Text>
                <Text style={styles.listSubtitle}>{}</Text>
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
