# Changelog

[🇨🇳 中文版](CHANGELOG.zh-CN.md)

## [0.3.0] - 2026-03-20

### Added

- **CodeMirror 6 editor integration** — JSON, YAML, Query String, JWT, Cron, and Markdown input/output fields replaced with CodeMirror 6 syntax-highlighted editors with line numbers and theme sync
- **esbuild bundling** — New `scripts/esbuild.js` bundles `popup.js` and its dependencies into `popup.bundle.js` for faster loading
- **Auto-hide output area** — Output panels are hidden by default (`.io-area-output.is-empty`) and appear automatically when results are available, reducing visual noise
- **Inline IO action buttons** — Clear and Copy buttons now float over input/output areas (top-right corner), visible on hover, saving layout space
- **Syntax-highlighted output** — New `.io-highlight` component for structured syntax highlighting in JSON/JWT outputs
- **Cron timezone support** — Cron "next run" calculation now accepts a timezone parameter, using `Intl.DateTimeFormat` for formatted output
- **Expanded i18n coverage** — More tool labels, buttons, placeholders, and toast messages now support EN/ZH switching

### Changed

- **Modular refactoring** — Split `popup.js` (850 lines) into `constants.js`, `cache.js`, `theme.js`, and `render.js` modules
- **Centralized constants** — Cache keys, lookup maps, magic numbers, and timing constants moved to `constants.js`, eliminating hardcoded values
- **CSS variables optimization** — Hardcoded colors for diff lines, regex highlights, and color preview extracted into CSS variables (`--diff-add-bg`, `--regex-mark-bg`, `--checker-color`, etc.)
- **Unified constants in i18n / service-worker** — Hardcoded keys replaced with `LOCALE_KEY` / `CTX_TOAST_MAX_LENGTH` constants
- **Icon system upgrade** — SVG icons changed from 18px to GitHub Octicons 16px standard
- **Timestamp default timezone** — `TimestampTool.toReadable()` default timezone changed from `UTC` to `Asia/Shanghai`
- **Build script enhancement** — `scripts/build.js` added `POPUP_EXCLUDE` list to skip bundled source files when copying to dist
- **JSDoc documentation** — Added JSDoc comments to all public functions and modules

### Removed

- Removed unused `icon()` export from `icons.js`

## [0.2.0] - 2026-02-26

### Added

- Remember last used tool — automatically navigates to the previously used panel when reopening Popup
- Dark theme support — follows system `prefers-color-scheme` by default, with manual toggle (system → light → dark cycle)
- Language toggle button title now supports i18n

### Changed

- Primary action buttons (encode / decode / execute) now use outlined style, filling on hover for a lighter visual appearance
- Improved text color brightness in dark theme for better readability

### Fixed

- Fixed input fields (timestamp, number-base, color, IP, regex, etc.) showing white background in dark theme
- Fixed Markdown HTML source box not being hidden in dark theme, causing white background to show through
- Fixed Toast notification text being invisible in dark theme
- Fixed readonly output fields still showing blue focus ring
- Fixed inconsistent component spacing in some panels (regex-presets, divider extra margin, empty state containers consuming gap space)

## [0.1.0] - 2026-02-25

### Added

- Initial release
- 20+ developer tools accessible via Popup and context menu
- **Codec**: Base64 (with URL-safe), URL (with recursive decode), HTML Entity, Unicode, Smart Decode
- **Format**: JSON (format / minify / validate / sort keys / loose mode), YAML ↔ JSON conversion
- **Parse**: Query String (key-value table), JWT (Header / Payload / expiry check), Cron Expression (natural language description + next run preview)
- **Convert**: Timestamp (auto-detect seconds / milliseconds, multi-timezone), Number Base (BIN / OCT / DEC / HEX, BigInt support), Color (HEX / RGB / HSL + preview)
- **Text**: Case conversion (7 formats), Deduplicate / Sort / Stats, Text Diff (Myers algorithm), Markdown live preview
- **Calc / Generate**: Hash (MD5 / SHA-1 / SHA-256 / SHA-512), UUID v4 / Random String / Strong Password generator
- **Network**: IP / CIDR calculator (network address, broadcast, host range, private address detection)
- **Regex**: Regex Tester (live highlight, capture groups, replace preview, preset templates)
- Context menu with 18 quick actions — results auto-copied to clipboard
- Manifest V3, Chrome 92+ support
- Pure frontend — no user data collection, no network requests
