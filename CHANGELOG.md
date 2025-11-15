# Changelog

## [0.2.0] - 2025-02-14
### Added
- Component refactor: HeaderBar, BucketsPanel, BucketCard, TermPill, BooleanPreview.
- UI polish: panel background, vertical divider, multicolored term pills.
- Added purple squirrel branding and favicon.
- Added confetti + toast on copy action.
- Drag-and-drop bucket reordering with delete controls (hidden when only one bucket remains).

### Fixed
- Fixed term pill delete icon that was showing incorrect glyph after refactor.

### Changed
- Bucket delete control restyled as a subtle pill button aligned to the card footer.


## [0.1.0] - 2025-02-14
### Added
- Initial project setup: React + TypeScript + Vite.
- Tailwind v3 integration (working build confirmed).
- Boolean Builder V1 architecture implemented.
- `Bucket`, `Operator`, and `AppState` types added.
- Boolean generation engine (`buildBoolean`) added.
- Basic UI layout added (Buckets panel + Preview panel).
- Styled term pills, bucket cards, operator selectors.
- LocalStorage persistence.
- Pretty vs Minified output modes.
- Copy-to-clipboard functionality.

### Notes
- Preparing for next iteration: styling polish, drag-and-drop, confetti, templates.
