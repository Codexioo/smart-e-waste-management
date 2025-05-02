import { 
    View, Text, TouchableOpacity, Image 
  } from "react-native";
  import styles from "../../styles/loading";
  import React from "react";
  import { useRouter } from "expo-router"; // Import useRouter to navigate
  
  export default function Index() {
    const router = useRouter(); // Initialize the router
  
    return (
      <View style={styles.container}>
        {/* E-Waste Logo */}
        <Image 
          source={require("../../assets/images/logo2.jpg")} // Replace with your actual logo path
          style={styles.logo}
          resizeMode="contain"
        />
  
        {/* Title */}
        <Text style={styles.title}>Welcome to Smart E-Waste Management System</Text>
  
        {/* Sign Up Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push("/signup")} // Navigate to Sign Up page
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
  
        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.button, { marginTop: 10 }]} 
          onPress={() => router.push("/(auth)")} // Navigate to Login page
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  