const shapefile = require('shapefile');
const { BatchProcessor } = require('../processors/batchProcessor');
const { GeoFeature } = require('../../server/src/models');
const logger = require('../../server/src/utils/logger');
const fs = require('fs');

/**
 * Natural Earth Importer
 * Imports Shapefiles from Natural Earth data
 */
class NaturalEarthImporter {
    constructor(layerId) {
        this.layerId = layerId;
        this.batchProcessor = new BatchProcessor({ batchSize: 200 });
    }

    /**
     * Import Shapefile
     * @param {String} shpPath - Path to .shp file
     * @param {String} dbfPath - Path to .dbf file (optional, usually auto-detected)
     * @param {Object} options - Import options
     */
    async import(shpPath, dbfPath = null, options = {}) {
        try {
            logger.info(`Starting Natural Earth import from ${shpPath}`);

            if (!fs.existsSync(shpPath)) {
                throw new Error(`Shapefile not found: ${shpPath}`);
            }

            const features = [];

            // Open shapefile stream
            const source = await shapefile.open(shpPath, dbfPath);

            let result;
            while (true) {
                result = await source.read();
                if (result.done) break;

                const feature = result.value;
                const converted = this.convertFeature(feature, options);

                if (converted) {
                    features.push(converted);
                }
            }

            logger.info(`Read ${features.length} features from shapefile`);

            // Batch insert
            const stats = await this.batchProcessor.process(features, async (feature) => {
                await GeoFeature.create(feature);
            });

            return stats;

        } catch (error) {
            logger.error('Error importing Natural Earth data:', error);
            throw error;
        }
    }

    /**
     * Convert GeoJSON feature (from shapefile) to GeoFeature model format
     */
    convertFeature(feature, options) {
        try {
            const props = feature.properties;

            // Map Natural Earth properties to our schema
            // NE usually has NAME, NAME_LONG, SOVEREIGNT, etc.
            const name = props.NAME || props.NAME_LONG || props.name || props.admin || 'Unknown';

            // Determine geometry type
            let type = feature.geometry.type.toLowerCase();
            if (type === 'linestring') type = 'line';
            if (type === 'multilinestring') type = 'multiline';

            return {
                layerId: this.layerId,
                name: name,
                type: type,
                geometry: feature.geometry,
                properties: {
                    ...props,
                    source: 'Natural Earth',
                },
                validFrom: options.validFrom || null,
                validTo: options.validTo || null,
            };

        } catch (error) {
            logger.warn(`Failed to convert feature: ${error.message}`);
            return null;
        }
    }
}

module.exports = NaturalEarthImporter;
