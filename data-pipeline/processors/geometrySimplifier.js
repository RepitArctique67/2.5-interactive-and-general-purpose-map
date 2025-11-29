const turf = require('@turf/turf');
const logger = require('../utils/logger');

/**
 * Geometry Simplifier
 * Simplifies GeoJSON geometries using Douglas-Peucker or Visvalingam algorithms
 */
class GeometrySimplifier {
    constructor(config = {}) {
        this.config = config;
        this.defaultTolerance = config.tolerance || 0.001; // degrees
        this.highQuality = config.highQuality !== false;
    }

    /**
     * Simplify GeoJSON data
     * @param {Object} geojson - GeoJSON Feature or FeatureCollection
     * @param {Object} options - Simplification options
     * @returns {Object} Simplified GeoJSON
     */
    process(geojson, options = {}) {
        try {
            const tolerance = options.tolerance || this.defaultTolerance;
            const highQuality = options.highQuality !== undefined ? options.highQuality : this.highQuality;

            logger.info(`[GeometrySimplifier] Simplifying with tolerance ${tolerance}`);

            // Clean coordinates first (remove duplicates, etc.)
            const cleaned = turf.cleanCoords(geojson);

            // Simplify
            const simplified = turf.simplify(cleaned, {
                tolerance: tolerance,
                highQuality: highQuality,
                mutate: false // Return new object
            });

            // Calculate reduction
            const originalPoints = this.countPoints(geojson);
            const newPoints = this.countPoints(simplified);
            const reduction = ((1 - newPoints / originalPoints) * 100).toFixed(2);

            logger.info(`[GeometrySimplifier] Reduced points from ${originalPoints} to ${newPoints} (${reduction}%)`);

            return simplified;
        } catch (error) {
            logger.error(`[GeometrySimplifier] Simplification failed:`, error);
            throw error;
        }
    }

    /**
     * Count total points in GeoJSON
     */
    countPoints(geojson) {
        let count = 0;
        turf.coordEach(geojson, () => {
            count++;
        });
        return count;
    }
}

module.exports = GeometrySimplifier;
