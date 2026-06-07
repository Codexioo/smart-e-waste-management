import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  getCart,
  removeFromCart,
  clearCart as clearCartAPI,
  addToCart,
} from "../../services/cartService";
import { getRewards } from "../../services/rewardsService";
import { checkout } from "../../services/ordersService";
import { useRouter } from "expo-router";
import { formatImageUrl } from "../../utils/formatImage";
import COLORS from "@/constants/colors";

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
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearCartAPI();
            setCartItems([]);
            setTotalPoints(0);
            Toast.show({ type: "success", text1: "Cart cleared" });
            router.back();
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (totalPoints > userPoints) {
      Toast.show({
        type: "error",
        text1: "Insufficient Points",
        text2: `You need ${totalPoints - userPoints} more points.`,
      });
      return;
    }

    Alert.alert(
      "Confirm Checkout",
      `Spend ${totalPoints} points to place your order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: async () => {
            try {
              setCheckingOut(true);
              const res = await checkout(cartItems);
              if (res.success) {
                setCartItems([]);
                setTotalPoints(0);
                Toast.show({
                  type: "success",
                  text1: "Order Placed!",
                  text2: "Your items are on the way.",
                });
                router.push("/screens/orders");
              } else {
                Toast.show({
                  type: "error",
                  text1: "Checkout failed",
                  text2: res.message || "Something went wrong.",
                });
              }
            } catch {
              Toast.show({ type: "error", text1: "Network error" });
            } finally {
              setCheckingOut(false);
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
    } catch {
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cartItems.length > 0 ? (
            <TouchableOpacity onPress={confirmClearCart}>
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="shopping-cart" size={64} color={COLORS.border} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Looks like you haven't added anything yet.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push("/screens/shop")}>
              <Text style={styles.shopBtnText}>Go Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.product_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View style={styles.itemImageContainer}>
                    {item.product_image ? (
                      <Image
                        source={{ uri: formatImageUrl(item.product_image) }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="image" size={24} color={COLORS.border} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                      <TouchableOpacity onPress={() => handleRemove(item.product_id)}>
                        <Feather name="trash-2" size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.itemPrice}>{item.price} pts / unit</Text>
                    
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemTotal}>{item.price * item.quantity} pts</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQuantity(item, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Ionicons name="remove" size={16} color={item.quantity <= 1 ? COLORS.textMuted : COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, 1)}>
                          <Ionicons name="add" size={16} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.checkoutCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Required</Text>
                <Text style={styles.summaryValue}>{totalPoints} pts</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Your Balance</Text>
                <Text style={[styles.summaryValue, userPoints < totalPoints && { color: COLORS.error }]}>
                  {userPoints} pts
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  (totalPoints > userPoints || checkingOut) && styles.checkoutBtnDisabled,
                ]}
                onPress={handleCheckout}
                disabled={totalPoints > userPoints || checkingOut}
              >
                {checkingOut ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.checkoutBtnText}>Checkout Now</Text>
                    <Feather name="arrow-right" size={20} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>
              {userPoints < totalPoints && (
                <Text style={styles.warningText}>
                  You need {totalPoints - userPoints} more points to checkout.
                </Text>
              )}
            </View>
          </>
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 10,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearAllText: {
    color: COLORS.error,
    fontWeight: "700",
    fontSize: 14,
  },
  listContent: { paddingBottom: 20 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: COLORS.inputBackground,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%" },
  placeholderImage: { flex: 1, justifyContent: "center", alignItems: "center" },
  itemContent: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  itemPrice: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },
  itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTotal: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { paddingHorizontal: 10, fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  checkoutCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginHorizontal: -20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  summaryValue: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnDisabled: { opacity: 0.6, elevation: 0 },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  warningText: { color: COLORS.error, fontSize: 12, textAlign: "center", marginTop: 12, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 60 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: "center", marginBottom: 32 },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  shopBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
});
