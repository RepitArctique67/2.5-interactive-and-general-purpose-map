import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token from store
        // We need to dynamically import the store or use a getter if circular dependencies arise.
        // However, since api.js is a low-level service, importing the store should be fine 
        // as long as the store doesn't import api.js immediately during its creation.
        // To be safe, we can read from localStorage directly if we know the structure,
        // or better, use the store's getState() method.

        // Note: We'll need to import useUserStore at the top of the file.
        // But to avoid circular dependency issues (if userStore uses api), 
        // we can use the localStorage fallback or lazy import.
        // For now, let's assume we can import it.

        // Parse from localStorage for safety/speed without importing store logic here
        try {
            const storageData = localStorage.getItem('user-storage');
            if (storageData) {
                const { state } = JSON.parse(storageData);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            }
        } catch (e) {
            console.error('Error parsing auth token', e);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.error || error.message || 'Une erreur est survenue';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

export default api;
