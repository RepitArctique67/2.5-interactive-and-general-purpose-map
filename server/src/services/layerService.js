const Layer = require('../models/Layer');
const { AppError } = require('../middleware/errorHandler');
const { layerCache } = require('../utils/cache');
const logger = require('../utils/logger');

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
                is_active: true,
                is_historical: false,
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
                is_active: true,
                is_historical: false,
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
                is_active: false,
                is_historical: true,
                min_year: 1900,
                max_year: 2025,
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
                is_active: false,
                is_historical: false,
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
                        const layers = await Layer.findAll(filters);
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
                            sampleLayers = sampleLayers.filter(l => l.is_active === filters.is_active);
                        }
                        if (filters.is_historical !== undefined) {
                            sampleLayers = sampleLayers.filter(l => l.is_historical === filters.is_historical);
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
                    const layer = await Layer.findById(id);
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
            await this.findById(id);

            const layer = await Layer.update(id, layerData);

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
            await this.findById(id);

            // Vérifier qu'elle n'a pas de features
            const featureCount = await Layer.getFeatureCount(id);
            if (featureCount > 0) {
                throw new AppError(
                    `Impossible de supprimer: ${featureCount} entités liées`,
                    400
                );
            }

            await Layer.delete(id);

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
            const features = await GeoService.getFeaturesInBbox(
                bbox || [-180, -90, 180, 90],
                year,
                id
            );

            return {
                ...layer,
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
