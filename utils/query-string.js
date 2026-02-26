// Query String 解析 / 构建工具
export const QueryStringTool = {
  parse(input) {
    try {
      let qs = input.trim();
      // 如果是完整 URL，提取 query 部分
      if (qs.includes('?')) {
        const qIndex = qs.indexOf('?');
        const hashIndex = qs.indexOf('#', qIndex);
        qs = hashIndex > -1 ? qs.substring(qIndex + 1, hashIndex) : qs.substring(qIndex + 1);
      } else if (qs.startsWith('#')) {
        return { success: false, error: 'Input contains only fragment, no query string' };
      }
      if (!qs) return { success: true, data: [] };

      // 兼容 & 和 ; 分隔符
      const pairs = qs.split(/[&;]/);
      const params = [];
      for (const pair of pairs) {
        if (!pair) continue;
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) {
          params.push({
            key: decodeURIComponent(pair),
            value: null,
            rawKey: pair,
            rawValue: null
          });
        } else {
          const rawKey = pair.substring(0, eqIndex);
          const rawValue = pair.substring(eqIndex + 1);
          params.push({
            key: decodeURIComponent(rawKey),
            value: decodeURIComponent(rawValue),
            rawKey,
            rawValue
          });
        }
      }
      return { success: true, data: params };
    } catch (e) {
      return { success: false, error: `Parse failed: ${e.message}` };
    }
  },

  build(params) {
    try {
      const parts = params
        .filter(p => p.key)
        .map(p => {
          if (p.value === null || p.value === undefined) {
            return encodeURIComponent(p.key);
          }
          return `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`;
        });
      return { success: true, data: parts.join('&') };
    } catch (e) {
      return { success: false, error: `Build failed: ${e.message}` };
    }
  }
};
