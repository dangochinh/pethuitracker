# Proposal: Multi-Language Support (Vi/En)

## Goal
Transform Pe Thui Tracker into a multi-language capable application, starting with Vietnamese (default) and English, ensuring the UI, static data, and backend notifications adapt to the user's preference.

## Motivation
Currently, the entire application relies on hardcoded Vietnamese strings. This limits accessibility for international caregivers, foreign nannies, or expatriate parents. By introducing internationalization (i18n), the app becomes globally accessible while maintaining its core functionality and aesthetic.

## Impact
- **Affected Code**: 
  - UI Components (Header, Modals, ProfileSetup, Dashboard).
  - Static Data Sources (`vaccines.js`, `teeth.js`).
  - API Routes & Cron Jobs (Push notification templates).
- **Dependencies**: Potential addition of `next-intl` or creation of a custom React Context provider for dictionary lookup.
- **State Changes**: The `locale` preference must be tracked in the browser (Cookie/LocalStorage) and synced to the database (Google Sheets) so backend workers can send notifications in the appropriate language.
