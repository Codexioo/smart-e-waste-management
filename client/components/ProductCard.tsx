import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/shopStyles";
import * as Animatable from "react-native-animatable";

type Props = {
  name: string;
  description: string;
  price: number;
  stock: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  userLevel: number;
  minLevel: number;
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
}: Props) => {
  const isLocked = userLevel < minLevel;

  return (
    <Animatable.View
      animation={isLocked ? "fadeInUp" : "fadeIn"}
      duration={500}
      delay={50}
      style={styles.productCard}
    >
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productDesc}>{description}</Text>
      <Text style={styles.productPrice}>Price: {price} pts</Text>
      <Text style={styles.productStock}>Stock: {stock}</Text>

      {isLocked ? (
        <Animatable.Text
          animation="shake"
          easing="ease-in-out"
          iterationCount={1}
          style={{
            color: "red",
            fontWeight: "bold",
            marginTop: 6,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          🔒 Requires Level {minLevel}
        </Animatable.Text>
      ) : (
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
            <Ionicons name="remove" size={20} color="white" />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{quantity}</Text>

          <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );
};

export default ProductCard;
