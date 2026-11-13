# Motion Council Synthesis — Codex Build Day 14/11/2026

- **Council:** tổng hợp 3 báo cáo motion 14/11/2026 (Reanimated+Moti, Lottie+Skia+R3F, Gesture+Transition) + đối chiếu 2 báo cáo 13/11/2026 (frontend-design skills/templates, asset generation).
- **Lệnh:** coordinator Tuấn, 00:03 14/11/2026 — motion là quan trọng NHẤT cho demo Codex ngày mai (Sat 14/11/2026, 09:00, Biblio, build 5 giờ, demo trên điện thoại thật).
- **Phạm vi:** CHỈ tổng hợp + đề xuất. Đây KHÔNG phải quyết định tích hợp — team quyết, rồi mới làm. Không file nào trong 2 file này tự sửa repo/kit.
- **Nguyên tắc:** chỉ dùng thông tin đã kiểm chứng trong 3 báo cáo (và 2 báo cáo 13/11 để đối chiếu). Chỗ nào chưa kiểm chứng ghi rõ **CHƯA VERIFY — cần test máy thật**. Không đoán version/API.
- **Lưu ý về nguồn:** file Lottie+Skia+R3F nhận được **bị cắt cụt ở cuối §5** — các §6 (Figma), §7 (snippet Lottie §7.1 / Skia §7.2), §8 (checklist) mà file đó viện dẫn **không có trong file**. Council KHÔNG coi snippet §7.1/§7.2 là đã kiểm chứng, và template đi kèm không chứa code Skia Canvas hay LottieView đầy đủ vì lý do này.

---

## 0. Quyết định mở đầu — câu hỏi phải trả lời trước 09:00

Mọi verdict dưới đây đều rẽ nhánh theo **1 câu hỏi duy nhất**:

> **Demo ngày mai chạy bằng Expo Go hay development build?**

- **Expo Go** → chỉ dùng Reanimated 4 + Gesture Handler + Skia v2 (nếu test pass) + Skottie built-in (nếu test pass). **Không Lottie-react-native, không dotLottie, không Skia v3, không R3F.**
- **Dev build (build sẵn TRƯỚC giờ demo, không build trong 5 giờ build day)** → thêm được Lottie-react-native (splash/success) — và chỉ Lottie là đáng thêm.
- Nếu tới 09:00 vẫn chưa trả lời được câu này → mặc định **Expo Go**, vì đó là runbook hiện tại của mobile-kit (§4–§5: Expo Go + Metro tunnel).

---

## 1. Verdict từng lib — GO / NO-GO / CONDITIONAL

| # | Lib / kỹ thuật | Verdict cho demo 14/11 | Căn cứ (đã kiểm chứng) | Điều kiện / ghi chú |
|---|---|---|---|---|
| 1 | **Reanimated 4.7.1 + react-native-worklets 0.13.1** | ✅ **GO** | Expo docs SDK 58: "Included in Expo Go", Recommended 4.7.1. Repo 11,070★, MIT, push 13/11/2026. Peer RN 0.86–0.88 + worklets 0.13.x. Cả 3 báo cáo + báo cáo 13/11 đồng thuận. | Cài bằng `npx expo install` (đừng `npm install latest` tay). Bắt buộc New Architecture. Không bật Noxcturnal. |
| 2 | **Gesture Handler ~3.3.0 (SDK 58 pin) + Expo Router native-stack** | ✅ **GO** | Expo docs SDK 58: "Included in Expo Go", Recommended ~3.3.0. Dùng `Gesture.*` API v3 + `presentation: 'formSheet'`, `NativeTabs`, `headerLargeTitle`, `Link.Menu/Preview`. | API v3 khác v2 — snippet gesture cũ (SDK 57 / RNGH 2.32) phải viết lại, không reuse mù. Test lại trên máy thật. |
| 3 | **Expo Skills `expo-animation` (official) + `animate-expo` (emilkowalski)** | ✅ **GO — dạng skill, không phải runtime** | Expo Skills official, MIT; `animate-expo` 175,590 installs (theo MCPInstall, báo cáo gesture). Cả 3 báo cáo đồng thuận dùng làm skill/template. | Không vendor copy skill vào repo khi chưa rõ license (`animate-expo` license CHƯA VERIFY). Cài qua `npx skills`. Khi mâu thuẫn, Expo Skills thắng. |
| 4 | **Skia v2.14.0 (`@shopify/react-native-skia`)** | ⚠️ **CONDITIONAL** | Expo docs SDK latest (crawl 13/11/2026): "Included in Expo Go", Recommended 2.14.0. Repo hiện `wcandillon/react-native-skia` 8,780★, MIT, push 13/11/2026. | Chỉ GO nếu **test pass trên Expo Go 58 + máy demo thật trước 09:00** (xem mâu thuẫn C2). Chỉ dùng primitive có sẵn, không shader custom, không v3. |
| 5 | **Skottie built-in trong Skia 2.1+** | ⚠️ **CONDITIONAL** | Skia 2.1+ tích hợp sẵn Skottie; chạy file Lottie trong Canvas, không thêm native module. Nguồn: notjust.dev + React Native Rewind (báo cáo Lottie). | Chỉ thử nếu Skia đã GO và team cần chạy file Lottie trong Expo Go. CHƯA VERIFY trên SDK 58/Expo Go; danh sách props không hỗ trợ CHƯA VERIFY. Thử Skottie built-in trước, đừng đụng lib riêng. |
| 6 | **Lottie `lottie-react-native` 7.5.0** | ⚠️ **CONDITIONAL — chỉ với dev build** | Repo 17,215★, Apache-2.0, push 04/11/2026; npm 7.5.0; peer RN ≥0.84. Cả 3 báo cáo 14/11 + báo cáo 13/11 đồng thuận: **không chạy trong Expo Go, cần dev build**. | NO-GO nếu demo = Expo Go. GO chỉ khi dev build đã build sẵn trước giờ demo + test pass. Tối đa 1–2 file (splash/success), <50KB, có fallback tĩnh. Nếu `npx expo install` resolve xuống 7.3.x thì theo Expo, đừng ép 7.5.0. |
| 7 | **Shared-element transitions (`sharedTransitionTag`)** | ⚠️ **CONDITIONAL — spike, cắt lúc 13:00 nếu fail** | Reanimated docs + React Navigation docs: **experimental, "not recommended for production use yet"**, cần flag `ENABLE_SHARED_ELEMENT_TRANSITIONS`, chỉ native-stack, không custom animation function trên New Arch. | Chỉ dùng sau khi spike pass trên máy thật (tap navigate + swipe-back iOS). Cách bật flag cho Expo SDK 58 **CHƯA VERIFY** — đây là blocker. Quá 45 phút spike hoặc tới 13:00 chưa xong → cắt, thay bằng `FadeInDown` stagger. Mobile-kit SDK 57 đang BAN — muốn gỡ ban phải có quyết định team + spike pass, không tự gỡ. |
| 8 | **`@gorhom/bottom-sheet` v5.2.14** | ⚠️ **CONDITIONAL — fallback trước** | ~9,1k★, MIT, npm ~700k/tuần. Bus factor 1, 0 commit/90 ngày, last commit 182 ngày trước (báo cáo gesture). | Dùng `formSheet` native trước (0 dep). Chỉ dùng Gorhom khi cần snap point giữa / sheet trong screen (không phải route). Bọc sau wrapper của kit để đổi lib không đau. Docs Gorhom ghi Reanimated 3 — tương thích Reanimated 4 **CHƯA VERIFY**. |
| 9 | **`@lottiefiles/dotlottie-react-native` 0.13.0** | ⚠️ **CONDITIONAL — backup của Lottie** | npm 0.13.0, MIT; engine ThorVG ~150KB; repo players 289★. Chỉ báo cáo Lottie nêu. | Giả định cần dev build như Lottie (CHƯA VERIFY Expo Go). Chỉ chọn nếu cần state machine tương tác trong file `.lottie` mà lottie-react-native không làm gọn. Không phải pick mặc định. |
| 10 | **`margelo/react-native-skottie`** | ⚠️ **CONDITIONAL — chỉ sau Skottie built-in** | Hỗ trợ JSON + DotLottie, điều khiển progress bằng Reanimated shared value; claim +63% fps trên máy Android yếu là **claim của tác giả, chưa kiểm chứng độc lập**. Không hỗ trợ load từ URL; Android release cần ProGuard rules. | Chỉ đụng nếu Skottie built-in thiếu prop cần thiết. Ít docs — phải test trước. |
| 11 | **Moti 0.30.0** | ❌ **NO-GO** | Commit cuối 11/03/2025, npm 0.30.0 từ 29/01/2025, README ghi "powered by Reanimated 3", target Reanimated 3. Peer `react-native-reanimated: '*'` nên npm không chặn — cài được ≠ chạy được. | **Không dùng cho demo SDK 58. Không đưa vào snippet pack. Không tốn giờ build day để test.** Mọi thứ Moti làm, Reanimated presets làm được (dài code hơn chút). Xem mâu thuẫn C5 — council chốt theo báo cáo Reanimated (bằng chứng mạnh nhất). |
| 12 | **R3F `@react-three/fiber` 9.8.2 + three 0.187.0** | ❌ **NO-GO (SKIP)** | Docs chính thức chỉ mô tả R3F **v8** cho React Native; **không có xác nhận v9 + RN + SDK 58**. iOS simulator crash EXC_BAD_ACCESS đã được docs cảnh báo. Bundle nặng nhất. Cả 3 báo cáo + báo cáo 13/11 đồng thuận SKIP. | Chỉ đáng làm khi: (a) product bắt buộc có vật thể 3D tương tác đã chốt trong brief, và (b) đã có dev build + máy thật để test. Không cái nào đúng cho demo ngày mai. Thay bằng 2.5D: parallax/tilt bằng Reanimated + Skia. |
| 13 | **`react-native-sheet-transitions`** | ❌ **NO-GO** | README: "Work in Progress… not yet recommended for production use. Breaking changes may occur frequently." Peer deps wildcard `*`. | Chỉ lấy ý tưởng background-scale để tự làm bằng Reanimated nếu muốn. Không thêm dep. |
| 14 | **Skia v3 (`react-native-skia` 3.10.1)** | ❌ **NO-GO** | Migration guide chính thức: "Expo Go bundles the native code of v2, so v3 needs a development build", "v3 requires a development build. It does not run in Expo Go". Cần Android API ≥26 + Vulkan, iOS ≥15.1. | Không upgrade trước demo. Không cài song song với `@shopify/react-native-skia` (cùng 1 native module). |
| 15 | **RN core `Animated`** | ⚠️ **Chỉ cho việc đơn giản** | Có sẵn, nhưng chạy JS thread, `useNativeDriver` chỉ transform/opacity. | Dùng cho skeleton pulse đơn giản nếu muốn; mọi motion chính phải là Reanimated worklets. Skill `animate-expo`: không dùng core `Animated` cho motion chính. |
| 16 | **fig-app-starter-kit / starter templates** | ❌ **Không làm nền motion** | `noorjsdivs/fig-app-starter-kit`: MIT, chỉ 2★, starter của 1 khóa học YouTube (báo cáo 13/11 đã xác minh repo tồn tại; báo cáo gesture chưa xác minh được URL/license đầy đủ). | Chỉ tham khảo cấu trúc. Lấy pattern từ Expo Examples chính thức (`with-skia`, `with-moti`) khi cần. |

**Một câu cho team:** demo ngày mai chỉ cần **Reanimated 4.7.1 presets + CSS transitions + Gesture Handler 3.3.0 + native-stack/formSheet của Expo Router** — đủ làm entrance, stagger, gesture, sheet, chuyển màn mượt 60fps. Mọi thứ khác là optional, có điều kiện, và phải test trước.

---

## 2. Mâu thuẫn giữa 3 báo cáo — giải quyết + cách xác minh trước 09:00

### C1. Expo Go 58 đã có trên store chưa? — MÂU THUẪN MỞ (quan trọng nhất)

| Nguồn | Nói gì |
|---|---|
| Báo cáo Reanimated §6.4 | Expo changelog SDK 58 (21/10/2026): bản store "will be released within a few weeks" — **nhưng** API versions của Expo (`exp.host/--/api/v2/versions`, đọc 14/11/2026) đã liệt kê Expo Go **58.0.7 (iOS) / 58.0.5 (Android)**. Hai nguồn mâu thuẫn về mặt thời gian. |
| Báo cáo Gesture R3 | Medium/Onix + Instagram SDK 58: "Expo Go for SDK 58 will reach the App Store and Google Play within a few weeks" (Oct 2026) → kết luận **dùng development build, không trông chờ Expo Go**. |
| Báo cáo Lottie | Không nêu trực tiếp Expo Go 58 có trên store chưa; chỉ ghi Reanimated/Skia "Included in Expo Go" theo Expo docs SDK latest. |

**Council kết luận:** **CHƯA GIẢI QUYẾT ĐƯỢC BẰNG ĐỌC DOCS.** API versions liệt kê version không đồng nghĩa app store trên máy demo đã có bản đó (rollout theo vùng/thời gian, cache store). Báo cáo Gesture kết luận "dùng dev build" là suy luận từ nguồn tháng 10 — có thể đã lỗi thời vào 14/11, nhưng không ai trong 3 báo cáo đã mở store trên máy thật để kiểm tra.

**Cách xác minh trước 09:00 (ai đó phải làm, ghi kết quả vào board):**
1. Trên **chính máy demo thật**: mở App Store / Google Play, tìm "Expo Go", xem version hiện tại là bao nhiêu. Chụp màn hình làm bằng chứng.
2. Nếu store hiện 58.x → Expo Go GO cho SDK 58. Nếu vẫn 57.x → **dev build là đường duy nhất cho SDK 58**, build ngay từ sáng, đừng đợi tới giờ demo.
3. Song song: chuẩn bị dev build từ sáng bất kể kết quả store (phòng trường hợp Expo Go 58 có nhưng Skia/Lottie test fail) — dev build là fallback, không phải plan B làm sau.

### C2. Skia có trong Expo Go không? — MÂU THUẪN GIỮA 2 BÁO CÁO + BAN-LIST CŨ

| Nguồn | Nói gì |
|---|---|
| Báo cáo Lottie §4.1, §4.4 | Expo docs SDK latest (crawl 13/11/2026): Skia 2.14.0 **"Included in Expo Go"**, Recommended 2.14.0. |
| Báo cáo 13/11 (frontend-design) | Đồng ý: Expo docs ghi Skia recommended v2.14.0, **có trong Expo Go**. |
| Báo cáo Reanimated §2 (bảng so sánh) | Skia: **"Không có trong Expo Go, cần dev build"** — lặp lại ban-list mobile-kit, không trích Expo docs SDK 58 cho điểm này. |
| mobile-kit v0.1.0 §2 (SDK 57) | Ban Skia: "Heavy native dependency; not in Expo Go, needs a dev build". |

**Council kết luận:** phía "Included in Expo Go" mạnh hơn — trích trực tiếp Expo docs SDK latest, có 2 báo cáo độc lập cùng đọc được, kèm version cụ thể (2.14.0). Phía "không có" chỉ lặp lại ban-list SDK 57 mà không kiểm chứng lại trên docs SDK 58. **Nhưng đây vẫn là kết luận trên giấy, chưa ai chạy thật.** Khả năng hòa giải: ban-list viết cho SDK 57 và ở SDK 57 Skia thật sự chưa vào Expo Go (hoặc chưa verify) — thì ban vẫn đúng cho SDK 57, và sai cho SDK 58.

**Cách xác minh trước 09:00:** chạy 1 màn Skia tối thiểu (Canvas + Circle, theo docs v2) trên Expo Go 58 + máy thật. Pass → unban Skia v2.14.0 **có điều kiện** (chỉ primitive có sẵn, không shader custom). Fail → giữ ban. **Không ai được tự ý sửa skill/ban-list trong ngày build nếu chưa có kết quả test này.**

### C3. RNGH pin SDK 58: 3.3.0 hay 3.2.1? + "v2" hay "v3"? — GIẢI QUYẾT ĐƯỢC

| Nguồn | Nói gì |
|---|---|
| Báo cáo Reanimated + Lottie | Expo docs SDK 58: Recommended **~3.3.0**, "Included in Expo Go". |
| Báo cáo Gesture §1 #2 + baseline | Gọi là "Gesture Handler v2", baseline version **3.2.1** — lấy từ bài blog thứ cấp "Native feel in Expo" (at6pm/dev.to, Expo 58 / RN 0.88), kèm Reanimated 4.7.0 / worklets 0.13.0 / expo-router 58.0.19 / expo-haptics 58.0.6. |
| mobile-kit SDK 57 | Bundle RNGH **2.32**, ban 3.x. |

**Council kết luận:** **3.3.0 thắng** — đó là pin chính thức của Expo docs SDK 58; 3.2.1 chỉ là version mà 1 project trong 1 bài blog dùng, không phải pin. "v2" trong báo cáo Gesture là **thế hệ API** (`Gesture.*` API v2), không phải major version của package — package đã là 3.x. Không có mâu thuẫn thực chất sau khi tách 2 khái niệm này. **Quy tắc thực hành: đừng hard-pin số nào — chạy `npx expo install react-native-gesture-handler` rồi `npx expo-doctor` để Expo resolve theo SDK đang dùng.** Tương tự: Reanimated **4.7.1** (Expo docs + npm) thắng 4.7.0 (blog); worklets **0.13.1** (npm) thắng 0.13.0 (blog). Nếu app demo vẫn ở SDK 57 thì mọi số SDK 58 đều vô hiệu — resolve lại bằng `npx expo install --fix`, không copy số sang.

### C4. Babel plugin: cần config tay hay `babel-preset-expo` tự lo? — GIẢI QUYẾT ĐƯỢC (cả hai đều đúng, tùy project)

| Nguồn | Nói gì |
|---|---|
| Báo cáo Reanimated + Lottie | Không cần config thêm: Babel plugin của Worklets đã tự cấu hình qua `babel-preset-expo`. |
| Báo cáo Gesture R1 | Reanimated 4 tách worklets sang `react-native-worklets`; nếu để `react-native-reanimated/plugin` trong `babel.config.js` thì worklet **chết lặng, không được transform** (nguồn hamzashabbir.dev + CheatGrid). Plugin đúng là `react-native-worklets/plugin`. |

**Council kết luận:** không mâu thuẫn — `babel-preset-expo` tự config **khi project dùng preset và không khai plugin cũ**. Lỗi chỉ xảy ra khi project có `babel.config.js` khai tường minh plugin cũ (thường do upgrade từ Reanimated 3 / copy config cũ). **Gate bắt buộc trước build: mở `babel.config.js`, nếu thấy `react-native-reanimated/plugin` → đổi thành `react-native-worklets/plugin`; nếu chỉ có `babel-preset-expo` và không có plugin cũ → để yên.** Đây là lỗi dễ mắc nhất và khó debug nhất (chết lặng, không báo lỗi rõ).

### C5. Moti: CONDITIONAL hay NO-GO? — COUNCIL CHỐT NO-GO

| Nguồn | Nói gì |
|---|---|
| Báo cáo Reanimated | **NO-GO cứng**: commit cuối 11/03/2025, npm 0.30.0 từ 29/01/2025, README target Reanimated 3, chưa có bằng chứng chạy với Reanimated 4 / RN 0.88. |
| Báo cáo Gesture §1 #4 | CONDITIONAL: chỉ dùng nếu test cài + chạy được trên dev build SDK 58 trước giờ demo; fallback Reanimated thuần. |
| Báo cáo Lottie §4.3 | Mềm nhất: "chỉ dùng nếu team đã quen" — không nêu bằng chứng maintain. |
| Báo cáo 13/11 | CONDITIONAL: test trên máy thật trước 09:00, fail thì bỏ. |

**Council kết luận:** 3 báo cáo sau đều viết trước khi có bằng chứng maintain đầy đủ; báo cáo Reanimated là báo cáo duy nhất tra trực tiếp GitHub API + npm registry trong pass 14/11 và cho ra bằng chứng cứng (8+ tháng không commit, target Reanimated 3). Trong budget 5 giờ, **không đáng tốn 1 phút build day để test 1 lib chết lâm sàng** khi Reanimated presets làm được mọi thứ nó làm. **Chốt: NO-GO cho demo. Không test Moti trong build day.** Skeleton Moti → thay bằng skeleton pulse Reanimated (xem template). Nếu sau demo có người muốn dùng lại Moti: điều kiện là chạy thử Moti 0.30.0 + Reanimated 4.7.1 trên project SDK 58 thật (Expo Go + dev build + máy thật) và ghi lại kết quả — tới lúc đó mới bàn lại.

### C6. Lottie có chạy trong Expo Go không? — ĐỒNG THUẬN, NHƯNG MỨC BẰNG CHỨNG CHƯA TUYỆT ĐỐI

Cả 3 báo cáo 14/11 + báo cáo 13/11 đều đồng ý: **lottie-react-native cần dev build, không chạy trong Expo Go**. Bằng chứng: (a) Expo docs **không có trang SDK nào** cho `lottie-react-native` (trong khi Skia/Reanimated/Gesture Handler đều có trang ghi "Included in Expo Go") — không có trang = không nằm trong native code bundle sẵn của Expo Go; (b) guide dev.to 2025 (cập nhật 31/05/2026) ghi rõ "Lottie does not work in Expo Go (the sandbox app). You need a development build." Một số nguồn content-farm nói ngược lại — **không đáng tin bằng 2 điểm trên**. Council ghi rõ: đây là kết luận làm việc mạnh nhưng **chưa có nguồn chính thức tuyệt đối** (không có câu nào trong Expo docs nói thẳng "Lottie không chạy trong Expo Go"). **Cách xác minh:** nếu team có dev build thì không cần xác minh thêm; nếu team chỉ có Expo Go thì đừng tốn giờ test Lottie — coi như NO-GO, dùng Skottie built-in (nếu Skia GO) hoặc bỏ animation Lottie.

### C7. Token motion: 2 bộ số spring khác nhau — GIẢI QUYẾT ĐƯỢC (không mâu thuẫn, khác tầng)

| Nguồn | Số spring |
|---|---|
| Báo cáo Reanimated §3, §5 | Spring **default của Reanimated**: `damping 120 / mass 4 / stiffness 900` (dùng khi gọi `.springify()` không truyền tham số). Duration base 300ms (preset default), stagger 60ms/item cap 5 item. |
| Báo cáo Gesture §2, §4.5 | Spring **khuyến nghị của skill**: default `{ damping: 20, stiffness: 300 }`, snappy `{ damping: 26, stiffness: 500 }`. Duration instant 100 / fast 200 / base 300 / slow 400. Stagger 60ms, cap tổng ≤400ms (item 7+ cùng delay 360ms). Entrance translateY 12, scale 0.96. |

**Council kết luận:** không mâu thuẫn — bộ thứ nhất là **default ẩn của preset** (bạn nhận được gì khi không truyền gì), bộ thứ hai là **giá trị explicit team nên lock vào token file** khi muốn kiểm soát. Nguy hiểm duy nhất là trộn lẫn không biết: gọi `.springify()` trần thì nhận damping 120/mass 4/stiffness 900; truyền token thì nhận damping 20/stiffness 300 — cảm giác khác nhau rõ. **Template đi kèm lock 1 bộ duy nhất** (bộ của báo cáo Gesture, vì nó phủ đủ 4 mức duration + 2 spring + stagger cap), và ghi rõ: preset mặc định không truyền tham số thì dùng default của Reanimated — muốn đồng nhất thì luôn truyền token.

### C8. Các điểm 2 báo cáo 13/11 bổ sung (không mâu thuẫn với 3 báo cáo 14/11)

- **Impeccable** (skill thiết kế, Apache-2.0, ~109k★): không có trong 3 báo cáo motion 14/11 (ngoài lane), nhưng báo cáo 13/11 xếp #1 cho "đẹp". Council ghi nhận, không verdict ở đây — team quyết riêng. Lưu ý: thiên web hơn mobile, tốn context, chỉ load khi làm UI.
- **unDraw KHÔNG phải CC0** (license riêng: free thương mại, không attribution, cấm redistribute dạng pack / dịch vụ cạnh tranh / train AI) — báo cáo 13/11 sửa lại điểm này; báo cáo asset-generation 13/11 đồng ý. Đừng ghi "CC0" trong docs.
- **`@expo/vector-icons` đã deprecated từ SDK 56** (báo cáo asset-generation): đường migrate chính thức là `@react-native-vector-icons/*` qua codemod. Đừng viết code mới import từ `@expo/vector-icons`. Không ảnh hưởng motion trực tiếp, nhưng builder sẽ đụng khi gắn icon vào màn có motion.
- **LottieFiles free vs trả phí**: file free theo Lottie Simple License (dùng thương mại được, không bắt buộc attribution, không resell file gốc). Luôn filter "Free" trước khi tải; free workspace giới hạn 5 file / 20MB (theo review bên thứ ba 2026 — CHƯA VERIFY trên trang pricing chính thức).
- **fig-app-starter-kit**: báo cáo 13/11 xác minh repo tồn tại (`noorjsdivs/fig-app-starter-kit`, MIT, 2★, push 06/11/2026); báo cáo Gesture chưa xác minh được URL/license đầy đủ. Council lấy bản 13/11 (đã xác minh) — kết luận như nhau: chỉ tham khảo, không làm nền.

---

## 3. Thứ tự ưu tiên trong build day (09:00–14:00, 5 giờ)

Làm theo thứ tự này. **Không làm bước sau khi bước trước chưa pass.** Mỗi bước có điểm dừng (cut) rõ ràng.

| Giờ | Việc | Owner gợi ý | Cut / fallback |
|---|---|---|---|
| **Trước 09:00** | **Gate 0 — trả lời C1 + C2 + C3:** (1) mở store trên máy demo thật, ghi version Expo Go; (2) quyết Expo Go hay dev build; (3) chạy thử 1 màn Reanimated stagger + 1 Canvas Skia tối thiểu trên máy thật. | 1 người, máy demo | Nếu Expo Go vẫn 57.x → dev build ngay. Nếu Skia fail → giữ ban, bỏ Skia khỏi plan. |
| 09:00–09:30 | **Gate 1 — skeleton project SDK 58 + core stack:** `npx create-expo-app --template default@sdk-58` (nếu project mới) → `npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics` → `npx expo-doctor`. Kiểm tra `babel.config.js` (C4). Bọc root bằng `GestureHandlerRootView`. | Mobile | `expo-doctor` báo lỗi version → fix ngay, không code tiếp. Không bật Noxcturnal. |
| 09:30–10:00 | **Bước 1 — native transitions cho mọi route (0 rủi ro, hiệu quả thấy ngay):** `app/_layout.tsx` + từng `Stack.Screen options` (template §3). `contentStyle` màu nền theme chống flash trắng, `freezeOnBlur: true`, tab `animation: 'none'`. | Mobile | — |
| 10:00–10:45 | **Bước 2 — stagger entrance cho list/màn chính:** preset `FadeInDown` + token (template §4). Chỉ stagger 6–8 item đầu, cap tổng ≤400ms. | Mobile | — |
| 10:45–11:15 | **Bước 3 — 1 gesture hero + haptics:** 1 trong 2: swipe-to-dismiss card HOẶC drag-to-dismiss sheet (template §5–§6). Kèm `expo-haptics` (impact light / selection). | Mobile | Gesture giật → kiểm tra chỉ animate transform + opacity; bỏ ngay nếu xung đột với navigation gesture (1 gesture owner / 1 vùng màn hình). |
| 11:15–11:45 | **Bước 4 — 1 sheet:** `formSheet` trước (route sheet). Chỉ thêm Gorhom khi cần snap point giữa / sheet trong screen. | Mobile | Gorhom fail test → quay về formSheet, không debug quá 30 phút. |
| 11:45–12:15 | **Bước 5 — skeleton/loading + press feedback:** skeleton pulse Reanimated (template §7) + press scale (template §8). | Mobile | — |
| 12:15–13:00 | **Spike shared-element (CHỈ nếu còn giờ + có người rảnh):** tìm cách bật flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` → test tap + swipe-back. | 1 người, tách riêng | **13:00 HARD CUT** (xem §4). Fail/quá 45 phút → cắt, quay về stagger. Không để spike này chặn các bước khác. |
| 13:00–13:30 | **Bước 6 — Skia/Lottie (CHỈ nếu Gate 0 pass):** Skia: 1 hiệu ứng duy nhất (progress ring hoặc loader). Lottie: chỉ khi dev build sẵn + test pass — tối đa 1 file success/splash. Skottie: chỉ khi Skia GO và cần file Lottie trong Expo Go. | 1 người, tách riêng | Bất kỳ cái nào fail → cắt không tiếc, demo vẫn đủ motion từ bước 1–5. |
| 13:30–14:00 | **Gate cuối — release build + quay video:** chạy **release/production mode** ít nhất 1 lần, quay video motion trên máy thật (máy yếu nhất team hỗ trợ nếu có 2 máy). | Cả team | Dev mode chậm hơn — đừng chấm độ mượt bằng dev mode. Không video = không pass motion gate. |

**Nguyên tắc xuyên suốt:** motion pass cho **slice trước, cái gì sau** — entrance + transition + 1 gesture là "motion tối thiểu cho mọi slice"; Skia/Lottie/shared-element là "wow thêm vào" và luôn làm sau, luôn có fallback, luôn cắt được mà không vỡ demo. Không slice nào được phép phụ thuộc vào 1 lib CONDITIONAL chưa test pass.

---

## 4. Danh sách PHẢI test trên máy thật trước demo

> Quy tắc chung (skill `animate-expo`, cả 3 báo cáo đồng thuận): **"Feel" chỉ được tính trên release build, máy yếu nhất team hỗ trợ. Không tính simulator, không tính flagship ở dev mode.** Test trên simulator/dev ≠ thật.

| # | Test | Pass khi | Trạng thái hiện tại |
|---|---|---|---|
| T1 | **Expo Go version trên máy demo thật** (C1) | Store hiện Expo Go 58.x, hoặc đã quyết dùng dev build + dev build đã build xong | ☐ CHƯA VERIFY — phải làm trước 09:00 |
| T2 | **`npx expo install` + `npx expo-doctor`** trên project SDK 58 thật | Không báo lỗi version; Reanimated 4.7.1 / worklets 0.13.x / RNGH ~3.3.0 resolve đúng | ☐ CHƯA VERIFY — chưa ai chạy trong repo này |
| T3 | **Stagger entrance (§4 template) trên máy thật** | List vào mượt, không drop frame, delay đúng token; test cả iOS + Android nếu có 2 máy | ☐ CHƯA VERIFY — snippet chỉ đối chiếu docs, chưa chạy |
| T4 | **Gesture hero (§5–§6 template): Pan mượt, dismiss đúng ngưỡng** | Kéo mượt 60fps, vượt ngưỡng 120px (hoặc 35% chiều rộng màn hình — xem template) thì dismiss, không thì spring về 0; không xung đột với navigation gesture | ☐ CHƯA VERIFY |
| T5 | **Native transitions: không flash trắng, tab không slide** | Chuyển màn không flash trắng; tab switch `animation: 'none'`; `formSheet` kéo/dismiss đúng native (iOS); kiểm tra hành vi Android của formSheet (CHƯA VERIFY trong báo cáo Gesture) | ☐ CHƯA VERIFY |
| T6 | **Dev build vs Expo Go — quyết định nào thì test đúng cái đó** | Nếu demo = Expo Go → mọi test trên chạy trong Expo Go. Nếu demo = dev build → mọi test chạy trên dev build đã build sẵn, không test bằng Expo Go rồi suy ra dev build chạy được | ☐ CHƯA VERIFY |
| T7 | **Shared-element spike — flag `ENABLE_SHARED_ELEMENT_TRANSITIONS`** | Tìm được cách bật flag cho Expo SDK 58 + chạy được cả tap navigate VÀ swipe-back iOS; chỉ native-stack, không tab | ☐ CHƯA VERIFY — **cách bật flag chưa ai biết**; HARD CUT 13:00 |
| T8 | **Skia v2.14.0 trên Expo Go 58 (C2)** | 1 Canvas tối thiểu chạy được trong Expo Go trên máy thật | ☐ CHƯA VERIFY |
| T9 | **Lottie (chỉ nếu dev build)** | File Lottie chạy được trên dev build + máy thật; có fallback tĩnh nếu file hỏng; file <100KB, splash 1–3s | ☐ CHƯA VERIFY |
| T10 | **Skottie built-in (chỉ nếu Skia GO + cần Lottie trong Expo Go)** | File Lottie chạy trong Skia Canvas trên Expo Go; liệt kê prop nào không hỗ trợ (nếu có) | ☐ CHƯA VERIFY |
| T11 | **Release/production mode, ít nhất 1 lần** | Build release chạy mượt, quay được video làm bằng chứng | ☐ CHƯA VERIFY |
| T12 | **Babel plugin (C4)** | `babel.config.js` không còn `react-native-reanimated/plugin`; worklet chạy (animation thực sự chạy, không chết lặng) | ☐ CHƯA VERIFY |
| T13 | **New Architecture** | Xác nhận `global.RN$Bridgeless === true` (theo báo cáo Gesture) — không giả định chỉ vì SDK 58 mặc định bật | ☐ CHƯA VERIFY |
| T14 | **ProMotion 120fps (iPhone ProMotion, nếu máy demo là iPhone Pro)** | Confirm flag `CADisableMinimumFrameDurationOnPhone` có trong build (skill `animate-expo`: "Recent Expo SDKs set it by default — confirm it's there") | ☐ CHƯA VERIFY |
| T15 | **Reduced motion** | `useReducedMotion()`: giữ opacity/color, bỏ translate/scale/parallax/overshoot; screen transition về `animation: 'fade'` | ☐ CHƯA VERIFY |
| T16 | **Moti — CẤM THỬ** | Không ai được tốn giờ build day test Moti. Nếu có người đề xuất lại → trỏ vào verdict #11 + C5. | — (quyết định council, không cần test) |
| T17 | **Gorhom (chỉ nếu dùng)** | Sheet mở/đóng mượt trên Reanimated 4 + SDK 58; `BottomSheetFlatList` cho list trong sheet, không dùng FlatList thường | ☐ CHƯA VERIFY |
| T18 | **Skia v3 / R3F — CẤM THỬ trong build day** | Không upgrade Skia lên v3, không cài R3F. Nếu có người đề xuất → trỏ verdict #12/#14. | — (quyết định council) |

---

## 5. Những gì council KHÔNG quyết (để team quyết trước 09:00)

1. **Expo Go hay dev build?** (C1) — quyết định này kéo theo Lottie GO/NO-GO và Skia test path.
2. **App demo ở SDK 57 hay SDK 58?** — mobile-kit hiện pin SDK 57; mọi version trong file này là SDK 58. Nếu app vẫn SDK 57: Reanimated 4.3–4.5 / worklets 0.8–0.10, RNGH 2.32, Skia giữ ban cho tới khi test trên Expo Go SDK 57.
3. **Giữ hay gỡ ban shared-element?** — chỉ gỡ sau spike pass (T7).
4. **Unban Skia v2?** — chỉ sau test pass (T8).
5. **Có dùng Gorhom không, hay chỉ formSheet?** — formSheet là mặc định; Gorhom chỉ khi cần snap point giữa.
6. **Có dùng dev build để lấy Lottie không?** — chỉ đáng nếu dev build đã có sẵn trước giờ demo; không build dev build trong 5 giờ build day chỉ để lấy 1 animation success.

---

## 6. Nguồn (chỉ những file đã đọc — không nghiên cứu thêm)

- `motion-reanimated-moti-research-20261114.md` — Reanimated 4 + Moti, 14/11/2026 ~00:05–00:25
- `motion-lottie-skia-r3f-research-20261114.md` — Lottie + Skia + R3F, 14/11/2026 ~00:05–00:30 (**bị cắt cụt ở cuối §5; §6–§8 không có trong file nhận được**)
- `motion-gesture-transition-research-20261114.md` — Gesture / Transition / Entrance, 14/11/2026 ~00:05–00:20
- `frontend-design-skills-templates-research-20261113.md` — đối chiếu, 13/11/2026
- `asset-generation-research-mie-20261113.md` — đối chiếu, 13/11/2026

*Mọi số version/star/ngày push trong file này đều lấy lại từ 5 file trên, không tra thêm nguồn mới. Snippet trong file template đi kèm chỉ lấy từ snippet đã có trong 3 báo cáo 14/11 (ghi rõ nguồn từng snippet); chỗ nào chưa chạy thật thì ghi "CHƯA CHẠY THẬT".*
