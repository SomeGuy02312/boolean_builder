# Boolean Builder — V1 Specification

*Last updated: 2025-11-14*

## 1. Product Overview

### 1.1 Vision

Build a modern, visual, multi-bucket Boolean builder that empowers recruiters and sourcers to create accurate, structured Boolean search queries without needing deep Boolean expertise. The tool is visually intuitive, easy to manipulate, and renders clean, platform-neutral output.

V1 focuses on the core value:
**Buckets → Terms → Operators → Boolean preview → Copy.**

## 2. Functional Requirements

### 2.1 Buckets (OR Groups)

**Purpose**
Each bucket represents a logical OR grouping of related terms.

**Behavior**

* Users can add new buckets
* Users can delete buckets (no confirmation in V1)
* Users can rename buckets (optional; placeholder name used by default)
* Users can toggle a bucket on/off
* Buckets can be reordered vertically
* Each bucket contains a set of terms (pills)
* Maximum buckets allowed in V1: **8**

**Operators Between Buckets**

* Default operator between buckets: **AND**
* Users can toggle the operator between bucket boundaries to:

  * **AND**
  * **OR**
  * **AND NOT**
* Operator changes apply only to boundaries, not bucket identity (bucket-level operator comes in V2)

**No Nesting in V1**
Nested buckets will be supported in V2.

### 2.2 Terms (Keywords / Phrases)

**Representation**
Each term appears as a draggable pill with:

* Text label
* Delete "X" icon
* Click-to-edit inline

**Adding Terms**

* Users can type and press Enter to add
* Users can paste multiple terms at once into the bucket input
* Accepted separators:

  * Newlines
  * Commas
* Empty lines ignored
* Whitespace trimmed
* Duplicate terms removed
* Case preserved (no normalization)

**Quoting Rules**

* Single-word → no quotes
* Multi-word → quoted (e.g., "machine learning")

**Drag-and-Drop**

* Reorder terms inside a bucket
* Move terms between buckets

**Term Deletion**

* X button removes term immediately
* No confirmation in V1
* No undo/redo in V1

### 2.3 Boolean Output Preview

**Output Behavior**

* Real-time updates
* Each bucket becomes a parenthesized OR group
* Boundary operators applied exactly as selected
* Bucket toggles remove that bucket from the final output
* **Final boolean string does not include outermost parentheses**

**Formatting Modes**

* **Pretty mode** (multi-line, line breaks between buckets, monospaced)
* **Minified mode** (single line, compact)

**Operators**
Always uppercase:

* AND
* OR
* NOT
* AND NOT

**Edge Handling**

* Empty buckets excluded from output
* Warning indicator shown on empty buckets
* Clean parentheses generated automatically

### 2.4 Copy-to-Clipboard

Two buttons:

* Copy Pretty
* Copy Minified

Tooltip:

* ✔ Copied
* ❌ Error

**Success Animation**

* Trigger a lightweight celebratory animation on successful copy (e.g., subtle confetti burst similar to Asana)
* Animation should be fast, non-intrusive, and match the app’s visual style
* Appears near the Copy button or emanates from it:
* ✔ Copied
* ❌ Error

### 2.5 Predefined Templates (Starter Boolean Examples)

* Templates accessible from the main builder screen (no modal)
* When selected, buckets populate automatically
* User can edit freely
* No locking or restrictions
* Does not replace the user’s work unless explicitly clicked

### 2.6 Initial State & Persistence

**Initial State**

* App loads with **one empty bucket**
* Templates visible for quick onboarding

**Persistence**

* All work saved to localStorage automatically
* Reloading the page restores the builder state
* No backend or auth

## 3. UI/UX Requirements

## 3.0 Wireframes (Updated)

### **3.0.1 App Layout (Primary Screen)**

```
+---------------------------------------------------------------+
|  Header: Logo | Templates Dropdown | Light/Dark Toggle        |
+---------------------------------------------------------------+
|  LEFT PANE (Builder)        |  RIGHT PANE (Boolean Preview)  |
|                             |                                |
|  [ Bucket 1 ]               |  Boolean Preview Title         |
|  Name: [ Bucket 1      ]    |  --------------------------     |
|  Terms: [pill][pill]        |  (pretty preview...)            |
|  [+] input field            |                                |
|  [Toggle: ON]               |  Pretty | Minified   [COPY]     |
|                             |     *Confetti animation on copy*|
|   --- AND ---               |                                |
|  [ Bucket 2 ]               |                                |
|  Name: [ Bucket 2      ]    |                                |
|  Terms: [pill][pill][pill]  |                                |
|  [+] input field            |                                |
|  [Toggle: OFF]              |                                |
|                             |                                |
|   --- AND NOT ---           |                                |
|                             |                                |
|  [+ Add Bucket]             |                                |
+---------------------------------------------------------------+
```

### **3.0.2 Bucket Component (Detailed)**

```
+--------------------------------------------------+
| Bucket Header                                    |
|  - Drag handle (⋮⋮)                              |
|  - Bucket name [editable field]                  |
|  - Toggle ON/OFF switch                          |
|  - Delete bucket icon (trash)                    |
+--------------------------------------------------+
| Terms Area                                       |
|   [pill: java (x)]  [pill: "machine learning"(x)]|
|   [pill: C++(x)]                                 |
|                                                  |
| +----------------------------------------------+ |
| |  Add terms... (paste/type, Enter to add)     | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Operator boundary below this bucket: dropdown    |
|   [ AND | OR | AND NOT ]                         |
+--------------------------------------------------+
```

### **3.0.3 Boolean Preview Panel**

```
(java OR python OR "c++")
AND
("software engineer" OR developer)
AND NOT
(php OR wordpress)
```

Minified:

```
(java OR python OR "c++") AND ("software engineer" OR developer) AND NOT (php OR wordpress)
```

Buttons:

```
[ Pretty ]   [ Minified ]          [ COPY ]  ← triggers confetti animation
```

### 3.1 Layout

**Left Pane: Bucket Builder**

* Stack of bucket components
* Add Bucket button
* Each bucket contains:

  * Optional editable name
  * Terms as draggable pills
  * Input field for adding or pasting terms
  * Bucket toggle (on/off)
  * Boundary operator selector shown between buckets

**Right Pane: Boolean Preview**

* Pretty/minified toggle
* Output text (monospaced)
* Copy buttons
* Optional light/dark theme toggle (stretch goal)

### 3.2 Visual Design

* Clean, modern, stunning UI
* Smooth animations
* Clear contrast
* Thoughtful spacing
* Clear visual grouping
* Minimal clutter
* Delight moments (e.g., confetti animation on successful copy)
* Clean, modern, stunning UI
* Smooth animations
* Clear contrast
* Thoughtful spacing
* Clear visual grouping
* Minimal clutter

## 4. Out of Scope (V1)

* Nested buckets
* Bucket-level operator identity (beyond boundary operators)
* NOT inside buckets
* Platform-specific formatting (LinkedIn, SeekOut, Google, etc.)
* Synonym dictionary / skill suggestions
* Undo/Redo
* Delete confirmations
* Cloud sync, login, user accounts
* Sharing/export formats
* Chrome extension
* Backend logic
* Team collaboration features

## 5. Roadmap

### 5.1 V2 — Advanced Logic + Platform Modes

* Bucket-level operator identity
* Nested buckets (tree structure)
* Platform modes (LinkedIn, SeekOut, Google X-Ray, GitHub)
* Platform syntax warnings
* Character limit warnings
* Operator validation
* Delete confirmations
* Undo/Redo
* Additional formatting options
* Collapsible buckets

### 5.2 V3 — Intelligence Layer (Non-AI)

* Local synonym dictionary / skills ontology
* Keyword suggestions
* Role-based templates
* “You may also include…” suggestions
* Smarter grouping suggestions
* Early relevance scoring
* Category auto-detection
* Community-contributed dictionaries

## 6. Tech Considerations (Not Final)

* Likely SPA with React or Svelte
* TailwindCSS or minimal CSS
* Zustand/Context or simple component state
* Vite-based build
* Hosted on user’s Linux box (static files via Nginx)
* GitHub repo for the project

## 7. Summary

V1 is a polished, visual, easy-to-use Boolean builder that allows users to create structured OR-buckets, control inter-bucket logic, manage terms visually, and copy clean Boolean strings. It forms a solid foundation for advanced logic, platform support, and intelligent suggestions in future versions.
