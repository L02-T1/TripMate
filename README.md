<div align="center">

# ✈️ TripMate

**Ứng dụng lên kế hoạch du lịch nhóm — Travel Smart, Spend Wisely**

[![CI/CD](https://github.com/inowsuke/tripmate/actions/workflows/ci.yml/badge.svg)](https://github.com/inowsuke/tripmate/actions)
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet)](https://tripmate-production-1680.up.railway.app/api-docs)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-green)](https://expo.dev/@inowsuke/tripmate)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[📖 API Docs](https://tripmate-production-1680.up.railway.app/api-docs) · [📦 Tải APK](#-tải-apk) · [📝 Khảo sát người dùng](#-links)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Build APK](#-build-apk)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Links](#-links)

---

## 🎯 Giới thiệu

**TripMate** là ứng dụng di động giúp nhóm bạn lên kế hoạch và quản lý chuyến đi một cách dễ dàng. Từ việc tạo lịch trình, phân công nhiệm vụ, đến theo dõi và chia sẻ chi phí — tất cả trong một nơi.

Dự án được xây dựng với **Expo React Native** (mobile/web) và **Node.js/Express** REST API, sử dụng **MongoDB Atlas** làm database và deploy trên **Railway**.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực** | Đăng ký / đăng nhập email + SĐT, JWT tokens, lưu trữ mã hóa |
| 🗺️ **Quản lý chuyến đi** | Tạo, tham gia qua mã mời / QR code, chỉnh sửa, xóa |
| 📅 **Lịch trình hoạt động** | Lên kế hoạch theo timeline, giao nhiệm vụ từng thành viên |
| ✅ **Checklist chia sẻ** | Checklist chung / cá nhân, giao việc, đồng bộ thời gian thực |
| 💸 **Theo dõi chi phí** | Ghi chi tiêu theo danh mục, tính chia đều hoặc tùy chỉnh từng người, xuất PDF |
| 👥 **Quản lý thành viên** | Mời qua SĐT, phân quyền leader / member |
| 🔔 **Thông báo** | Nhắc nhở chuyến đi, cảnh báo checklist, tóm tắt chi phí |
| 📴 **Offline** | Hỗ trợ đầy đủ offline với AsyncStorage cache |
| 🌐 **Đa ngôn ngữ** | Tiếng Việt và tiếng Anh |
| 📊 **Analytics** | Tích hợp Sentry/Firebase (placeholder) |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   ┌──────────────────┐         ┌──────────────────────┐    │
│   │  Expo React Native│ deploy │   Netlify / Vercel    │    │
│   │  (Android / Web)  │──────▶ │   CDN + CI/CD         │    │
│   └────────┬─────────┘         └──────────┬───────────┘    │
└────────────┼──────────────────────────────┼────────────────┘
             │ HTTPS REST API               │ HTTPS REST API
             ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                         │
│                                                             │
│   ┌──────────────┐   ┌────────────────┐   ┌─────────────┐  │
│   │Express Router│──▶│ API Controllers│──▶│  Services   │  │
│   │JWT · CORS    │   │/auth /trips    │   │Business     │  │
│   │Rate Limit    │   │/activities     │   │Logic        │  │
│   └──────────────┘   │/expenses       │   └──────┬──────┘  │
│                      └────────────────┘          │         │
└──────────────────────────────────────────────────┼─────────┘
                                                   │ Mongoose ODM
┌──────────────────────────────────────────────────┼─────────┐
│                        DATA LAYER                │         │
│                                                  ▼         │
│              ┌──────────────────────────────────────────┐  │
│              │           MongoDB Atlas                   │  │
│              │    Users · Trips · Activities             │  │
│              │    Expenses · Checklist · Notifications   │  │
│              └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌──────────────────────────────────────────────────────────────┐
│                       INFRA LAYER                            │
│   Railway (Node.js host)    ·    GitHub Actions (CI/CD)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Package | Version | Mục đích |
|---------|---------|----------|
| Expo | ~51.0.28 | React Native framework |
| expo-router | ~3.5.23 | File-based navigation |
| React Native | 0.74.5 | Mobile UI |
| TypeScript | ~5.3.3 | Type safety |
| expo-secure-store | ~13.0.2 | Encrypted token storage |
| expo-image-picker | ~15.0.7 | Avatar upload |
| AsyncStorage | 1.23.1 | Offline cache |

### Backend
| Package | Version | Mục đích |
|---------|---------|----------|
| Node.js | ≥ 20 | Runtime |
| Express | ^4.18.2 | Web framework |
| Mongoose | ^8.4.0 | MongoDB ODM |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| express-validator | ^7.0.1 | Input validation |
| express-rate-limit | ^7.3.1 | Rate limiting |
| helmet | ^7.1.0 | Security headers |
| swagger-ui-express | ^5.0.1 | API documentation |
| winston | ^3.13.0 | Logging |

### Infrastructure
- **Database:** MongoDB Atlas (cloud)
- **Backend host:** Railway
- **Frontend host:** Netlify / Vercel
- **CI/CD:** GitHub Actions
- **Build:** EAS (Expo Application Services)

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js ≥ 20
- npm ≥ 9
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd backend

# 1. Copy file cấu hình
cp .env.example .env

# 2. Chỉnh sửa .env — điền MONGO_URI và JWT_SECRET
nano .env

# 3. Cài dependencies
npm install

# 4. Chạy development server
npm run dev
# → API: http://localhost:3000
# → Swagger: http://localhost:3000/api-docs
```

### Frontend

```bash
cd frontend

# 1. Copy file cấu hình
cp .env.example .env

# 2. Chỉnh sửa .env nếu cần (mặc định trỏ vào production Railway)
nano .env

# 3. Cài dependencies
npm install

# 4. Chạy Expo
npx expo start

# Nhấn:
#   a → Android emulator
#   i → iOS simulator
#   w → Web browser
```

---

## 🔧 Biến môi trường

### Backend — `backend/.env`

```env
PORT=3000
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tripmate

# JWT
JWT_SECRET=your_strong_secret_here_min_32_chars
JWT_EXPIRES_IN=30d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS — dùng * để allow all, hoặc liệt kê từng domain cách nhau bởi dấu phẩy
ALLOWED_ORIGINS=*
```

### Frontend — `frontend/.env`

```env
EXPO_PUBLIC_API_URL=https://tripmate-production-1680.up.railway.app
EXPO_PUBLIC_ANALYTICS_KEY=your_sentry_or_firebase_key
```

> **Lưu ý:** File `.env` không được commit lên Git. Xem `.env.example` để biết các biến cần thiết.

---

## 📖 API Reference

Swagger UI đầy đủ: **https://tripmate-production-1680.up.railway.app/api-docs**

### Authentication

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/register` | ❌ | Đăng ký tài khoản |
| POST | `/auth/login` | ❌ | Đăng nhập |
| GET | `/auth/me` | ✅ | Lấy thông tin bản thân |
| PATCH | `/auth/profile` | ✅ | Cập nhật hồ sơ |
| POST | `/auth/change-password` | ✅ | Đổi mật khẩu |
| POST | `/auth/forgot-password` | ❌ | Quên mật khẩu |
| DELETE | `/auth/account` | ✅ | Xóa tài khoản |

### Trips

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/trips` | ✅ | Danh sách chuyến đi |
| POST | `/trips` | ✅ | Tạo chuyến đi mới |
| GET | `/trips/:id` | ✅ | Chi tiết chuyến đi |
| PATCH | `/trips/:id` | ✅ | Cập nhật chuyến đi |
| DELETE | `/trips/:id` | ✅ | Xóa chuyến đi |
| POST | `/trips/join` | ✅ | Tham gia qua mã mời |
| GET | `/trips/:id/report` | ✅ | Báo cáo chi phí |

### Activities / Checklist / Expenses / Members / Notifications

> Xem đầy đủ tại [Swagger UI](https://tripmate-production-1680.up.railway.app/api-docs)

### Xác thực request

Tất cả endpoint có `✅` yêu cầu header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🧪 Testing

Backend sử dụng **Jest** + **Supertest** + **mongodb-memory-server** (không cần kết nối MongoDB thật khi test).

```bash
cd backend

# Chạy toàn bộ test với coverage
npm test

# Watch mode
npm run test:watch
```

**Mục tiêu coverage:** ≥ 70% trên branches, functions, lines, statements.

```
Coverage report: backend/coverage/lcov-report/index.html
```

---

## ⚙️ CI/CD Pipeline

GitHub Actions tự động chạy khi push lên `main` hoặc `develop`:

```
Push to main/develop
        │
        ├──▶ [test-backend]      Jest tests + coverage upload (Codecov)
        │
        ├──▶ [check-frontend]    TypeScript check (tsc --noEmit)
        │
        └──▶ (chỉ main)
              ├──▶ [build-android]    EAS build APK (cần test-backend + check-frontend pass)
              └──▶ [deploy-backend]   Railway auto-deploy
```

### Secrets cần thiết (GitHub → Settings → Secrets)

| Secret | Mô tả |
|--------|-------|
| `EXPO_TOKEN` | Token từ expo.dev/settings/access-tokens |
| `RAILWAY_TOKEN` | Token từ Railway dashboard |
| `API_URL` | URL backend production (optional) |

---

## 📦 Build APK

```bash
cd frontend

# Cài EAS CLI
npm install -g eas-cli

# Đăng nhập Expo
eas login

# Build APK (preview — internal distribution)
eas build --platform android --profile preview --non-interactive

# Build production (App Bundle cho Play Store)
eas build --platform android --profile production
```

APK link sẽ được cung cấp sau khi build hoàn tất (~10 phút).

---

## 📁 Cấu trúc thư mục

```
TripMate/
├── frontend/                     # Expo React Native app
│   ├── app/                      # File-based routing (expo-router)
│   │   ├── (auth)/               # Màn hình xác thực
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   ├── (tabs)/               # Tab chính
│   │   │   ├── trips.tsx         # Danh sách chuyến đi
│   │   │   ├── notifications.tsx
│   │   │   └── profile.tsx
│   │   ├── trip/                 # Chi tiết & tạo chuyến đi
│   │   │   ├── [id].tsx
│   │   │   ├── create.tsx
│   │   │   ├── join.tsx
│   │   │   └── report.tsx
│   │   ├── activity/[id].tsx     # Tạo / sửa hoạt động & chi phí
│   │   ├── profile/              # Hồ sơ & cài đặt
│   │   │   ├── index.tsx
│   │   │   ├── setup.tsx
│   │   │   └── qr.tsx
│   │   └── settings/             # Cài đặt ứng dụng
│   ├── context/AppContext.tsx    # Global state + API integration
│   ├── services/
│   │   ├── api.ts                # HTTP client
│   │   ├── storage.ts            # Platform-aware secure storage
│   │   └── analytics.ts
│   ├── types/index.ts            # TypeScript interfaces
│   ├── utils/                    # helpers.ts, logger.ts
│   ├── components/               # Reusable components
│   ├── app.json                  # Expo config
│   ├── eas.json                  # EAS Build config
│   └── tsconfig.json
│
├── backend/                      # Node.js REST API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── tripController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Trip.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── trips.js
│   │   │   ├── users.js
│   │   │   └── notifications.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verify
│   │   │   └── validate.js       # express-validator
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── swagger.js
│   │   ├── utils/logger.js       # Winston logger
│   │   └── index.js              # Entry point
│   └── __tests__/
│       └── api.test.js
│
├── landing/                      # Static landing page
│   └── index.html                # Deploy lên Netlify/Vercel
│
└── .github/
    └── workflows/
        └── ci.yml                # GitHub Actions CI/CD
```

---

## 🌐 Links

| Resource | URL |
|----------|-----|
| 🌐 Landing Page | [Xem landing page](https://trip-mate-landing-page.vercel.app/) |
| 📖 API Docs | [tripmate-production-1680.up.railway.app/api-docs](https://tripmate-production-1680.up.railway.app/api-docs) |
| 📦 APK Download | [Google Drive — thêm link sau khi build] |
| 📝 User Survey | [Google Forms — thêm link] |
| 💻 Frontend Repo | [GitHub — thêm link] |
| 🔧 Backend Repo | [GitHub — thêm link] |

---

## 👥 Team

Made with ❤️ by **TripMate Team** · 2025

---

## 📄 License

[MIT](./LICENSE)
