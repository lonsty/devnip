// UUID / 随机字符串生成工具
export const UuidTool = {
  generateV4(uppercase = false, withDashes = true) {
    let uuid;
    if (crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      uuid = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
    if (!withDashes) uuid = uuid.replace(/-/g, '');
    return uppercase ? uuid.toUpperCase() : uuid;
  },

  generateBatch(count, uppercase = false, withDashes = true) {
    const max = Math.min(count, 1000);
    const results = [];
    for (let i = 0; i < max; i++) {
      results.push(this.generateV4(uppercase, withDashes));
    }
    return results;
  },

  randomString(length = 16, charset = 'alphanumeric', excludeAmbiguous = false) {
    let chars = '';
    const sets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      digits: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    if (charset === 'alphanumeric' || charset === 'all') {
      chars = sets.uppercase + sets.lowercase + sets.digits;
    }
    if (charset === 'all') {
      chars += sets.special;
    }
    if (charset === 'hex') {
      chars = '0123456789abcdef';
    }
    if (!chars) chars = sets.uppercase + sets.lowercase + sets.digits;

    if (excludeAmbiguous) {
      chars = chars.replace(/[0OoIl1]/g, '');
    }

    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  },

  randomPassword(length = 16) {
    const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%^&*_+-=';
    const all = upper + lower + digits + special;

    // 确保每种字符至少一个
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    const result = [
      upper[bytes[0] % upper.length],
      lower[bytes[1] % lower.length],
      digits[bytes[2] % digits.length],
      special[bytes[3] % special.length]
    ];
    for (let i = 4; i < length; i++) {
      result.push(all[bytes[i] % all.length]);
    }
    // 打乱
    for (let i = result.length - 1; i > 0; i--) {
      const rb = new Uint8Array(1);
      crypto.getRandomValues(rb);
      const j = rb[0] % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.join('');
  }
};
