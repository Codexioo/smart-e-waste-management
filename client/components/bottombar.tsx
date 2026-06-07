import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import COLORS from "@/constants/colors";

export const BOTTOM_NAV_HEIGHT = 60;

type TabItem = {
  key: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  match: string[];
};

const CUSTOMER_TABS: TabItem[] = [
  {
    key: "home",
    route: "/(tabs)/userdashboard",
    icon: "home",
    match: ["userdashboard", "shop", "cart", "orders", "rewards", "request", "thankyou"],
  },
  {
    key: "profile",
    route: "/(tabs)/profileInfo",
    icon: "person-circle",
    match: ["profileInfo", "screens/profile"],
  },
  {
    key: "settings",
    route: "/(tabs)/settings",
    icon: "settings",
    match: ["settings"],
  },
];

const COLLECTOR_TABS: TabItem[] = [
  {
    key: "home",
    route: "/(auth)/collectordashboard",
    icon: "home",
    match: ["collectordashboard"],
  },
  {
    key: "collect",
    route: "/screens/driver",
    icon: "car",
    match: ["driver"],
  },
  {
    key: "profile",
    route: "/screens/profile",
    icon: "person-circle",
    match: ["screens/profile"],
  },
];

type BottomBarProps = {
  tabProps?: BottomTabBarProps;
};

export default function BottomBar({ tabProps }: BottomBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("role").then(setRole);
  }, [pathname]);

  const tabs = role === "collector" ? COLLECTOR_TABS : CUSTOMER_TABS;
  const activeColor = COLORS.primary;
  const inactiveColor = COLORS.textMuted;

  const isActive = (tab: TabItem) =>
    tab.match.some((segment) => pathname.includes(segment));

  const handlePress = (tab: TabItem, index: number) => {
    if (tabProps?.navigation) {
      const routeName = tabProps.state.routeNames[index];
      if (routeName) {
        tabProps.navigation.navigate(routeName);
        return;
      }
    }
    router.push(tab.route as any);
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 10) },
      ]}
    >
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab);
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handlePress(tab, index)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconContainer, active && styles.activeTab]}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={active ? activeColor : inactiveColor}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function useBottomNavPadding() {
  const insets = useSafeAreaInsets();
  return BOTTOM_NAV_HEIGHT + Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 10) + 8;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    zIndex: 999,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: BOTTOM_NAV_HEIGHT,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: COLORS.primary + "10", // Very light primary color
  },
});
