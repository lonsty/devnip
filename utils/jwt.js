// JWT 解析工具
export const JwtTool = {
  decode(token) {
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'Invalid JWT format: expected 3 dot-separated segments' };
      }

      const header = this._decodeBase64URL(parts[0]);
      const payload = this._decodeBase64URL(parts[1]);
      const signature = parts[2];

      let headerObj, payloadObj;
      try { headerObj = JSON.parse(header); } catch { return { success: false, error: 'Header is not valid JSON' }; }
      try { payloadObj = JSON.parse(payload); } catch { return { success: false, error: 'Payload is not valid JSON' }; }

      // 检查过期
      let expInfo = null;
      if (payloadObj.exp) {
        const expMs = payloadObj.exp * 1000;
        const now = Date.now();
        const diff = expMs - now;
        expInfo = {
          expired: diff < 0,
          expDate: new Date(expMs).toISOString(),
          relative: this._relativeTime(diff)
        };
      }

      // 时间字段友好展示
      const timeFields = {};
      for (const key of ['exp', 'nbf', 'iat']) {
        if (payloadObj[key]) {
          timeFields[key] = {
            raw: payloadObj[key],
            readable: new Date(payloadObj[key] * 1000).toISOString()
          };
        }
      }

      return {
        success: true,
        data: {
          header: JSON.stringify(headerObj, null, 2),
          payload: JSON.stringify(payloadObj, null, 2),
          signature,
          headerObj,
          payloadObj,
          expInfo,
          timeFields
        }
      };
    } catch (e) {
      return { success: false, error: `JWT decode failed: ${e.message}` };
    }
  },

  _decodeBase64URL(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(
      atob(s).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
  },

  _relativeTime(diffMs) {
    const abs = Math.abs(diffMs);
    const suffix = diffMs < 0 ? ' ago' : ' from now';
    if (abs < 60000) return `${Math.floor(abs / 1000)}s${suffix}`;
    if (abs < 3600000) return `${Math.floor(abs / 60000)}m${suffix}`;
    if (abs < 86400000) return `${Math.floor(abs / 3600000)}h${suffix}`;
    return `${Math.floor(abs / 86400000)}d${suffix}`;
  }
};
