# Nghiên cứu: Frontend design skills / templates / tài nguyên cho Codex build day

**Ngày:** 13/11/2026 (đêm trước build day 14/11/2026) · **Người nghiên cứu:** Mie (theo lệnh trực tiếp của coordinator Phạm Tuấn, 23:49)
**Bối cảnh:** Team build app Expo SDK 58 (React Native 0.88, React 19, Reanimated 4) trong 5 giờ, demo trên điện thoại thật. Ưu tiên số 1: **app đẹp, motion mượt**. Chỉ dùng đồ miễn phí, không paid plan. Ưu tiên thứ có thể chỉnh qua Figma (khuyến khích, không bắt buộc).
**Phạm vi báo cáo này:** chỉ trình bày lựa chọn để team quyết định — **không tích hợp gì cả**.

---

## 🏆 Top 3 khuyến nghị (đọc phần này là đủ để quyết)

### 1. Impeccable — skill thiết kế cho agent (Apache-2.0, ~109k ⭐, push mới nhất 13/11/2026)
- **Là gì:** Skill cho Claude Code / Codex / Cursor… của Paul Bakaus, kế thừa từ skill `frontend-design` chính thức của Anthropic rồi mở rộng: 24 lệnh (`/impeccable polish`, `audit`, `critique`, `typeset`, `bolder`, `quieter`, `delight`…), 7 trụ (typography, color, spatial, responsive, interactions, motion, UX writing) + bộ detector 62 quy tắc xác định (deterministic) bắt các dấu hiệu "AI slop" — gradient tím-xanh, card lồng card, Inter ở khắp nơi — **không tốn LLM call**.
- **Vì sao #1:** Đúng thứ team thiếu nhất — gu thẩm mỹ cho agent. Cài 1 lệnh (`npx impeccable install`), hỗ trợ cả Codex CLI (team dùng Codex build day). Miễn phí hoàn toàn, không quota, không paid tier.
- **Cách dùng trong kit:** copy skill vào repo (`plugin/skills/impeccable/SKILL.md` hoặc `.claude/skills/`), chạy `/impeccable audit`/`polish` sau mỗi vòng build, trước khi chụp screenshot chấm điểm. Detector có thể chạy trong CI như một gate phụ.
- **Rủi ro:** Thiên về web (HTML/CSS) hơn React Native — một số quy tắc (hover, responsive breakpoint) không áp dụng cho mobile; cần người lọc. Skill khá nặng (~12k ký tự SKILL.md + reference files) → tốn context, chỉ load khi làm UI. Hook tự động có thể tải binary về `~/.impeccable/bin` kể cả khi từ chối tool call (ghi nhận trong review).

### 2. `animate-expo` — skill motion cho Expo của Emil Kowalski (miễn phí, SDK 58)
- **Là gì:** Skill xây dựng animation trong Expo/React Native: quyết định theo thứ tự — có nên animate không, chạy trên thread nào (worklet Reanimated 4 vs JS thread), gesture nào, reduced motion. Quy tắc cốt lõi: **chỉ dùng Reanimated worklets + Gesture Handler, không dùng `Animated` của core; mọi state change đều animate với curve của prototype; chấm "feel" trên release build ở máy yếu nhất, không phải simulator**.
- **Vì sao #2:** Đúng ưu tiên "motion mượt" của demo. Nó dạy agent cách dùng Reanimated 4 đúng (thứ đã có trong SDK 58) thay vì thêm lib mới — rủi ro gần bằng 0, không thêm dependency, không thêm bundle.
- **Cách dùng trong kit:** thêm làm skill thứ hai của frontend-agent-kit (cạnh skill taste-token hiện tại); mọi motion (enter/exit, layout animation, sheet, swipe) đi qua skill này; ghi curve/duration/spring vào `design/tokens.css` (motion tokens) như cách repo mẫu 6pm làm (`packages/theme/src/motion.ts`).
- **Rủi ro:** Là skill của cá nhân (Humans to Know), không phải repo chính thức của Expo — cần đọc SKILL.md trước khi dùng. Không phải package npm, chỉ là hướng dẫn.

### 3. Moti + Lottie (giữ nguyên hướng của crawler, đã xác minh) — motion khai báo + animation có sẵn
- **Moti** (MIT, 4.550 ⭐): wrapper khai báo kiểu Framer Motion trên Reanimated (`<MotiView from animate />`), code ít hơn ~10x cho transition/micro-interaction, +~30KB bundle. **Cảnh báo xác minh:** repo push lần cuối **11/03/2025** — hơn 8 tháng không commit; docs vẫn ghi "Reanimated 3", chưa thấy xác nhận chính thức cho Reanimated 4 / SDK 58. Dùng được nhưng phải test trên máy thật trước giờ build; nếu lỗi thì bỏ Moti, viết Reanimated 4 trực tiếp.
- **Lottie** (`lottie-react-native`, Apache-2.0, 17.216 ⭐, push 04/11/2026): render animation After Effects (.json/.lottie) native. Dùng cho splash + success/empty-state. **Lưu ý quan trọng:** cần **development build** (không chạy trong Expo Go) + plugin trong `app.json`; file free lấy ở lottiefiles.com (có cả free lẫn trả phí — chỉ lấy mục free).
- **Cách dùng trong kit:** Moti = lớp khai báo trên Reanimated trong component; Lottie = asset JSON trong `assets/`, component `<LottieView>` cho 2–3 khoảnh khắc đắt giá (splash, success), không lạm dụng.

---

## Đối chiếu với báo cáo crawler của Tuấn (23:52 tối nay)

| Tuấn báo cáo | Kết quả xác minh của Mie |
|---|---|
| Motion = Reanimated (trong SDK 58) + Moti | ✅ Đúng. Bổ sung: SDK 58 đi kèm **Reanimated 4.7** (không phải v3), cần `react-native-worklets` đi kèm; Moti **chưa cập nhật từ 03/2025** → coi là rủi ro, phải test sớm. |
| Lottie cho splash/success | ✅ Đúng (Apache-2.0, còn maintain). Bổ sung: **không chạy trong Expo Go**, cần dev build — team phải build trước, không đợi đến lúc demo. |
| 3D mặc định SKIP, chỉ R3F nếu thực sự cần + test máy thật | ✅ Đồng ý, xem phân tích lane (b) dưới đây. R3F v9 yêu cầu React 19 — SDK 58 dùng React 19 nên tương thích về mặt version, nhưng vẫn SKIP. |
| Vẽ/minh họa = unDraw + Open Peeps (CC0) qua react-native-svg | ⚠️ **Cần sửa một nửa:** Open Peeps đúng là CC0. unDraw **không phải CC0** — license riêng: free dùng thương mại, không cần ghi nguồn, nhưng **cấm redistribute dạng pack, cấm làm dịch vụ cạnh tranh, cấm train AI**. Vẫn dùng được trong app (không redistribute), nhưng đừng ghi "CC0" trong docs. Bổ sung Humaaans (CC0) + IRA Design (MIT). |
| Template tham khảo fig-app-starter-kit (SDK 58, MIT) | ✅ Repo tồn tại: `noorjsdivs/fig-app-starter-kit`, MIT, push 06/11/2026. **Nhưng chỉ 2 ⭐** — là starter pack của 1 khóa học YouTube (app nhà hàng Fig & Fennel), không phải template cộng đồng lớn. Dùng làm tham khảo cấu trúc, **không nên lấy làm nền chính**. Xem lane (d) để có lựa chọn mạnh hơn. |
| expo-motion SKILL.md | ✅ Tồn tại dưới tên **`animate-expo`** (Emil Kowalski, humans to know) — xem Top 2 ở trên. |

---

## Bảng bằng chứng đầy đủ (theo lane)

### (a) Motion / Animation

| Ứng viên | Làm gì | Nguồn / License | Tích hợp vào kit | Rủi ro |
|---|---|---|---|---|
| **Reanimated 4** (nền tảng, đã có trong SDK 58) | Animation chạy trên UI thread (worklet), 60–120fps, layout animation, shared element | `software-mansion/react-native-reanimated` — MIT, 11.070 ⭐, push 13/11/2026 (đang active) | Có sẵn qua `npx expo install`; motion tokens ghi vào `tokens.css` | Reanimated 4 yêu cầu New Architecture (SDK 58 mặc định bật — OK). API v4 khác v3 ở worklets tách riêng (`react-native-worklets`) — agent phải nhớ import đúng. |
| **Moti** | API khai báo kiểu Framer Motion trên Reanimated | `nandorojo/moti` — MIT, 4.550 ⭐, **push cuối 11/03/2025** | `npx expo install moti`; dùng cho enter/exit, skeleton, micro-interaction | ⚠️ **Ngừng cập nhật 8+ tháng**, docs vẫn nói Reanimated 3. Chưa rõ tương thích Reanimated 4/SDK 58 → **test trên máy thật trước 09:00 ngày build**, fail thì bỏ. |
| **Lottie** (`lottie-react-native` v7.x) | Render animation After Effects JSON/.lottie native | `lottie-react-native/lottie-react-native` — Apache-2.0, 17.216 ⭐, push 04/11/2026 | Plugin `app.json` + file JSON trong `assets/`; 2–3 điểm dùng (splash, success) | ⚠️ **Không chạy trong Expo Go** — cần dev build trước. LottieFiles có cả file trả phí — chỉ lấy free. |
| **react-native-gesture-handler** | Gesture (swipe, pan, pinch) chạy trên UI thread, bắt tay Reanimated | Software Mansion — MIT, có trong SDK 58 | `npx expo install`; bắt buộc cho swipe-to-dismiss, kéo thả, bottom sheet | Gần như không có rủi ro — thư viện chuẩn, đã quen thuộc. |
| **React Native Skia** (`@shopify/react-native-skia`) | Engine đồ họa 2D GPU (canvas, shader, blur, path animation), chạy 60fps, tích hợp Reanimated shared values | Shopify — MIT; Expo docs ghi recommended v2.14.0, **có trong Expo Go** | `npx expo install @shopify/react-native-skia`; dùng cho hiệu ứng "wow" tùy chỉnh (gradient động, chart, progress ring) | Thêm ~10–15MB binary (một số nguồn nói 4–6MB). Học curve cao hơn — chỉ dùng nếu có 1 hiệu ứng Skia cụ thể, không ôm cả thư viện cho việc nhỏ. Repo GitHub vừa đổi tên/redirect (API trả "Moved Permanently") — lấy qua npm/Expo docs, không clone trực tiếp. Có sẵn template chính thức `npx create-expo-app -t with-skia`. |
| **NativeAnimation** (catalog 410 animation) | 410 animation copy-paste source (Reanimated 4 + Skia + Gesture Handler), test trên SDK 58 | https://nativeanimation.com — **$299 một lần, 361/410 animation trả phí, chỉ 49 free** | Copy source TS vào app (kiểu shadcn) | ❌ **Trả phí — LOẠI** theo quy tắc free-only của team. Chỉ tham khảo ý tưởng từ 49 animation free nếu cần. |
| **Expo Router formSheet + expo-haptics** (miễn phí, "motion không cần code") | Sheet native iOS (kéo, velocity, Reduce Motion tự có), rung haptic | Có sẵn trong SDK 58 (`expo-router`, `expo-haptics`) | `presentation: 'formSheet'` trong router; haptics 4 loại dùng nhất quán | Không có rủi ro. Repo mẫu mã nguồn mở Apache-2.0: `github.com/at6pm/6pm` (app 6pm) — xem `apps/mobile/src/ui/motion` + `packages/theme/src/motion.ts` để học cách tổ chức motion tokens. |

### (b) 3D — **Kết luận: SKIP (đồng ý với crawler)**

| Ứng viên | Làm gì | Nguồn / License | Tích hợp | Rủi ro |
|---|---|---|---|---|
| **React Three Fiber v9** (`@react-three/fiber/native` + `@react-three/drei/native`) + `expo-gl` + `three` | Render scene Three.js khai báo kiểu React trên điện thoại (WebGL qua expo-gl) | `pmndrs/react-three-fiber` — MIT, 33.704 ⭐, push 21/10/2026; docs: https://r3f.docs.pmnd.rs | `npx expo install three expo-gl @react-three/fiber @react-three/drei` (+ `expo-asset`) | **Không dùng trong 1 ngày trừ khi 3D là tính năng lõi.** Lý do: (1) Fiber v9 = React 19 — SDK 58 OK về version, nhưng bundle +~238KB gzip (chưa kể model/texture/Drei); (2) iOS simulator hay crash OpenGL ES — **bắt buộc test máy thật**; (3) team không ai rành camera/material/draw call — docs R3F nói thẳng "hãy học React và Three.js trước"; (4) model đẹp cần làm/download GLB (Blender) — không kịp trong 5 giờ. Nếu product bắt buộc có 1 vật 3D: chỉ 1 scene tĩnh, model GLB có sẵn, test máy thật ngay đầu giờ, fallback = ảnh/SVG nếu giật. |
| **expo-three** (v8+) | Cầu nối Three.js ↔ expo-gl | MIT, peer Three.js 0.166+ | Kèm theo R3F hoặc dùng trực tiếp | Cùng rủi ro như trên; không giải quyết được vấn đề thời gian. |
| **Thay thế 3D bằng 2.5D** | Fake chiều sâu bằng Skia/Reanimated (parallax, scale, shadow, tilt theo gyro) | Không cần lib mới | Dùng Skia/Reanimated đã có | Rủi ro ~0, đạt 80% cảm giác "3D" với 20% công sức — **đây là hướng nên chọn nếu muốn "wow"**. |

### (c) Draw / Illustration (vẽ tay, minh họa)

| Ứng viên | Làm gì | Nguồn / License | Tích hợp | Rủi ro |
|---|---|---|---|---|
| **unDraw** | Minh họa SVG theo chủ đề (sản phẩm, onboarding, empty state), đổi màu accent trước khi tải | https://undraw.co — **license riêng (không phải CC0/MIT)**: free thương mại, không cần attribution, nhưng cấm redistribute dạng pack / dịch vụ cạnh tranh / train AI | Tải SVG → render bằng `react-native-svg` (`<SvgXml>`); đổi màu theo token màu của app | ⚠️ Đừng ghi CC0 trong docs. Chỉ dùng trong app, không đóng gói lại bán. Ảnh tĩnh, không có animation sẵn. |
| **Open Peeps** | Nhân vật vẽ tay lắp ghép (đầu, mặt, quần áo, tư thế), 584k+ tổ hợp | https://openpeeps.com (Pablo Stanley) — **CC0**, Figma + SVG | Như unDraw; có file Figma → chỉnh trực tiếp trong Figma rồi export SVG | Chỉ có nhân vật, không có bối cảnh/scene. Phong cách sketchy — hợp app thân thiện, không hợp app nghiêm túc. |
| **Humaaans** | Nhân vật mix-and-match (cùng tác giả Open Peeps) | https://humaaans.com — **CC0** | Như trên | Như Open Peeps. |
| **IRA Design** | Minh họa gradient 5 bảng màu, AI/SVG/PNG | https://iradesign.io — **MIT** | Như trên | Ít mẫu hơn unDraw. |
| **DrawKit** | Nhiều pack minh họa (một phần free, một phần Pro) | https://drawkit.com — free dùng thương mại, không attribution, cấm resell / train AI | Như trên | Phải lọc pack có tag "Free"; pack Pro trả phí. |
| **react-native-svg** (nền tảng render) | Render SVG, vẽ Path theo touch (vẽ tay, chữ ký) | Software Mansion — MIT, có sẵn trong Expo Go | `npx expo install react-native-svg`; pattern vẽ tay: `<Svg><Path d={...}/></Svg>` + PanResponder | Rủi ro ~0 — thư viện chuẩn. |
| **@sourcetoad/react-native-sketch-canvas** (vẽ tay thật) | Canvas vẽ native (iOS/Android), hỗ trợ New Architecture, TypeScript, undo/redo | Fork của Sourcetoad — MIT (kiểm chứng: v2.1.2, 01/2026, RN ≥0.79) | `npm i @sourcetoad/react-native-sketch-canvas`; cần dev build (native module) | Repo gốc (terrylinla) đã bỏ từ 2018 — **chỉ dùng fork Sourcetoad** (hoặc `@wwimmo/...`, `@ovitlab/...`). Cần dev build → test sớm. Chỉ dùng nếu app có tính năng "vẽ" thật, không phải chỉ để trang trí. |
| **react-native-inkpad** (mới, đáng chú ý) | Canvas mực native: PencilKit (iOS) + androidx.ink (Android) | MIT, v1.0.0 (11/2026), yêu cầu RN 0.84+ / SDK 56+, New Architecture | Drop-in thay `react-native-signature-canvas` | ⚠️ Mới (v1.0 tháng 10/2026), ít kinh nghiệm cộng đồng; cần dev build (không chạy Expo Go). Chỉ cân nhắc nếu cần vẽ/chữ ký chất lượng cao. |
| **LottieFiles (free animations)** | Kho animation JSON free cho splash/success/empty state | https://lottiefiles.com — lọc "Free" | Tải JSON → `lottie-react-native` | Cần đăng ký tài khoản để tải; phân biệt free vs trả phí. |

### (d) Starter templates / kits (Expo SDK 58)

| Ứng viên | Làm gì | Nguồn / License | Tích hợp | Rủi ro |
|---|---|---|---|---|
| **fig-app-starter-kit** (Tuấn đề xuất) | Starter pack của khóa học YouTube "Build a Restaurant App" (Fig & Fennel): Expo SDK 58, RN 0.88, React 19 + Compiler, Expo Router, Reanimated 4, Zustand 5, TS strict; kèm design/icons/splash | `noorjsdivs/fig-app-starter-kit` — **MIT, 2 ⭐, push 06/11/2026** | Clone làm tham khảo cấu trúc/thiết kế | ⚠️ **Chỉ 2 ⭐, của 1 cá nhân, gắn với 1 khóa học** — không phải template cộng đồng. Stack thì đúng SDK 58 (tốt), nhưng đừng lấy làm nền chính khi chưa đọc kỹ code. |
| **Expo Examples (chính thức)** | 80+ example app chính thức của Expo: navigation, Reanimated, Moti, Skia, Three.js, auth, storage… | `expo/examples` — **MIT, 3.756 ⭐, push 30/10/2026** | `npx create-expo --example <tên>` (vd: `with-skia`, `with-moti`) | Rủi ro ~0 — đây là nguồn pattern chuẩn nhất, luôn khớp SDK mới nhất. **Khuyến nghị dùng làm nguồn copy pattern thay vì template lạ.** |
| **Obytes React Native Template** | Template production-grade: Expo + Expo Router + TS + NativeWind + React Query + Zustand + i18n + Jest + Maestro + EAS + 10+ GitHub Actions | `obytes/react-native-template-obytes` — **MIT, 4.364 ⭐, push 08/10/2026** | Clone template | Mạnh nhưng **nặng** — nhiều thứ team không cần trong 5 giờ (i18n, Maestro, CI). Chỉ lấy nếu muốn nền production đầy đủ; nếu không thì overkill. |
| **gluestack-ui v5** | Thư viện component copy-paste (47 component), NativeWind v5/Tailwind v4, dùng chung web + mobile | `gluestack/gluestack-ui` — **MIT, 5.358 ⭐, push 02/09/2026** | `npx gluestack-ui init` rồi add từng component | Tốt nếu team muốn component sẵn + Tailwind. Nhưng starter kit Expo của nó vẫn ở **Expo 54** (chưa lên 58) → tự nâng cấp hoặc chỉ copy component. Thêm NativeWind = thêm 1 lớp config. |
| **ExpoKit** (mới, đáng chú ý) | Component copy-paste chạy được trong **Expo Go**, có 44 animated charts (MIT, npm `expo-charts`) | https://expokit.in — free core MIT; Pro $29 | `npx @expokit/cli add <component>` | Core free, Pro trả phí (tránh phần Pro). Mới, ít ⭐ công khai — đọc kỹ từng component trước khi add. Điểm cộng lớn: chạy trong Expo Go (không cần dev build). |
| **amirazerani-gif/expo-starter-pack** | Starter cá nhân: Expo, auth-gated dashboard đa vai trò | MIT, 1 ⭐, push 08/11/2026, **đang ở SDK 57** (58 "sắp có") | — | ❌ SDK 57, 1 ⭐, giả định backend Laravel — **không dùng**. Ghi lại để khỏi ai đề xuất lại. |
| **NativeWind UI / Fronty** | Component/template NativeWind có sẵn | Free tier có, nhưng template đầy đủ trả phí ($79–$299) | — | ❌ Phần ngon nằm sau paywall — **không dùng**. |

### (e) Claude Code skills cho frontend/design (public)

| Skill | Làm gì | Nguồn / License | Tích hợp vào kit | Rủi ro |
|---|---|---|---|---|
| **Impeccable** (⭐ xem Top 1) | 24 lệnh thiết kế + detector 62 quy tắc chống AI slop; 7 trụ thiết kế | `pbakaus/impeccable` — **Apache-2.0, 109.402 ⭐, push 13/11/2026** (repo hot nhất trong danh sách này) | `npx impeccable install --providers=claude,codex` (hỗ trợ Codex CLI) hoặc copy `plugin/skills/impeccable/SKILL.md` vào repo | Thiên web > mobile; tốn context; hook tự tải binary. Nhưng là skill thiết kế mạnh nhất hiện có, miễn phí. |
| **Anthropic `frontend-design`** (gốc) | Skill chính thức của Anthropic: hướng dẫn thẩm mỹ, cấm font lạm dụng (Inter, Roboto…), bắt chọn hướng thẩm mỹ | `anthropics/skills` (example-skills) + plugin `frontend-design@claude-plugins-official` — miễn phí, open source | `/plugin install frontend-design@claude-plugins-official` hoặc copy SKILL.md vào `.claude/skills/` | Nhẹ (~1.300 token) nhưng nông hơn Impeccable; đã có trong custom-skills của team (`frontend-design`) — **kiểm tra trùng lặp trước khi thêm**. |
| **`animate-expo`** (⭐ xem Top 2) | Skill motion cho Expo (Reanimated 4, Gesture Handler, reduced motion, chấm trên máy thật) | Emil Kowalski — https://www.humanstoknow.com/human/emilkowalski/skill/animate-expo (miễn phí) | Copy SKILL.md vào kit làm skill motion | Skill cá nhân, không phải của Expo; đọc trước khi dùng. |
| **ui-design-makeover-skill** (CBryant9) | Skill "makeover": audit app → đề xuất nhiều hướng thẩm mỹ → build → tự review | `CBryant9/ui-design-makeover-skill` — **MIT**, tạo 25/04/2026 | Clone vào `.claude/skills/` | Quy trình multi-phase khá dài — có thể nặng cho build 5 giờ; chỉ dùng phase audit + chọn hướng, bỏ phần tự review lặp. Web-centric, cần adapt cho mobile (safe area, tap target). |
| **native-ios-design** (yapsgg) | Skill thiết kế theo Apple HIG, Liquid Glass iOS 26, Dynamic Type, accessibility (SwiftUI) | `yapsgg/native-ios-design` — **MIT**, free | `/plugin marketplace add yapsgg/native-ios-design` | ⚠️ **SwiftUI, không phải React Native** — chỉ lấy nguyên tắc HIG/Liquid Glass làm tham khảo thẩm mỹ, **không áp trực tiếp vào code RN**. |
| **Seth Hobson `ui-design` plugin** (community marketplace) | Gồm `interaction-design`, `accessibility-compliance`, `design-system-patterns`, `responsive-design`, skill mobile iOS/Android/RN | Community plugin marketplace (Claude Code) | Qua marketplace | Community plugin — **đọc SKILL.md trước khi cài** (Anthropic cảnh báo không verify plugin bên thứ ba). |

---

## Khuyến nghị theo thứ tự ưu tiên cho ngày mai (để team vote)

1. **Chốt Impeccable + `animate-expo` làm 2 skill mới của frontend-agent-kit** (cài tối nay, test 15 phút sáng mai trước 09:00). Impeccable lo "đẹp", animate-expo lo "mượt".
2. **Motion stack: Reanimated 4 + Gesture Handler + Lottie (splash/success) + formSheet/haptics.** Moti chỉ dùng nếu test trên máy thật trước 09:00 pass; không thì bỏ.
3. **Minh họa: unDraw (scene) + Open Peeps/Humaaans (nhân vật, CC0) qua react-native-svg.** Tải sẵn 5–8 SVG tối nay theo đúng bảng màu token, tránh mất giờ tìm ảnh ngày mai.
4. **3D: SKIP.** Nếu muốn cảm giác 3D, dùng parallax/tilt bằng Reanimated + Skia (2.5D), không đụng R3F.
5. **Template: không đổi nền.** Lấy pattern từ Expo Examples chính thức (`with-skia`, `with-moti`…) khi cần; fig-app-starter-kit chỉ tham khảo. Nếu muốn component sẵn thì gluestack-ui (chỉ copy component, không lấy starter Expo 54 của nó).
6. **Chuẩn bị trước giờ G (tối nay):** tạo **development build** (Lottie + Skia + sketch-canvas nếu dùng đều cần dev build, không chạy Expo Go); tải sẵn Lottie JSON free + SVG unDraw/Open Peeps; cài Impeccable + animate-expo vào repo.

## Những thứ đã LOẠI (để khỏi đề xuất lại)
- NativeAnimation ($299), Fronty ($79), NativeWind UI paid templates, NativeBase Startup+ ($199) — trả phí.
- `amirazerani-gif/expo-starter-pack` — SDK 57, 1 ⭐.
- R3F/expo-three trong 1 ngày — trừ khi 3D là tính năng lõi.
- Moti nếu test máy thật fail — fallback Reanimated 4 trực tiếp.

## Lưu ý về Figma
- Open Peeps có file Figma chính thức → chỉnh nhân vật trong Figma rồi export SVG, khớp token màu.
- unDraw cho đổi màu accent ngay trên web trước khi tải — đặt đúng mã màu trong `tokens.css` rồi mới tải.
- Impeccable/animate-expo là skill cho **code**, không thay Figma — Figma vẫn là nơi chốt taste (màu, type, spacing) trước khi agent build, đúng workflow taste-token của kit.

---
*Báo cáo nghiên cứu độc lập — chưa tích hợp gì vào repo. Mọi URL repo đã xác minh tồn tại qua GitHub API ngày 13/11/2026 (trừ link web/skill đã ghi rõ). Số ⭐ và ngày push ghi tại thời điểm kiểm tra.*
