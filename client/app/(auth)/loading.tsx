import { 
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform 
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import RedirectIfLoggedIn from "../../components/RedirectIfLoggedIn"; 
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <RedirectIfLoggedIn />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={width * 0.3} color={COLORS.white} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Smart E-Waste</Text>
          <Text style={styles.subtitle}>
            Manage your electronic waste responsibly and earn rewards for a greener planet.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push("/(auth)")}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.secondaryButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 40,
    marginBottom: 48,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
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
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: "center",
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
});
