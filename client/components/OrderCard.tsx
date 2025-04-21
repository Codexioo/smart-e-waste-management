import React from "react";
import { View, Text, Image } from "react-native";
import styles from "../styles/ordersStyles";
import { formatImageUrl } from "../utils/formatImage";

type OrderItem = {
  product_name: string;
  quantity: number;
  product_image?: string;
};

type Props = {
  date: string;
  totalPoints: number;
  items: OrderItem[];
  invoiceNumber?: string; 
};

export default function OrderCard({ date, totalPoints, items, invoiceNumber }: Props) {
  return (
    <View style={styles.orderCard}>
      {invoiceNumber && (
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
          Invoice: {invoiceNumber}
        </Text>
      )}

      <Text style={styles.date}>{date}</Text>

      {items.map((item, index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          <View style={styles.itemRow}>
            <Text style={styles.product}>Product : {item.product_name}</Text>
            <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          </View>

          {item.product_image && (
            <Image
              source={{ uri: formatImageUrl(item.product_image) }}
              style={{
                width: "100%",
                height: 120,
                borderRadius: 10,
                marginTop: 6,
              }}
              resizeMode="cover"
            />
          )}
        </View>
      ))}

      <Text style={styles.totalPoints}>Total Points Used: {totalPoints}</Text>
    </View>
  );

}
