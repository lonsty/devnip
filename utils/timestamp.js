// 时间戳转换工具
const TIMEZONES = [
  'UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul',
  'US/Eastern', 'US/Pacific', 'Europe/London', 'Europe/Berlin'
];

const FORMATS = {
  'ISO 8601': { dateStyle: undefined, timeStyle: undefined, iso: true },
  'YYYY-MM-DD HH:mm:ss': { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
  'YYYY/MM/DD HH:mm:ss': { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
  'Full': { dateStyle: 'full', timeStyle: 'long' }
};

export const TimestampTool = {
  TIMEZONES,

  toReadable(input, timezone = 'UTC', formatName = 'YYYY-MM-DD HH:mm:ss') {
    try {
      let ts = Number(input);
      if (isNaN(ts)) return { success: false, error: 'Please enter a valid numeric timestamp' };

      // 自动识别秒 vs 毫秒
      let unit = 'ms';
      if (Math.abs(ts) < 1e12) {
        ts *= 1000;
        unit = 's';
      }

      const date = new Date(ts);
      if (isNaN(date.getTime())) return { success: false, error: 'Invalid timestamp' };

      const fmt = FORMATS[formatName] || FORMATS['YYYY-MM-DD HH:mm:ss'];
      let formatted;
      if (fmt.iso) {
        formatted = date.toISOString();
      } else {
        formatted = new Intl.DateTimeFormat('en-US', { ...fmt, timeZone: timezone }).format(date);
      }

      const relative = this._relativeTime(date);
      const datetime = this._formatDatetime(date, timezone);

      return {
        success: true,
        data: formatted,
        meta: { unit, timezone, relative, iso: date.toISOString(), datetime }
      };
    } catch (e) {
      return { success: false, error: `Convert failed: ${e.message}` };
    }
  },

  fromReadable(str, outputUnit = 's') {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return { success: false, error: 'Cannot parse this date format' };
      const ms = date.getTime();
      const result = outputUnit === 's' ? Math.floor(ms / 1000) : ms;
      return { success: true, data: String(result) };
    } catch (e) {
      return { success: false, error: `Convert failed: ${e.message}` };
    }
  },

  now() {
    const ms = Date.now();
    const s = Math.floor(ms / 1000);
    const date = new Date(ms);
    return {
      success: true,
      data: { seconds: s, milliseconds: ms, iso: date.toISOString(), relative: 'just now' }
    };
  },

  // Format date as YYYY-MM-DD HH:mm:ss in the given timezone
  _formatDatetime(date, timezone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: timezone
    }).formatToParts(date);
    const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  },

  _relativeTime(date) {
    const diff = Date.now() - date.getTime();
    const abs = Math.abs(diff);
    const suffix = diff > 0 ? ' ago' : ' from now';
    if (abs < 60000) return `${Math.floor(abs / 1000)}s${suffix}`;
    if (abs < 3600000) return `${Math.floor(abs / 60000)}m${suffix}`;
    if (abs < 86400000) return `${Math.floor(abs / 3600000)}h${suffix}`;
    if (abs < 2592000000) return `${Math.floor(abs / 86400000)}d${suffix}`;
    if (abs < 31536000000) return `${Math.floor(abs / 2592000000)}mo${suffix}`;
    return `${Math.floor(abs / 31536000000)}y${suffix}`;
  }
};
