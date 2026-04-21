# Specification: Data Models & Schemas

## Overview
Document standard data structures used throughout the app.

### Target Files to Scan:
- `app/lib/data/teeth.js`
- `app/lib/data/vaccines.js`

## Teeth Data Model (`app/lib/data/teeth.js`)
The teeth data lists static information for baby teeth development, containing an array of objects for each tooth.
Schema for each tooth object:
- `id` (string): Unique identifier (e.g., 'lci-l').
- `name` (string): English name (e.g., 'Lower Central Incisor').
- `vnName` (string): Vietnamese translation (e.g., 'Răng cửa giữa (Dưới)').
- `minAge` (number): Minimum age of eruption in months.
- `maxAge` (number): Maximum age of eruption in months.
- `jaw` (string): 'lower' or 'upper'.
- `group` (string): Classification (e.g., 'central', 'lateral', 'molar1', 'canine', 'molar2').

## Vaccines Data Model (`app/lib/data/vaccines.js`)
The vaccines data lists static information for required and recommended vaccinations.
Schema for each vaccine object:
- `id` (string): Unique identifier (e.g., '6in1-1').
- `name` (string): Vaccine name/dose (e.g., '6 trong 1 - Mũi 1').
- `disease` (string): Diseases prevented by the vaccine.
- `recommendedAge` (number): Recommended age for the vaccine in months.
- `category` (string): Age category for UI grouping (e.g., '2 tháng', 'Hàng năm').
