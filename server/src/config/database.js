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
