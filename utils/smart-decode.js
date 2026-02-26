// 编码探测与多格式解码
import { Base64Tool } from './base64.js';
import { UrlTool } from './url-codec.js';
import { HtmlEntityTool } from './html-entity.js';
import { UnicodeTool } from './unicode.js';
import { JwtTool } from './jwt.js';

export const SmartDecodeTool = {
  detect(input) {
    const detections = [];
    const str = input.trim();

    // JWT 检测
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(str)) {
      const jwt = JwtTool.decode(str);
      if (jwt.success) {
        detections.push({ type: 'JWT', confidence: 'high', decoded: JSON.parse(jwt.data.payload) });
      }
    }

    // URL 编码检测
    if (/%[0-9A-Fa-f]{2}/.test(str)) {
      const decoded = UrlTool.decode(str);
      if (decoded.success && decoded.data !== str) {
        detections.push({ type: 'URL encode', confidence: 'high', decoded: decoded.data });
      }
    }

    // HTML 实体检测
    if (/&[#a-zA-Z][\w]*;/.test(str)) {
      const decoded = HtmlEntityTool.decode(str);
      if (decoded.success && decoded.data !== str) {
        detections.push({ type: 'HTML entity', confidence: 'high', decoded: decoded.data });
      }
    }

    // Unicode 转义检测
    if (/\\u[0-9a-fA-F]{4}/.test(str) || /\\u\{[0-9a-fA-F]+\}/.test(str)) {
      const decoded = UnicodeTool.decode(str);
      if (decoded.success && decoded.data !== str) {
        detections.push({ type: 'Unicode escape', confidence: 'high', decoded: decoded.data });
      }
    }

    // Base64 检测（最容易误判，放最后）
    if (/^[A-Za-z0-9+/\-_]+=*$/.test(str) && str.length >= 4 && str.length % 4 <= 2) {
      const decoded = Base64Tool.decode(str);
      if (decoded.success) {
        // 检测是否为可打印文本
        const isPrintable = /^[\x20-\x7E\u4e00-\u9fff\s]+$/.test(decoded.data);
        if (isPrintable && decoded.data.length > 0) {
          detections.push({
            type: 'Base64',
            confidence: decoded.data.length > 4 ? 'medium' : 'low',
            decoded: decoded.data
          });
        }
      }
    }

    // 十六进制字符串检测
    if (/^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0 && str.length >= 4) {
      try {
        const bytes = [];
        for (let i = 0; i < str.length; i += 2) {
          bytes.push(parseInt(str.substr(i, 2), 16));
        }
        const decoded = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
        const isPrintable = /^[\x20-\x7E\u4e00-\u9fff\s]+$/.test(decoded);
        if (isPrintable) {
          detections.push({ type: 'Hex string', confidence: 'low', decoded });
        }
      } catch { /* 非 UTF-8 文本 */ }
    }

    return detections;
  },

  recursiveDecode(input, maxDepth = 10) {
    const layers = [{ type: 'Original input', value: input }];
    let current = input;

    for (let depth = 0; depth < maxDepth; depth++) {
      const detections = this.detect(current);
      if (detections.length === 0) break;

      // 选择置信度最高的
      const best = detections[0];
      if (best.decoded === current) break;
      current = typeof best.decoded === 'string' ? best.decoded : JSON.stringify(best.decoded);
      layers.push({ type: best.type, value: current, confidence: best.confidence });
    }

    return {
      success: true,
      data: {
        result: current,
        layers,
        depth: layers.length - 1
      }
    };
  }
};
