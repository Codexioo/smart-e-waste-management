import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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
  userLevel: string;
  minLevel: string;
  image?: string;
  status?: string; // ✅ new prop
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

  
  const isLocked =
    userLevelIndex < minLevelIndex || stock === 0 || status === "Out of Stock";
  

  return (
    <Animatable.View
      animation={isLocked ? "fadeInUp" : "fadeIn"}
      duration={500}
      delay={50}
      style={styles.productCard}
    >
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 160, borderRadius: 10, marginBottom: 10 }}
          resizeMode="cover"
        />
      )}
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
          {stock === 0 || status === "Out of Stock"
  ? `Out of Stock 🚫`
  : `🔒 Requires Level "${minLevel}"`}

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
