import api from './api';

const authService = {
    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{token: string, user: object}>}
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data; // {success: true, token, user}
    },

    /**
     * Register new user
     * @param {object} data - User registration data
     * @returns {Promise<{token: string, user: object}>}
     */
    register: async (data) => {
        const { name, email, password } = data;
        const response = await api.post('/auth/register', {
            username: name, // Backend expects 'username'
            email,
            password
        });
        return response.data; // {success: true, token, user}
    },

    /**
     * Get current user profile
     * @returns {Promise<object>}
     */
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data; // {success: true, data: user}
    },

    /**
     * Update user profile
     * @param {object} updates - Profile updates
     * @returns {Promise<object>}
     */
    updateProfile: async (updates) => {
        const response = await api.put('/auth/profile', updates);
        return response.data; // {success: true, data: user}
    },

    /**
     * Change password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    /**
     * Logout (client-side only, clears token from store)
     */
    logout: () => {
        // Token is managed by userStore, just clear it there
        // No server call needed for JWT since it's stateless
    }
};

export default authService;
