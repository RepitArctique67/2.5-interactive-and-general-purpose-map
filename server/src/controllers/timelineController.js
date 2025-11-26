const timelineService = require('../services/timelineService');
const { AppError } = require('../middleware/errorHandler');

const timelineController = {
    /**
     * GET /api/v1/timeline
     * Get timeline events with filters
     */
    async getAll(req, res, next) {
        try {
            const filters = {
                year: req.query.year ? parseInt(req.query.year) : undefined,
                startDate: req.query.start_date,
                endDate: req.query.end_date,
                type: req.query.type,
                minImportance: req.query.min_importance ? parseInt(req.query.min_importance) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            };

            const events = await timelineService.findAll(filters);

            res.json({
                success: true,
                data: events,
                meta: {
                    count: events.length,
                    filters
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/timeline/:id
     * Get event by ID
     */
    async getById(req, res, next) {
        try {
            const event = await timelineService.findById(req.params.id);
            res.json({
                success: true,
                data: event
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/v1/timeline
     * Create new event (admin only)
     */
    async create(req, res, next) {
        try {
            // Map snake_case to camelCase if needed, or assume body matches model
            // Model uses camelCase attributes but defines field names for DB
            // Sequelize create expects camelCase attributes usually
            const eventData = {
                title: req.body.title,
                description: req.body.description,
                eventDate: req.body.event_date,
                eventType: req.body.event_type,
                location: req.body.location, // GeoJSON Point
                relatedLayerId: req.body.related_layer_id,
                metadata: req.body.metadata,
                imageUrl: req.body.image_url,
                sourceUrl: req.body.source_url,
                importance: req.body.importance
            };

            const event = await timelineService.create(eventData);
            res.status(201).json({
                success: true,
                data: event,
                message: 'Event created successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/v1/timeline/:id
     * Update event (admin only)
     */
    async update(req, res, next) {
        try {
            const eventData = {};
            if (req.body.title !== undefined) eventData.title = req.body.title;
            if (req.body.description !== undefined) eventData.description = req.body.description;
            if (req.body.event_date !== undefined) eventData.eventDate = req.body.event_date;
            if (req.body.event_type !== undefined) eventData.eventType = req.body.event_type;
            if (req.body.location !== undefined) eventData.location = req.body.location;
            if (req.body.related_layer_id !== undefined) eventData.relatedLayerId = req.body.related_layer_id;
            if (req.body.metadata !== undefined) eventData.metadata = req.body.metadata;
            if (req.body.image_url !== undefined) eventData.imageUrl = req.body.image_url;
            if (req.body.source_url !== undefined) eventData.sourceUrl = req.body.source_url;
            if (req.body.importance !== undefined) eventData.importance = req.body.importance;

            const event = await timelineService.update(req.params.id, eventData);
            res.json({
                success: true,
                data: event,
                message: 'Event updated successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/v1/timeline/:id
     * Delete event (admin only)
     */
    async delete(req, res, next) {
        try {
            await timelineService.delete(req.params.id);
            res.json({
                success: true,
                message: 'Event deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/v1/timeline/nearby
     * Get events near a location
     */
    async getNearby(req, res, next) {
        try {
            const { lon, lat, radius, start_date, end_date, type, limit } = req.query;

            if (!lon || !lat) {
                return next(new AppError('lon and lat parameters are required', 400));
            }

            const filters = {
                startDate: start_date,
                endDate: end_date,
                type,
                limit: limit ? parseInt(limit) : undefined
            };

            const events = await timelineService.findNearby(
                parseFloat(lon),
                parseFloat(lat),
                radius ? parseFloat(radius) : 10000,
                filters
            );

            res.json({
                success: true,
                data: events
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = timelineController;
