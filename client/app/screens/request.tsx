import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabs from '@/app/components/bottombar';
import axios from '../../api/axiosInstance';

const API_URL = '/request-pickup';

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

const wasteTypes = ['Plastic', 'Glass', 'Metal', 'Paper'];

const Request = () => {
  const [form, setForm] = useState({
    address: '',
    district: null,
    city: null,
    user_id: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityList, setCityList] = useState<{ label: string; value: string }[]>([]);
  const [selectedWastes, setSelectedWastes] = useState<string[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setForm((prev) => ({ ...prev, user_id: user.id }));
        }
      } catch (err) {
        console.error('Failed to load user from storage:', err);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (form.district && citiesByDistrict[form.district]) {
      const cities = citiesByDistrict[form.district];
      setCityList(cities.map((city) => ({ label: city, value: city })));
      setForm((prev) => ({ ...prev, city: null }));
    } else {
      setCityList([]);
      setForm((prev) => ({ ...prev, city: null }));
    }
  }, [form.district]);

  const toggleWasteType = (type: string) => {
    setSelectedWastes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.address?.trim()) newErrors.address = 'Address is required';
    if (!form.district) newErrors.district = 'Please select a district';
    if (!form.city) newErrors.city = 'Please select a city';
    if (selectedWastes.length === 0) newErrors.waste_types = 'Select at least one waste type';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const requestData = {
      ...form,
      waste_types: selectedWastes,
      create_date: new Date().toISOString(),
    };

    try {
      await axios.post(API_URL, requestData);
      Alert.alert('Success', 'Pickup request submitted successfully');
      router.push('/screens/thankyou');

      setForm({
        address: '',
        district: null,
        city: null,
        user_id: form.user_id,
      });
      setSelectedWastes([]);
      setErrors({});
    } catch (error) {
      console.error('❌ API Error:', error);
      Alert.alert('Error', (error as any)?.response?.data?.error || 'Failed to submit request');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Pickup Request</Text>

          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            placeholder="Address"
            value={form.address}
            onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <View style={{ zIndex: 2000 }}>
            <DropDownPicker
              open={openDistrict}
              value={form.district}
              items={sriLankanDistricts}
              setOpen={setOpenDistrict}
              setValue={(cb) => {
                const value = cb(form.district);
                setForm((prev) => ({ ...prev, district: value }));
              }}
              placeholder="Select District"
              style={[styles.dropdown, errors.district && styles.errorDropdown]}
              containerStyle={{ marginBottom: 10 }}
            />
          </View>
          {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

          <View style={{ zIndex: 1000 }}>
            <DropDownPicker
              open={openCity}
              value={form.city}
              items={cityList}
              setOpen={setOpenCity}
              setValue={(cb) => {
                const value = cb(form.city);
                setForm((prev) => ({ ...prev, city: value }));
              }}
              placeholder="Select City"
              disabled={!form.district}
              style={[styles.dropdown, errors.city && styles.errorDropdown]}
              containerStyle={{ marginBottom: 10 }}
            />
          </View>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <Text style={styles.subTitle}>Select Waste Types</Text>
          <View style={styles.wasteTagWrapper}>
            {wasteTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.wasteTag, selectedWastes.includes(type) && styles.selectedWasteTag]}
                onPress={() => toggleWasteType(type)}
              >
                <Text style={styles.wasteTagText}>{type.toUpperCase()}</Text>
                {selectedWastes.includes(type) && <Text style={styles.wasteTagClose}> ✕</Text>}
              </TouchableOpacity>
            ))}
          </View>
          {errors.waste_types && <Text style={styles.errorText}>{errors.waste_types}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Confirm Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTabs />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 15, color: '#111' },
  subTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#222' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  dropdown: {
    borderRadius: 10,
    borderColor: '#ccc',
  },
  errorInput: { borderColor: 'red' },
  errorDropdown: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10 },
  wasteTagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  wasteTag: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedWasteTag: {
    backgroundColor: '#4CAF50',
  },
  wasteTagText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  wasteTagClose: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Request;