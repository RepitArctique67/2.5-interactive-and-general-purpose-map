const layerService = require('../services/layerService');
const { AppError } = require('../middleware/errorHandler');

const layerController = {
    /**
     * GET /api/v1/layers
     * Récupère toutes les couches
     */
    async getAll(req, res, next) {
        try {
            const filters = {
                type: req.query.type,
                category: req.query.category,
                is_active: req.query.is_active === 'true' ? true :
                    req.query.is_active === 'false' ? false : undefined,
                is_historical: req.query.is_historical === 'true' ? true :
                    req.query.is_historical === 'false' ? false : undefined
            };

            const layers = await layerService.findAll(filters);

            res.json({
                success: true,
                data: layers,
                meta: {
                    total: layers.length,
                    filters: Object.keys(filters).filter(k => filters[k] !== undefined)
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/layers/:id
     * Récupère une couche par ID
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const layer = await layerService.findById(id);

            res.json({
                success: true,
                data: layer
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/layers
     * Crée une nouvelle couche (admin only)
     */
    async create(req, res, next) {
        try {
            const layer = await layerService.create(req.body);

            res.status(201).json({
                success: true,
                data: layer,
                message: 'Couche créée avec succès'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/layers/:id
     * Met à jour une couche (admin only)
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const layer = await layerService.update(id, req.body);

            res.json({
                success: true,
                data: layer,
                message: 'Couche mise à jour avec succès'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/v1/layers/:id
     * Supprime une couche (admin only)
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await layerService.delete(id);

            res.json({
                success: true,
                message: 'Couche supprimée avec succès'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/layers/:id/features
     * Récupère les features d'une couche
     */
    async getFeatures(req, res, next) {
        try {
            const { id } = req.params;
            const { bbox, year } = req.query;

            const bboxArray = bbox ? bbox.split(',').map(Number) : null;
            const yearNumber = year ? parseInt(year) : null;

            const result = await layerService.getLayerWithFeatures(
                id,
                bboxArray,
                yearNumber
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = layerController;
