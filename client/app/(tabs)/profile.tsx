import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import React, { useState, useEffect } from "react"; // ✅ Import useEffect here
import styles from "../../styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";


export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {};
  const handleDelete = () => {};
  const router = useRouter();

  // ✅ Load user info from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.name);
        setEmail(user.email);

        // ✅ Set dummy details based on role
        if (user.role === "customer") {
          setTelephone("0771234567");
          setAddress("No. 12, Main Street, Colombo");
        } else if (user.role === "waste_collector") {
          setTelephone("0779876543");
          setAddress("No. 55, Collection Road, Galle");
        }
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Clear user from storage
      router.replace("/(auth)"); // Redirect to login screen (assuming it's index.tsx)
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile Information</Text>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={name} editable={false} />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={email} editable={false} />
        </View>

        <Text style={styles.label}>Telephone</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={telephone} editable={false} />
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={address} editable={false} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleEdit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Edit</Text>
            )}
          </TouchableOpacity>

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
