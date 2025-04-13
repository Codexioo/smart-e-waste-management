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
  totalPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  exportBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  exportText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
  credit: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 16,
  },
  redeem: {
    color: "#F44336",
    fontWeight: "700",
    fontSize: 16,
  },
  tabBarAlt: {
    flexDirection: "row",
    
    marginVertical: 12,
    flexWrap: "wrap",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#eee",
    margin: 5,
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },

  
});

export default styles;
