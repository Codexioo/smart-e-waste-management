import { View, Text, Button, StyleSheet, Alert } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function collectordashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // or whatever key you use
      router.replace("/(auth)"); // replace with your actual login route
    } catch (error) {
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collector Dashboard</Text>

      <View style={styles.logoutContainer}>
        <Button title="Logout" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutContainer: {
    marginTop: 20,
    alignSelf: "flex-end",
  },
});
