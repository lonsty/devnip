// JSON 格式化 / 压缩 / 校验 / 排序工具
export const JsonTool = {
  // 去除注释和尾逗号的宽松预处理
  _relaxedClean(str) {
    let result = str.replace(/\/\/.*$/gm, '');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/,\s*([\]}])/g, '$1');
    return result;
  },

  // sortMode: 'none' | 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc'
  format(str, indent = 2, sortMode = 'none', relaxed = false) {
    try {
      const input = relaxed ? this._relaxedClean(str) : str;
      let obj = JSON.parse(input);
      if (sortMode && sortMode !== 'none') {
        obj = this._sortObject(obj, sortMode);
      }
      const result = JSON.stringify(obj, null, indent);
      const warnings = this._checkBigNumbers(str);
      return { success: true, data: result, warnings };
    } catch (e) {
      const pos = this._extractErrorPosition(e.message);
      return { success: false, error: `JSON syntax error: ${e.message}`, position: pos };
    }
  },

  minify(str, relaxed = false) {
    try {
      const input = relaxed ? this._relaxedClean(str) : str;
      const obj = JSON.parse(input);
      return { success: true, data: JSON.stringify(obj) };
    } catch (e) {
      return { success: false, error: `JSON syntax error: ${e.message}` };
    }
  },

  // sortMode: 'none' | 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc'
  sort(str, sortMode = 'key-asc', indent = 2, relaxed = false) {
    try {
      const input = relaxed ? this._relaxedClean(str) : str;
      let obj = JSON.parse(input);
      obj = this._sortObject(obj, sortMode);
      return { success: true, data: JSON.stringify(obj, null, indent) };
    } catch (e) {
      const pos = this._extractErrorPosition(e.message);
      return { success: false, error: `JSON syntax error: ${e.message}`, position: pos };
    }
  },

  validate(str) {
    try {
      JSON.parse(str);
      return { success: true, data: 'Valid JSON' };
    } catch (e) {
      const pos = this._extractErrorPosition(e.message);
      return { success: false, error: e.message, position: pos };
    }
  },

  _sortObject(obj, mode = 'key-asc') {
    if (Array.isArray(obj)) return obj.map(item => this._sortObject(item, mode));
    if (obj !== null && typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (mode === 'key-asc') {
        entries.sort((a, b) => a[0].localeCompare(b[0]));
      } else if (mode === 'key-desc') {
        entries.sort((a, b) => b[0].localeCompare(a[0]));
      } else if (mode === 'value-asc') {
        entries.sort((a, b) => this._compareValues(a[1], b[1]));
      } else if (mode === 'value-desc') {
        entries.sort((a, b) => this._compareValues(b[1], a[1]));
      }
      return entries.reduce((sorted, [key, val]) => {
        sorted[key] = this._sortObject(val, mode);
        return sorted;
      }, {});
    }
    return obj;
  },

  _compareValues(a, b) {
    const sa = typeof a === 'object' ? JSON.stringify(a) : String(a ?? '');
    const sb = typeof b === 'object' ? JSON.stringify(b) : String(b ?? '');
    return sa.localeCompare(sb);
  },

  _extractErrorPosition(msg) {
    const match = msg.match(/position\s+(\d+)/i) || msg.match(/column\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  },

  _checkBigNumbers(str) {
    const warnings = [];
    const regex = /:\s*(\d{16,})/g;
    let m;
    while ((m = regex.exec(str)) !== null) {
      const num = m[1];
      if (BigInt(num) > BigInt(Number.MAX_SAFE_INTEGER)) {
        warnings.push(`Number ${num} exceeds Number.MAX_SAFE_INTEGER, possible precision loss`);
      }
    }
    return warnings;
  }
};
