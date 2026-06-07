import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { getToken, getUser, setUser, clearStorage } from "@/utils/storage";
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  useProtectedRoute();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.3,
      base64: true,
    });
  
    if (!result.canceled) {
      const imageBase64 = result.assets[0].base64;
      const base64Image = `data:image/jpeg;base64,${imageBase64}`;
      setProfileImage(base64Image);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/(auth)");
          return;
        }

        const response = await axios.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response.data;
        setName(user.username);
        setEmail(user.email);
        setTelephone(user.telephone);
        setAddress(user.address);
        setProfileImage(user.profile_image || ""); 
      } catch (error) {
        console.error("Profile load error:", error);
        alert("Failed to load profile.");
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      await axios.put(
        "/profile",
        {
          username: name,
          telephone,
          address,
          email,
          profile_image: profileImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        }
      );
      
      const oldUser = await getUser();
      const updatedUser = { ...oldUser, username: name, telephone, address, email };
      await setUser(updatedUser);

      Alert.alert("Success", "Your profile was updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const token = await getToken();
              await axios.delete("/profile", {
                headers: { Authorization: `Bearer ${token}` },
              });
              await clearStorage();
              router.replace("/(auth)");
            } catch (error) {
              console.error("Delete error:", error);
              alert("Failed to delete account.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editToggleBtn} 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.editToggleText}>{isEditing ? "Save" : "Edit"}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.imageWrapper}>
            <Image
              source={profileImage ? { uri: profileImage } : require("../../assets/images/user.png")}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputContainer, !isEditing && styles.inputDisabled]}>
              <Feather name="user" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={isEditing}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, !isEditing && styles.inputDisabled]}>
              <Feather name="mail" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputContainer, !isEditing && styles.inputDisabled]}>
              <Feather name="phone" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telephone}
                onChangeText={setTelephone}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Home Address</Text>
            <View style={[styles.inputContainer, !isEditing && styles.inputDisabled]}>
              <Feather name="home" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                editable={isEditing}
                multiline
              />
            </View>
          </View>
        </View>

        {isEditing ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelBtnText}>Cancel Editing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
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
  editToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "10",
  },
  editToggleText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.inputBackground,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  formSection: {
    padding: 24,
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
    minHeight: 56,
  },
  inputDisabled: {
    backgroundColor: COLORS.inputBackground,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
    paddingVertical: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 16,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 16,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
});
