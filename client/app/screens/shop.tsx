import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../../styles/shopStyles";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productsService";
import { getRewards } from "../../services/rewardsService";
import { addToCart as apiAddToCart } from "../../services/cartService";
import Toast from "react-native-toast-message";
import BottomBar from "../../components/bottombar";
import { Feather } from "@expo/vector-icons";

type Product = {
  product_id: number;
  product_name: string;
  product_desc: string;
  price: number;
  stock_quantity: number;
  min_level_required: number;
};

type SortOption = "priceLow" | "priceHigh" | "level" | "stock";

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "locked" | "unlocked">("all");
  const [sort, setSort] = useState<SortOption>("priceLow");
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

      const rewardRes = await getRewards();
      if (rewardRes.success) {
        setUserLevel(rewardRes.level);
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

  const selectedItems = products
    .filter((p) => userLevel >= p.min_level_required)
    .filter((p) => quantities[p.product_id] > 0)
    .map((p) => ({
      product_id: p.product_id,
      quantity: quantities[p.product_id],
      product_name: p.product_name,
    }));

  const handleBatchAddToCart = async () => {
    if (selectedItems.length === 0) return Alert.alert("Nothing selected");

    try {
      for (const item of selectedItems) {
        await apiAddToCart(item.product_id, item.quantity);
      }

      Toast.show({
        type: "success",
        text1: `✅ Added ${selectedItems.length} item(s) to cart`,
      });

      setQuantities({});
    } catch (err) {
      Alert.alert("Failed to add to cart");
    }
  };

  const filteredSortedProducts = products
    .filter((p) => {
      const nameMatch = p.product_name.toLowerCase().includes(search.toLowerCase());
      const isLocked = userLevel < p.min_level_required;

      if (!nameMatch) return false;
      if (filter === "locked") return isLocked;
      if (filter === "unlocked") return !isLocked;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case "priceLow":
          return a.price - b.price;
        case "priceHigh":
          return b.price - a.price;
        case "stock":
          return b.stock_quantity - a.stock_quantity;
        case "level":
          return a.min_level_required - b.min_level_required;
        default:
          return 0;
      }
    });

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      name={item.product_name}
      description={item.product_desc}
      price={item.price}
      stock={item.stock_quantity}
      quantity={quantities[item.product_id] || 0}
      onIncrease={() => updateQuantity(item.product_id, 1, item.stock_quantity)}
      onDecrease={() => updateQuantity(item.product_id, -1, item.stock_quantity)}
      userLevel={userLevel}
      minLevel={item.min_level_required}
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
        {/* Header Row */}
        <View style={styles.actionsContainer}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#333" }}>
            Shop
          </Text>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/screens/cart")}>
            <Feather name="shopping-cart" size={18} color="#fff" />
            <Text style={styles.cartText}>Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search by name"
          value={search}
          onChangeText={setSearch}
          style={styles.searchBox}
        />

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {["all", "unlocked", "locked"].map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setFilter(opt as any)}
              style={[
                styles.filterButton,
                filter === opt && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === opt && styles.filterTextActive,
                ]}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort Buttons */}
        <View style={styles.filterRow}>
          {[
            { key: "priceLow", label: "Price ↑" },
            { key: "priceHigh", label: "Price ↓" },
            { key: "stock", label: "Stock" },
            { key: "level", label: "Level" },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSort(option.key as SortOption)}
              style={[
                styles.filterButton,
                sort === option.key && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  sort === option.key && styles.filterTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product List */}
        {filteredSortedProducts.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No products found.</Text>
        ) : (
          <FlatList
            data={filteredSortedProducts}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 160 }}
          />
        )}
      </View>

      {/* Selected Items Preview Bar */}
      {selectedItems.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 60,
            left: 20,
            right: 20,
            backgroundColor: "#f0fff0",
            borderRadius: 12,
            padding: 14,
            elevation: 4,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Selected Items:</Text>
          {selectedItems.map((item) => (
            <Text key={item.product_id}>
              • {item.product_name} x {item.quantity}
            </Text>
          ))}
          <Text style={{ fontWeight: "bold", marginTop: 6 }}>
            Total Points:{" "}
            {selectedItems.reduce(
              (sum, item) =>
                sum +
                (products.find((p) => p.product_id === item.product_id)?.price || 0) *
                  item.quantity,
              0
            )}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <TouchableOpacity
              onPress={handleBatchAddToCart}
              style={{
                flex: 1,
                marginRight: 6,
                backgroundColor: "green",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setQuantities({})}
              style={{
                flex: 1,
                marginLeft: 6,
                backgroundColor: "#999",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Toast />
      <BottomBar />
    </SafeAreaView>
  );
}
