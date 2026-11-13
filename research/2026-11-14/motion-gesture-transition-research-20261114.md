# Motion / Gesture / Transition — Research for Expo SDK 58 Demo
**Lane:** Gesture / Transition / Entrance Patterns + Skill/Template tổng hợp
**Repo:** `phamTuan207/frontend-agent-kit` (fork `ashley8127`) — mobile-kit, Expo SDK 58
**Ngày nghiên cứu:** 14/11/2026, ~00:05–00:20 +07 (lệnh coordinator Tuấn 00:03 14/11/2026)
**Phạm vi:** CHỈ nghiên cứu — không tích hợp gì. Team quyết rồi mới làm.
**Ưu tiên:** free-only; edit được qua Figma là điểm cộng, không bắt buộc.

> Baseline SDK 58 đã kiểm chứng qua nguồn thứ cấp (bài "Native feel in Expo", at6pm/dev.to, 23 ngày trước, dùng Expo 58 / RN 0.88):
> `expo 58`, `react-native 0.88` (New Architecture, Hermes), `react-native-reanimated 4.7.0`,
> `react-native-worklets 0.13.0`, `react-native-gesture-handler 3.2.1`, `expo-router 58.0.19`, `expo-haptics 58.0.6`.
> Mọi version pin trong file này phải được `npx expo install` / `npx expo-doctor` kiểm lại trên máy thật trước demo — chưa ai chạy thử trong repo này.

---

## 1. Top picks (xếp hạng — cho demo ngày mai, 14/11)

### 🥇 #1 — `expo/skills` → skill `expo-animation` (official, Expo team) + `emilkowalski/skills` → `animate-expo`
**Dùng cho:** MỌI quyết định motion trong demo. Đây là skill, không phải lib — nó dạy agent (và dev) *khi nào* animate, animate cái gì, bằng tool nào, theo thứ tự nào.
**Nguồn:**
- `expo/skills` — official Expo skills. RepoRadar: **4.111 stars, 268 forks, MIT**, 68 stars mới trong 7 ngày trước 11/11/2026. Cài: `npx skills@latest add expo/skills --skill '*'` (hoặc chỉ `--skill expo-animation expo-router`). Skill `expo-animation` mô tả: "Polished React Native animations and gestures with Reanimated, Gesture Handler, Expo Router, and expo-haptics." Nguồn: https://reporadar.spreix.com/repos/expo/skills
- `emilkowalski/skills` → `animate-expo` — 175.590 lượt cài ghi nhận (MCPInstall). Cài: `npx skills add emilkowalski/skills --skill animate-expo -a claude-code` (cài vào `./.claude/skills/animate-expo`). Kèm `RECIPES.md` với sẵn: press feedback, drag-to-dismiss sheet, swipe-to-delete, collapsing header, list entrances, keyboard-synced UI, tab indicator, screen transitions. Nguồn: https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo và https://www.mcpinstall.com/skills/emilkowalski/skills/animate-expo
**Vì sao #1:** Hai skill này *đồng thuận* với nhau và với Expo team: Reanimated (không dùng core `Animated`), gesture trên UI thread, screen transition dùng native stack options — "Never hand-roll this". Quy tắc cốt lõi trích từ skill: (1) không có hover — mọi affordance phải sống trong press/position; (2) có 2 runtime — animation chạm RN runtime sẽ giật khi JS bận, phải giữ motion trên UI runtime (worklets); (3) ngón tay đang đặt trên element — interruptibility + velocity handoff là baseline, không phải polish. Feel chỉ được tính là verified trên **release build, máy yếu nhất team hỗ trợ** — không tính simulator, không tính flagship ở dev mode.
**Tích hợp vào kit:** copy skill vào repo (đề xuất `skills/motion/animate-expo/` + `skills/motion/expo-animation/` hoặc `.claude/skills/` nếu kit dùng Claude Code; nếu kit dùng Codex thì map sang vị trí skill của Codex — CHƯA kiểm chứng vị trí Codex nhận skill, cần team xác nhận). Không thêm dependency runtime nào — skill chỉ là Markdown hướng dẫn. Motion tokens đi vào `design/motion.ts` (xem §5).
**Rủi ro:** skill của Emil là 1 maintainer (cộng đồng đánh giá "best in list" nhưng "moves at the speed of one maintainer"); skill chính thức của Expo là nguồn truth khi xung đột. Cả hai đều là hướng dẫn, không thay việc test trên máy thật.

### 🥈 #2 — Core stack: Reanimated 4 + `react-native-worklets` + Gesture Handler v2 (Software Mansion)
**Dùng cho:** Mọi gesture (swipe, drag, pinch, pan) và mọi animation chạy trên UI thread.
**Nguồn:**
- Docs chính thức: https://docs.swmansion.com/react-native-reanimated/ — "Reanimated lets you define animations in plain JavaScript which run natively on the UI thread by default"; layout animations: `<Animated.View entering={FadeIn} exiting={FadeOut} />`; layout transitions: `LinearTransition`, `SequencedTransition`, `FadingTransition`, `JumpingTransition`, `CurvedTransition`, `EntryExitTransition`. Chi tiết: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/
- Gesture Handler v2: API khai báo `Gesture.Pan() / Pinch() / Tap() / Fling()`, compose bằng `Gesture.Simultaneous() / Exclusive() / Race()`, bọc bằng `<GestureDetector>` + `<GestureHandlerRootView>` ở root. Maintainer = Software Mansion (cùng team Reanimated + React Native Screens).
- Skill bổ sung: `software-mansion-labs/skills` → `react-native-best-practices`, có sub-skill `references/animations/SKILL.md` (CSS transitions, layout animations, scroll-driven, Reanimated 4, 120fps) và `references/gestures/SKILL.md` (tap/pan/pinch/rotation/swipe/long-press/fling, composition, testing). Nguồn: https://www.typingmind.com/skills/software-mansion-labs-react-native-best-practices
**Tích hợp vào kit:**
```bash
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics
```
`app/_layout.tsx`: bọc root bằng `GestureHandlerRootView`. `babel.config.js`: plugin **`react-native-worklets/plugin`** (Reanimated 4) — xem cảnh báo §6, đây là lỗi dễ mắc nhất.
**Rủi ro:** Reanimated 4 **chỉ chạy New Architecture** (Reanimated 3 không còn được maintain tích cực). SDK 58 mặc định New Arch nên OK, nhưng lib cũ nào còn chạm bridge sẽ crash (xem §6).

### 🥉 #3 — `@gorhom/bottom-sheet` v5 — bottom sheet chuẩn ngành
**Dùng cho:** Bottom sheet duy nhất trong demo (filter / detail / action sheet): snap points, drag-to-dismiss, scrollable content bên trong.
**Nguồn:** repo `gorhom/react-native-bottom-sheet` — **~9,1k stars, 961 forks, 74 contributors, MIT, latest v5.2.14** (số liệu qua Sealambda registry snapshot; một nguồn khác ghi 7,5k stars — chênh lệch do thời điểm đo, lấy ~9,1k làm mốc mới nhất). Docs: https://gorhom.dev/react-native-bottom-sheet/ (ghi trong GitHub API record). So sánh 2026: Gorhom v5 là "most feature-complete", npm ~700k/tuần; Expo Bottom Sheet (trong `expo-ui`) là wrapper đơn giản hơn của Gorhom; RNSBS nhẹ, không dùng Reanimated. Nguồn: https://www.pkgpulse.com/guides/gorhom-bottom-sheet-vs-expo-bottom-sheet-vs-rnsbs-2026
**Tích hợp vào kit:**
```bash
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```
Dùng `BottomSheetModal` (+ `BottomSheetModalProvider`) cho sheet mở theo action; `BottomSheetFlatList` / `BottomSheetScrollView` cho nội dung cuộn được (KHÔNG dùng FlatList thường trong sheet). Props demo nên có: `enablePanDownToClose`, `enableContentPanningGesture`, snap points `['25%', '50%', '90%']` (tùy Figma).
**Rủi ro (đã kiểm chứng, quan trọng):** **bus factor 1, 0 commit trong 90 ngày, last commit 182 ngày trước** (Sealambda maturity 71/100). Tức là lib đang chững lại — dùng được cho demo ngày mai, nhưng đừng xây cả app xoay quanh API lạ của nó; giữ sheet sau một wrapper của kit để đổi lib sau này không đau. Đồng thời: nếu demo chỉ cần MỘT sheet đơn giản, cân nhắc **native `presentation: 'formSheet'`** của expo-router trước (xem #5) — free, đúng native, không thêm dep.

### #4 — Moti — declarative entrance/skeleton nhanh nhất (dùng có điều kiện)
**Dùng cho:** Entrance (fade/slide/scale), stagger list, skeleton loading — viết ít code nhất, API kiểu Framer Motion (`from` / `animate` / `exit`, `AnimatePresence`, `<Skeleton>` + `Skeleton.Group`).
**Nguồn:** https://moti.fyi/ (docs), https://www.moti.fyi/skeleton — Skeleton cần thêm `expo-linear-gradient`; `<Skeleton show={loading}>`, `delay`, `transition`. Stagger mẫu trong tài liệu: `delay: index * 80`. So sánh 2026: "For UI transitions and micro-interactions: Moti. For gesture-driven, complex sequences: Reanimated directly." Nguồn: https://www.pkgpulse.com/guides/react-native-reanimated-vs-moti-vs-skia-animation-2026 và https://dev.to/hugo_rus_630dd942fcf7cc62/reanimated-vs-moti-vs-skia-which-react-native-animation-library-should-you-actually-use-2j7m
**Tích hợp vào kit:** `npx expo install moti expo-linear-gradient` (sau khi đã có Reanimated). Chỉ dùng cho entrance/skeleton — gesture phức tạp vẫn viết Reanimated thuần.
**Rủi ro (đã kiểm chứng):** Docs Moti hiện vẫn ghi **"Please note that you must have Reanimated 3 installed"** — tương thích với Reanimated 4 / SDK 58 **CHƯA được kiểm chứng** trong nghiên cứu này (một bài so sánh 2026 cũng cảnh báo "compatibility should be tested carefully when building on Reanimated 4"). **Quyết định: chỉ dùng Moti nếu team test cài + chạy được trên dev build SDK 58 trước giờ demo; nếu không, viết stagger bằng Reanimated thuần (`FadeInDown.delay(i*60)`, §4) — không có gì Moti làm mà Reanimated không làm được, chỉ dài code hơn.**

### #5 — Native expo-router transitions (0 dependency — dùng TRƯỚC khi thêm lib)
**Dùng cho:** Screen-to-screen, modal, form sheet, tab, shared element — ưu tiên cao nhất vì không tốn dep, không tốn test tương thích.
**Nguồn:** Skill `animate-expo` (RECIPES + bảng chọn tool) và tài liệu Expo Router / React Navigation:
- Screen → screen: **native stack options, never hand-roll**. `animation`: `'default' | 'fade' | 'slide_from_right' | 'slide_from_bottom' | 'none'` (Android; iOS dùng platform default — iOS push 350ms, đừng override).
- Bottom sheet là một screen: **`presentation: 'formSheet'`** — UISheetPresentationController thật, drag anywhere, velocity handoff, interruptible, tôn trọng Reduce Motion.
- Tab bar: **`NativeTabs`** (`expo-router/unstable-native-tabs`) — tab bar thật của platform, kèm behaviors/transitions.
- Tab switch: **`animation: 'none'`** — tab là peer, không phải hierarchy; slide giữa các tab là sai cảm giác.
- Context menu / press-and-hold preview: **`Link.Menu` / `Link.Preview`** (iOS-only), đừng tự build bằng JS.
- Shared element: Reanimated **`sharedTransitionTag`** trên `Animated` component ở cả 2 screen (list image → detail image); hoặc `react-navigation-shared-element` (xem §3, mức ưu tiên thấp).
- Header collapse: `headerLargeTitleEnabled` (native stack, iOS) — không viết scroll worklet cho việc này.
- Nguồn: https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo ; https://galaxies.dev/react-native-shared-element-transition-reanimated-3
**Tích hợp vào kit:** chỉ sửa `app/_layout.tsx` + từng `Stack.Screen options` (xem snippet §4). Không cài thêm gì.
**Rủi ro:** `NativeTabs` ở đường `unstable-` — tên đã nói lên tính chất; test trên máy thật trước demo. `formSheet` là iOS-first; hành vi Android cần check (chưa kiểm chứng trong nghiên cứu này).

### #6 — `react-native-sheet-transitions` (chỉ tham khảo, KHÔNG dùng cho demo)
**Dùng cho:** iOS-like sheet transition với background scale (nền thu nhỏ khi sheet mở).
**Nguồn:** repo `saulsharma/react-native-sheet-transitions` (còn ghi là `saulamsal` trên DeepWiki). `SheetProvider` bọc ngoài Stack, `SheetScreen` trong modal `presentation: 'transparentModal'` + `contentStyle: {backgroundColor: 'transparent'}` + `gestureEnabled: false` (tránh xung đột gesture). Nguồn: https://deepwiki.com/saulsharma/react-native-sheet-transitions/7.4-integration-with-expo-router
**Rủi ro (đã kiểm chứng — loại):** README ghi rõ **"Work in Progress… not yet recommended for production use. Breaking changes may occur frequently."** Peer deps dùng wildcard `*`. Chỉ lấy ý tưởng background-scale để tự làm bằng Reanimated nếu team muốn hiệu ứng đó; không thêm dep này vào demo ngày mai.

### #7 — Starter kits có motion (tham khảo, không phải pick motion)
- **noorjsdivs `fig-app-starter-kit`** (trong brief gọi là "fig-app-starter-kit, SDK 58, MIT"): chỉ tìm thấy qua mô tả video YouTube "Expo & React Native Full Course: Build a Restaurant App (Fig & Fennel)" — stack Expo SDK 58 · RN 0.88 · React 19 · Expo Router · **Reanimated 4** · Zustand 5 · TS strict; "Starter pack (design, icons, splash badge)" trỏ tới repo `noorjsdivs/fig-app…` nhưng **URL đầy đủ bị cắt trong kết quả tìm kiếm, license/stars/nội dung repo KHÔNG kiểm chứng được**. Bản full source là **trả phí qua BuyMeACoffee**. Nguồn: https://www.youtube.com/watch?v=dRi0hSMB4r8 — **Kết luận: không đưa vào top pick cho tới khi ai đó mở được repo và xác nhận MIT + nội dung.**
- **ReadyNative free** (`ReadyNative/ready-native-free`, MIT): Expo **SDK 57** (không phải 58), Expo Router, NativeWind 4, TanStack Query, Zustand, tabs + settings + dark mode, chạy được trong Expo Go. Hữu ích làm tham chiếu cấu trúc, không có gì đặc biệt về motion. Nguồn: https://readynative.app/
- **amirazerani-gif/expo-starter-pack** (MIT, free): SDK 57, SDK 58 "on the way" (7/11/2026); thiên về template project + Laravel-style API, không phải motion kit. Nguồn: https://dev.to/amirgazerani_dev/this-is-how-i-start-a-new-project-in-expo-maybe-youll-like-it-too-2pm4
- **rami-maalouf/obsidian-expo** (MIT): Expo SDK 58 starter thật (58.0.7, Router 58.0.17) nhưng là app ghi chú Markdown, không liên quan motion. Nguồn: https://github.com/rami-maalouf/obsidian-expo

---

## 2. Bảng so sánh

| # | Cái gì | Loại | License / Stars* | SDK 58 / Reanimated 4 | Dùng cho demo | Chi phí | Verdict |
|---|--------|------|------------------|------------------------|---------------|---------|---------|
| 1 | `expo/skills` → `expo-animation` | Skill (Markdown) | MIT / 4.111★ (repo) | Official, theo SDK | Mọi quyết định motion | Free | **ADOPT ngay** |
| 1 | `emilkowalski/skills` → `animate-expo` | Skill + RECIPES.md | (repo Emil) / 175.590 installs | Reanimated 4, worklets | Mọi pattern: press, sheet, swipe-to-delete, list entrance, screen transition | Free | **ADOPT ngay** |
| 2 | Reanimated 4 + worklets + Gesture Handler v2 | Lib (core) | MIT (Software Mansion) | ✅ New Arch only | Mọi gesture + animation UI-thread | Free | **ADOPT — nền bắt buộc** |
| 2b | `software-mansion-labs/skills` → `react-native-best-practices` | Skill (animations + gestures sub-skills) | (Software Mansion Labs) | Reanimated 4, 120fps | Tham chiếu sâu khi bí | Free | Adopt kèm #1 |
| 3 | `@gorhom/bottom-sheet` v5.2.14 | Lib | MIT / ~9,1k★ | Reanimated 3 trong docs; cần test trên R4 | Bottom sheet chính | Free | **Dùng, có wrapper, có fallback formSheet** |
| 4 | Moti | Lib (wrapper Reanimated) | MIT (nandorojo/moti) | ⚠️ Docs ghi Reanimated 3 — **chưa kiểm chứng R4** | Entrance / stagger / skeleton | Free | **Chỉ dùng nếu test pass trước demo** |
| 5 | expo-router native transitions (formSheet, NativeTabs, sharedTransitionTag) | Built-in | MIT (Expo) | ✅ SDK 58 | Screen/modal/tab/shared-element | Free | **Dùng TRƯỚC mọi lib** |
| 6 | `react-native-sheet-transitions` | Lib | (saulsharma) | Peer `*` | Background-scale sheet | Free | ❌ WIP, không dùng demo |
| 7 | fig-app-starter-kit (noorjsdivs) | Starter template | **Chưa kiểm chứng** | Stack ghi SDK 58 + Reanimated 4 | Tham chiếu | Starter free; full source trả phí | ⏳ Chưa xác minh — không pick |
| 7 | ReadyNative free / expo-starter-pack | Starter template | MIT | SDK 57 | Tham chiếu cấu trúc | Free | Tham khảo |

\* Stars/installs là số liệu tại thời điểm nguồn được crawl (tháng 11/2026), sẽ lệch theo thời gian — chỉ dùng để so độ phổ biến tương đối, không phải tiêu chí quyết định.

**Quy tắc chọn tool (từ skill `animate-expo`, đã kiểm chứng qua 2 nguồn):**

| Tình huống | Tool |
|---|---|
| Screen → screen | Native stack options trong Expo Router. Không tự viết |
| Sheet là một screen | `presentation: 'formSheet'` |
| Sheet trong screen (không phải route) | `@gorhom/bottom-sheet` |
| Tab bar | `NativeTabs` |
| Tab switch | `animation: 'none'` |
| Press / toggle / đổi màu / đổi giá trị, không gesture | Reanimated CSS transition (`transitionProperty`) |
| Gesture-driven (drag, swipe, pinch) | Gesture Handler + Reanimated worklet |
| Entrance list / skeleton | Moti (nếu test pass) hoặc Reanimated `entering={FadeInDown.delay(i*…)}` |
| Context menu / peek | `Link.Menu` / `Link.Preview` (iOS) |

**Motion tokens đề xuất (đưa vào `design/motion.ts`, đồng bộ với `design/tokens.css` bên web):**
- Durations: `instant 100ms` (press), `fast 200ms` (micro), `base 300ms` (sheet/modal/toast — "Mobile UI animations stay under 300ms"), `slow 400ms` (chỉ cho hero/entrance lớn). Screen transition giữ platform default (iOS push 350ms).
- Springs: `spring-default { damping: 20, stiffness: 300 }` cho sheet/card; `spring-snappy { damping: 26, stiffness: 500 }` cho press/toggle. (Giá trị là điểm khởi đầu từ skill — team tune trên máy thật.)
- Easing: `easeOut` cho entrance, `easeInOut` cho chuyển trạng thái; không dùng `linear` trừ skeleton shimmer.
- Stagger: `delay = index * 60ms`, cap tổng `≤ 400ms` (item thứ 7 trở đi cùng delay 360ms — list dài không được cascade mãi).
- Reduced motion: `useReducedMotion()` — giữ opacity/color, bỏ translate/scale/parallax/overshoot; screen transition về `animation: 'fade'`. Ship cùng animation, không làm sau.

---

## 3. Chi tiết từng nguồn

### 3.1 Skills (cài vào repo, không tốn runtime)
| Skill | Cài | Nội dung chính | Ghi chú |
|---|---|---|---|
| `expo-animation` (expo/skills, official) | `npx skills@latest add expo/skills --skill expo-animation` | Animation + gesture với Reanimated, Gesture Handler, Expo Router, expo-haptics; phân biệt free (framework) vs paid (EAS) | Nguồn truth khi xung đột |
| `animate-expo` (emilkowalski/skills) | `npx skills add emilkowalski/skills --skill animate-expo -a claude-code` | Build sequence 9 bước, hard rules, RECIPES.md (press, sheet, swipe-to-delete, collapsing header, list entrance, keyboard UI, tab indicator, screen transition) | 175.590 installs; 1 maintainer |
| `react-native-best-practices` (software-mansion-labs/skills) | `npx skills add software-mansion-labs/skills --skill react-native-best-practices` (lệnh suy từ pattern chung — **chưa kiểm chứng verbatim**, check README repo trước khi chạy) | Sub-skill animations (Reanimated 4, CSS transitions, layout, scroll-driven, 120fps) + gestures (mọi loại gesture, composition, testing) | Tác giả = team làm ra Reanimated/GH |
| `expo-router` (expo/skills) | kèm `--skill '*'` | File-based routing, NativeTabs, formSheet, Link.Menu/Preview | Cài cùng lúc với expo-animation |

### 3.2 Gesture — swipe / drag / pinch / bottom sheet
- **Cơ chế chuẩn (RNGH v2 + Reanimated):** `Gesture.Pan().onUpdate(e => { x.value = e.translationX })` → `useAnimatedStyle` đọc shared value → toàn bộ touch-to-pixel loop ở UI thread, không qua JS bridge. Ngưỡng swipe-to-dismiss mẫu trong tài liệu: `SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35`, velocity quyết định fling vs spring-back (`withSpring` khi thả).
- **Pinch:** `Gesture.Pinch()` + `useSharedValue` scale, clamp scale (vd 1–3×), kết hợp `Gesture.Simultaneous(pinch, pan)` nếu vừa zoom vừa kéo.
- **Swipeable card deck:** Pan + `translationX/20` độ nghiêng + `withSpring` về 0 hoặc bay khỏi màn hình khi vượt ngưỡng — pattern có sẵn trong RECIPES của `animate-expo` (swipe-to-delete).
- **Bottom sheet:** xem #3 ở §1. Nhớ `GestureHandlerRootView` ở root, `BottomSheetModalProvider` nếu dùng Modal, `BottomSheetFlatList` cho list trong sheet.
- **Haptics (điểm cộng demo):** `expo-haptics` — 4 loại dùng nhất quán (selection / impact light / notification / …); từ gesture worklet gọi haptics phải hop sang JS thread bằng `scheduleOnRN` (Reanimated 4 chuyển thread-hopping sang `react-native-worklets`).

### 3.3 Transition — expo-router / shared element
- Xem bảng §2 + #5 §1. Thêm: `contentStyle: { backgroundColor: … }` để tránh flash trắng khi transition (đặt bằng màu nền theme); `freezeOnBlur: true` là best practice perf 2026 cho stack.
- Shared element: gắn cùng `sharedTransitionTag="photo-<id>"` cho `Animated.Image` ở list và detail; modal detail dùng `presentation: 'transparentModal'` + `expo-blur` BlurView nếu muốn nền mờ. Lưu ý từ docs: chỉ animate được thuộc tính cơ bản, không đổi được content của element.
- Header motion (collapsing header): có lib `pawicao/react-native-header-motion` (DeepWiki có guide Expo Router) — **chỉ ghi nhận, không recommend**: demo ngày mai nên dùng `headerLargeTitleEnabled` native trước; lib ngoài thêm rủi ro tương thích.

### 3.4 Entrance — stagger / fade / slide / scale / skeleton
- **Reanimated thuần (không thêm dep — fallback chắc chắn nhất):** `entering={FadeInDown.duration(300).delay(index * 60).springify()}`; `exiting={FadeOut}`; `layout={Layout.springify()}` cho reorder. Preset có sẵn: `FadeIn`, `FadeInDown/Up/Left/Right`, `ZoomIn`, `SlideInDown`, `FlipInEasyX`, `BounceIn`… + `LinearTransition / FadingTransition / EntryExitTransition`.
- **Moti (nếu test pass):** `<MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: index * 80 }} />`; Skeleton: `<Skeleton.Group show={loading}>` + `<Skeleton>` bọc nội dung (cần `expo-linear-gradient`).
- **Boneyard** (https://boneyard.vercel.app/react-native — skeleton tự scan từ UI thật, `stagger` + `transition` props): ý tưởng hay (skeleton pixel-perfect từ màn hình thật) nhưng thêm CLI + build step + file `.bones.json` — **quá nặng cho demo ngày mai, ghi nhận cho backlog sau hackathon**.
- **Quy tắc stagger:** delay 50–80ms/item, cap tổng ≤ 400ms; chỉ stagger 6–8 item đầu, item sau vào cùng lúc; entrance = opacity + translateY(12px) + scale(0.96→1) kết hợp; duration 250–300ms.

### 3.5 Figma → motion (edit được qua Figma?)
- **Kết luận thẳng: motion runtime (Reanimated/GH) KHÔNG edit trực tiếp từ Figma.** Figma chỉ quyết được: duration, easing curve (cubic-bezier), stagger delay, khoảng translate/scale — tức là các *token* trong `design/motion.ts`. Quy trình cho demo: designer chốt 4 số (duration / spring / stagger / distance) trong Figma → dev map 1-1 sang token → đổi token là đổi motion toàn app, không sửa từng component.
- Không tìm thấy skill/template nào cho "Figma variables → Reanimated tokens" tự động, free, cho RN/Expo trong nghiên cứu này — **đây là gap thật, không bịa tool**. Nếu team muốn, hướng làm sau demo: export Figma Variables (REST API — Enterprise-only, và user chỉ có Figma Education, seat type chưa rõ) hoặc copy tay 4 số vào `motion.ts`. Đừng hứa auto-sync cho ngày mai.
- `fig-app-starter-kit`: xem #7 §1 — chưa xác minh được repo/license, không dùng làm căn cứ Figma→motion.

---

## 4. Code snippet mẫu (tối thiểu, chạy được trên SDK 58 — theo docs, chưa chạy thử trong repo này)

### 4.1 Screen transition — `app/_layout.tsx`
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Reanimated 4: babel plugin phải là 'react-native-worklets/plugin' (xem §6)

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0B0F' }, // màu nền theme — chống flash trắng
          freezeOnBlur: true,
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
// Hoặc NativeTabs từ 'expo-router/unstable-native-tabs' (cần test trước demo).
```

### 4.2 Stagger entrance list — Reanimated thuần (fallback chắc chắn, không cần Moti)
```tsx
// components/StaggerList.tsx
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';

const STAGGER_MS = 60;   // token: motion.stagger
const CAP_MS = 360;      // token: tổng stagger không vượt 400ms

export function StaggerList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <>
      {items.map((item, i) => (
        <Animated.View
          key={item.id}
          layout={Layout.springify()} // reorder tự mượt
          entering={FadeInDown.duration(300)
            .delay(Math.min(i * STAGGER_MS, CAP_MS))
            .springify()}
          exiting={FadeOut.duration(200)}
        >
          {/* <Card title={item.title} /> — opacity + translateY đã có trong FadeInDown */}
        </Animated.View>
      ))}
    </>
  );
}
```

### 4.3 Skeleton loading — Moti (chỉ dùng nếu test pass, xem §1 #4)
```tsx
// components/CardSkeleton.tsx — cần: npx expo install moti expo-linear-gradient
import { Skeleton } from 'moti/skeleton';

export function CardSkeleton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Skeleton.Group show={loading}>
      <Skeleton>{children}</Skeleton>
    </Skeleton.Group>
  );
}
// Fallback không-Moti: Animated.View opacity pulse bằng withRepeat(withTiming(...))
// — viết 10 dòng, không thêm dep, dùng khi Moti fail test.
```

### 4.4 Bottom sheet tối thiểu — Gorhom (kèm fallback)
```tsx
// components/DemoSheet.tsx
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
        {/* nội dung tĩnh; list cuộn được thì dùng BottomSheetFlatList */}
      </BottomSheetView>
    </BottomSheet>
  );
}
// Fallback 0-dep: route sheet với presentation: 'formSheet' (§4.1) —
// ưu tiên dùng fallback nếu sheet chỉ mở từ 1 nút và không cần snap point giữa.
```

### 4.5 Motion tokens — `design/motion.ts` (đề xuất, đồng bộ Figma bằng tay)
```ts
// design/motion.ts — 4 số duy nhất designer cần chốt trong Figma
export const motion = {
  duration: { instant: 100, fast: 200, base: 300, slow: 400 },
  stagger: 60,            // ms / item
  staggerCap: 360,        // ms tổng
  spring: {
    default: { damping: 20, stiffness: 300 },
    snappy: { damping: 26, stiffness: 500 },
  },
  entrance: { translateY: 12, scaleFrom: 0.96 },
} as const;
```

---

## 5. Skill/template tổng hợp đề xuất cho kit (để team quyết)

**Đề xuất: tạo `skills/motion/` trong repo (hoặc `.claude/skills/` nếu kit chuẩn Claude Code) gồm 3 file, copy-adapt từ 2 skill #1 — KHÔNG copy nguyên văn toàn bộ skill có license riêng mà không ghi nguồn:**
1. `skills/motion/SKILL.md` — bản rút gọn cho kit: build sequence (gate "có nên animate?" → chọn thread → chọn tool theo bảng §2 → spring/timing → gesture handoff → reduced motion → test release build máy yếu), hard rules (Reanimated không dùng core Animated; screen transition native; tab `animation: 'none'`; ≤300ms; reduced motion ship cùng lúc), + link nguồn gốc (expo/skills, animate-expo, Reanimated docs).
2. `skills/motion/RECIPES.md` — copy pattern từ RECIPES của `animate-expo` (ghi nguồn): press feedback, drag-to-dismiss sheet, swipe-to-delete, collapsing header (native), list entrance (§4.2), keyboard-synced UI, tab indicator, screen transition (§4.1).
3. `design/motion.ts` — tokens §4.5 + `components/motion/` (StaggerList, Pressable scale, Skeleton fallback, DemoSheet wrapper quanh Gorhom để đổi lib không đau).
4. Gate cho demo (thêm vào gate hiện có của kit): **motion gate** — mỗi screen demo phải có: (a) entrance stagger hoặc fade, (b) screen transition native (không flash trắng), (c) ít nhất 1 gesture có velocity handoff (swipe/drag/pinch/sheet), (d) reduced-motion path, (e) quay video trên máy thật (release build) làm bằng chứng — không video = không pass.

**Thứ tự làm trong ngày demo (đề xuất, team quyết):**
1. Cài skill #1 + core stack #2, chạy `npx expo-doctor` (30 phút, làm trước mọi thứ).
2. Áp native transitions §4.1 cho mọi route (0 rủi ro, hiệu quả thấy ngay).
3. Thêm stagger entrance §4.2 cho list chính.
4. Một sheet (formSheet trước; Gorhom chỉ khi cần snap point giữa).
5. Một gesture hero (swipe card hoặc drag-to-dismiss) + haptics.
6. Test Moti — chỉ thêm skeleton Moti nếu pass; không thì skeleton pulse tay.

---

## 6. Rủi ro / cảnh báo — chỉ những gì đã kiểm chứng

| # | Rủi ro | Bằng chứng | Hậu quả nếu dính | Cách tránh |
|---|--------|-----------|------------------|------------|
| R1 | **Babel plugin sai → worklet chết lặng** | Reanimated 4 tách worklets sang `react-native-worklets`; "If you leave `react-native-reanimated/plugin` in babel.config.js, your worklets silently stop being transformed" — hamzashabbir.dev; CheatGrid xác nhận plugin mới là `react-native-worklets/plugin` | Animation không chạy, lỗi cryptic, mất giờ debug | Đổi plugin NGAY khi lên R4; check `babel.config.js` trong gate |
| R2 | **Reanimated 4 chỉ New Architecture** | Docs SWMansion: "Reanimated 4 works only with the React Native New Architecture"; Reanimated 3 "no longer actively maintained" | App cũ/arch cũ crash | SDK 58 mặc định New Arch — xác nhận bằng `global.RN$Bridgeless === true`, không giả định |
| R3 | **Expo Go SDK 58 chưa có sẵn** | Medium/Onix + Instagram SDK 58: "Expo Go for SDK 58 will reach the App Store and Google Play within a few weeks" (Oct 2026) | Demo bằng Expo Go có thể không chạy SDK 58 | **Dùng development build** cho demo ngày mai, không trông chờ Expo Go |
| R4 | **Moti ↔ Reanimated 4 chưa kiểm chứng** | Docs Moti: "you must have Reanimated 3 installed"; bài so sánh 2026 cảnh báo test kỹ trên R4 | Cài xong crash / animation sai | Test cài + chạy trước demo; fallback §4.2 |
| R5 | **Gorhom bottom-sheet chững lại** | Sealambda: bus factor 1, 0 commit/90 ngày, last commit 182 ngày trước, v5.2.14 | Bug mới không ai fix; kẹt API | Wrapper của kit + fallback formSheet |
| R6 | **react-native-sheet-transitions là WIP** | README: "not yet recommended for production use. Breaking changes may occur frequently" | Vỡ API giữa demo | Không dùng; chỉ tham khảo ý tưởng |
| R7 | **fig-app-starter-kit chưa xác minh** | Chỉ có URL cắt ngắn + mô tả YouTube; license/stars/nội dung repo không thấy trong kết quả tìm kiếm; full source trả phí (BuyMeACoffee) | Copy nhầm code trả phí / sai license | Ai đó mở repo xác nhận MIT + đọc README trước khi dùng |
| R8 | **ProMotion 120fps bị cap 60fps** | Skill animate-expo: third-party animations capped 60fps trừ khi `CADisableMinimumFrameDurationOnPhone` được set; "Recent Expo SDKs set it by default — confirm it's there" | Demo trên iPhone ProMotion trông kém mượt hơn kỳ vọng | Confirm flag có trong build trước demo |
| R9 | **Noxcturnal (Rust bundler SDK 58) bỏ qua file Reanimated** | Medium SDK 58: Noxcturnal "skips files needing the Reanimated or Worklets Babel transforms" | Tưởng bundler nhanh nhưng motion file không được hưởng; nhầm tưởng lỗi | Không bật Noxcturnal cho tới khi hiểu rõ; không liên quan trực tiếp demo |
| R10 | **Figma → motion không có auto-sync free** | Không tìm thấy tool/skill nào cho Figma Variables → Reanimated tokens free cho RN/Expo; Variables REST API là Enterprise-only | Hứa auto-sync rồi không làm được | Map tay 4 số token (§4.5); ghi rõ trong plan |
| R11 | **Test trên simulator/dev ≠ thật** | Skill animate-expo: "Feel is judged on a release build on the slowest device you support. Nothing else counts" | Demo trên máy thật giật, mất điểm | Quay + chấm motion trên máy thật, release build |
| R12 | **Gesture + navigation xung đột** | DeepWiki sheet-transitions: phải tắt `gestureEnabled` của router khi sheet tự xử gesture; Gorhom docs tương tự | Kéo sheet thì router back / ngược lại | Một gesture owner duy nhất mỗi vùng màn hình; test kéo-thả thật |

**Những gì CHƯA kiểm chứng được (cần team làm trước demo, không đoán):**
- Vị trí skill chuẩn cho Codex trong kit (`.claude/skills/` là của Claude Code; Codex nhận skill ở đâu chưa xác nhận).
- `npx expo install` có resolve đúng Reanimated 4.7.0 / worklets 0.13.0 / GH 3.2.1 trên SDK 58.0.x hiện tại của repo không — phải chạy `expo-doctor` trên máy build.
- Moti có chạy trên Reanimated 4 + SDK 58 không (R4).
- `NativeTabs` (`expo-router/unstable-native-tabs`) + `formSheet` trên Android hành vi ra sao (R5 ghi chú).
- Repo `fig-app-starter-kit`: URL đầy đủ, license, stars, nội dung (R7).
- Lệnh cài chính xác của `software-mansion-labs/skills` (chưa thấy verbatim).
- Hiệu năng thật trên máy demo (máy gì, release build chưa — R11).

---

## 7. Nguồn (tất cả URL lấy verbatim từ kết quả tìm kiếm, 14/11/2026)

- Skill animate-expo: https://www.skillsdojo.com/skills/emilkowalski/skills/animate-expo
- Skill animate-expo (mirror): https://www.mcpinstall.com/skills/emilkowalski/skills/animate-expo
- expo/skills (RepoRadar): https://reporadar.spreix.com/repos/expo/skills
- Software Mansion best-practices skill: https://www.typingmind.com/skills/software-mansion-labs-react-native-best-practices
- Reanimated docs: https://docs.swmansion.com/react-native-reanimated/
- Reanimated layout transitions: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/
- Reanimated 4 migration: https://www.hamzashabbir.dev/article/reanimated-4-worklets-migration-react-native
- Native feel (6pm, Expo 58 versions): https://at6pm.app/blog/eng-native-feel-expo-reanimated
- Native feel (DEV mirror): https://dev.to/oddeggs/how-we-made-an-expo-app-feel-native-reanimated-4-real-form-sheets-and-haptics-244c
- Gorhom vs Expo Bottom Sheet vs RNSBS: https://www.pkgpulse.com/guides/gorhom-bottom-sheet-vs-expo-bottom-sheet-vs-rnsbs-2026
- Gorhom registry snapshot (stars/license/activity): https://shadcn.sealambda.com/registry/bash/
- Moti overview: https://www.moti.fyi/animations
- Moti skeleton: https://www.moti.fyi/skeleton
- Moti vs Reanimated vs Skia: https://www.pkgpulse.com/guides/react-native-reanimated-vs-moti-vs-skia-animation-2026
- Reanimated vs Moti vs Skia (dev.to): https://dev.to/hugo_rus_630dd942fcf7cc62/reanimated-vs-moti-vs-skia-which-react-native-animation-library-should-you-actually-use-2j7m
- Sheet transitions + Expo Router: https://deepwiki.com/saulsharma/react-native-sheet-transitions/7.4-integration-with-expo-router
- Shared element (Reanimated 3 + Expo Router): https://galaxies.dev/react-native-shared-element-transition-reanimated-3
- SDK 58 what's new: https://medium.com/@onix_react/whats-new-in-expo-sdk-58-803fd0e57e34
- Bottom sheet guide: https://oneuptime.com/blog/post/2026-01-15-react-native-bottom-sheet/view
- Custom transitions (React Navigation): https://oneuptime.com/blog/post/2026-01-15-react-native-custom-transitions/view
- ReadyNative: https://readynative.app/
- Expo starter-pack (dev.to): https://dev.to/amirgazerani_dev/this-is-how-i-start-a-new-project-in-expo-maybe-youll-like-it-too-2pm4
- Fig course / starter pack (YouTube, nguồn duy nhất nhắc fig-app-starter-kit): https://www.youtube.com/watch?v=dRi0hSMB4r8
- obsidian-expo (SDK 58 starter, MIT): https://github.com/rami-maalouf/obsidian-expo
- Boneyard skeleton: https://boneyard.vercel.app/react-native
- Gesture Handler v2 vs PanResponder: https://www.pkgpulse.com/guides/react-native-gesture-handler-v2-vs-panresponder-vs-2026

*Ghi chú phương pháp: stars/installs/version lấy từ snippet kết quả tìm kiếm (crawl tháng 11/2026), không tự chạy `npm view`/`gh` trong nghiên cứu này; mọi con số cần re-check trước khi đưa vào quyết định cuối. Không có code nào trong file này được chạy thử trên repo — snippet §4 viết theo docs, team phải chạy + quay video máy thật trước demo.*
