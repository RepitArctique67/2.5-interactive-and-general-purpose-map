const timelineController = require('../../../src/controllers/timelineController');
const timelineService = require('../../../src/services/timelineService');
const { AppError } = require('../../../src/middleware/errorHandler');

// Mock timelineService
jest.mock('../../../src/services/timelineService');

describe('Timeline Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all events with filters', async () => {
            const mockEvents = [{ id: 1, title: 'Event 1' }];
            timelineService.findAll.mockResolvedValue(mockEvents);
            req.query = { year: '2000' };

            await timelineController.getAll(req, res, next);

            expect(timelineService.findAll).toHaveBeenCalledWith(expect.objectContaining({
                year: 2000
            }));
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvents,
                meta: expect.any(Object)
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            timelineService.findAll.mockRejectedValue(error);

            await timelineController.getAll(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getById', () => {
        it('should return event by id', async () => {
            const mockEvent = { id: 1, title: 'Event 1' };
            timelineService.findById.mockResolvedValue(mockEvent);
            req.params.id = 1;

            await timelineController.getById(req, res, next);

            expect(timelineService.findById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvent
            });
        });
    });

    describe('create', () => {
        it('should create a new event', async () => {
            const mockEvent = { id: 1, title: 'New Event' };
            timelineService.create.mockResolvedValue(mockEvent);
            req.body = { title: 'New Event', event_date: '2023-01-01' };

            await timelineController.create(req, res, next);

            expect(timelineService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New Event',
                eventDate: '2023-01-01'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvent,
                message: 'Event created successfully'
            });
        });
    });

    describe('update', () => {
        it('should update an event', async () => {
            const mockEvent = { id: 1, title: 'Updated Event' };
            timelineService.update.mockResolvedValue(mockEvent);
            req.params.id = 1;
            req.body = { title: 'Updated Event' };

            await timelineController.update(req, res, next);

            expect(timelineService.update).toHaveBeenCalledWith(1, expect.objectContaining({
                title: 'Updated Event'
            }));
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvent,
                message: 'Event updated successfully'
            });
        });
    });

    describe('delete', () => {
        it('should delete an event', async () => {
            timelineService.delete.mockResolvedValue(true);
            req.params.id = 1;

            await timelineController.delete(req, res, next);

            expect(timelineService.delete).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Event deleted successfully'
            });
        });
    });
});
