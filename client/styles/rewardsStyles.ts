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
  totalPoints: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
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
  card: {
    backgroundColor: "#f0fff0",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
  },
  date: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  credit: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
  },
  redeem: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  // ✅ New styles for tab buttons
  tabBarAlt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
  activeTab: {
    backgroundColor: "green",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
});

export default styles;
