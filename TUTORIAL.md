# File-Based Routing (Expo Router)

Expo Router sử dụng cơ chế file-based routing, trong đó cấu trúc folder `app/` sẽ quy định cách routing.

1. Root url (`/`) nằm ở file `app/index.tsx`.
2. `_layout.tsx` là file được load đầu tiên. File này có thể nằm ở `app/` hoặc ở một route group. Vì file này được load trước, nên các thao tác khởi tạo thường được thực hiện trên file này, ví dụ như tải font chữ, thiết lập themes, tương tác với splash screen,...
3. Platform-specific file extensions: Expo Router có thể tuy chỉnh file được load dựa trên hậu tố, ví dụ: android.tsx, .ios.tsx, .native.tsx, .web.tsx.
4. src/app/home.tsx sẽ tương ứng với /home
5. src/app/profile/friends.tsx sẽ tương ứng với /profile/friends
6. src/app/user/[username].tsx tương ứng với dynamic route. Tức component này sẽ load với một path có định dạng: /user/foo, /user/fin
7. src/app/(home)/settings.tsx: Thư mục (home) tạo ra một route group. Route group dùng để nhóm các routes lại với nhau, và ký hiệu () tương ứng với việc sẽ không đưa tên route group vào path. Tức là path của component trên sẽ tương ứng /settings.
8. Mọi files index.tsx sẽ tương ứng với default route của route group tương ứng tương tự như app/.
9. Các files với tiền tố `+`:

- +not-found: Tương ứng với mọi route không được match.
- +html: Cho phép tuỳ chỉnh HTML boilerplate.
- +native-intent: Thiết lập deep links tới bên ngoài.
- +middleware: Thực thi trước khi bắt đầu vào một route bất kỳ.

# Thành phần các files quan trọng trong template

## app/\_layout.tsx

- `ThemeProvider`: Điều chỉnh theme dựa trên color scheme.

- `Stack`: Navigation dựa trên stack và render. Cho phép tuỳ chỉnh các lựa chọn khác nhau trên mỗi screen.

## app/(tabs)/\_layout.tsx

- Tab navigator: Thanh tab bar phía dưới cho các screens bên trong (tabs)/.

## app/(tabs)/onboarding.tsx

Màn hình trang onboarding.

## app/(tabs)/home.tsx

Màn hình trang home.

## app/+not-found.tsx

Màn hình fallback khi không có route tương ứng.

## app/global.css

Chứa các global config cho CSS. Template hiện tại sử dụng Tailwind CSS được imported từ NativeWind và Metro.

## components/

Các components được tạo sẵn từ Expo. `themed-view` và `themed-text` giúp tạo ra các view và text với màu thay đổi theo theme.

## constants/

Chứa `theme.ts`, quy định các màu mẫu.

# Root config files

## package.json

Metadata của project, các packages, dependencies và các scripts.

## app.json

File configuration của Expo:

- name/slug: expo-template
- orientation: portrait
- uiStyle: automatic (respects system light/dark)
- iOS: supportsTablet: true
- Android: Adaptive icons, edge-to-edge enabled
- Web: Metro bundler, static output
- Experiments: typedRoutes: true, reactCompiler: true (React Compiler optimization)
- Plugins: expo-router, expo-splash-screen, expo-font

## babel.config.js

Configuration cho Babel, trình biên dịch của app. Babel hiện tại đang được thiết lập để import NativeWind, cho phép sử dụng TailwindCSS.

## metro.config.js

Configuration cho Metro, bundler của React Native. Thiết lập để sử dụng NativeWind.
