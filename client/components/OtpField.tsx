import React from "react";
import { View, Text, TextInput } from "react-native";
import styles from "../styles/driverStyles";

type Props = {
  label: string;
  value: string;
  onChange: (text: string) => void;
};

export default function OtpField({ label, value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
      />
    </View>
  );
}
