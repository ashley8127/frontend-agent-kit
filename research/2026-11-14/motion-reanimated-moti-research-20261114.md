# Motion research — Reanimated 4 + Moti for Expo SDK 58 / React Native

- **Lane:** REANIMATED + MOTI — Expo SDK 58 / React Native
- **Ngày nghiên cứu:** 14/11/2026, ~00:05–00:25 (+07)
- **Lệnh:** coordinator Tuấn, 00:03 14/11/2026 — motion là quan trọng NHẤT cho demo ngày mai, tổng hợp thành skill/template dùng được cho demo.
- **Phạm vi:** chỉ nghiên cứu. KHÔNG tích hợp gì vào repo trong file này — team quyết rồi mới làm.
- **Repo liên quan:** `phamTuan207/frontend-agent-kit` (fork `ashley8127`); mobile-kit hiện tại đang pin **SDK 57** — mọi pin SDK 58 dưới đây là lane mới, chưa thay thế mobile-kit cho tới khi team quyết.
- **Nguyên tắc:** free-only. Mọi con số/version/star đều lấy từ nguồn đọc trực tiếp trong lúc nghiên cứu (npm registry, GitHub API, Expo docs, Reanimated docs); cái gì chưa đọc được ghi rõ **CHƯA VERIFY** — không đoán.

---

## TL;DR — quyết định đề xuất (để team chốt)

| # | Pick | Verdict |
|---|------|---------|
| 1 | **Reanimated 4.7.1 — presets + CSS API** (layout/entering/exiting, worklets khi cần gesture) | ✅ DÙNG — đây là toàn bộ motion của demo. Đã có trong Expo Go SDK 58, free, MIT, đang được maintain tích cực. |
| 2 | **Gesture Handler ~3.3.0 (SDK 58 pin) + Expo Router native-stack transitions** (formSheet, NativeTabs, headerLargeTitle, press feedback) | ✅ DÙNG — gesture-driven + chuyển màn native, không thêm lib lạ. Lưu ý: RNGH 3.x khác hẳn pin 2.32 của SDK 57, phải test lại trên máy thật. |
| 3 | **Official Expo Skills (`expo-animation`) + skill `animate-expo` của emilkowalski** (hướng dẫn agent chọn đúng pattern) | ⚠️ THAM KHẢO — dùng làm skill/template cho agent, không phải runtime dependency. `animate-expo` là skill bên thứ ba, license chưa verify. |
| — | **Moti 0.30.0** | ❌ KHÔNG DÙNG cho demo SDK 58. Ngừng update từ 03/2025, target Reanimated 3, chưa có bằng chứng chạy được với Reanimated 4 / RN 0.88. |
| — | **Shared-element transitions (`sharedTransitionTag`)** | ⚠️ CHỈ DÙNG nếu spike trên máy thật pass. Vẫn là tính năng **experimental**, phải bật feature flag, chỉ native-stack, không custom animation function trên New Architecture. Mặc định thay bằng `FadeInDown` stagger (đúng như ban-list của mobile-kit SDK 57). |

**Một câu:** demo ngày mai chỉ cần Reanimated 4.7.1 presets + CSS transitions + Gesture Handler + native-stack của Expo Router — đủ làm entrance, stagger, gesture, sheet, chuyển màn mượt 60fps mà không cần thêm bất kỳ lib motion nào khác.

---

## 1. Top picks xếp hạng

### Pick 1 — React Native Reanimated 4.7.1 (CORE — bắt buộc)

**Làm gì:** runtime animation duy nhất của demo. Chạy worklet trên UI thread (60fps kể cả khi JS thread bận). Trong v4 có 2 hệ API:
- **CSS Animations / CSS Transitions** (mới của v4): khai báo kiểu web (`transitionProperty`, keyframes) cho mọi animation state-driven — press, toggle, show/hide, expand/collapse. Đây là đường ngắn nhất cho demo: ít code, khó sai.
- **Worklets** (`useSharedValue` + `useAnimatedStyle` + `withTiming`/`withSpring`): khi cần gesture-driven, scroll-linked, hoặc interruptible (kéo, swipe-to-dismiss, parallax, collapsing header).
- **Layout animations:** presets `entering` / `exiting` / `layout` có sẵn — Fade, Bounce, Flip, Slide, Zoom, LightSpeed, Pinwheel… (xem §4).

**Nguồn:**
- Docs: https://docs.swmansion.com/react-native-reanimated/ (v4.x)
- Repo: https://github.com/software-mansion/react-native-reanimated — **11,070 ⭐** (GitHub API, 14/11/2026), **MIT**, push gần nhất 13/11/2026 — đang maintain rất tích cực.
- Expo docs SDK 58: https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/ — ghi rõ **"Included in Expo Go"**, **"Recommended version: 4.7.1"**.
- Release mới nhất: **4.7.1 (01–02/10/2026)** — "Stability fixes for Layout Animations and Shared Element Transitions, plus several Android crash fixes" (Software Mansion changelog).
- Peer deps (npm `react-native-reanimated@latest` = 4.7.1): `react-native 0.86–0.88`, `react-native-worklets 0.13.x` — khớp RN 0.88 của SDK 58.

**Tích hợp vào kit (SDK 58):**
```bash
npx expo install react-native-reanimated react-native-worklets
# KHÔNG npm install latest tay — để Expo resolve đúng pin SDK 58 (4.7.1 + worklets 0.13.x)
```
- Không cần config thêm: Babel plugin của Worklets đã tự cấu hình qua `babel-preset-expo` (Expo docs). Nếu dùng bare React Native CLI thì phải thêm `'react-native-worklets/plugin'` cuối `babel.config.js` — kit dùng Expo nên không cần.
- File trong kit: thêm `templates/motion.ts` (motion tokens: duration/easing/delay — xem §5) + `templates/snippets-motion.tsx` (copy-paste, mỗi snippet ghi source URL như mobile-kit đã làm). Không sửa `theme.ts` hiện có ngoài việc import token motion.
- Yêu cầu: **New Architecture (Fabric) bắt buộc** — Reanimated 4 không chạy Paper renderer. SDK 58 mặc định New Architecture nên khớp, nhưng nếu project còn bật legacy thì phải migrate trước.
- Lưu ý build-day: SDK 58 có transformer thử nghiệm "Noxcturnal" — nó **skip các file cần Reanimated/Worklets Babel transform**, nên đừng bật `experiments.noxcturnalTransformWorker` khi dùng Reanimated (Expo changelog SDK 58).

**Rủi ro (đã kiểm chứng):**
- Reanimated 3.x đã ngừng maintain tích cực (docs chính thức) — đừng pin 3.x cho project mới.
- Shared-element transitions vẫn experimental (xem Pick 4 dưới).
- Mobile-kit SDK 57 từng ghi Hermes V1 regression ở 57.0.9/57.0.17 liên quan Reanimated — đó là SDK 57, không suy ra SDK 58; phải smoke test lại trên máy thật.

### Pick 2 — Gesture Handler ~3.3.0 + Expo Router native-stack (GESTURE + CHUYỂN MÀN)

**Làm gì:** mọi thứ "tay chạm vào": drag, swipe-to-dismiss, pinch, scroll-linked (parallax, collapsing header), press feedback — qua `Gesture.*` + `useSharedValue` + `useAnimatedStyle` của Reanimated. Chuyển màn thì **không tự code**: dùng native-stack options của Expo Router (`presentation: 'formSheet'` cho bottom sheet thật của iOS, `NativeTabs`, `headerLargeTitleEnabled`, `Link.Menu`/`Link.Preview`).

**Nguồn:**
- Expo docs SDK 58: https://docs.expo.dev/versions/v58.0.0/sdk/gesture-handler/ — **"Included in Expo Go"**, **"Recommended version: ~3.3.0"**.
- Repo: https://github.com/software-mansion/react-native-gesture-handler — MIT, Software Mansion (cùng nhà với Reanimated).
- `npx expo install react-native-gesture-handler` (để Expo resolve pin, đừng lấy npm latest 3.5.0 — latest ≠ pin SDK 58).

**Tích hợp vào kit:** cùng lệnh `npx expo install` như Pick 1; snippet gesture mẫu vào `templates/snippets-motion.tsx` § gesture (Pan + swipe-to-dismiss + scroll header). Không thêm native config.

**Rủi ro (đã kiểm chứng):**
- ⚠️ **Đổi major so với mobile-kit SDK 57:** mobile-kit ban `react-native-gesture-handler 3.x` vì SDK 57 bundle RNGH 2.32. SDK 58 bundle **3.3.0** — tức là cái từng bị ban nay thành pin chính thức. Đây là thay đổi lớn, API `Gesture.*` v3 khác v2 (`useAnimatedGestureHandler` đã bị xóa ở Reanimated 4). Team phải quyết rõ: lane SDK 58 dùng RNGH 3.3.0, và mọi snippet gesture cũ viết cho 2.x đều phải viết lại/test lại. **CHƯA VERIFY** bằng chạy thật — chỉ verify bằng docs.
- Gesture + layout animation cùng lúc dễ giật nếu animate cả `width/height/top/left` mỗi frame — chỉ animate `transform` + `opacity` (quy tắc chung của cả 3 lib, xem §6).

### Pick 3 — Official Expo Skills + `animate-expo` (SKILL LAYER — cho agent, không phải runtime)

**Làm gì:** dạy agent *chọn đúng pattern* trước khi code — đây mới là thứ cứu demo trong 5 giờ: state-driven → CSS transition; mount/unmount/list reflow → layout animation; tay chạm/scroll → shared value + Gesture; chuyển màn → native-stack; sheet → formSheet. Không thêm dependency runtime nào.

**Nguồn:**
- Official Expo Skills: https://docs.expo.dev/skills/ — `expo-overview` (router) rồi load `expo-animation` theo từng bước. MIT. Mobile-kit đã quy định: **không copy Expo Skills vào repo** (Expo revise theo từng SDK, bản copy sẽ thối) — cài bằng `npx skills@latest add expo/skills --skill '*'` hoặc plugin Claude/Codex.
- `animate-expo` — skill của emilkowalski (Skills Dojo): https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo — `npx skills add emilkowalski/skills --skill animate-expo`. Nội dung đúng hướng: 2 runtime (React vs UI), interruptibility/velocity handoff là baseline, Reanimated thay core Animated, bảng chọn pattern y như trên.
- FreeCodeCamp tutorial Reanimated v4 (tham khảo thêm, free): https://www.freecodecamp.org/news/how-to-create-fluid-animations-with-react-native-reanimated-v4/

**Tích hợp vào kit:** ghi vào `mobile-kit/SKILL.md` § Router order (sau Expo Skills, trước design-system): "motion → load `expo-animation`, rồi `animate-expo` nếu cần decision table; mọi motion phải có trong snippet pack, không tự chế API từ trí nhớ". Không vendor file skill của bên thứ ba vào repo khi chưa rõ license.

**Rủi ro:**
- ⚠️ License của `animate-expo` **CHƯA VERIFY** (trang Skills Dojo không ghi license trong phần đọc được). Chỉ dùng làm tài liệu tham khảo / cài qua `npx skills` theo hướng dẫn của tác giả; không copy nội dung vào repo kit cho tới khi xác minh license.
- Skill bên thứ ba có thể lỗi thời theo SDK — đối chiếu với Expo Skills chính thức khi mâu thuẫn, Expo Skills thắng.

### Pick 4 (ĐIỀU KIỆN) — Shared-element transitions qua Reanimated `sharedTransitionTag`

**Làm gì:** morph 1 element (ảnh hero, card) từ màn list sang màn detail — hiệu ứng "wow" nhất cho demo, nếu chạy được.

**Nguồn:**
- Reanimated docs: https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/
- React Navigation docs: https://reactnavigation.org/docs/6.x/shared-element-transitions/

**Trạng thái đã kiểm chứng (quan trọng):**
- Là tính năng **experimental, "not recommended for production use yet"** — cả 2 docs đều ghi như vậy.
- Reanimated 4 hỗ trợ trên New Architecture **từ 4.2.0**, nhưng phải bật feature flag **`ENABLE_SHARED_ELEMENT_TRANSITIONS`**.
- Chỉ **native-stack** được hỗ trợ; **tab navigator không hỗ trợ** — dùng trong tab có thể không chạy animation gì cả.
- Trên New Architecture: **không custom được animation function hoàn toàn** — chỉ chỉnh duration + spring; mặc định animate `width, height, originX, originY, transform, backgroundColor, opacity` bằng `withTiming` 500ms.
- 4.7.1 có fix ổn định cho Shared Element Transitions (xem Pick 1) — tín hiệu tốt, nhưng vẫn experimental.
- Thư viện cũ `react-native-shared-element` (0.8.9, publish cuối 2023, đang tìm maintainer mới) + `react-navigation-shared-element` (chỉ hỗ trợ React Navigation 5/6) — **không dùng**, đã lỗi thời.

**Tích hợp vào kit (NẾU team duyệt spike):** `sharedTransitionTag` giống nhau ở 2 màn + `sharedTransitionStyle={SharedTransition.duration(550).springify()}` (snippet §4.2). Không thêm dependency (đã có trong Reanimated).

**Rủi ro / quyết định:**
- ❗ **Cách bật flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` trong project Expo SDK 58 — CHƯA VERIFY.** Tài liệu Reanimated/React Navigation xác nhận phải bật flag nhưng bước bật cụ thể cho Expo (config plugin? `app.json`? code?) chưa được đọc trong pass này. **Không được đưa vào build day trước khi có người verify bước này + chạy thử trên máy thật.** Nếu tới 13:00 build day vẫn chưa verify được → cắt, thay bằng `FadeInDown` stagger (mobile-kit đã có sẵn quy tắc này).
- Xung đột với mobile-kit SDK 57: ban-list hiện tại **cấm shared-element transitions** ("unproven in 5-hour budget"). Lane SDK 58 muốn gỡ ban thì phải là quyết định rõ ràng của team + có spike pass trên máy thật, không tự ý gỡ.
- iOS: khi trigger bằng swipe-back / nút back hệ thống thì chạy progress-based transition thay vì timed — test cả 2 đường.

### REJECTED — Moti 0.30.0 (KHÔNG DÙNG)

**Làm gì (vốn dĩ):** wrapper declarative kiểu Framer Motion trên Reanimated: `<MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} />` — ít code hơn Reanimated thuần cho các transition UI đơn giản. `useAnimationState`, `useDynamicAnimation`, `moti/interactions` cho pressed/hovered.

**Kiểm chứng trạng thái (GitHub API + npm registry, đọc trực tiếp 14/11/2026):**
- Repo: https://github.com/nandorojo/moti — **không bị archived** (archived: false), **4,550 ⭐**, 161 forks, **MIT**.
- **Commit cuối: 11/03/2025** (`Merge PR #346`, `1854a19`) — hơn 8 tháng không có commit nào. Commit trước đó 17/02/2025.
- **npm cuối: 0.30.0, publish 29/01/2025** — gần 10 tháng không release.
- **README vẫn ghi "powered by Reanimated 3"** — tức target Reanimated 3, không phải 4.
- `peerDependencies` ghi `react-native-reanimated: '*'` nên npm sẽ **không chặn** khi cài chung với Reanimated 4 — đây là cái bẫy: cài được ≠ chạy được. Reanimated 4 có breaking changes thật (tách `react-native-worklets`, đổi tên `runOnJS`/`runOnUI`, đổi `withSpring`, xóa `useAnimatedGestureHandler`, `combineTransition`, đổi tên `useScrollViewOffset` → `useScrollOffset`) mà Moti 0.30.0 ra đời trước các thay đổi đó.
- Không tìm thấy fork nào đang maintain / bản hỗ trợ Reanimated 4 trong pass tìm kiếm này (ghi rõ: **không tìm thấy ≠ chứng minh không tồn tại**).

**Kết luận:** Moti với SDK 58 + Reanimated 4.7.1 + RN 0.88 = **CHƯA VERIFY, rủi ro cao, không có maintainer để fix**. Trong budget 5 giờ của build day, debug 1 lib chết tốn nhiều thời gian hơn viết lại 5 dòng preset Reanimated. **Không dùng cho demo. Không đưa vào snippet pack.** Chỉ ghi lại đây để team khỏi mất công tìm lại.
- Nếu sau này có người muốn dùng Moti: điều kiện tiên quyết là có người chạy thử Moti 0.30.0 + Reanimated 4.7.1 trên project SDK 58 thật (Expo Go + dev build + máy thật) và ghi lại kết quả — tới lúc đó mới bàn lại.

---

## 2. Bảng so sánh

| Tiêu chí | Reanimated 4.7.1 ⭐ pick | Gesture Handler 3.3.0 | Moti 0.30.0 ❌ | RN core `Animated` | Skia (ngoài lane) |
|---|---|---|---|---|---|
| Vai trò | Runtime animation (UI thread) | Gesture native | Wrapper declarative trên Reanimated | API mặc định của RN | 2D graphics engine (không phải lib animation) |
| License / giá | MIT / free | MIT / free | MIT / free | MIT (RN) / free | MIT / free |
| Stars (14/11/2026) | 11,070 | — (không tra trong pass này) | 4,550 | — | — |
| Maintain | Rất tích cực (push 13/11/2026; 4.7.1 tháng 10/2026) | Tích cực (Software Mansion) | **Chết lâm sàng: commit cuối 11/03/2025, npm cuối 29/01/2025** | Theo RN | Tích cực |
| Expo SDK 58 pin | **4.7.1 (recommended, Included in Expo Go)** | **~3.3.0 (recommended, Included in Expo Go)** | Không có pin SDK 58 | Có sẵn | Không có trong Expo Go, cần dev build |
| RN 0.88 / New Arch | ✅ bắt buộc New Arch | ✅ (qua `npx expo install`) | ❌ target Reanimated 3, chưa verify | ✅ | ✅ nhưng nặng |
| Entrance / layout | ✅ presets đầy đủ + CSS API | — (cần Reanimated để animate) | ✅ (`from`/`animate`) nhưng trên Reanimated 3 | ⚠️ JS thread, `useNativeDriver` chỉ transform/opacity | — |
| Shared transition | ⚠️ experimental, cần flag | — | ❌ | ❌ | — |
| Gesture-driven | ✅ worklets + shared value | ✅ `Gesture.*` API | ⚠️ qua `moti/interactions` (đơn giản) | ❌ (qua bridge) | ✅ nhận shared value trực tiếp |
| Chạy Expo Go SDK 58 | ✅ | ✅ | **CHƯA VERIFY** | ✅ | ❌ cần dev build |
| Phù hợp demo 5h | ✅ cao nhất | ✅ | ❌ | ⚠️ chỉ skeleton/đơn giản | ❌ ngoài scope (mobile-kit đã ban) |

Ghi chú bảng: ô "—" = không tra trong pass này, không phải bằng chứng phủ định.

---

## 3. Tích hợp vào kit — file map đề xuất (team quyết rồi mới làm)

| File | Nội dung |
|---|---|
| `templates/motion.ts` (mới) | Motion tokens: `duration` (fast 150 / base 300 / slow 500), `easing` (chuẩn `Easing.inOut(Easing.quad)` của preset; spring `damping 120 / mass 4 / stiffness 900` là default của Reanimated — ghi rõ, đừng tự bịa số khác), `delay` stagger (mỗi item +60ms, cap 5 item). Tokens này lock ở taste-lock cùng `theme.ts`. |
| `templates/snippets-motion.tsx` (mới) | Snippet §4 dưới đây + gesture Pan/swipe-to-dismiss + scroll header + skeleton pulse; mỗi snippet ghi source URL trên đầu (theo quy tắc mobile-kit). |
| `mobile-kit/SKILL.md` § Router order + § Ban list | Thêm: motion → load `expo-animation` trước; **giữ ban shared-element** cho tới khi spike pass; ghi rõ RNGH 3.3.0 là pin SDK 58 (khác 2.32 của SDK 57); ghi rõ **Moti bị loại**. |
| `runbook-build-day.md` | Thêm mục smoke test motion trên máy thật trước 11:00 (xem §7). |
| Không đụng tới | `theme.ts` (trừ import token motion), `tokens.css` (web kit — motion mobile không dùng chung file này). |

**Cài đặt (SDK 58, duy nhất 1 lệnh — không cài tay từng cái):**
```bash
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler
npx expo-doctor@latest   # kiểm tra version khớp SDK 58 sau khi cài
```

---

## 4. Code snippet mẫu (đã đối chiếu docs, CHƯA chạy thật)

> Snippet viết theo docs Reanimated 4.x + React Navigation (đọc 14/11/2026). Chưa có máy thật ở đây nên **chưa chạy** — builder phải chạy thử trên máy thật trước khi đưa vào demo (xem §7).

### 4.1 Entrance animation — stagger list bằng preset (pattern mặc định của demo)

```tsx
// Source: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/
// Presets: FadeInDown mặc định { opacity: 0, translateY: 25 }, duration mặc định 300ms.
// Quy tắc kit: builder KHÔNG tự chế preset — chỉ dùng preset + .duration()/.delay()/.springify().
// Mỗi item delay thêm 60ms, cap ở item thứ 5 để list dài không chờ lâu.
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

const ENTER = { duration: 300, staggerMs: 60, maxStaggerItems: 5 };

export function StaggerList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <>
      {items.map((item, i) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.duration(ENTER.duration)
            .delay(Math.min(i, ENTER.maxStaggerItems) * ENTER.staggerMs)}
          exiting={FadeOut.duration(200)}
        >
          {/* nội dung card — màu/spacing lấy từ theme.ts, KHÔNG hardcode */}
        </Animated.View>
      ))}
    </>
  );
}
```

Biến thể nhanh khác (cùng 1 pattern, đổi preset là xong — không cần lib khác):
- Hero/title: `FadeInUp.duration(400)` / `ZoomIn.duration(350).springify()`
- Modal/sheet vào: `SlideInDown` / `FadeIn`
- List reorder khi thêm/xóa: thêm `layout={LinearTransition}` (xem Reanimated docs "Layout transitions" — `LinearTransition`, `SequencedTransition`, `FadingTransition`, `JumpingTransition`, `CurvedTransition`, `EntryExitTransition`).

### 4.2 Shared transition — list → detail (CHỈ DÙNG SAU KHI SPIKE PASS + BẬT ĐƯỢC FLAG)

```tsx
// Source: https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/
//         https://reactnavigation.org/docs/6.x/shared-element-transitions/
// ĐIỀU KIỆN TIÊN QUYẾT (chưa verify trong pass này — xem §6):
//   1. Bật feature flag ENABLE_SHARED_ELEMENT_TRANSITIONS (cách bật cho Expo SDK 58: CHƯA VERIFY).
//   2. Chỉ dùng với native-stack (@react-navigation/native-stack / Expo Router stack).
//      Tab navigator KHÔNG hỗ trợ. Không dùng custom animation function (New Arch).
//   3. Chạy thử trên máy thật cả 2 đường: tap navigate VÀ swipe-back iOS.
// Nếu 1 trong 3 chưa xong trước 13:00 build day → CẮT, quay về snippet 4.1.
import Animated, { SharedTransition } from 'react-native-reanimated';

// Màn list — tag phải unique trong 1 màn, khớp tuyệt đối với màn detail.
<Animated.Image
  source={{ uri: item.image }}
  sharedTransitionTag={`item.${item.id}.image`}
  sharedTransitionStyle={SharedTransition.duration(550).springify()}
/>;

// Màn detail — cùng tag, cùng component type (Image ↔ Image).
<Animated.Image
  source={{ uri: item.image }}
  sharedTransitionTag={`item.${item.id}.image`}
  sharedTransitionStyle={SharedTransition.duration(550).springify()}
/>;
// Không cần code gì thêm: Reanimated tự detect tag trùng khi top screen đổi và chạy transition.
// Mặc định (không truyền sharedTransitionStyle): withTiming 500ms trên
// width/height/originX/originY/transform/backgroundColor/opacity.
```

### 4.3 Gesture-driven (mẫu tối thiểu — Pan + swipe-to-dismiss, theo docs Reanimated + Gesture Handler)

```tsx
// Source: Reanimated docs (useSharedValue/useAnimatedStyle) + Gesture Handler docs (Gesture.Pan()).
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

---

## 5. Motion tokens + Figma — nói rõ giới hạn

- **Figma KHÔNG export được motion sang React Native.** Figma Smart Animate / prototype chỉ là tham chiếu về cảm giác (hướng di chuyển, thứ tự xuất hiện). Không có file/công cụ free nào trong pass này biến Figma animation thành code Reanimated — đừng hứa với team điều đó.
- Cái **edit được qua Figma** (theo đúng nghĩa của lane): designer chốt **duration / easing / delay / stagger** trong Figma (ghi vào spec hoặc Variables dạng text), rồi builder lock các số đó vào `templates/motion.ts` ở taste-lock — giống cách `tokens.css` lock màu/spacing cho web. Đổi số trong Figma → đổi 1 chỗ trong `motion.ts`, không sửa từng màn.
- Đề xuất token mặc định (lấy từ default của chính Reanimated docs, không bịa): duration base **300ms** (preset default), FadeOut 200–300ms, spring default `damping 120 / mass 4 / stiffness 900`, stagger **60ms/item cap 5**. Muốn "wow" hơn thì tăng stagger/duration ở token, không thêm lib.

---

## 6. Rủi ro / cảnh báo — phân loại ĐÃ KIỂM CHỨNG vs CHƯA VERIFY

### Đã kiểm chứng (có nguồn đọc trực tiếp 14/11/2026)
1. **Moti chết lâm sàng:** commit cuối 11/03/2025, npm 0.30.0 từ 29/01/2025, README target Reanimated 3. Không dùng cho SDK 58.
2. **Reanimated 4.7.1 là pin SDK 58**, Included in Expo Go, peer RN 0.86–0.88 + worklets 0.13.x. Cài bằng `npx expo install`.
3. **Shared-element transitions vẫn experimental**, cần flag `ENABLE_SHARED_ELEMENT_TRANSITIONS`, chỉ native-stack, không custom animation function trên New Arch (Reanimated docs + React Navigation docs).
4. **Expo Go SDK 58:** changelog SDK 58 (21/10/2026) nói bản store "will be released within a few weeks"; **nhưng** API versions của Expo (`exp.host/--/api/v2/versions`, đọc 14/11/2026) đã liệt kê Expo Go **58.0.7 (iOS)** / **58.0.5 (Android)**. Hai nguồn này mâu thuẫn về mặt thời gian — **phải kiểm tra trên máy demo thật** xem store đã có Expo Go 58 chưa; nếu chưa, demo phải dùng **development build** (`npx create-expo-app --template default@sdk-58` + dev build, theo changelog).
5. **SDK 58 không hỗ trợ macOS** (`react-native-macos` chưa lên 0.86+) — không liên quan trực tiếp lane motion, nhưng team macOS track cần biết: đừng build demo mobile trên macOS target.
6. **RNGH 3.x từng bị ban ở SDK 57** (pin 2.32) nhưng là **pin chính thức ~3.3.0 ở SDK 58** — snippet gesture cũ phải viết lại, không reuse mù.
7. **Reanimated 4 bắt buộc New Architecture**; Reanimated 3 đã ngừng maintain tích cực.
8. **Không bật Noxcturnal** (`experiments.noxcturnalTransformWorker`) khi dùng Reanimated — nó skip file cần Worklets transform (Expo changelog SDK 58).
9. **Chỉ animate `transform` + `opacity`** mỗi frame; animate `width/height/top/left` sẽ drop frame dù dùng lib nào (nguyên tắc chung, ghi trong cả Reanimated docs lẫn các guide 2026).

### CHƯA VERIFY — phải có người check trước / trong build day, không được coi là xong
1. ☐ Cách bật flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` cho Expo SDK 58 (bước config cụ thể).
2. ☐ Moti 0.30.0 có chạy được với Reanimated 4.7.1 + RN 0.88 không (không ai chạy thử trong pass này; khuyến nghị là không thử trong build day).
3. ☐ Expo Go 58 đã có trên App Store / Google Play trên **máy demo thật** chưa (xem #4 trên).
4. ☐ Toàn bộ snippet §4 có chạy trên máy thật không (chưa có máy thật trong pass này; chỉ đối chiếu docs).
5. ☐ RNGH 3.3.0 + Reanimated 4.7.1 có xung đột gì trên SDK 58 thật không (docs nói khớp, chưa chạy).
6. ☐ License của skill `animate-expo` (emilkowalski) — chưa thấy ghi trong phần đọc được.
7. ☐ Fork Moti nào đang maintain (tìm không thấy trong pass này — không kết luận là không có).
8. ☐ Số star của Gesture Handler / React Navigation native-stack (không tra trong pass này — không ảnh hưởng quyết định vì cả hai đều là pin chính thức của Expo).

---

## 7. Checklist cho team sáng build day (Sat 14/11/2026, trước 09:00)

> Lưu ý lịch: lệnh giao 00:03 14/11/2026, build day là **thứ Bảy 14/11/2026 09:00**. File này viết rạng sáng 14/11 — checklist dưới đây dùng cho **sáng build day, trước 09:00**, không phải "ngày mai" nữa.

- [ ] 1. Trên máy demo thật: mở store kiểm tra Expo Go 58 đã có chưa. Chưa có → build dev build ngay từ sáng, đừng đợi tới giờ demo.
- [ ] 2. `npx create-expo-app --template default@sdk-58` (nếu project SDK 58 mới) → `npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler` → `npx expo-doctor@latest`.
- [ ] 3. Chạy snippet 4.1 (stagger) trên máy thật, cả iOS + Android nếu có 2 máy. Pass → lock làm pattern mặc định.
- [ ] 4. Spike shared-transition (4.2): tìm cách bật flag → chạy thử tap + swipe-back. Fail hoặc quá 45 phút → cắt, không tiếc.
- [ ] 5. Chạy snippet gesture 4.3 trên máy thật (Pan mượt, dismiss đúng ngưỡng 120).
- [ ] 6. Test ở **release/production mode** ít nhất 1 lần trước demo (dev mode chậm hơn, dễ đánh giá sai độ mượt).
- [ ] 7. Quyết định team (ghi vào file này hoặc board): giữ hay gỡ ban shared-element? Moti loại chính thức? RNGH 3.3.0 thay 2.32 cho lane SDK 58?

---

## Nguồn đã đọc (14/11/2026)

- Reanimated docs — Getting started: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
- Reanimated docs — Entering/Exiting: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/
- Reanimated docs — Layout transitions: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/
- Reanimated docs — Shared Element Transitions: https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/
- Reanimated docs — Custom animations: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/custom-animations/
- Expo docs SDK 58 — Reanimated: https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/ (Recommended 4.7.1, Included in Expo Go)
- Expo docs SDK 58 — Gesture Handler: https://docs.expo.dev/versions/v58.0.0/sdk/gesture-handler/ (Recommended ~3.3.0, Included in Expo Go)
- Expo changelog SDK 58: https://expo.dev/changelog/sdk-58 (RN 0.88; Expo Go store "within a few weeks"; Noxcturnal skip Reanimated files; macOS chưa hỗ trợ)
- Expo upgrade guide SDK 58: https://expo.dev/blog/how-to-upgrade-to-sdk-58
- Expo versions API: https://exp.host/--/api/v2/versions (Expo Go 58.0.7 iOS / 58.0.5 Android; RN 0.88.1)
- React Navigation — Shared Element Transitions: https://reactnavigation.org/docs/6.x/shared-element-transitions/
- Moti GitHub (API): https://github.com/nandorojo/moti — 4,550⭐, MIT, commit cuối 11/03/2025, không archived
- Moti npm: https://www.npmjs.com/package/moti — 0.30.0 (29/01/2025), peer `react-native-reanimated: *`
- Moti docs: https://moti.fyi/reanimated (ghi "powered by Reanimated 3")
- Reanimated npm: https://www.npmjs.com/package/react-native-reanimated — 4.7.1, peer RN 0.86–0.88 + worklets 0.13.x
- Reanimated changelog (Software Mansion): 4.7.1 (01/10/2026) — stability fixes Layout Animations + Shared Element Transitions
- Reanimated migration guide (rnrescue.dev): https://www.rnrescue.dev/blog/reanimated-2-to-3-migration (Reanimated 4 breaking changes, 3.x ngừng maintain)
- FreeCodeCamp — Reanimated v4 tutorial: https://www.freecodecamp.org/news/how-to-create-fluid-animations-with-react-native-reanimated-v4/
- Skills Dojo — animate-expo (emilkowalski): https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo
- Mobile-kit skill (repo, SDK 57 — để đối chiếu ban-list/pin cũ): `~/workspace/custom-skills/mobile-kit/SKILL.md`
