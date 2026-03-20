// Devnip - i18n (Internationalization)

import { LOCALE_KEY } from './constants.js';

const messages = {
  en: {
    // Sidebar groups
    'group.codec': 'Codec',
    'group.format': 'Format',
    'group.parse': 'Parse',
    'group.convert': 'Convert',
    'group.text': 'Text',
    'group.calc': 'Generate',
    'group.network': 'Network',
    'group.regex': 'Regex',

    // Nav items
    'nav.base64': 'Base64',
    'nav.url': 'URL',
    'nav.html-entity': 'HTML Entity',
    'nav.unicode': 'Unicode',
    'nav.smart-decode': 'Smart Decode',
    'nav.json': 'JSON',
    'nav.yaml': 'YAML',
    'nav.querystring': 'Query String',
    'nav.jwt': 'JWT',
    'nav.cron': 'Cron',
    'nav.timestamp': 'Timestamp',
    'nav.number-base': 'Number Base',
    'nav.color': 'Color',
    'nav.text': 'Text',
    'nav.diff': 'Diff',
    'nav.markdown': 'Markdown',
    'nav.hash': 'Hash',
    'nav.uuid': 'UUID',
    'nav.ip': 'IP / CIDR',
    'nav.regex': 'Regex',

    // Common
    'btn.openTab': 'Open in tab',
    'btn.encode': 'Encode',
    'btn.decode': 'Decode',
    'btn.clear': 'Clear',
    'btn.copy': 'Copy',
    'btn.swap': 'Swap input/output',
    'btn.theme': 'Toggle theme',
    'btn.lang': 'Toggle language',
    'label.input': 'Input',
    'label.output': 'Output',
    'label.result': 'Result',
    'toast.copied': 'Copied!',
    'toast.copyFail': 'Copy failed',
    'error.prefix': 'Error',

    // Base64
    'base64.title': 'Base64',
    'base64.urlsafe': 'URL-safe',
    'base64.placeholder.in': 'Paste text to encode or decode…',

    // URL
    'url.title': 'URL Encode / Decode',
    'url.formMode': 'Form mode',
    'url.placeholder': 'Paste URL or encoded string…',
    'url.encodeComp': 'Component',
    'url.encodeURI': 'Full URI',
    'url.recursive': 'Recursive',

    // HTML Entity
    'html.title': 'HTML Entity',
    'html.encodeAll': 'Encode all characters',

    // Unicode
    'unicode.title': 'Unicode',
    'unicode.encodeAll': 'Encode all',

    // Smart Decode
    'smart.title': 'Smart Decode',
    'smart.placeholder': 'Paste encoded text — auto-detects encoding layers…',
    'smart.btn': 'Decode',
    'smart.finalResult': 'Final result',

    // JSON
    'json.title': 'JSON',
    'json.spaces2': '2 spaces',
    'json.spaces4': '4 spaces',
    'json.relaxed': 'Relaxed',
    'json.placeholder': 'Paste JSON…',
    'json.format': 'Format',
    'json.minify': 'Minify',
    'json.sort': 'Sort keys',
    'json.toYaml': 'To YAML',

    // Sort
    'sort.keyAsc': 'Key A→Z',
    'sort.keyDesc': 'Key Z→A',
    'sort.valueAsc': 'Val A→Z',
    'sort.valueDesc': 'Val Z→A',

    // YAML
    'yaml.title': 'YAML',
    'yaml.placeholder': 'Paste YAML…',
    'yaml.toJson': 'To JSON',
    'yaml.format': 'Format',
    'yaml.sort': 'Sort keys',
    'yaml.arrayStyleTip': 'Array style',
    'yaml.arrayBlock': 'Block',
    'yaml.arrayFlow': 'Flow',
    'yaml.arraySpacing': 'Spacing',
    'yaml.spacingSpace': '[ a, b ]',
    'yaml.spacingCompact': '[a,b]',
    'yaml.removeQuotes': 'Unquote',

    // Query String
    'qs.title': 'Query String',
    'qs.inputLabel': 'URL or query string',
    'qs.placeholder': 'key=value&key2=value2 or full URL',
    'qs.parse': 'Parse',
    'qs.build': 'Build',
    'qs.buildResult': 'Build result',
    'qs.thKey': 'Key',
    'qs.thValue': 'Value',
    'qs.noValue': '(empty)',

    // JWT
    'jwt.title': 'JWT',
    'jwt.hint': 'Decode only — signature is not verified.',
    'jwt.inputLabel': 'Token',
    'jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs…',
    'jwt.decode': 'Decode',
    'jwt.expired': 'Expired',
    'jwt.valid': 'Valid',

    // Cron
    'cron.title': 'Cron',
    'cron.inputLabel': 'Expression',
    'cron.placeholder': '*/5 * * * *',
    'cron.parse': 'Describe',
    'cron.next': 'Next 10',
    'cron.description': 'Description',
    'cron.format': 'Format',

    // Timestamp
    'ts.title': 'Timestamp',
    'ts.inputLabel': 'Timestamp',
    'ts.now': 'Now',
    'ts.placeholder': '1700000000 or 2024-01-01 08:00:00',
    'ts.toReadable': 'To readable',
    'ts.toStamp': 'To timestamp',
    'ts.timezone': 'Timezone',
    'ts.unit': 'Unit',
    'ts.unitSec': 'sec',
    'ts.unitMs': 'ms',
    'ts.autoDetect': '(auto)',
    'ts.relative': 'Relative',
    'ts.seconds': 'Seconds',
    'ts.milliseconds': 'Milliseconds',
    'ts.datetime': 'Date/Time',
    'ts.iso': 'ISO 8601',

    // Number Base
    'nb.title': 'Number Base',
    'nb.inputLabel': 'Number (auto-detects 0x / 0b / 0o)',
    'nb.placeholder': '255, 0xFF, 0b11111111',
    'nb.convert': 'Convert',
    'nb.bin': 'Binary',
    'nb.oct': 'Octal',
    'nb.dec': 'Decimal',
    'nb.hex': 'Hex',

    // Color
    'color.title': 'Color',
    'color.inputLabel': 'Color value',
    'color.placeholder': '#FF5733, rgb(255,87,51), hsl(11,100%,60%)',
    'color.convert': 'Convert',

    // Text
    'text.title': 'Text',
    'text.upper': 'UPPER',
    'text.lower': 'lower',
    'text.title_case': 'Title',
    'text.dedup': 'Dedup',
    'text.sortAsc': 'Sort ↑',
    'text.sortDesc': 'Sort ↓',
    'text.shuffle': 'Shuffle',
    'text.trim': 'Trim',
    'text.emptyLines': 'Strip blank',
    'text.lineNo': 'Line #',
    'text.stats': '{chars} chars · {bytes} bytes · {lines} lines · {words} words',

    // Diff
    'diff.title': 'Diff',
    'diff.ignoreWs': 'Ignore whitespace',
    'diff.original': 'Original',
    'diff.modified': 'Modified',
    'diff.compare': 'Compare',
    'diff.stats': '+{added}  −{removed}  ={unchanged}',

    // Markdown
    'md.title': 'Markdown',
    'md.inputLabel': 'Markdown',
    'md.preview': 'Preview',
    'md.copyHtml': 'Copy HTML',
    'md.placeholder': '# Hello Markdown',

    // Hash
    'hash.title': 'Hash',
    'hash.hint': 'UTF-8 encoded input',
    'hash.placeholder': 'Paste text…',
    'hash.compute': 'Compute',
    'hash.upper': 'Uppercase',

    // UUID
    'uuid.title': 'UUID / Random',
    'uuid.gen': 'UUID v4',
    'uuid.upper': 'Uppercase',
    'uuid.noDash': 'No dashes',
    'uuid.label': 'UUID',
    'rand.length': 'Length',
    'rand.alphanumeric': 'Alphanumeric',
    'rand.all': 'All printable',
    'rand.hex': 'Hex',
    'rand.noAmbiguous': 'Skip ambiguous',
    'rand.gen': 'Random',
    'rand.pwd': 'Password',

    // IP
    'ip.title': 'IP / CIDR',
    'ip.inputLabel': 'IP address or CIDR',
    'ip.placeholder': '192.168.1.0/24',
    'ip.calc': 'Calculate',
    'ip.toInt': 'IP → Int',
    'ip.toIp': 'Int → IP',
    'ip.integer': 'Integer',
    'ip.ipAddr': 'IP',
    'ip.network': 'Network',
    'ip.broadcast': 'Broadcast',
    'ip.hostMin': 'Host Min',
    'ip.hostMax': 'Host Max',
    'ip.hostCount': 'Hosts',
    'ip.mask': 'Mask',
    'ip.wildcard': 'Wildcard',
    'ip.binary': 'Binary',
    'ip.hex': 'Hex',
    'ip.addressType': 'Type',

    // Regex
    'regex.title': 'Regex',
    'regex.placeholder': 'Pattern',
    'regex.presets': 'Presets…',
    'regex.testText': 'Test string',
    'regex.replaceTo': 'Replace with',
    'regex.replacePlaceholder': 'Replacement ($1, $2…)',
    'regex.replaceResult': 'Result',
    'regex.matches': '{count} match(es)',
    'regex.noMatch': 'No matches',

    // Regex presets
    'regex.preset.email': 'Email',
    'regex.preset.phone': 'Phone (CN)',
    'regex.preset.ipv4': 'IPv4',
    'regex.preset.url': 'URL',
    'regex.preset.date': 'Date (YYYY-MM-DD)',
    'regex.preset.htmlTag': 'HTML Tag',
    'regex.preset.hexColor': 'Hex Color',
    'regex.preset.chinese': 'Chinese',

    // Context menu
    'ctx.base64-encode': 'Base64 Encode',
    'ctx.base64-decode': 'Base64 Decode',
    'ctx.url-encode': 'URL Encode',
    'ctx.url-decode': 'URL Decode',
    'ctx.html-encode': 'HTML Encode',
    'ctx.html-decode': 'HTML Decode',
    'ctx.unicode-encode': 'Unicode Encode',
    'ctx.unicode-decode': 'Unicode Decode',
    'ctx.json-format': 'Format JSON',
    'ctx.yaml-to-json': 'YAML → JSON',
    'ctx.json-to-yaml': 'JSON → YAML',
    'ctx.timestamp': 'Convert Timestamp',
    'ctx.sha256': 'SHA-256',
    'ctx.to-upper': 'UPPERCASE',
    'ctx.to-lower': 'lowercase',
    'ctx.to-camel': 'camelCase',
    'ctx.smart-decode': 'Smart Decode',
    'ctx.success': 'Copied to clipboard',
    'ctx.fail': 'Failed',
    'ctx.emptyResult': '(empty)',
  },

  zh: {
    // Sidebar groups
    'group.codec': '编解码',
    'group.format': '格式化',
    'group.parse': '解析',
    'group.convert': '转换',
    'group.text': '文本',
    'group.calc': '生成',
    'group.network': '网络',
    'group.regex': '正则',

    // Nav items
    'nav.base64': 'Base64',
    'nav.url': 'URL',
    'nav.html-entity': 'HTML 实体',
    'nav.unicode': 'Unicode',
    'nav.smart-decode': '智能解码',
    'nav.json': 'JSON',
    'nav.yaml': 'YAML',
    'nav.querystring': 'Query String',
    'nav.jwt': 'JWT',
    'nav.cron': 'Cron',
    'nav.timestamp': '时间戳',
    'nav.number-base': '进制',
    'nav.color': '颜色',
    'nav.text': '文本',
    'nav.diff': 'Diff',
    'nav.markdown': 'Markdown',
    'nav.hash': 'Hash',
    'nav.uuid': 'UUID',
    'nav.ip': 'IP / CIDR',
    'nav.regex': '正则',

    // Common
    'btn.openTab': '新标签页打开',
    'btn.encode': '编码',
    'btn.decode': '解码',
    'btn.clear': '清空',
    'btn.copy': '复制',
    'btn.swap': '交换输入输出',
    'btn.theme': '切换主题',
    'btn.lang': '切换语言',
    'label.input': '输入',
    'label.output': '输出',
    'label.result': '结果',
    'toast.copied': '已复制',
    'toast.copyFail': '复制失败',
    'error.prefix': '错误',

    // Base64
    'base64.title': 'Base64',
    'base64.urlsafe': 'URL-safe',
    'base64.placeholder.in': '粘贴待编解码的文本…',

    // URL
    'url.title': 'URL 编解码',
    'url.formMode': '表单模式',
    'url.placeholder': '粘贴 URL 或编码字符串…',
    'url.encodeComp': 'Component',
    'url.encodeURI': 'Full URI',
    'url.recursive': '递归解码',

    // HTML Entity
    'html.title': 'HTML 实体',
    'html.encodeAll': '编码全部字符',

    // Unicode
    'unicode.title': 'Unicode',
    'unicode.encodeAll': '编码全部',

    // Smart Decode
    'smart.title': '智能解码',
    'smart.placeholder': '粘贴编码文本，自动识别编码层级…',
    'smart.btn': '解码',
    'smart.finalResult': '最终结果',

    // JSON
    'json.title': 'JSON',
    'json.spaces2': '2 空格',
    'json.spaces4': '4 空格',
    'json.relaxed': '宽松',
    'json.placeholder': '粘贴 JSON…',
    'json.format': '格式化',
    'json.minify': '压缩',
    'json.sort': '排序',
    'json.toYaml': '转 YAML',

    // Sort
    'sort.keyAsc': 'Key A→Z',
    'sort.keyDesc': 'Key Z→A',
    'sort.valueAsc': 'Val A→Z',
    'sort.valueDesc': 'Val Z→A',

    // YAML
    'yaml.title': 'YAML',
    'yaml.placeholder': '粘贴 YAML…',
    'yaml.toJson': '转 JSON',
    'yaml.format': '格式化',
    'yaml.sort': '排序',
    'yaml.arrayStyleTip': '数组风格',
    'yaml.arrayBlock': '块模式',
    'yaml.arrayFlow': '行内',
    'yaml.arraySpacing': '间距',
    'yaml.spacingSpace': '[ a, b ]',
    'yaml.spacingCompact': '[a,b]',
    'yaml.removeQuotes': '去引号',

    // Query String
    'qs.title': 'Query String',
    'qs.inputLabel': 'URL 或查询字符串',
    'qs.placeholder': 'key=value&key2=value2 或完整 URL',
    'qs.parse': '解析',
    'qs.build': '构建',
    'qs.buildResult': '构建结果',
    'qs.thKey': 'Key',
    'qs.thValue': 'Value',
    'qs.noValue': '(空)',

    // JWT
    'jwt.title': 'JWT',
    'jwt.hint': '仅解码，不验证签名。',
    'jwt.inputLabel': 'Token',
    'jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs…',
    'jwt.decode': '解码',
    'jwt.expired': '已过期',
    'jwt.valid': '有效',

    // Cron
    'cron.title': 'Cron',
    'cron.inputLabel': '表达式',
    'cron.placeholder': '*/5 * * * *',
    'cron.parse': '解释',
    'cron.next': '未来 10 次',
    'cron.description': '描述',
    'cron.format': '格式',

    // Timestamp
    'ts.title': '时间戳',
    'ts.inputLabel': '时间戳',
    'ts.now': '当前',
    'ts.placeholder': '1700000000 或 2024-01-01 08:00:00',
    'ts.toReadable': '转可读',
    'ts.toStamp': '转时间戳',
    'ts.timezone': '时区',
    'ts.unit': '单位',
    'ts.unitSec': '秒',
    'ts.unitMs': '毫秒',
    'ts.autoDetect': '(自动)',
    'ts.relative': '相对',
    'ts.seconds': '秒',
    'ts.milliseconds': '毫秒',
    'ts.datetime': '日期时间',
    'ts.iso': 'ISO 8601',

    // Number Base
    'nb.title': '进制转换',
    'nb.inputLabel': '数值（自动识别 0x / 0b / 0o）',
    'nb.placeholder': '255, 0xFF, 0b11111111',
    'nb.convert': '转换',
    'nb.bin': '二进制',
    'nb.oct': '八进制',
    'nb.dec': '十进制',
    'nb.hex': '十六进制',

    // Color
    'color.title': '颜色',
    'color.inputLabel': '色值',
    'color.placeholder': '#FF5733, rgb(255,87,51), hsl(11,100%,60%)',
    'color.convert': '转换',

    // Text
    'text.title': '文本',
    'text.upper': '大写',
    'text.lower': '小写',
    'text.title_case': 'Title',
    'text.dedup': '去重',
    'text.sortAsc': '排序 ↑',
    'text.sortDesc': '排序 ↓',
    'text.shuffle': '乱序',
    'text.trim': '去空格',
    'text.emptyLines': '去空行',
    'text.lineNo': '行号',
    'text.stats': '{chars} 字符 · {bytes} 字节 · {lines} 行 · {words} 词',

    // Diff
    'diff.title': 'Diff',
    'diff.ignoreWs': '忽略空白',
    'diff.original': '原始',
    'diff.modified': '修改后',
    'diff.compare': '对比',
    'diff.stats': '+{added}  −{removed}  ={unchanged}',

    // Markdown
    'md.title': 'Markdown',
    'md.inputLabel': 'Markdown',
    'md.preview': '预览',
    'md.copyHtml': '复制 HTML',
    'md.placeholder': '# Hello Markdown',

    // Hash
    'hash.title': 'Hash',
    'hash.hint': 'UTF-8 编码输入',
    'hash.placeholder': '粘贴文本…',
    'hash.compute': '计算',
    'hash.upper': '大写',

    // UUID
    'uuid.title': 'UUID / 随机',
    'uuid.gen': 'UUID v4',
    'uuid.upper': '大写',
    'uuid.noDash': '无横杠',
    'uuid.label': 'UUID',
    'rand.length': '长度',
    'rand.alphanumeric': '字母+数字',
    'rand.all': '全部可见字符',
    'rand.hex': '十六进制',
    'rand.noAmbiguous': '排除歧义',
    'rand.gen': '随机',
    'rand.pwd': '密码',

    // IP
    'ip.title': 'IP / CIDR',
    'ip.inputLabel': 'IP 或 CIDR',
    'ip.placeholder': '192.168.1.0/24',
    'ip.calc': '计算',
    'ip.toInt': 'IP → 整数',
    'ip.toIp': '整数 → IP',
    'ip.integer': '整数',
    'ip.ipAddr': 'IP',
    'ip.network': '网络地址',
    'ip.broadcast': '广播地址',
    'ip.hostMin': '最小主机',
    'ip.hostMax': '最大主机',
    'ip.hostCount': '主机数',
    'ip.mask': '掩码',
    'ip.wildcard': '通配符',
    'ip.binary': '二进制',
    'ip.hex': '十六进制',
    'ip.addressType': '类型',

    // Regex
    'regex.title': '正则',
    'regex.placeholder': '表达式',
    'regex.presets': '预设…',
    'regex.testText': '测试文本',
    'regex.replaceTo': '替换为',
    'regex.replacePlaceholder': '替换内容（$1, $2…）',
    'regex.replaceResult': '替换结果',
    'regex.matches': '{count} 个匹配',
    'regex.noMatch': '无匹配',

    // Regex presets
    'regex.preset.email': '邮箱',
    'regex.preset.phone': '手机号',
    'regex.preset.ipv4': 'IPv4',
    'regex.preset.url': 'URL',
    'regex.preset.date': '日期',
    'regex.preset.htmlTag': 'HTML 标签',
    'regex.preset.hexColor': '十六进制颜色',
    'regex.preset.chinese': '中文',

    // Context menu
    'ctx.base64-encode': 'Base64 编码',
    'ctx.base64-decode': 'Base64 解码',
    'ctx.url-encode': 'URL 编码',
    'ctx.url-decode': 'URL 解码',
    'ctx.html-encode': 'HTML 编码',
    'ctx.html-decode': 'HTML 解码',
    'ctx.unicode-encode': 'Unicode 编码',
    'ctx.unicode-decode': 'Unicode 解码',
    'ctx.json-format': '格式化 JSON',
    'ctx.yaml-to-json': 'YAML → JSON',
    'ctx.json-to-yaml': 'JSON → YAML',
    'ctx.timestamp': '时间戳转换',
    'ctx.sha256': 'SHA-256',
    'ctx.to-upper': '转大写',
    'ctx.to-lower': '转小写',
    'ctx.to-camel': '转驼峰',
    'ctx.smart-decode': '智能解码',
    'ctx.success': '已复制到剪贴板',
    'ctx.fail': '失败',
    'ctx.emptyResult': '(空)',
  }
};

// Export messages for use in service worker
export { messages };

// Detect locale: default to English, auto-switch to Chinese if system language is zh
function detectLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved && messages[saved]) return saved;
  } catch { /* localStorage unavailable */ }
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return lang.startsWith('zh') ? 'zh' : 'en';
}

let currentLocale = detectLocale();

export function t(key, params) {
  const msg = messages[currentLocale]?.[key] || messages.en[key] || key;
  if (!params) return msg;
  return msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? _);
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale) {
  if (!messages[locale]) return;
  currentLocale = locale;
  try { localStorage.setItem(LOCALE_KEY, locale); } catch { /* ignore */ }
  // Sync to chrome.storage for service worker access
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [LOCALE_KEY]: locale });
    }
  } catch { /* ignore */ }
}

export function toggleLocale() {
  const next = currentLocale === 'en' ? 'zh' : 'en';
  setLocale(next);
  return next;
}
