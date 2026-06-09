
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 70,
    marginTop: 30
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: "#ccc",
  },
  username: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 13,
    color: "#666",
  },
  quoteBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  quoteText: {
    fontStyle: "italic",
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
  },
  levelBarBox: {
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#4CAF50",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  levelBarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e0dede",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 8,
  },
  progress: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#00A52C",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  detailValue: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    flexShrink: 1,
  },
});

export default styles;
