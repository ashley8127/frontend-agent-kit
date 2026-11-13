# Nghiên cứu asset generation — Codex Build Day 14/11/2026

- **Người làm:** Mie (MIE) — theo lệnh trực tiếp của coordinator Phạm Tuấn, 23:50 ngày 13/11/2026
- **Ngày nghiên cứu:** 13/11/2026 (đêm trước build day)
- **Phạm vi:** chỉ nghiên cứu + đề xuất. **KHÔNG tích hợp gì vào repo.** Team tự quyết định sáng 14/11.
- **Bối cảnh:** app Expo SDK 58 (React Native), demo trên điện thoại thật. Cần: hero images, empty states, success illustrations, app icon, backgrounds. **Free-only, không paid plan.** Ưu tiên sửa được trong Figma (khuyến khích, không bắt buộc). Image-gen API có paywall/quota **không** được làm đường chính.
- **Quy ước trong báo cáo:** ✅ = xác nhận đúng pick của crawler Tuấn (23:54); 🆕 = ứng viên mới do Mie tìm thêm; ⚠️ = rủi ro cần lưu ý.

---

## 1. Khuyến nghị xếp hạng (đọc phần này là đủ để quyết)

### 🥇 Pick 1 — unDraw + react-native-svg (ảnh minh họa chính) ✅ XÁC NHẬN
- **Dùng cho:** hero, empty state, success — lấy 3–6 ảnh tối nay như Tuấn đã dặn.
- **Vì sao:** miễn phí hoàn toàn, không cần attribution, recolor 1 click theo brand color ngay trên web, SVG tải về dùng thẳng được trong RN qua `react-native-svg`.
- **Cách dùng nhanh nhất (không cần package trung gian):** vào undraw.co → chọn màu brand → tải SVG → bỏ file vào `assets/` → import bằng `react-native-svg-transformer`, hoặc paste chuỗi SVG vào `<SvgXml>` (zero-config). Xem §3.1.
- **Lưu ý:** package `iblis-react-native-undraw` **tồn tại thật** (1.263 illustrations) nhưng là package cộng đồng nhỏ, **không xác minh được lần publish gần nhất** — đừng phụ thuộc vào nó; tải SVG trực tiếp an toàn hơn và luôn có bản mới nhất.

### 🥈 Pick 2 — Lucide (icon set duy nhất) ✅ XÁC NHẬN, chọn Lucide thay vì Hugeicons
- **Dùng cho:** toàn bộ icon UI trong app — chỉ dùng **một** set duy nhất.
- **Vì sao chọn Lucide thay vì Hugeicons:** cả hai đều có package RN chính thức, nhưng Lucide là ISC license (thoáng nhất), ~1.500–2.000 icons, `lucide-react-native` + `react-native-svg`, tree-shakeable, không có paywall nào rình rập (Hugeicons chỉ free 1 style Stroke Rounded; 9 style còn lại + 54.000 icons là Pro trả phí — dễ vô tình đụng paywall lúc đang vội). Lucide cũng có Figma plugin.
- **Cài:** `npx expo install lucide-react-native react-native-svg` rồi `import { Home } from 'lucide-react-native'`.
- **Nếu team thích style Hugeicons hơn** thì vẫn dùng được (package `@hugeicons/react-native` + `@hugeicons/core-free-icons` là thật, có docs Expo chính thức), nhưng phải nhớ: chỉ dùng icon trong gói free, đừng bấm sang Pro.

### 🥉 Pick 3 — logo-design-skill (logo + app icon, vẽ bằng SVG, không tốn API) 🆕 MỚI
- **Dùng cho:** logo app + app icon 1024×1024 cho `app.json` (Expo chỉ cần `icon.png` + `adaptive-icon.png`).
- **Vì sao:** MIT, ~2.800 stars GitHub, chạy trên Claude Code / Gemini CLI / Codex, **vẽ logo bằng code SVG hình học** (không gọi image-gen API trả phí), test logo ở 16px, xuất full brand kit (app icon, favicon, palette, guidelines). Đây là lựa chọn free-only đúng nghĩa cho đêm nay.
- **Cài:** `/plugin marketplace add kaankiziltug/logo-design-skill` rồi `/plugin install logo-design@logo-design-skill` (hoặc copy thư mục `skills/logo-design` vào agent skills).
- **Cảnh báo:** skill của Code with Beto mà Tuấn trích dẫn (23:51) **cũng tồn tại thật**, nhưng nó sinh icon bằng SnapAI dùng **OpenAI image models → cần API key/credit OpenAI**, nên **không** đạt tiêu chí free-only — chỉ dùng nếu team đã có sẵn OpenAI credit. Xem §4.3.
- **Sau khi có file 1024 PNG:** dùng appicon.co hoặc thedevtoolset.com (free, chạy trong browser, không upload) để cắt ra đủ size, hoặc với Expo thì chỉ cần 2 file trên là đủ.

### Dự phòng nhanh (nếu pick chính kẹt)
- **Minh họa thêm / khác style:** ManyPixels (20.000+ ảnh, 5 style, free, không attribution) — backup tốt nhất cho unDraw. Humaaans / Open Peeps (CC0, Figma) nếu cần nhân vật tự ghép.
- **Background:** fffuel ✅ (xác nhận) — nhưng chỉ dùng blob/wave SVG đơn giản; Haikei 🆕 là backup dễ dùng hơn (UI đẹp, export SVG/PNG, free 15 generator).
- **Animation success (nice-to-have):** 1 file Lottie free từ LottieFiles + `lottie-react-native` — **chỉ nếu** demo bằng dev build, **không** dùng được chắc chắn trên Expo Go; test sớm, bỏ ngay nếu kẹt.
- **Logo thương hiệu (Claude, GitHub…):** Simple Icons ✅ (CC0, có cả Claude) — chỉ lấy logo, không dùng làm icon UI.

---

## 2. Nền tảng kỹ thuật chung (áp cho mọi asset SVG)

RN **không** render SVG bằng `<Image>` mặc định. Có 3 cách, xếp theo độ ưu tiên cho build day:

| Cách | Khi nào dùng | Ghi chú |
|---|---|---|
| `react-native-svg` + `<SvgXml xml={...}>` | 1–6 ảnh lẻ (unDraw, fffuel) | **Zero-config**, paste chuỗi SVG vào code. Tốt nhất cho đêm nay. `npx expo install react-native-svg` |
| `react-native-svg` + `react-native-svg-transformer` | Nhiều file SVG, muốn `import Hero from './hero.svg'` | Cần sửa `metro.config.js` (`babelTransformerPath: require.resolve('react-native-svg-transformer/expo')`, bỏ `svg` khỏi `assetExts`). Transformer v1.5.1 (05/2025), dùng được với Expo SDK 51+. |
| `expo-image` | Ảnh raster (PNG/JPG/WebP, ảnh stock) | Hỗ trợ SVG qua native libs, nhưng không tùy biến màu được như 2 cách trên. |

⚠️ **@expo/vector-icons đã deprecated — xác nhận đúng.** Docs Expo ghi rõ: *"`@expo/vector-icons` will be deprecated and is not recommended. Learn more about migrating to `@react-native-vector-icons`."* Deprecated từ SDK 56. Đường migrate chính thức: chạy codemod `npx @react-native-vector-icons/codemod` rồi `npx expo-doctor`, import từ các package scoped `@react-native-vector-icons/*` (vd `@react-native-vector-icons/lucide`, `@react-native-vector-icons/ionicons`). **Đừng viết code mới import từ `@expo/vector-icons`.**

⚠️ **SVG phức tạp có thể không render trong RN.** `react-native-svg` không hỗ trợ đầy đủ filter SVG (`feTurbulence`, blur, mesh gradient). Hệ quả: blob/wave SVG đơn giản (fffuel ssshape/sssurf, Haikei blob/wave) → OK; mesh gradient / grain / noise (fffuel ffflux/gggrain, Haikei blurry gradient) → **rủi ro vỡ hình, nên export PNG** thay vì dùng SVG, hoặc tránh hẳn.

---

## 3. Xác minh các pick của crawler Tuấn (23:54)

### 3.1 unDraw — ✅ XÁC NHẬN, là best pick
- **Là gì:** thư viện minh họa SVG mở, 1.500+ hình, tìm theo keyword, đổi accent color 1 click trước khi tải.
- **Nguồn:** https://undraw.co
- **License:** custom license riêng — free cho personal + commercial, **không cần attribution**; cấm: bán lại thành pack, làm dịch vụ cạnh tranh, dùng train AI. (Không phải MIT — nhưng đủ thoáng cho hackathon/demo.)
- **Figma:** không có plugin chính thức mạnh; workflow là tải SVG → import vào Figma / vào code. Đổi màu thì làm trên web trước khi tải.
- **Package RN `iblis-react-native-undraw`:** tồn tại thật — npm/skypack mô tả *"React Native component library for undraw.co (1263 illustrations)"*, dùng `import { Svg3DModeling } from 'iblis-react-native-undraw'`, peer dep là `react-native-svg`. ⚠️ **Không xác minh được lần publish/cập nhật gần nhất** (không tra được npm metadata trong đợt này), repo cộng đồng 1 maintainer. **Khuyến nghị: không dùng package này; tải SVG trực tiếp từ undraw.co** — luôn mới, không phụ thuộc maintenance, không tăng bundle với 1.263 hình không dùng tới.
- **Rủi ro:** style unDraw rất nhận diện được ("nhìn là biết unDraw"), ít hình cho chủ đề nông nghiệp/tài chính chuyên sâu; SVG đôi khi dùng gradient/mask — test render 1 hình trước khi lấy hàng loạt.

### 3.2 fffuel — ✅ XÁC NHẬN, làm backup background
- **Là gì:** bộ ~40–70 generator SVG chạy hoàn toàn client-side trong browser: blob (ssshape), wave (sssurf), mesh gradient (uuunion), grain (gggrain), pattern (pppattern), v.v.
- **Nguồn:** https://fffuel.co — free, **không cần tài khoản**, không watermark, export SVG hoặc copy markup.
- **License:** các shape trong bộ sưu tập được ghi MIT (vd trang dddivided ghi rõ *"free for both personal and commercial projects and licensed under MIT"*); code nguồn mở trên GitHub.
- **Dùng trong RN:** SVG output → dùng qua `react-native-svg` như §2. ⚠️ Chỉ blob/wave/pattern đường path đơn giản mới an toàn; mesh/grain/noise dùng filter → export PNG hoặc bỏ qua (xem §2).
- **Figma:** không có plugin; workflow là tạo trên web → tải SVG → import Figma/RN.
- **Rủi ro:** không có gì paywall; rủi ro duy nhất là SVG filter không render (đã nêu) và chất lượng thẩm mỹ tùy tay chỉnh slider.

### 3.3 Hugeicons vs Lucide — ✅ CẢ HAI ĐỀU TỒN TẠI, khuyên chọn Lucide
| Tiêu chí | Hugeicons | Lucide |
|---|---|---|
| Package RN | `@hugeicons/react-native` + `@hugeicons/core-free-icons` — **tồn tại, có docs Expo chính thức** | `lucide-react-native` — **tồn tại, ISC** |
| Cài đặt | `npm install @hugeicons/react-native @hugeicons/core-free-icons react-native-svg` (Expo cần thêm `types` trong tsconfig.json để có autocomplete) | `npx expo install lucide-react-native react-native-svg` |
| Số icon free | 4.000–6.000 (con số thay đổi theo nguồn; chỉ 1 style Stroke Rounded) | ~1.500–2.000 |
| License | Renderer MIT; **icon Pro (60.000+, 9 style còn lại) trả phí** | **ISC toàn bộ, không có tier trả phí** |
| Figma | Có Figma plugin + file | Có Figma plugin |
| Rủi ro | Dễ bấm nhầm icon Pro lúc vội; package RN mới (2025), cộng đồng nhỏ hơn | Ít icon hơn, style tối giản (không có style solid/duotone) |

**Kết luận:** chọn **Lucide** (an toàn tuyệt đối về license + không paywall). Hugeicons chỉ chọn nếu team đã quen style của nó và cam kết chỉ dùng gói free.

### 3.4 Simple Icons (logo thương hiệu, gồm Claude) — ✅ XÁC NHẬN
- **Là gì:** 3.400+ logo thương hiệu dạng SVG đơn sắc (1 path) + mã màu hex chính thức của brand.
- **Nguồn:** https://simpleicons.org — npm `simple-icons`, GitHub `simple-icons/simple-icons` (~26k stars).
- **License:** **CC0 1.0** cho file SVG (public domain). ⚠️ CC0 chỉ cover file SVG, **không** cover quyền trademark — dùng logo Claude/GitHub… để chỉ integration thì OK, đừng imply được endorse.
- **Có Claude không:** có — mục lục của Simple Icons gồm cả `Claude` và `Claudecode`.
- **Dùng trong RN:** SVG đơn sắc → render qua `react-native-svg` (đổi `fill` theo màu brand hex đi kèm), hoặc convert sang PNG.
- **Lưu ý:** chỉ có bản đơn sắc; cần logo màu đầy đủ thì xem thêm theSVG (§4.5).

### 3.5 "Không dựa vào image-gen API free" — ✅ XÁC NHẬN
- Pollinations bị paywall sau ~1 ảnh và Gemini API hết quota — khớp với báo cáo của crawler; Mie không kiểm chứng lại từng API vì **kết luận không đổi**: image-gen API không làm đường chính được. Mọi pick trong báo cáo này đều không cần API key.

---

## 4. Ứng viên MỚI do Mie tìm thêm

### 4.1 ManyPixels — 🆕 minh họa backup tốt nhất cho unDraw
- **Là gì:** gallery 20.000+ minh họa, 5 style (Playstroke, Birdview isometric, Chromablue, Colossalflat, Azureline), tìm theo chủ đề + chọn màu.
- **Nguồn:** https://www.manypixels.co/gallery
- **License:** free personal + commercial, **không cần attribution**; cấm redistribute thành pack / làm dịch vụ cạnh tranh. (Gallery free tách biệt với dịch vụ design trả phí của họ.)
- **Dùng trong RN:** PNG tải thẳng từ gallery; **SVG lấy qua sister site Pixels Market (cần free account)** — nếu cần SVG thì tạo account free trước, hoặc dùng PNG cho nhanh.
- **Figma:** import file tải về như thường.
- **Khi nào dùng:** khi unDraw không có đúng chủ đề cần (vd cảnh nông nghiệp, bản đồ, thiết bị IoT…), hoặc muốn style isometric/3D khác biệt với unDraw.

### 4.2 Humaaans + Open Peeps + Open Doodles — 🆕 nhân vật ghép trong Figma
- **Humaaans** (https://humaaans.com): mix-&-match người (đầu/thân/chân/quần áo) của Pablo Stanley, thư viện Figma/Sketch, license **CC0**. Chỉ có nhân vật, không có cảnh nền.
- **Open Peeps** (https://openpeeps.com): cùng tác giả, style hand-drawn, 584.000+ tổ hợp, **CC0**, SVG/PNG, dùng trực tiếp hoặc qua plugin Blush trong Figma.
- **Open Doodles** (https://opendoodles.com): doodle tay sketchy, SVG/PNG/GIF, free commercial, **không cần attribution**, có công cụ đổi màu.
- **Dùng cho:** onboarding, empty state có nhân vật, màn "chưa có dữ liệu" thân thiện. **Nhược:** cần thời gian ghép trong Figma (không có sẵn cảnh hoàn chỉnh như unDraw) → chỉ dùng nếu có người rảnh làm Figma song song.

### 4.3 logo-design-skill — 🆕 logo + app icon (xem Pick 3 ở §1)
- **Là gì:** skill cho AI agent (Claude Code, Gemini CLI, Codex…) biến agent thành logo designer: brief → 12 concept SVG → test ở 16px → chọn 1 → xuất full kit (logo, app icon, favicon, palette, mockup, brand guidelines).
- **Nguồn:** https://github.com/kaankiziltug/logo-design-skill — **MIT**, ~2.800 stars (10/2026), repo tạo 26/09/2026, release vẫn cập nhật (ghi nhận tới cuối 10/2026).
- **Cài:** `/plugin marketplace add kaankiziltug/logo-design-skill` + `/plugin install logo-design@logo-design-skill`; hoặc `npx skills add kaankiziltug/logo-design-skill --skill logo-design -g -a claude-code`; hoặc clone repo copy thư mục `skills/logo-design`.
- **Vì sao hợp build day:** vẽ SVG bằng hình học (không cần image-gen API), có sẵn thư viện tham khảo 1.400+ logo thật để tránh trùng, script Python không cần dependency để export variant. ⚠️ Export PNG cần 1 renderer có sẵn trên máy (cairosvg / rsvg-convert / Inkscape / Chromium) — kiểm tra trước trên MacBook; nếu không có thì export SVG rồi convert trong Figma.
- **Khác với skill App Icon của Beto:** xem §4.4 ngay dưới.

### 4.4 App Icon skill — Code with Beto (Tuấn trích 23:51) — ⚠️ TỒN TẠI NHƯNG CẦN OPENAI CREDIT
- **Là gì:** skill `app-icon` trong repo https://github.com/code-with-beto/skills — 1 prompt sinh app icon, xuất file `.icon` (Icon Composer, iOS 26) + adaptive icon Android, hỗ trợ dark/clear/tinted variants.
- **Cài:** `npx skills add code-with-beto/skills` hoặc `agx skills add https://github.com/code-with-beto/skills --skill app-icon`, rồi gọi `/app-icon ...`.
- **Nguồn xác minh:** blog https://codewithbeto.dev/blog/introducing-code-with-beto-skills (28/01/2026) + video demo của Beto.
- **⚠️ Rủi ro quyết định:** skill sinh ảnh bằng **SnapAI dùng OpenAI image models** → cần OpenAI API key/credit. **Không đạt tiêu chí free-only** nếu team chưa có sẵn credit. Demo gốc dùng Expo SDK 55 (tác giả nói format "should also work with SDK 54") — **chưa có xác nhận cho SDK 58**, cần test. **Khuyến nghị:** chỉ dùng nếu team đã có OpenAI credit; nếu không, dùng logo-design-skill (§4.3) + resizer free (§4.6).

### 4.5 theSVG — 🆕 logo thương hiệu bản màu (backup cho Simple Icons)
- **Là gì:** 7.600+ logo thương hiệu, **bản màu đầy đủ** (mỗi brand có tới 5 variant: default/dark/light/wordmark/mono), npm `thesvg`, có MCP server cho AI agent.
- **Nguồn:** https://thesvg.org — GitHub `GLINCKER/thesvg`, **MIT**, không cần account/key.
- **Khi nào dùng:** khi Simple Icons (đơn sắc) không đủ — vd cần logo Claude/GitHub màu thật trên nền tối. Trademark caveat giống Simple Icons.
- **Nhược:** project mới (2026), cộng đồng nhỏ hơn Simple Icons; một số brand niche có thể thiếu.

### 4.6 App icon resizer free (không AI) — 🆕 đường nhanh nhất ra icon Expo
Expo thực ra chỉ cần **2 file** trong `app.json`: `icon` (1024×1024 PNG, **không trong suốt, không bo góc** — iOS tự bo) và `android.adaptiveIcon.foregroundImage` (1024 PNG trong suốt, artwork nằm trong safe zone 66dp giữa). Có master 1024 rồi thì dùng 1 trong các tool sau (đều free, chạy trong browser, không upload ảnh lên server):
- **appicon.co** — free, không cần account, ~43 size Apple + Android, có Contents.json.
- **thedevtoolset.com/tools/app-icon-generator** — free, có export riêng cho Expo (icon 1024 + adaptive foreground), Contents.json cho Xcode.
- **Expo Icon Generator (360solution.io)** — free, upload 1 logo → ZIP gồm `icon.png`, `adaptive-icon.png`, `splash.png`, `favicon` + file `app.json` mẫu.
- ⚠️ Tránh AppIconKitchen (chỉ 2 credit free rồi $4.99/50 credits) và các AI icon generator giới hạn 5 lượt/ngày (Superapp…) — không cần thiết khi đã có file 1024.

### 4.7 Haikei — 🆕 background backup, dễ dùng hơn fffuel
- **Là gì:** web app tạo SVG background: blob, wave, blurry gradient, circle scatter, stacked peaks… 15 generator free, chỉnh màu/size trực tiếp, export SVG/PNG.
- **Nguồn:** https://haikei.app — free, **không signup, không thẻ**, commercial OK, **không cần credit** (chỉ cấm dùng Haikei để làm dịch vụ generator tương tự).
- **Nhược:** ⚠️ development có vẻ **dormant từ ~2022** (blog/changelog không cập nhật), Pro plan "sắp ra" (export code snippet JSX… sẽ trả phí) — nhưng 15 generator free hiện tại vẫn chạy tốt. Cùng cảnh báo SVG filter như fffuel (§2): blurry gradient/mesh → export PNG.
- **Khi nào dùng:** khi cần background đẹp trong 2 phút mà không muốn mò slider của fffuel.

### 4.8 LottieFiles (animation success/loading) — 🆕 nice-to-have, có điều kiện
- **Là gì:** thư viện animation Lottie (JSON) free — 1.900+ animation success; file nhỏ (~15KB .lottie).
- **Nguồn:** https://lottiefiles.com — cần **free account** để tải; kiểm tra license từng animation trước khi ship.
- **Dùng trong RN:** `npx expo install lottie-react-native`, bỏ JSON vào `assets/`, render bằng `<LottieView source={require(...)} autoPlay loop={false} />`.
- **⚠️ Rủi ro quyết định:** nhiều nguồn ghi **Lottie không chạy trong Expo Go, cần development build**. Nếu ngày mai demo bằng Expo Go → **đừng dùng**. Chỉ dùng nếu team build dev build và test chạy được trước giờ demo. Tối đa 1 animation (success check) — đừng ôm nhiều.

### 4.9 Icon set dự phòng (nếu Lucide thiếu icon cần) — 🆕
Chỉ tham khảo, **không trộn nhiều set trong 1 app**:
- **Phosphor Icons** — MIT, 1.512 icons × 6 weights (thin → fill), package `phosphor-react-native` v3.0.6 (04/2026) + `react-native-svg`, tree-shakeable, có Figma plugin. Mạnh khi cần đổi weight (vd icon đậm cho tab active).
- **Tabler Icons** — MIT, 6.287 icons, package `@tabler/icons-react-native`, stroke 2px, 24px grid. (Một nguồn nói không cần `react-native-svg` — **chưa xác minh**, kiểm tra trước khi dùng.)
- **Iconoir** — MIT, ~1.670 icons, package `iconoir-react-native` + `react-native-svg`, có Figma/Framer, style tối giản gần Lucide.
- **@react-native-vector-icons/lucide** — cùng icon Lucide nhưng dạng **font** (thay vì SVG component), đi theo đường migrate chính thức của Expo (§2). Dùng khi muốn font-icon thay vì SVG.

### 4.10 Ảnh stock thật (nếu app cần ảnh chụp, không phải minh họa) — 🆕
- **Unsplash** (https://unsplash.com) / **Pexels** (https://pexels.com): free commercial, **không cần attribution**, tải file trực tiếp (không cần gọi API — API free tier 50 req/h demo / 5.000 req/h production với Unsplash; Pexels 200 req/h, 20.000/tháng). Dùng `expo-image` để load.
- **Khi nào dùng:** hero cần ảnh thật (vd đồng ruộng, nông dân, vệ tinh…). ⚠️ Ảnh nặng hơn SVG nhiều — nén/resize trước khi đưa vào app; tránh ảnh có logo thương hiệu hoặc người nhận diện được trong ngữ cảnh nhạy cảm.

### 4.11 Không nên dùng (đã loại)
| Loại | Vì sao loại |
|---|---|
| **Storyset** | Free **cần attribution**; bỏ attribution phải trả phí. (Có animation đẹp nhưng không hợp tiêu chí.) |
| **Blush** | Free chỉ tải **PNG**, SVG + độ phân giải cao nằm ở Pro. |
| **Freepik / Vecteezy / Flaticon** | Free cần attribution, SVG/Pro sau paywall. |
| **DrawKit** | Có pack free, license commercial OK không attribution — **dùng được** nhưng catalog free ít hơn ManyPixels; để làm tier 2 sau ManyPixels, không phải loại hẳn. |
| **Pollinations / Gemini API / AI image-gen free tier** | Paywall sau ~1 ảnh / hết quota (đã xác nhận theo crawler). Không làm đường chính. |
| **IconScout / Icons8 Ouch free** | Attribution hoặc SVG trả phí. |

---

## 5. Kế hoạch hành động gợi ý cho tối nay + sáng mai (team tự quyết)

**Tối nay (13/11, ~30 phút, 1 người):**
1. Chốt brand color (1 màu chính + 1 màu nền) — ghi vào tokens.
2. unDraw: tải 3–6 SVG (hero, empty state, success, onboarding) với đúng brand color; test render 1 file bằng `<SvgXml>` trong app mẫu.
3. Lucide: `npx expo install lucide-react-native react-native-svg`; liệt kê ~20 icon sẽ dùng.
4. Logo: chạy logo-design-skill lấy concept → chọn 1 → xuất icon 1024 PNG (fallback: vẽ nhanh 1 mark trong Figma rồi export 1024).
5. Background: tạo 1–2 blob/wave trên fffuel hoặc Haikei, export SVG (đơn giản) hoặc PNG (gradient).

**Sáng mai (14/11, đầu build day):**
6. Gắn icon 1024 + adaptive-icon vào `app.json`; verify `npx expo-doctor` không báo lỗi icon.
7. Chỉ thêm Lottie success animation nếu dev build chạy được — nếu không, bỏ không tiếc.
8. Đừng đổi set icon / style minh họa giữa chừng — 1 set icon + 1 style minh họa cho cả app.

---

## 6. Bảng bằng chứng tổng hợp

| # | Ứng viên | Loại | Nguồn (đã kiểm chứng tồn tại) | License | Dùng trong Expo SDK 58 | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | unDraw | Minh họa SVG | https://undraw.co | Custom (free, no attribution) | `react-native-svg` / SvgXml / transformer | ✅ Xác nhận pick Tuấn |
| 2 | iblis-react-native-undraw | Package RN cho unDraw | npm `iblis-react-native-undraw` (skypack) | — | Cần `react-native-svg` | ⚠️ Tồn tại nhưng maintenance chưa xác minh — **không nên dùng** |
| 3 | fffuel | Background SVG | https://fffuel.co | MIT (shapes) | SVG đơn giản OK; filter → PNG | ✅ Xác nhận pick Tuấn |
| 4 | Lucide | Icon UI | https://lucide.dev — npm `lucide-react-native` | ISC | `react-native-svg`, tree-shakeable | ✅ Xác nhận — **khuyên chọn** |
| 5 | Hugeicons | Icon UI | https://hugeicons.com — npm `@hugeicons/react-native` | Renderer MIT; icon Pro trả phí | `react-native-svg`, có docs Expo | ✅ Xác nhận — dùng được, chỉ gói free |
| 6 | Simple Icons | Logo brand | https://simpleicons.org — npm `simple-icons` | CC0 | SVG qua `react-native-svg` | ✅ Xác nhận |
| 7 | @react-native-vector-icons/* | Icon font (đường migrate Expo) | https://docs.expo.dev/guides/icons/ | MIT* | Scoped packages, codemod chính thức | ✅ Xác nhận — `@expo/vector-icons` deprecated từ SDK 56 |
| 8 | ManyPixels | Minh họa SVG/PNG | https://www.manypixels.co/gallery | Free, no attribution | PNG trực tiếp; SVG qua Pixels Market (free account) | 🆕 Mới |
| 9 | Humaaans / Open Peeps / Open Doodles | Nhân vật ghép (Figma) | https://humaaans.com / https://openpeeps.com / https://opendoodles.com | CC0 / free no attribution | Qua Figma → export SVG/PNG | 🆕 Mới |
| 10 | logo-design-skill | Logo + app icon (SVG) | https://github.com/kaankiziltug/logo-design-skill | MIT | Xuất SVG/PNG → `app.json` | 🆕 Mới — **Pick 3** |
| 11 | App Icon skill (Code with Beto) | App icon (AI) | https://github.com/code-with-beto/skills | — (skill mở) | Xuất `.icon` iOS 26 + adaptive Android | ⚠️ Tồn tại nhưng **cần OpenAI credit** |
| 12 | theSVG | Logo brand bản màu | https://thesvg.org — npm `thesvg` | MIT | SVG qua `react-native-svg` | 🆕 Mới |
| 13 | appicon.co / thedevtoolset / Expo Icon Generator | Resizer app icon | https://appicon.co ; https://thedevtoolset.com/tools/app-icon-generator/ | Free, browser-side | Xuất icon 1024 + adaptive | 🆕 Mới |
| 14 | Haikei | Background SVG | https://haikei.app | Free, no attribution | Như fffuel | 🆕 Mới |
| 15 | LottieFiles + lottie-react-native | Animation JSON | https://lottiefiles.com | Từng file khác nhau | `npx expo install lottie-react-native` | 🆕 Mới — **chỉ với dev build** |
| 16 | Phosphor / Tabler / Iconoir | Icon UI dự phòng | npm `phosphor-react-native` / `@tabler/icons-react-native` / `iconoir-react-native` | MIT | `react-native-svg` | 🆕 Mới |
| 17 | Unsplash / Pexels | Ảnh stock thật | https://unsplash.com / https://pexels.com | Unsplash/Pexels License, no attribution | `expo-image`, file tải trực tiếp | 🆕 Mới |
| 18 | Storyset / Blush / Freepik | — | — | Attribution / Pro | — | ❌ Đã loại (xem §4.11) |

\* License của `@react-native-vector-icons/*` theo repo gốc là MIT (không tra lại từng package trong đợt này — kiểm tra `package.json` lúc cài).

## 7. Những gì CHƯA xác minh được (nói rõ để team không hiểu lầm)
- Lần publish gần nhất của `iblis-react-native-undraw` và `@hugeicons/react-native` (không tra được npm metadata trong đợt này) — không ảnh hưởng khuyến nghị vì cả hai đều không phải đường chính.
- Khả năng tương thích chính xác của `react-native-svg-transformer` v1.5.1 với **SDK 58** (tài liệu ghi SDK 51+; SDK 58 dùng RN mới hơn — khả năng cao vẫn chạy, nhưng **test metro config ngay tối nay**, fallback là `<SvgXml>` zero-config).
- Lottie trong Expo Go trên SDK 58 (nhiều nguồn nói cần dev build — team test thực tế trước khi quyết).
- Tabler RN có thực sự không cần `react-native-svg` không (một nguồn khẳng định, chưa đối chiếu).
- Tình trạng quota thực tế của Pollinations/Gemini API tối nay (không kiểm chứng lại — kết luận "không dùng làm đường chính" không phụ thuộc vào việc này).

---

*Hết báo cáo. Team quyết định, Mie không tích hợp gì thêm.*
