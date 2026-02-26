// 文本处理工具集
const TITLE_CASE_EXCEPTIONS = new Set([
  'a','an','the','and','but','or','nor','for','yet','so',
  'in','on','at','to','by','of','up','as','if','is'
]);

export const TextTool = {
  toUpperCase(str) { return str.toLocaleUpperCase(); },
  toLowerCase(str) { return str.toLocaleLowerCase(); },

  toTitleCase(str) {
    return str.replace(/\w\S*/g, (word, idx) => {
      if (idx > 0 && TITLE_CASE_EXCEPTIONS.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  },

  toCamelCase(str) {
    const words = this._splitWords(str);
    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  },

  toPascalCase(str) {
    const words = this._splitWords(str);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  },

  toSnakeCase(str) {
    return this._splitWords(str).map(w => w.toLowerCase()).join('_');
  },

  toKebabCase(str) {
    return this._splitWords(str).map(w => w.toLowerCase()).join('-');
  },

  _splitWords(str) {
    // 按空格、下划线、短横线、大小写边界拆分
    return str
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .split(/[\s_\-]+/)
      .filter(w => w.length > 0);
  },

  removeDuplicateLines(str, caseSensitive = true) {
    const lines = str.split('\n');
    const seen = new Set();
    const result = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }
    return result.join('\n');
  },

  sortLines(str, mode = 'asc') {
    const lines = str.split('\n');
    if (mode === 'shuffle') {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
      return lines.join('\n');
    }
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    lines.sort(collator.compare);
    if (mode === 'desc') lines.reverse();
    return lines.join('\n');
  },

  stats(str) {
    const chars = [...str].length;
    const bytes = new TextEncoder().encode(str).length;
    const lines = str ? str.split('\n').length : 0;
    const words = str.trim() ? str.trim().split(/\s+/).length : 0;
    return { chars, bytes, lines, words };
  },

  removeEmptyLines(str) {
    return str.split('\n').filter(l => l.trim() !== '').join('\n');
  },

  trimLines(str) {
    return str.split('\n').map(l => l.trim()).join('\n');
  },

  addLineNumbers(str, start = 1, sep = ': ') {
    const lines = str.split('\n');
    const maxDigits = String(start + lines.length - 1).length;
    return lines.map((line, i) =>
      String(start + i).padStart(maxDigits, ' ') + sep + line
    ).join('\n');
  }
};
