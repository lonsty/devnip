/**
 * Devnip - Theme management module
 * Handles theme cycling (system → light → dark), persistence,
 * and synchronization with CodeMirror editors.
 */

import { THEME_KEY, THEME_CYCLE, THEME_ICONS } from './constants.js';
import { icons } from './icons.js';
import { updateEditorsTheme } from './cm-editor.js';

/**
 * Get the currently saved theme mode from localStorage.
 * @returns {string} One of 'system', 'light', 'dark'
 */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEME_CYCLE.includes(saved)) return saved;
  } catch { /* localStorage unavailable */ }
  return 'system';
}

/**
 * Apply a theme mode to the document and update the toggle button icon.
 * @param {string} mode - One of 'system', 'light', 'dark'
 */
export function applyTheme(mode) {
  const html = document.documentElement;
  if (mode === 'system') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', mode);
  }

  // Update button icon
  const iconEl = document.getElementById('theme-icon');
  const iconName = THEME_ICONS[mode];
  if (iconEl && icons[iconName]) {
    iconEl.innerHTML = icons[iconName];
  }

  // Sync CodeMirror editors highlight theme
  updateEditorsTheme();
}

/**
 * Cycle to the next theme in THEME_CYCLE and apply it.
 */
function cycleTheme() {
  const current = getSavedTheme();
  const idx = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
  applyTheme(next);
}

/**
 * Initialize theme: restore saved preference, bind toggle button,
 * and listen for OS dark/light preference changes.
 */
export function initTheme() {
  applyTheme(getSavedTheme());

  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', cycleTheme);
  }

  // When in system mode, respond to OS dark/light changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getSavedTheme() === 'system') {
      updateEditorsTheme();
    }
  });
}
