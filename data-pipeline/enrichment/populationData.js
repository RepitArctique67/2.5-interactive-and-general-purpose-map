const logger = require('../utils/logger');

/**
 * Population Data Service
 * Provides population estimates and demographic data
 */
class PopulationData {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Get population estimate for a specific location (point)
     * @param {Number} lat - Latitude
     * @param {Number} lon - Longitude
     * @param {Number} radius - Radius in km
     * @returns {Object} Population estimate
     */
    async getEstimate(lat, lon, radius = 1) {
        try {
            // In a real implementation, this would query a raster dataset (e.g., WorldPop)
            // or an API like NASA SEDAC

            logger.info(`[PopulationData] Getting estimate for ${lat},${lon} radius ${radius}km`);

            // Mock logic based on "random" but deterministic density
            // This is just for demonstration
            const density = this.getMockDensity(lat, lon);
            const area = Math.PI * radius * radius;
            const population = Math.round(density * area);

            return {
                population,
                density, // people per sq km
                radius,
                year: 2020,
                source: 'Mock WorldPop'
            };
        } catch (error) {
            logger.error(`[PopulationData] Failed to get estimate:`, error);
            throw error;
        }
    }

    /**
     * Get demographic breakdown
     */
    async getDemographics(lat, lon) {
        // Mock demographics
        return {
            age_distribution: {
                '0-14': 0.18,
                '15-64': 0.65,
                '65+': 0.17
            },
            gender_ratio: 0.98 // males per female
        };
    }

    /**
     * Mock density generator
     */
    getMockDensity(lat, lon) {
        // Simple hash to generate consistent "random" density
        const val = Math.abs(Math.sin(lat * 100) * Math.cos(lon * 100));
        // Scale to reasonable urban/rural densities (0 to 10000 people/km2)
        return Math.floor(val * 10000);
    }
}

module.exports = PopulationData;
