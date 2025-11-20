const BaseImporter = require('../utils/BaseImporter');
const logger = require('../utils/logger');

/**
 * NASA Earth Observatory data importer
 * Imports natural events, imagery, and Earth observation data
 */
class NASAImporter extends BaseImporter {
    constructor(config) {
        super(config);
        this.apiKey = this.getApiKey();
    }

    /**
     * Import NASA Earth Observatory Natural Events (EONET)
     * @param {Object} params - Import parameters
     * @param {String} params.category - Event category (wildfires, storms, volcanoes, etc.)
     * @param {Number} params.days - Number of days to look back
     * @param {String} params.status - Event status: 'open', 'closed', or 'all'
     * @returns {Object} GeoJSON FeatureCollection
     */
    async importNaturalEvents(params = {}) {
        this.logStart(params);
        this.resetStats();

        try {
            const { category, days = 30, status = 'all' } = params;

            const queryParams = {
                status,
                days,
            };

            if (category) {
                queryParams.category = category;
            }

            // EONET API doesn't require API key
            const data = await this.makeRequest('/EONET/api/v3/events', {
                method: 'GET',
                params: queryParams,
                baseURL: 'https://eonet.gsfc.nasa.gov',
            });

            const geojson = await this.transformNaturalEvents(data);
            this.logComplete();
            return geojson;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Import NASA Earth imagery (APOD, Earth Observatory images)
     * @param {Object} params - Import parameters
     * @param {String} params.date - Date in YYYY-MM-DD format
     * @param {Number} params.count - Number of images to retrieve
     * @returns {Array} Array of image metadata
     */
    async importImagery(params = {}) {
        if (!this.apiKey) {
            throw new Error('NASA API key is required for imagery import');
        }

        this.logStart(params);
        this.resetStats();

        try {
            const { date, count = 1 } = params;

            const queryParams = {
                api_key: this.apiKey,
            };

            if (date) {
                queryParams.date = date;
            } else if (count > 1) {
                queryParams.count = count;
            }

            // Use APOD (Astronomy Picture of the Day) API
            const data = await this.makeRequest('/planetary/apod', {
                method: 'GET',
                params: queryParams,
                baseURL: 'https://api.nasa.gov',
            });

            const imagery = Array.isArray(data) ? data : [data];
            this.stats.totalItems = imagery.length;
            this.stats.processedItems = imagery.length;

            this.logComplete();
            return imagery;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Import Earth at Night imagery metadata
     * @param {Object} params - Import parameters
     * @returns {Array} Array of imagery metadata
     */
    async importEarthAtNight(params = {}) {
        this.logStart(params);

        // Earth at Night imagery is available through NASA's Earth Observatory
        // This is a simplified implementation that returns metadata
        const imagery = [
            {
                id: 'earth-at-night-2016',
                title: 'Earth at Night 2016',
                description: 'Global composite of nighttime lights',
                url: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/90000/90008/earth_lights_4800.jpg',
                date: '2016-12-05',
                type: 'composite',
                coverage: 'global',
            },
            {
                id: 'black-marble-2021',
                title: 'Black Marble 2021',
                description: 'NASA Black Marble nighttime imagery',
                url: 'https://earthobservatory.nasa.gov/features/NightLights',
                date: '2021-01-01',
                type: 'composite',
                coverage: 'global',
            },
        ];

        logger.info(`[${this.name}] Returned ${imagery.length} Earth at Night imagery items`);
        return imagery;
    }

    /**
     * Transform EONET natural events to GeoJSON
     */
    async transformNaturalEvents(data) {
        if (!data.events || data.events.length === 0) {
            logger.warn(`[${this.name}] No natural events found`);
            return {
                type: 'FeatureCollection',
                features: [],
            };
        }

        this.stats.totalItems = data.events.length;
        const features = [];

        for (let i = 0; i < data.events.length; i++) {
            const event = data.events[i];
            const feature = this.eventToFeature(event);

            if (feature) {
                features.push(feature);
            }

            if (i % 10 === 0) {
                this.updateProgress(i, data.events.length);
            }
        }

        this.updateProgress(data.events.length, data.events.length);

        return {
            type: 'FeatureCollection',
            features,
            metadata: {
                source: 'NASA EONET',
                attribution: this.config.attribution,
                importDate: new Date().toISOString(),
                count: features.length,
            },
        };
    }

    /**
     * Convert EONET event to GeoJSON feature
     */
    eventToFeature(event) {
        // Get the most recent geometry
        if (!event.geometry || event.geometry.length === 0) {
            return null;
        }

        // Use the latest geometry entry
        const latestGeometry = event.geometry[event.geometry.length - 1];

        let geometry = null;

        if (latestGeometry.type === 'Point') {
            geometry = {
                type: 'Point',
                coordinates: latestGeometry.coordinates,
            };
        } else if (latestGeometry.type === 'Polygon') {
            geometry = {
                type: 'Polygon',
                coordinates: latestGeometry.coordinates,
            };
        }

        if (!geometry) {
            return null;
        }

        return {
            type: 'Feature',
            id: event.id,
            geometry,
            properties: {
                title: event.title,
                description: event.description || '',
                category: event.categories.map((c) => c.title).join(', '),
                categoryId: event.categories.map((c) => c.id),
                date: latestGeometry.date,
                closed: event.closed || null,
                link: event.link || '',
                sources: event.sources || [],
                eventType: 'natural_event',
            },
        };
    }

    /**
     * Get available event categories
     */
    async getCategories() {
        try {
            const data = await this.makeRequest('/EONET/api/v3/categories', {
                method: 'GET',
                baseURL: 'https://eonet.gsfc.nasa.gov',
            });

            return data.categories || [];
        } catch (error) {
            logger.error(`[${this.name}] Failed to fetch categories:`, error);
            throw error;
        }
    }

    /**
     * Transform data to standard format
     */
    async transform(data) {
        // This is called by the base class but we have specific transform methods
        return this.transformNaturalEvents(data);
    }
}

module.exports = NASAImporter;
