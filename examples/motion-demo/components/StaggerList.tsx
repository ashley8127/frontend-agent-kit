// Pattern B — Entrance / stagger list (the demo's default pattern).
// Source: research/2026-11-14/skills-motion-template-20261114.md §4
// (Gesture report §4.2 + Reanimated report §4.1, same pattern, cross-checked).
// Presets: FadeInDown default { opacity: 0, translateY: 25 }, duration 300ms.
// This demo pins the initial values explicitly to the task spec:
// fade from opacity 0 + rise 24px (motion.entrance.translateY).
// Rule: builder does NOT invent presets — preset + .duration()/.delay()/
// .springify() only. Only transform + opacity are animated per frame.
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import { motion } from '../design/motion';

export type StaggerItem = { id: string; title: string; detail: string };

export function StaggerList({ items }: { items: StaggerItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <Animated.View
          key={item.id}
          layout={Layout.springify()}
          entering={FadeInDown.duration(motion.duration.base)
            .delay(Math.min(i * motion.stagger, motion.staggerCap))
            .withInitialValues({
              opacity: 0,
              transform: [{ translateY: motion.entrance.translateY }],
            })
            .springify()}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: '#17171F',
    borderColor: '#26262F',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  detail: { color: '#9C9CA8', fontSize: 14, marginTop: 4 },
});
