const turf = require('@turf/turf');
const gjv = require('geojson-validation');
const logger = require('../utils/logger');

/**
 * Data Validator
 * Validates GeoJSON data for structural correctness and geometric validity
 */
class DataValidator {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Validate GeoJSON data
     * @param {Object} geojson - GeoJSON object
     * @returns {Object} Validation result { valid: boolean, errors: [], warnings: [] }
     */
    validate(geojson) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // 1. Structural Validation
            if (!gjv.valid(geojson)) {
                result.valid = false;
                result.errors.push('Invalid GeoJSON structure');
                // gjv.trace(geojson) could provide more details
                return result;
            }

            // 2. Geometric Validation (using Turf)
            if (geojson.type === 'FeatureCollection') {
                geojson.features.forEach((feature, index) => {
                    this.validateFeature(feature, index, result);
                });
            } else if (geojson.type === 'Feature') {
                this.validateFeature(geojson, 0, result);
            } else {
                // Geometry object
                this.validateGeometry(geojson, 'root', result);
            }

            logger.info(`[DataValidator] Validation complete. Valid: ${result.valid}, Errors: ${result.errors.length}`);
            return result;
        } catch (error) {
            logger.error(`[DataValidator] Validation failed:`, error);
            result.valid = false;
            result.errors.push(`Validation exception: ${error.message}`);
            return result;
        }
    }

    /**
     * Validate a single feature
     */
    validateFeature(feature, index, result) {
        if (!feature.geometry) {
            result.errors.push(`Feature ${index}: Missing geometry`);
            result.valid = false;
            return;
        }
        this.validateGeometry(feature.geometry, `Feature ${index}`, result);
    }

    /**
     * Validate geometry
     */
    validateGeometry(geometry, context, result) {
        // Check for self-intersections in Polygons
        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            const kinks = turf.kinks(geometry);
            if (kinks.features.length > 0) {
                result.errors.push(`${context}: Self-intersection detected (${kinks.features.length} points)`);
                result.valid = false;
            }
        }

        // Check for coordinate validity (basic range check)
        turf.coordEach(geometry, (coord) => {
            const [lon, lat] = coord;
            if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
                result.errors.push(`${context}: Coordinate out of bounds [${lon}, ${lat}]`);
                result.valid = false;
            }
        });
    }

    /**
     * Clean invalid geometry (attempt to fix)
     * @param {Object} geojson 
     */
    clean(geojson) {
        try {
            // Use turf.cleanCoords to remove duplicate points
            let cleaned = turf.cleanCoords(geojson);

            // Use turf.unkinkPolygon to fix self-intersections (returns FeatureCollection of polygons)
            if (cleaned.type === 'FeatureCollection') {
                cleaned.features = cleaned.features.map(f => {
                    if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
                        const unkinked = turf.unkinkPolygon(f);
                        // If unkinking resulted in multiple polygons, we might need to handle that
                        // For now, we just take the first one or return the unkinked collection if it was a single feature input
                        if (unkinked.features.length === 1) {
                            return unkinked.features[0];
                        }
                        // If it split into multiple, we might want to return them all, but that changes structure
                        // So we'll just return the original if unkinking splits it, but warn
                        return f;
                    }
                    return f;
                });
            }

            return cleaned;
        } catch (error) {
            logger.error(`[DataValidator] Cleaning failed:`, error);
            return geojson;
        }
    }
}

module.exports = DataValidator;
