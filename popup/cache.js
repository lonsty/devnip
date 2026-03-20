/**
 * Devnip - Cache system
 * Persists input/output values and output type overrides
 * in localStorage for session restoration.
 */

import { CACHE_KEY, OUTPUT_TYPE_KEY } from './constants.js';

// ============ Input/output value cache ============
let cacheData = {};

/**
 * Load all cached values from localStorage.
 */
export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) cacheData = JSON.parse(raw);
  } catch { /* ignore corrupted data */ }
}

/**
 * Save a single key-value pair to cache and persist.
 * @param {string} id - Cache key (typically an element ID)
 * @param {string} value - Value to cache
 */
export function saveCache(id, value) {
  try {
    cacheData[id] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch { /* ignore quota errors */ }
}

/**
 * Get the current cache data object (read-only reference).
 * @returns {Object} The cache data
 */
export function getCacheData() {
  return cacheData;
}

// ============ Output type overrides ============
// Tracks when output language differs from default
// (e.g., JSON panel outputs YAML after JSON→YAML conversion)
let outputTypeOverride = {};

/**
 * Load output type overrides from localStorage.
 */
export function loadOutputTypes() {
  try {
    const raw = localStorage.getItem(OUTPUT_TYPE_KEY);
    if (raw) outputTypeOverride = JSON.parse(raw);
  } catch { /* ignore */ }
}

/**
 * Persist output type overrides to localStorage.
 */
export function saveOutputTypes() {
  try {
    localStorage.setItem(OUTPUT_TYPE_KEY, JSON.stringify(outputTypeOverride));
  } catch { /* ignore */ }
}

/**
 * Get output type override for a specific output ID.
 * @param {string} id - Output element ID
 * @returns {string|undefined} Override language type
 */
export function getOutputType(id) {
  return outputTypeOverride[id];
}

/**
 * Set output type override for a specific output ID.
 * @param {string} id - Output element ID
 * @param {string} type - Language type (e.g., 'json', 'yaml')
 */
export function setOutputType(id, type) {
  outputTypeOverride[id] = type;
  saveOutputTypes();
}

/**
 * Remove output type override for a specific output ID.
 * @param {string} id - Output element ID
 */
export function removeOutputType(id) {
  if (outputTypeOverride[id]) {
    delete outputTypeOverride[id];
    saveOutputTypes();
  }
}
