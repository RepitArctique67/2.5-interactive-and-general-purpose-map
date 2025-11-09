exports.authenticate = (req, res, next) => {
    // Placeholder authentication
    next();
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Placeholder authorization
        next();
    };
};
