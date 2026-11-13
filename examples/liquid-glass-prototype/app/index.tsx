// Demo screen — Liquid Glass, Skia shader simulation (Route B).
// Source: research/2026-11-14/liquid-glass-research-20261114.md §3.
// One static screen: a colourful background, a shader "liquid" lens card,
// and a plain-tint pill for comparison. Labels sit ABOVE the canvas as
// React Native Text so they are never distorted by the shader.
// This is SIMULATED glass, not real Liquid Glass — see README.md.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassLens, type LensRect } from '../components/GlassLens';

export default function Index() {
  const [size, setSize] = useState({ width: 390, height: 700 });

  const lens: LensRect = {
    x: 24,
    y: Math.round(size.height * 0.26),
    width: size.width - 48,
    height: 220,
  };
  const tint: LensRect = {
    x: 24,
    y: lens.y + 244,
    width: size.width - 48,
    height: 84,
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.hero}>Liquid Glass — simulated</Text>
        <Text style={styles.sub}>
          Skia shader (Route B) on a static background. Real Liquid Glass is iOS 26+ only and
          invisible on Android — this is the fallback the demo phone can actually show.
        </Text>
      </View>

      <View
        style={styles.canvasWrap}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setSize({ width, height });
          }
        }}
      >
        <GlassLens width={size.width} height={size.height} lens={lens} tint={tint} />
        <View style={[styles.lensLabel, { top: lens.y + 20, left: lens.x + 20 }]}>
          <Text style={styles.lensTitle}>Liquid lens</Text>
          <Text style={styles.lensDetail}>Skia displacement + rim light</Text>
          <Text style={styles.lensDetail}>Background bends at the edges</Text>
        </View>
        <View style={[styles.tintLabel, { top: tint.y, left: tint.x, width: tint.width, height: tint.height }]}>
          <Text style={styles.tintText}>Plain tint — no shader (fallback look)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.foot}>SIMULATED — not Apple Liquid Glass. Static content only.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#0B0B0F', flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 64 },
  hero: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  sub: { color: '#C9C9D4', fontSize: 14, lineHeight: 20, marginTop: 8 },
  canvasWrap: { flex: 1, marginTop: 16, position: 'relative' },
  lensLabel: { position: 'absolute' },
  lensTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  lensDetail: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, marginTop: 4 },
  tintLabel: { alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  tintText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 12 },
  foot: { color: '#9C9CA8', fontSize: 12 },
});
