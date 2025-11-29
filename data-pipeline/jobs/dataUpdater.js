const logger = require('../utils/logger');
const config = require('../config/sources.json');

// Import importers
const OSMImporter = require('../importers/osmImporter');
const NASAImporter = require('../importers/nasaImporter');
const ClimateImporter = require('../importers/climateImporter');

/**
 * Data Updater Job
 * Triggers configured data importers
 */
class DataUpdater {
    constructor() {
        this.importers = {
            openstreetmap: new OSMImporter(config.dataSources.openstreetmap),
            nasa: new NASAImporter(config.dataSources.nasa),
            noaa: new ClimateImporter(config.dataSources.noaa)
        };
    }

    /**
     * Run the update job
     */
    async run() {
        logger.info('[DataUpdater] Starting data update cycle');

        const sources = config.dataSources;

        // Iterate through sources and check if update is needed
        // For this implementation, we'll just run enabled sources

        for (const [key, source] of Object.entries(sources)) {
            if (source.enabled && !source.uploadBased) {
                try {
                    await this.updateSource(key, source);
                } catch (error) {
                    logger.error(`[DataUpdater] Failed to update ${key}:`, error);
                    // Continue with other sources
                }
            }
        }
    }

    /**
     * Update a specific source
     */
    async updateSource(key, sourceConfig) {
        logger.info(`[DataUpdater] Updating ${sourceConfig.name}...`);

        const importer = this.importers[key];
        if (!importer) {
            logger.warn(`[DataUpdater] No importer found for ${key}`);
            return;
        }

        // Define update parameters based on source type
        // This would typically come from a state database (last update time, etc.)
        const params = this.getUpdateParams(key);

        await importer.import(params);
    }

    /**
     * Get parameters for update
     */
    getUpdateParams(key) {
        // Placeholder logic
        if (key === 'openstreetmap') {
            return {
                bbox: [2.3, 48.8, 2.4, 48.9], // Example: Paris center
                tags: ['building']
            };
        }
        if (key === 'nasa') {
            return {
                category: 'wildfires',
                days: 7
            };
        }
        if (key === 'noaa') {
            const today = new Date();
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            return {
                startDate: lastWeek.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
                datasetId: 'GHCND'
            };
        }
        return {};
    }
}

module.exports = DataUpdater;
