import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  exportBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  exportText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  clearBtn: {
    backgroundColor: "#999",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  clearText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  filterButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  filterText: {
    fontWeight: "600",
    color: "#333",
  },
  filterInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  date: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  product: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  quantity: {
    fontSize: 15,
    color: "#555",
  },
  totalPoints: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "right",
    marginTop: 8,
  },
});

export default styles;
