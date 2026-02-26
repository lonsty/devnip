// IP / 网络工具
const PRIVATE_RANGES = [
  { name: 'Private (Class A)', cidr: '10.0.0.0/8', start: 0x0A000000, end: 0x0AFFFFFF },
  { name: 'Private (Class B)', cidr: '172.16.0.0/12', start: 0xAC100000, end: 0xAC1FFFFF },
  { name: 'Private (Class C)', cidr: '192.168.0.0/16', start: 0xC0A80000, end: 0xC0A8FFFF },
  { name: 'Loopback', cidr: '127.0.0.0/8', start: 0x7F000000, end: 0x7FFFFFFF },
  { name: 'Link-local', cidr: '169.254.0.0/16', start: 0xA9FE0000, end: 0xA9FEFFFF }
];

export const IpTool = {
  parseIPv4(ip) {
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return { success: false, error: 'IPv4 address should have 4 octets' };
    const nums = [];
    for (const p of parts) {
      if (!/^\d+$/.test(p)) return { success: false, error: `Invalid octet: "${p}"` };
      if (p.length > 1 && p.startsWith('0')) return { success: false, error: `Leading zeros not allowed: "${p}"` };
      const n = parseInt(p, 10);
      if (n < 0 || n > 255) return { success: false, error: `Octet ${n} out of range [0-255]` };
      nums.push(n);
    }
    return { success: true, data: nums };
  },

  ipToInt(ip) {
    const r = this.parseIPv4(ip);
    if (!r.success) return r;
    const [a, b, c, d] = r.data;
    const int = (a * 16777216 + b * 65536 + c * 256 + d) >>> 0;
    return { success: true, data: int };
  },

  intToIp(num) {
    try {
      const n = Number(num) >>> 0;
      return {
        success: true,
        data: `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`
      };
    } catch (e) {
      return { success: false, error: `Convert failed: ${e.message}` };
    }
  },

  cidr(input) {
    const parts = input.trim().split('/');
    if (parts.length !== 2) return { success: false, error: 'CIDR format: IP/prefix-length' };

    const ipResult = this.ipToInt(parts[0]);
    if (!ipResult.success) return ipResult;

    const prefix = parseInt(parts[1], 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return { success: false, error: 'Prefix length range: 0-32' };
    }

    const ipInt = ipResult.data;
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const hostMin = prefix >= 31 ? network : (network + 1) >>> 0;
    const hostMax = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
    const hostCount = prefix >= 31 ? (prefix === 32 ? 1 : 2) : (broadcast - network - 1);

    const wildcard = (~mask) >>> 0;

    return {
      success: true,
      data: {
        network: this.intToIp(network).data,
        broadcast: this.intToIp(broadcast).data,
        hostMin: this.intToIp(hostMin).data,
        hostMax: this.intToIp(hostMax).data,
        hostCount,
        mask: this.intToIp(mask).data,
        wildcard: this.intToIp(wildcard).data,
        binary: ipInt.toString(2).padStart(32, '0').replace(/(\d{8})/g, '$1.').slice(0, -1),
        hex: '0x' + ipInt.toString(16).padStart(8, '0').toUpperCase(),
        addressType: this._identifyType(ipInt)
      }
    };
  },

  _identifyType(ipInt) {
    for (const range of PRIVATE_RANGES) {
      if (ipInt >= range.start && ipInt <= range.end) return range.name;
    }
    return 'Public';
  }
};
