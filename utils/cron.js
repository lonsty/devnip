// Cron 表达式解析工具
const MONTH_NAMES = ['', 'JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const FIELD_RANGES = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'weekday', min: 0, max: 7 }
];

export const CronTool = {
  parse(expr) {
    try {
      const parts = expr.trim().split(/\s+/);
      let fields, hasSeconds = false;
      if (parts.length === 5) {
        fields = parts;
      } else if (parts.length === 6) {
        hasSeconds = true;
        fields = parts.slice(1); // 去掉秒字段用于描述
      } else {
        return { success: false, error: `Cron expression should have 5 or 6 fields, got ${parts.length}` };
      }

      // 校验
      for (let i = 0; i < 5; i++) {
        const err = this._validateField(fields[i], FIELD_RANGES[i]);
        if (err) return { success: false, error: err };
      }

      const desc = this._describe(fields, hasSeconds ? parts[0] : null);
      return {
        success: true,
        data: { description: desc, format: hasSeconds ? '6 fields (with seconds)' : '5 fields (standard)' }
      };
    } catch (e) {
      return { success: false, error: `Parse failed: ${e.message}` };
    }
  },

  nextRuns(expr, count = 10, timezone = 'Asia/Shanghai') {
    try {
      const parts = expr.trim().split(/\s+/);
      let fields;
      if (parts.length === 5) fields = parts;
      else if (parts.length === 6) fields = parts.slice(1);
      else return { success: false, error: 'Invalid Cron expression' };

      const results = [];
      const now = new Date();
      // 从当前时间的下一分钟开始遍历
      let cursor = new Date(Math.ceil((now.getTime() + 1) / 60000) * 60000);
      const maxIter = 525600; // 一年的分钟数
      let iter = 0;

      while (results.length < count && iter < maxIter) {
        if (this._matchesCron(cursor, fields, timezone)) {
          results.push(new Date(cursor));
        }
        cursor = new Date(cursor.getTime() + 60000);
        iter++;
      }

      return { success: true, data: results.map(d => this._formatInTimezone(d, timezone)) };
    } catch (e) {
      return { success: false, error: `Calculation failed: ${e.message}` };
    }
  },

  // 获取指定时区下的时间分量
  _getPartsInTimezone(date, timezone) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, weekday: 'short', timeZone: timezone
    }).formatToParts(date);
    const get = (type) => (fmt.find(p => p.type === type) || {}).value || '';
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      minute: parseInt(get('minute'), 10),
      hour: parseInt(get('hour'), 10),
      day: parseInt(get('day'), 10),
      month: parseInt(get('month'), 10),
      weekday: weekdayMap[get('weekday')] ?? 0
    };
  },

  // 格式化为指定时区的可读时间
  _formatInTimezone(date, timezone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: timezone
    }).formatToParts(date);
    const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  },

  _matchesCron(date, fields, timezone) {
    const { minute, hour, day, month, weekday } = this._getPartsInTimezone(date, timezone);

    return this._matchField(fields[0], minute, FIELD_RANGES[0]) &&
           this._matchField(fields[1], hour, FIELD_RANGES[1]) &&
           this._matchField(fields[2], day, FIELD_RANGES[2]) &&
           this._matchField(fields[3], month, FIELD_RANGES[3]) &&
           this._matchField(fields[4], weekday, FIELD_RANGES[4]);
  },

  _matchField(field, value, range) {
    if (field === '*' || field === '?') return true;
    const parts = field.split(',');
    for (const part of parts) {
      if (part.includes('/')) {
        const [base, step] = part.split('/');
        const start = base === '*' ? range.min : parseInt(base);
        const s = parseInt(step);
        if ((value - start) >= 0 && (value - start) % s === 0) return true;
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        if (value >= a && value <= b) return true;
      } else {
        if (parseInt(part) === value || (range.name === 'weekday' && parseInt(part) === 7 && value === 0)) return true;
      }
    }
    return false;
  },

  _validateField(field, range) {
    if (field === '*' || field === '?') return null;
    const parts = field.split(',');
    for (const part of parts) {
      const nums = part.replace(/[*/\-]/g, ' ').trim().split(/\s+/).filter(Boolean);
      for (const n of nums) {
        const v = parseInt(n);
        if (isNaN(v)) continue;
        if (v < range.min || v > range.max) {
          return `${range.name} field value ${v} out of range [${range.min}-${range.max}]`;
        }
      }
    }
    return null;
  },

  _describe(fields, secondField) {
    const [min, hour, day, month, weekday] = fields;
    const parts = [];

    if (secondField && secondField !== '*' && secondField !== '0') {
      parts.push(`at second ${secondField}`);
    }
    if (min === '*' && hour === '*') parts.push('every minute');
    else if (min !== '*' && hour === '*') parts.push(`at minute ${min} of every hour`);
    else if (min !== '*' && hour !== '*') parts.push(`${hour}:${min.padStart(2, '0')}`);
    else if (min === '*' && hour !== '*') parts.push(`every minute of hour ${hour}`);

    if (day !== '*' && day !== '?') parts.push(`on day ${day}`);
    if (month !== '*') parts.push(`in month ${month}`);
    if (weekday !== '*' && weekday !== '?') {
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const days = weekday.split(',').map(d => dayNames[parseInt(d) % 7] || d);
      parts.push(days.join(', '));
    }
    if (day === '*' && month === '*' && (weekday === '*' || weekday === '?')) {
      parts.push('every day');
    }

    return parts.join(' ');
  }
};
