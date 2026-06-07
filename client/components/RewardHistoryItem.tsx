import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import COLORS from "@/constants/colors";

type Props = {
  date: string;
  points: number;
  type: "credit" | "redeem";
  source?: string;
};

export default function RewardHistoryItem({ date, points, type, source }: Props) {
  const isCredit = type === "credit";

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, isCredit ? styles.creditIcon : styles.redeemIcon]}>
        <Feather 
          name={isCredit ? "plus-circle" : "minus-circle"} 
          size={20} 
          color={isCredit ? COLORS.success : COLORS.error} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.source} numberOfLines={1}>{source || (isCredit ? "Points Earned" : "Points Redeemed")}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={[styles.points, isCredit ? styles.creditText : styles.redeemText]}>
        {isCredit ? "+" : "-"}{points}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  creditIcon: {
    backgroundColor: COLORS.success + "15",
  },
  redeemIcon: {
    backgroundColor: COLORS.error + "15",
  },
  content: {
    flex: 1,
  },
  source: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  points: {
    fontSize: 16,
    fontWeight: "800",
  },
  creditText: {
    color: COLORS.success,
  },
  redeemText: {
    color: COLORS.error,
  },
});
