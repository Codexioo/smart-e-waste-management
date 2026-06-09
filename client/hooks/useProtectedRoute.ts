import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const useProtectedRoute = () => {
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Redirect to login if token is missing
        router.replace("/(auth)");
      }
    };

    verifyToken();
  }, []);
};

export default useProtectedRoute;
