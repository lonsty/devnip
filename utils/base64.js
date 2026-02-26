// Base64 编解码工具
export const Base64Tool = {
  encode(str, urlSafe = false) {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      let result = btoa(binary);
      if (urlSafe) {
        result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Encode failed: ${e.message}` };
    }
  },

  decode(str) {
    try {
      // 清理空白和换行
      let cleaned = str.replace(/\s/g, '');
      // 自动识别 URL-safe Base64
      if (/[-_]/.test(cleaned) && !/[+/]/.test(cleaned)) {
        cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
      }
      // 补齐 padding
      while (cleaned.length % 4 !== 0) {
        cleaned += '=';
      }
      // 校验字符合法性
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
        const invalid = cleaned.match(/[^A-Za-z0-9+/=]/);
        return { success: false, error: `Invalid Base64 character: "${invalid[0]}" (position ${cleaned.indexOf(invalid[0])})` };
      }
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const result = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: `Decode failed: ${e.message}` };
    }
  }
};
