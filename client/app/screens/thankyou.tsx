import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/colors";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

const ThankYou = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/(tabs)/userdashboard");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="bounceIn" 
        duration={1500} 
        style={styles.iconContainer}
      >
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Ionicons name="checkmark" size={60} color={COLORS.white} />
          </View>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500} style={styles.content}>
        <Text style={styles.title}>Request Submitted!</Text>
        <Text style={styles.subtitle}>
          Your pickup request has been received. A collector will be assigned to your location soon.
        </Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={1000} style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/userdashboard")}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
          <Feather name="arrow-right" size={20} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.redirectText}>Redirecting automatically in a few seconds...</Text>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: COLORS.textPrimary,
    flexDirection: "row",
    height: 60,
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  redirectText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});

export default ThankYou;
