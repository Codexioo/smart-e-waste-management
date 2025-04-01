import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabs from '@/components/bottombar';
import axios from "../../api/axiosInstance";

const API_URL = '/request-pickup'; // <-- Replace with your IP

const sriLankanDistricts = [
  { label: 'Colombo', value: 'Colombo' },
  { label: 'Gampaha', value: 'Gampaha' },
  { label: 'Kandy', value: 'Kandy' },
  { label: 'Galle', value: 'Galle' },
  { label: 'Jaffna', value: 'Jaffna' },
];

const citiesByDistrict: Record<string, string[]> = {
  Colombo: ['Colombo 1', 'Colombo 2', 'Colombo 3'],
  Gampaha: ['Negombo', 'Ja-Ela', 'Minuwangoda'],
  Kandy: ['Peradeniya', 'Katugastota', 'Pilimathalawa'],
  Galle: ['Hikkaduwa', 'Ambalangoda', 'Karapitiya'],
  Jaffna: ['Chunnakam', 'Nallur', 'Kopay'],
};

const Request = () => {
  const [form, setForm] = useState({
    location: '',
    address: '',
    district: null,
    city: null,
    user_id: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityList, setCityList] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setForm((prev) => ({ ...prev, user_id: user.id }));
        }
      } catch (err) {
        console.error("Failed to load user from storage:", err);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (form.district && Object.prototype.hasOwnProperty.call(citiesByDistrict, form.district)) {
      const cities = citiesByDistrict[form.district] || [];
      setCityList(cities.map((city) => ({ label: city, value: city })));
      setForm((prev) => ({ ...prev, city: null }));
    } else {
      setCityList([]);
      setForm((prev) => ({ ...prev, city: null }));
    }
  }, [form.district]);

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.district) newErrors.district = 'Please select a district';
    if (!form.city) newErrors.city = 'Please select a city';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    try {
      const response = await axios.post(API_URL, form);
      console.log('✅ Response:', response.data);
      Alert.alert('Success', 'Pickup request submitted successfully');
      router.push('/screens/thankyou');

      setForm({ location: '', address: '', district: null, city: null, user_id: form.user_id });
      setErrors({});
    } catch (error) {
      console.error('❌ API Error:', error);
      Alert.alert('Error', 'Failed to submit request');
    }
  };

  return (
    <>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Pickup Request</Text>

          <TextInput
            style={[styles.input, errors.location && styles.errorInput]}
            placeholder="Enter Location"
            value={form.location}
            onChangeText={(text) => setForm((prev) => ({ ...prev, location: text }))}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            placeholder="Enter Address"
            value={form.address}
            onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <View style={{ zIndex: openDistrict ? 3000 : 1, width: '100%' }}>
            <DropDownPicker
              open={openDistrict}
              value={form.district}
              items={sriLankanDistricts}
              setOpen={setOpenDistrict}
              setValue={(callback) => {
                const selectedValue = callback(form.district);
                setForm((prev) => ({ ...prev, district: selectedValue, city: null }));
              }}
              placeholder="Select District"
              style={[styles.dropdown, errors.district && styles.errorDropdown]}
              containerStyle={{ width: '100%', marginBottom: 15 }}
            />
          </View>
          {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

          <View style={{ zIndex: openCity ? 2000 : 1, width: '100%' }}>
            <DropDownPicker
              open={openCity}
              value={form.city}
              items={cityList}
              setOpen={setOpenCity}
              setValue={(callback) => {
                const selectedValue = callback(form.city);
                setForm((prev) => ({ ...prev, city: selectedValue }));
              }}
              placeholder="Select City"
              disabled={!form.district}
              style={[styles.dropdown, errors.city && styles.errorDropdown]}
              containerStyle={{ width: '100%', marginBottom: 15 }}
            />
          </View>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabs />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, marginBottom: 5 },
  dropdown: { backgroundColor: '#fafafa' },
  button: { backgroundColor: 'green', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorInput: { borderColor: 'red' },
  errorDropdown: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10, alignSelf: 'flex-start' },
});

export default Request;