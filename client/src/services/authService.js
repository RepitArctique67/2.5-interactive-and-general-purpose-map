import api from './api';

export const authService = {
    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} { user, token }
     */
    async login(email, password) {
        return api.post('/auth/login', { email, password });
    },

    /**
     * Register new user
     * @param {Object} userData 
     * @returns {Promise<Object>} { user, token }
     */
    async register(userData) {
        return api.post('/auth/register', userData);
    },

    /**
     * Get current user profile
     * @returns {Promise<Object>} User object
     */
    async getProfile() {
        return api.get('/auth/me');
    },

    /**
     * Update user profile
     * @param {Object} data 
     * @returns {Promise<Object>} Updated user object
     */
    async updateProfile(data) {
        return api.put('/auth/me', data);
    }
};

export default authService;
