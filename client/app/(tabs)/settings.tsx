import React from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { clearStorage } from "@/utils/storage";
import COLORS from "@/constants/colors";

const SETTINGS = [
  { id: 'account', icon: "user", label: "Account Details", route: "screens/profile", color: COLORS.primary },
  { id: 'shop', icon: "shopping-bag", label: "Eco Store", route: "screens/shop", color: COLORS.secondary },
  { id: 'orders', icon: "package", label: "My Orders", route: "screens/orders", color: "#8B5CF6" },
  { id: 'rewards', icon: "gift", label: "Reward History", route: "screens/rewards", color: COLORS.warning },
  { id: 'driver', icon: "truck", label: "Collector Mode", route: "screens/driver", color: "#06B6D4" },
  { id: 'logout', icon: "log-out", label: "Sign Out", route: "logout", color: COLORS.error },
];

const SettingsScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
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
        style={styles.settingItem}
        onPress={() => {
          if (isLogout) {
            handleLogout();
          } else if (item.route) {
            router.push(item.route as any);
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
          <Feather name={item.icon} size={20} color={item.color} />
        </View>
        
        <Text style={[styles.label, isLogout && { color: COLORS.error }]}>
          {item.label}
        </Text>

        {!isLogout && (
          <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
        </View>

        <View style={styles.card}>
          <FlatList
            data={SETTINGS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 Smart E-Waste Management</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  listContent: {},
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 72,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 32,
    alignItems: "center",
  },
  versionText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});

export default SettingsScreen;
