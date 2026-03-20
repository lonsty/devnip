/**
 * Devnip - Shared constants and configuration
 * Centralizes cache keys, mapping tables, and magic numbers
 * to reduce hardcoding and improve maintainability.
 */

// ============ localStorage keys ============
/** Key for persisting input/output cache data */
export const CACHE_KEY = 'devnip-cache';

/** Key for persisting output type overrides (e.g., JSON→YAML) */
export const OUTPUT_TYPE_KEY = 'devnip-output-types';

/** Key for persisting user theme preference */
export const THEME_KEY = 'devnip-theme';

/** Key for persisting user locale preference */
export const LOCALE_KEY = 'devnip-locale';

/** chrome.storage key for last active tool panel */
export const LAST_TOOL_KEY = 'devnip-last-tool';

// ============ Output → Swap button mapping ============
/** Maps output element ID → swap button ID */
export const SWAP_BUTTON_MAP = {
  'base64-output': 'base64-swap',
  'url-output': 'url-swap',
  'html-output': 'html-swap',
  'unicode-output': 'unicode-swap',
  'json-output': 'json-swap',
  'yaml-output': 'yaml-swap',
};

// ============ CM language mappings ============
/** Maps output CM editor ID → default syntax language */
export const OUTPUT_HIGHLIGHT_MAP = {
  'json-output': 'json',
  'yaml-output': 'yaml',
  'qs-output': 'querystring',
};

/** Maps input CM editor ID → syntax language */
export const INPUT_HIGHLIGHT_MAP = {
  'json-input': 'json',
  'yaml-input': 'yaml',
  'qs-input': 'querystring',
  'jwt-input': 'jwt',
  'cron-input': 'cron',
  'md-input': 'markdown',
};

// ============ IP field → i18n key mapping ============
/** Maps CIDR result keys to their i18n translation keys */
export const IP_FIELD_I18N = {
  network: 'ip.network',
  broadcast: 'ip.broadcast',
  hostMin: 'ip.hostMin',
  hostMax: 'ip.hostMax',
  hostCount: 'ip.hostCount',
  mask: 'ip.mask',
  wildcard: 'ip.wildcard',
  binary: 'ip.binary',
  hex: 'ip.hex',
  addressType: 'ip.addressType',
};

// ============ Cache markers for result restoration ============
/** Keys used to mark computed results in cache for restoration */
export const CACHE_MARKERS = [
  'hash-computed',
  'nb-computed',
  'color-computed',
  'ts-computed',
  'ip-computed',
  'uuid-computed',
  'rand-computed',
  'jwt-decoded',
  'qs-parsed',
  'cron-parsed',
  'cron-nexted',
];

// ============ Theme configuration ============
/** Theme cycle order: system → light → dark → system */
export const THEME_CYCLE = ['system', 'light', 'dark'];

/** Maps theme mode → icon name */
export const THEME_ICONS = {
  system: 'themeSys',
  light: 'themeLt',
  dark: 'themeDk',
};

// ============ Timing constants (ms) ============
/** Toast notification display duration (normal) */
export const TOAST_DURATION = 2000;

/** Toast notification display duration (error) */
export const TOAST_ERROR_DURATION = 5000;

/** Delay before restoring cached results (wait for CM editors) */
export const CACHE_RESTORE_DELAY = 150;

/** Debounce delay for Markdown preview rendering */
export const MD_RENDER_DEBOUNCE = 200;

/** Debounce delay for regex test execution */
export const REGEX_DEBOUNCE = 300;

/** Delay for initial Markdown cache restoration */
export const MD_CACHE_RESTORE_DELAY = 100;

// ============ Limits ============
/** Maximum regex matches to display */
export const MAX_REGEX_MATCHES = 50;

/** Maximum toast body text length before truncation (context menu) */
export const CTX_TOAST_MAX_LENGTH = 60;

// ============ Default values ============
/** Default timezone for Cron and Timestamp tools */
export const DEFAULT_TIMEZONE = 'Asia/Shanghai';

/** Default JSON indent spaces */
export const DEFAULT_INDENT = 2;

/** Default random string length */
export const DEFAULT_RAND_LENGTH = 16;
