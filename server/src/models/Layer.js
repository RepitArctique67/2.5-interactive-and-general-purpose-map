const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

/**
 * Layer Model
 * Represents a map layer configuration
 */
const Layer = sequelize.define('Layer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // e.g., 'base', 'data', 'terrain'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        // e.g., 'cartographic', 'topographic', 'administrative'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sourceUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true,
        field: 'source_url',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
    },
    isHistorical: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_historical',
    },
    minYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'min_year',
    },
    maxYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_year',
    },
    zoomMin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'zoom_min',
    },
    zoomMax: {
        type: DataTypes.INTEGER,
        defaultValue: 22,
        field: 'zoom_max',
    },
    opacity: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0,
        validate: {
            min: 0,
            max: 1,
        },
    },
    config: {
        type: DataTypes.JSON,
        defaultValue: {},
        // Stores specific layer config (color, style, etc.)
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        // Stores extra metadata
    },
}, {
    tableName: 'layers',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['type'],
        },
        {
            fields: ['category'],
        },
        {
            fields: ['is_active'],
        },
    ],
});

// Associations
Layer.associate = (models) => {
    Layer.hasMany(models.GeoFeature, {
        foreignKey: 'layerId',
        as: 'features',
        onDelete: 'CASCADE',
    });
};

module.exports = Layer;

