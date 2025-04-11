import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../../styles/cartStyles";
import {
  getCart,
  removeFromCart,
  clearCart as clearCartAPI,
  addToCart,
} from "../../services/cartService";
import { getRewards } from "../../services/rewardsService";
import { checkout } from "../../services/ordersService";
import { useRouter } from "expo-router";
import BottomBar from "../../components/bottombar";

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
  const router = useRouter();

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPoints(total);
  };

  const fetchData = async () => {
    try {
      const res = await getCart();
      setCartItems(res.cart);
      calculateTotal(res.cart);

      const rewardRes = await getRewards();
      if (rewardRes.success) {
        setUserPoints(rewardRes.totalPoints);
      }
    } catch (err) {
      Alert.alert("Failed to load cart or points");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    await clearCartAPI();
    setCartItems([]);
    setTotalPoints(0);
  };

  const handleCheckout = () => {
    if (totalPoints > userPoints) {
      Alert.alert("Insufficient points", "You don't have enough points to complete checkout.");
      return;
    }

    Alert.alert(
      "Confirm Checkout",
      `Are you sure you want to spend ${totalPoints} points for checkout?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const res = await checkout(cartItems);
              if (res.success) {
                Alert.alert("Order Placed Successfully!", "", [
                  {
                    text: "OK",
                    onPress: async () => {
                      await clearCart();
                      router.push("/screens/shop");
                    },
                  },
                ]);
              } else {
                Alert.alert("Checkout Failed", res.message || "Something went wrong.");
              }
            } catch (err) {
              Alert.alert("Network error. Try again.");
              console.error("Checkout error:", err);
            }
          },
        },
      ]
    );
  };

  const handleRemove = async (productId: number) => {
    await removeFromCart(productId);
    const updatedCart = cartItems.filter((item) => item.product_id !== productId);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
  };

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await addToCart(item.product_id, newQuantity);
      const updatedCart = cartItems.map((ci) =>
        ci.product_id === item.product_id ? { ...ci, quantity: newQuantity } : ci
      );
      setCartItems(updatedCart);
      calculateTotal(updatedCart);
    } catch (err) {
      Alert.alert("Failed to update quantity");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Text style={styles.name}>{item.product_name}</Text>
      <Text style={styles.info}>
        Total: {item.quantity * item.price} pts
      </Text>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => updateQuantity(item, -1)}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qtyValue}>{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => updateQuantity(item, 1)}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.product_id)}
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
      <BottomBar />
    </SafeAreaView>
  );
}
