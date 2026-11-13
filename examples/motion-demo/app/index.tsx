// Demo screen — motion template Pattern B (entrance stagger) + Pattern F
// (press feedback), applied exactly per the recipe in
// research/2026-11-14/skills-motion-template-20261114.md §1, §4, §8.
// Entrance: 8 cards, fade from opacity 0 + rise 24px, 300ms, 60ms stagger
// capped at 360ms total. Hero title: FadeInUp 400ms.
// Only transform + opacity animate per frame; everything runs on the UI
// thread via Reanimated worklets (no core RN Animated).
import { useState } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StaggerList, type StaggerItem } from '../components/StaggerList';
import { PressableScale } from '../components/PressableScale';
import { motion } from '../design/motion';

const ITEMS: StaggerItem[] = [
  { id: '1', title: 'Reanimated 4.7.1', detail: 'GO — UI-thread worklets, New Architecture' },
  { id: '2', title: 'Gesture Handler 3.3.0', detail: 'GO — pan, swipe, velocity handoff' },
  { id: '3', title: 'expo-animation / animate-expo', detail: 'GO — skills, not runtime deps' },
  { id: '4', title: 'Skia v2.14.0', detail: 'CONDITIONAL — dev-build test pending' },
  { id: '5', title: 'Lottie 7.5.0', detail: 'CONDITIONAL — dev build only, never Expo Go' },
  { id: '6', title: 'Moti', detail: 'NO-GO — presets above do everything it did' },
  { id: '7', title: 'React Three Fiber', detail: 'NO-GO — out of scope for the demo' },
  { id: '8', title: 'Skia v3', detail: 'NO-GO — needs dev build + Vulkan / API 26+' },
];

export default function Index() {
  const [pressed, setPressed] = useState<string | null>(null);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInUp.duration(motion.duration.slow)}>
        <Text style={styles.hero}>Motion demo</Text>
        <Text style={styles.sub}>
          Reanimated entrance — fade 0 + rise 24px, 60ms stagger, cap 360ms.
        </Text>
      </Animated.View>
      <View style={styles.listWrap}>
        <StaggerList items={ITEMS} />
      </View>
      <PressableScale onPress={() => setPressed('Pressed — scale 0.96 + light haptics')}>
        <View style={styles.pressCard}>
          <Text style={styles.pressText}>{pressed ?? 'Press me — scale + haptics'}</Text>
        </View>
      </PressableScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#0B0B0F', flex: 1 },
  content: { padding: 20, paddingTop: 64 },
  hero: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  sub: { color: '#9C9CA8', fontSize: 15, marginTop: 8 },
  listWrap: { marginTop: 24 },
  pressCard: {
    alignItems: 'center',
    backgroundColor: '#2B6CB0',
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
  },
  pressText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
