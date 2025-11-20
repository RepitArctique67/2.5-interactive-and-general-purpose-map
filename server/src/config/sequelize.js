const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Create Sequelize instance with PostGIS support
const sequelize = new Sequelize(
    process.env.DB_NAME || 'cartographie_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres123',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
            // Enable PostGIS extension
            application_name: 'cartographie_app',
        },
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 20,
            min: parseInt(process.env.DB_POOL_MIN) || 5,
            acquire: 30000,
            idle: 10000,
        },
        logging: (msg) => {
            if (process.env.NODE_ENV === 'development') {
                logger.debug(msg);
            }
        },
        define: {
            // Use snake_case for database columns
            underscored: true,
            // Add timestamps by default
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        // Timezone configuration
        timezone: '+00:00',
    }
);

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Sequelize: Database connection established successfully');

        // Verify PostGIS extension
        const [results] = await sequelize.query('SELECT PostGIS_Version();');
        logger.info(`✅ PostGIS version: ${results[0].postgis_version}`);

        return true;
    } catch (error) {
        logger.error('❌ Sequelize: Unable to connect to database:', error);
        return false;
    }
};

// Sync models (use with caution in production)
const syncModels = async (options = {}) => {
    try {
        await sequelize.sync(options);
        logger.info('✅ Sequelize: Models synchronized successfully');
    } catch (error) {
        logger.error('❌ Sequelize: Model synchronization failed:', error);
        throw error;
    }
};

// Close database connection
const closeConnection = async () => {
    try {
        await sequelize.close();
        logger.info('✅ Sequelize: Database connection closed');
    } catch (error) {
        logger.error('❌ Sequelize: Error closing connection:', error);
    }
};

module.exports = {
    sequelize,
    Sequelize,
    testConnection,
    syncModels,
    closeConnection,
};
