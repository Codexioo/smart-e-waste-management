import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../styles/ordersStyles";
import OrderCard from "../../components/OrderCard";
import { getOrders } from "../../services/ordersService";

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
      const email = "chamikara38@gmail.com";
      const res = await getOrders(email);
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
    </SafeAreaView>
  );
}
