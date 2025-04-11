import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../styles/ordersStyles";
import OrderCard from "../../components/OrderCard";
import { getOrders } from "../../services/ordersService";
import BottomBar from "../../components/bottombar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Order = {
  order_id: number;
  purchase_date: string;
  total_points_used: number;
  items: OrderItem[];
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      if (res.success) {
        setOrders(res.orders);
      } else {
        Alert.alert("Failed to load orders");
      }
    } catch (err) {
      Alert.alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderItem = ({ item }: { item: Order }) => (
    <OrderCard
      date={formatDate(item.purchase_date)}
      totalPoints={item.total_points_used}
      items={item.items}
    />
  );

  const exportPDF = async () => {
    if (!orders.length) {
      alert("No orders to export");
      return;
    }

    const orderSections = orders.map((order) => {
      const itemRows = order.items
        .map(
          (item) =>
            `<tr><td>${item.product_name}</td><td>${item.quantity}</td></tr>`
        )
        .join("");

      return `
        <h4 style="margin-top:20px;">🧾 Order on ${formatDate(
          order.purchase_date
        )}</h4>
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; margin-bottom: 10px;">
          <tr><th>Product</th><th>Quantity</th></tr>
          ${itemRows}
        </table>
        <p><strong>Total Points Used:</strong> ${order.total_points_used}</p>
      `;
    });

    const html = `
      <html>
        <body style="font-family: Arial; padding: 16px;">
          <h2>Smart E-Waste – Order History</h2>
          ${orderSections.join("")}
        </body>
      </html>
    `;

    try {
      const result = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) {
        return alert("Sharing is not available on this device");
      }
      await Sharing.shareAsync(result.uri);
    } catch {
      alert("Failed to export PDF");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Order History</Text>

        <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
          <Text style={styles.exportText}>Download as PDF</Text>
        </TouchableOpacity>

        {orders.length === 0 ? (
          <Text>No orders found.</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.order_id.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
      <BottomBar />
    </SafeAreaView>
  );
}
