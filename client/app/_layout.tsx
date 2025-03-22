import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main Tab Navigation */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Request and Thank You Screens Should be Inside Stack */}
      <Stack.Screen name="screens/request" options={{ headerShown: false }} />
      <Stack.Screen name="screens/thankyou" options={{ headerShown: false }} />
    </Stack>
  );
}
