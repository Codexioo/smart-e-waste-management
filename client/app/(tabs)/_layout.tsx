import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Tabs, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomBar, { useBottomNavPadding } from "@/components/bottombar";

export default function TabLayout() {
  const router = useRouter();
  const bottomPadding = useBottomNavPadding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await AsyncStorage.getItem("role");
      if (role === "collector") {
        router.replace("/(auth)/collectordashboard");
        return;
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
      tabBar={(props) => <BottomBar tabProps={props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { paddingBottom: bottomPadding },
      }}
    >
      <Tabs.Screen name="userdashboard" />
      <Tabs.Screen name="profileInfo" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
