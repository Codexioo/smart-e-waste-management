// screens/profileInfo.tsx
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import styles from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { getToken, getUser, setUser, clearStorage } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";


export default function ProfileInfo() {
  useProtectedRoute();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("");

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const token = await getToken();
          if (!token) {
            alert("Unauthorized. Please login again.");
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
    }, [])
  );
  
  if (isProfileLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile Informations</Text>

<View style={styles.profileContainer}>
  <Image
    source={
      profileImage
        ? { uri: profileImage }
        : require("../../assets/images/user.png") 
    }
    style={styles.profileImage}
  />
</View>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={name} 
            editable={false}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={email}
            editable={false}
          />
        </View>

        <Text style={styles.label}>Telephone</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={telephone}
            editable={false}
          />
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={address}  
            editable={false}
          />
        </View>
      </View>
    </View>
  );
}
