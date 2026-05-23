import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';
import './global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Modals */}
          <Stack.Screen name="trip/create" options={{ presentation: 'modal' }} />
          <Stack.Screen name="trip/join"   options={{ presentation: 'modal' }} />
          {/* Full-screen stacks */}
          <Stack.Screen name="trip/[id]"   options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="trip/report" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="activity/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="profile/setup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="profile/qr"    options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="profile/history" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/index"    options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/language" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/password" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/currency"   options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/location"   options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/dateformat" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
