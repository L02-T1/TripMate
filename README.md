# ✈️ TripMate – Travel Smart, Spend Wisely

> Ứng dụng lên kế hoạch du lịch nhóm – Expo/React Native + Node.js/MongoDB

---

## 📦 Project Structure

```
TripMate_Fixed/
├── frontend/          # Expo (React Native) mobile app
│   ├── app/           # File-based routing (expo-router)
│   │   ├── (auth)/    # Login & Register screens
│   │   ├── (tabs)/    # Main tabs: Trips, Notifications, Profile
│   │   ├── trip/      # Trip detail, create, join, report
│   │   ├── activity/  # Activity detail/edit
│   │   ├── profile/   # Profile, QR, history, setup
│   │   └── settings/  # Language, currency, password, etc.
│   ├── context/       # AppContext (global state + API integration)
│   ├── services/      # api.ts, analytics.ts, storage.ts (platform-aware)
│   ├── components/    # Reusable components (Onboarding, etc.)
│   ├── types/         # TypeScript interfaces
│   └── utils/         # Helper functions
├── backend/           # Node.js/Express REST API
│   ├── src/
│   │   ├── controllers/  # authController, tripController
│   │   ├── models/       # User, Trip, Notification (Mongoose)
│   │   ├── routes/       # auth, trips, notifications
│   │   ├── middleware/    # auth (JWT), validate (express-validator)
│   │   ├── config/       # database, swagger
│   │   └── utils/        # logger (winston)
│   └── __tests__/        # Jest test suite
├── landing/           # Static landing page (deploy to Netlify/Vercel)
└── .github/workflows/ # CI/CD (GitHub Actions)
```

---

## 🐛 Bugs Fixed

### 1. `expo-secure-store` — Web compatibility error
**Error:** `ExpoSecureStore.default.getValueWithKeyAsync is not a function`

**Cause:** `expo-secure-store` is native-only and crashes on web (Expo Go web preview).

**Fix:** Created `frontend/services/storage.ts` — a platform-aware wrapper that:
- On **Android/iOS**: uses `expo-secure-store` (encrypted)
- On **Web**: falls back to `localStorage`

Updated `api.ts` to import from `storage.ts` instead of `expo-secure-store` directly.

### 2. CORS error — Backend rejecting frontend requests
**Error:** `'Access-Control-Allow-Origin' header has a value 'https://railway.com'`

**Cause:** Railway deployment set `ALLOWED_ORIGINS=https://railway.com` (Railway's own domain, not the app origin).

**Fix:** Updated `backend/src/index.js` CORS configuration to:
- Parse `ALLOWED_ORIGINS` as comma-separated list
- Always allow requests with no `Origin` header (native mobile apps)
- Allow `localhost:*` in development regardless of config
- Handle preflight `OPTIONS` requests explicitly
- Updated `.env.example` to default `ALLOWED_ORIGINS=*`

### 3. Missing `joinTrip` function
**Cause:** `AppContext` lacked `joinTrip`, so the join screen always used local mock lookup.

**Fix:** Added `joinTrip(inviteCode)` to `AppContext` that calls `api.trips.join()` and updates local state. Updated `join.tsx` to use it.

### 4. `POST /auth/change-password` route missing
**Cause:** Frontend calls `POST /auth/change-password` but backend only had `PATCH /auth/password`.

**Fix:** Added `router.post('/change-password', auth, ctrl.changePassword)` alias to `backend/src/routes/auth.js`.

### 5. Missing frontend config files
**Added:** `package.json`, `app.json`, `eas.json`, `babel.config.js`, `tsconfig.json`, `.env.example`

---

## 🚀 Quick Start

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
npm install
npm run dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL (or leave default for production)
npm install
npx expo start
# Press 'a' for Android, 'i' for iOS, 'w' for Web
```

### Tests
```bash
cd backend
npm test          # Run Jest with coverage
npm run test:watch  # Watch mode
```

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Register/Login with email+phone, JWT tokens, secure storage |
| 🗺️ Trips | Create, join (via invite code/QR), edit, delete trips |
| 📅 Activities | Timeline-based activity planner with categories |
| ✅ Checklist | Shared/personal/todo checklist items with assignees |
| 💸 Expenses | Track expenses by category, split calculation, PDF report |
| 👥 Members | Invite by phone, role management (leader/member) |
| 🔔 Notifications | Trip reminders, checklist alerts, expense summaries |
| 📊 Analytics | User behavior tracking (Sentry/Firebase integration) |
| 📴 Offline | Full offline support with AsyncStorage cache |
| 🌐 i18n | Vietnamese & English support |

---

## 🏗️ Architecture

```
[Expo React Native App]
        │
        │ HTTPS REST API
        ▼
[Express.js + Node.js]     ← JWT Auth, Rate Limiting, Swagger Docs
        │
        │ Mongoose ODM
        ▼
[MongoDB Atlas]            ← Cloud-hosted database
        │
[Railway.app]             ← Backend hosting with auto-deploy
```

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ALLOWED_ORIGINS=*
```

### Frontend (`.env`)
```env
EXPO_PUBLIC_API_URL=https://tripmate-api.railway.app
```

---

## 🧪 Testing

Backend uses **Jest** + **supertest** + **mongodb-memory-server** (in-memory MongoDB, no external DB needed for tests).

```bash
cd backend && npm test
# Target: ≥70% coverage on core modules
```

---

## 📦 Build APK

```bash
cd frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview
# APK link will be provided after build (~10 min)
```

---

## 🌐 Links

| Resource | URL |
|----------|-----|
| 🌐 Landing Page | `landing/index.html` (deploy to Netlify/Vercel) |
| 📖 API Docs | `https://tripmate-api.railway.app/api-docs` |
| 📦 APK Download | `[Add Google Drive link after build]` |
| 📝 User Survey | `[Add Google Forms link]` |
| 💻 Frontend Repo | `[Add GitHub link]` |
| 🔧 Backend Repo | `[Add GitHub link]` |

---

## 📋 Assignment 3 Checklist

- [x] React Native mobile app (Expo)
- [x] Node.js backend (Express + MongoDB)
- [x] REST API with Swagger documentation
- [x] JWT authentication
- [x] CORS properly configured
- [x] Rate limiting
- [x] Input validation (express-validator)
- [x] Error handling middleware
- [x] Secure token storage (platform-aware)
- [x] Offline support (AsyncStorage cache)
- [x] Test coverage ≥70% (Jest + supertest)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Landing page
- [x] Analytics integration (Sentry/Firebase placeholder)
- [x] EAS Build configuration for APK
- [x] Environment variable management (.env)

---

Made with ❤️ by TripMate Team · 2025
