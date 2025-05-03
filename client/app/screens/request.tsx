// request.tsx
import React, { useEffect, useState } from 'react';
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
import BottomBar from '../../components/bottombar';
import axios from '../../api/axiosInstance';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

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
  const [form, setForm] = useState<{
    address: string;
    district: string | null;
    city: string | null;
    user_id: number | null;
    latitude: number | null;
    longitude: number | null;
  }>({
    address: '',
    district: null,
    city: null,
    user_id: null,
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityList, setCityList] = useState<{ label: string; value: string }[]>([]);
  const [selectedWastes, setSelectedWastes] = useState<string[]>([]);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setForm((prev) => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      } else {
        Alert.alert('Location permission not granted');
      }
    })();

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
    if (!form.latitude || !form.longitude) newErrors.location = 'Please select your location';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await axios.post(API_URL, {
        ...form,
        waste_types: selectedWastes,
        create_date: new Date().toISOString(),
      });
      Alert.alert('Success', 'Pickup request submitted successfully');
      router.push('/screens/thankyou');

      setForm({
        address: '',
        district: null,
        city: null,
        user_id: form.user_id,
        latitude: null,
        longitude: null,
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Pickup Request</Text>

          {/* Map Search */}
          <Text style={styles.subTitle}>Search Location (drag pin)</Text>
          {region && (
            <MapView
              style={{ height: 200, borderRadius: 10, marginBottom: 10 }}
              region={region}
              onRegionChangeComplete={(r) => {
                setRegion(r);
                setForm((prev) => ({
                  ...prev,
                  latitude: r.latitude,
                  longitude: r.longitude,
                }));
              }}
            >
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setForm((prev) => ({ ...prev, latitude, longitude }));
                }}
              />
            </MapView>
          )}
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          {/* Address */}
          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            placeholder="Address"
            value={form.address}
            onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          {/* District */}
          <DropDownPicker
            open={openDistrict}
            value={form.district}
            items={sriLankanDistricts}
            setOpen={setOpenDistrict}
            setValue={(cb) =>
              setForm((prev) => ({ ...prev, district: cb(form.district) }))
            }
            placeholder="Select District"
            style={[styles.dropdown, errors.district && styles.errorDropdown]}
            containerStyle={{ marginBottom: openDistrict ? 250 : 10 }}
            zIndex={3000}
            zIndexInverse={1000}
          />
          {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

          {/* City */}
          <DropDownPicker
            open={openCity}
            value={form.city}
            items={cityList}
            setOpen={setOpenCity}
            setValue={(cb) => setForm((prev) => ({ ...prev, city: cb(form.city) }))}
            placeholder="Select City"
            disabled={!form.district}
            style={[styles.dropdown, errors.city && styles.errorDropdown]}
            containerStyle={{ marginBottom: openCity ? 250 : 10 }}
            zIndex={2000}
            zIndexInverse={2000}
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          {/* Waste Types */}
          <Text style={styles.subTitle}>Select Waste Types</Text>
          <View style={styles.wasteTagWrapper}>
            {wasteTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.wasteTag,
                  selectedWastes.includes(type) && styles.selectedWasteTag,
                ]}
                onPress={() => toggleWasteType(type)}
              >
                <Text style={styles.wasteTagText}>{type.toUpperCase()}</Text>
                {selectedWastes.includes(type) && (
                  <Text style={styles.wasteTagClose}> ✕</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errors.waste_types && (
            <Text style={styles.errorText}>{errors.waste_types}</Text>
          )}

          {/* Confirm Button */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Confirm Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomBar />
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