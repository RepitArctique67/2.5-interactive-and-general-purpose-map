const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Historical Events Service
 * Fetches historical events linked to locations using Wikidata SPARQL
 */
class HistoricalEvents {
    constructor(config = {}) {
        this.config = config;
        this.endpoint = 'https://query.wikidata.org/sparql';
    }

    /**
     * Get events near a location
     * @param {Number} lat - Latitude
     * @param {Number} lon - Longitude
     * @param {Number} radius - Radius in km
     * @returns {Array} List of historical events
     */
    async getEventsNear(lat, lon, radius = 10) {
        try {
            const query = `
        SELECT ?event ?eventLabel ?date ?coord ?typeLabel WHERE {
          SERVICE wikibase:around {
            ?event wdt:P625 ?coord .
            bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
            bd:serviceParam wikibase:radius "${radius}" .
          }
          ?event wdt:P31 ?type .
          ?type wdt:P279* wd:Q1190554 . # Subclass of "occurrence"
          OPTIONAL { ?event wdt:P585 ?date . }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr". }
        }
        LIMIT 20
      `;

            const response = await axios.get(this.endpoint, {
                params: {
                    query,
                    format: 'json'
                },
                headers: {
                    'User-Agent': 'MapPlatform-DataPipeline/1.0'
                }
            });

            return this.transformResults(response.data);
        } catch (error) {
            logger.error(`[HistoricalEvents] Failed to fetch events:`, error);
            return [];
        }
    }

    /**
     * Transform SPARQL results
     */
    transformResults(data) {
        if (!data.results || !data.results.bindings) return [];

        return data.results.bindings.map(item => {
            // Parse coordinate "Point(lon lat)"
            const coordStr = item.coord.value;
            const match = coordStr.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
            const lon = match ? parseFloat(match[1]) : null;
            const lat = match ? parseFloat(match[2]) : null;

            return {
                id: item.event.value,
                title: item.eventLabel.value,
                date: item.date ? item.date.value : null,
                type: item.typeLabel ? item.typeLabel.value : 'event',
                location: { lat, lon },
                source: 'Wikidata'
            };
        });
    }
}

module.exports = HistoricalEvents;
