import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import COLORS from "@/constants/colors";

type Props = {
  name: string;
  description: string;
  price: number;
  stock: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  userLevel: string;
  minLevel: string;
  image?: string;
  status?: string;
};

const ProductCard = ({
  name,
  description,
  price,
  stock,
  quantity,
  onIncrease,
  onDecrease,
  userLevel,
  minLevel,
  image,
  status,
}: Props) => {
  
  const levelRank = [
    "Bronze I", "Bronze II",
    "Silver I", "Silver II",
    "Gold I", "Gold II",
    "Platinum I", "Platinum II",
    "Diamond", "Eco Legend"
  ];
  
  const userLevelIndex = Math.max(levelRank.indexOf(userLevel), 0);
  const minLevelIndex = Math.max(levelRank.indexOf(minLevel), 0);
  
  const isLocked = userLevelIndex < minLevelIndex;
  const isOutOfStock = stock === 0 || status === "Out of Stock";

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={COLORS.border} />
          </View>
        )}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={32} color={COLORS.white} />
            <Text style={styles.lockText}>Level {minLevel}</Text>
          </View>
        )}
        {isOutOfStock && !isLocked && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockOverlayText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{price} pts</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.stockInfo}>
            <Ionicons name="cube-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.stockText}>{stock} in stock</Text>
          </View>

          {!isLocked && !isOutOfStock && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={[styles.qtyBtn, quantity === 0 && styles.qtyBtnDisabled]} 
                onPress={onDecrease}
                disabled={quantity === 0}
              >
                <Ionicons name="remove" size={18} color={quantity === 0 ? COLORS.textMuted : COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity 
                style={[styles.qtyBtn, quantity >= stock && styles.qtyBtnDisabled]} 
                onPress={onIncrease}
                disabled={quantity >= stock}
              >
                <Ionicons name="add" size={18} color={quantity >= stock ? COLORS.textMuted : COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
          
          {isLocked && (
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color={COLORS.error} />
              <Text style={styles.lockedBadgeText}>Locked</Text>
            </View>
          )}

          {isOutOfStock && !isLocked && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Sold Out</Text>
            </View>
          )}
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.inputBackground,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: COLORS.white,
    fontWeight: "700",
    marginTop: 8,
    fontSize: 14,
  },
  stockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  stockOverlayText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 18,
    textTransform: "uppercase",
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  priceBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  qtyBtnDisabled: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  qtyValue: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.error + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockedBadgeText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "700",
  },
  outOfStockBadge: {
    backgroundColor: COLORS.textMuted + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ProductCard;
