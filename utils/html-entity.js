// HTML 实体编解码工具
const NAMED_ENTITIES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  '\u00a0': '&nbsp;', '\u00a9': '&copy;', '\u00ae': '&reg;', '\u2122': '&trade;',
  '\u2014': '&mdash;', '\u2013': '&ndash;', '\u2026': '&hellip;', '\u00ab': '&laquo;',
  '\u00bb': '&raquo;', '\u2018': '&lsquo;', '\u2019': '&rsquo;', '\u201c': '&ldquo;',
  '\u201d': '&rdquo;', '\u2022': '&bull;', '\u00b7': '&middot;', '\u00b0': '&deg;',
  '\u00b1': '&plusmn;', '\u00d7': '&times;', '\u00f7': '&divide;', '\u2260': '&ne;',
  '\u2264': '&le;', '\u2265': '&ge;', '\u221e': '&infin;', '\u2190': '&larr;',
  '\u2192': '&rarr;', '\u2191': '&uarr;', '\u2193': '&darr;', '\u2665': '&hearts;',
  '\u2666': '&diams;', '\u2663': '&clubs;', '\u2660': '&spades;'
};

const REVERSE_ENTITIES = {};
for (const [char, entity] of Object.entries(NAMED_ENTITIES)) {
  REVERSE_ENTITIES[entity] = char;
}

export const HtmlEntityTool = {
  encode(str, encodeAll = false) {
    try {
      let result = '';
      for (const char of str) {
        if (NAMED_ENTITIES[char]) {
          result += NAMED_ENTITIES[char];
        } else if (encodeAll && char.codePointAt(0) > 127) {
          result += `&#x${char.codePointAt(0).toString(16)};`;
        } else {
          result += char;
        }
      }
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Encode failed: ${e.message}` };
    }
  },

  decode(str) {
    try {
      // 使用 textarea 安全解码
      let result = str;
      // 先替换命名实体
      result = result.replace(/&[a-zA-Z]+;/g, match => {
        return REVERSE_ENTITIES[match] || match;
      });
      // 替换十六进制数字实体
      result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      // 替换十进制数字实体
      result = result.replace(/&#(\d+);/g, (_, dec) => {
        return String.fromCodePoint(parseInt(dec, 10));
      });
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Decode failed: ${e.message}` };
    }
  }
};
