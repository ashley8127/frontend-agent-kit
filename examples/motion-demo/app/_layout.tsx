// Pattern A — Screen transition (do FIRST, 0 risk).
// Source: research/2026-11-14/skills-motion-template-20261114.md §3
// (Gesture report §4.1, Expo Router docs + skill animate-expo).
// Rule: screen → screen uses native stack options, never hand-rolled.
// iOS keeps platform default (push 350ms); Android slide_from_right.
// contentStyle background prevents the white flash between screens.
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0B0F' },
          freezeOnBlur: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </GestureHandlerRootView>
  );
}
