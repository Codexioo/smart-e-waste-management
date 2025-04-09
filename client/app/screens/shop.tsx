import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../../styles/shopStyles";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productsService";
import { Feather } from "@expo/vector-icons";

type Product = {
  product_id: number;
  product_name: string;
  product_desc: string;
  price: number;
  stock_quantity: number;
};

type CartItem = {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
};

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      if (res.success) {
        setProducts(res.products);
        setQuantities({});
      } else {
        Alert.alert("Failed to load products");
      }
    } catch {
      Alert.alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const updateQuantity = (productId: number, delta: number, stock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const updated = current + delta;
      if (updated <= 0) return { ...prev, [productId]: 0 };
      if (updated > stock) return prev;
      return { ...prev, [productId]: updated };
    });
  };

  const addToCart = async (product: Product) => {
    const quantity = quantities[product.product_id] || 0;
    if (quantity === 0) {
      Alert.alert("Please select a quantity first.");
      return;
    }

    try {
      const savedCart = await AsyncStorage.getItem("cart");
      let cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const existingItem = cart.find(
        (item) => item.product_id === product.product_id
      );
      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock_quantity) {
          Alert.alert("Cannot add more than available stock");
          return;
        }
        existingItem.quantity += quantity;
      } else {
        cart.push({
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          quantity,
        });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      Alert.alert(`Added ${quantity} item(s) to cart`);
      setQuantities((prev) => ({ ...prev, [product.product_id]: 0 }));
    } catch (err) {
      console.error(err);
      Alert.alert("Error adding to cart");
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      name={item.product_name}
      description={item.product_desc}
      price={item.price}
      stock={item.stock_quantity}
      quantity={quantities[item.product_id] || 0}
      onIncrease={() =>
        updateQuantity(item.product_id, 1, item.stock_quantity)
      }
      onDecrease={() =>
        updateQuantity(item.product_id, -1, item.stock_quantity)
      }
      onAddToCart={() => addToCart(item)}
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
        <Text style={styles.title}>Recycled Item Shop</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.storeButton}
            onPress={() => router.push("../screens/cart")}
          >
            <Feather name="shopping-cart" size={18} color="#fff" />
            <Text style={styles.actionText}>Cart</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
