import { StyleSheet } from "react-native";
import COLORS from "../constants/colors";  // Make sure COLORS is defined properly

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 25,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: "#374151",
  },
  rewardCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 16,
    marginBottom: 50,
    marginTop: 50,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
    marginBottom: 10,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  rewardGrowth: {
    color: "#00A52C",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  requestButton: {
    backgroundColor: "#00A52C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    
  },
  requestText: {
    color: "white",
    fontWeight: "600",
  },
  storeButton: {
    backgroundColor: "#00A52C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  downloadButton: {
    backgroundColor: "#00A52C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop:10,
  },
  storeText: {
    color: "white",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
    marginBottom: 20,
    marginTop: 20,
  },
  historySearch: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listSubtitle: {
    color: "#00A52C",
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50', // or change based on status if needed
  },
});

export default styles;
