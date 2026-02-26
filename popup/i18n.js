// Devnip - i18n (Internationalization)

const messages = {
  en: {
    // Sidebar groups
    'group.codec': 'Codec',
    'group.format': 'Format',
    'group.parse': 'Parse',
    'group.convert': 'Convert',
    'group.text': 'Text',
    'group.calc': 'Calc / Gen',
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
    'nav.text': 'Text Tools',
    'nav.diff': 'Diff',
    'nav.markdown': 'Markdown',
    'nav.hash': 'Hash',
    'nav.uuid': 'UUID / Random',
    'nav.ip': 'IP / CIDR',
    'nav.regex': 'Regex Tester',

    // Common
    'btn.openTab': 'Open in New Tab',
    'btn.encode': 'Encode',
    'btn.decode': 'Decode',
    'btn.clear': 'Clear',
    'btn.copy': 'Copy',
    'btn.swap': 'Swap',
    'btn.theme': 'Toggle theme',
    'btn.lang': 'Toggle language',
    'label.input': 'INPUT',
    'label.output': 'OUTPUT',
    'label.result': 'RESULT',
    'toast.copied': 'Copied',
    'toast.copyFail': 'Copy failed',
    'error.prefix': 'Error',

    // Base64
    'base64.title': 'Base64 Codec',
    'base64.urlsafe': 'URL-safe',
    'base64.placeholder.in': 'Paste or enter text...',

    // URL
    'url.title': 'URL Codec',
    'url.formMode': 'Form mode (+ → space)',
    'url.placeholder': 'Paste or enter URL...',
    'url.encodeComp': 'Encode Component',
    'url.encodeURI': 'Encode URI',
    'url.recursive': 'Recursive',

    // HTML Entity
    'html.title': 'HTML Entity Codec',
    'html.encodeAll': 'Encode all (incl. non-ASCII)',

    // Unicode
    'unicode.title': 'Unicode Converter',
    'unicode.encodeAll': 'Encode all',

    // Smart Decode
    'smart.title': 'Smart Decode',
    'smart.placeholder': 'Paste encoded text, auto-detect and decode layer by layer...',
    'smart.btn': 'Smart Decode',
    'smart.finalResult': 'FINAL RESULT',

    // JSON
    'json.title': 'JSON Formatter',
    'json.spaces2': '2 spaces',
    'json.spaces4': '4 spaces',
    'json.relaxed': 'Relaxed',
    'json.placeholder': 'Paste JSON...',
    'json.format': 'Format',
    'json.minify': 'Minify',
    'json.sort': 'Sort',
    'json.toYaml': 'JSON → YAML',

    // Sort
    'sort.keyAsc': 'Key ↑',
    'sort.keyDesc': 'Key ↓',
    'sort.valueAsc': 'Value ↑',
    'sort.valueDesc': 'Value ↓',

    // YAML
    'yaml.title': 'YAML Formatter',
    'yaml.placeholder': 'Paste YAML or JSON...',
    'yaml.toJson': 'YAML → JSON',
    'yaml.format': 'Format',
    'yaml.sort': 'Sort',
    'yaml.arrayStyleTip': 'Array style',
    'yaml.arrayBlock': '- block',
    'yaml.arrayFlow': '[] flow',
    'yaml.arraySpacing': 'Spacing',
    'yaml.spacingSpace': '[ a, b ]',
    'yaml.spacingCompact': '[a, b]',
    'yaml.removeQuotes': 'Remove quotes',

    // Query String
    'qs.title': 'Query String Parser',
    'qs.inputLabel': 'INPUT URL OR QUERY STRING',
    'qs.placeholder': 'key=value&key2=value2 or full URL',
    'qs.parse': 'Parse',
    'qs.build': 'Rebuild',
    'qs.buildResult': 'BUILD RESULT',
    'qs.thKey': 'Key',
    'qs.thValue': 'Value',
    'qs.noValue': '(no value)',

    // JWT
    'jwt.title': 'JWT Decoder',
    'jwt.hint': '⚠ Decode only, signature not verified. Do not paste production tokens in untrusted environments.',
    'jwt.inputLabel': 'JWT TOKEN',
    'jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs...',
    'jwt.decode': 'Decode',
    'jwt.expired': '⚠ Token expired',
    'jwt.valid': '✓ Token valid',

    // Cron
    'cron.title': 'Cron Expression Parser',
    'cron.inputLabel': 'CRON EXPRESSION',
    'cron.placeholder': '*/5 * * * * or 0 30 8 * * *',
    'cron.parse': 'Parse',
    'cron.next': 'Next 10 runs',

    // Timestamp
    'ts.title': 'Timestamp Converter',
    'ts.inputLabel': 'TIMESTAMP',
    'ts.now': 'Now',
    'ts.placeholder': '1700000000 or 2024-01-01 08:00:00',
    'ts.toReadable': 'Timestamp → Readable',
    'ts.toStamp': 'Readable → Timestamp',
    'ts.timezone': 'TZ',
    'ts.unit': 'Unit',
    'ts.unitSec': 'seconds',
    'ts.unitMs': 'milliseconds',
    'ts.autoDetect': '(auto-detect)',
    'ts.relative': 'Relative',
    'ts.seconds': 'Sec',
    'ts.milliseconds': 'Ms',

    // Number Base
    'nb.title': 'Number Base Converter',
    'nb.inputLabel': 'INPUT NUMBER (auto-detect 0x/0b/0o prefix)',
    'nb.placeholder': '255 or 0xFF or 0b11111111',
    'nb.convert': 'Convert',

    // Color
    'color.title': 'Color Converter',
    'color.inputLabel': 'INPUT COLOR VALUE',
    'color.placeholder': '#FF5733 or rgb(255,87,51) or hsl(11,100%,60%)',
    'color.convert': 'Convert',

    // Text
    'text.title': 'Text Tools',
    'text.upper': 'UPPER',
    'text.lower': 'lower',
    'text.title_case': 'Title',
    'text.dedup': 'Dedup',
    'text.sortAsc': '↑ Sort',
    'text.sortDesc': '↓ Sort',
    'text.shuffle': 'Shuffle',
    'text.trim': 'Trim',
    'text.emptyLines': 'Empty Ln',
    'text.lineNo': 'Line #',
    'text.stats': 'Chars: {chars} | Bytes: {bytes} | Lines: {lines} | Words: {words}',

    // Diff
    'diff.title': 'Text Diff',
    'diff.ignoreWs': 'Ignore whitespace',
    'diff.original': 'ORIGINAL TEXT',
    'diff.modified': 'MODIFIED TEXT',
    'diff.compare': 'Compare',
    'diff.stats': 'Added: {added} | Removed: {removed} | Unchanged: {unchanged}',

    // Markdown
    'md.title': 'Markdown Preview',
    'md.inputLabel': 'MARKDOWN',
    'md.preview': 'PREVIEW',
    'md.copyHtml': 'Copy HTML',
    'md.placeholder': '# Hello Markdown',

    // Hash
    'hash.title': 'Hash Calculator',
    'hash.hint': 'Computed using UTF-8 encoding',
    'hash.placeholder': 'Paste or enter text...',
    'hash.compute': 'Compute',
    'hash.upper': 'Uppercase',

    // UUID
    'uuid.title': 'UUID / Random String',
    'uuid.gen': 'Generate UUID v4',
    'uuid.upper': 'Uppercase',
    'uuid.noDash': 'No dashes',
    'uuid.label': 'UUID',
    'rand.length': 'Length',
    'rand.alphanumeric': 'Alphanumeric',
    'rand.all': 'Alphanumeric + Special',
    'rand.hex': 'Hex',
    'rand.noAmbiguous': 'No ambiguous chars',
    'rand.gen': 'Random String',
    'rand.pwd': 'Strong Password',

    // IP
    'ip.title': 'IP / CIDR Calculator',
    'ip.inputLabel': 'INPUT IP OR CIDR',
    'ip.placeholder': '192.168.1.0/24 or 192.168.1.1',
    'ip.calc': 'Calculate',
    'ip.toInt': 'IP → Integer',
    'ip.toIp': 'Integer → IP',
    'ip.integer': 'Integer',
    'ip.ipAddr': 'IP',

    // Regex
    'regex.title': 'Regex Tester',
    'regex.placeholder': 'Regular expression',
    'regex.presets': 'Common regex templates...',
    'regex.testText': 'TEST TEXT',
    'regex.replaceTo': 'REPLACE WITH',
    'regex.replacePlaceholder': 'Replacement string (use $1, $2...)',
    'regex.replaceResult': 'REPLACE RESULT',
    'regex.matches': '{count} matches',
    'regex.noMatch': 'No matches',

    // Regex presets
    'regex.preset.email': 'Email',
    'regex.preset.phone': 'Phone (CN)',
    'regex.preset.ipv4': 'IPv4 Address',
    'regex.preset.url': 'URL',
    'regex.preset.date': 'Date (YYYY-MM-DD)',
    'regex.preset.htmlTag': 'HTML Tag',
    'regex.preset.hexColor': 'Hex Color',
    'regex.preset.chinese': 'Chinese Chars',

    // Context menu
    'ctx.base64-encode': 'Base64 Encode',
    'ctx.base64-decode': 'Base64 Decode',
    'ctx.url-encode': 'URL Encode',
    'ctx.url-decode': 'URL Decode',
    'ctx.html-encode': 'HTML Entity Encode',
    'ctx.html-decode': 'HTML Entity Decode',
    'ctx.unicode-encode': 'Unicode Encode',
    'ctx.unicode-decode': 'Unicode Decode',
    'ctx.json-format': 'JSON Format',
    'ctx.yaml-to-json': 'YAML → JSON',
    'ctx.json-to-yaml': 'JSON → YAML',
    'ctx.timestamp': 'Timestamp Convert',
    'ctx.sha256': 'SHA-256 Hash',
    'ctx.to-upper': 'To UPPER CASE',
    'ctx.to-lower': 'To lower case',
    'ctx.to-camel': 'To camelCase',
    'ctx.smart-decode': 'Smart Decode',
    'ctx.success': 'Copied to clipboard',
    'ctx.fail': 'Operation failed',
    'ctx.emptyResult': '(empty result)',
  },

  zh: {
    // Sidebar groups
    'group.codec': '编解码',
    'group.format': '格式化',
    'group.parse': '解析',
    'group.convert': '转换',
    'group.text': '文本',
    'group.calc': '计算 / 生成',
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
    'nav.color': '色值',
    'nav.text': '文本处理',
    'nav.diff': 'Diff 对比',
    'nav.markdown': 'Markdown',
    'nav.hash': 'Hash',
    'nav.uuid': 'UUID / 随机',
    'nav.ip': 'IP / CIDR',
    'nav.regex': '正则测试',

    // Common
    'btn.openTab': '新标签页打开',
    'btn.encode': '编码',
    'btn.decode': '解码',
    'btn.clear': '清空',
    'btn.copy': '复制',
    'btn.swap': '交换',
    'btn.theme': '切换主题',
    'btn.lang': '切换语言',
    'label.input': '输入',
    'label.output': '输出',
    'label.result': '结果',
    'toast.copied': '已复制',
    'toast.copyFail': '复制失败',
    'error.prefix': '错误',

    // Base64
    'base64.title': 'Base64 编解码',
    'base64.urlsafe': 'URL-safe',
    'base64.placeholder.in': '粘贴或输入文本...',

    // URL
    'url.title': 'URL 编解码',
    'url.formMode': '表单模式（+→空格）',
    'url.placeholder': '粘贴或输入 URL...',
    'url.encodeComp': 'Encode Component',
    'url.encodeURI': 'Encode URI',
    'url.recursive': '递归解码',

    // HTML Entity
    'html.title': 'HTML 实体编解码',
    'html.encodeAll': '全部编码（含非 ASCII）',

    // Unicode
    'unicode.title': 'Unicode 转换',
    'unicode.encodeAll': '全部编码',

    // Smart Decode
    'smart.title': '智能解码',
    'smart.placeholder': '粘贴编码文本，自动识别并逐层解码...',
    'smart.btn': '智能解码',
    'smart.finalResult': '最终结果',

    // JSON
    'json.title': 'JSON 格式化',
    'json.spaces2': '2 空格',
    'json.spaces4': '4 空格',
    'json.relaxed': '宽松模式',
    'json.placeholder': '粘贴 JSON...',
    'json.format': '格式化',
    'json.minify': '压缩',
    'json.sort': '排序',
    'json.toYaml': 'JSON → YAML',

    // Sort
    'sort.keyAsc': 'Key ↑',
    'sort.keyDesc': 'Key ↓',
    'sort.valueAsc': 'Value ↑',
    'sort.valueDesc': 'Value ↓',

    // YAML
    'yaml.title': 'YAML 格式化',
    'yaml.placeholder': '粘贴 YAML 或 JSON...',
    'yaml.toJson': 'YAML → JSON',
    'yaml.format': '格式化',
    'yaml.sort': '排序',
    'yaml.arrayStyleTip': '数组风格',
    'yaml.arrayBlock': '- 块模式',
    'yaml.arrayFlow': '[] 行内',
    'yaml.arraySpacing': '间距',
    'yaml.spacingSpace': '[ a, b ]',
    'yaml.spacingCompact': '[a, b]',
    'yaml.removeQuotes': '去引号',

    // Query String
    'qs.title': 'Query String 解析',
    'qs.inputLabel': '输入 URL 或 Query String',
    'qs.placeholder': 'key=value&key2=value2 或完整 URL',
    'qs.parse': '解析',
    'qs.build': '重新构建',
    'qs.buildResult': '构建结果',
    'qs.thKey': 'Key',
    'qs.thValue': 'Value',
    'qs.noValue': '(无值)',

    // JWT
    'jwt.title': 'JWT 解析',
    'jwt.hint': '⚠ 仅解码，未验证签名。请勿在不可信环境粘贴生产 Token。',
    'jwt.inputLabel': 'JWT TOKEN',
    'jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs...',
    'jwt.decode': '解析',
    'jwt.expired': '⚠ Token 已过期',
    'jwt.valid': '✓ Token 有效',

    // Cron
    'cron.title': 'Cron 表达式解析',
    'cron.inputLabel': 'CRON 表达式',
    'cron.placeholder': '*/5 * * * * 或 0 30 8 * * *',
    'cron.parse': '解析',
    'cron.next': '未来 10 次',

    // Timestamp
    'ts.title': '时间戳转换',
    'ts.inputLabel': '时间戳',
    'ts.now': '当前时间',
    'ts.placeholder': '1700000000 或 2024-01-01 08:00:00',
    'ts.toReadable': '时间戳 → 可读',
    'ts.toStamp': '可读 → 时间戳',
    'ts.timezone': '时区',
    'ts.unit': '单位',
    'ts.unitSec': '秒',
    'ts.unitMs': '毫秒',
    'ts.autoDetect': '（自动识别）',
    'ts.relative': '相对',
    'ts.seconds': '秒',
    'ts.milliseconds': '毫秒',

    // Number Base
    'nb.title': '进制转换',
    'nb.inputLabel': '输入数值（自动识别 0x/0b/0o 前缀）',
    'nb.placeholder': '255 或 0xFF 或 0b11111111',
    'nb.convert': '转换',

    // Color
    'color.title': '色值转换',
    'color.inputLabel': '输入色值',
    'color.placeholder': '#FF5733 或 rgb(255,87,51) 或 hsl(11,100%,60%)',
    'color.convert': '转换',

    // Text
    'text.title': '文本处理',
    'text.upper': '大写',
    'text.lower': '小写',
    'text.title_case': 'Title',
    'text.dedup': '去重',
    'text.sortAsc': '↑ 排序',
    'text.sortDesc': '↓ 排序',
    'text.shuffle': '打乱',
    'text.trim': '去空格',
    'text.emptyLines': '去空行',
    'text.lineNo': '行号',
    'text.stats': '字符: {chars} | 字节: {bytes} | 行: {lines} | 词: {words}',

    // Diff
    'diff.title': '文本 Diff 对比',
    'diff.ignoreWs': '忽略空白',
    'diff.original': '原始文本',
    'diff.modified': '修改后',
    'diff.compare': '对比',
    'diff.stats': '新增: {added} | 删除: {removed} | 未变: {unchanged}',

    // Markdown
    'md.title': 'Markdown 预览',
    'md.inputLabel': 'MARKDOWN',
    'md.preview': '预览',
    'md.copyHtml': '复制 HTML',
    'md.placeholder': '# Hello Markdown',

    // Hash
    'hash.title': 'Hash 计算',
    'hash.hint': '以 UTF-8 编码计算',
    'hash.placeholder': '粘贴或输入文本...',
    'hash.compute': '计算',
    'hash.upper': '大写',

    // UUID
    'uuid.title': 'UUID / 随机字符串',
    'uuid.gen': '生成 UUID v4',
    'uuid.upper': '大写',
    'uuid.noDash': '无横杠',
    'uuid.label': 'UUID',
    'rand.length': '长度',
    'rand.alphanumeric': '字母+数字',
    'rand.all': '字母+数字+特殊',
    'rand.hex': '十六进制',
    'rand.noAmbiguous': '排除歧义字符',
    'rand.gen': '随机字符串',
    'rand.pwd': '强密码',

    // IP
    'ip.title': 'IP / CIDR 计算',
    'ip.inputLabel': '输入 IP 或 CIDR',
    'ip.placeholder': '192.168.1.0/24 或 192.168.1.1',
    'ip.calc': '计算',
    'ip.toInt': 'IP → 整数',
    'ip.toIp': '整数 → IP',
    'ip.integer': '整数',
    'ip.ipAddr': 'IP',

    // Regex
    'regex.title': '正则表达式测试',
    'regex.placeholder': '正则表达式',
    'regex.presets': '常用正则模板...',
    'regex.testText': '测试文本',
    'regex.replaceTo': '替换为',
    'regex.replacePlaceholder': '替换字符串（可用 $1, $2...）',
    'regex.replaceResult': '替换结果',
    'regex.matches': '{count} 个匹配',
    'regex.noMatch': '无匹配',

    // Regex presets
    'regex.preset.email': '邮箱',
    'regex.preset.phone': '手机号（中国）',
    'regex.preset.ipv4': 'IPv4 地址',
    'regex.preset.url': 'URL',
    'regex.preset.date': '日期 (YYYY-MM-DD)',
    'regex.preset.htmlTag': 'HTML 标签',
    'regex.preset.hexColor': '十六进制颜色',
    'regex.preset.chinese': '中文字符',

    // Context menu
    'ctx.base64-encode': 'Base64 编码',
    'ctx.base64-decode': 'Base64 解码',
    'ctx.url-encode': 'URL 编码',
    'ctx.url-decode': 'URL 解码',
    'ctx.html-encode': 'HTML 实体编码',
    'ctx.html-decode': 'HTML 实体解码',
    'ctx.unicode-encode': 'Unicode 编码',
    'ctx.unicode-decode': 'Unicode 解码',
    'ctx.json-format': 'JSON 格式化',
    'ctx.yaml-to-json': 'YAML → JSON',
    'ctx.json-to-yaml': 'JSON → YAML',
    'ctx.timestamp': '时间戳转换',
    'ctx.sha256': '计算 SHA-256',
    'ctx.to-upper': '转大写',
    'ctx.to-lower': '转小写',
    'ctx.to-camel': '转驼峰',
    'ctx.smart-decode': '智能解码',
    'ctx.success': '已复制到剪贴板',
    'ctx.fail': '操作失败',
    'ctx.emptyResult': '（空结果）',
  }
};

// Export messages for use in service worker
export { messages };

// Detect locale: default to English, auto-switch to Chinese if system language is zh
function detectLocale() {
  try {
    const saved = localStorage.getItem('devnip-locale');
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
  try { localStorage.setItem('devnip-locale', locale); } catch { /* ignore */ }
  // Sync to chrome.storage for service worker access
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ 'devnip-locale': locale });
    }
  } catch { /* ignore */ }
}

export function toggleLocale() {
  const next = currentLocale === 'en' ? 'zh' : 'en';
  setLocale(next);
  return next;
}
