const proj4 = require('proj4');
const logger = require('../utils/logger');

/**
 * Coordinate Transformer
 * Transforms coordinates between different projections using proj4
 */
class CoordinateTransformer {
    constructor(config = {}) {
        this.config = config;

        // Define common projections
        this.defs = {
            'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',
            'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            // Add more as needed
            ...config.projections
        };

        // Register definitions
        Object.keys(this.defs).forEach(code => {
            proj4.defs(code, this.defs[code]);
        });
    }

    /**
     * Transform GeoJSON coordinates
     * @param {Object} geojson - GeoJSON object
     * @param {String} fromCRS - Source CRS code (e.g., 'EPSG:3857')
     * @param {String} toCRS - Target CRS code (default 'EPSG:4326')
     * @returns {Object} Transformed GeoJSON
     */
    process(geojson, fromCRS, toCRS = 'EPSG:4326') {
        try {
            if (!proj4.defs(fromCRS)) {
                throw new Error(`Unknown source CRS: ${fromCRS}`);
            }
            if (!proj4.defs(toCRS)) {
                throw new Error(`Unknown target CRS: ${toCRS}`);
            }

            logger.info(`[CoordinateTransformer] Transforming from ${fromCRS} to ${toCRS}`);

            // Create transformer function
            const transformer = proj4(fromCRS, toCRS);

            // Deep clone to avoid mutating original
            const transformed = JSON.parse(JSON.stringify(geojson));

            // Recursive function to transform coordinates
            const transformCoords = (coords) => {
                if (typeof coords[0] === 'number') {
                    return transformer.forward(coords);
                }
                return coords.map(transformCoords);
            };

            // Traverse GeoJSON
            const traverse = (obj) => {
                if (obj.type === 'FeatureCollection') {
                    obj.features.forEach(traverse);
                } else if (obj.type === 'Feature') {
                    if (obj.geometry) traverse(obj.geometry);
                } else if (obj.geometry) {
                    // GeometryCollection
                    traverse(obj.geometry);
                } else if (obj.coordinates) {
                    obj.coordinates = transformCoords(obj.coordinates);
                } else if (obj.geometries) {
                    // GeometryCollection geometries array
                    obj.geometries.forEach(traverse);
                }
            };

            traverse(transformed);

            // Update CRS property if it exists
            if (!transformed.crs) {
                transformed.crs = {
                    type: 'name',
                    properties: { name: toCRS }
                };
            } else {
                transformed.crs.properties.name = toCRS;
            }

            return transformed;
        } catch (error) {
            logger.error(`[CoordinateTransformer] Transformation failed:`, error);
            throw error;
        }
    }
}

module.exports = CoordinateTransformer;
