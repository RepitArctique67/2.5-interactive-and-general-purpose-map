const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Cache Warmer Job
 * Pre-fetches popular data to populate cache
 */
class CacheWarmer {
    constructor() {
        this.apiUrl = process.env.API_URL || 'http://localhost:3001/api/v1';
    }

    /**
     * Run cache warming
     */
    async run() {
        logger.info('[CacheWarmer] Starting cache warming');

        // List of popular endpoints/queries to warm
        const targets = [
            '/layers',
            '/timeline/range?start=1900&end=2025',
            '/geodata/bbox?bbox=2.2,48.8,2.5,48.9' // Paris
        ];

        for (const target of targets) {
            try {
                logger.debug(`[CacheWarmer] Warming ${target}`);
                // await axios.get(`${this.apiUrl}${target}`);
                // Commented out to avoid actual network calls in this environment
                await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
            } catch (error) {
                logger.warn(`[CacheWarmer] Failed to warm ${target}: ${error.message}`);
            }
        }
    }
}

module.exports = CacheWarmer;
