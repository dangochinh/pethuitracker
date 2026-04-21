# Specification: Health Tracking

## Overview
This specification details the components responsible for rendering and calculating the health metrics of the baby: growth (weight/height), teething, and vaccination schedules. 

### Target Files Scanned:
- `app/components/GrowthCharts.js`
- `app/components/health/TeethingChart.js`
- `app/components/health/TeethingPreview.js`
- `app/components/health/VaccineList.js`
- `app/components/health/VaccinePreview.js`
- `app/lib/calculations.js`

## Detailed Implementation

### 1. `app/lib/calculations.js`
- **calculateAge**: Computes `totalMonths`, `days`, and a human-readable `text` from `dob` to `toDate` using `dayjs`.
- **predictAdultHeight**: Predicts adult height based on child's current height, age, and gender using simplified multiplier formulas (e.g., `2.4` under 12m, factor `1.05` for male). Fits output between 145 and 195 cm.
- **assessWeight & assessHeight**: Compares actual metrics with empirical formulas (`ageMonths * 0.5 + 4` for weight, `ageMonths * 1.5 + 50` for height). Returns formatting styling objects (tailwind classes) for "Vượt chuẩn", "Đạt chuẩn", "Dưới chuẩn".

### 2. `GrowthCharts.js`
- Plots two distinct graphs (Weight & Height) via `recharts` (`ComposedChart`, `Area`, `Line`).
- Employs empirical range mapping standard formulas `+/- ~10-30%` deviation limits as shaded areas (Upper, Normal, Lower).
- Integrates `predictAdultHeight` for displaying the "Dự đoán chiều cao trưởng thành" card if a height point exists.

### 3. `TeethingChart.js` & `TeethingPreview.js`
- **TeethingPreview**: Renders a tiny summary bento widget indicating erupted count with a mini progress bar.
- **TeethingChart**: 
  - Iterates over `TEETH` constant. Divides groups into Upper and Lower jaws. Uses `toothPosMap` and `toothColorMap` to translate into visually distinct colorful buttons.
  - Intercepts clicks to display a full-page Modal (with `+`/`x` or Date editing capabilities).
  - Triggers UPSERT to `/api/teeth` via POST and DELETE.
  - History section organizes a vertical timeline grouping recent teeth out by jaw.

### 4. `VaccineList.js` & `VaccinePreview.js`
- **VaccinePreview**: A bento card generating `[count]/[total]` completion strings and progress percentage.
- **VaccineList**:
  - Extremely dense logic containing internal states: scheduling modals, tracking custom `name`/`disease` additions, filtering timeline views.
  - Merges `VACCINES` constant with arbitrarily entered `custom-*` vaccines mapped from `note` JSON fragments in the DB.
  - **Summary Table**: Uses synced horizontal scrolling across Header and Body (`requestAnimationFrame` hook) to display a complex grid mapping Vaccine groups (e.g., `bcg`, `hepb`) against months intervals.
  - Overdue calculations: `COMPLETED`, `SCHEDULED`, `UPCOMING`, `OVERDUE` dynamically derived from birthdate `totalMonths` differential against the `recommendedAge` integers.
