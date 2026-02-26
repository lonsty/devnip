// Devnip - Service Worker (context menu registration & handling)

import { Base64Tool } from '../utils/base64.js';
import { JsonTool } from '../utils/json-format.js';
import { UrlTool } from '../utils/url-codec.js';
import { HtmlEntityTool } from '../utils/html-entity.js';
import { UnicodeTool } from '../utils/unicode.js';
import { TimestampTool } from '../utils/timestamp.js';
import { HashTool } from '../utils/hash.js';
import { YamlTool } from '../utils/yaml.js';
import { TextTool } from '../utils/text-tools.js';
import { SmartDecodeTool } from '../utils/smart-decode.js';
import { messages } from '../popup/i18n.js';

// Context menu item definitions (id -> i18n key)
const MENU_ITEMS = [
  { id: 'base64-decode', titleKey: 'ctx.base64-decode' },
  { id: 'base64-encode', titleKey: 'ctx.base64-encode' },
  { id: 'sep1', type: 'separator' },
  { id: 'url-decode', titleKey: 'ctx.url-decode' },
  { id: 'url-encode', titleKey: 'ctx.url-encode' },
  { id: 'sep2', type: 'separator' },
  { id: 'html-decode', titleKey: 'ctx.html-decode' },
  { id: 'html-encode', titleKey: 'ctx.html-encode' },
  { id: 'sep3', type: 'separator' },
  { id: 'unicode-decode', titleKey: 'ctx.unicode-decode' },
  { id: 'unicode-encode', titleKey: 'ctx.unicode-encode' },
  { id: 'sep4', type: 'separator' },
  { id: 'json-format', titleKey: 'ctx.json-format' },
  { id: 'yaml-to-json', titleKey: 'ctx.yaml-to-json' },
  { id: 'json-to-yaml', titleKey: 'ctx.json-to-yaml' },
  { id: 'sep5', type: 'separator' },
  { id: 'timestamp', titleKey: 'ctx.timestamp' },
  { id: 'sha256', titleKey: 'ctx.sha256' },
  { id: 'sep6', type: 'separator' },
  { id: 'to-upper', titleKey: 'ctx.to-upper' },
  { id: 'to-lower', titleKey: 'ctx.to-lower' },
  { id: 'to-camel', titleKey: 'ctx.to-camel' },
  { id: 'sep7', type: 'separator' },
  { id: 'smart-decode', titleKey: 'ctx.smart-decode' }
];

// Get locale from chrome.storage, fallback to navigator.language detection
async function getLocale() {
  try {
    const data = await chrome.storage.local.get('devnip-locale');
    if (data['devnip-locale'] && messages[data['devnip-locale']]) {
      return data['devnip-locale'];
    }
  } catch { /* ignore */ }
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return lang.startsWith('zh') ? 'zh' : 'en';
}

// Translate helper for service worker
function swT(locale, key) {
  return messages[locale]?.[key] || messages.en[key] || key;
}

// Build context menus with the correct locale
async function buildMenus() {
  const locale = await getLocale();

  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'devnip',
        title: 'Devnip',
        contexts: ['selection']
      });

      for (const item of MENU_ITEMS) {
        const opts = {
          id: item.id,
          parentId: 'devnip',
          contexts: ['selection']
        };
        if (item.type === 'separator') {
          opts.type = 'separator';
        } else {
          opts.title = swT(locale, item.titleKey);
        }
        chrome.contextMenus.create(opts);
      }
      resolve();
    });
  });
}

// Register context menus on install
chrome.runtime.onInstalled.addListener(() => {
  buildMenus();
});

// Rebuild menus when locale changes in storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes['devnip-locale']) {
    buildMenus();
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText || '';
  if (!text) return;

  const locale = await getLocale();
  let result;
  try {
    switch (info.menuItemId) {
      case 'base64-encode':
        result = Base64Tool.encode(text);
        break;
      case 'base64-decode':
        result = Base64Tool.decode(text);
        break;
      case 'url-encode':
        result = UrlTool.encodeComponent(text);
        break;
      case 'url-decode':
        result = UrlTool.decode(text);
        break;
      case 'html-encode':
        result = HtmlEntityTool.encode(text);
        break;
      case 'html-decode':
        result = HtmlEntityTool.decode(text);
        break;
      case 'unicode-encode':
        result = UnicodeTool.encode(text);
        break;
      case 'unicode-decode':
        result = UnicodeTool.decode(text);
        break;
      case 'json-format':
        result = JsonTool.format(text);
        break;
      case 'yaml-to-json':
        result = YamlTool.toJson(text);
        break;
      case 'json-to-yaml':
        result = YamlTool.fromJson(text);
        break;
      case 'timestamp':
        result = TimestampTool.toReadable(text);
        break;
      case 'sha256':
        result = await HashTool.compute(text, 'SHA-256');
        break;
      case 'to-upper':
        result = { success: true, data: TextTool.toUpperCase(text) };
        break;
      case 'to-lower':
        result = { success: true, data: TextTool.toLowerCase(text) };
        break;
      case 'to-camel':
        result = { success: true, data: TextTool.toCamelCase(text) };
        break;
      case 'smart-decode': {
        const r = SmartDecodeTool.recursiveDecode(text);
        result = { success: true, data: r.data.result };
        break;
      }
      default:
        return;
    }
  } catch (e) {
    result = { success: false, error: e.message };
  }

  if (!result) return;

  const outputText = result.success
    ? (typeof result.data === 'string' ? result.data : JSON.stringify(result.data))
    : '';

  const isSuccess = result.success && outputText;
  const toastTitle = isSuccess
    ? `✓ ${swT(locale, 'ctx.success')}`
    : `✗ ${swT(locale, 'ctx.fail')}`;
  const toastBody = isSuccess
    ? (outputText.length > 60 ? outputText.substring(0, 60) + '...' : outputText)
    : (result.error || swT(locale, 'ctx.emptyResult'));

  // Inject toast + clipboard write into the page
  if (tab?.id) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (textToCopy, title, body, success, duration) => {
          // Copy to clipboard
          if (success && textToCopy) {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
            document.body.appendChild(textarea);
            textarea.select();
            try { document.execCommand('copy'); } catch (e) {
              navigator.clipboard.writeText(textToCopy).catch(() => {});
            }
            document.body.removeChild(textarea);
          }

          // Show toast notification on the page
          const existing = document.getElementById('__devnip_toast__');
          if (existing) existing.remove();

          const toast = document.createElement('div');
          toast.id = '__devnip_toast__';
          toast.style.cssText = [
            'position:fixed',
            'top:20px',
            'right:20px',
            'z-index:2147483647',
            'max-width:360px',
            'padding:12px 18px',
            'border-radius:10px',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif',
            'font-size:13px',
            'line-height:1.5',
            'color:#fff',
            'box-shadow:0 8px 24px rgba(0,0,0,0.2)',
            'opacity:0',
            'transform:translateX(20px)',
            'transition:opacity 0.25s ease,transform 0.25s ease',
            'pointer-events:none',
            success ? 'background:linear-gradient(135deg,#6366f1,#4f46e5)' : 'background:linear-gradient(135deg,#ef4444,#dc2626)',
          ].join(';');

          const titleEl = document.createElement('div');
          titleEl.style.cssText = 'font-weight:700;margin-bottom:2px;font-size:13px';
          titleEl.textContent = title;

          const bodyEl = document.createElement('div');
          bodyEl.style.cssText = 'font-size:12px;opacity:0.9;word-break:break-all;font-family:SFMono-Regular,Menlo,Consolas,monospace';
          bodyEl.textContent = body;

          toast.appendChild(titleEl);
          toast.appendChild(bodyEl);
          document.body.appendChild(toast);

          // Animate in
          requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
          });

          // Auto dismiss
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
          }, duration);
        },
        args: [outputText, toastTitle, toastBody, isSuccess, isSuccess ? 2500 : 5000]
      });
    } catch (e) {
      // Fallback: pages like chrome:// can't be injected, use notification
      console.warn('Devnip: Cannot inject into page', e.message);
      try {
        chrome.notifications.create(`devnip-${Date.now()}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon128.png'),
          title: toastTitle,
          message: toastBody
        });
      } catch (ne) {
        console.warn('Devnip: Notification failed', ne.message);
      }
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSelection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => window.getSelection()?.toString() || ''
        }).then(results => {
          sendResponse({ text: results[0]?.result || '' });
        }).catch(() => {
          sendResponse({ text: '' });
        });
      } else {
        sendResponse({ text: '' });
      }
    });
    return true;
  }
});
