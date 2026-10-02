# 👶 Pe Thúi Tracker

> *Lưu giữ hành trình khôn lớn* — A personal baby & pregnancy tracking application with the Stitch Design System.

**Live App:** [https://pethui.vercel.app/](https://pethui.vercel.app/)

---

## 📖 About

**Pe Thúi Tracker** is a mobile-first Progressive Web App designed to help parents track and visualize their baby's growth journey — from pregnancy all the way through early childhood. The app features a warm, handcrafted "Tactile Keepsake" design system with pastel tones, rounded corners, and gentle animations that make tracking feel like filling a baby scrapbook.

## ✨ Features

### 🍼 Baby Tracking
- **Code-based Access** — Enter your baby's personal code to instantly access their profile. No login required.
- **Profile Creation** — Set up a new baby profile in seconds with name, birth date, and other details.
- **Growth Dashboard** — View comprehensive stats on weight, height, and other tracked metrics at a glance.
- **WHO Standard Growth Charts** — Interactive charts following WHO standards for weight-for-age, height-for-age, and weight-for-height with percentile visualization (3rd, 15th, 50th, 85th, 97th).
- **Vaccination Schedule** — Complete vaccination tracking with age-based milestones and reminders.
- **Teething Tracker** — Monitor tooth eruption progress with visual dental chart and age-appropriate milestones.
- **Development Skills Timeline** — Age-based skills development tracking that automatically focuses on the current age range.

### 🤰 Pregnancy Tracking
- **Pregnancy Mode** — Full pregnancy tracking with due date countdown, weekly milestones, and fetal development info.
- **Late Pregnancy Reminders** — Auto-popup reminder when reaching 37+ weeks with preparation checklist.
- **Labor Signs Guide** — Medical guide with the 5-1-1 rule, water break signs, and emergency indicators.
- **Profile Conversion** — Seamlessly convert pregnancy profile to baby profile with birth measurements.
- **Preterm Birth Support** — Force convert for premature births with gestational age calculation, weight/height/head circumference inputs.

### 🎨 Design & UX
- **Stitch Design System** — "The Tactile Keepsake" design language with rosewood (#861949) and teal (#006972) palette.
- **Flower Celebration Effects** — Blooming sakura petals, confetti, and hearts animation on profile conversion and switching.
- **Mobile-Optimized** — Designed for phones with smooth keyboard-aware scrolling, touch interactions, and haptic feedback.
- **PWA Support** — Installable as a native app with offline capabilities.

### 🔔 Notifications
- **Web Push Notifications** — PWA push reminders before vaccination dates (7, 3, 1, 0 days).
- **🤖 Telegram Bot** — Interactive bot (`@pethuitrackerbot`) for vaccine schedule queries and reminders.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 |
| **Design System** | Stitch — "The Tactile Keepsake" |
| **Charts** | [Recharts](https://recharts.org/) |
| **Database** | Firebase Firestore |
| **AI** | Google Gemini API |
| **Notifications** | Web Push (VAPID), Telegram Bot API |
| **Icons** | React Icons |
| **Testing** | Node.js Test Runner (UT), Playwright (E2E) |
| **Deployment** | [Vercel](https://vercel.com/) |

## 📋 Release Notes

### v2.0.0 — Stitch Design System & Pregnancy Tracking (2026-10-02)
- 🎨 **Stitch Design System** — Complete UI overhaul with "The Tactile Keepsake" design language (rosewood + teal palette, Plus Jakarta Sans + Be Vietnam Pro fonts, rounded 2.5rem corners)
- 🤰 **Pregnancy Mode** — Full pregnancy tracking with weekly milestones, due date countdown, and fetal development tips
- 📊 **WHO Growth Charts** — Interactive weight-for-age, height-for-age, and weight-for-height charts with percentile curves (3rd → 97th)
- 💉 **Enhanced Vaccination** — Visual vaccination schedule with age-based grouping, completion tracking, and detailed vaccine info modals
- 🦷 **Visual Teething Chart** — Interactive dental chart showing eruption progress with expected vs actual dates
- ⚠️ **Late Pregnancy Alerts** — Auto-popup reminders at 37+ weeks with labor signs guide (5-1-1 rule, water break, emergency signs)
- 🔄 **Profile Conversion** — Convert pregnancy → baby profile with birth measurements (weight, height, head circumference)
- 👶 **Preterm Birth Support** — Force convert for premature births with gestational age calculation and comprehensive input form
- 🌸 **Celebration Effects** — Canvas-based particle system with sakura petals, flowers, hearts, stars, and ribbons on profile events
- 🔥 **Firebase Migration** — Migrated from Google Sheets to Firebase Firestore for better performance and scalability
- 🤖 **Gemini AI Integration** — AI-powered insights and suggestions
- ✅ **Comprehensive Testing** — 36 unit tests + 57 E2E checks with Playwright screenshot evidence

### v1.5.1 — Logic & Bug Fixes (2026-04-04)
- 🐛 **Timezone Issue** — Fixed UTC calculation rules to ensure exact calendar day countdowns without off-by-one errors across App UI, Cron Jobs (App Push & Telegram Reminders), and Telegram Bot commands.
- ✨ **Growth Bot Command** — Telegram bot now supports `/phattrien` (`/pt`) to instantly log weight and height.

### v1.5.0 — Notification System (2026-04-04)
- ✅ **Web Push Notifications** — PWA push reminders with VAPID keys
- ✅ **Telegram Bot** — Interactive bot with commands: `/lichtiem`, `/datiem`, `/info`, `/help`
- ✅ **Daily Cron Job** — Automated daily scan at 7AM VN for upcoming vaccinations
- ✅ **Settings UI** — 2-section profile modal with notification preferences (App/Telegram toggle)
- ✅ **Test API** — `/api/notifications/test?code=CODE` for instant notification testing

### v1.4.1 — Vaccination Ordering
- Ordered upcoming vaccinations by nearest scheduled date
- Improved vaccination detail view sorting

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dangochinh/pethuitracker.git
   cd pethuitracker/pe-thui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file at the root of the `pe-thui` folder with the following variables:
   ```env
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npx playwright test
```

## 📁 Project Structure

```
pe-thui/
├── app/
│   ├── [code]/             # Dynamic route: baby's dashboard page
│   ├── api/                # Next.js API routes (Firebase integration)
│   ├── components/
│   │   ├── Dashboard.js    # Main container component
│   │   ├── BabyHomeView.js # Baby tracking home view
│   │   ├── FlowerCelebration.js  # Canvas particle celebration
│   │   ├── pregnancy/      # Pregnancy-specific components
│   │   │   ├── PregnancyHomeView.js
│   │   │   ├── ConvertBabyModal.js
│   │   │   ├── LaborSignsModal.js
│   │   │   └── LatePregnancyRemindModal.js
│   │   ├── growth/         # WHO growth chart components
│   │   ├── profile/        # Profile settings & management
│   │   └── ...             # Other UI components
│   ├── lib/                # Utility functions, Firebase helpers, pregnancy utils
│   ├── globals.css         # Global styles with Stitch Design System tokens
│   └── page.js             # Landing / login page
├── public/                 # Static assets & test evidence screenshots
├── tests/                  # Unit tests & E2E test suites
└── package.json
```

## 👤 Author

**Đặng Ngọc Chính**
- Portfolio: [dangochinh.github.io](https://dangochinh.github.io/)
- GitHub: [@dangochinh](https://github.com/dangochinh)
