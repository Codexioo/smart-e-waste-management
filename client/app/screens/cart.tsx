import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
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
import { formatImageUrl } from "../../utils/formatImage";

type CartItem = {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string;
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
    } catch {
      Toast.show({ type: "error", text1: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const confirmClearCart = () => {
    Alert.alert(
      "Clear All?",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Clear",
          style: "destructive",
          onPress: async () => {
            await clearCartAPI();
            setCartItems([]);
            setTotalPoints(0);
            Toast.show({
              type: "success",
              text1: "Cart cleared",
            });
            setTimeout(() => {
              router.push("/screens/shop");
            }, 500);
          },
        },
      ]
    );
  };

  const [checkingOut, setCheckingOut] = useState(false);

const handleCheckout = () => {
    if (totalPoints > userPoints) {
      Toast.show({
        type: "error",
        text1: "Not enough points!",
        text2: "You need more points to complete checkout.",
      });
      return;
    }

    Alert.alert(
      "Confirm Checkout",
      `Spend ${totalPoints} points to place your order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Place Order",
          style: "default",
          onPress: async () => {
            try {
              const res = await checkout(cartItems);
              if (res.success) {
                setCartItems([]);
                setTotalPoints(0);

                Toast.show({
                  type: "success",
                  text1: "✅ Order placed successfully!",
                  text2: "Redirecting to shop...",
                });

                setTimeout(() => {
                  router.push("/screens/shop");
                }, 1000);
                
              } else {
                Toast.show({
                  type: "error",
                  text1: "Checkout failed",
                  text2: res.message || "Something went wrong.",
                });
              }
            } catch {
              Toast.show({
                type: "error",
                text1: "Network error",
                text2: "Please try again.",
              });
            }
          },
        },
      ]
    );
  };

  const handleRemove = async (productId: number) => {
    await removeFromCart(productId);
    const updatedCart = cartItems.filter(
      (item) => item.product_id !== productId
    );
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
  };

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await addToCart(item.product_id, newQuantity);
      const updatedCart = cartItems.map((ci) =>
        ci.product_id === item.product_id
          ? { ...ci, quantity: newQuantity }
          : ci
      );
      setCartItems(updatedCart);
      calculateTotal(updatedCart);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to update quantity",
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.productCard}>
      {item.product_image && (
        <Image
          source={{ uri: formatImageUrl(item.product_image) }} // ✅ apply here
          style={{
            width: "100%",
            height: 140,
            borderRadius: 10,
            marginBottom: 10,
          }}
          resizeMode="cover"
        />
      )}
      <Text style={styles.productName}>{item.product_name}</Text>
      <Text style={styles.productPrice}>
        Total: {item.quantity * item.price} pts
      </Text>

      <View style={styles.quantityRow}>
        <View style={styles.inlineQuantityControls}>
          <TouchableOpacity
            onPress={() => updateQuantity(item, -1)}
            style={styles.quantityButton}
          >
            <Ionicons name="remove" size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => updateQuantity(item, 1)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cart</Text>
      </View>

      {cartItems.length === 0 ? (
        <Text style={{ fontSize: 16, color: "#555" }}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />

          <View style={styles.summary}>
            <Text style={styles.total}>
              Total Points Required: {totalPoints}
            </Text>
            <Text style={styles.total}>
              Your Available Points: {userPoints}
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  (totalPoints > userPoints || checkingOut) && styles.disabledButton,
                ]}
                onPress={handleCheckout}
                disabled={totalPoints > userPoints}
              >
                <Text style={styles.checkoutText}>{checkingOut ? "Processing..." : "Checkout"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={confirmClearCart}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Toast />
      <BottomBar />
    </SafeAreaView>
  );
}
