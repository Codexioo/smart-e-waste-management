// styles/profile.styles.ts
import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../constants/colors";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topIllustration: {
    alignItems: "center",
    width: "100%",
  },
  illustrationImage: {
    width: width * 0.75,
    height: width * 0.75,
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
    marginTop: -24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center" as const
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center" as const,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.textPrimary,
    fontWeight: "500" as const,
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
  inputIcon: {
    marginRight: 14,  // Increases space between icon and input field
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.textDark,
    paddingLeft: 5,  // Adds slight padding for better spacing
  },
  eyeIcon: {
    padding:8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    marginRight: 5,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600" as const,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensures buttons are spaced evenly
    marginTop: 15,
  },
  button2: {
    flex: 1, // Each button takes equal space
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  
  editButton: {
    backgroundColor: COLORS.primary, // Customize Edit button color
    marginRight: 4, // Adds space between buttons
    height: 50, // Increased height to match the button style
    paddingHorizontal: 40,
  },
  
  deleteButton: {
    backgroundColor: "red", // Customize Delete button color
    marginLeft: 4, // Adds space between buttons
    height: 50, // Increased height to match the button style
    paddingHorizontal: 30,
  },
  logoutButton: {
    backgroundColor: "#8E8E93", // Customize Delete button color
    marginLeft: 4, // Adds space between buttons
    height: 50, // Increased height to match the button style
    paddingHorizontal: 3,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  addImageText: {
    color: COLORS.primary,
    textAlign: "center",
  },
  removeImageText: {
    color: "red",
    textAlign: "center",
  }
  
  
});

export default styles;
