import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import BottomBar from "@/components/bottombar";

export default function ScreensLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
