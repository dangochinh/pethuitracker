# Technical Design: Multi-Language Support (Vi/En)

## Context
Pe Thui Tracker is primarily a Vietnamese application with all user-facing strings hardcoded. To support broader usage, we need a flexible i18n system. Since we want to preserve the existing clean URL structure (`/[code]`) instead of mutating it to `/[locale]/[code]` which breaks existing shared links and push notification routes, we avoid heavy file-system routing implementations (like standard `next-intl` routing).

## Architecture Approach
We will construct a bespoke, hook-based dictionary translation system powered by a global React Context (`LanguageProvider`).

### 1. Translation Dictionaries
Create static dictionary maps:
- `lib/i18n/locales/vi.json`
- `lib/i18n/locales/en.json`

### 2. Client-Side State & Context (`useLanguage`)
- **Storage**: User's chosen locale is saved in `localStorage` (`pe_thui_locale`) and synchronized with a cookie so that subsequent requests might know the locale (optional, otherwise default to Vi on initial SSR payload and hydrate).
- **Hook API**: 
  ```javascript
  const { t, locale, setLocale } = useLanguage();
  // Usage: {t('settings.title')}
  ```
- **UI Element**: Add a language toggle (`VND / ENG` flags) in the `InfoModal` or `Header`.

### 3. Static Master Data (`teeth.js`, `vaccines.js`)
Currently, data structures have properties like `vnName` and `name`. 
- Refactor to map to a translation key.
- Example: `{ id: 'bcg', nameKey: 'vaccines.bcg.name', diseaseKey: 'vaccines.bcg.disease' }`.
- The UI will utilize the hook: `t(vaccine.nameKey)` instead of `vaccine.name`.

### 4. Database Schema Update (Google Sheets)
To ensure the backend (Cron jobs) pushes the correct language notification:
- **Profile Row Updates**: The `A1:B5` section in the baby's Google Sheet needs to be expanded or modified to store `Locale` preference (e.g., `B6: en`).
- The `EditProfileModal` backend route `/api/profile` must write this new `locale` property.

### 5. Backend Cron Job Adjustment
- Modify `app/api/cron/vaccine-reminder/route.js`.
- During the `[profileResp]` read phase, grab the user's `Locale`.
- Update `getMessageTemplate(babyName, vaccineName, daysLeft)` to accept `locale`.
- Provide English templates alongside the Vietnamese ones within the cron job definition.

## Risks / Trade-offs
- **SSR Mismatch**: A custom context-based approach might cause a brief hydration mismatch if the default server-side language (Vi) differs from `localStorage` (En). To mitigate, we sync `locale` to a dedicated `pe_thui_locale` cookie which the server components and standard layouts can read during init.
- **Maintenance Overhead**: All textual changes now require simultaneous updates in two JSON files, increasing PR merge complexity for minor typo fixes.
