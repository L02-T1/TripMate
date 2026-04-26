# TripMate – Expo React Native App

[![Tests](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/test.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_ORG_YOUR_PROJECT&metric=alert_status)](https://sonarcloud.io/project/overview?id=YOUR_ORG_YOUR_PROJECT)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=YOUR_ORG_YOUR_PROJECT&metric=coverage)](https://sonarcloud.io/project/overview?id=YOUR_ORG_YOUR_PROJECT)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_ORG_YOUR_PROJECT&metric=sqale_rating)](https://sonarcloud.io/project/overview?id=YOUR_ORG_YOUR_PROJECT)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_ORG_YOUR_PROJECT&metric=reliability_rating)](https://sonarcloud.io/project/overview?id=YOUR_ORG_YOUR_PROJECT)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_ORG_YOUR_PROJECT&metric=security_rating)](https://sonarcloud.io/project/overview?id=YOUR_ORG_YOUR_PROJECT)

Ứng dụng quản lý chuyến đi nhóm — lên kế hoạch, chia sẻ chi phí và theo dõi lịch trình.

---

## 📁 Cấu trúc thư mục

```
├── app/
│   ├── _layout.tsx               # Root layout (Stack navigator)
│   ├── index.tsx                 # Entry point → redirect to onboarding
│   ├── onboarding/
│   │   └── index.tsx             # 4 trang onboarding có swipe
│   └── tabs/
│       └── home.tsx              # Dashboard – danh sách chuyến đi
├── __tests__/
│   ├── OnboardingScreen.test.tsx # >= 8 test cases
│   └── HomeScreen.test.tsx       # >= 9 test cases
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions CI pipeline
├── sonar-project.properties      # SonarCloud config
└── README.md
```

---

## 🚀 Cài đặt và chạy ứng dụng

```bash
npm install
npm start        # dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
```

---

## 🧪 Hướng dẫn chạy test locally

### Chạy toàn bộ test
```bash
npm test
```

### Chạy với coverage report
```bash
npm run test:coverage
```
Coverage report tại: `coverage/lcov-report/index.html`

### Watch mode (development)
```bash
npm run test:watch
```

### Chạy file test cụ thể
```bash
npx jest __tests__/OnboardingScreen.test.tsx
npx jest __tests__/HomeScreen.test.tsx
```

### Xem HTML test report
Sau khi chạy test, mở: `test-report/index.html`

---

## 🔍 SonarCloud Setup

1. Đăng nhập [sonarcloud.io](https://sonarcloud.io) → Analyze new project → connect GitHub
2. Cập nhật `sonar-project.properties` với `projectKey` và `organization` của bạn
3. Vào GitHub **Settings → Secrets → Actions** → thêm `SONAR_TOKEN`
4. Push code → Actions tự chạy scan

---

## ⚙️ GitHub Actions CI

File: `.github/workflows/test.yml`

Pipeline: checkout → setup Node 20 → npm ci → test + coverage → upload artifacts → SonarCloud scan

**Artifacts sau mỗi run:**
- `test-report/index.html` — HTML test report
- `coverage/lcov.info` — Coverage cho SonarCloud

---

## 📊 Màn hình chính

| Màn hình | Mô tả |
|---|---|
| Onboarding 1 | Chào mừng đến với TripMate |
| Onboarding 2 | Mời bạn bè tham gia chuyến đi |
| Onboarding 3 | Ghi chép chi phí tiền lợi |
| Onboarding 4 | Lập kế hoạch chi tiết |
| Home Dashboard | Danh sách chuyến đi với trạng thái và chi phí |

---

## 📝 Test Cases

### OnboardingScreen.test.tsx (8 cases)

| # | Test |
|---|---|
| 1 | renders without crashing |
| 2 | renders skip button |
| 3 | renders next button |
| 4 | skip navigates to /tabs/home |
| 5 | renders 4 pagination dots |
| 6 | renders onboarding flatlist |
| 7 | next button has correct accessibility label |
| 8 | pressing next does not crash |

### HomeScreen.test.tsx (9 cases)

| # | Test |
|---|---|
| 1 | renders without crashing |
| 2 | renders trip list |
| 3 | renders both trip cards |
| 4 | renders add trip FAB button |
| 5 | pressing FAB does not crash |
| 6 | search toggle button renders |
| 7 | pressing search shows input |
| 8 | search input filters trips |
| 9 | empty state shown when no match |
