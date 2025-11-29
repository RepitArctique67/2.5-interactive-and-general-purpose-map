const layerService = require('../../../src/services/layerService');
const { Layer, GeoFeature } = require('../../../src/models');
const { layerCache } = require('../../../src/utils/cache');

jest.mock('../../../src/models');
jest.mock('../../../src/utils/cache', () => ({
    layerCache: {
        wrap: jest.fn((key, fn) => fn()),
        flush: jest.fn(),
        delete: jest.fn(),
    },
}));
jest.mock('../../../src/utils/logger');

describe('Layer Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all layers from DB', async () => {
            const mockLayers = [{ id: 1, name: 'Layer 1' }];
            Layer.findAll.mockResolvedValue(mockLayers);

            const result = await layerService.findAll();

            expect(Layer.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockLayers);
        });

        it('should return sample layers if DB fails', async () => {
            Layer.findAll.mockRejectedValue(new Error('DB Error'));

            const result = await layerService.findAll();

            expect(result).toHaveLength(4); // Sample layers length
            expect(result[0].name).toBe('OpenStreetMap');
        });
    });

    describe('findById', () => {
        it('should return a layer by id', async () => {
            const mockLayer = { id: 1, name: 'Layer 1' };
            Layer.findByPk.mockResolvedValue(mockLayer);

            const result = await layerService.findById(1);

            expect(Layer.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockLayer);
        });

        it('should throw 404 if not found', async () => {
            Layer.findByPk.mockResolvedValue(null);

            await expect(layerService.findById(999)).rejects.toThrow('Couche 999 non trouvée');
        });
    });

    describe('create', () => {
        it('should create a layer', async () => {
            const layerData = { name: 'New Layer' };
            const createdLayer = { id: 1, ...layerData };
            Layer.create.mockResolvedValue(createdLayer);

            const result = await layerService.create(layerData);

            expect(Layer.create).toHaveBeenCalledWith(layerData);
            expect(layerCache.flush).toHaveBeenCalled();
            expect(result).toEqual(createdLayer);
        });
    });
});
