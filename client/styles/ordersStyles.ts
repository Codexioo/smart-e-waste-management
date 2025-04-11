import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "green",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#f0fff0",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  date: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  product: {
    fontSize: 15,
    color: "#333",
  },
  quantity: {
    fontSize: 15,
    color: "#555",
  },
  totalPoints: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "right",
    marginTop: 8,
  },
  exportBtn: {
    marginBottom: 12,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  exportText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;
