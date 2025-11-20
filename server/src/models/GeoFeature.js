const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

/**
 * GeoFeature Model
 * Represents geospatial features with PostGIS geometry support
 */
const GeoFeature = sequelize.define('GeoFeature', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    layerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'layer_id',
        references: {
            model: 'layers',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['point', 'line', 'polygon', 'multipolygon', 'multipoint', 'multiline']],
        },
    },
    geometry: {
        type: DataTypes.GEOMETRY('GEOMETRY', 4326),
        allowNull: false,
    },
    properties: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
    validFrom: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'valid_from',
    },
    validTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'valid_to',
    },
}, {
    tableName: 'geo_features',
    timestamps: true,
    indexes: [
        {
            name: 'idx_geo_features_geometry',
            fields: ['geometry'],
            using: 'GIST',
        },
        {
            name: 'idx_geo_features_layer',
            fields: ['layer_id'],
        },
        {
            name: 'idx_geo_features_dates',
            fields: ['valid_from', 'valid_to'],
        },
        {
            name: 'idx_geo_features_type',
            fields: ['type'],
        },
    ],
    validate: {
        validDateRange() {
            if (this.validTo && this.validFrom && this.validTo < this.validFrom) {
                throw new Error('valid_to must be after valid_from');
            }
        },
    },
});

// Instance methods
GeoFeature.prototype.isValidAt = function (date) {
    const checkDate = new Date(date);
    const from = this.validFrom ? new Date(this.validFrom) : null;
    const to = this.validTo ? new Date(this.validTo) : null;

    if (from && checkDate < from) return false;
    if (to && checkDate > to) return false;
    return true;
};

GeoFeature.prototype.toGeoJSON = function () {
    return {
        type: 'Feature',
        id: this.id,
        geometry: this.geometry,
        properties: {
            name: this.name,
            type: this.type,
            layerId: this.layerId,
            validFrom: this.validFrom,
            validTo: this.validTo,
            ...this.properties,
        },
    };
};

// Class methods / Scopes
GeoFeature.addScope('current', {
    where: {
        validTo: null,
    },
});

GeoFeature.addScope('historical', {
    where: {
        validTo: {
            [sequelize.Sequelize.Op.ne]: null,
        },
    },
});

GeoFeature.addScope('validAt', (date) => ({
    where: {
        [sequelize.Sequelize.Op.or]: [
            { validFrom: null },
            { validFrom: { [sequelize.Sequelize.Op.lte]: date } },
        ],
        [sequelize.Sequelize.Op.or]: [
            { validTo: null },
            { validTo: { [sequelize.Sequelize.Op.gte]: date } },
        ],
    },
}));

// Static method for spatial queries
GeoFeature.findInBbox = async function (bbox, options = {}) {
    const { layerId, year, type } = options;

    const where = {
        geometry: sequelize.fn(
            'ST_Intersects',
            sequelize.col('geometry'),
            sequelize.fn(
                'ST_MakeEnvelope',
                bbox[0], bbox[1], bbox[2], bbox[3],
                4326
            )
        ),
    };

    if (layerId) where.layerId = layerId;
    if (type) where.type = type;

    // Add temporal filter if year provided
    if (year) {
        const yearDate = new Date(`${year}-01-01`);
        where[sequelize.Sequelize.Op.or] = [
            { validFrom: null },
            { validFrom: { [sequelize.Sequelize.Op.lte]: yearDate } },
        ];
        where[sequelize.Sequelize.Op.and] = [
            {
                [sequelize.Sequelize.Op.or]: [
                    { validTo: null },
                    { validTo: { [sequelize.Sequelize.Op.gte]: yearDate } },
                ],
            },
        ];
    }

    return await this.findAll({ where });
};

GeoFeature.findNearPoint = async function (lon, lat, radiusMeters, options = {}) {
    const { layerId, year, limit = 50 } = options;

    const where = {
        geometry: sequelize.fn(
            'ST_DWithin',
            sequelize.cast(sequelize.col('geometry'), 'geography'),
            sequelize.cast(
                sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lon, lat), 4326),
                'geography'
            ),
            radiusMeters
        ),
    };

    if (layerId) where.layerId = layerId;

    if (year) {
        const yearDate = new Date(`${year}-01-01`);
        where[sequelize.Sequelize.Op.or] = [
            { validFrom: null },
            { validFrom: { [sequelize.Sequelize.Op.lte]: yearDate } },
        ];
    }

    return await this.findAll({
        where,
        attributes: {
            include: [
                [
                    sequelize.fn(
                        'ST_Distance',
                        sequelize.cast(sequelize.col('geometry'), 'geography'),
                        sequelize.cast(
                            sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lon, lat), 4326),
                            'geography'
                        )
                    ),
                    'distance',
                ],
            ],
        },
        order: [[sequelize.literal('distance'), 'ASC']],
        limit,
    });
};

module.exports = GeoFeature;
