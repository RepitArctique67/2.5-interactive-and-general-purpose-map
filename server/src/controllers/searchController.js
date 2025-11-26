const searchService = require('../services/searchService');
const { AppError } = require('../middleware/errorHandler');

const searchController = {
    /**
     * GET /api/v1/search
     * Global search (locations, features, events)
     */
    async search(req, res, next) {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    data: {
                        locations: [],
                        features: [],
                        events: []
                    }
                });
            }

            const results = await searchService.search(q);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/search/reverse
     * Reverse geocoding
     */
    async reverse(req, res, next) {
        try {
            const { lat, lon } = req.query;

            if (!lat || !lon) {
                return next(new AppError('lat and lon parameters are required', 400));
            }

            const result = await searchService.reverseGeocode(
                parseFloat(lat),
                parseFloat(lon)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/search/suggestions
     * Autocomplete suggestions (simplified, same as search for now)
     */
    async suggestions(req, res, next) {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            // For suggestions, we might want just names/titles
            // Reusing search service for simplicity
            const results = await searchService.search(q);

            const suggestions = [
                ...results.locations.map(l => ({ label: l.name, type: 'location', id: l.id })),
                ...results.features.map(f => ({ label: f.name, type: 'feature', id: f.id })),
                ...results.events.map(e => ({ label: e.name, type: 'event', id: e.id }))
            ];

            res.json({
                success: true,
                data: suggestions.slice(0, 10) // Limit suggestions
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = searchController;
