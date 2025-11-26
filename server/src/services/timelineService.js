const { TimelineEvent } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class TimelineService {
    async findAll(filters = {}) {
        try {
            const { year, startDate, endDate, type, minImportance, limit } = filters;

            if (year) {
                return await TimelineEvent.findByYear(year);
            }

            if (startDate && endDate) {
                return await TimelineEvent.findInDateRange(startDate, endDate, {
                    type,
                    minImportance,
                    limit
                });
            }

            // Default: recent events
            const where = {};
            if (type) where.eventType = type;

            return await TimelineEvent.findAll({
                where,
                order: [['event_date', 'DESC']],
                limit: limit || 50
            });
        } catch (error) {
            logger.error('Error in TimelineService.findAll:', error);
            throw new AppError('Error retrieving timeline events', 500);
        }
    }

    async findById(id) {
        try {
            const event = await TimelineEvent.findByPk(id);
            if (!event) {
                throw new AppError(`Timeline event ${id} not found`, 404);
            }
            return event;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Error in TimelineService.findById:', error);
            throw new AppError('Error retrieving timeline event', 500);
        }
    }

    async create(eventData) {
        try {
            const event = await TimelineEvent.create(eventData);
            logger.info(`✅ Timeline event created: ${event.title} (ID: ${event.id})`);
            return event;
        } catch (error) {
            logger.error('Error in TimelineService.create:', error);
            throw new AppError('Error creating timeline event', 500);
        }
    }

    async update(id, eventData) {
        try {
            const event = await this.findById(id);
            await event.update(eventData);
            logger.info(`✅ Timeline event updated: ${event.title} (ID: ${event.id})`);
            return event;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Error in TimelineService.update:', error);
            throw new AppError('Error updating timeline event', 500);
        }
    }

    async delete(id) {
        try {
            const event = await this.findById(id);
            await event.destroy();
            logger.info(`✅ Timeline event deleted: ID ${id}`);
            return { id, deleted: true };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Error in TimelineService.delete:', error);
            throw new AppError('Error deleting timeline event', 500);
        }
    }

    async findNearby(lon, lat, radius, filters = {}) {
        try {
            return await TimelineEvent.findNearLocation(lon, lat, radius, filters);
        } catch (error) {
            logger.error('Error in TimelineService.findNearby:', error);
            throw new AppError('Error finding nearby events', 500);
        }
    }
}

module.exports = new TimelineService();
