// Pattern F — Press feedback (scale + haptics, minimal).
// Source: research/2026-11-14/skills-motion-template-20261114.md §8
// (press-feedback pattern in RECIPES.md of skill animate-expo,
// Gesture report §1 #1, §3.1; Reanimated useSharedValue /
// useAnimatedStyle / withSpring API per Reanimated report §4.3).
// Haptics only on meaningful actions — never on every press.
// NOTE: `react-hooks/immutability` is disabled in this file on purpose.
// Reanimated SharedValues are mutated by design (`scale.value = ...`
// is the documented API); the React Compiler immutability rule does not
// apply to them. See template §8 — the assignments below are the recipe.
/* eslint-disable react-hooks/immutability */
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { motion } from '../design/motion';

export function PressableScale({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, motion.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.snappy);
      }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}
