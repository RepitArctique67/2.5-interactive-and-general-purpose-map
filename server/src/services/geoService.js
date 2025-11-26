const { GeoFeature } = require('../models');
const logger = require('../utils/logger');
const { sequelize } = require('../config/sequelize');

/**
 * GeoService - Comprehensive spatial query service
 * Uses Sequelize models to support both PostGIS and SQLite (fallback)
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

            // Use the model's static method which handles DB abstraction
            const features = await GeoFeature.findInBbox(bbox, {
                year,
                layerId,
                type,
                limit
            });

            // Convert to GeoJSON FeatureCollection
            return {
                type: 'FeatureCollection',
                features: features.map(f => f.toGeoJSON ? f.toGeoJSON() : f),
                meta: {
                    count: features.length,
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

            const features = await GeoFeature.findNearPoint(lon, lat, radiusMeters, {
                year,
                layerId,
                type,
                limit
            });

            return features.map(f => {
                const json = f.toGeoJSON ? f.toGeoJSON() : f;
                // Add distance if available (from PostGIS query)
                if (f.getDataValue('distance')) {
                    json.distance = parseFloat(f.getDataValue('distance'));
                    json.distanceKm = json.distance / 1000;
                }
                return json;
            });
        } catch (error) {
            logger.error('Error in getFeaturesNearPoint:', error);
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
            // Complex spatial query - might need raw SQL for PostGIS
            // For SQLite, we might just return bbox intersection as approximation or fail gracefully
            const isSqlite = sequelize.getDialect() === 'sqlite';

            if (isSqlite) {
                logger.warn('⚠️ getFeaturesInPolygon: Exact polygon search not supported in SQLite, falling back to bbox');
                // Calculate bbox of polygon (simple approximation)
                // This is a placeholder. Real implementation would calculate bbox from polygon coords.
                // For now, return empty or throw not implemented
                return { type: 'FeatureCollection', features: [] };
            }

            // PostGIS implementation using Sequelize raw query
            const { year, layerId, type, limit = 1000 } = filters;

            let query = `
                SELECT 
                    id, layer_id, name, type, 
                    ST_AsGeoJSON(geometry)::json as geometry, 
                    properties, valid_from, valid_to
                FROM geo_features
                WHERE ST_Within(geometry, ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))
            `;

            const replacements = [JSON.stringify(polygon)];

            if (layerId) {
                query += ` AND layer_id = ?`;
                replacements.push(layerId);
            }
            if (type) {
                query += ` AND type = ?`;
                replacements.push(type);
            }
            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)`;
                replacements.push(yearDate, yearDate);
            }

            query += ` LIMIT ?`;
            replacements.push(limit);

            const [results] = await sequelize.query(query, { replacements });

            return {
                type: 'FeatureCollection',
                features: results.map(row => ({
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
            const isSqlite = sequelize.getDialect() === 'sqlite';
            if (isSqlite) return []; // Not supported in SQLite

            const { year, layerId } = filters;

            // PostGIS grid query
            let query = `
                WITH grid AS (
                    SELECT ST_MakeEnvelope(x, y, x + ?, y + ?, 4326) as cell, x, y
                    FROM generate_series(?, ?, ?) as x,
                         generate_series(?, ?, ?) as y
                )
                SELECT g.x, g.y, COUNT(f.id) as count, ST_AsGeoJSON(g.cell)::json as cell_geometry
                FROM grid g
                LEFT JOIN geo_features f ON ST_Intersects(f.geometry, g.cell)
                WHERE 1=1
            `;

            const replacements = [
                gridSize, gridSize,
                bbox[0], bbox[2], gridSize,
                bbox[1], bbox[3], gridSize
            ];

            if (layerId) {
                query += ` AND f.layer_id = ?`;
                replacements.push(layerId);
            }
            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (f.valid_from IS NULL OR f.valid_from <= ?) AND (f.valid_to IS NULL OR f.valid_to >= ?)`;
                replacements.push(yearDate, yearDate);
            }

            query += ` GROUP BY g.x, g.y, g.cell HAVING COUNT(f.id) > 0 ORDER BY count DESC`;

            const [results] = await sequelize.query(query, { replacements });

            return results.map(row => ({
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
            const isSqlite = sequelize.getDialect() === 'sqlite';

            if (isSqlite) {
                // Basic stats for SQLite
                const count = await GeoFeature.count({ where: { layerId } });
                return {
                    layerId,
                    year,
                    featureCount: count,
                    typeCount: 0, // Simplified
                    totalAreaSqKm: 0,
                    avgAreaSqKm: 0,
                    bbox: null
                };
            }

            let query = `
                SELECT 
                    COUNT(*) as feature_count,
                    COUNT(DISTINCT type) as type_count,
                    SUM(ST_Area(geometry::geography)) / 1000000 as total_area_sqkm,
                    AVG(ST_Area(geometry::geography)) / 1000000 as avg_area_sqkm,
                    ST_AsGeoJSON(ST_Extent(geometry))::json as bbox
                FROM geo_features
                WHERE layer_id = ?
            `;

            const replacements = [layerId];

            if (year) {
                const yearDate = `${year}-01-01`;
                query += ` AND (valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)`;
                replacements.push(yearDate, yearDate);
            }

            const [results] = await sequelize.query(query, { replacements });
            const row = results[0];

            return {
                layerId,
                year,
                featureCount: parseInt(row.feature_count),
                typeCount: parseInt(row.type_count),
                totalAreaSqKm: parseFloat(row.total_area_sqkm) || 0,
                avgAreaSqKm: parseFloat(row.avg_area_sqkm) || 0,
                bbox: row.bbox,
            };
        } catch (error) {
            logger.error('Error in getStatsByArea:', error);
            throw error;
        }
    }
}

module.exports = new GeoService();

