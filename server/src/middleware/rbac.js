const { AppError } = require('./errorHandler');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if authenticated user has required role(s)
 */

/**
 * Require specific role(s) to access route
 * @param {String|Array} roles - Required role(s), e.g., 'admin' or ['admin', 'contributor']
 * @returns {Function} Express middleware
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        // Ensure user is authenticated (should be run after protect middleware)
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Normalize roles to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Check if user has one of the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                    403
                )
            );
        }

        next();
    };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Require contributor or admin role
 */
const requireContributor = requireRole(['contributor', 'admin']);

/**
 * Check if user is the resource owner or has admin privileges
 * Expects userId parameter in route or req.params.id
 */
const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.params.userId || req.params.id;

    // Allow if user is admin or owns the resource
    if (req.user.role === 'admin' || req.user.id === parseInt(resourceUserId)) {
        return next();
    }

    return next(new AppError('Access denied. You can only manage your own resources', 403));
};

module.exports = {
    requireRole,
    requireAdmin,
    requireContributor,
    requireOwnerOrAdmin
};
