# Liquid Glass / hiệu ứng ánh sáng khúc xạ — nghiên cứu cho demo 14/11

- **Ngày:** 2026-11-14 (rạng sáng, lệnh của Tuấn trong nhóm Optimus [ Prime ] lúc 01:18:47)
- **Người làm:** Mie (góc chính; Migga làm một góc khác song song, council tổng hợp sau)
- **Phạm vi:** demo mobile Expo ngày 14/11 (build day 5 giờ, demo trên điện thoại thật). Free-only, không API trả phí.
- **Trạng thái:** báo cáo nghiên cứu — KHÔNG tích hợp vào app, KHÔNG mở PR.

## Verdict: CONDITIONAL

**Khả thi có điều kiện — và điều kiện quyết định là ĐIỆN THOẠI DEMO NÀO.**

- **Nếu demo chấm trên iPhone đã lên iOS 26 → GO (garnish):** dùng `expo-glass-effect` chính thức của Expo, 15–30 phút gắn vào, hiệu ứng khúc xạ thật của Apple, chạy được trong Expo Go, fallback an toàn.
- **Nếu demo chấm trên điện thoại Android (preview APK — xe demo chính theo mobile-58-kit) → NO-GO cho hiệu ứng thật:** Liquid Glass là API riêng của Apple, trên Android nó fallback thành `View` thường — tức là vô hình, công gắn vào bằng 0 điểm demo. Chỉ còn đường giả lập bằng Skia shader, và đó là stretch goal, không phải headline.
- **Tuyệt đối không:** để glass chạm vào luồng AI chính (artefact 40 điểm). Glass chỉ được phép là lớp phủ trang trí trên controls nổi, có fallback.

## 1. Liquid Glass là gì (Apple, iOS 26)

Apple giới thiệu Liquid Glass tại WWDC 2025, là ngôn ngữ thiết kế cho iOS 26 / iPadOS 26 / macOS Tahoe 26 / watchOS 26 / tvOS 26. Đây không phải blur tĩnh: vật liệu **khúc xạ (refract) và phản xạ** nội dung phía dưới, phản ứng với chạm/con trỏ, các mảnh glass gần nhau thì nhập lại và morph khi đổi trạng thái.

Quy tắc quan trọng nhất của Apple (HIG): **glass chỉ thuộc functional layer** — navigation, tab bar, toolbar, controls nổi, overlay tạm thời — **không bao giờ dùng trong content layer** (list, card nội dung, form). Không chồng glass lên glass. Hai biến thể: `.regular` (mặc định, dễ đọc nhất) và `.clear` (trong hơn, cho nền ảnh/video). Người dùng bật Reduce Transparency thì hệ thống tự trả về vật liệu đục — app phải tôn trọng, không ép hiệu ứng.

API gốc (SwiftUI): `.glassEffect()`, `.glassEffect(.regular.tint(.accent).interactive(), in: .rect(cornerRadius: 16))`, gom nhóm bằng `GlassEffectContainer(spacing:)`, morph bằng `.glassEffectID(_:in:)`. Cần iOS 26+, Xcode 26 / iOS 26 SDK để build.

## 2. Route A — Native thật: `expo-glass-effect` (KHUYẾN NGHỊ nếu demo trên iPhone iOS 26)

Package chính thức của Expo, bọc `UIVisualEffectView` của Apple.

| Hạng mục | Giá trị (đã kiểm chứng 2026-11-14) |
|---|---|
| Package | `expo-glass-effect`, version khuyến nghị **~58.0.5** (`npm view` 2026-11-14: `58.0.5`) — khớp SDK 58 của team |
| Expo Go | **Included in Expo Go** (docs.expo.dev) — không cần dev build để thử |
| Nền tảng | iOS + tvOS; **chỉ iOS 26+ mới hiện hiệu ứng**, còn lại fallback thành `View` thường |
| Android | Không có hiệu ứng — fallback `View` thường (tức vô hình) |
| Chi phí | Free, MIT, của Expo team |
| Cài đặt | `npx expo install expo-glass-effect` (1 lệnh) |

API: `GlassView` (`glassEffectStyle`: `'regular' | 'clear' | 'none'`, `tintColor`, `isInteractive`, `colorScheme`), `GlassContainer` (`spacing` — các mảnh glass nhập lại như SwiftUI), 2 hàm guard: `isLiquidGlassAvailable()` (kiểm tra cả compiler/Info.plist — **false nếu app build bằng Xcode cũ hơn**) và `isGlassEffectAPIAvailable()` (kiểm tra runtime, chống crash trên iOS 26 beta — xem expo issue #40911).

Caveat đã ghi trong docs chính thức:
- **Không đặt `opacity < 1`** trên `GlassView` hay view cha — ở opacity rất thấp hiệu ứng không render (Apple: "Set the correct alpha value"). Muốn fade thì animate `glassEffectStyle` giữa style thật và `'none'` (có sẵn config `animate` + `animationDuration`, iOS 26.1+ cho workaround opacity bằng Reanimated).
- `GlassView` fallback thành `View` không có fill — nên component bọc ngoài phải tự vẽ fallback (màu nền + hairline + shadow) cho Android / iOS cũ, nếu không trên Android sẽ thấy một khoảng trống trong suốt.

### Code mẫu tối thiểu (Route A)

```tsx
import { View } from 'react-native';
import {
  GlassView, GlassContainer,
  isLiquidGlassAvailable, isGlassEffectAPIAvailable,
} from 'expo-glass-effect';

export function FloatingBar() {
  const glassOn = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  if (!glassOn) {
    // Fallback Android / iOS < 26: nền mờ + viền, vẫn đúng theme
    return <View style={styles.fallbackBar}>{/* các nút */}</View>;
  }
  return (
    <GlassContainer spacing={10}>
      <GlassView style={styles.bar} glassEffectStyle="regular" isInteractive>
        {/* các nút */}
      </GlassView>
    </GlassContainer>
  );
}
```

Thời gian ước tính: **15–30 phút** cho 1 tab bar / FAB / player nổi, gồm fallback. Rủi ro gần như bằng 0 vì có guard + fallback.

### Lựa chọn thay thế (không khuyến nghị)
- `expo-liquid-glass-view` (rit3zh, npm `0.1.10`, SDK 53+, iOS-only): bọc SwiftUI `glassEffect` trực tiếp, nhiều prop hơn (interactive, corner style) nhưng là package cộng đồng, không có trong Expo Go → **cần dev build**, không dùng được trong Expo Go. Chỉ cân nhắc nếu cần morph/shape mà `expo-glass-effect` không có — không cần cho demo ngày mai.
- `@lodev09/react-native-true-sheet`: sheet native đã bật Liquid Glass mặc định trên iOS 26+ — chỉ liên quan nếu app có bottom sheet; không phải hiệu ứng glass tổng quát.

## 3. Route B — Giả lập khúc xạ bằng Skia shader (đường duy nhất có hiệu ứng NHÌN THẤY trên Android)

`@shopify/react-native-skia` **v2.14.0** — "Included in Expo Go" (docs.expo.dev), Android + iOS + tvOS + web. Lưu ý: **v3 đã đổi tên thành `react-native-skia` và KHÔNG còn trong Expo Go** (cần dev build, Graphite/WebGPU, Android minSdk 26) — cho demo ngày mai phải ở lại **v2.14.0** (`@shopify/...`), không upgrade v3.

Cách nó fake khúc xạ: Skia `RuntimeEffect` (shader SkSL) làm **displacement map** — mỗi pixel của nền bị dịch chuyển theo pháp tuyến của hình lens (mạnh nhất ở rìa, giữa giữ nguyên) + blur nền + viền sáng (rim light) + tách kênh màu nhẹ (chromatic aberration ở rìa). Mắt người đọc đó là "khúc xạ", dù không có quang học thật.

Giới hạn cốt lõi — **Skia không nhìn thấy cây view React Native đang chạy**:
- Muốn khúc xạ nội dung RN thật (text, list đang cuộn) thì phải snapshot children thành ảnh Skia rồi mới distort → nội dung bên trong thành **tĩnh** (không cuộn, không tương tác) trong lúc hiệu ứng chạy. Đây đúng là cách `expo-glass-carousel` (rit3zh, public 2026-11-13, repo `rit3zh/expo-glass-carousel`) làm: capture card children as Skia images, lens bẻ cong card khi swipe; yêu cầu "static content inside each captured card", ảnh remote phải đợi load xong (`ready` prop).
- Demo cộng đồng cùng kỹ thuật: Carlos Chico (@capthndsme, Threads 2026-08-10) port Liquid Glass sang RN/Expo — panel kéo được, chromatic aberration + refraction, có "jelly effect", có fork Android.
- Nếu chỉ khúc xạ **nền tĩnh** (ảnh/gradient đứng yên sau tấm glass) thì dễ hơn nhiều: shader chỉ cần sample lại ảnh nền với offset — làm được trong ~1 giờ.

Thời gian ước tính: **2–4 giờ** cho 1 card/panel showcase chỉnh tới mức nhìn thuyết phục (tune displacement strength, blur, rim, perf 60fps). Rủi ro: shader tune bằng mắt, dễ rơi vào "nhìn như méo ảnh" thay vì "nhìn như kính" nếu không có thời gian iterate; và nội dung tĩnh là một trade-off phải chấp nhận.

### Code mẫu tối thiểu (Route B — displacement trên nền tĩnh)

```tsx
import { Canvas, Image, useImage, Fill, Shader, Skia } from '@shopify/react-native-skia';

// SkSL: dịch UV theo khoảng cách tới tâm lens (mạnh ở rìa, 0 ở giữa) + làm tối viền
const frag = Skia.RuntimeEffect.Make(`
uniform shader image; uniform vec2 center; uniform float radius; uniform float strength;
vec4 main(vec2 xy) {
  vec2 d = xy - center;
  float r = length(d) / radius;
  float bend = strength * smoothstep(0.6, 1.0, r); // chỉ bẻ ở rìa
  vec2 uv = xy - normalize(d + 0.0001) * bend * 12.0;
  return image.eval(uv);
}`);
```

Ghép thêm: `Blur` nền dưới lens, vòng rim bằng gradient stroke trắng mờ, text/label đặt TRÊN canvas (không bị distort). Toàn bộ chạy trong Expo Go với v2.14.0.

## 4. Route C — Web/CSS (chỉ nếu demo có bản web)

Không phải xe demo chính ngày mai (demo chấm trên điện thoại thật), ghi để đủ bộ: `backdrop-filter: saturate(180%) blur(28px)` + tint + inset top highlight + 1px rim gradient, khúc xạ thật bằng SVG `feDisplacementMap` trên một bản copy của nền. Chỉ dùng cho bản web của frontend-kit, không áp dụng cho app Expo.

## 5. Đối chiếu với setup thật của team ngày 14/11

| Điều kiện | Thực trạng | Hệ quả |
|---|---|---|
| SDK | Team chốt **SDK 58** (RN 0.88, React 19.3, `expo ~58.0.25`) | `expo-glass-effect ~58.0.5` khớp SDK — không lệch version |
| Xe demo chính | **Preview APK trên điện thoại Android** (mobile-58-kit: Expo Go chỉ để iterate, demo chấm chạy APK) | Route A vô hình trên xe này. Route B là đường duy nhất có hiệu ứng thấy được |
| Điện thoại backup | **iPhone 11 Pro Max** (mobile-deep §5: chạy cùng SDK Expo Go với Android) | iPhone 11 (chip A13) **được hỗ trợ iOS 26** — nhưng chỉ hiện glass nếu máy đã update lên iOS 26. **Chưa kiểm chứng version iOS trên máy này** |
| Expo Go | Store đã có Expo Go 58.0.5 (AppBrain/APKMirror, 19–22/10/2026) | Cả 2 route đều chạy trong Expo Go — không cần dev build để thử |
| Build preview APK | EAS Build / dev build phải build bằng **Xcode 26 / iOS 26 SDK** thì `isLiquidGlassAvailable()` mới true | Chưa kiểm chứng toolchain build iOS của team; nếu build bằng Xcode cũ, glass tắt ngay cả trên iPhone iOS 26 |

## 6. Kế hoạch đề xuất cho ngày mai (5 giờ build day)

1. **Đầu giờ (5 phút):** kiểm tra iOS trên iPhone 11 Pro Max backup (`Settings → General → About`). Nếu < iOS 26 → Route A coi như không tồn tại cho demo này.
2. **Nếu iPhone đã iOS 26 và demo chấm trên iPhone → gắn Route A ngay:** 1 `GlassView` cho tab bar / FAB / player nổi + fallback cho Android, guard bằng 2 hàm `is...Available()`. Xong trong 30 phút, không đụng gì thêm.
3. **Nếu demo chấm trên Android (xe chính):** Route B, time-box **tối đa 1 giờ**, đúng **1** showcase (card/panel trên nền tĩnh hoặc carousel kiểu `expo-glass-carousel`). Tới checkpoint giữa buổi mà chưa thuyết phục → **cắt không thương tiếc**, quay về blur + rim highlight thường (vẫn đẹp, 0 rủi ro).
4. **Không làm:** upgrade Skia v3 (mất Expo Go), `expo-liquid-glass-view` (cần dev build), glass trên content layer, glass chồng glass, opacity < 1 trên GlassView.
5. **Accessibility:** tôn trọng Reduce Transparency / Reduce Motion — hệ thống tự xử lý với Route A; Route B phải tự gate (nếu user bật Reduce Transparency thì tắt displacement, chỉ giữ blur nhẹ).

## 7. Nguồn (truy cập 2026-11-14, trừ khi ghi khác)

- Apple HIG — Materials / Liquid Glass: https://developer.apple.com/design/human-interface-guidelines/materials (fetch trực tiếp lỗi ngày 2026-11-14; nội dung HIG được trích qua các nguồn dưới)
- Apple — WWDC 2025 giới thiệu Liquid Glass; SwiftUI `.glassEffect()`, `GlassEffectContainer`, iOS 26+ (qua dodecaidr.pro, blakecrosley.com, saglitz.com — xem §1)
- Expo docs — GlassEffect (`expo-glass-effect` ~58.0.5, Included in Expo Go, iOS 26+, `isLiquidGlassAvailable` / `isGlassEffectAPIAvailable`, opacity caveat, issue #40911): https://docs.expo.dev/versions/latest/sdk/glass-effect/
- Expo docs — Skia (`@shopify/react-native-skia` 2.14.0, Included in Expo Go, Android/iOS/tvOS/web): https://docs.expo.dev/versions/latest/sdk/skia/
- Skia migration (v3 = `react-native-skia`, Graphite/WebGPU, Expo Go chỉ bundle v2, v3 cần dev build): https://wcandillon.github.io/react-native-skia/docs/getting-started/migration/
- `expo-liquid-glass-view` 0.1.10 (cộng đồng, SDK 53+, iOS-only, cần dev build): https://deepwiki.com/rit3zh/expo-liquid-glass-view
- `expo-glass-carousel` (Skia lens carousel, capture children as Skia images, static content): https://reactscript.com/expo-glass-carousel/ — repo https://github.com/rit3zh/expo-glass-carousel
- Liquid Glass port RN/Expo (capthndsme, Threads 2026-08-10): https://www.threads.com/@capthndsme/post/Db25_DqEkdH
- True Sheet — Liquid Glass cho bottom sheet iOS 26+: https://sheet.lodev09.com/guides/liquid-glass
- Repo nội bộ: `skills/mobile-58-kit/SKILL.md` (SDK 58, preview APK là xe demo chấm), `research/mobile-deep-20261113.md` §0.1–§0.2, §5 (Android demo phone + iPhone 11 Pro Max backup, Expo Go 58.0.5)
- `npm view expo-glass-effect version` → `58.0.5`; `npm view @shopify/react-native-skia version` → `2.14.0` (2026-11-14)

## 8. Việc chưa kiểm chứng (cần người có máy làm trước giờ demo)

1. iPhone 11 Pro Max backup đang chạy iOS mấy (quyết định Route A sống hay chết).
2. EAS Build / toolchain build iOS của team có dùng Xcode 26 / iOS 26 SDK không (quyết định `isLiquidGlassAvailable()`).
3. Chưa chạy thử code mẫu §2/§3 trên máy thật — các snippet trên lấy từ docs chính thức, chưa qua tay chạy.
