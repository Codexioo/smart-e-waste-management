import { View, Text} from "react-native";
import { Link } from "expo-router";
import styles from "../../styles/contact.styles"
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";


export default function Contact() {
  return (
    <View style={styles.container}>
     {/* <Link href ={"/profile"}>Navigate to Profile Screen</Link>
     <Link href ={"/(auth)"}>Navigate to Login</Link>
     <Link href ={"/(auth)/signup"}>Navigate to Signup</Link> */}


      {/* About Us Section */}
      {/* <View style={styles.card}>
        <Text style={styles.title}>About Our Project</Text>
        <Text style={styles.label}>
          Our Smart E-Waste Management System is designed to promote responsible
          disposal of electronic waste. Users can request e-waste pickups, earn
          rewards for recycling, and track their contributions. Our platform
          connects individuals, businesses, and waste collectors to ensure a
          sustainable future through proper e-waste management.
        </Text>
      </View> */}

      {/* Contact Information */}
      <View style={styles.card}>
        <Text style={styles.title}>Contact Us</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <Text style={styles.label}>   +1 (123) 456-7890</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <Text style={styles.label}>   contact@ewaste.com</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color={COLORS.primary} />
          <Text style={styles.label}>   123 Green Street, Austin, TX, USA</Text>
        </View>
      </View>
    </View>
  );
}