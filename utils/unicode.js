// Unicode 转换工具
export const UnicodeTool = {
  encode(str, encodeAll = false) {
    try {
      let result = '';
      for (const char of str) {
        const cp = char.codePointAt(0);
        if (!encodeAll && cp >= 0x20 && cp <= 0x7e) {
          result += char;
        } else if (cp > 0xFFFF) {
          // Surrogate pair
          const hi = Math.floor((cp - 0x10000) / 0x400) + 0xD800;
          const lo = ((cp - 0x10000) % 0x400) + 0xDC00;
          result += `\\u${hi.toString(16).padStart(4, '0')}\\u${lo.toString(16).padStart(4, '0')}`;
        } else {
          result += `\\u${cp.toString(16).padStart(4, '0')}`;
        }
      }
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Encode failed: ${e.message}` };
    }
  },

  decode(str) {
    try {
      // 处理 \uXXXX 格式
      let result = str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      // 处理 \u{XXXXX} 格式 (ES6)
      result = result.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      // 处理 U+XXXX 格式
      result = result.replace(/U\+([0-9a-fA-F]{4,6})/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      });
      // 处理 %uXXXX 格式
      result = result.replace(/%u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Decode failed: ${e.message}` };
    }
  }
};
