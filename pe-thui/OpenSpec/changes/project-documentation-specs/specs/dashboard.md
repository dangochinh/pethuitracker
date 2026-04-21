# Specification: Dashboard & UI Layer

## Overview
This specification details the core UI layouts, landing mechanics, component routing, and the development timeline cards on the main screen of the application.

### Target Files Scanned:
- `app/page.js`
- `app/components/ProfileSetup.js`
- `app/components/Dashboard.js`
- `app/components/DevelopmentSkillsSection.js`

## Detailed Implementation

### 1. `app/page.js` (Login/Landing)
- Acts as the main entry point to input the user profile `code`.
- **PWA Auto-redirect**: Checks `localStorage` / `sessionStorage` (`pe_thui_logout` vs `pe_thui_last_code`) to skip login screen upon returning.
- **`__loginGuard`**: Employs `history.pushState` on sub-modals (Info or Setup) to hijack hardware back-button navigation.

### 2. `ProfileSetup.js`
- Renders the "Tạo hồ sơ mới" (Create Profile) interface.
- Calculates an initial tracking `code` on creation using `cleanName` (diacritics stripped), `dob`, and formatted dates. Example: `SOC010126.0226`.
- Calls `/api/profile` to insert. Upon success, displays `successCode` explicitly and triggers `ChangeCodeModal` for custom renaming.

### 3. `Dashboard.js`
- The foundational layout orchestrator post-login. Receives payload context `profile` and `code`.
- Controls top-level App views (`home`, `growth`, `health`, `teething`) via internal React state `view`, rather than external URL routing. This retains a native SPA feel for the iOS PWA shell.
- Instantiates a universal `useBackHandler(() => ...)` to trap native Android/iOS back swipes across 6 distinct active modal states.
- Fetches all records from 3 APIs in parallel: `growth`, `vaccines`, `teeth` via `Promise.all` in `fetchAllData()`.
- Renders `HomeView` encapsulating:
  - Notifications block and Birthday countdown block.
  - At-a-glance bento summary cards triggering view changes to specific tracking components.

### 4. `DevelopmentSkillsSection.js`
- Fetches dynamic parsed sheets via `/api/skills`.
- Employs heuristics `getCurrentSectionIndex()` and `normalizeSections()` by safely parsing `ageMonths` boundaries into float numbers (+ additional `ageDays / 31`).
- Randomizes a "Fact Card" rotating every 10 seconds (`setInterval` > `pickNextFact`). Includes 3D CSS `rotateY(180deg)` flipping transforms.
- Contains an overlapping `showTimeline` modal detailing historical / current / future skills using timeline nodes marked by status styling methods (`statusColor`, `markerColor`, `cardTone`).
