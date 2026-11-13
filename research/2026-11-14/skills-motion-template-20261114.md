# Skill / Template: Motion cho demo Codex 14/11/2026 (Expo SDK 58)

- **Trạng thái:** ĐỀ XUẤT để team quyết — **KHÔNG tự tích hợp vào kit.** Không file repo nào bị sửa bởi file này. Team chốt rồi mới: copy token file + snippet vào đúng vị trí (§9), chạy `npx expo install`, test trên máy thật.
- **Tổng hợp từ:** 3 báo cáo motion 14/11/2026 (Reanimated+Moti, Lottie+Skia+R3F, Gesture+Transition) + đối chiếu 2 báo cáo 13/11/2026. Council synthesis đầy đủ (verdict, mâu thuẫn, thứ tự build day, checklist test máy thật): `motion-council-synthesis-20261114.md`.
- **Stack motion duy nhất cho demo:** Reanimated 4.7.1 + worklets 0.13.1 + Gesture Handler ~3.3.0 + Expo Router native-stack. Mọi pattern dưới đây chỉ dùng 4 thứ này (+ `expo-haptics`, `expo-blur`, `expo-linear-gradient` đã có trong mobile-kit allowed stack).
- **Quy tắc vàng (cả 3 báo cáo đồng thuận):** chỉ animate `transform` + `opacity` mỗi frame — không animate `width/height/top/left`. Mọi motion chính chạy trên UI thread (worklets), không dùng core `Animated` của RN. "Feel" chỉ được tính trên **release build, máy thật, máy yếu nhất** — không tính simulator/dev mode.
- **Mức độ kiểm chứng của snippet:** mọi snippet dưới đây viết theo docs đã đọc trong 3 báo cáo, **CHƯA CHẠY THẬT** trong repo này — builder phải chạy thử trên máy thật trước khi đưa vào demo. Mỗi snippet ghi nguồn gốc của nó.
- **Giới hạn đã biết:** file Lottie+Skia+R3F nhận được bị cắt cụt ở cuối §5 — snippet Lottie §7.1 và Skia §7.2 mà file đó viện dẫn **không có trong file**, nên template này **không có code Skia Canvas và không có code LottieView đầy đủ**. Đừng coi sự vắng mặt đó là "không cần code" — đó là gap cần người bổ sung sau khi đọc docs Skia/Lottie trực tiếp, hoặc cắt luôn 2 hiệu ứng đó.

---

## 1. Motion tokens — 1 bộ duy nhất, lock ở taste-lock

Hai báo cáo đưa 2 bộ số spring khác nhau nhưng không mâu thuẫn thực chất (xem council §C7): bộ Reanimated là **default ẩn của preset** (nhận được khi gọi `.springify()` không tham số: `damping 120 / mass 4 / stiffness 900`), bộ dưới đây là **giá trị explicit team lock vào token file**. Muốn đồng nhất cảm giác toàn app thì luôn truyền token — đừng trộn preset trần với token trong cùng 1 màn.

```ts
// design/motion.ts — 4 số duy nhất designer cần chốt trong Figma
// (Báo cáo Gesture đề xuất đường dẫn design/motion.ts; báo cáo Reanimated đề xuất
// templates/motion.ts. Team chốt 1 chỗ duy nhất trước khi copy — đừng để 2 file token.)
// Nguồn số: báo cáo Gesture §2 + §4.5 (skill animate-expo); duration base 300ms trùng
// với preset default của Reanimated (báo cáo Reanimated §3, §5).
export const motion = {
  duration: {
    instant: 100, // press
    fast: 200,    // micro-interaction
    base: 300,    // sheet / modal / toast / entrance — "Mobile UI animations stay under 300ms"
    slow: 400,    // chỉ cho hero / entrance lớn
  },
  stagger: 60,       // ms / item
  staggerCap: 360,   // ms tổng — item thứ 7 trở đi cùng delay 360ms, list dài không cascade mãi
  spring: {
    default: { damping: 20, stiffness: 300 }, // sheet / card
    snappy: { damping: 26, stiffness: 500 },  // press / toggle
  },
  entrance: { translateY: 12, scaleFrom: 0.96 },
  // Spring default ẨN của Reanimated (khi gọi .springify() không truyền gì):
  // damping 120 / mass 4 / stiffness 900 — khác với token trên, xem ghi chú đầu §1.
  // Screen transition: giữ platform default (iOS push 350ms), đừng override.
} as const;
```

**Figma → motion (giới hạn đã kiểm chứng):** Figma KHÔNG export được motion sang React Native. Figma chỉ quyết được 4 số token (duration / easing curve / stagger delay / khoảng translate-scale). Designer chốt 4 số trong Figma → dev map 1-1 sang file token trên → đổi token là đổi motion toàn app, không sửa từng component. Không có tool free nào auto-sync Figma Variables → Reanimated tokens (Variables REST API là Enterprise-only; user chỉ có Figma Education, seat type chưa rõ) — đừng hứa auto-sync cho ngày mai.

**Reduced motion (ship cùng animation, không làm sau):** dùng `useReducedMotion()` — giữ opacity/color, bỏ translate/scale/parallax/overshoot; screen transition về `animation: 'fade'`. (Theo skill `animate-expo`, báo cáo Gesture §2.)

---

## 2. Cài đặt — 1 lệnh duy nhất, rồi kiểm tra

```bash
# SDK 58 — để Expo resolve đúng pin, KHÔNG npm install latest tay.
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics
npx expo-doctor@latest   # kiểm tra version khớp SDK 58 sau khi cài
```

Version kỳ vọng (Expo docs SDK 58, đã kiểm chứng): Reanimated **4.7.1**, worklets **0.13.x** (npm latest 0.13.1), Gesture Handler **~3.3.0**. Nếu app demo vẫn ở **SDK 57**, mọi số trên vô hiệu — dùng `npx expo install --fix` để resolve lại (SDK 57: Reanimated 4.3–4.5, worklets 0.8–0.10, RNGH 2.32).

**3 bẫy cài đặt — kiểm tra trước khi code:**

| # | Bẫy | Cách tránh |
|---|---|---|
| 1 | **Babel plugin cũ** — Reanimated 4 tách worklets sang `react-native-worklets`; nếu `babel.config.js` còn `react-native-reanimated/plugin` thì worklet **chết lặng, không được transform** (báo cáo Gesture R1). | Mở `babel.config.js`: có plugin cũ → đổi thành `react-native-worklets/plugin`. Chỉ dùng `babel-preset-expo` và không có plugin cũ → để yên (preset tự config). |
| 2 | **Noxcturnal** — transformer thử nghiệm của SDK 58 skip các file cần Reanimated/Worklets Babel transform (Expo changelog SDK 58). | Đừng bật `experiments.noxcturnalTransformWorker` khi dùng Reanimated. |
| 3 | **New Architecture bắt buộc** — Reanimated 4 không chạy Paper renderer; Reanimated 3 đã ngừng maintain tích cực. | SDK 58 mặc định New Arch — xác nhận bằng `global.RN$Bridgeless === true`, không giả định. |

---

## 3. Pattern A — Screen transition (làm ĐẦU TIÊN, 0 rủi ro)

**Quy tắc chọn tool (skill `animate-expo`, đã kiểm chứng qua 2 nguồn):** screen → screen dùng native stack options, **never hand-roll**. Tab switch dùng `animation: 'none'` (tab là peer, không phải hierarchy; slide giữa các tab là sai cảm giác).

```tsx
// app/_layout.tsx
// Nguồn: báo cáo Gesture §4.1 (theo docs Expo Router + skill animate-expo). CHƯA CHẠY THẬT.
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Reanimated 4: babel plugin phải là 'react-native-worklets/plugin' (xem §2, bẫy 1).

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0B0F' }, // màu nền theme — chống flash trắng
          freezeOnBlur: true, // best practice perf 2026 cho stack
          // iOS: giữ platform default (push 350ms). Android: slide_from_right.
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="detail/[id]" options={{ animation: 'slide_from_right' }} />
        {/* Sheet là một screen — native UISheetPresentationController, không tự vẽ */}
        <Stack.Screen
          name="sheet"
          options={{ presentation: 'formSheet', animation: 'slide_from_bottom' }}
        />
        {/* Modal trong suốt (blur / shared-element detail) */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
// Tab: trong app/(tabs)/_layout.tsx — tab switch KHÔNG slide:
// <Tabs screenOptions={{ animation: 'none' }} />
// Hoặc NativeTabs từ 'expo-router/unstable-native-tabs' — tên đã nói lên tính chất,
// CHƯA VERIFY trên máy thật; formSheet trên Android hành vi ra sao cũng CHƯA VERIFY.
```

**Khi nào dùng cái gì:**

| Tình huống | Tool |
|---|---|
| Screen → screen | Native stack options trong Expo Router. Không tự viết |
| Sheet là một screen | `presentation: 'formSheet'` |
| Sheet trong screen (không phải route) | `@gorhom/bottom-sheet` (xem §6) |
| Tab bar | `NativeTabs` (test trước) |
| Tab switch | `animation: 'none'` |
| Header collapse | `headerLargeTitleEnabled` (native stack, iOS) — không viết scroll worklet cho việc này |
| Context menu / press-and-hold preview | `Link.Menu` / `Link.Preview` (iOS-only), đừng tự build bằng JS |

---

## 4. Pattern B — Entrance / stagger list (pattern mặc định của demo)

```tsx
// components/StaggerList.tsx
// Nguồn: báo cáo Gesture §4.2 + báo cáo Reanimated §4.1 (cùng 1 pattern, đã đối chiếu).
// Presets: FadeInDown mặc định { opacity: 0, translateY: 25 }, duration mặc định 300ms.
// Quy tắc kit: builder KHÔNG tự chế preset — chỉ dùng preset + .duration()/.delay()/.springify().
// CHƯA CHẠY THẬT — chạy thử trên máy thật trước khi đưa vào demo.
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { motion } from '../design/motion'; // hoặc templates/motion — team chốt 1 chỗ (xem §1)

export function StaggerList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <>
      {items.map((item, i) => (
        <Animated.View
          key={item.id}
          layout={Layout.springify()} // reorder tự mượt khi thêm/xóa
          entering={FadeInDown.duration(motion.duration.base)
            .delay(Math.min(i * motion.stagger, motion.staggerCap))
            .springify()}
          exiting={FadeOut.duration(200)}
        >
          {/* <Card title={item.title} /> — màu/spacing lấy từ theme, KHÔNG hardcode */}
        </Animated.View>
      ))}
    </>
  );
}
```

**Biến thể nhanh (cùng 1 pattern, đổi preset là xong — không cần lib khác):**
- Hero/title: `FadeInUp.duration(400)` / `ZoomIn.duration(350).springify()`
- Modal/sheet vào: `SlideInDown` / `FadeIn`
- List reorder khi thêm/xóa: thêm `layout={LinearTransition}` (các layout transition có sẵn: `LinearTransition`, `SequencedTransition`, `FadingTransition`, `JumpingTransition`, `CurvedTransition`, `EntryExitTransition` — Reanimated docs).
- **Quy tắc stagger:** delay 50–80ms/item (token: 60ms), cap tổng ≤400ms; chỉ stagger 6–8 item đầu, item sau vào cùng lúc; entrance = opacity + translateY(12px) + scale(0.96→1) kết hợp; duration 250–300ms. (Báo cáo Reanimated cap ở item thứ 5; báo cáo Gesture cap tổng 360ms — template dùng cap tổng 360ms của báo cáo Gesture vì nó bao được cả 2 cách tính.)

**Không dùng Moti cho pattern này.** Moti 0.30.0 là NO-GO (commit cuối 11/03/2025, npm từ 29/01/2025, README target Reanimated 3 — xem council C5). Mọi thứ Moti làm, preset trên làm được.

---

## 5. Pattern C — Gesture: Pan + swipe-to-dismiss (1 gesture hero)

```tsx
// components/SwipeableCard.tsx
// Nguồn: báo cáo Reanimated §4.3 (theo docs Reanimated + Gesture Handler). CHƯA CHẠY THẬT.
// Chỉ animate transform + opacity. Không animate width/height/top/left mỗi frame.
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function SwipeableCard({ onDismiss }: { onDismiss: () => void }) {
  const translateX = useSharedValue(0);
  const pan = Gesture.Pan()
    .onUpdate((e) => { translateX.value = e.translationX; })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 120) {
        translateX.value = withSpring(e.translationX > 0 ? 400 : -400, {}, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{/* card */}</Animated.View>
    </GestureDetector>
  );
}
```

**Ngưỡng dismiss — 2 cách nói trong báo cáo, team chọn 1 và ghi vào token:**
- Báo cáo Reanimated: ngưỡng tuyệt đối **120px** (snippet trên).
- Báo cáo Gesture: `SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35`, velocity quyết định fling vs spring-back (`withSpring` khi thả).
- Khuyến nghị template: dùng **35% chiều rộng màn hình** cho card rộng (tỉ lệ theo máy), 120px cho card hẹp — đừng hardcode 1 số cho mọi kích thước card.

**Quy tắc gesture (skill `animate-expo`):** ngón tay đang đặt trên element — interruptibility + velocity handoff là baseline, không phải polish. Một gesture owner duy nhất mỗi vùng màn hình (kéo sheet thì tắt `gestureEnabled` của router ở vùng đó, tránh router back xung đột). Haptics từ gesture worklet phải hop sang JS thread bằng `scheduleOnRN` (Reanimated 4 chuyển thread-hopping sang `react-native-worklets`) — **CHƯA VERIFY bằng chạy thật**, test khi gắn haptics.

---

## 6. Pattern D — Bottom sheet (formSheet trước, Gorhom chỉ khi cần)

**Thứ tự:** route sheet → `presentation: 'formSheet'` (§3, 0 dep). Chỉ thêm Gorhom khi cần snap point giữa hoặc sheet trong screen (không phải route).

```tsx
// components/DemoSheet.tsx — Gorhom, CHỈ dùng khi formSheet không đủ
// Nguồn: báo cáo Gesture §4.4. CHƯA CHẠY THẬT trên Reanimated 4 + SDK 58.
// Cài: npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
import { useCallback, useRef } from 'react';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';

export function DemoSheet() {
  const ref = useRef<BottomSheet>(null);
  const onChange = useCallback((index: number) => { /* index -1 = đóng */ }, []);
  return (
    <BottomSheet
      ref={ref}
      index={-1} // bắt đầu đóng; mở bằng ref.current?.expand() / snapToIndex(1)
      snapPoints={['25%', '50%', '90%']}
      enablePanDownToClose
      enableContentPanningGesture
      onChange={onChange}
    >
      <BottomSheetView>
        {/* nội dung tĩnh; list cuộn được thì dùng BottomSheetFlatList, KHÔNG dùng FlatList thường */}
      </BottomSheetView>
    </BottomSheet>
  );
}
```

**Rủi ro Gorhom (đã kiểm chứng):** bus factor 1, 0 commit trong 90 ngày, last commit 182 ngày trước, v5.2.14. Docs ghi Reanimated 3 — tương thích Reanimated 4 **CHƯA VERIFY**. Bọc sau wrapper của kit để đổi lib không đau. Gorhom fail test → quay về formSheet, không debug quá 30 phút trong build day.

---

## 7. Pattern E — Skeleton / loading (pulse Reanimated, KHÔNG Moti)

Moti Skeleton (`<Skeleton.Group>` + `<Skeleton>`, cần `expo-linear-gradient`) là NO-GO cùng Moti. Fallback đã nêu trong báo cáo Gesture §4.3: pulse bằng `withRepeat(withTiming(...))`, viết ~10 dòng, không thêm dep.

```tsx
// components/PulseSkeleton.tsx
// Nguồn: ý tưởng fallback trong báo cáo Gesture §4.3 ("Animated.View opacity pulse bằng
// withRepeat(withTiming(...))"); code viết theo API Reanimated đã kiểm chứng trong báo cáo
// Reanimated §4.3 (useSharedValue / useAnimatedStyle / withTiming). CHƯA CHẠY THẬT.
import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
} from 'react-native-reanimated';

export function PulseSkeleton() {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style}>{/* khối skeleton: màu nền theme, bo góc theo token */}</Animated.View>;
}
```

**Quy tắc skeleton:** skeleton là placeholder hình khối theo đúng layout màn hình thật (không phải spinner quay giữa màn hình); giữ `linear` easing cho shimmer/pulse (ngoại lệ duy nhất được dùng `linear`); khi dữ liệu về thì thay bằng nội dung thật với entrance fade (pattern B), không để skeleton nhấp nháy rồi biến mất đột ngột.

---

## 8. Pattern F — Press feedback (scale + haptics, tối thiểu)

```tsx
// components/PressableScale.tsx
// Nguồn: pattern "press feedback" trong RECIPES.md của skill animate-expo (báo cáo Gesture §1 #1,
// §3.1); code viết theo API Reanimated đã kiểm chứng (useSharedValue / useAnimatedStyle /
// withSpring — báo cáo Reanimated §4.3). CHƯA CHẠY THẬT.
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { motion } from '../design/motion';

export function PressableScale({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.96, motion.spring.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, motion.spring.snappy); }}
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}
```

**Haptics nhất quán:** 4 loại dùng nhất quán trong app (selection / impact light / notification / … — theo báo cáo Lottie §4.3). Dùng `expo-haptics` đã có trong mobile-kit allowed stack. Không gắn haptics vào mọi press — chỉ gesture hero, sheet mở/đóng, action quan trọng (success).

---

## 9. Pattern G — Shared-element transition (SPIKE ONLY, cắt lúc 13:00)

```tsx
// Nguồn: báo cáo Reanimated §4.2 (Reanimated docs + React Navigation docs). CHƯA CHẠY THẬT.
// ĐIỀU KIỆN TIÊN QUYẾT — 1 trong 3 chưa xong trước 13:00 build day → CẮT, quay về pattern B:
//   1. Bật feature flag ENABLE_SHARED_ELEMENT_TRANSITIONS — cách bật cho Expo SDK 58: CHƯA VERIFY.
//   2. Chỉ dùng với native-stack. Tab navigator KHÔNG hỗ trợ. Không dùng custom animation
//      function (New Architecture).
//   3. Chạy thử trên máy thật cả 2 đường: tap navigate VÀ swipe-back iOS.
// Mặc định (không truyền sharedTransitionStyle): withTiming 500ms trên
// width/height/originX/originY/transform/backgroundColor/opacity.
import Animated, { SharedTransition } from 'react-native-reanimated';

// Màn list — tag phải unique trong 1 màn, khớp tuyệt đối với màn detail.
// Màn detail — cùng tag, cùng component type (Image ↔ Image).
<Animated.Image
  source={{ uri: item.image }}
  sharedTransitionTag={`item.${item.id}.image`}
  sharedTransitionStyle={SharedTransition.duration(550).springify()}
/>;
// Không cần code gì thêm: Reanimated tự detect tag trùng khi top screen đổi và chạy transition.
```

**Trạng thái đã kiểm chứng:** experimental, "not recommended for production use yet" (cả 2 docs). Reanimated 4 hỗ trợ trên New Architecture từ 4.2.0, 4.7.1 có fix ổn định cho Shared Element Transitions — tín hiệu tốt, nhưng vẫn experimental. Thư viện cũ `react-native-shared-element` (0.8.9, publish cuối 2023, đang tìm maintainer mới) + `react-navigation-shared-element` (chỉ React Navigation 5/6) — **không dùng**.

---

## 10. Checklist quyết định Lottie vs Skottie — theo Expo Go hay dev build

Đây là checklist go/no-go duy nhất team cần cho animation file Lottie. Trả lời từ trên xuống; dừng ở dòng đầu tiên khớp.

| # | Câu hỏi | Nếu CÓ | Nếu KHÔNG |
|---|---|---|---|
| 1 | Demo chạy bằng **dev build đã build sẵn** trước giờ demo? | → Lottie được phép, sang dòng 2. | → **Lottie NO-GO.** Không test Lottie nữa. Sang dòng 4 (Skottie). |
| 2 | `npx expo install lottie-react-native` resolve xong + chạy được trên dev build + máy thật? | → Dùng Lottie cho tối đa 1–2 điểm: splash (sau native splash tĩnh) + success check. | → Cắt Lottie. Sang dòng 4. |
| 3 | File Lottie đã tải sẵn, filter "Free", <50KB, loop=false cho success, 1–3s? | → Ship. Luôn có fallback tĩnh nếu file hỏng. | → Tải lại file khác từ LottieFiles (filter "Free") hoặc cắt. Không load file từ URL lúc demo (mạng Biblio không đảm bảo) — commit file vào `assets/lottie/`. |
| 4 | Skia v2.14.0 đã test pass trên Expo Go 58 + máy thật? | → Thử **Skottie built-in** (0 dep thêm) để chạy file Lottie trong Expo Go. | → **Không có animation Lottie trong demo.** Dùng Reanimated + Skia primitive (nếu Skia GO) hoặc chỉ Reanimated. |
| 5 | Skottie built-in chạy được file cần dùng + đủ props? | → Dùng Skottie built-in. | → Chỉ đụng `margelo/react-native-skottie` nếu thiếu prop bắt buộc — và phải test trước (ít docs; claim +63% fps chưa kiểm chứng độc lập; Android release cần ProGuard rules `-keep class com.skiaskottie.**`; không hỗ trợ load từ URL, không hỗ trợ RN Animated API). |

**Những điểm đã kiểm chứng về Lottie (để khỏi tranh cãi lại trong build day):**
- `lottie-react-native` 7.5.0, Apache-2.0, 17,215★, push 04/11/2026; peer RN ≥0.84, react ≥19.2. Không có trang SDK nào của Expo cho nó (trong khi Skia/Reanimated/Gesture Handler đều có trang ghi "Included in Expo Go") + guide dev.to ghi rõ "Lottie does not work in Expo Go… You need a development build" → kết luận làm việc: **cần dev build**. Chưa có nguồn chính thức tuyệt đối nói câu này — ghi rõ để team biết mức bằng chứng.
- Native splash chỉ nhận **ảnh PNG tĩnh** (`expo-splash-screen` không hỗ trợ GIF/video/Lottie). Pattern đúng: native splash tĩnh → hide → màn Lottie in-app 1–2 giây → vào app.
- Nếu `npx expo install` resolve Lottie xuống 7.3.x thì theo Expo, đừng ép 7.5.0 (7.5.0 là bản Nitro/SPM mới tháng 8/2026, chưa thấy tuyên bố tương thích SDK 58 chính thức từ repo).
- File Lottie free: LottieFiles (800,000+ animation), license Lottie Simple License — dùng thương mại được, sửa được, không bắt buộc attribution, không resell file gốc. Premium/Marketplace nằm cạnh kết quả free — luôn filter "Free". Nguồn phụ: Mosso (toàn bộ library free commercial, không cần credit — chưa tự mở verify, ghi là nguồn phụ).
- `@lottiefiles/dotlottie-react-native` 0.13.0 (MIT, ThorVG ~150KB): giả định cần dev build như Lottie (CHƯA VERIFY Expo Go). Chỉ chọn nếu cần state machine tương tác trong file `.lottie`.
- **Code Lottie tối thiểu (đã kiểm chứng dạng dùng trong báo cáo asset-generation 13/11 §4.8):** `<LottieView source={require('../assets/lottie/success.json')} autoPlay loop={false} />` — đặt trong `components/motion/SuccessCheck.tsx`, asset trong `assets/lottie/`. Snippet đầy đủ §7.1 của báo cáo Lottie **không có trong file nhận được** nên template không bịa thêm props (vd safe mode Android) thành code mẫu — builder đọc docs `lottie-react-native` trực tiếp khi cần prop nào.
- **Skia:** template này **không có code Canvas mẫu** vì snippet §7.2 của báo cáo Lottie không có trong file nhận được. Nếu Skia GO: builder đọc docs v2 (`https://wcandillon.github.io/react-native-skia/docs/getting-started/installation/`, link v2 docs) và chỉ dùng primitive có sẵn (Canvas/Circle/Path/Group/Text) cho 1 hiệu ứng duy nhất (progress ring hoặc loader). Không viết shader/SKSL custom trong 5 giờ. **Skia v3 CẤM** (cần dev build, cần Android API ≥26 + Vulkan, iOS ≥15.1; không cài song song với `@shopify/react-native-skia`).

---

## 11. Tích hợp vào kit — file map (team quyết rồi mới làm)

| File | Nội dung | Nguồn |
|---|---|---|
| `design/motion.ts` (mới) HOẶC `templates/motion.ts` (mới) | Token §1 — team chốt 1 đường dẫn duy nhất | Báo cáo Gesture §4.5 / Báo cáo Reanimated §3 |
| `templates/snippets-motion.tsx` (mới) HOẶC `components/motion/` | Snippet §3–§9, mỗi snippet ghi source URL trên đầu (quy tắc mobile-kit) | Báo cáo Reanimated §3 + Báo cáo Gesture §5 |
| `mobile-kit/SKILL.md` § Router order + § Ban list | Thêm: motion → load `expo-animation` trước (rồi `animate-expo` nếu cần decision table); **giữ ban shared-element** tới khi spike pass; ghi rõ RNGH 3.3.0 là pin SDK 58 (khác 2.32 của SDK 57); ghi rõ **Moti bị loại**; ghi rõ Skia v2.14.0 CONDITIONAL theo test T8 | Báo cáo Reanimated §3 + Báo cáo Lottie §4.4 |
| `skills/motion/` (mới, trong repo) HOẶC `.claude/skills/` | `SKILL.md` rút gọn (build sequence + hard rules + link nguồn) + `RECIPES.md` (press, sheet, swipe-to-delete, collapsing header native, list entrance, screen transition) — copy-adapt từ 2 skill §12, KHÔNG copy nguyên văn skill có license riêng mà không ghi nguồn | Báo cáo Gesture §5 |
| `runbook-build-day.md` | Thêm mục smoke test motion trên máy thật trước 11:00 + gate cuối release build + quay video (council §3–§4) | Báo cáo Reanimated §7 |
| Không đụng tới | `theme.ts` (trừ import token motion), `tokens.css` (web kit — motion mobile không dùng chung file này) | Báo cáo Reanimated §3 |

**Skills cho agent (không phải runtime dependency — cài bằng lệnh, không thêm vào `package.json`):**
1. **Official Expo Skills** — `npx skills@latest add expo/skills --skill '*'` (hoặc chỉ `--skill expo-animation expo-router`). Entry point: https://docs.expo.dev/skills/ — load `expo-overview` trước, rồi skill theo từng bước. MIT. Mobile-kit quy định: **không copy Expo Skills vào repo** (Expo revise theo từng SDK, bản copy sẽ thối).
2. **`animate-expo` (emilkowalski)** — `npx skills add emilkowalski/skills --skill animate-expo`. Nội dung đúng hướng: 2 runtime (React vs UI), interruptibility/velocity handoff là baseline, Reanimated thay core Animated, bảng chọn pattern. License **CHƯA VERIFY** (trang Skills Dojo không ghi license trong phần đọc được) — chỉ dùng làm tài liệu tham khảo / cài qua `npx skills` theo hướng dẫn tác giả; không copy nội dung vào repo kit cho tới khi xác minh license. Khi mâu thuẫn với Expo Skills, Expo Skills thắng.
3. **`software-mansion-labs/skills` → `react-native-best-practices`** (tham chiếu sâu khi bí) — sub-skill animations (Reanimated 4, CSS transitions, layout, scroll-driven, 120fps) + gestures. Lệnh cài suy từ pattern chung, **CHƯA VERIFY verbatim** — check README repo trước khi chạy.

**Rủi ro khi tích hợp (đã kiểm chứng):**
- R3F, Skia v3, Moti, `react-native-sheet-transitions` — đã loại, xem council §1. Không ai thêm lại trong build day nếu không có quyết định team mới.
- Skia native binaries nặng (kéo theo `react-native-skia-android`, `react-native-skia-apple-ios`, `canvaskit-wasm`…) → tăng dung lượng build/APK rõ rệt so với chỉ dùng Reanimated. Số đo thực tế **CHƯA VERIFY** — đo trên bản build demo nếu dùng Skia.
- iPhone ProMotion: third-party animations bị cap 60fps trừ khi flag `CADisableMinimumFrameDurationOnPhone` được set; skill `animate-expo` ghi "Recent Expo SDKs set it by default — confirm it's there" → confirm flag có trong build trước demo (CHƯA VERIFY).
- Không dùng `Link.Menu`/`Link.Preview` ngoài iOS; không dùng `NativeTabs` khi chưa test (đường `unstable-`).
- Vị trí skill chuẩn cho **Codex** trong kit **CHƯA VERIFY** (`.claude/skills/` là của Claude Code; Codex nhận skill ở đâu chưa xác nhận) — team xác nhận trước khi copy skill vào repo.

---

## 12. Motion gate cho demo (thêm vào gate hiện có của kit)

Mỗi screen demo phải có:
- (a) entrance stagger hoặc fade (pattern B);
- (b) screen transition native, không flash trắng (pattern A);
- (c) ít nhất 1 gesture có velocity handoff (swipe/drag/pinch/sheet — pattern C/D);
- (d) reduced-motion path (xem §1);
- (e) video quay trên máy thật (release build) làm bằng chứng — **không video = không pass**.

**Thứ tự làm trong build day (tóm tắt — chi tiết giờ giấc xem council §3):** cài core stack + `expo-doctor` → native transitions mọi route → stagger entrance list chính → 1 sheet (formSheet trước) → 1 gesture hero + haptics → skeleton/loading + press feedback → spike shared-element (cắt 13:00) → Skia/Lottie chỉ nếu Gate 0 pass → release build + quay video.

---

## 13. Những gì template này KHÔNG có (gap thật — đừng bịa để lấp)

- Code Skia Canvas mẫu (snippet §7.2 của báo cáo Lottie không có trong file nhận được).
- Code LottieView đầy đủ ngoài one-liner §10 (snippet §7.1 không có trong file nhận được).
- Cách bật flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` cho Expo SDK 58 (CHƯA VERIFY — xem council C1/T7).
- Vị trí skill chuẩn cho Codex (CHƯA VERIFY).
- Hành vi `formSheet` / `NativeTabs` trên Android (CHƯA VERIFY).
- License của `animate-expo` (CHƯA VERIFY).
- Số đo tăng dung lượng APK/IPA khi thêm Skia (CHƯA VERIFY).
- Toàn bộ snippet §3–§9: **CHƯA CHẠY THẬT** — đối chiếu docs, chưa chạy trên máy thật nào.
