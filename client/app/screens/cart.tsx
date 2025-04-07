import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "../../api/axiosInstance";
import styles from "../../styles/cartStyles";

type CartItem = {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadCart = async () => {
    const savedCart = await AsyncStorage.getItem("cart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartItems(parsed);
      const total = parsed.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setTotalPoints(total);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const email = "chamikara38@gmail.com";
      const res = await axios.get(`/rewards?email=${email}`);
      if (res.data.success) {
        setUserPoints(res.data.totalPoints);
      }
    } catch {
      Alert.alert("Failed to fetch user points");
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (updatedCart: CartItem[]) => {
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    const total = updatedCart.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );
    setTotalPoints(total);
  };

  const updateQuantity = async (productId: number, delta: number) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
      .filter(Boolean);

    await saveCart(updatedCart as CartItem[]);
  };

  const removeItem = async (productId: number) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updatedCart = cartItems.filter(
            (item) => item.product_id !== productId
          );
          await saveCart(updatedCart);
          Alert.alert("Item removed from cart");
        },
      },
    ]);
  };

  const clearCart = async () => {
    await AsyncStorage.removeItem("cart");
    setCartItems([]);
    setTotalPoints(0);
  };

  const handleCheckout = async () => {
    if (totalPoints > userPoints) {
      Alert.alert("Insufficient points to complete checkout.");
      return;
    }

    Alert.alert(
      "Confirm Checkout",
      `Proceed with checkout and spend ${totalPoints} points?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const email = "chamikara38@gmail.com";
              const res = await axios.post("/checkout", {
                email,
                items: cartItems,
              });

              if (res.data.success) {
                Alert.alert("Checkout successful! Email sent.");
                clearCart();
                navigation.navigate("shop" as never);
              } else {
                Alert.alert(res.data.message || "Checkout failed.");
              }
            } catch (err: any) {
              const msg =
                err.response?.data?.message || "Network error. Try again.";
              Alert.alert(msg);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
      fetchUserPoints();
    }, [])
  );

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Text style={styles.name}>{item.product_name}</Text>
      <Text style={styles.info}>
        Quantity: {item.quantity} | Total: {item.quantity * item.price} pts
      </Text>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product_id, -1)}
        >
          <Text style={styles.quantityText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product_id, 1)}
        >
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.product_id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cartItems.length === 0 ? (
        <Text>No items in cart</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderItem}
          />
          <View style={styles.summary}>
            <Text style={styles.total}>Total Points Required: {totalPoints}</Text>
            <Text style={styles.total}>Your Available Points: {userPoints}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              totalPoints > userPoints && styles.disabledButton,
            ]}
            onPress={handleCheckout}
            disabled={cartItems.length === 0 || totalPoints > userPoints}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
