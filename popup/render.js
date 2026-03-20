/**
 * Devnip - Shared rendering helpers
 * Provides DOM utilities, toast notifications, clipboard operations,
 * and result box rendering used across tool panels.
 */

import { TOAST_DURATION } from './constants.js';
import { t } from './i18n.js';
import { icons } from './icons.js';

// ============ DOM helpers ============

/**
 * Shorthand for document.getElementById.
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * Attach an event listener to an element (by ID or reference).
 * @param {string|HTMLElement} id - Element ID or element reference
 * @param {string} event - Event type (e.g. 'click', 'input')
 * @param {Function} handler - Event handler
 */
export function on(id, event, handler) {
  const el = typeof id === 'string' ? $(id) : id;
  if (el) el.addEventListener(event, handler);
}

// ============ Toast notifications ============

/**
 * Show a temporary toast message at the bottom of the screen.
 * @param {string} msg - Message text
 * @param {number} [duration=TOAST_DURATION] - Duration in ms
 */
export function showToast(msg, duration = TOAST_DURATION) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

// ============ Clipboard ============

/**
 * Copy text to the clipboard and show a toast notification.
 * @param {string} text - Text to copy
 */
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast(t('toast.copied')))
    .catch(() => showToast(t('toast.copyFail')));
}

// ============ HTML escaping ============

/**
 * Escape HTML special characters in a string.
 * @param {string} str - Raw string
 * @returns {string} Escaped string safe for innerHTML
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============ Result box rendering ============

/**
 * Render a result-box component with labeled rows and copy buttons.
 * @param {string} containerId - ID of the result container element
 * @param {Array<{label: string, value: string, id: string}>} rows - Row data
 */
export function renderResultBox(containerId, rows) {
  const container = $(containerId);
  if (!container) return;
  container.classList.remove('hidden');
  container.innerHTML = rows.map(({ label, value, id }) =>
    `<div class="result-row">` +
    `<span class="result-label">${escapeHtml(label)}</span>` +
    `<span id="${id}" class="result-value">${escapeHtml(String(value))}</span>` +
    `<button class="btn-small btn-copy" data-copy-text="${id}">` +
    `<span class="btn-icon" data-icon="copy"></span></button>` +
    `</div>`
  ).join('');

  // Inject icons and bind copy handlers
  container.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (icons[name]) el.innerHTML = icons[name];
  });
  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const copyId = btn.dataset.copyText;
      const el = $(copyId);
      const text = el ? el.textContent || '' : '';
      if (text) copyToClipboard(text);
    });
  });
}

// ============ Icon injection ============

/**
 * Inject SVG icons into all elements with a data-icon attribute.
 */
export function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (icons[name]) {
      el.innerHTML = icons[name];
    }
  });
}
