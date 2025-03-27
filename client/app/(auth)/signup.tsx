import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import styles from "../../styles/signup.styles";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "../../api/axiosInstance";


export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleItems, setRoleItems] = useState([
    { label: "Customer", value: "customer" },
    { label: "Waste Collector", value: "waste_collector" },
  ]);

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
    selectedRole: "",
  });

  const router = useRouter();

  const handleSignup = async () => {
    setErrors({
      username: "",
      email: "",
      telephone: "",
      address: "",
      password: "",
      selectedRole: "",
    });
  
    let valid = true;
    let newErrors: any = {};
  
    // ✅ Validation logic (unchanged)
    if (!username.trim()) {
      newErrors.username = "Username is required.";
      valid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email.";
      valid = false;
    }
  
    const phoneRegex = /^[0-9]{10}$/;
    if (!telephone.trim()) {
      newErrors.telephone = "Telephone is required.";
      valid = false;
    } else if (!phoneRegex.test(telephone)) {
      newErrors.telephone = "Enter a valid 10-digit phone number.";
      valid = false;
    }
  
    if (!address.trim()) {
      newErrors.address = "Address is required.";
      valid = false;
    }
  
    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }
  
    if (!selectedRole) {
      newErrors.selectedRole = "Please select a role.";
      valid = false;
    }
  
    if (!valid) {
      setErrors(newErrors);
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post('/signup', {
        username,
        email,
        telephone,
        address,
        password,
        role: selectedRole === "waste_collector" ? "collector" : selectedRole, // Normalize role
      });
  
      setIsLoading(false);
      alert("Signup Successful!");
      router.push("/(auth)");
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.data?.error === "Email already exists") {
        alert("This email is already registered.");
      } else {
        console.error("Signup error:", error);
        alert("Signup failed. Please try again.");
      }
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign Up</Text>
          </View>

          <View style={styles.formContainer}>
           {/* Role Dropdown */}
<View style={{ zIndex: roleOpen ? 1000 : 1 }}>
  <Text style={styles.label}>Select Your Role:</Text>
  <DropDownPicker
    open={roleOpen}
    value={selectedRole}
    items={roleItems}
    setOpen={setRoleOpen}
    setValue={setSelectedRole}
    setItems={setRoleItems}
    placeholder="Select a role"
    style={{
      backgroundColor: COLORS.inputBackground,
      borderColor: COLORS.border,
      borderRadius: 12,
      zIndex: 100, // Ensures it's above other elements
    }}
    dropDownContainerStyle={{
      borderColor: COLORS.border,
      borderRadius: 12,
      zIndex: 1000, // Ensures the dropdown appears above other elements
      elevation: 10, // Increases shadow effect (Android)
    }}
    textStyle={{
      color: COLORS.textDark,
    }}
  />
  {errors.selectedRole ? (
    <Text style={styles.errorText}>{errors.selectedRole}</Text>
  ) : null}
</View>


            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrors({ ...errors, username: "" });
                  }}
                  autoCapitalize="none"
                />
              </View>
              {errors.username ? (
                <Text style={styles.errorText}>{errors.username}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: "" });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Telephone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telephone</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="0773651478"
                  placeholderTextColor={COLORS.placeholderText}
                  value={telephone}
                  onChangeText={(text) => {
                    setTelephone(text);
                    setErrors({ ...errors, telephone: "" });
                  }}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
              {errors.telephone ? (
                <Text style={styles.errorText}>{errors.telephone}</Text>
              ) : null}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="23/A, Gampaha"
                  placeholderTextColor={COLORS.placeholderText}
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    setErrors({ ...errors, address: "" });
                  }}
                  autoCapitalize="none"
                />
              </View>
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: "" });
                  }}
                  secureTextEntry={!showPassword}
                />
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
