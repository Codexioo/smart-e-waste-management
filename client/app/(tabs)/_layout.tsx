import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform  } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserRole(user.role); // "customer" or "waste_collector"
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
    tabBarShowLabel: false,
    headerShown: false,
    tabBarActiveTintColor: "#00A52C",
    tabBarInactiveTintColor: "gray",
    tabBarStyle: {
      backgroundColor: "black",
      borderTopWidth: 0,
      position: "absolute",
      elevation: 0,
      height: 60, // Increase height to make room for safe area
      paddingBottom: Platform.OS === 'ios' ? 20 : 10, // ✅ This handles iOS safe area
      paddingTop: 8,  
        },
      }}
    >
      <Tabs.Screen
        name={
          userRole === "waste_collector"
            ? "wastecollectordashboard"
            : "userdashboard"
        }
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profileInfo"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
