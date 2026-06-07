import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productsService";
import { getRewards } from "../../services/rewardsService";
import { addToCart as apiAddToCart } from "../../services/cartService";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import { formatImageUrl } from "../../utils/formatImage";
import COLORS from "@/constants/colors";

const { width } = Dimensions.get("window");

type Product = {
  product_id: number;
  product_name: string;
  product_desc: string;
  product_image?: string;
  price: number;
  stock_quantity: number;
  status: string;
  min_level_required: string;
};

type SortOption = "priceLow" | "priceHigh" | "level" | "stock";

const levelRank = [
  "Bronze I", "Bronze II",
  "Silver I", "Silver II",
  "Gold I", "Gold II",
  "Platinum I", "Platinum II",
  "Diamond", "Eco Legend"
];

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>("Bronze I");

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
    .filter((p) => p.status !== "Not Available")
    .filter((p) => (quantities[p.product_id] || 0) > 0)
    .map((p) => ({
      product_id: p.product_id,
      quantity: quantities[p.product_id],
      product_name: p.product_name,
      price: p.price,
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
    .filter((p) => p.status !== "Not Available")
    .filter((p) => {
      const nameMatch = p.product_name.toLowerCase().includes(search.toLowerCase());
      const isLocked = levelRank.indexOf(userLevel) < levelRank.indexOf(p.min_level_required);
      if (!nameMatch) return false;
      if (filter === "locked") return isLocked;
      if (filter === "unlocked") return !isLocked;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case "priceLow": return a.price - b.price;
        case "priceHigh": return b.price - a.price;
        case "stock": return b.stock_quantity - a.stock_quantity;
        case "level": return levelRank.indexOf(a.min_level_required) - levelRank.indexOf(b.min_level_required);
        default: return 0;
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
      image={formatImageUrl(item.product_image)}
      status={item.status}
    />
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
          <View style={styles.headerText}>
            <Text style={styles.title}>Eco Store</Text>
            <Text style={styles.subtitle}>Redeem points for products</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/screens/cart")}
          >
            <Feather name="shopping-cart" size={20} color={COLORS.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {["all", "unlocked", "locked"].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setFilter(opt as any)}
                style={[styles.filterChip, filter === opt && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, filter === opt && styles.filterChipTextActive]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
            {[
              { key: "priceLow", label: "Price ↑" },
              { key: "priceHigh", label: "Price ↓" },
              { key: "stock", label: "Stock" },
              { key: "level", label: "Level" },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSort(option.key as SortOption)}
                style={[styles.filterChip, sort === option.key && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, sort === option.key && styles.filterChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredSortedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No products found matching your criteria.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSortedProducts}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {selectedItems.length > 0 && (
        <View style={styles.previewBar}>
          <View style={styles.previewInfo}>
            <Text style={styles.previewCount}>{selectedItems.length} items selected</Text>
            <Text style={styles.previewTotal}>
              Total: {selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)} pts
            </Text>
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity onPress={() => setQuantities({})} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBatchAddToCart} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterScroll: {
    alignItems: "center",
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontSize: 15,
  },
  previewBar: {
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  previewCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  previewTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
  },
  clearBtnText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  addBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
