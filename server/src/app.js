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

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📍 Environnement: ${process.env.NODE_ENV}`);
    logger.info(`🌍 API disponible sur: http://localhost:${PORT}/api/v1`);
  });
}

module.exports = app;
