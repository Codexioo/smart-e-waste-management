import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { Link, useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "../../api/axiosInstance";

const { width } = Dimensions.get("window");

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedRole, setSelectedRole] = useState(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleItems, setRoleItems] = useState([
    { label: "Customer", value: "customer" },
    { label: "Waste Collector", value: "waste_collector" },
  ]);

  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const handleSignup = async () => {
    setErrors({});
    let valid = true;
    let newErrors: any = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
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
      await axios.post('/signup', {
        username,
        email,
        telephone,
        address,
        password,
        role: selectedRole === "waste_collector" ? "collector" : selectedRole,
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
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us in making the world cleaner</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* Role Dropdown */}
              <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                <Text style={styles.label}>I am a...</Text>
                <DropDownPicker
                  open={roleOpen}
                  value={selectedRole}
                  items={roleItems}
                  setOpen={setRoleOpen}
                  setValue={setSelectedRole}
                  setItems={setRoleItems}
                  placeholder="Select your role"
                  style={[styles.dropdown, errors.selectedRole ? styles.inputError : null]}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                />
                {errors.selectedRole ? (
                  <Text style={styles.errorText}>{errors.selectedRole}</Text>
                ) : null}
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputContainer, errors.username ? styles.inputError : null]}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textMuted}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) setErrors({ ...errors, username: "" });
                    }}
                  />
                </View>
                {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="john@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Telephone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[styles.inputContainer, errors.telephone ? styles.inputError : null]}>
                  <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0771234567"
                    placeholderTextColor={COLORS.textMuted}
                    value={telephone}
                    onChangeText={(text) => {
                      setTelephone(text);
                      if (errors.telephone) setErrors({ ...errors, telephone: "" });
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.telephone ? <Text style={styles.errorText}>{errors.telephone}</Text> : null}
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Home Address</Text>
                <View style={[styles.inputContainer, errors.address ? styles.inputError : null]}>
                  <Ionicons name="home-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Street, City"
                    placeholderTextColor={COLORS.textMuted}
                    value={address}
                    onChangeText={(text) => {
                      setAddress(text);
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                  />
                </View>
                {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat password"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    secureTextEntry={!showPassword}
                  />
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/(auth)" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 32,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  card: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "05",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 52,
  },
  dropdownContainer: {
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginRight: 6,
  },
  link: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "600",
  },
});
