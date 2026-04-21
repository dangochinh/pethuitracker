# Specification: API Routes

## Overview
Document all the internal API endpoints utilized for generic data transfer. The backend primarily uses Google Sheets as a Database via `app/lib/google-sheets.js` integration. Each user holds a custom tab identified by `code` in the `SHEET_ID`.

### Target Files Scanned:
- `app/api/profile/route.js`
- `app/api/growth/route.js`
- `app/api/skills/route.js`
- `app/api/teeth/route.js`
- `app/api/vaccines/route.js`

## Detailed Implementation

### 1. `/api/profile`
- **GET**: Parameters: `?code=x`. Reads sheet range \`A1:B5\`. Returns Name, Gender, DoB, Avatar URL, and Telegram Chat ID.
- **POST**: Creates or updates a profile. If \`oldCode\` is passed and differs from \`code\`, it renames the sheet via Google Sheets API. Saves information back into \`A1:B5\`.

### 2. `/api/growth`
- **GET**: Reads \`A7:D\` to get Date, Age Months, Weight, and Height. Row ID corresponds to physical indexing (+7 offset).
- **POST**: Appends a new growth tracking record into \`A7:D\`. Will automatically create header in \`A6:D6\` if missing.
- **PUT**: Modifies a specific row by \`id\` sent in payload. Updates range \`A{id}:D{id}\`.
- **DELETE**: Filters out by ID and writes back all remaining rows down to the sheet, essentially recalculating indexing.

### 3. `/api/skills` (`force-dynamic: true`)
- **GET (only)**: Searches for a globally defined "MASTER" / "PHAT_TRIEN" / "Milestones" tab.
- Operates a complex heuristic regex matching script to identify dynamic headers like (Age group, description, title, icon, order) in Vietnamese or English.
- Normalizes unicode values, maps month ranges, limits ranges min/max strings into numerics, and returns pre-sorted groups of development skills array.

### 4. `/api/teeth`
- **GET**: Reads \`J7:L\` range inside the \`code\` sheet. Returns \`toothId\`, \`date\`, \`note\`.
- **POST**: Inserts or updates (using findIndex matching \`toothId\`) a tooth record. Checks headers in \`J6:L6\`.
- **DELETE**: Erases a \`toothId\` row by clearing \`J7:L\` and redefining remaining values.

### 5. `/api/vaccines`
- **GET**: Reads \`F7:I\` range. Returns \`vaccineId\`, \`date\`, \`scheduledDate\`, \`note\`.
- **POST**: Similar UPSERT logic. Search \`vaccineId\` and rewrite row, else append row. Headers check is on \`F6:I6\`.
- **DELETE**: Identical logical teardown to delete vaccines from the tracker arrays.

