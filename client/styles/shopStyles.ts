import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cartButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cartText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  filterButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 6,
  },
  filterButtonActive: {
    backgroundColor: "green",
  },
  filterText: {
    fontWeight: "600",
    color: "#333",
  },
  filterTextActive: {
    color: "#fff",
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
  },
  productDesc: {
    color: "#666",
    marginVertical: 4,
  },
  productPrice: {
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  productStock: {
    color: "#f44336",
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quantityButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
    color: "#333",
  },
});

export default styles;
