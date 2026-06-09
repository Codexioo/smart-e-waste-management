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
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../api/axiosInstance';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Feather, Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

const { width } = Dimensions.get("window");
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

const wasteTypes = [
  { id: 'Plastic', icon: 'water-outline' as const },
  { id: 'Glass', icon: 'wine-outline' as const },
  { id: 'Metal', icon: 'hardware-chip-outline' as const },
  { id: 'Paper', icon: 'document-text-outline' as const },
];

const Request = () => {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setForm((prev) => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      } else {
        Alert.alert('Location permission not granted');
      }
    })();

    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setForm((prev) => ({ ...prev, user_id: user.id }));
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
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
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(API_URL, {
        ...form,
        waste_types: selectedWastes,
        create_date: new Date().toISOString(),
      });
      Alert.alert('Success', 'Pickup request submitted successfully');
      router.push('/screens/thankyou');
    } catch (error) {
      console.error('❌ API Error:', error);
      Alert.alert('Error', (error as any)?.response?.data?.error || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Pickup</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <Text style={styles.sectionSubtitle}>Drag the pin to your exact location</Text>
            
            <View style={[styles.mapContainer, errors.location && styles.errorBorder]}>
              {region && (
                <MapView
                  style={styles.map}
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
                  />
                </MapView>
              )}
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <View style={[styles.inputContainer, errors.address && styles.errorBorder]}>
                <Feather name="map-pin" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 123 Eco Street"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.address}
                  onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, address: text }));
                    if (errors.address) setErrors({ ...errors, address: "" });
                  }}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={[styles.row, { zIndex: 3000 }]}>
              <View style={[styles.flex1, { marginRight: 8 }]}>
                <Text style={styles.label}>District</Text>
                <DropDownPicker
                  open={openDistrict}
                  value={form.district}
                  items={sriLankanDistricts}
                  setOpen={setOpenDistrict}
                  setValue={(cb) => {
                    const val = cb(form.district);
                    setForm((prev) => ({ ...prev, district: val }));
                    if (errors.district) setErrors({ ...errors, district: "" });
                  }}
                  placeholder="Select"
                  listMode="MODAL"
                  modalTitle="Select district"
                  style={[styles.dropdown, errors.district && styles.errorBorder]}
                  dropDownContainerStyle={styles.dropdownList}
                />
              </View>
              <View style={[styles.flex1, { marginLeft: 8 }]}>
                <Text style={styles.label}>City</Text>
                <DropDownPicker
                  open={openCity}
                  value={form.city}
                  items={cityList}
                  setOpen={setOpenCity}
                  setValue={(cb) => {
                    const val = cb(form.city);
                    setForm((prev) => ({ ...prev, city: val }));
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                  placeholder="Select"
                  disabled={!form.district}
                  listMode="MODAL"
                  modalTitle="Select city"
                  style={[styles.dropdown, errors.city && styles.errorBorder]}
                  dropDownContainerStyle={styles.dropdownList}
                />
              </View>
            </View>
            {(errors.district || errors.city) && (
              <Text style={styles.errorText}>{errors.district || errors.city}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waste Categories</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            
            <View style={styles.wasteGrid}>
              {wasteTypes.map((type) => {
                const isSelected = selectedWastes.includes(type.id);
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.wasteItem, isSelected && styles.wasteItemActive]}
                    onPress={() => {
                      toggleWasteType(type.id);
                      if (errors.waste_types) setErrors({ ...errors, waste_types: "" });
                    }}
                  >
                    <View style={[styles.wasteIconContainer, isSelected && styles.wasteIconContainerActive]}>
                      <Ionicons 
                        name={type.icon} 
                        size={24} 
                        color={isSelected ? COLORS.white : COLORS.primary} 
                      />
                    </View>
                    <Text style={[styles.wasteLabel, isSelected && styles.wasteLabelActive]}>
                      {type.id}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={10} color={COLORS.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.waste_types && <Text style={styles.errorText}>{errors.waste_types}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? "Submitting..." : "Confirm Request"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollContainer: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  mapContainer: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
  },
  map: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  dropdown: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 16,
    height: 56,
  },
  dropdownList: {
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    elevation: 5,
  },
  wasteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  wasteItem: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  wasteItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
  },
  wasteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "10",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  wasteIconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  wasteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  wasteLabelActive: {
    color: COLORS.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  errorBorder: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '600' },
});

export default Request;
