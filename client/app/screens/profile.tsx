// screens/profile.tsx
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Image,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import styles from "../../styles/profile.styles2";
  import { Ionicons } from "@expo/vector-icons";
  import COLORS from "../../constants/colors";
  import { useRouter } from "expo-router";
  import axios from "../../api/axiosInstance";
  import useProtectedRoute from "@/hooks/useProtectedRoute";
  import { getToken, getUser, setUser, clearStorage } from "@/utils/storage";
  import * as ImagePicker from 'expo-image-picker';
  import BottomBar from "../../components/bottombar";
  
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
        setProfileImage(base64Image); // for preview + sending to backend
      }
    };
  
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
  
    const handleEdit = () => {
      setIsEditing(true);
    };
  
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
            timeout: 20000, // wait up to 15 seconds
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
        "Delete Profile",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
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
                Alert.alert("Account Deleted", "Your profile has been deleted.");
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
  
    {isEditing && (
      <View style={styles.imageEditOptions}>
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.addImageText}>
            {profileImage ? "Change Image" : "Add Profile Image"}
          </Text>
        </TouchableOpacity>
  
        {profileImage !== "" && (
          <TouchableOpacity onPress={() => setProfileImage("")}>
            <Text style={styles.removeImageText}>Remove Image</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
  
  
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
              onChangeText={setEmail}
              editable={isEditing}
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
    <>
      <TouchableOpacity
        style={[styles.button, styles.editButton]}
        onPress={handleEdit}
      >
        <Text style={styles.buttonText}>Edit</Text>
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
    </>
  )}
</View>
          </View>
           <BottomBar />
        </View>
    );
  }
  