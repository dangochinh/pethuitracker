# Design: Project Documentation Specifications

This document outlines the architecture for the documentation.

## Project Structure Overview

Based on our scan, the `Pe Thui Tracker` app has distinct functional domains:

### 1. API Architecture (`app/api/`)
Handles all data connections (CRUD) and notifications.
- Specification Target: `specs/api-routes.md`

### 2. Health Tracking (`app/components/health`, `app/components/GrowthCharts.js`, `app/lib/calculations.js`)
Calculates and tracks charts, teething, weight, height, and vaccines.
- Specification Target: `specs/health-tracking.md`

### 3. Dashboard UI (`app/page.js`, `app/layout.js`, `app/components/Dashboard.js`)
Pages, wrappers, and core data fetchers inside UI.
- Specification Target: `specs/dashboard.md`

### 4. Notifications (`app/api/notifications`, `app/api/telegram`, `app/lib/web-push.js`)
Integrates with Push API and custom Telegram bot webhooks.
- Specification Target: `specs/notifications.md`

### 5. Infrastructure (`cron`, `google-sheets.js`, `next.config.mjs`)
Deals with database access (Google Sheets acting as a DB) and scheduled cron tasks.
- Specification Target: `specs/infrastructure.md`

### 6. Data Models (`app/lib/data/`)
Static definitions and timeline constants.
- Specification Target: `specs/data-models.md`

### 7. Modals & UI Controls (`app/components/*Modal.js`)
User forms for mutations and selections.
- Specification Target: `specs/modals.md`

## Documentation Strategy
Each target will have its own `.md` specification in `/specs/`. As we scan files grouped under these scopes, we will append component functionality, arguments, state, and dependencies into the appropriate spec file.
