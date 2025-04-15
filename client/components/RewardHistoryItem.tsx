import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/rewardsStyles";

type Props = {
  date: string;
  points: number;
  type: "credit" | "redeem";
};

export default function RewardHistoryItem({ date, points, type }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{date}</Text>
      <Text style={type === "credit" ? styles.credit : styles.redeem}>
        {type === "credit" ? "+" : "-"}{points} pts
      </Text>
    </View>
  );
}
