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
  productCard: {
    backgroundColor: "#f0fff0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  productDesc: {
    color: "#666",
    marginVertical: 4,
  },
  productPrice: {
    fontWeight: "bold",
    color: "green",
    marginBottom: 4,
  },
  productStock: {
    color: "red",
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quantityButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "white",
  },
  addButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});

export default styles;
