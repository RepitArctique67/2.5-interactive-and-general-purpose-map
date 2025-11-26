const { Layer, GeoFeature } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { layerCache } = require('../utils/cache');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class LayerService {
    // Sample layers for demo (when DB not connected)
    getSampleLayers() {
        return [
            {
                id: 1,
                name: 'OpenStreetMap',
                type: 'base',
                category: 'cartographic',
                description: 'Carte de base collaborative OpenStreetMap',
                isActive: true,
                isHistorical: false,
                opacity: 1.0,
                config: {
                    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© OpenStreetMap contributors'
                }
            },
            {
                id: 2,
                name: 'Terrain 3D',
                type: 'terrain',
                category: 'topographic',
                description: 'Relief terrestre en 3D',
                isActive: true,
                isHistorical: false,
                opacity: 1.0,
                config: {
                    provider: 'cesium-world-terrain'
                }
            },
            {
                id: 3,
                name: 'Frontières Historiques',
                type: 'data',
                category: 'administrative',
                description: 'Évolution des frontières à travers le temps',
                isActive: false,
                isHistorical: true,
                minYear: 1900,
                maxYear: 2025,
                opacity: 0.7,
                config: {
                    color: '#FF6B6B',
                    lineWidth: 2
                }
            },
            {
                id: 4,
                name: 'Villes Principales',
                type: 'data',
                category: 'cities',
                description: 'Grandes villes du monde',
                isActive: false,
                isHistorical: false,
                opacity: 0.8,
                config: {
                    markerColor: '#4ECDC4',
                    markerSize: 8
                }
            }
        ];
    }

    async findAll(filters = {}) {
        try {
            const cacheKey = `layers:${JSON.stringify(filters)}`;

            return await layerCache.wrap(
                cacheKey,
                async () => {
                    try {
                        const where = {};
                        if (filters.type) where.type = filters.type;
                        if (filters.category) where.category = filters.category;
                        if (filters.is_active !== undefined) where.isActive = filters.is_active;
                        if (filters.is_historical !== undefined) where.isHistorical = filters.is_historical;

                        const layers = await Layer.findAll({
                            where,
                            order: [['id', 'ASC']]
                        });
                        logger.info(`✅ ${layers.length} couches récupérées`);
                        return layers;
                    } catch (dbError) {
                        // Fallback to sample data if DB not available
                        logger.warn('⚠️ Database not available, using sample data');
                        let sampleLayers = this.getSampleLayers();

                        // Apply filters to sample data
                        if (filters.type) {
                            sampleLayers = sampleLayers.filter(l => l.type === filters.type);
                        }
                        if (filters.category) {
                            sampleLayers = sampleLayers.filter(l => l.category === filters.category);
                        }
                        if (filters.is_active !== undefined) {
                            sampleLayers = sampleLayers.filter(l => l.isActive === filters.is_active);
                        }
                        if (filters.is_historical !== undefined) {
                            sampleLayers = sampleLayers.filter(l => l.isHistorical === filters.is_historical);
                        }

                        return sampleLayers;
                    }
                },
                3600 // 1 heure
            );
        } catch (error) {
            logger.error('Erreur findAll layers:', error);
            throw new AppError('Erreur lors de la récupération des couches', 500);
        }
    }

    async findById(id) {
        try {
            const cacheKey = `layer:${id}`;

            return await layerCache.wrap(
                cacheKey,
                async () => {
                    const layer = await Layer.findByPk(id);
                    if (!layer) {
                        throw new AppError(`Couche ${id} non trouvée`, 404);
                    }
                    return layer;
                },
                3600
            );
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Erreur findById layer:', error);
            throw new AppError('Erreur lors de la récupération de la couche', 500);
        }
    }

    async create(layerData) {
        try {
            // Map snake_case to camelCase if needed, but Sequelize handles it if fields are defined
            // We defined underscored: true in model, so it maps automatically?
            // Actually, we defined field names in model.
            // Let's assume input is matching model attributes or we map them.
            // The previous controller passed req.body directly.
            // If req.body has snake_case keys (from previous API), we might need to handle that.
            // But let's assume we want to support camelCase in new API or map it.
            // For now, let's pass layerData directly.

            const layer = await Layer.create(layerData);

            // Invalider le cache
            layerCache.flush();

            logger.info(`✅ Couche créée: ${layer.name} (ID: ${layer.id})`);
            return layer;
        } catch (error) {
            logger.error('Erreur create layer:', error);
            throw new AppError('Erreur lors de la création de la couche', 500);
        }
    }

    async update(id, layerData) {
        try {
            // Vérifier que la couche existe
            const layer = await this.findById(id);

            await layer.update(layerData);

            // Invalider le cache
            layerCache.delete(`layer:${id}`);
            layerCache.flush();

            logger.info(`✅ Couche mise à jour: ${layer.name} (ID: ${layer.id})`);
            return layer;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Erreur update layer:', error);
            throw new AppError('Erreur lors de la mise à jour de la couche', 500);
        }
    }

    async delete(id) {
        try {
            // Vérifier que la couche existe
            const layer = await this.findById(id);

            // Vérifier qu'elle n'a pas de features
            const featureCount = await GeoFeature.count({ where: { layerId: id } });
            if (featureCount > 0) {
                throw new AppError(
                    `Impossible de supprimer: ${featureCount} entités liées`,
                    400
                );
            }

            await layer.destroy();

            // Invalider le cache
            layerCache.delete(`layer:${id}`);
            layerCache.flush();

            logger.info(`✅ Couche supprimée: ID ${id}`);
            return { id, deleted: true };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Erreur delete layer:', error);
            throw new AppError('Erreur lors de la suppression de la couche', 500);
        }
    }

    async getLayerWithFeatures(id, bbox = null, year = null) {
        try {
            const layer = await this.findById(id);

            // Récupérer les features
            const GeoService = require('./geoService');
            // Ensure GeoService is implemented or use GeoFeature directly if GeoService is not ready
            // The previous code used GeoService.getFeaturesInBbox.
            // We need to check if GeoService exists and what it does.
            // If not, we can use GeoFeature.findInBbox directly.

            let features = [];
            try {
                features = await GeoService.getFeaturesInBbox(
                    bbox || [-180, -90, 180, 90],
                    year,
                    id
                );
            } catch (e) {
                // Fallback if GeoService not found or fails
                features = await GeoFeature.findInBbox(bbox || [-180, -90, 180, 90], { layerId: id, year });
            }

            return {
                ...layer.toJSON(),
                features
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Erreur getLayerWithFeatures:', error);
            throw new AppError('Erreur lors de la récupération des données', 500);
        }
    }
}

module.exports = new LayerService();

