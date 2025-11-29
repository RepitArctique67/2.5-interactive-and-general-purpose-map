const axios = require('axios');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

/**
 * Geocoding Service
 * Handles forward and reverse geocoding with caching and rate limiting
 */
class Geocoder {
    constructor(config = {}) {
        this.config = config;
        this.cache = new NodeCache({ stdTTL: 3600 * 24 }); // 24 hour cache
        this.lastRequestTime = 0;
        this.minInterval = 1000; // 1 second between requests (Nominatim policy)
    }

    /**
     * Forward geocoding (Address -> Coordinates)
     * @param {String} query - Address or place name
     * @returns {Array} List of results
     */
    async geocode(query) {
        try {
            const cacheKey = `geo:${query}`;
            const cached = this.cache.get(cacheKey);
            if (cached) {
                logger.debug(`[Geocoder] Cache hit for ${query}`);
                return cached;
            }

            await this.enforceRateLimit();

            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: query,
                    format: 'json',
                    limit: 5,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'MapPlatform-DataPipeline/1.0'
                }
            });

            const results = response.data.map(item => ({
                name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type,
                importance: item.importance,
                bbox: item.boundingbox,
                address: item.address
            }));

            this.cache.set(cacheKey, results);
            return results;
        } catch (error) {
            logger.error(`[Geocoder] Geocoding failed for ${query}:`, error);
            throw error;
        }
    }

    /**
     * Reverse geocoding (Coordinates -> Address)
     * @param {Number} lat - Latitude
     * @param {Number} lon - Longitude
     * @returns {Object} Address details
     */
    async reverse(lat, lon) {
        try {
            const cacheKey = `rev:${lat},${lon}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;

            await this.enforceRateLimit();

            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'MapPlatform-DataPipeline/1.0'
                }
            });

            const result = {
                name: response.data.display_name,
                address: response.data.address,
                type: response.data.type
            };

            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            logger.error(`[Geocoder] Reverse geocoding failed for ${lat},${lon}:`, error);
            throw error;
        }
    }

    /**
     * Enforce rate limiting
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.minInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLast));
        }
        this.lastRequestTime = Date.now();
    }
}

module.exports = Geocoder;
