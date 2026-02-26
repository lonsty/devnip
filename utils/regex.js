// 正则表达式测试工具
export const RegexTool = {
  test(pattern, flags, text) {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let m;

      if (flags.includes('g')) {
        while ((m = regex.exec(text)) !== null) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
            namedGroups: m.groups || {}
          });
          if (m[0].length === 0) regex.lastIndex++;
        }
      } else {
        m = regex.exec(text);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
            namedGroups: m.groups || {}
          });
        }
      }

      return { success: true, data: { matches, count: matches.length } };
    } catch (e) {
      return { success: false, error: `Regex error: ${e.message}` };
    }
  },

  replace(pattern, flags, text, replacement) {
    try {
      const regex = new RegExp(pattern, flags);
      return { success: true, data: text.replace(regex, replacement) };
    } catch (e) {
      return { success: false, error: `Replace error: ${e.message}` };
    }
  },

  highlight(pattern, flags, text) {
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // 在转义后的文本上做高亮不太准确，直接用原文操作
      const parts = [];
      let lastIndex = 0;
      let m;
      const regexClone = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      while ((m = regexClone.exec(text)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ type: 'text', value: text.substring(lastIndex, m.index) });
        }
        parts.push({ type: 'match', value: m[0], groups: m.slice(1) });
        lastIndex = m.index + m[0].length;
        if (m[0].length === 0) regexClone.lastIndex++;
      }
      if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.substring(lastIndex) });
      }
      return { success: true, data: parts };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  COMMON_PATTERNS: [
    { nameKey: 'regex.preset.email', name: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g' },
    { nameKey: 'regex.preset.phone', name: 'Phone (CN)', pattern: '1[3-9]\\d{9}', flags: 'g' },
    { nameKey: 'regex.preset.ipv4', name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { nameKey: 'regex.preset.url', name: 'URL', pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
    { nameKey: 'regex.preset.date', name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
    { nameKey: 'regex.preset.htmlTag', name: 'HTML Tag', pattern: '<[^>]+>', flags: 'g' },
    { nameKey: 'regex.preset.hexColor', name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
    { nameKey: 'regex.preset.chinese', name: 'Chinese Chars', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' }
  ]
};
