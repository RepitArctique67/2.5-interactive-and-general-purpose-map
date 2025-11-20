const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Represents user accounts with role-based access control
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 100],
            isAlphanumeric: true,
        },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isEmail: true,
        },
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'user',
        validate: {
            isIn: [['user', 'contributor', 'admin']],
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
    },
    preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    },
    avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'avatar_url',
        validate: {
            isUrl: true,
        },
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500],
        },
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
    },
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            name: 'idx_users_email',
            fields: ['email'],
            unique: true,
        },
        {
            name: 'idx_users_username',
            fields: ['username'],
            unique: true,
        },
        {
            name: 'idx_users_role',
            fields: ['role'],
        },
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.passwordHash && !user.passwordHash.startsWith('$2a$')) {
                user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('passwordHash') && !user.passwordHash.startsWith('$2a$')) {
                user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
            }
        },
    },
});

// Virtual fields
User.prototype.password = undefined; // Hide password field

// Instance methods
User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

User.prototype.updateLastLogin = async function () {
    this.lastLoginAt = new Date();
    await this.save();
};

User.prototype.isAdmin = function () {
    return this.role === 'admin';
};

User.prototype.isContributor = function () {
    return this.role === 'contributor' || this.role === 'admin';
};

User.prototype.canEdit = function () {
    return this.role === 'contributor' || this.role === 'admin';
};

User.prototype.toSafeJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
};

// Override toJSON to exclude password hash
User.prototype.toJSON = function () {
    return this.toSafeJSON();
};

// Scopes
User.addScope('active', {
    where: { isActive: true },
});

User.addScope('admins', {
    where: { role: 'admin' },
});

User.addScope('contributors', {
    where: {
        role: {
            [sequelize.Sequelize.Op.in]: ['contributor', 'admin'],
        },
    },
});

User.addScope('withoutPassword', {
    attributes: { exclude: ['passwordHash'] },
});

// Static methods
User.findByEmail = async function (email) {
    return await this.findOne({ where: { email } });
};

User.findByUsername = async function (username) {
    return await this.findOne({ where: { username } });
};

User.createUser = async function (userData) {
    const { username, email, password, role = 'user' } = userData;

    return await this.create({
        username,
        email,
        passwordHash: password, // Will be hashed by beforeCreate hook
        role,
    });
};

module.exports = User;
