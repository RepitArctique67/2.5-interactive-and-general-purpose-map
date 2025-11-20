const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

/**
 * TimelineEvent Model
 * Represents historical events with temporal and spatial information
 */
const TimelineEvent = sequelize.define('TimelineEvent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 255],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'event_date',
    },
    eventType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'event_type',
        validate: {
            isIn: [[
                'political', 'natural', 'cultural', 'economic',
                'military', 'scientific', 'technological', 'social'
            ]],
        },
    },
    location: {
        type: DataTypes.GEOMETRY('POINT', 4326),
        allowNull: true,
    },
    relatedLayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'related_layer_id',
        references: {
            model: 'layers',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'image_url',
        validate: {
            isUrl: true,
        },
    },
    sourceUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'source_url',
        validate: {
            isUrl: true,
        },
    },
    importance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
            min: 1,
            max: 10,
        },
    },
}, {
    tableName: 'timeline_events',
    timestamps: true,
    indexes: [
        {
            name: 'idx_timeline_location',
            fields: ['location'],
            using: 'GIST',
        },
        {
            name: 'idx_timeline_date',
            fields: ['event_date'],
        },
        {
            name: 'idx_timeline_type',
            fields: ['event_type'],
        },
        {
            name: 'idx_timeline_importance',
            fields: [{ name: 'importance', order: 'DESC' }],
        },
    ],
});

// Virtual fields
TimelineEvent.prototype.year = function () {
    return this.eventDate ? new Date(this.eventDate).getFullYear() : null;
};

// Instance methods
TimelineEvent.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());

    // Add computed year
    values.year = this.year();

    // Format location as GeoJSON if present
    if (values.location) {
        values.location = {
            type: 'Point',
            coordinates: values.location.coordinates,
        };
    }

    return values;
};

// Scopes
TimelineEvent.addScope('important', {
    where: {
        importance: {
            [sequelize.Sequelize.Op.gte]: 7,
        },
    },
});

TimelineEvent.addScope('byType', (type) => ({
    where: { eventType: type },
}));

TimelineEvent.addScope('inYear', (year) => ({
    where: sequelize.where(
        sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM event_date')),
        year
    ),
}));

TimelineEvent.addScope('inDateRange', (startDate, endDate) => ({
    where: {
        eventDate: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
    },
}));

TimelineEvent.addScope('recent', {
    where: {
        eventDate: {
            [sequelize.Sequelize.Op.gte]: new Date('1924-01-01'),
        },
    },
    order: [['event_date', 'DESC']],
});

// Static methods
TimelineEvent.findByYear = async function (year) {
    return await this.scope({ method: ['inYear', year] }).findAll({
        order: [['event_date', 'ASC'], ['importance', 'DESC']],
    });
};

TimelineEvent.findInDateRange = async function (startDate, endDate, options = {}) {
    const { type, minImportance, limit } = options;

    const where = {
        eventDate: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
    };

    if (type) where.eventType = type;
    if (minImportance) {
        where.importance = {
            [sequelize.Sequelize.Op.gte]: minImportance,
        };
    }

    return await this.findAll({
        where,
        order: [['event_date', 'ASC'], ['importance', 'DESC']],
        limit: limit || 100,
    });
};

TimelineEvent.findNearLocation = async function (lon, lat, radiusMeters, options = {}) {
    const { startDate, endDate, type, limit = 50 } = options;

    const where = {
        location: sequelize.fn(
            'ST_DWithin',
            sequelize.cast(sequelize.col('location'), 'geography'),
            sequelize.cast(
                sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lon, lat), 4326),
                'geography'
            ),
            radiusMeters
        ),
    };

    if (startDate && endDate) {
        where.eventDate = {
            [sequelize.Sequelize.Op.between]: [startDate, endDate],
        };
    }

    if (type) where.eventType = type;

    return await this.findAll({
        where,
        attributes: {
            include: [
                [
                    sequelize.fn(
                        'ST_Distance',
                        sequelize.cast(sequelize.col('location'), 'geography'),
                        sequelize.cast(
                            sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', lon, lat), 4326),
                            'geography'
                        )
                    ),
                    'distance',
                ],
            ],
        },
        order: [
            [sequelize.literal('distance'), 'ASC'],
            ['importance', 'DESC'],
        ],
        limit,
    });
};

module.exports = TimelineEvent;
