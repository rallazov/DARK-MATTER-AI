class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 60_000) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  del(key) {
    this.store.delete(key);
  }
}

const cache = new MemoryCache();
module.exports = { cache };
