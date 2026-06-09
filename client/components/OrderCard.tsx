import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { formatImageUrl } from "../utils/formatImage";
import COLORS from "@/constants/colors";
import { Feather } from "@expo/vector-icons";

type OrderItem = {
  product_name: string;
  quantity: number;
  product_image?: string;
};

type Props = {
  date: string;
  totalPoints: number;
  items: OrderItem[];
  invoiceNumber?: string; 
};

export default function OrderCard({ date, totalPoints, items, invoiceNumber }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{date}</Text>
          {invoiceNumber && (
            <Text style={styles.invoice}>#{invoiceNumber}</Text>
          )}
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{totalPoints} pts</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={[styles.itemRow, index === items.length - 1 && styles.noBorder]}>
            <View style={styles.itemImageContainer}>
              {item.product_image ? (
                <Image
                  source={{ uri: formatImageUrl(item.product_image) }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Feather name="package" size={20} color={COLORS.border} />
                </View>
              )}
            </View>
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
              <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  date: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  invoice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pointsText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  itemsList: {},
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
