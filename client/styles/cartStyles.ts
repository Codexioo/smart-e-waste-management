import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    color: "green",
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: { fontWeight: "bold", fontSize: 16, color: "#333" },
  info: { color: "#555" },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  quantityButton: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 6,
  },
  quantityText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#FF4444",
    padding: 8,
    borderRadius: 6,
  },
  removeText: {
    color: "white",
    fontWeight: "bold",
  },
  summary: { marginVertical: 12 },
  total: { fontSize: 16, fontWeight: "bold", color: "#333" },
  checkoutButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  checkoutText: { color: "white", fontWeight: "bold" },
  disabledButton: { backgroundColor: "#aaa" },

  qtyButton: {
    backgroundColor: "#444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  
  qtyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
    color: "#000",
  },
  
});

export default styles;
