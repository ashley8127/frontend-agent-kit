// GlassLens — Skia shader simulation of Liquid Glass (Route B).
// Source: research/2026-11-14/liquid-glass-research-20261114.md §3.
// How it fakes refraction: a Skia RuntimeEffect (SkSL) displacement shader
// samples the static background image with a UV offset that grows toward
// the lens rim (0 at the centre, max at the edge), plus a per-channel
// offset for chromatic aberration at the rim, plus edge darkening.
// Labels are drawn as React Native Text ABOVE the canvas (never distorted).
// The background content inside the lens is STATIC by construction — Skia
// cannot see the live React Native view tree; that is the core limit of
// this route (see README.md "Honest limits").
// Uses @shopify/react-native-skia 2.14.0 (v2, Included in Expo Go).
// Do NOT upgrade to v3 (react-native-skia) — v3 needs a dev build.
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import {
  Canvas,
  Image,
  ImageShader,
  LinearGradient,
  RoundedRect,
  Shader,
  Skia,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import { glass } from '../design/glass';

const LENS_SOURCE = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 center;
uniform vec2 size;
uniform float cornerRadius;
uniform float strength;
uniform float aberration;
uniform float rimBand;
uniform float edgeDarken;
uniform float edgeLift;

float roundedBoxSdf(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

half4 main(vec2 xy) {
  vec2 p = xy - center;
  float d = roundedBoxSdf(p, size * 0.5, cornerRadius);
  // 0 in the middle of the lens, 1 at the rim (rimBand px wide).
  float rim = clamp(1.0 + d / rimBand, 0.0, 1.0);
  float bend = smoothstep(0.0, 1.0, rim);
  vec2 dir = normalize(p + vec2(0.0001, 0.0));
  float s = bend * strength;
  half4 c;
  c.r = image.eval(xy - dir * s * (1.0 + aberration)).r;
  c.g = image.eval(xy - dir * s).g;
  c.b = image.eval(xy - dir * s * (1.0 - aberration)).b;
  c.a = 1.0;
  c.rgb *= 1.0 - edgeDarken * bend;
  c.rgb += vec3(edgeLift) * bend;
  return c;
}
`);

if (!LENS_SOURCE) {
  throw new Error("Couldn't compile the Liquid Glass lens shader");
}

export interface LensRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GlassLensProps {
  /** Canvas size in px (must match the Canvas style size). */
  width: number;
  height: number;
  /** Liquid (shader) lens rect. */
  lens: LensRect;
  /** Plain-tint comparison pill rect. */
  tint: LensRect;
}

export function GlassLens({ width, height, lens, tint }: GlassLensProps) {
  const image = useImage(require('../assets/images/background.png'));
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (alive) {
        setReduceTransparency(enabled);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!image) {
    return null;
  }

  const rect = { x: 0, y: 0, width, height };
  // Reduce Transparency on: kill the displacement, keep a plain tint lens.
  // (Real Liquid Glass does this at system level; the simulation must gate
  // itself — research §6.5.)
  const strength = reduceTransparency ? 0 : glass.strength;

  return (
    <Canvas style={{ width, height }}>
      <Image image={image} x={0} y={0} width={width} height={height} fit="cover" />

      {/* Liquid lens: displaced background + rim stroke + top sheen. */}
      <RoundedRect x={lens.x} y={lens.y} width={lens.width} height={lens.height} r={glass.cornerRadius}>
        <Shader
          source={LENS_SOURCE}
          uniforms={{
            center: vec(lens.x + lens.width / 2, lens.y + lens.height / 2),
            size: vec(lens.width, lens.height),
            cornerRadius: glass.cornerRadius,
            strength,
            aberration: glass.aberration,
            rimBand: glass.rimBand,
            edgeDarken: glass.edgeDarken,
            edgeLift: glass.edgeLift,
          }}
        >
          <ImageShader image={image} fit="cover" rect={rect} />
        </Shader>
      </RoundedRect>
      <RoundedRect
        x={lens.x}
        y={lens.y}
        width={lens.width}
        height={lens.height}
        r={glass.cornerRadius}
        style="stroke"
        strokeWidth={1.5}
        color={`rgba(255, 255, 255, ${glass.rimStrokeOpacity})`}
      />
      <RoundedRect x={lens.x} y={lens.y} width={lens.width} height={lens.height} r={glass.cornerRadius}>
        <LinearGradient
          start={vec(lens.x, lens.y)}
          end={vec(lens.x, lens.y + 64)}
          colors={[`rgba(255, 255, 255, ${glass.sheenOpacity})`, 'rgba(255, 255, 255, 0)']}
        />
      </RoundedRect>

      {/* Comparison pill: plain white tint, no shader — the fallback look. */}
      <RoundedRect
        x={tint.x}
        y={tint.y}
        width={tint.width}
        height={tint.height}
        r={tint.height / 2}
        color={`rgba(255, 255, 255, ${glass.tintOpacity})`}
      />
      <RoundedRect
        x={tint.x}
        y={tint.y}
        width={tint.width}
        height={tint.height}
        r={tint.height / 2}
        style="stroke"
        strokeWidth={1}
        color="rgba(255, 255, 255, 0.35)"
      />
    </Canvas>
  );
}
