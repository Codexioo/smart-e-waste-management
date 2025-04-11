// screens/profile.tsx
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import styles from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import axios from "../../api/axiosInstance";
import useProtectedRoute from "@/hooks/useProtectedRoute";
import { getToken, getUser, setUser, clearStorage } from "@/utils/storage";

export default function Profile() {
  useProtectedRoute();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
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
      } catch (error) {
        console.error("Profile load error:", error);
        alert("Failed to load profile.");
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      await axios.put(
        "/profile",
        { username: name, telephone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const oldUser = await getUser();
      const updatedUser = { ...oldUser, username: name, telephone, address };
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
    try {
      setIsLoading(true);
      const token = await getToken();

      await axios.delete("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      await clearStorage();
      alert("Account deleted.");
      router.replace("/(auth)");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearStorage();
    router.replace("/(auth)");
  };

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

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={isEditing}
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
            onChangeText={setTelephone}
            editable={isEditing}
          />
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            editable={isEditing}
          />
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Delete</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
