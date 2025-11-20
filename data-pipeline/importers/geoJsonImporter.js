const { GeoFeature } = require('../../server/src/models');
const logger = require('../../server/src/utils/logger');
const turf = require('@turf/turf');

/**
 * GeoJSON Importer
 * Imports GeoJSON files into the database
 */
class GeoJsonImporter {
    constructor(layerId) {
        this.layerId = layerId;
        this.batchSize = 100;
        this.stats = {
            total: 0,
            imported: 0,
            failed: 0,
            errors: [],
        };
    }

    /**
     * Import GeoJSON file
     * @param {Object} geojson - GeoJSON FeatureCollection or Feature
     * @param {Object} options - Import options
     */
    async import(geojson, options = {}) {
        try {
            const { validFrom, validTo, defaultProperties = {} } = options;

            // Normalize to FeatureCollection
            const featureCollection = this.normalizeToFeatureCollection(geojson);

            this.stats.total = featureCollection.features.length;
            logger.info(`Starting import of ${this.stats.total} features for layer ${this.layerId}`);

            // Process in batches
            const batches = this.createBatches(featureCollection.features, this.batchSize);

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} features)`);

                await this.processBatch(batch, { validFrom, validTo, defaultProperties });
            }

            logger.info(`Import complete: ${this.stats.imported} imported, ${this.stats.failed} failed`);
            return this.stats;
        } catch (error) {
            logger.error('Error importing GeoJSON:', error);
            throw error;
        }
    }

    /**
     * Normalize input to FeatureCollection
     */
    normalizeToFeatureCollection(geojson) {
        if (geojson.type === 'FeatureCollection') {
            return geojson;
        } else if (geojson.type === 'Feature') {
            return {
                type: 'FeatureCollection',
                features: [geojson],
            };
        } else if (geojson.type && geojson.coordinates) {
            // Raw geometry
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: geojson,
                    properties: {},
                }],
            };
        } else {
            throw new Error('Invalid GeoJSON format');
        }
    }

    /**
     * Create batches from features array
     */
    createBatches(features, batchSize) {
        const batches = [];
        for (let i = 0; i < features.length; i += batchSize) {
            batches.push(features.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Process a batch of features
     */
    async processBatch(features, options) {
        const { validFrom, validTo, defaultProperties } = options;

        for (const feature of features) {
            try {
                // Validate feature
                if (!this.validateFeature(feature)) {
                    this.stats.failed++;
                    this.stats.errors.push({
                        feature: feature.id || 'unknown',
                        error: 'Invalid feature geometry or structure',
                    });
                    continue;
                }

                // Extract geometry type
                const geometryType = this.getGeometryType(feature.geometry);

                // Prepare feature data
                const featureData = {
                    layerId: this.layerId,
                    name: feature.properties.name || feature.properties.NAME || null,
                    type: geometryType,
                    geometry: feature.geometry,
                    properties: {
                        ...defaultProperties,
                        ...feature.properties,
                    },
                    validFrom: validFrom || feature.properties.valid_from || null,
                    validTo: validTo || feature.properties.valid_to || null,
                };

                // Import feature
                await GeoFeature.create(featureData);
                this.stats.imported++;

            } catch (error) {
                this.stats.failed++;
                this.stats.errors.push({
                    feature: feature.id || feature.properties?.name || 'unknown',
                    error: error.message,
                });
                logger.warn(`Failed to import feature: ${error.message}`);
            }
        }
    }

    /**
     * Validate feature
     */
    validateFeature(feature) {
        if (!feature || !feature.geometry) {
            return false;
        }

        if (!feature.geometry.type || !feature.geometry.coordinates) {
            return false;
        }

        // Validate coordinates are not empty
        if (!feature.geometry.coordinates || feature.geometry.coordinates.length === 0) {
            return false;
        }

        return true;
    }

    /**
     * Get geometry type
     */
    getGeometryType(geometry) {
        const type = geometry.type.toLowerCase();

        const typeMap = {
            'point': 'point',
            'multipoint': 'multipoint',
            'linestring': 'line',
            'multilinestring': 'multiline',
            'polygon': 'polygon',
            'multipolygon': 'multipolygon',
        };

        return typeMap[type] || type;
    }

    /**
     * Simplify features before import (useful for large datasets)
     */
    simplifyFeatures(features, tolerance = 0.001) {
        return features.map(feature => {
            try {
                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    const simplified = turf.simplify(feature, { tolerance, highQuality: false });
                    return simplified;
                }
                return feature;
            } catch (error) {
                logger.warn(`Failed to simplify feature: ${error.message}`);
                return feature;
            }
        });
    }

    /**
     * Filter features by bounding box
     */
    filterByBbox(features, bbox) {
        const bboxPolygon = turf.bboxPolygon(bbox);

        return features.filter(feature => {
            try {
                return turf.booleanIntersects(feature, bboxPolygon);
            } catch (error) {
                return false;
            }
        });
    }
}

module.exports = GeoJsonImporter;
