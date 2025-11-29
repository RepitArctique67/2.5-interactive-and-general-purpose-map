const layerController = require('../../../src/controllers/layerController');
const layerService = require('../../../src/services/layerService');

jest.mock('../../../src/services/layerService');

describe('Layer Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all layers', async () => {
            const mockLayers = [{ id: 1, name: 'Layer 1' }];
            layerService.findAll.mockResolvedValue(mockLayers);

            await layerController.getAll(req, res, next);

            expect(layerService.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockLayers,
                meta: expect.any(Object),
            });
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            layerService.findAll.mockRejectedValue(error);

            await layerController.getAll(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getById', () => {
        it('should return a layer by id', async () => {
            const mockLayer = { id: 1, name: 'Layer 1' };
            req.params.id = 1;
            layerService.findById.mockResolvedValue(mockLayer);

            await layerController.getById(req, res, next);

            expect(layerService.findById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockLayer,
            });
        });
    });
});
