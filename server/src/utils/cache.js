const NodeCache = require('node-cache');

class CacheService {
    constructor(ttlSeconds = 600) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value, ttl) {
        return this.cache.set(key, value, ttl || 600);
    }

    delete(key) {
        return this.cache.del(key);
    }

    flush() {
        return this.cache.flushAll();
    }

    async wrap(key, fn, ttl) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }

        const result = await fn();
        this.set(key, result, ttl);
        return result;
    }
}

exports.layerCache = new CacheService(3600);
exports.geoCache = new CacheService(1800);
exports.searchCache = new CacheService(600);
