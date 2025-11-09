// ==========================================
// SERVER/SRC/APP.JS - Point d'entrée principal
// ==========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Routes
const layerRoutes = require('./routes/layers');
const dataRoutes = require('./routes/data');
const timelineRoutes = require('./routes/timeline');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// MIDDLEWARES
// ==========================================

// Sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// ==========================================
// ROUTES
// ==========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/v1/layers', layerRoutes);
app.use('/api/v1/data', dataRoutes);
app.use('/api/v1/timeline', timelineRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Error Handler
app.use(errorHandler);

// ==========================================
// SERVER START
// ==========================================

app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  logger.info(`📍 Environnement: ${process.env.NODE_ENV}`);
  logger.info(`🌍 API disponible sur: http://localhost:${PORT}/api/v1`);
});

module.exports = app;


// ==========================================
// SERVER/SRC/CONFIG/DATABASE.JS
// ==========================================

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cartographie_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('✅ Connexion à la base de données établie');
});

pool.on('error', (err) => {
  logger.error('❌ Erreur base de données:', err);
  process.exit(-1);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('❌ Impossible de se connecter à la base:', err);
  } else {
    logger.info(`⏰ Timestamp DB: ${res.rows[0].now}`);
  }
});

module.exports = pool;


// ==========================================
// SERVER/SRC/MODELS/LAYER.JS
// ==========================================

const pool = require('../config/database');

class Layer {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM layers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.is_historical !== undefined) {
      query += ` AND is_historical = $${paramIndex}`;
      params.push(filters.is_historical);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(filters.is_active);
      paramIndex++;
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM layers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(layerData) {
    const query = `
      INSERT INTO layers (
        name, type, category, description, source_url,
        is_active, is_historical, min_year, max_year,
        zoom_min, zoom_max, opacity, config, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      layerData.name,
      layerData.type,
      layerData.category || null,
      layerData.description || null,
      layerData.source_url || null,
      layerData.is_active !== undefined ? layerData.is_active : true,
      layerData.is_historical || false,
      layerData.min_year || null,
      layerData.max_year || null,
      layerData.zoom_min || 0,
      layerData.zoom_max || 22,
      layerData.opacity || 1.0,
      JSON.stringify(layerData.config || {}),
      JSON.stringify(layerData.metadata || {})
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, layerData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(layerData).forEach(key => {
      if (layerData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(
          (key === 'config' || key === 'metadata') 
            ? JSON.stringify(layerData[key]) 
            : layerData[key]
        );
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE layers 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM layers WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getFeatureCount(layerId) {
    const query = 'SELECT COUNT(*) FROM geo_features WHERE layer_id = $1';
    const result = await pool.query(query, [layerId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Layer;


// ==========================================
// SERVER/SRC/SERVICES/LAYERSERVICE.JS
// ==========================================

const Layer = require('../models/Layer');
const { AppError } = require('../middleware/errorHandler');
const { layerCache } = require('../utils/cache');
const logger = require('../utils/logger');

class LayerService {
  async findAll(filters = {}) {
    try {
      const cacheKey = `layers:${JSON.stringify(filters)}`;
      
      return await layerCache.wrap(
        cacheKey,
        async () => {
          const layers = await Layer.findAll(filters);
          logger.info(`✅ ${layers.length} couches récupérées`);
          return layers;
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


// ==========================================
// SERVER/SRC/CONTROLLERS/LAYERCONTROLLER.JS
// ==========================================

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


// ==========================================
// SERVER/SRC/ROUTES/LAYERS.JS
// ==========================================

const express = require('express');
const router = express.Router();
const layerController = require('../controllers/layerController');
const { authenticate, authorize } = require('../middleware/auth');
const { layerValidators } = require('../middleware/validation');

// Routes publiques
router.get('/', layerController.getAll);
router.get('/:id', layerController.getById);
router.get('/:id/features', layerController.getFeatures);

// Routes protégées (admin)
router.post('/',
  authenticate,
  authorize('admin'),
  layerValidators.create,
  layerController.create
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  layerValidators.update,
  layerController.update
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  layerController.delete
);

module.exports = router;


// ==========================================
// SERVER/SRC/UTILS/LOGGER.JS
// ==========================================

const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'cartographie-api' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log')
    })
  ]
});

// En développement, logger aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Stream pour Morgan
logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger;
