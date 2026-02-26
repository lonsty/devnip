// 进制转换工具
export const NumberBaseTool = {
  convert(value, fromBase = 10) {
    try {
      let str = String(value).trim();
      let negative = false;
      if (str.startsWith('-')) { negative = true; str = str.substring(1); }

      // 自动识别前缀
      if (fromBase === 10) {
        if (/^0[bB]/.test(str)) { fromBase = 2; str = str.substring(2); }
        else if (/^0[oO]/.test(str)) { fromBase = 8; str = str.substring(2); }
        else if (/^0[xX]/.test(str)) { fromBase = 16; str = str.substring(2); }
      }

      // 验证输入合法性
      const validChars = '0123456789abcdef'.substring(0, fromBase);
      const regex = new RegExp(`^[${validChars}]+$`, 'i');
      if (!regex.test(str)) {
        return { success: false, error: `Input contains invalid characters (base ${fromBase})` };
      }

      let num;
      try {
        num = BigInt(negative ? '-' : '' + '0') + BigInt(`${fromBase === 16 ? '0x' : fromBase === 8 ? '0o' : fromBase === 2 ? '0b' : ''}${str}`);
        if (negative) num = -num;
      } catch {
        num = BigInt(parseInt(str, fromBase)) * (negative ? -1n : 1n);
      }

      const sign = num < 0n ? '-' : '';
      const abs = num < 0n ? -num : num;

      const bin = sign + abs.toString(2);
      const oct = sign + abs.toString(8);
      const dec = sign + abs.toString(10);
      const hex = sign + abs.toString(16).toUpperCase();

      // 格式化分组
      const binFormatted = sign + abs.toString(2).replace(/(\d{4})(?=\d)/g, '$1 ');
      const hexFormatted = sign + abs.toString(16).toUpperCase().replace(/([0-9A-F]{2})(?=[0-9A-F])/g, '$1 ');

      return {
        success: true,
        data: {
          BIN: bin, BIN_F: binFormatted,
          OCT: oct,
          DEC: dec,
          HEX: hex, HEX_F: hexFormatted
        }
      };
    } catch (e) {
      return { success: false, error: `Convert failed: ${e.message}` };
    }
  }
};
