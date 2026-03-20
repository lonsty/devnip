/**
 * Devnip - Popup entry point
 * Orchestrates tool initialization, navigation, and cache restoration.
 * UI helpers, theme management, and constants live in separate modules.
 */

// ─── Tool modules ───
import { Base64Tool } from '../utils/base64.js';
import { JsonTool } from '../utils/json-format.js';
import { UrlTool } from '../utils/url-codec.js';
import { QueryStringTool } from '../utils/query-string.js';
import { TimestampTool } from '../utils/timestamp.js';
import { HashTool } from '../utils/hash.js';
import { HtmlEntityTool } from '../utils/html-entity.js';
import { UnicodeTool } from '../utils/unicode.js';
import { NumberBaseTool } from '../utils/number-base.js';
import { ColorTool } from '../utils/color.js';
import { RegexTool } from '../utils/regex.js';
import { JwtTool } from '../utils/jwt.js';
import { YamlTool } from '../utils/yaml.js';
import { DiffTool } from '../utils/diff.js';
import { TextTool } from '../utils/text-tools.js';
import { UuidTool } from '../utils/uuid.js';
import { MarkdownTool } from '../utils/markdown.js';
import { CronTool } from '../utils/cron.js';
import { IpTool } from '../utils/ip.js';
import { SmartDecodeTool } from '../utils/smart-decode.js';

// ─── Internal modules ───
import { createEditor, getEditorValue, setEditorValue, focusEditor, updateEditorsTheme } from './cm-editor.js';
import { t, getLocale, toggleLocale } from './i18n.js';
import { icons } from './icons.js';
import { initTheme } from './theme.js';
import { $, on, showToast, copyToClipboard, escapeHtml, renderResultBox, injectIcons } from './render.js';
import {
  loadCache, saveCache, getCacheData,
  loadOutputTypes, saveOutputTypes, getOutputType, setOutputType, removeOutputType,
} from './cache.js';
import {
  SWAP_BUTTON_MAP, IP_FIELD_I18N, CACHE_MARKERS, LAST_TOOL_KEY,
  TOAST_ERROR_DURATION, CACHE_RESTORE_DELAY, MD_RENDER_DEBOUNCE,
  REGEX_DEBOUNCE, MD_CACHE_RESTORE_DELAY, MAX_REGEX_MATCHES,
  DEFAULT_TIMEZONE, DEFAULT_INDENT, DEFAULT_RAND_LENGTH,
} from './constants.js';

// ============ CodeMirror editor instances registry ============
/** Maps element ID → { view: EditorView, lang: string } */
const cmEditors = {};

// ============ CM / textarea value helpers ============

/**
 * Get the value from a CM editor or plain textarea by element ID.
 * @param {string} id - Element ID
 * @returns {string}
 */
function getCmOrTextareaValue(id) {
  if (cmEditors[id]) return getEditorValue(cmEditors[id].view);
  const el = $(id);
  return el ? el.value : '';
}

/**
 * Set the value of a CM editor or plain textarea by element ID.
 * @param {string} id - Element ID
 * @param {string} value - New value
 */
function setCmOrTextareaValue(id, value) {
  if (cmEditors[id]) {
    setEditorValue(cmEditors[id].view, value || '');
    return;
  }
  const el = $(id);
  if (el) el.value = value || '';
}

// ============ Output visibility ============

/**
 * Show the output area and its swap button (if mapped).
 * @param {string} textareaId - Output element ID
 */
function showOutputArea(textareaId) {
  let areaEl;
  if (cmEditors[textareaId]) {
    areaEl = cmEditors[textareaId].view.dom.closest('.io-area-output');
  } else {
    const el = $(textareaId);
    if (el) areaEl = el.closest('.io-area-output');
  }
  if (areaEl) areaEl.classList.remove('is-empty');

  const swapId = SWAP_BUTTON_MAP[textareaId];
  if (swapId) {
    const swapBtn = $(swapId);
    if (swapBtn) swapBtn.style.display = '';
  }
}

/**
 * Hide the output area and its swap button (if mapped).
 * @param {string} textareaId - Output element ID
 */
function hideOutputArea(textareaId) {
  let areaEl;
  if (cmEditors[textareaId]) {
    areaEl = cmEditors[textareaId].view.dom.closest('.io-area-output');
  } else {
    const el = $(textareaId);
    if (el) areaEl = el.closest('.io-area-output');
  }
  if (areaEl) areaEl.classList.add('is-empty');

  const swapId = SWAP_BUTTON_MAP[textareaId];
  if (swapId) {
    const swapBtn = $(swapId);
    if (swapBtn) swapBtn.style.display = 'none';
  }
}

/**
 * Toggle output area visibility based on its current value.
 * @param {string} textareaId - Output element ID
 */
function updateOutputVisibility(textareaId) {
  const value = getCmOrTextareaValue(textareaId);
  if (value) {
    showOutputArea(textareaId);
  } else {
    hideOutputArea(textareaId);
  }
}

// ============ Swap input ↔ output ============

/**
 * Swap values between input and output, updating cache and visibility.
 * @param {string} inputId - Input element ID
 * @param {string} outputId - Output element ID
 */
function swap(inputId, outputId) {
  const inVal = getCmOrTextareaValue(inputId);
  const outVal = getCmOrTextareaValue(outputId);
  setCmOrTextareaValue(inputId, outVal);
  setCmOrTextareaValue(outputId, inVal);

  // Reset output highlight type override after swap
  removeOutputType(outputId);

  updateOutputVisibility(outputId);
  saveCache(inputId, outVal);
  saveCache(outputId, inVal);
}

// ============ Set output helper ============

/**
 * Set an output area value from a tool result, managing cache and visibility.
 * @param {string} id - Output element ID
 * @param {Object} result - Tool result { success, data, error, warnings? }
 * @param {string} [hlType] - Optional highlight type override (e.g. 'json', 'yaml')
 */
function setOutput(id, result, hlType) {
  const value = result.success
    ? (typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, DEFAULT_INDENT))
    : `${t('error.prefix')}: ${result.error}`;

  setCmOrTextareaValue(id, value);

  if (hlType) {
    setOutputType(id, hlType);
  }

  updateOutputVisibility(id);
  saveCache(id, value);
}

// ============ Cache restoration ============

/**
 * Restore cached input/output values into CM editors and textareas.
 */
function restoreCache() {
  const cacheData = getCacheData();
  for (const [id, value] of Object.entries(cacheData)) {
    if (!value) continue;
    if (cmEditors[id]) {
      setEditorValue(cmEditors[id].view, value);
      updateOutputVisibility(id);
    } else {
      const el = $(id);
      if (el) {
        el.value = value;
        updateOutputVisibility(id);
      }
    }
  }
}

// ============ i18n DOM update ============

/**
 * Apply i18n translations to all elements with data-i18n attributes.
 */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  const langLabel = $('lang-label');
  if (langLabel) langLabel.textContent = getLocale().toUpperCase();

  // Re-inject icons (i18n textContent clears them from combined elements)
  injectIcons();
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', async () => {
  const isStandalone = new URLSearchParams(window.location.search).has('tab');
  if (isStandalone) {
    document.body.classList.add('standalone');
  }

  injectIcons();
  applyI18n();
  initTheme();

  // Load persisted data before tool init
  loadCache();
  loadOutputTypes();

  // Initially hide all swap buttons
  Object.values(SWAP_BUTTON_MAP).forEach(id => {
    const btn = $(id);
    if (btn) btn.style.display = 'none';
  });

  initCmEditors(isStandalone);

  await initNavigation();
  initOpenInTab();
  initLangToggle();
  initClearCopyButtons();
  initBase64();
  initUrl();
  initHtmlEntity();
  initUnicode();
  initSmartDecode();
  initJson();
  initYaml();
  initQueryString();
  initJwt();
  initCron();
  initTimestamp();
  initNumberBase();
  initColor();
  initText();
  initDiff();
  initMarkdown();
  initHash();
  initUuid();
  initIp();
  initRegex();

  // Restore cached values after all panels are initialized
  restoreCache();

  // Re-render output results that depend on input values
  setTimeout(() => restoreDerivedResults(), CACHE_RESTORE_DELAY);

  // Auto-cache input textareas on typing (non-CM textareas only)
  initInputCaching();
});

// ============ Restore derived results from cache ============

/**
 * Re-compute derived results (JWT, QS tables, etc.) after cache restoration.
 * Deferred to ensure CM editors have their values set.
 */
function restoreDerivedResults() {
  const cacheData = getCacheData();

  if (cacheData['jwt-decoded'] && cacheData['jwt-input']) {
    renderJwtResult(cacheData['jwt-input']);
  }
  if (cacheData['qs-parsed'] && cacheData['qs-input']) {
    renderQsParse(cacheData['qs-input']);
  }
  if (cacheData['cron-parsed'] && cacheData['cron-input']) {
    renderCronParse(cacheData['cron-input']);
  }
  if (cacheData['cron-nexted'] && cacheData['cron-input']) {
    renderCronNext(cacheData['cron-input']);
  }
  if (cacheData['hash-computed'] && cacheData['hash-input']) {
    computeHash();
  }
  if (cacheData['nb-computed'] && cacheData['nb-input']) {
    computeNumberBase();
  }
  if (cacheData['color-computed'] && cacheData['color-input']) {
    computeColor();
  }
  if (cacheData['ts-computed'] && cacheData['ts-input']) {
    if (cacheData['ts-computed'] === 'stamp') {
      computeTsToStamp();
    } else {
      computeTsToReadable();
    }
  }
  if (cacheData['ip-computed'] && cacheData['ip-input']) {
    computeIp();
  }
  if (cacheData['uuid-computed']) {
    renderResultBox('uuid-result', [
      { label: t('uuid.label'), value: cacheData['uuid-computed'], id: 'uuid-r-val' },
    ]);
  }
  if (cacheData['rand-computed']) {
    renderResultBox('rand-result', [
      { label: t('rand.gen'), value: cacheData['rand-computed'], id: 'rand-r-val' },
    ]);
  }
}

// ============ Initialize CodeMirror editors ============

/**
 * Create CodeMirror editor instances for all input/output panels.
 * @param {boolean} isStandalone - Whether running in standalone tab mode
 */
function initCmEditors(isStandalone) {
  let mdRenderTimer;

  const inputEditors = [
    { id: 'json-input', lang: 'json', ph: t('json.placeholder') },
    { id: 'yaml-input', lang: 'yaml', ph: t('yaml.placeholder') },
    { id: 'qs-input', lang: 'querystring', ph: t('qs.placeholder') },
    { id: 'jwt-input', lang: 'jwt', ph: t('jwt.placeholder') },
    { id: 'cron-input', lang: 'cron', ph: t('cron.placeholder'), singleLine: true },
    { id: 'md-input', lang: 'markdown', ph: t('md.placeholder') },
  ];

  const outputEditors = [
    { id: 'json-output', lang: 'json' },
    { id: 'yaml-output', lang: 'yaml' },
    { id: 'qs-output', lang: 'querystring' },
  ];

  for (const cfg of inputEditors) {
    const container = $(cfg.id + '-cm');
    if (!container) continue;
    const view = createEditor({
      parent: container,
      lang: cfg.lang,
      placeholder: cfg.ph || '',
      readOnly: false,
      singleLine: cfg.singleLine || false,
      isStandalone,
      onChange: (value) => {
        saveCache(cfg.id, value);
        // Markdown: live preview rendering
        if (cfg.id === 'md-input') {
          clearTimeout(mdRenderTimer);
          mdRenderTimer = setTimeout(() => {
            const html = MarkdownTool.render(value);
            const preview = $('md-preview');
            if (preview) preview.innerHTML = html;
            const htmlEl = $('md-html');
            if (htmlEl) htmlEl.value = html;
          }, MD_RENDER_DEBOUNCE);
        }
      },
    });
    cmEditors[cfg.id] = { view, lang: cfg.lang };
  }

  for (const cfg of outputEditors) {
    const container = $(cfg.id + '-cm');
    if (!container) continue;
    const view = createEditor({
      parent: container,
      lang: cfg.lang,
      readOnly: true,
      isStandalone,
    });
    cmEditors[cfg.id] = { view, lang: cfg.lang };
  }
}

// ============ Navigation ============

/**
 * Switch the active tool panel.
 * @param {string} tool - Tool identifier (e.g. 'base64', 'json')
 */
function switchTool(tool) {
  document.querySelectorAll('.nav-item').forEach(n =>
    n.classList.toggle('active', n.dataset.tool === tool)
  );
  document.querySelectorAll('.tool-panel').forEach(p =>
    p.classList.toggle('hidden', p.id !== `panel-${tool}`)
  );
}

/** Initialize sidebar navigation: restore last tool and bind click events. */
async function initNavigation() {
  try {
    const result = await chrome.storage.local.get(LAST_TOOL_KEY);
    const lastTool = result[LAST_TOOL_KEY];
    if (lastTool && document.querySelector(`.nav-item[data-tool="${lastTool}"]`)) {
      switchTool(lastTool);
    }
  } catch { /* ignore */ }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tool = item.dataset.tool;
      switchTool(tool);
      try { chrome.storage.local.set({ [LAST_TOOL_KEY]: tool }); } catch { /* ignore */ }
    });
  });
}

/** Open popup in a new browser tab. */
function initOpenInTab() {
  on('open-tab', 'click', () => {
    const url = chrome.runtime.getURL('popup/popup.html?tab=1');
    chrome.tabs.create({ url });
    window.close();
  });
}

/** Bind language toggle button. */
function initLangToggle() {
  on('btn-lang', 'click', () => {
    toggleLocale();
    applyI18n();
  });
}

// ============ Clear / Copy buttons ============

/**
 * Clear all outputs, result boxes, and cached markers within a tool panel.
 * @param {HTMLElement|null} container - The .tool-panel element
 */
function clearPanel(container) {
  if (!container) return;

  // Clear output CM editors
  container.querySelectorAll('[id$="-output-cm"]').forEach(cmContainer => {
    const outId = cmContainer.id.replace('-cm', '');
    if (cmEditors[outId]) {
      setEditorValue(cmEditors[outId].view, '');
      saveCache(outId, '');
    }
  });

  // Clear output textareas (non-CM)
  container.querySelectorAll('.io-area-output .io-textarea').forEach(out => {
    if (cmEditors[out.id]) return;
    out.value = '';
    saveCache(out.id, '');
    removeOutputType(out.id);
    updateOutputVisibility(out.id);
  });

  // Clear output type overrides for CM outputs
  container.querySelectorAll('[id$="-output-cm"]').forEach(cmContainer => {
    const outId = cmContainer.id.replace('-cm', '');
    removeOutputType(outId);
    updateOutputVisibility(outId);
  });

  // Hide special result boxes
  container.querySelectorAll('.result-box, .jwt-result, .decode-layers, .qs-table-wrap').forEach(el => {
    el.classList.add('hidden');
  });

  // Clear cached computation markers
  CACHE_MARKERS.forEach(key => {
    if (getCacheData()[key]) {
      saveCache(key, '');
    }
  });

  // Clear diff results
  const diffResult = container.querySelector('.diff-result');
  const diffStats = container.querySelector('.text-stats');
  if (diffResult) diffResult.classList.add('hidden');
  if (diffStats) diffStats.classList.add('hidden');

  // Clear Markdown preview
  const mdPreview = container.querySelector('#md-preview');
  if (mdPreview) mdPreview.innerHTML = '';
  const mdHtml = container.querySelector('#md-html');
  if (mdHtml) mdHtml.value = '';

  // Clear JSON warnings
  const jsonWarn = container.querySelector('#json-warnings');
  if (jsonWarn) jsonWarn.classList.add('hidden');

  // Clear regex-specific elements
  const regexError = container.querySelector('#regex-error');
  if (regexError) regexError.classList.add('hidden');
  const regexHL = container.querySelector('#regex-highlight');
  if (regexHL) regexHL.classList.add('hidden');
  const regexMatches = container.querySelector('#regex-matches');
  if (regexMatches) regexMatches.classList.add('hidden');
}

/** Bind clear and copy buttons in all tool panels. */
function initClearCopyButtons() {
  document.querySelectorAll('.btn-clear').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.clear;

      // Clear CM editor or textarea/input
      if (cmEditors[targetId]) {
        setEditorValue(cmEditors[targetId].view, '');
        focusEditor(cmEditors[targetId].view);
      } else {
        const target = $(targetId);
        if (target) {
          target.value = '';
          target.focus();
        }
      }
      saveCache(targetId, '');

      // Regex pattern clear: also clear flags
      if (targetId === 'regex-pattern') {
        const flagsEl = $('regex-flags');
        if (flagsEl) flagsEl.value = 'g';
        const replaceEl = $('regex-replace');
        if (replaceEl) replaceEl.value = '';
        const textEl = $('regex-text');
        if (textEl) { textEl.value = ''; saveCache('regex-text', ''); }
      }

      // Diff clear: also clear the other input
      if (targetId === 'diff-a') {
        const other = $('diff-b');
        if (other) { other.value = ''; saveCache('diff-b', ''); }
      } else if (targetId === 'diff-b') {
        const other = $('diff-a');
        if (other) { other.value = ''; saveCache('diff-a', ''); }
      }

      const container = cmEditors[targetId]
        ? cmEditors[targetId].view.dom.closest('.tool-panel')
        : $(targetId)?.closest('.tool-panel');
      clearPanel(container);
    });
  });

  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      let text = '';
      if (btn.dataset.copy) {
        text = getCmOrTextareaValue(btn.dataset.copy);
      } else if (btn.dataset.copyText) {
        const el = $(btn.dataset.copyText);
        text = el ? el.textContent || '' : '';
      }
      if (text) copyToClipboard(text);
    });
  });
}

/** Auto-cache non-CM input fields on typing. */
function initInputCaching() {
  const inputs = document.querySelectorAll('.io-textarea:not([readonly]), .io-input');
  inputs.forEach(el => {
    if (!el.id || cmEditors[el.id]) return;
    el.addEventListener('input', () => {
      saveCache(el.id, el.value);
    });
  });
}

// ============ Base64 ============

function initBase64() {
  on('base64-encode', 'click', () => {
    const urlSafe = $('base64-urlsafe')?.checked || false;
    setOutput('base64-output', Base64Tool.encode($('base64-input').value, urlSafe));
  });
  on('base64-decode', 'click', () => {
    setOutput('base64-output', Base64Tool.decode($('base64-input').value));
  });
  on('base64-swap', 'click', () => swap('base64-input', 'base64-output'));
}

// ============ URL ============

function initUrl() {
  on('url-encode-comp', 'click', () => {
    setOutput('url-output', UrlTool.encodeComponent($('url-input').value));
  });
  on('url-encode-uri', 'click', () => {
    setOutput('url-output', UrlTool.encodeURI($('url-input').value));
  });
  on('url-decode-btn', 'click', () => {
    setOutput('url-output', UrlTool.decode($('url-input').value, $('url-form-mode')?.checked || false));
  });
  on('url-recursive', 'click', () => {
    const r = UrlTool.recursiveDecode($('url-input').value, $('url-form-mode')?.checked || false);
    setOutput('url-output', r);
    if (r.layers && r.layers.length > 1) {
      showToast(`Recursive: ${r.layers.length - 1} layers`);
    }
  });
  on('url-swap', 'click', () => swap('url-input', 'url-output'));
}

// ============ HTML Entity ============

function initHtmlEntity() {
  on('html-encode', 'click', () => {
    setOutput('html-output', HtmlEntityTool.encode($('html-input').value, $('html-encode-all')?.checked || false));
  });
  on('html-decode', 'click', () => {
    setOutput('html-output', HtmlEntityTool.decode($('html-input').value));
  });
  on('html-swap', 'click', () => swap('html-input', 'html-output'));
}

// ============ Unicode ============

function initUnicode() {
  on('unicode-encode', 'click', () => {
    setOutput('unicode-output', UnicodeTool.encode($('unicode-input').value, $('unicode-encode-all')?.checked || false));
  });
  on('unicode-decode', 'click', () => {
    setOutput('unicode-output', UnicodeTool.decode($('unicode-input').value));
  });
  on('unicode-swap', 'click', () => swap('unicode-input', 'unicode-output'));
}

// ============ Smart Decode ============

function initSmartDecode() {
  on('smart-decode-btn', 'click', () => {
    const input = $('smart-input')?.value || '';
    if (!input.trim()) return;
    const r = SmartDecodeTool.recursiveDecode(input);
    const layersEl = $('smart-layers');
    if (layersEl) {
      layersEl.innerHTML = '';
      if (r.data.layers.length > 1) {
        r.data.layers.forEach((l, i) => {
          if (i === 0) return;
          const div = document.createElement('div');
          div.className = 'decode-layer';
          div.innerHTML = `<span class="decode-layer-type">${escapeHtml(l.type)}</span>` +
            `<span class="decode-layer-value" title="${escapeHtml(l.value)}">${escapeHtml(l.value)}</span>`;
          layersEl.appendChild(div);
        });
      }
    }
    const output = $('smart-output');
    if (output) {
      output.value = r.data.result;
      updateOutputVisibility('smart-output');
      saveCache('smart-output', output.value);
    }
  });
}

// ============ JSON ============

function initJson() {
  function updateJsonToYamlSpacingVisibility() {
    const isFlow = $('json-to-yaml-array-style')?.value === 'flow';
    const spacingSelect = $('json-to-yaml-array-spacing');
    const spacingDot = $('json-to-yaml-spacing-dot');
    if (spacingSelect) spacingSelect.style.display = isFlow ? '' : 'none';
    if (spacingDot) spacingDot.style.display = isFlow ? '' : 'none';
  }

  on('json-to-yaml-array-style', 'change', updateJsonToYamlSpacingVisibility);
  updateJsonToYamlSpacingVisibility();

  on('json-format', 'click', () => {
    const indent = parseInt($('json-indent')?.value || String(DEFAULT_INDENT));
    const relaxed = $('json-relaxed')?.checked || false;
    const r = JsonTool.format(getCmOrTextareaValue('json-input'), indent, 'none', relaxed);
    setOutput('json-output', r, 'json');
    const warn = $('json-warnings');
    if (warn) {
      if (r.warnings && r.warnings.length) {
        warn.textContent = r.warnings.join('\n');
        warn.classList.remove('hidden');
      } else {
        warn.classList.add('hidden');
      }
    }
  });
  on('json-minify', 'click', () => {
    const relaxed = $('json-relaxed')?.checked || false;
    setOutput('json-output', JsonTool.minify(getCmOrTextareaValue('json-input'), relaxed), 'json');
  });
  on('json-sort', 'click', () => {
    const indent = parseInt($('json-indent')?.value || String(DEFAULT_INDENT));
    const relaxed = $('json-relaxed')?.checked || false;
    const sortMode = $('json-sort-mode')?.value || 'key-asc';
    setOutput('json-output', JsonTool.sort(getCmOrTextareaValue('json-input'), sortMode, indent, relaxed), 'json');
  });
  on('json-to-yaml', 'click', () => {
    const relaxed = $('json-relaxed')?.checked || false;
    const inputVal = getCmOrTextareaValue('json-input');
    const input = relaxed ? JsonTool._relaxedClean(inputVal) : inputVal;
    const yamlIndent = parseInt($('json-to-yaml-indent')?.value || String(DEFAULT_INDENT));
    const opts = {
      arrayStyle: $('json-to-yaml-array-style')?.value || 'block',
      arraySpacing: $('json-to-yaml-array-spacing')?.value || 'space',
      removeQuotes: $('json-to-yaml-remove-quotes')?.checked || false,
    };
    setOutput('json-output', YamlTool.fromJson(input, yamlIndent, opts), 'yaml');
  });
  on('json-swap', 'click', () => swap('json-input', 'json-output'));
}

// ============ YAML ============

function initYaml() {
  function getYamlOpts() {
    return {
      arrayStyle: $('yaml-array-style')?.value || 'block',
      arraySpacing: $('yaml-array-spacing')?.value || 'space',
      removeQuotes: $('yaml-remove-quotes')?.checked || false,
    };
  }

  function updateSpacingVisibility() {
    const isFlow = $('yaml-array-style')?.value === 'flow';
    const spacingSelect = $('yaml-array-spacing');
    const spacingDot = $('yaml-spacing-dot');
    if (spacingSelect) spacingSelect.style.display = isFlow ? '' : 'none';
    if (spacingDot) spacingDot.style.display = isFlow ? '' : 'none';
  }

  on('yaml-array-style', 'change', updateSpacingVisibility);
  updateSpacingVisibility();

  on('yaml-format', 'click', () => {
    const indent = parseInt($('yaml-indent')?.value || String(DEFAULT_INDENT));
    const input = getCmOrTextareaValue('yaml-input');
    setOutput('yaml-output', YamlTool.format(input, indent, getYamlOpts()), 'yaml');
  });
  on('yaml-sort', 'click', () => {
    const indent = parseInt($('yaml-indent')?.value || String(DEFAULT_INDENT));
    const sortMode = $('yaml-sort-mode')?.value || 'key-asc';
    setOutput('yaml-output', YamlTool.sort(getCmOrTextareaValue('yaml-input'), sortMode, indent, getYamlOpts()), 'yaml');
  });
  on('yaml-to-json', 'click', () => {
    const indent = parseInt($('yaml-to-json-indent')?.value || String(DEFAULT_INDENT));
    setOutput('yaml-output', YamlTool.toJson(getCmOrTextareaValue('yaml-input'), indent), 'json');
  });
  on('yaml-swap', 'click', () => swap('yaml-input', 'yaml-output'));
}

// ============ Query String ============

/**
 * Parse a query string and render the key-value table.
 * @param {string} input - URL or query string to parse
 */
function renderQsParse(input) {
  if (!input) return;
  const r = QueryStringTool.parse(input);
  const wrap = $('qs-table-wrap');
  const table = $('qs-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (r.success && r.data.length > 0) {
    if (wrap) wrap.classList.remove('hidden');
    r.data.forEach((p) => {
      const tr = document.createElement('tr');
      const hasValue = p.value !== null;
      tr.innerHTML =
        `<td><span class="qs-cell-text">${escapeHtml(p.key)}</span>` +
        `<button class="btn-small btn-copy qs-cell-copy"><span class="btn-icon" data-icon="copy"></span></button></td>` +
        `<td><span class="qs-cell-text">${hasValue ? escapeHtml(p.value) : `<em style="color:var(--text-muted)">${t('qs.noValue')}</em>`}</span>` +
        `${hasValue ? '<button class="btn-small btn-copy qs-cell-copy"><span class="btn-icon" data-icon="copy"></span></button>' : ''}</td>`;
      tbody.appendChild(tr);
    });

    // Inject icons and bind copy handlers for QS table
    table.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if (icons[name]) el.innerHTML = icons[name];
    });
    table.querySelectorAll('.qs-cell-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const cell = btn.closest('td');
        const textEl = cell?.querySelector('.qs-cell-text');
        const text = textEl ? textEl.textContent || '' : '';
        if (text) copyToClipboard(text);
      });
    });
    saveCache('qs-parsed', '1');
  } else {
    if (wrap) wrap.classList.add('hidden');
    if (!r.success) {
      setOutput('qs-output', r, 'querystring');
    }
  }
}

function initQueryString() {
  on('qs-parse', 'click', () => {
    renderQsParse(getCmOrTextareaValue('qs-input'));
  });
  on('qs-build', 'click', () => {
    const table = $('qs-table');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const params = Array.from(rows).map(tr => {
      const cells = tr.querySelectorAll('td');
      return {
        key: cells[0].textContent,
        value: cells[1].querySelector('em') ? null : cells[1].textContent,
      };
    });
    setOutput('qs-output', QueryStringTool.build(params), 'querystring');
  });
}

// ============ JWT ============

/**
 * Recursively highlight a JSON value into HTML with syntax tokens.
 * @param {*} val - JSON value
 * @param {number} indent - Current indentation level
 * @returns {string} HTML string
 */
function highlightJsonValue(val, indent) {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + DEFAULT_INDENT);

  if (val === null) return '<span class="hl-bool">null</span>';
  if (typeof val === 'boolean') return `<span class="hl-bool">${val}</span>`;
  if (typeof val === 'number') return `<span class="hl-num">${val}</span>`;
  if (typeof val === 'string') return `<span class="hl-str">"${escapeHtml(val)}"</span>`;

  if (Array.isArray(val)) {
    if (val.length === 0) return '<span class="hl-punct">[]</span>';
    const items = val.map(v => `${pad2}${highlightJsonValue(v, indent + DEFAULT_INDENT)}`);
    return `<span class="hl-punct">[</span>\n${items.join('<span class="hl-punct">,</span>\n')}\n${pad}<span class="hl-punct">]</span>`;
  }

  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return '<span class="hl-punct">{}</span>';
    const entries = keys.map(k => {
      const kStr = `<span class="hl-key">"${escapeHtml(k)}"</span>`;
      const vStr = highlightJsonValue(val[k], indent + DEFAULT_INDENT);
      return `${pad2}${kStr}<span class="hl-punct">:</span> ${vStr}`;
    });
    return `<span class="hl-punct">{</span>\n${entries.join('<span class="hl-punct">,</span>\n')}\n${pad}<span class="hl-punct">}</span>`;
  }

  return escapeHtml(String(val));
}

/**
 * Decode a JWT token and render the result sections.
 * @param {string} input - JWT token string
 */
function renderJwtResult(input) {
  if (!input) return;
  const r = JwtTool.decode(input);
  const result = $('jwt-result');
  if (r.success) {
    if (result) result.classList.remove('hidden');
    const headerEl = $('jwt-header');
    if (headerEl) headerEl.innerHTML = highlightJsonValue(r.data.headerObj, 0);
    const payloadEl = $('jwt-payload');
    if (payloadEl) payloadEl.innerHTML = highlightJsonValue(r.data.payloadObj, 0);
    const sigEl = $('jwt-signature');
    if (sigEl) sigEl.textContent = r.data.signature;
    const expEl = $('jwt-exp-info');
    if (expEl) {
      if (r.data.expInfo) {
        expEl.classList.remove('hidden', 'expired', 'valid');
        expEl.classList.add(r.data.expInfo.expired ? 'expired' : 'valid');
        expEl.textContent = r.data.expInfo.expired
          ? `${t('jwt.expired')} (${r.data.expInfo.relative}, ${r.data.expInfo.expDate})`
          : `${t('jwt.valid')} (${r.data.expInfo.relative}, ${r.data.expInfo.expDate})`;
      } else {
        expEl.classList.add('hidden');
      }
    }
    injectIcons();
    initClearCopyButtons();
    saveCache('jwt-decoded', '1');
  } else {
    if (result) result.classList.add('hidden');
    showToast(r.error, TOAST_ERROR_DURATION);
  }
}

function initJwt() {
  on('jwt-decode', 'click', () => {
    renderJwtResult(getCmOrTextareaValue('jwt-input').trim());
  });
}

// ============ Cron ============

/**
 * Parse a cron expression and render description.
 * @param {string} input - Cron expression
 */
function renderCronParse(input) {
  if (!input) return;
  const r = CronTool.parse(input);
  if (r.success) {
    renderResultBox('cron-desc', [
      { label: t('cron.description'), value: r.data.description, id: 'cron-r-desc' },
      { label: t('cron.format'), value: r.data.format, id: 'cron-r-fmt' },
    ]);
    saveCache('cron-parsed', '1');
  } else {
    renderResultBox('cron-desc', [
      { label: t('error.prefix'), value: r.error, id: 'cron-r-err' },
    ]);
  }
}

/**
 * Compute next N runs for a cron expression.
 * @param {string} input - Cron expression
 */
function renderCronNext(input) {
  if (!input) return;
  const tz = $('cron-timezone')?.value || DEFAULT_TIMEZONE;
  const r = CronTool.nextRuns(input, 10, tz);
  if (r.success) {
    const rows = r.data.map((time, i) => ({
      label: `#${i + 1}`,
      value: time,
      id: `cron-r-run${i}`,
    }));
    rows.push({ label: t('ts.timezone'), value: tz, id: 'cron-r-tz' });
    renderResultBox('cron-runs', rows);
    saveCache('cron-nexted', '1');
  } else {
    renderResultBox('cron-runs', [
      { label: t('error.prefix'), value: r.error, id: 'cron-r-err' },
    ]);
  }
}

function initCron() {
  on('cron-parse', 'click', () => {
    renderCronParse(getCmOrTextareaValue('cron-input').trim());
  });
  on('cron-next', 'click', () => {
    renderCronNext(getCmOrTextareaValue('cron-input').trim());
  });
}

// ============ Timestamp ============

function initTimestamp() {
  on('ts-to-readable', 'click', computeTsToReadable);
  on('ts-to-stamp', 'click', computeTsToStamp);
  on('ts-now', 'click', () => {
    const r = TimestampTool.now();
    const input = $('ts-input');
    if (input) { input.value = String(r.data.seconds); saveCache('ts-input', input.value); }
    renderResultBox('ts-result', [
      { label: t('ts.seconds'), value: String(r.data.seconds), id: 'ts-r-sec' },
      { label: t('ts.milliseconds'), value: String(r.data.milliseconds), id: 'ts-r-ms' },
      { label: t('ts.iso'), value: r.data.iso, id: 'ts-r-iso' },
    ]);
    saveCache('ts-computed', 'readable');
  });
}

function computeTsToReadable() {
  const tz = $('ts-timezone')?.value || DEFAULT_TIMEZONE;
  const input = $('ts-input')?.value || '';
  const r = TimestampTool.toReadable(input, tz);
  if (r.success) {
    renderResultBox('ts-result', [
      { label: t('ts.datetime'), value: r.meta.datetime, id: 'ts-r-datetime' },
      { label: t('ts.iso'), value: r.meta.iso, id: 'ts-r-iso' },
      { label: t('ts.timezone'), value: r.meta.timezone, id: 'ts-r-tz' },
      { label: t('ts.unit'), value: `${r.meta.unit === 's' ? t('ts.unitSec') : t('ts.unitMs')} ${t('ts.autoDetect')}`, id: 'ts-r-unit' },
      { label: t('ts.relative'), value: r.meta.relative, id: 'ts-r-relative' },
    ]);
    saveCache('ts-computed', 'readable');
  } else {
    renderResultBox('ts-result', [
      { label: t('error.prefix'), value: r.error, id: 'ts-r-err' },
    ]);
  }
}

function computeTsToStamp() {
  const input = $('ts-input')?.value || '';
  const r = TimestampTool.fromReadable(input);
  if (r.success) {
    renderResultBox('ts-result', [
      { label: t('ts.seconds'), value: r.data, id: 'ts-r-sec' },
      { label: t('ts.milliseconds'), value: String(parseInt(r.data) * 1000), id: 'ts-r-ms' },
    ]);
    saveCache('ts-computed', 'stamp');
  } else {
    renderResultBox('ts-result', [
      { label: t('error.prefix'), value: r.error, id: 'ts-r-err' },
    ]);
  }
}

// ============ Number Base ============

function initNumberBase() {
  on('nb-convert', 'click', computeNumberBase);
}

function computeNumberBase() {
  const input = $('nb-input')?.value || '';
  if (!input.trim()) return;
  const r = NumberBaseTool.convert(input);
  const result = $('nb-result');
  if (r.success) {
    if (result) result.classList.remove('hidden');
    const binEl = $('nb-bin');
    if (binEl) binEl.textContent = r.data.BIN_F;
    const octEl = $('nb-oct');
    if (octEl) octEl.textContent = r.data.OCT;
    const decEl = $('nb-dec');
    if (decEl) decEl.textContent = r.data.DEC;
    const hexEl = $('nb-hex');
    if (hexEl) hexEl.textContent = r.data.HEX_F;
    saveCache('nb-computed', '1');
  } else {
    if (result) result.classList.add('hidden');
    showToast(r.error, TOAST_ERROR_DURATION);
  }
}

// ============ Color ============

function initColor() {
  on('color-convert', 'click', computeColor);
}

function computeColor() {
  const input = $('color-input')?.value || '';
  if (!input.trim()) return;
  const r = ColorTool.parse(input);
  const result = $('color-result');
  if (r.success) {
    if (result) result.classList.remove('hidden');
    const all = ColorTool.toAll(r.data);
    const hexEl = $('color-hex');
    if (hexEl) hexEl.textContent = all.hex;
    const rgbEl = $('color-rgb');
    if (rgbEl) rgbEl.textContent = all.rgb;
    const hslEl = $('color-hsl');
    if (hslEl) hslEl.textContent = all.hsl;
    const preview = $('color-preview');
    if (preview) preview.style.backgroundColor = all.rgb;
    saveCache('color-computed', '1');
  } else {
    if (result) result.classList.add('hidden');
    showToast(r.error, TOAST_ERROR_DURATION);
  }
}

// ============ Text ============

function initText() {
  const getInput = () => $('text-input')?.value || '';
  const setResult = (v) => {
    const el = $('text-output');
    if (el) {
      el.value = v;
      updateOutputVisibility('text-output');
      saveCache('text-output', v);
    }
  };

  on('text-upper', 'click', () => setResult(TextTool.toUpperCase(getInput())));
  on('text-lower', 'click', () => setResult(TextTool.toLowerCase(getInput())));
  on('text-title', 'click', () => setResult(TextTool.toTitleCase(getInput())));
  on('text-camel', 'click', () => setResult(TextTool.toCamelCase(getInput())));
  on('text-pascal', 'click', () => setResult(TextTool.toPascalCase(getInput())));
  on('text-snake', 'click', () => setResult(TextTool.toSnakeCase(getInput())));
  on('text-kebab', 'click', () => setResult(TextTool.toKebabCase(getInput())));
  on('text-dedup', 'click', () => setResult(TextTool.removeDuplicateLines(getInput())));
  on('text-sort-asc', 'click', () => setResult(TextTool.sortLines(getInput(), 'asc')));
  on('text-sort-desc', 'click', () => setResult(TextTool.sortLines(getInput(), 'desc')));
  on('text-shuffle', 'click', () => setResult(TextTool.sortLines(getInput(), 'shuffle')));
  on('text-trim', 'click', () => setResult(TextTool.trimLines(getInput())));
  on('text-empty', 'click', () => setResult(TextTool.removeEmptyLines(getInput())));
  on('text-lineno', 'click', () => setResult(TextTool.addLineNumbers(getInput())));

  on('text-input', 'input', () => {
    const s = TextTool.stats(getInput());
    const statsEl = $('text-stats');
    if (statsEl) statsEl.textContent = t('text.stats', s);
  });
}

// ============ Diff ============

function initDiff() {
  on('diff-compare', 'click', () => {
    const a = $('diff-a')?.value || '';
    const b = $('diff-b')?.value || '';
    const ignoreWs = $('diff-ignore-ws')?.checked || false;
    const r = DiffTool.compare(a, b, ignoreWs);
    const stats = $('diff-stats');
    const result = $('diff-result');
    if (stats) {
      stats.classList.remove('hidden');
      stats.textContent = t('diff.stats', r.data.stats);
    }
    if (result) {
      result.classList.remove('hidden');
      result.innerHTML = r.data.changes.map(c => {
        if (c.type === 'equal') return `<div class="diff-line"> ${escapeHtml(c.lineA)}</div>`;
        if (c.type === 'add') return `<div class="diff-line diff-add">+${escapeHtml(c.lineB)}</div>`;
        if (c.type === 'remove') return `<div class="diff-line diff-remove">-${escapeHtml(c.lineA)}</div>`;
        return '';
      }).join('');
    }
  });
}

// ============ Markdown ============

function initMarkdown() {
  // Render initial Markdown from cache
  setTimeout(() => {
    const input = getCmOrTextareaValue('md-input');
    if (input) {
      const html = MarkdownTool.render(input);
      const preview = $('md-preview');
      if (preview) preview.innerHTML = html;
      const htmlEl = $('md-html');
      if (htmlEl) htmlEl.value = html;
    }
  }, MD_CACHE_RESTORE_DELAY);
}

// ============ Hash ============

function initHash() {
  on('hash-compute', 'click', computeHash);
}

async function computeHash() {
  const input = $('hash-input')?.value || '';
  const r = await HashTool.computeAll(input);
  const result = $('hash-result');
  if (r.success && result) {
    result.classList.remove('hidden');
    const upper = $('hash-upper')?.checked || false;
    for (const [alg, val] of Object.entries(r.data)) {
      const id = 'hash-' + alg.toLowerCase().replace('-', '');
      const el = $(id);
      if (el) el.textContent = upper ? val.toUpperCase() : val;
    }
    saveCache('hash-computed', '1');
  }
}

// ============ UUID / Random ============

function initUuid() {
  on('uuid-gen', 'click', () => {
    const upper = $('uuid-upper')?.checked || false;
    const noDash = $('uuid-nodash')?.checked || false;
    const uuid = UuidTool.generateV4(upper, !noDash);
    renderResultBox('uuid-result', [
      { label: t('uuid.label'), value: uuid, id: 'uuid-r-val' },
    ]);
    saveCache('uuid-computed', uuid);
  });
  on('rand-gen', 'click', () => {
    const len = parseInt($('rand-len')?.value || String(DEFAULT_RAND_LENGTH)) || DEFAULT_RAND_LENGTH;
    const charset = $('rand-charset')?.value || 'alphanumeric';
    const noAmb = $('rand-no-ambiguous')?.checked || false;
    const val = UuidTool.randomString(len, charset, noAmb);
    renderResultBox('rand-result', [
      { label: t('rand.gen'), value: val, id: 'rand-r-val' },
    ]);
    saveCache('rand-computed', val);
  });
  on('rand-pwd', 'click', () => {
    const len = parseInt($('rand-len')?.value || String(DEFAULT_RAND_LENGTH)) || DEFAULT_RAND_LENGTH;
    const val = UuidTool.randomPassword(len);
    renderResultBox('rand-result', [
      { label: t('rand.pwd'), value: val, id: 'rand-r-val' },
    ]);
    saveCache('rand-computed', val);
  });
}

// ============ IP ============

/**
 * Render IP calculation result with optional error fallback.
 * @param {Array<{label: string, value: string, id: string}>} rows - Result rows
 */
function renderIpResult(rows) {
  renderResultBox('ip-result', rows);
  if (rows.length > 0 && rows[0].id !== 'ip-r-err') {
    saveCache('ip-computed', '1');
  }
}

function computeIp() {
  const input = $('ip-input')?.value?.trim() || '';
  if (!input) return;

  if (input.includes('/')) {
    const r = IpTool.cidr(input);
    if (r.success) {
      const rows = Object.entries(r.data).map(([k, v]) => ({
        label: t(IP_FIELD_I18N[k] || k),
        value: String(v),
        id: `ip-r-${k}`,
      }));
      renderIpResult(rows);
    } else {
      renderIpResult([{ label: t('error.prefix'), value: r.error, id: 'ip-r-err' }]);
    }
  } else {
    const r = IpTool.ipToInt(input);
    if (r.success) {
      const rows = [{ label: t('ip.integer'), value: String(r.data), id: 'ip-r-int' }];
      const cidr = IpTool.cidr(input + '/32');
      if (cidr.success) {
        Object.entries(cidr.data).forEach(([k, v]) => {
          rows.push({ label: t(IP_FIELD_I18N[k] || k), value: String(v), id: `ip-r-${k}` });
        });
      }
      renderIpResult(rows);
    } else {
      const r2 = IpTool.intToIp(input);
      if (r2.success) {
        renderIpResult([{ label: t('ip.ipAddr'), value: r2.data, id: 'ip-r-ip' }]);
      } else {
        renderIpResult([{ label: t('error.prefix'), value: r.error, id: 'ip-r-err' }]);
      }
    }
  }
}

function initIp() {
  on('ip-calc', 'click', computeIp);
  on('ip-to-int', 'click', () => {
    const r = IpTool.ipToInt($('ip-input')?.value || '');
    if (r.success) {
      renderIpResult([{ label: t('ip.integer'), value: String(r.data), id: 'ip-r-int' }]);
    } else {
      renderIpResult([{ label: t('error.prefix'), value: r.error, id: 'ip-r-err' }]);
    }
  });
  on('int-to-ip', 'click', () => {
    const r = IpTool.intToIp($('ip-input')?.value || '');
    if (r.success) {
      renderIpResult([{ label: t('ip.ipAddr'), value: r.data, id: 'ip-r-ip' }]);
    } else {
      renderIpResult([{ label: t('error.prefix'), value: r.error, id: 'ip-r-err' }]);
    }
  });
}

// ============ Regex ============

function initRegex() {
  const presetsSelect = $('regex-presets-select');
  if (presetsSelect && RegexTool.COMMON_PATTERNS) {
    RegexTool.COMMON_PATTERNS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify(p);
      opt.dataset.i18n = p.nameKey;
      opt.textContent = t(p.nameKey);
      presetsSelect.appendChild(opt);
    });
    presetsSelect.addEventListener('change', () => {
      if (presetsSelect.value) {
        try {
          const p = JSON.parse(presetsSelect.value);
          const patternEl = $('regex-pattern');
          const flagsEl = $('regex-flags');
          if (patternEl) patternEl.value = p.pattern;
          if (flagsEl) flagsEl.value = p.flags;
          runRegex();
        } catch { /* ignore */ }
      }
    });
  }

  let regexTimer;

  /** Execute regex test, highlight, and replace. */
  function runRegex() {
    const pattern = $('regex-pattern')?.value || '';
    const flags = $('regex-flags')?.value || '';
    const text = $('regex-text')?.value || '';
    const errorEl = $('regex-error');
    const highlightEl = $('regex-highlight');
    const matchesEl = $('regex-matches');

    if (!pattern) {
      if (errorEl) errorEl.classList.add('hidden');
      if (highlightEl) highlightEl.classList.add('hidden');
      if (matchesEl) matchesEl.classList.add('hidden');
      return;
    }

    const r = RegexTool.test(pattern, flags, text);
    if (!r.success) {
      if (errorEl) { errorEl.textContent = r.error; errorEl.classList.remove('hidden'); }
      if (highlightEl) highlightEl.classList.add('hidden');
      if (matchesEl) matchesEl.classList.add('hidden');
      return;
    }
    if (errorEl) errorEl.classList.add('hidden');

    const hl = RegexTool.highlight(pattern, flags, text);
    if (highlightEl) {
      if (hl.success && text) {
        highlightEl.classList.remove('hidden');
        highlightEl.innerHTML = hl.data.map(p =>
          p.type === 'match' ? `<mark>${escapeHtml(p.value)}</mark>` : escapeHtml(p.value)
        ).join('');
      } else {
        highlightEl.classList.add('hidden');
      }
    }

    if (matchesEl) {
      if (r.data.count > 0) {
        matchesEl.classList.remove('hidden');
        matchesEl.innerHTML =
          `<div style="margin-bottom:6px;font-weight:600">${t('regex.matches', { count: r.data.count })}</div>` +
          r.data.matches.slice(0, MAX_REGEX_MATCHES).map((m, i) =>
            `<div class="result-row"><span class="result-label">#${i + 1}</span>` +
            `<span class="result-value">"${escapeHtml(m.match)}" @${m.index}` +
            `${m.groups.length ? ' groups: ' + m.groups.map(g => `"${g}"`).join(', ') : ''}</span></div>`
          ).join('');
      } else {
        matchesEl.classList.remove('hidden');
        matchesEl.textContent = t('regex.noMatch');
      }
    }

    const replacement = $('regex-replace')?.value;
    if (replacement !== undefined && replacement !== null) {
      const rr = RegexTool.replace(pattern, flags, text, replacement);
      const resultEl = $('regex-result');
      if (resultEl) {
        resultEl.value = rr.success ? rr.data : '';
        updateOutputVisibility('regex-result');
      }
    }
  }

  ['regex-pattern', 'regex-flags', 'regex-text', 'regex-replace'].forEach(id => {
    on(id, 'input', () => {
      clearTimeout(regexTimer);
      regexTimer = setTimeout(runRegex, REGEX_DEBOUNCE);
    });
  });
}
