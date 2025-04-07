import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "green",
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: "#f0fff0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  date: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  product: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantity: {
    color: "#555",
  },
  totalPoints: {
    color: "red",
    fontWeight: "bold",
    marginTop: 6,
    textAlign: "right",
  },
});

export default styles;
