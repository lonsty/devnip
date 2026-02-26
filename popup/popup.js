// Devnip - Popup logic
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
import { t, getLocale, toggleLocale } from './i18n.js';
import { icons } from './icons.js';

// ============ Helpers ============
function $(id) { return document.getElementById(id); }

function on(id, event, handler) {
  const el = typeof id === 'string' ? $(id) : id;
  if (el) el.addEventListener(event, handler);
}

function showToast(msg, duration = 2000) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast(t('toast.copied')))
    .catch(() => showToast(t('toast.copyFail')));
}

function swap(inputId, outputId) {
  const inp = $(inputId), out = $(outputId);
  if (!inp || !out) return;
  const tmp = inp.value;
  inp.value = out.value;
  out.value = tmp;
}

function setOutput(id, result) {
  const el = $(id);
  if (!el) return;
  if (result.success) {
    el.value = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);
  } else {
    el.value = `${t('error.prefix')}: ${result.error}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============ Icon injection ============
function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    if (icons[name]) {
      el.innerHTML = icons[name];
    }
  });
}

// ============ i18n DOM update ============
function applyI18n() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  // Titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  // Lang button label
  const langLabel = $('lang-label');
  if (langLabel) langLabel.textContent = getLocale().toUpperCase();
  // Re-inject icons (i18n textContent clears them from combined elements)
  injectIcons();
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', async () => {
  if (new URLSearchParams(window.location.search).has('tab')) {
    document.body.classList.add('standalone');
  }

  injectIcons();
  applyI18n();
  initTheme();

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
});

function switchTool(tool) {
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.tool-panel');
  navItems.forEach(n => n.classList.toggle('active', n.dataset.tool === tool));
  panels.forEach(p => p.classList.toggle('hidden', p.id !== `panel-${tool}`));
}

async function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  // Restore last used tool
  try {
    const result = await chrome.storage.local.get('devnip-last-tool');
    const lastTool = result['devnip-last-tool'];
    if (lastTool && document.querySelector(`.nav-item[data-tool="${lastTool}"]`)) {
      switchTool(lastTool);
    }
  } catch { /* ignore */ }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tool = item.dataset.tool;
      switchTool(tool);
      try { chrome.storage.local.set({ 'devnip-last-tool': tool }); } catch { /* ignore */ }
    });
  });
}

// ============ Open in tab ============
function initOpenInTab() {
  on('open-tab', 'click', () => {
    const url = chrome.runtime.getURL('popup/popup.html?tab=1');
    chrome.tabs.create({ url });
    window.close();
  });
}

// ============ Language toggle ============
function initLangToggle() {
  on('btn-lang', 'click', () => {
    toggleLocale();
    applyI18n();
  });
}

// ============ Theme ============
const THEME_CYCLE = ['system', 'light', 'dark'];
const THEME_ICONS = { system: 'themeSys', light: 'themeLt', dark: 'themeDk' };

function applyTheme(mode) {
  const html = document.documentElement;
  if (mode === 'system') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', mode);
  }
  // Update button icon
  const iconEl = $('theme-icon');
  if (iconEl && icons[THEME_ICONS[mode]]) {
    iconEl.innerHTML = icons[THEME_ICONS[mode]];
  }
}

function initTheme() {
  let mode = 'system';
  try {
    const saved = localStorage.getItem('devnip-theme');
    if (saved && THEME_CYCLE.includes(saved)) mode = saved;
  } catch { /* ignore */ }
  applyTheme(mode);

  on('btn-theme', 'click', () => {
    const current = localStorage.getItem('devnip-theme') || 'system';
    const idx = THEME_CYCLE.indexOf(current);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    try { localStorage.setItem('devnip-theme', next); } catch { /* ignore */ }
    applyTheme(next);
  });
}

// ============ Clear / Copy buttons ============
function initClearCopyButtons() {
  document.querySelectorAll('.btn-clear').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.clear;
      const target = $(targetId);
      if (target) { target.value = ''; target.focus(); }
    });
  });

  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      let text = '';
      if (btn.dataset.copy) {
        const el = $(btn.dataset.copy);
        text = el ? el.value || '' : '';
      } else if (btn.dataset.copyText) {
        const el = $(btn.dataset.copyText);
        text = el ? el.textContent || '' : '';
      }
      if (text) copyToClipboard(text);
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
    if (r.layers && r.layers.length > 1) showToast(`Recursive: ${r.layers.length - 1} layers`);
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
          div.innerHTML = `<span class="decode-layer-type">${escapeHtml(l.type)}</span><span class="decode-layer-value" title="${escapeHtml(l.value)}">${escapeHtml(l.value)}</span>`;
          layersEl.appendChild(div);
        });
      }
    }
    const output = $('smart-output');
    if (output) output.value = r.data.result;
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
    const indent = parseInt($('json-indent')?.value || '2');
    const relaxed = $('json-relaxed')?.checked || false;
    const r = JsonTool.format($('json-input').value, indent, 'none', relaxed);
    setOutput('json-output', r);
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
    setOutput('json-output', JsonTool.minify($('json-input').value, relaxed));
  });
  on('json-sort', 'click', () => {
    const indent = parseInt($('json-indent')?.value || '2');
    const relaxed = $('json-relaxed')?.checked || false;
    const sortMode = $('json-sort-mode')?.value || 'key-asc';
    setOutput('json-output', JsonTool.sort($('json-input').value, sortMode, indent, relaxed));
  });
  on('json-to-yaml', 'click', () => {
    const relaxed = $('json-relaxed')?.checked || false;
    const input = relaxed ? JsonTool._relaxedClean($('json-input').value) : $('json-input').value;
    const yamlIndent = parseInt($('json-to-yaml-indent')?.value || '2');
    const opts = {
      arrayStyle: $('json-to-yaml-array-style')?.value || 'block',
      arraySpacing: $('json-to-yaml-array-spacing')?.value || 'space',
      removeQuotes: $('json-to-yaml-remove-quotes')?.checked || false,
    };
    setOutput('json-output', YamlTool.fromJson(input, yamlIndent, opts));
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
    const indent = parseInt($('yaml-indent')?.value || '2');
    const input = $('yaml-input').value;
    const opts = getYamlOpts();
    setOutput('yaml-output', YamlTool.format(input, indent, opts));
  });
  on('yaml-sort', 'click', () => {
    const indent = parseInt($('yaml-indent')?.value || '2');
    const sortMode = $('yaml-sort-mode')?.value || 'key-asc';
    const opts = getYamlOpts();
    setOutput('yaml-output', YamlTool.sort($('yaml-input').value, sortMode, indent, opts));
  });
  on('yaml-to-json', 'click', () => {
    const indent = parseInt($('yaml-to-json-indent')?.value || '2');
    setOutput('yaml-output', YamlTool.toJson($('yaml-input').value, indent));
  });
  on('yaml-swap', 'click', () => swap('yaml-input', 'yaml-output'));
}

// ============ Query String ============
function initQueryString() {
  on('qs-parse', 'click', () => {
    const r = QueryStringTool.parse($('qs-input').value);
    const wrap = $('qs-table-wrap');
    const table = $('qs-table');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (r.success && r.data.length > 0) {
      if (wrap) wrap.classList.remove('hidden');
      r.data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(p.key)}</td><td>${p.value === null ? `<em style="color:#94a3b8">${t('qs.noValue')}</em>` : escapeHtml(p.value)}</td>`;
        tbody.appendChild(tr);
      });
    } else {
      if (wrap) wrap.classList.add('hidden');
      if (!r.success) {
        const output = $('qs-output');
        if (output) output.value = `${t('error.prefix')}: ${r.error}`;
      }
    }
  });
  on('qs-build', 'click', () => {
    const table = $('qs-table');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const params = Array.from(rows).map(tr => {
      const cells = tr.querySelectorAll('td');
      return { key: cells[0].textContent, value: cells[1].querySelector('em') ? null : cells[1].textContent };
    });
    setOutput('qs-output', QueryStringTool.build(params));
  });
}

// ============ JWT ============
function initJwt() {
  on('jwt-decode', 'click', () => {
    const input = $('jwt-input')?.value || '';
    if (!input.trim()) return;
    const r = JwtTool.decode(input);
    const result = $('jwt-result');
    if (r.success) {
      if (result) result.classList.remove('hidden');
      const headerEl = $('jwt-header');
      if (headerEl) headerEl.textContent = r.data.header;
      const payloadEl = $('jwt-payload');
      if (payloadEl) payloadEl.textContent = r.data.payload;
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
    } else {
      if (result) result.classList.add('hidden');
      showToast(r.error, 5000);
    }
  });
}

// ============ Cron ============
function initCron() {
  on('cron-parse', 'click', () => {
    const input = $('cron-input')?.value || '';
    if (!input.trim()) return;
    const r = CronTool.parse(input);
    const desc = $('cron-desc');
    if (desc) {
      desc.classList.remove('hidden');
      desc.textContent = r.success ? `${r.data.description} (${r.data.format})` : `${t('error.prefix')}: ${r.error}`;
    }
  });
  on('cron-next', 'click', () => {
    const input = $('cron-input')?.value || '';
    if (!input.trim()) return;
    const r = CronTool.nextRuns(input, 10);
    const runs = $('cron-runs');
    if (runs) {
      runs.classList.remove('hidden');
      if (r.success) {
        runs.innerHTML = r.data.map((time, i) => `<div>${i + 1}. ${time}</div>`).join('');
      } else {
        runs.textContent = `${t('error.prefix')}: ${r.error}`;
      }
    }
  });
}

// ============ Timestamp ============
function initTimestamp() {
  on('ts-to-readable', 'click', () => {
    const tz = $('ts-timezone')?.value || 'UTC';
    const input = $('ts-input')?.value || '';
    const r = TimestampTool.toReadable(input, tz);
    const output = $('ts-output');
    if (!output) return;
    if (r.success) {
      output.value = `${r.meta.datetime}\nISO: ${r.meta.iso}\n${t('ts.timezone')}: ${r.meta.timezone}\n${t('ts.unit')}: ${r.meta.unit === 's' ? t('ts.unitSec') : t('ts.unitMs')} ${t('ts.autoDetect')}\n${t('ts.relative')}: ${r.meta.relative}`;
    } else {
      output.value = `${t('error.prefix')}: ${r.error}`;
    }
  });
  on('ts-to-stamp', 'click', () => {
    const input = $('ts-input')?.value || '';
    const r = TimestampTool.fromReadable(input);
    const output = $('ts-output');
    if (!output) return;
    if (r.success) {
      output.value = `${t('ts.seconds')}: ${r.data}\n${t('ts.milliseconds')}: ${parseInt(r.data) * 1000}`;
    } else {
      output.value = `${t('error.prefix')}: ${r.error}`;
    }
  });
  on('ts-now', 'click', () => {
    const r = TimestampTool.now();
    const input = $('ts-input');
    const output = $('ts-output');
    if (input) input.value = String(r.data.seconds);
    if (output) output.value = `${t('ts.seconds')}: ${r.data.seconds}\n${t('ts.milliseconds')}: ${r.data.milliseconds}\nISO: ${r.data.iso}`;
  });
}

// ============ Number Base ============
function initNumberBase() {
  on('nb-convert', 'click', () => {
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
    } else {
      if (result) result.classList.add('hidden');
      showToast(r.error, 5000);
    }
  });
}

// ============ Color ============
function initColor() {
  on('color-convert', 'click', () => {
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
    } else {
      if (result) result.classList.add('hidden');
      showToast(r.error, 5000);
    }
  });
}

// ============ Text ============
function initText() {
  const getInput = () => $('text-input')?.value || '';
  const setResult = (v) => {
    const el = $('text-output');
    if (el) el.value = v;
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
  let mdTimer;
  on('md-input', 'input', () => {
    clearTimeout(mdTimer);
    mdTimer = setTimeout(() => {
      const input = $('md-input')?.value || '';
      const html = MarkdownTool.render(input);
      const preview = $('md-preview');
      if (preview) preview.innerHTML = html;
      const htmlEl = $('md-html');
      if (htmlEl) htmlEl.value = html;
    }, 200);
  });
}

// ============ Hash ============
function initHash() {
  on('hash-compute', 'click', async () => {
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
    }
  });
}

// ============ UUID / Random ============
function initUuid() {
  on('uuid-gen', 'click', () => {
    const upper = $('uuid-upper')?.checked || false;
    const noDash = $('uuid-nodash')?.checked || false;
    const output = $('uuid-output');
    if (output) output.value = UuidTool.generateV4(upper, !noDash);
  });
  on('rand-gen', 'click', () => {
    const len = parseInt($('rand-len')?.value || '16') || 16;
    const charset = $('rand-charset')?.value || 'alphanumeric';
    const noAmb = $('rand-no-ambiguous')?.checked || false;
    const output = $('rand-output');
    if (output) output.value = UuidTool.randomString(len, charset, noAmb);
  });
  on('rand-pwd', 'click', () => {
    const len = parseInt($('rand-len')?.value || '16') || 16;
    const output = $('rand-output');
    if (output) output.value = UuidTool.randomPassword(len);
  });
}

// ============ IP ============
function initIp() {
  on('ip-calc', 'click', () => {
    const input = $('ip-input')?.value?.trim() || '';
    if (!input) return;
    const result = $('ip-result');
    if (!result) return;

    if (input.includes('/')) {
      const r = IpTool.cidr(input);
      result.classList.remove('hidden');
      if (r.success) {
        result.innerHTML = Object.entries(r.data).map(([k, v]) =>
          `<div class="result-row"><span class="result-label">${escapeHtml(k)}</span><span class="result-value">${escapeHtml(String(v))}</span></div>`
        ).join('');
      } else {
        result.textContent = `${t('error.prefix')}: ${r.error}`;
      }
    } else {
      const r = IpTool.ipToInt(input);
      result.classList.remove('hidden');
      if (r.success) {
        const cidr = IpTool.cidr(input + '/32');
        result.innerHTML = `<div class="result-row"><span class="result-label">${t('ip.integer')}</span><span class="result-value">${r.data}</span></div>` +
          (cidr.success ? Object.entries(cidr.data).map(([k, v]) =>
            `<div class="result-row"><span class="result-label">${escapeHtml(k)}</span><span class="result-value">${escapeHtml(String(v))}</span></div>`
          ).join('') : '');
      } else {
        const r2 = IpTool.intToIp(input);
        if (r2.success) {
          result.innerHTML = `<div class="result-row"><span class="result-label">${t('ip.ipAddr')}</span><span class="result-value">${r2.data}</span></div>`;
        } else {
          result.textContent = `${t('error.prefix')}: ${r.error}`;
        }
      }
    }
  });
  on('ip-to-int', 'click', () => {
    const r = IpTool.ipToInt($('ip-input')?.value || '');
    const result = $('ip-result');
    if (result) {
      result.classList.remove('hidden');
      result.textContent = r.success ? `${t('ip.integer')}: ${r.data}` : `${t('error.prefix')}: ${r.error}`;
    }
  });
  on('int-to-ip', 'click', () => {
    const r = IpTool.intToIp($('ip-input')?.value || '');
    const result = $('ip-result');
    if (result) {
      result.classList.remove('hidden');
      result.textContent = r.success ? `${t('ip.ipAddr')}: ${r.data}` : `${t('error.prefix')}: ${r.error}`;
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
        matchesEl.innerHTML = `<div style="margin-bottom:6px;font-weight:600">${t('regex.matches', { count: r.data.count })}</div>` +
          r.data.matches.slice(0, 50).map((m, i) =>
            `<div class="result-row"><span class="result-label">#${i + 1}</span><span class="result-value">"${escapeHtml(m.match)}" @${m.index}${m.groups.length ? ' groups: ' + m.groups.map(g => `"${g}"`).join(', ') : ''}</span></div>`
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
      if (resultEl) resultEl.value = rr.success ? rr.data : '';
    }
  }

  ['regex-pattern', 'regex-flags', 'regex-text', 'regex-replace'].forEach(id => {
    on(id, 'input', () => {
      clearTimeout(regexTimer);
      regexTimer = setTimeout(runRegex, 300);
    });
  });
}
