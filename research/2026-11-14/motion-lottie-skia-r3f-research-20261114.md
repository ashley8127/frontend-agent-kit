# Motion research — Lottie + Skia + R3F cho Expo SDK 58 / React Native

- **Lane:** Lottie + Skia + R3F (Expo SDK 58 / React Native)
- **Ngày nghiên cứu:** 14/11/2026 (~00:05–00:30, giờ VN)
- **Lệnh:** coordinator Tuấn, 00:03 ngày 14/11/2026 — motion là quan trọng NHẤT cho demo ngày mai (Codex build day, thứ Bảy 14/11/2026, 09:00 tại Biblio, build 5 giờ, demo trên điện thoại thật).
- **Phạm vi:** CHỈ NGHIÊN CỨU. Không tự tích hợp gì. Team quyết.
- **Free-only:** ưu tiên tuyệt đối. Mọi pick chính dưới đây đều free / open-source.
- **Figma:** ưu tiên edit được qua Figma (không bắt buộc) — xem §6.

> ⚠️ **Kết luận trước 1 dòng:** Demo ngày mai làm được motion "premium" mà KHÔNG cần dev build, chỉ với **Reanimated 4 + Skia v2.14 + Lottie-nếu-có-dev-build**. R3F thì SKIP. Điểm mấu chốt duy nhất cần team quyết trước 09:00 là: **demo chạy bằng Expo Go hay dev build?** — vì nó quyết định Lottie có dùng được hay không.

---

## 1. TL;DR — Top picks xếp hạng

| # | Pick | Dùng cho demo ngày mai | Expo Go? | Độ rủi ro |
|---|------|------------------------|----------|-----------|
| 1 | **react-native-reanimated 4.7.1 + react-native-worklets 0.13.1** (nền tảng) | Mọi entrance, stagger, layout animation, gesture, press feedback, skeleton/loading | ✅ **Có — Included in Expo Go** (Expo docs, SDK latest) | Thấp nhất. Đây là đáp án mặc định cho 80% motion của demo. |
| 2 | **@shopify/react-native-skia 2.14.0** (v2, KHÔNG phải v3) | Loading/entrance custom: progress ring, draw-on, shader/gradient, blur, gesture-driven visuals | ✅ **Có — Included in Expo Go** (Expo docs, recommended 2.14.0) | Thấp nếu giữ đúng v2.14.0. Cao nếu ai đó "upgrade" lên v3. |
| 3 | **lottie-react-native 7.5.0** | Splash/success/empty-state/celebration — file JSON/dotLottie có sẵn, designer làm không cần code | ❌ **KHÔNG — cần dev build** (xem §3.1, đây là điểm chưa có nguồn chính thức tuyệt đối) | **Cao cho demo ngày mai nếu team chỉ có Expo Go.** Đây là quyết định go/no-go. |
| 4 | **Skottie (built-in trong Skia 2.1+)** | Chạy file Lottie BÊN TRONG Skia canvas — thay thế Lottie ở pick 3 nếu đã dùng Skia | ✅ Kế thừa Expo Go của Skia v2 | Trung bình — ít tài liệu, không hỗ trợ hết props của lottie-react-native. Plan B cho Lottie. |
| 5 | **@lottiefiles/dotlottie-react-native 0.13.0** | Alternative runtime Lottie/dotLottie nhẹ (ThorVG ~150KB) | ❓ Chưa kiểm chứng Expo Go — giả định cần dev build | Trung bình — mới, ít cộng đồng hơn pick 3. |
| 6 | **@react-three/fiber 9.8.2 + three 0.187.0 (R3F)** | Chỉ khi product thật sự cần 3D | ⚠️ expo-gl thì Included in Expo Go, nhưng R3F v9 trên RN chưa được doc chính thức xác nhận cho SDK 58 | **SKIP cho demo ngày mai** (xem §5). |

### Quyết định team cần chốt trước 09:00 (theo thứ tự)

1. **Demo chạy bằng gì?** Expo Go (theo runbook mobile-kit hiện tại) hay dev build (`expo-dev-client` / EAS Build)?
   - Expo Go → dùng pick 1 + 2 (+ 4 nếu cần Lottie). **Không đụng Lottie-react-native.**
   - Dev build → mới được dùng pick 3. Nhưng dev build phải build TRƯỚC giờ demo trên máy thật, không build trong 5 giờ build day.
2. **SDK nào?** Lane này nghiên cứu theo SDK 58. Nhưng `mobile-kit` v0.1.0 hiện pin **SDK 57** (RN 0.86.3, Reanimated 4.3–4.5). Nếu app demo vẫn ở SDK 57, mọi version dưới đây phải resolve lại bằng `npx expo install --fix`, không copy số version SDK 58 sang.
3. **Skia có được "unban" không?** `mobile-kit` §2 hiện BAN Skia với lý do "not in Expo Go, needs a dev build". Lý do này **mâu thuẫn với Expo docs hiện tại cho SDK 58** (ghi rõ "Included in Expo Go", recommended 2.14.0). Xem §4.4 — team cần quyết rõ, đừng để 2 tài liệu mâu thuẫn nhau trong ngày build.

---

## 2. Bảng so sánh tổng

| Tiêu chí | Reanimated 4 | Skia v2.14.0 | lottie-react-native 7.5.0 | Skottie (in-Skia) | dotLottie RN 0.13.0 | R3F 9.8.2 |
|---|---|---|---|---|---|---|
| Làm gì | UI animation: entrance, layout, gesture, spring/timing trên UI thread | 2D graphics GPU: vẽ, shader, blur, filter, path draw-on, text-on-path | Chạy animation After Effects export JSON/dotLottie | Chạy Lottie trong Skia canvas, GPU-accelerated | Chạy Lottie/dotLottie bằng ThorVG | 3D scene three.js kiểu React |
| Repo | `software-mansion/react-native-reanimated` | `wcandillon/react-native-skia` (đã dời khỏi `Shopify/react-native-skia`) | `lottie-react-native/lottie-react-native` | built-in Skia 2.1+; lib riêng `margelo/react-native-skottie` | `lottiefiles/dotlottie-rs` (players) | `pmndrs/react-three-fiber` |
| Stars (GitHub API, 14/11/2026) | 11,070 ★ | 8,780 ★ | 17,215 ★ | — (chưa tra) | 289 ★ (dotlottie-rs) | 33,704 ★ |
| License | MIT | MIT | **Apache-2.0** | MIT (Skia) | MIT | MIT |
| npm latest (registry, 14/11/2026) | 4.7.1 (+ worklets 0.13.1) | 2.14.0 | 7.5.0 | — (theo Skia) | 0.13.0 | 9.8.2 (three 0.187.0, drei 10.7.9) |
| Expo Go (SDK 58) | ✅ Included in Expo Go | ✅ Included in Expo Go | ❌ Cần dev build (xem §3.1) | ✅ theo Skia v2 | ❓ chưa kiểm chứng | ⚠️ expo-gl ✅, R3F v9 RN ❓ |
| Cài đặt | `npx expo install react-native-reanimated react-native-worklets` | `npx expo install @shopify/react-native-skia` | `npx expo install lottie-react-native` + rebuild dev client | kèm Skia, không cài thêm (bản built-in) | `npx expo install @lottiefiles/dotlottie-react-native` | `npx expo install expo-gl` + `npm install three @react-three/fiber` |
| Peer deps (npm, 14/11/2026) | — (theo Expo docs, đi kèm worklets) | react ≥19, RN ≥0.78, worklets ≥0.7, reanimated ≥4.0 | react ≥19.2, RN ≥0.84, `@lottiefiles/dotlottie-react` ^0.13.5 | theo Skia | — (chưa tra) | expo ≥43, react ≥19 <19.4, three ≥0.156, expo-gl ≥11, expo-asset ≥8.4, RN ≥0.78, expo-file-system ≥11 |
| Hiệu năng | UI thread (worklets), 60–120fps | GPU, JSI, zero JS bridge | Native render, file JSON nhẹ (10–50KB thường gặp) | GPU, vendor claim +63% fps vs lottie-react-native trên máy Android yếu (claim của README, chưa độc lập kiểm chứng) | ThorVG ~150KB, nhẹ | GPU qua WebGL/OpenGL ES; nặng nhất bảng |
| Dung lượng thêm | Nhỏ (đã bundle sẵn trong SDK) | Lớn (Skia native binaries, gồm nhiều gói `react-native-skia-*`) | Vừa (Lottie-iOS/Android native libs) | Không thêm nếu đã có Skia | Nhỏ (~150KB engine + file .lottie) | Lớn (three.js + fiber + drei + GLB/texture) |
| Học / làm trong 5h? | ✅ Có sẵn snippet pack trong mobile-kit | ⚠️ Cần người biết Canvas API; snippet mẫu §7.2 copy-paste được | ✅ Dễ nhất — chỉ cần file JSON + 10 dòng code | ⚠️ API ít docs hơn | ⚠️ Docs ít, cộng đồng nhỏ | ❌ Không kịp trong 5h |
| Figma | Không (code tay) | Không (code tay) | ✅ LottieFiles for Figma plugin (xem §6) | ✅ (file Lottie từ Figma) | ✅ (file .lottie từ Figma) | Không |
| Khi nào dùng | Mặc định, mọi màn | Cần hiệu ứng mà Reanimated không làm được (shader, draw-on, blur động) | Cần animation designer-made: success check, splash, empty state | Đã dùng Skia mà vẫn muốn chạy file Lottie | Muốn file .lottie nhỏ + state machine tương tác | Product bắt buộc 3D |

---

## 3. Lottie — lane chính #1

### 3.1 `lottie-react-native` 7.5.0 — pick chính cho splash/success

- **Làm gì:** render animation After Effects (export Bodymovin JSON hoặc `.lottie`) chạy native trên iOS/Android. Dùng cho: splash sequence (sau native splash), success check, loading, empty state, onboarding, celebration.
- **Nguồn:**
  - Repo: `lottie-react-native/lottie-react-native` — **17,215 ★, Apache-2.0**, push gần nhất 2026-11-04 (GitHub API, tra 14/11/2026).
  - npm latest **7.5.0** (14/11/2026). Changelog (raw GitHub): 7.5.0 (2026-08-22) thêm Swift Package Manager support + port public API sang Nitro spec; 7.4.0 (2026-08-05) **yêu cầu RN ≥0.84**; 7.3.6 (2026-02-12), 7.3.4 (2025-09-02, visionOS + Android safe mode).
  - Peer deps (npm 7.5.0): `react >=19.2`, `react-native >=0.84`, `@lottiefiles/dotlottie-react ^0.13.5`. → SDK 58 (RN 0.88) thỏa; SDK 57 (RN 0.86) cũng thỏa về mặt version.
  - Docs/guide: https://dev.to/fazalshah/how-to-use-lottie-animations-in-react-native-2025-guide-56in
  - Changelog: https://raw.githubusercontent.com/react-native-community/lottie-react-native/master/CHANGELOG.md
- **Tích hợp vào kit:**
  - `npx expo install lottie-react-native` (để Expo resolve đúng version theo SDK — KHÔNG `npm install latest` tay).
  - File: `components/motion/SuccessCheck.tsx` (snippet §7.1), asset: `assets/lottie/success.json` (hoặc `.lottie`), màn splash: `app/(splash)/index.tsx` hoặc component `AnimatedSplash.tsx` chạy ngay sau khi `expo-splash-screen` hide.
  - Không cần config plugin trong `app.json` theo các guide hiện tại (các guide cũ nhắc `expo-av`/plugin đã lỗi thời — không áp dụng).
- **Rủi ro — ĐÃ KIỂM CHỨNG:**
  - ⚠️ **Expo Go hay dev build — ĐIỂM QUAN TRỌNG NHẤT:**
    - Expo docs **không có trang SDK nào cho `lottie-react-native`** (trong khi Skia, Reanimated, expo-gl, gesture-handler đều có trang riêng ghi "Included in Expo Go"). Không có trang = không nằm trong native code bundle sẵn của Expo Go.
    - Guide dev.to (2025, cập nhật 2026-05-31) ghi rõ: **"Lottie does not work in Expo Go (the sandbox app). You need a development build."** + hướng dẫn rebuild bằng `npx expo run:ios / run:android`.
    - Một số nguồn content-farm khẳng định "available via `npx expo install` for Expo Go" — **mâu thuẫn nhau, không đáng tin bằng 2 điểm trên**. Kết luận làm việc: **giả định bắt buộc dev build cho tới khi team tự test trên máy thật và chứng minh ngược lại.**
    - Hệ quả demo: nếu runbook demo ngày mai là **Expo Go + Metro tunnel trên điện thoại thật** (theo mobile-kit §4–§5) thì **Lottie-react-native KHÔNG được dùng**. Muốn dùng thì phải có dev build build sẵn trước giờ demo.
  - Native splash chỉ nhận **ảnh PNG tĩnh** (`expo-splash-screen` không hỗ trợ GIF/video/Lottie). Pattern đúng: native splash tĩnh → hide → màn Lottie in-app 1–2 giây → vào app. Đừng cố nhét Lottie vào native splash.
  - File Lottie nặng/hỏng có thể crash render: dùng prop safe mode (có từ 7.3.4 trên Android), luôn có fallback tĩnh, giữ file <100–500KB, tối ưu bằng LottieFiles optimizer, duration splash 1–3s.
  - 7.5.0 là bản Nitro/SPM mới (tháng 8/2026) — chưa thấy tuyên bố tương thích SDK 58 chính thức từ repo. Dùng `npx expo install` để Expo tự resolve; nếu nó resolve xuống 7.3.x thì theo Expo, đừng ép 7.5.0.
- **Rủi ro — CHƯA KIỂM CHỨNG:** chưa test thực tế `lottie-react-native` trên SDK 58 + máy thật; chưa xác minh `.lottie` local asset có cần config Metro thêm không (JSON `require()` thì chuẩn).

### 3.2 Nguồn file Lottie free + license

- **LottieFiles** (https://lottiefiles.com): thư viện 800,000+ animation free + premium (docs LottieFiles, cập nhật 10/11/2026). Free animation theo **Lottie Simple License**: dùng thương mại được, sửa được, publish được, **không bắt buộc ghi attribution** (khuyến khích ghi), không được resell file gốc, không được scrape để build dịch vụ cạnh tranh. ⚠️ **Premium/Marketplace nằm cạnh kết quả free với license trả phí — luôn filter "Free" trước khi tải.** Free workspace giới hạn 5 file / 20MB (theo review bên thứ ba 2026; giá Individual ~$19.99/tháng — chưa kiểm chứng trên trang pricing chính thức, team tự check nếu cần mua).
  - License: https://help.lottiefiles.com/animation-licensing-basics-
  - Developer portal / SDKs: https://docs.lottiefiles.com/en/developers
  - dotLottie format: https://lottiefiles.com/kr/dotlottie — format mở, MIT, engine ThorVG ~150KB, file `.lottie` là ZIP chứa JSON + ảnh + theme + state machine, nén tốt hơn JSON 50–70% (theo LottieFiles).
- **Mosso** (được nhắc trong bài tổng hợp 2026): toàn bộ library free cho commercial, không cần credit, export Lottie/dotLottie/GIF/MP4 — nguồn phụ nếu LottieFiles không có file ưng. (Chưa tự mở verify — ghi là nguồn phụ.)
- **Quy tắc chọn file cho demo:** success check / loading / empty state có sẵn hàng nghìn file free; ưu tiên file <50KB, 1–3 giây, loop=false cho success, loop=true cho loading. Tải về commit vào `assets/lottie/`, KHÔNG load từ URL lúc demo (mạng Biblio không đảm bảo).

### 3.3 `@lottiefiles/dotlottie-react-native` 0.13.0 — alternative

- **Làm gì:** player chính thức của dotLottie cho RN, render bằng ThorVG (~150KB), hỗ trợ `.lottie` (nhiều animation + theme + state machine trong 1 file).
- **Nguồn:** npm latest **0.13.0**, MIT (registry, 14/11/2026). Format spec + SDK MIT: https://lottiefiles.com/kr/dotlottie. Repo players: `lottiefiles/dotlottie-rs` — 289 ★, MIT (GitHub API).
- **Tích hợp:** `npx expo install @lottiefiles/dotlottie-react-native`; asset `.lottie` trong `assets/lottie/`.
- **Rủi ro:** cũng là native module (FFI/ThorVG) nên **giả định cần dev build như pick 3** cho tới khi test ngược lại; cộng đồng nhỏ hơn hẳn lottie-react-native; docs RN ít hơn bản web. Chỉ chọn nếu team cần state machine tương tác trong file `.lottie` (vd: nút bấm đổi trạng thái animation) mà lottie-react-native không làm gọn được.

### 3.4 Skill/template tham khảo cho Lottie

- **Animate Expo — agent skill by emilkowalski** (Skills Dojo): skill xây animation trong Expo/RN — quyết định "có nên animate, chạy thread nào, spring hay timing, gesture handoff, degrade ra sao", implement bằng Reanimated + Gesture Handler + Expo Router + expo-haptics; có bảng tra "scene lớn/custom drawing → Skia". Nguồn: https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo
  - Cài theo hướng dẫn của Skills Dojo (skill cho agent, không phải npm package). Dùng như checklist review motion trước demo, không phải dependency runtime.
- **Expo Skills (official, MIT)** — entry point theo mobile-kit §1: https://docs.expo.dev/skills/ — load `expo-overview` trước, rồi skill theo từng bước. Không vendor copy vào repo.

---

## 4. Skia — lane chính #2

### 4.1 `@shopify/react-native-skia` 2.14.0 (v2) — pick chính

- **Làm gì:** đưa engine đồ họa Skia (của Chrome/Android/Flutter) vào RN: vẽ Canvas khai báo bằng React (`<Canvas>`, `<Circle>`, `<Path>`, `<Group>`, `<Text>`…), image filter, blur, shader (SKSL), text-on-path, gesture-driven animation. Chạy trên UI thread qua JSI (zero JS bridge) + Reanimated shared values → 60fps kể cả khi JS thread bận.
- **Nguồn:**
  - npm latest **`@shopify/react-native-skia` 2.14.0**, MIT (registry, 14/11/2026). Expo docs (SDK latest, crawl 13/11/2026): **"Included in Expo Go", Recommended version: 2.14.0**. Nguồn: https://docs.expo.dev/versions/latest/sdk/skia/
  - Peer deps (npm 2.14.0): `react >=19`, `react-native >=0.78`, `react-native-worklets >=0.7.0`, `react-native-reanimated >=4.0.0`. → SDK 58 thỏa toàn bộ.
  - Repo đã dời: `Shopify/react-native-skia` trả về **301 Moved Permanently** (curl, 14/11/2026); repo hiện tại là **`wcandillon/react-native-skia` — 8,780 ★, MIT**, push 2026-11-13 (GitHub API).
  - Docs v2: https://wcandillon.github.io/react-native-skia/docs/getting-started/installation/ (link v2 docs: `wcandillon.github.io/react-native-skia/v2`).
  - Tutorial Skia + Reanimated (image slider, shader, gesture): https://www.tweag.io/blog/2024-07-04-image-transition-react-native-skia/
  - So sánh Skia vs SVG vs Canvas 2026: https://www.pkgpulse.com/guides/react-native-skia-vs-react-native-svg-vs-react-native-2026
- **Tích hợp vào kit:**
  - `npx expo install @shopify/react-native-skia` (+ Reanimated/worklets đã có từ pick 1 — Skia yêu cầu cả hai làm peer).
  - File: `components/motion/SkiaLoader.tsx` / `SkiaEntrance.tsx` (snippet §7.2), dùng trong màn loading / hero entrance / progress ring.
  - Web: cần load CanvasKit theo web installation instructions (Expo docs) — demo ngày mai là mobile nên không ưu tiên; nếu kit build cả web thì ghi chú riêng.
- **Rủi ro — ĐÃ KIỂM CHỨNG:**
  - ⚠️ **KHÔNG LÊN v3 TRƯỚC DEMO.** Skia v3 (npm `react-native-skia` **3.10.1**, MIT) là bản Graphite/WebGPU: package đổi tên (bỏ scope `@shopify`), `@shopify/react-native-skia` dừng ở 2.14. Migration guide chính thức ghi rõ: **"Expo Go bundles the native code of v2, so v3 needs a development build"**, **"v3 requires a development build. It does not run in Expo Go"**; v3 cần Android API ≥26 + Vulkan, iOS ≥15.1. Nguồn: https://wcandillon.github.io/react-native-skia/docs/getting-started/migration/ và https://thereactnativerewind.com/issues/the-great-graphite-migration-derek-joins-fat-fighters-and-a-leaderboard-for-your-dependency-tree (12/10/2026). v2 vẫn được maintain — ở lại v2 là quyết định đúng cho demo Expo Go.
  - **KHÔNG cài 2 package cùng lúc:** `@shopify/react-native-skia` và `react-native-skia` ship cùng một native module — migration guide cấm cài song song.
  - Native binaries nặng: package kéo theo `react-native-skia-android`, `react-native-skia-apple-ios`, `canvaskit-wasm`… → tăng dung lượng build/APK rõ rệt so với chỉ dùng Reanimated. Đo thực tế trên bản build demo (chưa có số đo — xem §8).
  - Shader/SKSL và animation hooks mới (v1.0/2.x: Paragraph API, animation hooks, Skottie) có learning curve; trong 5 giờ chỉ nên dùng các primitive đã có snippet (§7.2), không viết shader custom từ đầu.
  - Máy yếu: Skia render GPU nên nhẹ hơn JS animation, nhưng shader phức tạp + nhiều Canvas cùng lúc vẫn có thể drop frame — test trên máy demo thật, bật performance monitor.
- **Rủi ro — CHƯA KIỂM CHỨNG:** chưa test Skia 2.14.0 trên SDK 58 + Expo Go bản store mới nhất; chưa đo tăng dung lượng APK/IPA thực tế.

### 4.2 Skottie — Lottie chạy trong Skia (plan B cho Lottie)

- **Làm gì:** Skia 2.1+ tích hợp sẵn **Skottie** — Lottie trở thành một primitive vẽ trong Canvas (`Skia.Skottie.Make(...)`, `<Skottie animation frame>`), layer được với text/image/shader. Nghĩa là: nếu app đã có Skia (pick 2), team có thể chạy file Lottie mà **không cần thêm `lottie-react-native`** (không thêm native module, không thêm dev-build gate).
  - Nguồn: https://www.notjust.dev/blog/react-native-skia-1-0 và https://thereactnativerewind.com/issues/ai-that-thinks-offline-skia-animations-and-a-glimpse-of-the-future
- **Lib riêng `margelo/react-native-skottie`:** component `<Skottie>` drop-in thay `lottie-react-native`, hỗ trợ JSON + DotLottie, điều khiển progress bằng Reanimated shared value. README claim benchmark **+63% frame rate vs lottie-react-native trên máy Android yếu** — đây là claim của tác giả, chưa kiểm chứng độc lập. Phụ thuộc `@shopify/react-native-skia` ≥1.x; **không hỗ trợ load từ URL**; Android release cần thêm ProGuard rules (`-keep class com.skiaskottie.**`); **không hỗ trợ React Native Animated API**. Nguồn: https://gitmemories.com/margelo/react-native-skottie
- **Khuyến nghị:** với demo ngày mai, nếu cần chạy file Lottie trong Expo Go thì **thử Skottie built-in của Skia trước** (0 dependency thêm). Chỉ đụng tới `react-native-skottie` nếu Skottie built-in thiếu prop cần thiết — và phải test trước vì lib này ít docs hơn.
- **Chưa kiểm chứng:** chưa test Skottie built-in trên SDK 58 / Expo Go; chưa xác minh danh sách props Lottie nào Skottie không hỗ trợ.

### 4.3 Reanimated 4 — nền tảng bắt buộc (đi kèm Skia, đứng riêng cũng là pick #1)

- **Làm gì:** animation foundation — worklets chạy trên UI thread, shared values, layout animation (`entering`/`exiting`), gesture-driven motion. Mọi entrance/stagger/press-feedback của demo nên làm bằng cái này trước khi nghĩ tới Skia/Lottie.
- **Nguồn:**
  - Expo docs (SDK latest, crawl 13/11/2026): **"Included in Expo Go", Recommended version: 4.7.1**. Cài: `npx expo install react-native-reanimated react-native-worklets`. Không cần config Babel thêm (`babel-preset-expo` tự config worklets plugin). Nguồn: https://docs.expo.dev/versions/latest/sdk/reanimated/
  - Repo `software-mansion/react-native-reanimated` — **11,070 ★, MIT**, push 2026-11-13 (GitHub API). npm latest 4.7.1, worklets 0.13.1 (registry, 14/11/2026).
  - Lưu ý version: mobile-kit (SDK 57) pin Reanimated 4.3–4.5 / worklets 0.8–0.10. **4.7.1 là số của SDK 58** — đừng copy sang project SDK 57, dùng `npx expo install` để resolve theo SDK.
  - Custom entering/exiting animation (docs): https://docs.swmansion.com/react-native-reanimated/docs/2.x/api/LayoutAnimations/customAnimations/
  - So sánh Reanimated vs Moti vs Skia: https://www.pkgpulse.com/guides/react-native-reanimated-vs-moti-vs-skia-animation-2026
- **Phụ kiện free đi kèm (không bắt buộc):**
  - **Moti 0.30.0** (MIT, npm 14/11/2026): declarative wrapper trên Reanimated (`<MotiView from animate transition>`) — viết entrance nhanh hơn Reanimated thuần. Chỉ dùng nếu team đã quen; không thêm nếu thời gian eo hẹp vì Reanimated presets trong mobile-kit snippet pack đã đủ.
  - **react-native-gesture-handler** (Expo docs: Included in Expo Go, recommended ~3.3.0): https://docs.expo.dev/versions/latest/sdk/gesture-handler/ — cần cho gesture-driven motion (kéo, vuốt). Lưu ý mobile-kit BAN RNGH 3.x cho SDK 57 (bundle 2.32); số 3.3.0 là của SDK 58 — lại là lý do phải chốt SDK trước.
  - **expo-haptics** + **expo-linear-gradient** + **expo-blur**: đã có trong mobile-kit allowed stack — motion "cảm giác premium" đến từ combo haptics + gradient + blur + Reanimated, không nhất thiết phải có Lottie/Skia.

### 4.4 ⚠️ Xung đột cần team giải quyết: mobile-kit BAN Skia

`mobile-kit` v0.1.0 §2 hiện ghi: **Skia — "Heavy native dependency; not in Expo Go, needs a dev build"** (ban list), và demo theo **Expo Go + Metro tunnel**.

Nghiên cứu này kiểm chứng được (Expo docs SDK latest, crawl 13/11/2026): Skia **2.14.0 được ghi "Included in Expo Go"**. Hai khả năng:

- (a) Ban list viết cho SDK 57, và ở SDK 57 Skia thật sự chưa vào Expo Go (hoặc chưa verify) — thì ban vẫn đúng cho SDK 57.
- (b) Ban list đã lỗi thời so với SDK 58.

**Team phải quyết trước build day, bằng test trên máy thật, không quyết bằng suy luận:** nếu app demo ở SDK 58 + Expo Go (bản store mới) mà Skia chạy được thì unban Skia v2.14.0 có điều kiện (chỉ dùng snippet §7.2, không shader custom). Nếu app ở SDK 57 thì giữ ban cho tới khi có người test Skia trên Expo Go SDK 57. **Không ai được tự ý unban bằng cách sửa skill trong ngày build.**

---

## 5. R3F — lane chính #3 (kết luận: SKIP cho demo ngày mai)

### 5.1 `@react-three/fiber` 9.8.2 + `three` 0.187.0

- **Làm gì:** render scene three.js bằng component React (`<Canvas>`, `<mesh>`, `useFrame`), gồm cả model GLB qua `@react-three/drei`.
- **Nguồn:**
  - Repo `pmndrs/react-three-fiber` — **33,704 ★, MIT**, push 2026-10-21 (GitHub API). npm latest **9.8.2**; `three` **0.187.0**; `@react-three/drei` **10.7.9** (registry, 14/11/2026).
  - Docs cài đặt: https://r3f.docs.pmnd.rs/getting-started/installation — ghi: **"R3F v8 adds support for react-native… import from `@react-three/fiber/native`. We use `expo-gl` and `expo-asset` under the hood"**; cài `expo install expo-gl` + `npm install three @react-three/fiber`; Metro cần thêm `assetExts: ['glb', 'gltf', 'png', 'jpg']`; **"iOS simulators often have incomplete or unreliable OpenGL ES support, which can cause EXC_BAD_ACCESS crashes… Always test on a physical iOS device (iPhone/iPad running iOS 16 or later)."**
  - Peer deps (npm 9.8.2): `expo >=43`, `react >=19 <19.4`, `three >=0.156`, `expo-gl >=11`, `expo-asset >=8.4`, `react-native >=0.78`, `expo-file-system >=11`. → SDK 58 thỏa về version.
  - `expo-gl` **58.0.4**, MIT, Expo docs ghi **"Included in Expo Go", Recommended version: ~58.0.4**: https://docs.expo.dev/versions/latest/sdk/gl-view/ — lưu ý: docs expo-gl cũng ghi **Three.js không chạy được bên trong Reanimated worklet** (chỉ dùng được function có `'worklet'`).
  - Tutorial 3D shoe Nike app: https://www.notjust.dev/blog/2023-02-17-3d-animations-in-react-native-with-threejs-nike-app
- **Tích hợp (nếu sau này team đổi ý):** `npx expo install expo-gl expo-asset expo-file-system` + `npm install three @react-three/fiber @react-three/drei`; import **từ `@react-three/fiber/native`** (không phải import web); sửa `metro.config.js` thêm `glb/gltf`; asset GLB trong `assets/models/`; test bắt buộc trên máy thật.
- **Rủi ro — ĐÃ KIỂM CHỨNG:**
  - Tài liệu chính thức vẫn mô tả **R3F v8 cho React Native**; **không có xác nhận tương đương cho v9 trên RN/SDK 58** trong trang installation đã đọc. v9 đổi major theo React 19 (v9 ↔ React 19, v8 ↔ React 18) — về lý thuyết hợp với SDK 58 (React 19), nhưng **chưa có nguồn nào xác nhận v9 + RN + SDK 58 chạy ổn**. Đây là rủi ro lớn nhất.
  - iOS simulator crash (EXC_BAD_ACCESS) đã được docs cảnh báo — team không có máy thật dự phòng thì không được demo 3D.
  - Bundle nặng nhất trong các lane: three.js (~238KB gzipped cho riêng fiber import, theo đo độc lập tháng 8/2026 — chưa kể drei, GLB, texture, decoder) + native GL. Máy demo yếu / mạng tunnel chậm sẽ thấy rõ.
  - `expo-three` (bridge cũ cho three.js): các nguồn thứ cấp ghi "8.0.0 stable, compatible SDK 54+" — **chưa kiểm chứng từ nguồn chính thức, không khuyến nghị dùng**; R3F/native là đường chính thức.
- **Khi nào mới đáng làm R3F (giữ đúng lệnh "ghi rõ khi nào mới đáng làm"):**
  1. Product bắt buộc có vật thể 3D tương tác (xoay/scale model, configurator, AR-lite) mà 2D không thay thế được — và brief đã chốt điều đó, không phải "cho đẹp".
  2. Đã có dev build + máy thật để test (không demo 3D bằng Expo Go/simul

...[truncated 10448 chars]