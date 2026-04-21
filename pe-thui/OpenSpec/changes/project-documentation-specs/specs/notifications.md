# Specification: Notifications & Cron Jobs

## Overview
This specification details the comprehensive multi-channel notification architecture of the Pe Thui Tracker application. The system supports native Web Push Notifications and an interactive Telegram Bot, periodically orchestrated via Vercel Cron jobs.

### Target Files Scanned:
- `app/api/cron/vaccine-reminder/route.js`
- `app/api/telegram/webhook/route.js`
- `app/api/notifications/subscribe/route.js`
- `app/api/notifications/telegram/route.js`
- `app/lib/telegram.js` & `app/lib/web-push.js`
- `app/components/NotificationBanner.js`
- `app/components/TelegramLinkSection.js`

## Detailed Implementation

### 1. Telegram Webhook (`telegram/webhook/route.js`)
- Exposes a webhook endpoint to handle incoming events from the Telegram Bot API.
- **Commands Validated**:
  - `/start [MÃ_CODE]`: Queries the Master Spreadsheet for the baby code, writes the user's `Chat ID` to cell `A5:B5` of the individual sheet tab.
  - `/lichtiem` (`/lt`): Scans `F7:I` to compute days until `scheduledDate` of uncompleted vaccines.
  - `/datiem` (`/dt`): Lists completed vaccines using `F7:I`.
  - `/info` (`/i`): Displays parsed generic profile values (Name, Age, Stats).
  - `/phattrien` (`/pt {cân_nặng} {chiều_cao} [ngày_đo]`): Inserts new growth records back into the application by writing to `A7:D` in Google Sheets.
  - `/stop [MÃ_CODE]`: Removes the `Chat ID` link from `A5:B5`.

### 2. Cron Reminder Job (`cron/vaccine-reminder/route.js`)
- Runs based on Vercel's `cron` settings.
- Secured using Bearer Token `CRON_SECRET` validation.
- Iterates over **all sheet tabs** present in the Master Document.
- Filters vaccine schedules matching critical `REMINDER_DAYS` barriers: **7, 3, 1, and 0 days** prior to the target date.
- **Multi-channel Dispatch**:
  - Parses Push Subscriptions from cells `K7:L` (Stores `Push Endpoint` & `Push Keys`). Uses `web-push.js` to dispatch desktop/mobile notification. Checks for `410 Gone / 404` errors to prune dead endpoints via `clear` and `update` Sheets commands.
  - Read `Chat ID` from `A5:B5` and dispatches formatted Telegram reminder using `telegram.js`.

### 3. Subscription & UI Banner Layer
- **`app/components/NotificationBanner.js`**:
  - On mount, polls `Notification.permission` and `Notification` API support.
  - Skips rendering if `localStorage.getItem('pe_thui_noti_dismissed')` is truthy.
  - Prompts push registration and POST to `/api/notifications/subscribe`.
- **`app/api/notifications/subscribe/route.js`**: Appends endpoint details sequentially to the `K7:L` sheet range. 
  - Exposes DELETE to remove explicit `endpoint`.
- **`app/components/TelegramLinkSection.js`**:
  - Found under "Settings" (`EditProfileModal.js`). Allows deep-linking to `@pethuitrackerbot?start={code}`.
  - Submits DELETE to `/api/notifications/telegram` to zero-out the `Chat ID` in the sheets.

## Technical & Security Notes
- Web Push relies on standardized VAPID encryption keys (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`).
- Interaction boundaries rely strictly on finding the sheet code. Unknown codes bypass any operations. 
- Fast lookup technique in Webhook employs `batchGet` across all sheets to discover `code` via reverse lookup of `chatId` to prevent Vercel Serverless Function 10-second timeout constraints.
