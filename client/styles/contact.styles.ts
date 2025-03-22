import { StyleSheet } from "react-native";
import COLORS from "../constants/colors"; // Adjust the path if needed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    width:"100%",

  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,  // Adds vertical padding to increase space
    marginBottom: 16,  // Adds spacing between input fields
  },
  linkText: {
    fontSize: 16,
    color: COLORS.primary,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  
});

export default styles;
