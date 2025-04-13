import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 6,
  },
  productPrice: {
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#FF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  removeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  summary: {
    backgroundColor: "#f0fff0",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  total: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 6,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#999",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 6,
  },
  clearText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
});

export default styles;
