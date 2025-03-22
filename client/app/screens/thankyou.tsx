import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomTabs from "@/app/components/bottombar";

const ThankYou = () => {
  useEffect(() => {
    // ✅ Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/screens/HomeScreen'); // ✅ Fix: Use correct path
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={80} color="green" />
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.subtitle}>Your pickup request is processing.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/HomeScreen')}>
        <Text style={styles.buttonText}>Go Back Home</Text>
      </TouchableOpacity>

    <BottomTabs />
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  subtitle: { fontSize: 16, color: 'gray', marginTop: 5, textAlign: 'center' },
  button: { marginTop: 20, backgroundColor: 'green', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ThankYou;