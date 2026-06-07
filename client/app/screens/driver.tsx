import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import OtpField from "../../components/OtpField";
import {
  checkUser,
  sendOtp,
  verifyOtp,
  submitWaste,
} from "../../services/authService";
import COLORS from "@/constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DriverScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [wasteType, setWasteType] = useState("");
  const [wasteWeight, setWasteWeight] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validateOtp = (otp: string) => /^\d{6}$/.test(otp);

  const handleSendOtp = async () => {
    if (!email || !validateEmail(email)) {
      return Alert.alert("Required", "Please enter a valid customer email.");
    }
  
    try {
      setOtpLoading(true);
      const res = await checkUser(email);
      if (!res.success) {
        return Alert.alert("Not Found", res.message || "Email not registered.");
      }
      setUserInfo(res.user);
  
      const otpRes = await sendOtp(email);
      if (otpRes.success) {
        setOtpSent(true);
        Alert.alert("OTP Sent", "A 6-digit verification code has been sent to the customer's email.");
      } else {
        Alert.alert("Error", otpRes.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !validateOtp(otp)) {
      return Alert.alert("Invalid OTP", "Please enter a valid 6-digit code.");
    }

    try {
      setOtpLoading(true);
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setOtpVerified(true);
        Alert.alert("Verified", "Customer identity verified successfully.");
      } else {
        Alert.alert("Invalid OTP", "The code you entered is incorrect.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmitWaste = async () => {
    if (!wasteType || !wasteWeight) {
      return Alert.alert("Required", "Please fill in all waste details.");
    }

    try {
      setSubmitting(true);
      const res = await submitWaste(
        email,
        wasteType,
        parseFloat(wasteWeight)
      );

      if (res.success) {
        Alert.alert("Success", "Waste collection data submitted and points awarded!");
        setEmail("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
        setUserInfo(null);
        setWasteType("");
        setWasteWeight("");
      } else {
        Alert.alert("Error", res.message || "Failed to submit waste data.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waste Collection</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Verification</Text>
          <Text style={styles.sectionSubtitle}>Verify customer identity before collection</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Email</Text>
            <View style={[styles.inputContainer, otpSent && styles.inputDisabled]}>
              <Feather name="mail" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={!otpSent}
                placeholder="customer@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {!otpSent && (
            <TouchableOpacity
              style={[styles.primaryBtn, otpLoading && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={otpLoading}
            >
              {otpLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                  <Feather name="send" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          )}

          {otpSent && !otpVerified && (
            <View style={styles.otpSection}>
              <OtpField label="Enter 6-Digit Code" value={otp} onChange={setOtp} />
              <TouchableOpacity 
                style={[styles.primaryBtn, otpLoading && styles.btnDisabled]} 
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Identity</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Change Email</Text>
              </TouchableOpacity>
            </View>
          )}

          {otpVerified && userInfo && (
            <View style={styles.userInfoCard}>
              <View style={styles.userIconContainer}>
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userInfo.user_name}</Text>
                <Text style={styles.userPoints}>{userInfo.total_reward_points} Points Available</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
            </View>
          )}
        </View>

        {otpVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection Details</Text>
            <Text style={styles.sectionSubtitle}>Enter the type and weight of waste collected</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Waste Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={wasteType}
                  onValueChange={(val) => setWasteType(val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Category" value="" color={COLORS.textMuted} />
                  <Picker.Item label="Electronic Waste" value="electronic" />
                  <Picker.Item label="Batteries" value="battery" />
                  <Picker.Item label="Plastic" value="plastic" />
                  <Picker.Item label="Metal" value="metal" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputContainer}>
                <Feather name="box" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={wasteWeight}
                  onChangeText={setWasteWeight}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 12.5"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && styles.btnDisabled]} 
              onPress={handleSubmitWaste}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Complete Collection</Text>
                  <Feather name="check-circle" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputDisabled: {
    backgroundColor: COLORS.inputBackground,
    borderColor: "transparent",
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  btnDisabled: { opacity: 0.6, elevation: 0 },
  otpSection: { marginTop: 10 },
  resetBtn: { alignSelf: "center", marginTop: 16, padding: 8 },
  resetBtnText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  userPoints: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500", marginTop: 2 },
  verifiedBadge: { marginLeft: 8 },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  picker: {
    height: 56,
    width: "100%",
  },
  submitBtn: {
    backgroundColor: COLORS.secondary,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 10,
  },
  submitBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
});
