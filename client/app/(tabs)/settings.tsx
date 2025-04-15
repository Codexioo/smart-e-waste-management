import React from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../../styles/settingsStyles";
import { clearStorage } from "@/utils/storage";

const SETTINGS = [
  { icon: "user", label: "Account", route: "screens/profile" },
  { icon: "shopping-cart", label: "Shop", route: "screens/shop" },
  { icon: "book-open", label: "Order History", route: "screens/orders" },
  { icon: "file", label: "Reward History", route: "screens/rewards" },
  { icon: "truck", label: "Collect Waste", route: "screens/driver" },
  { icon: "info", label: "About", route: null }, 
  { icon: "log-out", label: "Log out", route: "logout" },
];

const SettingsScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
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

  const renderItem = ({ item }: any) => {
    const isLogout = item.route === "logout";

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          if (isLogout) {
            handleLogout();
          } else if (item.route) {
            router.push(item.route);
          }
        }}
      >
        <View style={styles.rowLeft}>
          <Feather
            name={item.icon}
            size={20}
            color={isLogout ? "#f33" : "#222"}
            style={styles.icon}
          />
          <Text style={[styles.label, isLogout && { color: "#f33" }]}>
            {item.label}
          </Text>
        </View>
        {!isLogout && <Feather name="chevron-right" size={20} color="#999" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <FlatList
        data={SETTINGS}
        renderItem={renderItem}
        keyExtractor={(item) => item.label}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
