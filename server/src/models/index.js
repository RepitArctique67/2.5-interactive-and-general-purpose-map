const { sequelize } = require('../config/sequelize');

// Import all models
const Layer = require('./Layer');
const GeoFeature = require('./GeoFeature');
const TimelineEvent = require('./TimelineEvent');
const User = require('./User');
const UserContribution = require('./UserContribution');

// Define associations
const defineAssociations = () => {
    // Layer <-> GeoFeature (One-to-Many)
    Layer.hasMany(GeoFeature, {
        foreignKey: 'layerId',
        as: 'features',
        onDelete: 'CASCADE',
    });
    GeoFeature.belongsTo(Layer, {
        foreignKey: 'layerId',
        as: 'layer',
    });

    // Layer <-> TimelineEvent (One-to-Many)
    Layer.hasMany(TimelineEvent, {
        foreignKey: 'relatedLayerId',
        as: 'events',
        onDelete: 'SET NULL',
    });
    TimelineEvent.belongsTo(Layer, {
        foreignKey: 'relatedLayerId',
        as: 'relatedLayer',
    });

    // User <-> UserContribution (One-to-Many)
    User.hasMany(UserContribution, {
        foreignKey: 'userId',
        as: 'contributions',
        onDelete: 'CASCADE',
    });
    UserContribution.belongsTo(User, {
        foreignKey: 'userId',
        as: 'contributor',
    });

    // User <-> UserContribution (Reviewer) (One-to-Many)
    User.hasMany(UserContribution, {
        foreignKey: 'reviewedBy',
        as: 'reviews',
        onDelete: 'SET NULL',
    });
    UserContribution.belongsTo(User, {
        foreignKey: 'reviewedBy',
        as: 'reviewer',
    });
};

// Initialize associations
defineAssociations();

// Export all models and sequelize instance
module.exports = {
    sequelize,
    Layer,
    GeoFeature,
    TimelineEvent,
    User,
    UserContribution,
};
