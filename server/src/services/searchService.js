const { GeoFeature, TimelineEvent } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const nodeCache = require('../utils/cache'); // Assuming cache module exports something useful or I use node-cache directly

// Nominatim API URL
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

class SearchService {
    /**
     * Search for locations using Nominatim
     * @param {String} query - Search query
     * @returns {Array} List of locations
     */
    async searchNominatim(query) {
        try {
            const cacheKey = `nominatim:${query}`;
            // Check cache if available (assuming simple cache wrapper or implement here)
            // For now, direct fetch with basic error handling

            const params = new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                polygon_geojson: 0
            });

            const response = await fetch(`${NOMINATIM_API}/search?${params}`, {
                headers: {
                    'User-Agent': '2.5d-Map-App/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.statusText}`);
            }

            const data = await response.json();

            return data.map(item => ({
                id: item.place_id,
                name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type,
                class: item.class,
                bbox: item.boundingbox ? item.boundingbox.map(parseFloat) : null,
                source: 'nominatim'
            }));
        } catch (error) {
            logger.error('Error in searchNominatim:', error);
            return []; // Return empty on external error to avoid breaking local search
        }
    }

    /**
     * Reverse geocoding using Nominatim
     * @param {Number} lat - Latitude
     * @param {Number} lon - Longitude
     * @returns {Object} Location details
     */
    async reverseGeocode(lat, lon) {
        try {
            const params = new URLSearchParams({
                lat,
                lon,
                format: 'json',
                zoom: 18,
                addressdetails: 1
            });

            const response = await fetch(`${NOMINATIM_API}/reverse?${params}`, {
                headers: {
                    'User-Agent': '2.5d-Map-App/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            logger.error('Error in reverseGeocode:', error);
            throw error;
        }
    }

    /**
     * Search local database (GeoFeatures and TimelineEvents)
     * @param {String} query - Search query
     * @returns {Object} Local results
     */
    async searchLocal(query) {
        try {
            const features = await GeoFeature.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${query}%`
                    }
                },
                limit: 5,
                attributes: ['id', 'name', 'type', 'layerId']
            });

            const events = await TimelineEvent.findAll({
                where: {
                    title: {
                        [Op.iLike]: `%${query}%`
                    }
                },
                limit: 5,
                attributes: ['id', 'title', 'eventDate', 'eventType']
            });

            return {
                features: features.map(f => ({
                    id: f.id,
                    name: f.name,
                    type: 'feature',
                    detail: f.type,
                    source: 'local'
                })),
                events: events.map(e => ({
                    id: e.id,
                    name: e.title,
                    type: 'event',
                    detail: e.eventDate,
                    source: 'local'
                }))
            };
        } catch (error) {
            logger.error('Error in searchLocal:', error);
            // Return empty if local search fails (e.g. DB error)
            return { features: [], events: [] };
        }
    }

    /**
     * Unified search (Local + Nominatim)
     * @param {String} query - Search query
     * @returns {Object} Combined results
     */
    async search(query) {
        const [localResults, nominatimResults] = await Promise.all([
            this.searchLocal(query),
            this.searchNominatim(query)
        ]);

        return {
            locations: nominatimResults,
            features: localResults.features,
            events: localResults.events
        };
    }
}

module.exports = new SearchService();
