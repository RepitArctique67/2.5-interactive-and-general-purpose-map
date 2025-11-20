const pool = require('../config/database');
const { GeoFeature } = require('../models');
const logger = require('../utils/logger');

/**
 * GeoService - Comprehensive spatial query service using PostGIS
 */
class GeoService {
    /**
     * Get features within a bounding box
     * @param {Array} bbox - [minLon, minLat, maxLon, maxLat]
     * @param {Object} filters - { year, layerId, type, limit }
     * @returns {Object} GeoJSON FeatureCollection
     */
    async getFeaturesInBbox(bbox, filters = {}) {
        try {
            const { year, layerId, type, limit = 1000 } = filters;

            let query = `
                SELECT 
                    id,
                    layer_id,
                    name,
                    type,
                    ST_AsGeoJSON(geometry)::json as geometry,
                    properties,
                    valid_from,
                    valid_to
                FROM geo_features
                WHERE ST_Intersects(
                    geometry,
                    ST_MakeEnvelope($1, $2, $3, $4, 4326)
                )
            `;

            const params = [bbox[0], bbox[1], bbox[2], bbox[3]];
            let paramIndex = 5;

            // Add layer filter
            if (layerId) {
                query += ` AND layer_id = $${paramIndex}`;
                params.push(layerId);
                paramIndex++;
            }

            // Add type filter
            if (type) {
                query += ` AND type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }

            // Add temporal filter
            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
                query += ` AND (valid_to IS NULL OR valid_to >= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
            }

            query += ` LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await pool.query(query, params);

            // Convert to GeoJSON FeatureCollection
            return {
                type: 'FeatureCollection',
                features: result.rows.map(row => ({
                    type: 'Feature',
                    id: row.id,
                    geometry: row.geometry,
                    properties: {
                        name: row.name,
                        type: row.type,
                        layerId: row.layer_id,
                        validFrom: row.valid_from,
                        validTo: row.valid_to,
                        ...row.properties,
                    },
                })),
                meta: {
                    count: result.rows.length,
                    bbox,
                    filters,
                },
            };
        } catch (error) {
            logger.error('Error in getFeaturesInBbox:', error);
            throw error;
        }
    }

    /**
     * Get features near a point within a radius
     * @param {Number} lon - Longitude
     * @param {Number} lat - Latitude
     * @param {Number} radiusMeters - Radius in meters
     * @param {Object} filters - { year, layerId, type, limit }
     * @returns {Array} Features with distance
     */
    async getFeaturesNearPoint(lon, lat, radiusMeters, filters = {}) {
        try {
            const { year, layerId, type, limit = 50 } = filters;

            let query = `
                SELECT 
                    id,
                    layer_id,
                    name,
                    type,
                    ST_AsGeoJSON(geometry)::json as geometry,
                    properties,
                    valid_from,
                    valid_to,
                    ST_Distance(
                        geometry::geography,
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                    ) as distance
                FROM geo_features
                WHERE ST_DWithin(
                    geometry::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                    $3
                )
            `;

            const params = [lon, lat, radiusMeters];
            let paramIndex = 4;

            if (layerId) {
                query += ` AND layer_id = $${paramIndex}`;
                params.push(layerId);
                paramIndex++;
            }

            if (type) {
                query += ` AND type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }

            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
                query += ` AND (valid_to IS NULL OR valid_to >= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
            }

            query += ` ORDER BY distance LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await pool.query(query, params);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                type: row.type,
                layerId: row.layer_id,
                geometry: row.geometry,
                properties: row.properties,
                distance: parseFloat(row.distance),
                distanceKm: parseFloat(row.distance) / 1000,
            }));
        } catch (error) {
            logger.error('Error in getFeaturesNearPoint:', error);
            throw error;
        }
    }

    /**
     * Calculate area of a feature
     * @param {Number} featureId - Feature ID
     * @param {String} unit - 'sqm', 'sqkm', 'hectares'
     * @returns {Object} Area information
     */
    async calculateFeatureArea(featureId, unit = 'sqkm') {
        try {
            const query = `
                SELECT 
                    id,
                    name,
                    type,
                    ST_Area(geometry::geography) as area_sqm,
                    ST_Area(geometry::geography) / 1000000 as area_sqkm,
                    ST_Area(geometry::geography) / 10000 as area_hectares
                FROM geo_features
                WHERE id = $1
            `;

            const result = await pool.query(query, [featureId]);

            if (result.rows.length === 0) {
                throw new Error(`Feature ${featureId} not found`);
            }

            const row = result.rows[0];

            return {
                featureId: row.id,
                name: row.name,
                type: row.type,
                area: {
                    squareMeters: parseFloat(row.area_sqm),
                    squareKilometers: parseFloat(row.area_sqkm),
                    hectares: parseFloat(row.area_hectares),
                },
                unit,
                value: parseFloat(row[`area_${unit}`]),
            };
        } catch (error) {
            logger.error('Error in calculateFeatureArea:', error);
            throw error;
        }
    }

    /**
     * Transform geometry to different SRID
     * @param {Object} geometry - GeoJSON geometry
     * @param {Number} fromSRID - Source SRID
     * @param {Number} toSRID - Target SRID
     * @returns {Object} Transformed geometry
     */
    async transformGeometry(geometry, fromSRID = 4326, toSRID = 3857) {
        try {
            const query = `
                SELECT ST_AsGeoJSON(
                    ST_Transform(
                        ST_SetSRID(ST_GeomFromGeoJSON($1), $2),
                        $3
                    )
                )::json as geometry
            `;

            const result = await pool.query(query, [
                JSON.stringify(geometry),
                fromSRID,
                toSRID,
            ]);

            return result.rows[0].geometry;
        } catch (error) {
            logger.error('Error in transformGeometry:', error);
            throw error;
        }
    }

    /**
     * Simplify geometry
     * @param {Number} featureId - Feature ID
     * @param {Number} tolerance - Simplification tolerance
     * @returns {Object} Simplified geometry
     */
    async simplifyGeometry(featureId, tolerance = 0.001) {
        try {
            const query = `
                SELECT ST_AsGeoJSON(
                    ST_Simplify(geometry, $2)
                )::json as geometry
                FROM geo_features
                WHERE id = $1
            `;

            const result = await pool.query(query, [featureId, tolerance]);

            if (result.rows.length === 0) {
                throw new Error(`Feature ${featureId} not found`);
            }

            return result.rows[0].geometry;
        } catch (error) {
            logger.error('Error in simplifyGeometry:', error);
            throw error;
        }
    }

    /**
     * Create buffer around geometry
     * @param {Number} featureId - Feature ID
     * @param {Number} distanceMeters - Buffer distance in meters
     * @returns {Object} Buffered geometry
     */
    async bufferGeometry(featureId, distanceMeters) {
        try {
            const query = `
                SELECT ST_AsGeoJSON(
                    ST_Transform(
                        ST_Buffer(geometry::geography, $2)::geometry,
                        4326
                    )
                )::json as geometry
                FROM geo_features
                WHERE id = $1
            `;

            const result = await pool.query(query, [featureId, distanceMeters]);

            if (result.rows.length === 0) {
                throw new Error(`Feature ${featureId} not found`);
            }

            return result.rows[0].geometry;
        } catch (error) {
            logger.error('Error in bufferGeometry:', error);
            throw error;
        }
    }

    /**
     * Get centroid of geometry
     * @param {Number} featureId - Feature ID
     * @returns {Object} Centroid point
     */
    async centroidOfGeometry(featureId) {
        try {
            const query = `
                SELECT ST_AsGeoJSON(
                    ST_Centroid(geometry)
                )::json as centroid
                FROM geo_features
                WHERE id = $1
            `;

            const result = await pool.query(query, [featureId]);

            if (result.rows.length === 0) {
                throw new Error(`Feature ${featureId} not found`);
            }

            return result.rows[0].centroid;
        } catch (error) {
            logger.error('Error in centroidOfGeometry:', error);
            throw error;
        }
    }

    /**
     * Get features within a polygon
     * @param {Object} polygon - GeoJSON polygon
     * @param {Object} filters - { year, layerId, type }
     * @returns {Object} GeoJSON FeatureCollection
     */
    async getFeaturesInPolygon(polygon, filters = {}) {
        try {
            const { year, layerId, type, limit = 1000 } = filters;

            let query = `
                SELECT 
                    id,
                    layer_id,
                    name,
                    type,
                    ST_AsGeoJSON(geometry)::json as geometry,
                    properties,
                    valid_from,
                    valid_to
                FROM geo_features
                WHERE ST_Within(
                    geometry,
                    ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
                )
            `;

            const params = [JSON.stringify(polygon)];
            let paramIndex = 2;

            if (layerId) {
                query += ` AND layer_id = $${paramIndex}`;
                params.push(layerId);
                paramIndex++;
            }

            if (type) {
                query += ` AND type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }

            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
                query += ` AND (valid_to IS NULL OR valid_to >= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
            }

            query += ` LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await pool.query(query, params);

            return {
                type: 'FeatureCollection',
                features: result.rows.map(row => ({
                    type: 'Feature',
                    id: row.id,
                    geometry: row.geometry,
                    properties: {
                        name: row.name,
                        type: row.type,
                        layerId: row.layer_id,
                        ...row.properties,
                    },
                })),
            };
        } catch (error) {
            logger.error('Error in getFeaturesInPolygon:', error);
            throw error;
        }
    }

    /**
     * Get heatmap data for visualization
     * @param {Array} bbox - Bounding box
     * @param {Number} gridSize - Grid cell size in degrees
     * @param {Object} filters - { year, layerId }
     * @returns {Array} Grid cells with counts
     */
    async getHeatmapData(bbox, gridSize = 0.1, filters = {}) {
        try {
            const { year, layerId } = filters;

            let query = `
                WITH grid AS (
                    SELECT 
                        ST_MakeEnvelope(
                            x, y,
                            x + $5, y + $5,
                            4326
                        ) as cell,
                        x, y
                    FROM generate_series($1, $3, $5) as x,
                         generate_series($2, $4, $5) as y
                )
                SELECT 
                    g.x,
                    g.y,
                    COUNT(f.id) as count,
                    ST_AsGeoJSON(g.cell)::json as cell_geometry
                FROM grid g
                LEFT JOIN geo_features f ON ST_Intersects(f.geometry, g.cell)
            `;

            const params = [bbox[0], bbox[1], bbox[2], bbox[3], gridSize];
            let paramIndex = 6;

            if (layerId) {
                query += ` AND f.layer_id = $${paramIndex}`;
                params.push(layerId);
                paramIndex++;
            }

            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (f.valid_from IS NULL OR f.valid_from <= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
                query += ` AND (f.valid_to IS NULL OR f.valid_to >= $${paramIndex})`;
                params.push(yearDate);
                paramIndex++;
            }

            query += ` GROUP BY g.x, g.y, g.cell HAVING COUNT(f.id) > 0 ORDER BY count DESC`;

            const result = await pool.query(query, params);

            return result.rows.map(row => ({
                x: parseFloat(row.x),
                y: parseFloat(row.y),
                count: parseInt(row.count),
                geometry: row.cell_geometry,
            }));
        } catch (error) {
            logger.error('Error in getHeatmapData:', error);
            throw error;
        }
    }

    /**
     * Get statistics by area
     * @param {Number} layerId - Layer ID
     * @param {Number} year - Year filter
     * @returns {Object} Statistics
     */
    async getStatsByArea(layerId, year = null) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as feature_count,
                    COUNT(DISTINCT type) as type_count,
                    SUM(ST_Area(geometry::geography)) / 1000000 as total_area_sqkm,
                    AVG(ST_Area(geometry::geography)) / 1000000 as avg_area_sqkm,
                    ST_AsGeoJSON(ST_Extent(geometry))::json as bbox
                FROM geo_features
                WHERE layer_id = $1
            `;

            const params = [layerId];

            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= $2)`;
                query += ` AND (valid_to IS NULL OR valid_to >= $2)`;
                params.push(yearDate);
            }

            const result = await pool.query(query, params);

            return {
                layerId,
                year,
                featureCount: parseInt(result.rows[0].feature_count),
                typeCount: parseInt(result.rows[0].type_count),
                totalAreaSqKm: parseFloat(result.rows[0].total_area_sqkm) || 0,
                avgAreaSqKm: parseFloat(result.rows[0].avg_area_sqkm) || 0,
                bbox: result.rows[0].bbox,
            };
        } catch (error) {
            logger.error('Error in getStatsByArea:', error);
            throw error;
        }
    }
}

module.exports = new GeoService();
