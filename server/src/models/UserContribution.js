const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

/**
 * UserContribution Model
 * Tracks user contributions with approval workflow
 */
const UserContribution = sequelize.define('UserContribution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    contributionType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'contribution_type',
        validate: {
            isIn: [[
                'add_feature', 'edit_feature', 'delete_feature',
                'add_layer', 'edit_layer',
                'add_event', 'edit_event'
            ]],
        },
    },
    entityType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'entity_type',
        validate: {
            isIn: [['geo_feature', 'layer', 'timeline_event']],
        },
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'entity_id',
    },
    data: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'approved', 'rejected']],
        },
    },
    reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'review_notes',
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at',
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'user_contributions',
    timestamps: true,
    updatedAt: false, // Only track creation time
    indexes: [
        {
            name: 'idx_contributions_user',
            fields: ['user_id'],
        },
        {
            name: 'idx_contributions_status',
            fields: ['status'],
        },
        {
            name: 'idx_contributions_type',
            fields: ['contribution_type'],
        },
        {
            name: 'idx_contributions_entity',
            fields: ['entity_type', 'entity_id'],
        },
    ],
});

// Instance methods
UserContribution.prototype.approve = async function (reviewerId, notes = null) {
    this.status = 'approved';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    if (notes) this.reviewNotes = notes;
    await this.save();
};

UserContribution.prototype.reject = async function (reviewerId, notes) {
    this.status = 'rejected';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    await this.save();
};

UserContribution.prototype.isPending = function () {
    return this.status === 'pending';
};

UserContribution.prototype.isApproved = function () {
    return this.status === 'approved';
};

UserContribution.prototype.isRejected = function () {
    return this.status === 'rejected';
};

// Scopes
UserContribution.addScope('pending', {
    where: { status: 'pending' },
    order: [['created_at', 'ASC']],
});

UserContribution.addScope('approved', {
    where: { status: 'approved' },
    order: [['reviewed_at', 'DESC']],
});

UserContribution.addScope('rejected', {
    where: { status: 'rejected' },
    order: [['reviewed_at', 'DESC']],
});

UserContribution.addScope('byUser', (userId) => ({
    where: { userId },
    order: [['created_at', 'DESC']],
}));

UserContribution.addScope('byType', (contributionType) => ({
    where: { contributionType },
}));

UserContribution.addScope('recent', {
    where: {
        createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
    },
    order: [['created_at', 'DESC']],
});

// Static methods
UserContribution.findPending = async function (options = {}) {
    const { limit = 50, offset = 0 } = options;
    return await this.scope('pending').findAll({ limit, offset });
};

UserContribution.findByUser = async function (userId, options = {}) {
    const { status, limit = 50 } = options;

    const where = { userId };
    if (status) where.status = status;

    return await this.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
    });
};

UserContribution.getStatsByUser = async function (userId) {
    const contributions = await this.findAll({
        where: { userId },
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['status'],
        raw: true,
    });

    const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
    };

    contributions.forEach(({ status, count }) => {
        stats[status] = parseInt(count);
        stats.total += parseInt(count);
    });

    return stats;
};

module.exports = UserContribution;
