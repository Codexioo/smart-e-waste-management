import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import BottomBar, { useBottomNavPadding } from "@/components/bottombar";

export default function ScreensLayout() {
  const bottomPadding = useBottomNavPadding();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Slot />
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
