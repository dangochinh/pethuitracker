# Specification: Modals & User Input Forms

## Overview
Document all the popup dialogs, data entry sheets, and verification flows.

### Target Files to Scan:
- `app/components/AddRecordModal.js`
- `app/components/ChangeCodeModal.js`
- `app/components/EditProfileModal.js`
- `app/components/EditRecordModal.js`
- `app/components/ExitConfirmDialog.js`
- `app/components/InfoModal.js`
- `app/components/DevelopmentSkillsSection.js`

## Forms & Modals Overview

### `AddRecordModal`
- **Purpose**: Insert new growth data (weight, height, and measurement date).
- **Behavior**: Validates all inputs before submission. Converts raw values to float. Submits a POST request to `/api/growth`. Includes a loading state during save.

### `EditRecordModal`
- **Purpose**: Edit or delete an existing growth record.
- **Behavior**: Displays existing data. Submits a PUT request to `/api/growth` for updates. Features a soft delete confirmation prompt; upon confirmation, sends a DELETE request.

### `EditProfileModal`
- **Purpose**: Manage child's profile information and application settings.
- **Form Data**: Code, Name, Avatar URL, Gender (`male` or `female`), Date of Birth.
- **Settings Data**: Toggles for Reminders (App push notifications or Telegram integration). Validates PushManager subscriptions and interacts with `/api/notifications/subscribe`.
- **Behavior**: Sticky header layout. Submits user updates via POST to `/api/profile`.

### `ChangeCodeModal`
- **Purpose**: Prompts user to rename auto-generated code to something memorable.
- **Behavior**: Formats the input to uppercase alphanumeric syntax (no accents). Only triggers if the new code is valid (>3 length) and successfully saves via `/api/profile`. Offers a skip action.

### `InfoModal`
- **Purpose**: General app information and guidelines.
- **Sections**: "About", "Guide" (usage), "Homescreen" (PWA install guide), "Donate" (bank details and QR), and "Release Notes" (version timeline). Includes a nested modal for zooming the Donate QR code.

### `ExitConfirmDialog`
- **Purpose**: Confirmation intercept dialog preventing accidental exits to login screen. 
- **Behavior**: Presented as a bottom sheet. Asks the user if they want to stay or proceed to the home page (login).

### `DevelopmentSkillsSection`
- **Purpose**: A section summarizing development skills, expanding into a timeline modal view.
- **Behavior**: Pulls data from `/api/skills`. Normalizes and determines the current phase based on child's age in months/days. The timeline modal is triggered on "View All", focusing automatically on the current appropriate section index.
