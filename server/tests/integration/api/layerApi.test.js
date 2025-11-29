const request = require('supertest');
const layerService = require('../../../src/services/layerService');

jest.mock('../../../src/services/layerService');
jest.mock('../../../src/services/pipelineService', () => ({
    initialize: jest.fn(),
}));

const app = require('../../../src/app');

describe('Layer API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/layers', () => {
        it('should return all layers', async () => {
            const mockLayers = [{ id: 1, name: 'Layer 1' }];
            layerService.findAll.mockResolvedValue(mockLayers);

            const res = await request(app).get('/api/v1/layers');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockLayers);
            expect(layerService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/layers/:id', () => {
        it('should return a layer by id', async () => {
            const mockLayer = { id: 1, name: 'Layer 1' };
            layerService.findById.mockResolvedValue(mockLayer);

            const res = await request(app).get('/api/v1/layers/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockLayer);
            expect(layerService.findById).toHaveBeenCalledWith('1');
        });
    });
});
