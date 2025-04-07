import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/ordersStyles";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Props = {
  date: string;
  totalPoints: number;
  items: OrderItem[];
};

export default function OrderCard({ date, totalPoints, items }: Props) {
  return (
    <View style={styles.orderCard}>
      <Text style={styles.date}>{date}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.product}>• {item.product_name}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        </View>
      ))}
      <Text style={styles.totalPoints}>Total Points Used: {totalPoints}</Text>
    </View>
  );
}
