/**
 * IP 归属地解析（管理端展示用）
 * 数据源: ip-api.com（免费，中文）
 */
const cache = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE = 2000;

function normalizeIp(raw) {
  if (!raw) return '';
  let ip = String(raw).trim();
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ip;
}

function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === 'unknown') return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true;
  return false;
}

function cleanRegion(name) {
  return String(name || '')
    .replace(/(特别行政区|自治区|省|市)$/u, '')
    .trim();
}

function cleanCity(name) {
  return String(name || '')
    .replace(/(地区|自治州|盟|市)$/u, '')
    .trim();
}

function formatFromApi(data) {
  if (!data || data.status !== 'success') return '';
  const country = data.country || '';
  const region = cleanRegion(data.regionName);
  const city = cleanCity(data.city);

  if (country && country !== '中国' && country !== 'China') {
    if (city) return `${country}·${city}`;
    return country;
  }
  if (region && city && region !== city) return `${region}·${city}`;
  return region || city || country || '';
}

function getCached(ip) {
  const hit = cache.get(ip);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(ip);
    return null;
  }
  return hit.location;
}

function setCached(ip, location) {
  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
  cache.set(ip, { location, at: Date.now() });
}

async function lookupOne(ip) {
  const normalized = normalizeIp(ip);
  if (!normalized) return '';
  if (isPrivateIp(normalized)) {
    setCached(normalized, '本地');
    return '本地';
  }

  const cached = getCached(normalized);
  if (cached != null) return cached;

  try {
    const url =
      `http://ip-api.com/json/${encodeURIComponent(normalized)}` +
      '?lang=zh-CN&fields=status,country,regionName,city';
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      setCached(normalized, '');
      return '';
    }
    const data = await res.json();
    const location = formatFromApi(data);
    setCached(normalized, location);
    return location;
  } catch {
    setCached(normalized, '');
    return '';
  }
}

async function lookupMany(ips) {
  const unique = [...new Set((ips || []).map(normalizeIp).filter(Boolean))];
  const result = {};
  const needFetch = [];

  for (const ip of unique) {
    if (isPrivateIp(ip)) {
      result[ip] = '本地';
      setCached(ip, '本地');
      continue;
    }
    const cached = getCached(ip);
    if (cached != null) {
      result[ip] = cached;
    } else {
      needFetch.push(ip);
    }
  }

  // ip-api batch: max 100
  for (let i = 0; i < needFetch.length; i += 100) {
    const chunk = needFetch.slice(i, i + 100);
    try {
      const res = await fetch('http://ip-api.com/batch?lang=zh-CN&fields=status,query,country,regionName,city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map((query) => ({ query }))),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) {
        for (const ip of chunk) {
          result[ip] = '';
          setCached(ip, '');
        }
        continue;
      }
      const list = await res.json();
      for (const item of list || []) {
        const ip = normalizeIp(item.query);
        const location = formatFromApi(item);
        result[ip] = location;
        setCached(ip, location);
      }
    } catch {
      for (const ip of chunk) {
        result[ip] = await lookupOne(ip);
      }
    }
  }

  return result;
}

async function enrichWithLocation(rows, ipKey = 'ip') {
  const list = rows || [];
  const map = await lookupMany(list.map((r) => r[ipKey]));
  return list.map((row) => {
    const ip = normalizeIp(row[ipKey]);
    return {
      ...row,
      ip_location: map[ip] || (isPrivateIp(ip) ? '本地' : '')
    };
  });
}

module.exports = {
  normalizeIp,
  lookupOne,
  lookupMany,
  enrichWithLocation
};
