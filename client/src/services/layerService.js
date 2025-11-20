import api from './api';

export const layerService = {
    /**
     * Get all layers
     * @param {Object} filters - Optional filters (type, category, is_active, is_historical)
     * @returns {Promise<Array>} Array of layers
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.category) params.append('category', filters.category);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        if (filters.is_historical !== undefined) params.append('is_historical', filters.is_historical);

        const queryString = params.toString();
        const url = queryString ? `/layers?${queryString}` : '/layers';

        return api.get(url);
    },

    /**
     * Get layer by ID
     * @param {number} id - Layer ID
     * @returns {Promise<Object>} Layer object
     */
    async getById(id) {
        return api.get(`/layers/${id}`);
    },

    /**
     * Get features for a layer
     * @param {number} id - Layer ID
     * @param {Object} options - Optional bbox and year
     * @returns {Promise<Object>} Layer with features
     */
    async getFeatures(id, options = {}) {
        const params = new URLSearchParams();

        if (options.bbox) params.append('bbox', options.bbox.join(','));
        if (options.year) params.append('year', options.year);

        const queryString = params.toString();
        const url = queryString ? `/layers/${id}/features?${queryString}` : `/layers/${id}/features`;

        return api.get(url);
    }
};

export default layerService;
