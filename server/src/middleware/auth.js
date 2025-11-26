const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// Protect routes
exports.authenticate = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123');

        // Check if user exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('User account is deactivated', 403));
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Auth error:', error.message);
        return next(new AppError('Not authorized to access this route', 401));
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
