# Boolean Builder — PRD v1.0

*Version: 1.0 — November 2025*

## 1. Overview

**Product Summary:** The Boolean Builder is a visual, multi-bucket Boolean search builder for recruiters and sourcers. It enables the creation of structured, drag-and-drop Boolean queries without needing syntax expertise. Output is clean, platform-neutral, and copy-ready.

## 2. Goals & Non-Goals

### Goals

* Visual construction of Boolean strings via OR buckets
* Modern, intuitive UI with a playful polish
* Pretty and Minified output modes
* Drag-and-drop for buckets and terms
* Local persistence
* Template-based onboarding

### Non-Goals (V1)

* Platform-specific syntax modes
* Synonyms or intelligent suggestions
* Nested buckets
* Undo/redo
* Authentication or backend

## 3. Target Users & Use Cases

**Users:** Recruiters, sourcers, talent acquisition professionals.

**Primary JTBD:** Build Boolean queries visually to reduce errors and improve search quality.

**Use Cases:** Create search from scratch, load templates, add/edit/delete terms, drag between buckets, toggle buckets, change operators, copy output.

## 4. Requirements

### Functional

* Up to 8 buckets, each with name, terms, toggle, drag handle, delete icon
* Terms added via typing or paste; trimmed, deduped; quoted if multi-word
* Operators between buckets: AND, OR, AND NOT
* Boolean preview in Pretty/Minified formats
* Copy buttons with confetti animation
* Template loading
* Persist state via localStorage

### Non-Functional

* Smooth drag behavior
* Good accessibility (4.5:1 contrast)
* Desktop-first browser support

## 5. UX & Interaction

* Term pill animations
* Drag/drop buckets and terms
* Copy success triggers confetti + tooltip
* Warning for empty buckets

## 6. Data Structures

```
Bucket = {
  id,
  name,
  terms: string[],
  isEnabled: boolean,
  operatorAfter: "AND" | "OR" | "AND NOT"
}
```

Entire state stored in localStorage.

## 7. Boolean Construction Logic

* Remove disabled/empty buckets
* OR within buckets, parentheses around each
* Boundary operators between buckets
* No outer parentheses
* Pretty vs Minified formats

## 8. Templates

Several predefined templates (e.g., SWE, PM, DS, Sales).

## 9. Acceptance Criteria

* Bucket creation/deletion/reordering works
* Term input/paste/drag works
* Operators update output instantly
* Pretty/Minified correct
* Copy + confetti works

## 10. Out of Scope

Nested buckets, NOT within buckets, undo/redo, platform syntax, synonyms, backend, sharing.

---

**PRD v1.0 Complete**
