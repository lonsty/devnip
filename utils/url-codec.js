// URL 编解码工具
export const UrlTool = {
  encodeComponent(str) {
    try {
      return { success: true, data: encodeURIComponent(str) };
    } catch (e) {
      return { success: false, error: `Encode failed: ${e.message}` };
    }
  },

  encodeURI(str) {
    try {
      return { success: true, data: encodeURI(str) };
    } catch (e) {
      return { success: false, error: `Encode failed: ${e.message}` };
    }
  },

  decode(str, formMode = false) {
    try {
      let input = str;
      if (formMode) {
        input = input.replace(/\+/g, ' ');
      }
      return { success: true, data: decodeURIComponent(input) };
    } catch (e) {
      const badMatch = str.match(/%(?![0-9A-Fa-f]{2})/);
      const hint = badMatch
        ? `Invalid % sequence at position ${badMatch.index}: "${str.substring(badMatch.index, badMatch.index + 3)}"`
        : '';
      return { success: false, error: `Decode failed: ${e.message}${hint ? '. ' + hint : ''}` };
    }
  },

  recursiveDecode(str, formMode = false) {
    const layers = [{ type: 'Original input', value: str }];
    let current = str;
    let maxDepth = 10;
    while (maxDepth-- > 0) {
      const result = this.decode(current, formMode);
      if (!result.success || result.data === current) break;
      current = result.data;
      layers.push({ type: 'URL decode', value: current });
    }
    return { success: true, data: current, layers };
  },

  parseURL(str) {
    try {
      const url = new URL(str);
      return {
        success: true,
        data: {
          protocol: url.protocol,
          host: url.hostname,
          port: url.port || '(default)',
          path: url.pathname,
          query: url.search,
          fragment: url.hash
        }
      };
    } catch {
      return { success: false, error: 'Invalid URL' };
    }
  }
};
