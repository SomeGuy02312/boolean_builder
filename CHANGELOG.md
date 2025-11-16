# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] – 2025-01-XX

### 🎉 Major Release – Version 1.0

This is the first fully-featured, production-quality version of the Boolean Builder.  
It includes a complete UI/UX workflow, saved searches, examples, import/export, and extensive help content.

---

### 🚀 Core Functionality

- Added full Boolean builder with visual group management and pill-based editing.
- Replaced "buckets" terminology with "groups" throughout the app and documentation.
- Implemented clean, readable Boolean string generation based on groups and terms.
- Added inline editing for group names and term pills.
- Added header-level search naming + Save, Save Changes, and Save As New workflows.
- Added “New Search / Clear All” functionality to reset builder to default state.

---

### 💾 Saved Searches System

- Implemented complete saved-search infrastructure using `localStorage`.
- Added field support for:
  - `name`
  - `shortDescription`
  - `createdAt`
  - `updatedAt`
  - `lastUsedAt`
  - `queryString`
  - `state` (full SerializedBuilderState)
- Created a robust `useSavedSearches` hook providing:
  - create
  - update
  - delete
  - replaceAll (for import)
  - exportAll
  - markUsed
  - getRecents

- Added a Saved Searches side panel with:
  - Search/filter bar
  - Inline rename
  - Inline description editing
  - Delete with trash icon
  - Import & Export (global, overwrite)
  - Example badge support

---

### 🧩 Example Searches (Onboarding)

- Added one-time seeding of 6 real-world example searches:
  - Senior Frontend Engineer
  - Senior Backend Engineer (Distributed Systems)
  - Enterprise Account Executive
  - Sales Development Representative
  - Registered Nurse – Emergency Department
  - Senior Accountant – Corporate / GL
- Examples are treated as real saved searches and can be edited or deleted.

---

### 🧭 “Recent Searches” Section

- Added a 4-item recent searches panel at the top of the main UI.
- Uses stable ordering unless membership changes (no jarring reordering).
- Supports description display.
- Supports Example badge.
- Instantly loads searches into the builder.

---

### 🧰 Import & Export

- Added JSON-based import/export:
  - Export: Downloads all saved searches to file with version metadata.
  - Import & Replace: Overwrites local saved searches with uploaded file.
- Added version checks to ensure future compatibility.

---

### 💬 Help System & Intro Panel

- Added global Help panel with:
  - What the app is
  - How to use it
  - Core concepts
  - Boolean basics
  - Sourcing tips
  - How the app works (tech breakdown)
  - GitHub link + branding

- Added intro panel that appears only when builder has no content and no loaded search.

---

### 🎨 UI & UX Polish

- Cleaned overall visual layout for consistency with shadcn/ui & Tailwind.
- Improved card styling for Recent Searches (hover, shadow, spacing, truncation).
- Polished Saved Search rows with icon-based action controls.
- Streamlined header, form fields, group layout, and button styling.
- Added subtle transitions and hover states across components.

---

### 🛠️ Internal Architecture Improvements

- Refactored saved-search persistence to avoid duplicate writes.
- Added one-time seeding guard to prevent examples from reappearing after deletion.
- Fixed editing edge cases (row click vs input click).
- Corrected stale recents ordering issue.
- Cleaned development logs and improved debugging output.

---

## Initial Development (Pre-1.0)

- Set up project with Vite + React + TypeScript + Tailwind + shadcn/ui.
- Implemented primary group logic and Boolean generation.
- Added drag-and-drop (later removed/avoided due to UX issues).
- Added initial builder layout with controls and preview.

---

**Version 1.0.0 is now complete. 🎉**
