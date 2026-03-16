// Memory cache (no database needed for Vercel)
let cache = {};

export function initializeDatabase() {
  console.log('✅ Cache initialized');
}

export function getCache(key) {
  const item = cache[key];
  if (!item) return null;
  if (new Date(item.expiresAt) < new Date()) {
    delete cache[key];
    return null;
  }
  return JSON.parse(item.data);
}

export function setCache(key, data, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  cache[key] = { data: JSON.stringify(data), expiresAt };
}

export default { getCache, setCache };
