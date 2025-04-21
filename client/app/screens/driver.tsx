import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/driverStyles";
import OtpField from "../../components/OtpField";
import {
  checkUser,
  sendOtp,
  verifyOtp,
  submitWaste,
} from "../../services/authService";

export default function DriverScreen() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [wasteType, setWasteType] = useState("");
  const [wasteWeight, setWasteWeight] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);


  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validateOtp = (otp: string) => /^\d{6}$/.test(otp);

  const handleSendOtp = async () => {
    if (!email || !validateEmail(email)) {
      return Alert.alert("Please enter a valid email");
    }
  
    try {
      setOtpLoading(true); // ⏳ Show loading
      const res = await checkUser(email);
      if (!res.success) {
        return Alert.alert(res.message || "Email not registered");
      }
      setUserInfo(res.user);
  
      const otpRes = await sendOtp(email);
      if (otpRes.success) {
        setOtpSent(true);
        Alert.alert("OTP sent to email!");
      } else {
        Alert.alert(otpRes.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 400 ? "Invalid OTP" : "Network error");
      Alert.alert(message);
    } finally {
      setOtpLoading(false); // ✅ hide loading
    }
  };
  

  const handleVerifyOtp = async () => {
    if (!otp || !validateOtp(otp)) {
      return Alert.alert("Please enter a valid 6-digit OTP");
    }

    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setOtpVerified(true);
        Alert.alert("OTP verified!");
      } else {
        Alert.alert("Invalid OTP");
      }
    } catch {
      Alert.alert("Network error");
    }
  };

  const handleSubmitWaste = async () => {
    if (!wasteType || !wasteWeight) {
      return Alert.alert("Please fill in all waste details");
    }

    try {
      const res = await submitWaste(
        email,
        wasteType,
        parseFloat(wasteWeight)
      );

      if (res.success) {
        Alert.alert("Waste submitted and points added!");
        setEmail("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
        setUserInfo(null);
        setWasteType("");
        setWasteWeight("");
      } else {
        Alert.alert(res.message || "Failed to submit waste");
      }
    } catch {
      Alert.alert("Network error");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Driver Waste Collection</Text>

        <Text style={styles.label}>User Email</Text>
        <TextInput
          style={[styles.input, otpSent && styles.disabledInput]}
          value={email}
          onChangeText={setEmail}
          editable={!otpSent}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {otpSent && otpVerified && userInfo && (
          <View style={styles.userInfoBox}>
            <Text style={styles.userText}>Name: {userInfo.user_name}</Text>
            <Text style={styles.userText}>
              Available Points: {userInfo.total_reward_points}
            </Text>
          </View>
        )}

        {!otpSent && (
          <TouchableOpacity
          style={[styles.button, otpLoading && styles.disabledButton]}
          onPress={handleSendOtp}
          disabled={otpLoading}
        >
          <Text style={styles.buttonText}>
            {otpLoading ? "Sending OTP..." : "Send OTP"}
          </Text>
        </TouchableOpacity>
        
        )}

        {otpSent && !otpVerified && (
          <>
            <OtpField label="Enter OTP" value={otp} onChange={setOtp} />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {otpVerified && (
          <>
            <Text style={styles.label}>Waste Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={wasteType}
                onValueChange={(itemValue) => setWasteType(itemValue)}
              >
                <Picker.Item label="Select Waste Type" value="" />
                <Picker.Item label="Electronic" value="electronic" />
                <Picker.Item label="Battery" value="battery" />
                <Picker.Item label="Plastic" value="plastic" />
              </Picker>
            </View>

            <Text style={styles.label}>Waste Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={wasteWeight}
              onChangeText={setWasteWeight}
              keyboardType="numeric"
              placeholder="Enter weight"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmitWaste}>
              <Text style={styles.buttonText}>Submit Waste Data</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
