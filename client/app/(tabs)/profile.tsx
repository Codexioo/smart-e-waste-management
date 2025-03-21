import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import React, { useState } from "react";
import styles from "../../styles/profile.styles"
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";


export default function Profile() {

  const [name, setName] = useState("Will");
  const [email, setEmail] = useState("myemail@gmail.com");
  const [telephone, setTelephone] = useState("+1 (902) 123 45 67");
  const [address, setAddress] = useState("45801 Austin, TX");
  const [isLoading,setIsLoading] = useState(false);

  const handleEdit = () => {}
  const handleDelete = () => {}

  return (
    <View style={styles.container}>

      {/* Profile Image Section */}
      {/* <View style={styles.profileContainer}>
        <Image
          source={require("../../assets/images/icon.png")} // Add a placeholder image
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="pencil" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View> */}

      <View style={styles.card}>
        <Text style={styles.title}>Profile Information</Text>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
        {/* <Text style={styles.input}>{}</Text> */}
        <TextInput style={styles.input} value={name} editable={false} />
      </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          {/* <Text style={styles.input}>{}</Text> */}
          <TextInput style={styles.input} value={email} editable={false} />
        </View>

        <Text style={styles.label}>Telephone</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          {/* <Text style={styles.input}>{}</Text> */}
          <TextInput style={styles.input} value={telephone} editable={false} />
        </View>
        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          {/* <Text style={styles.input}>{}</Text> */}
          <TextInput style={styles.input} value={address} editable={false} />
        </View>

 {/* Buttons Container */}
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
        </View>

      </View>
    </View>
  );
}
