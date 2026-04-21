# Specification: Infrastructure & Tooling

## Overview
This specification details the foundational architecture, cloud orchestration, environment variables, and third-party integrations utilized across the Pe Thui Tracker framework. The application runs natively on Vercel as a Next.js App Router project leveraging Google Sheets as its primary state and data store.

### Target Files Scanned:
- `app/api/cron/vaccine-reminder/route.js`
- `app/lib/google-sheets.js`
- `.env` schema references
- `next.config.mjs`

## Detailed Implementation

### 1. Persistent Storage (`lib/google-sheets.js`)
- Google Sheets operates as a NoSQL column-mapped document store. Each individual baby profile is represented by a separate "tab/sheet" mapped via a `code`.
- **Authentication Resilience**: Uses `googleapis` to construct an OAuth2 / Service Account pipeline. Implements robust fallback Regex extraction for `client_email` and `private_key` to circumvent string-escaping issues specifically caused by Vercel's Environment Variable JSON injecting trailing newlines.
- Provides unified access functions: `getGoogleSheets()`, `getSheetExists()`, `renameSheet()`, and `createNewSheet()`.

### 2. Routine Automation (`cron/vaccine-reminder/route.js`)
- Executed periodically via Vercel Cron.
- **Security Check**: Uses static bearer token matching against the `CRON_SECRET` environment variable to prevent unauthenticated execution.
- **Data Scanning Flow**:
  1. Fetches all tabs in the master spreadsheet (one tab = one baby profile).
  2. For each tab, reads Profile Info (`A1:B5`), Vaccine Schedules (`F7:I`), and Push Subscriptions (`K7:L`).
- **Reminder Logic**: Calculates the days difference until the scheduled vaccine date. Triggers notifications on strict milestones defined by `REMINDER_DAYS = [7, 3, 1, 0]`.
- **Notification Fan-out**: 
  - Broadcasts push notifications iteratively via Web Push, then Telegram. 
  - **Auto-Cleanup**: Detects expired push subscriptions (`410 Gone` or `404`) during broadcasting and automatically prunes them from Google Sheets.
- **Response**: Outputs an aggregated JSON summary detailing execution counts: `totalProfiles`, `reminders`, `pushSent`, `pushFailed`, `telegramSent`, and `errors`.

### 3. Environment Context Matrix
The repository relies on the following protected environment variables:
- `GOOGLE_CREDENTIALS`: A stringified JSON blob containing the Google Cloud Service Account `private_key` and `client_email`.
- `GOOGLE_SHEET_ID`: The hash identifier of the Master Spreadsheet acting as the core database.
- `TELEGRAM_BOT_TOKEN`: The API string from `@BotFather` used to POST to Telegram.
- `CRON_SECRET`: Validation key used to prevent unauthenticated execution of Vercel `cron` endpoints.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Exposed VAPID point utilized by the frontend browser PushManager to negotiate device subscription objects.
- `VAPID_PRIVATE_KEY`: Server-side point to sign and authenticate push notifications sent to the GCM / FCM relay network.

### 4. Build Tooling (`next.config.mjs`)
- Standard Next.js config bypassing `appIsrStatus` and `buildActivity` indicators during active development for a cleaner UI view.
