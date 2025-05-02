import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import COLORS from "../constants/colors"; // Adjust path as needed

const RedirectIfLoggedIn: React.FC = () => {
  const router = useRouter();
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (token && role) {
        if (role === "customer") {
          router.replace("/(tabs)/userdashboard");
        } else if (role === "collector") {
          router.replace("/(auth)/collectordashboard");
        } else {
          router.replace("/(auth)/loading");
        }
      } else {
        setChecking(false); // Show login/signup only if not logged in
      }
    };

    checkLogin();
  }, []);

  if (checking) {
    const loaderStyle: ViewStyle = {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    };

    return (
      <View style={loaderStyle}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return null;
};

export default RedirectIfLoggedIn;
