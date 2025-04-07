import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/shopStyles";

type Props = {
  name: string;
  description: string;
  price: number;
  stock: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddToCart: () => void;
};

const ProductCard = ({
  name,
  description,
  price,
  stock,
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
}: Props) => {
  return (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productDesc}>{description}</Text>
      <Text style={styles.productPrice}>Price: {price} pts</Text>
      <Text style={styles.productStock}>Stock: {stock}</Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
          <Ionicons name="remove" size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{quantity}</Text>

        <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, quantity === 0 && styles.disabledButton]}
        onPress={onAddToCart}
        disabled={quantity === 0}
      >
        <Text style={styles.addButtonText}>Add to Cart ({quantity})</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;
