import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BottomTabs() {
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/userdashboard')}>
        <Ionicons name="home" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
        <Ionicons name="person-circle" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Ionicons name="call" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    // Match existing tabBarStyle:
    backgroundColor: 'black',
    borderTopWidth: 0,
    position: 'absolute',
    elevation: 0,
    height: 60,

    bottom: 0,
    left: 0,
    right: 0,

    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 8,
    zIndex: 999, // ensure it stays on top
  },
});
