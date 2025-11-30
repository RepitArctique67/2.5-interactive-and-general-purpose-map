const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_key_123', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

const authController = {
    /**
     * POST /api/v1/auth/register
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            // Check if user exists
            const userExists = await User.findOne({
                where: { email }
            });

            if (userExists) {
                return next(new AppError('Email already registered', 400));
            }

            const usernameExists = await User.findOne({
                where: { username }
            });

            if (usernameExists) {
                return next(new AppError('Username already taken', 400));
            }

            // Create user
            const user = await User.createUser({
                username,
                email,
                password
            });

            // Create token
            const token = generateToken(user.id);

            res.status(201).json({
                success: true,
                token,
                user: user.toSafeJSON()
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/auth/login
     * Login user
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validate email & password
            if (!email || !password) {
                return next(new AppError('Please provide an email and password', 400));
            }

            // Check for user
            const user = await User.scope('active').findOne({
                where: { email }
            });

            if (!user) {
                return next(new AppError('Invalid credentials', 401));
            }

            // Check if password matches
            const isMatch = await user.validatePassword(password);

            if (!isMatch) {
                return next(new AppError('Invalid credentials', 401));
            }

            // Update last login
            await user.updateLastLogin();

            // Create token
            const token = generateToken(user.id);

            res.json({
                success: true,
                token,
                user: user.toSafeJSON()
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/auth/me
     * Get current logged in user
     */
    async getMe(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id);

            res.json({
                success: true,
                data: user.toSafeJSON()
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/auth/profile
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const { username, email, bio, avatarUrl, preferences } = req.body;
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return next(new AppError('User not found', 404));
            }

            // Check if username is being changed and if it's already taken
            if (username && username !== user.username) {
                const usernameExists = await User.findOne({ where: { username } });
                if (usernameExists) {
                    return next(new AppError('Username already taken', 400));
                }
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== user.email) {
                const emailExists = await User.findOne({ where: { email } });
                if (emailExists) {
                    return next(new AppError('Email already registered', 400));
                }
            }

            // Update allowed fields
            const updates = {};
            if (username) updates.username = username;
            if (email) updates.email = email;
            if (bio !== undefined) updates.bio = bio;
            if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
            if (preferences) updates.preferences = { ...user.preferences, ...preferences };

            await user.update(updates);

            res.json({
                success: true,
                data: user.toSafeJSON(),
                message: 'Profile updated successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/auth/password
     * Change password
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new AppError('Please provide current and new password', 400));
            }

            if (newPassword.length < 6) {
                return next(new AppError('Password must be at least 6 characters', 400));
            }

            const user = await User.findByPk(req.user.id);

            // Verify current password
            const isMatch = await user.validatePassword(currentPassword);
            if (!isMatch) {
                return next(new AppError('Current password is incorrect', 401));
            }

            // Update password
            user.passwordHash = newPassword; // Will be hashed by beforeUpdate hook
            await user.save();

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
