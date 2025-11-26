const geoService = require('../services/geoService');
const { AppError } = require('../middleware/errorHandler');

const dataController = {
    /**
     * GET /api/v1/data/features
     * Get features within a bounding box
     */
    async getFeatures(req, res, next) {
        try {
            const { bbox, year, layerId, type, limit } = req.query;

            if (!bbox) {
                return next(new AppError('Bbox parameter is required [minLon,minLat,maxLon,maxLat]', 400));
            }

            const bboxArray = bbox.split(',').map(Number);
            if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
                return next(new AppError('Invalid bbox format', 400));
            }

            const filters = {
                year: year ? parseInt(year) : undefined,
                layerId: layerId ? parseInt(layerId) : undefined,
                type,
                limit: limit ? parseInt(limit) : undefined
            };

            const result = await geoService.getFeaturesInBbox(bboxArray, filters);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/data/nearby
     * Get features near a location
     */
    async getNearby(req, res, next) {
        try {
            const { lon, lat, radius, year, layerId, type, limit } = req.query;

            if (!lon || !lat) {
                return next(new AppError('lon and lat parameters are required', 400));
            }

            const longitude = parseFloat(lon);
            const latitude = parseFloat(lat);
            const radiusMeters = radius ? parseFloat(radius) : 1000; // Default 1km

            const filters = {
                year: year ? parseInt(year) : undefined,
                layerId: layerId ? parseInt(layerId) : undefined,
                type,
                limit: limit ? parseInt(limit) : undefined
            };

            const features = await geoService.getFeaturesNearPoint(
                longitude,
                latitude,
                radiusMeters,
                filters
            );

            res.json({
                success: true,
                data: features
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/data/polygon
     * Get features within a polygon
     */
    async getInPolygon(req, res, next) {
        try {
            const { polygon } = req.body;
            const { year, layerId, type, limit } = req.query;

            if (!polygon) {
                return next(new AppError('Polygon geometry is required in body', 400));
            }

            const filters = {
                year: year ? parseInt(year) : undefined,
                layerId: layerId ? parseInt(layerId) : undefined,
                type,
                limit: limit ? parseInt(limit) : undefined
            };

            const result = await geoService.getFeaturesInPolygon(polygon, filters);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/data/heatmap
     * Get heatmap data
     */
    async getHeatmap(req, res, next) {
        try {
            const { bbox, gridSize, year, layerId } = req.query;

            if (!bbox) {
                return next(new AppError('Bbox parameter is required', 400));
            }

            const bboxArray = bbox.split(',').map(Number);
            const gridSizeVal = gridSize ? parseFloat(gridSize) : 0.1;

            const filters = {
                year: year ? parseInt(year) : undefined,
                layerId: layerId ? parseInt(layerId) : undefined
            };

            const data = await geoService.getHeatmapData(bboxArray, gridSizeVal, filters);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/data/stats
     * Get statistics for a layer/area
     */
    async getStats(req, res, next) {
        try {
            const { layerId, year } = req.query;

            if (!layerId) {
                return next(new AppError('layerId parameter is required', 400));
            }

            const stats = await geoService.getStatsByArea(
                parseInt(layerId),
                year ? parseInt(year) : undefined
            );

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = dataController;
