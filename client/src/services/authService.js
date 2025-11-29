import axios from 'axios';

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const authService = {
    login: async (email, password) => {
        await delay(1000); // Simulate API call

        // Mock validation
        if (email === 'demo@example.com' && password === 'password') {
            const user = {
                id: '1',
                name: 'Demo User',
                email: 'demo@example.com',
                avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff',
                role: 'user'
            };
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }

        throw new Error('Invalid credentials');
    },

    register: async (data) => {
        await delay(1000);

        const user = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            email: data.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=3b82f6&color=fff`,
            role: 'user'
        };

        localStorage.setItem('user', JSON.stringify(user));
        return user;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};

export default authService;
