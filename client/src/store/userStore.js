import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store for managing user state with persistence
 */
const useUserStore = create(
    persist(
        (set) => ({
            // State
            user: null,
            isAuthenticated: false,
            token: null,
            preferences: {
                theme: 'dark',
                language: 'fr',
                notifications: true
            },

            // Actions
            login: (token, user) => set({
                user,
                token,
                isAuthenticated: !!user
            }),

            setUser: (user, token) => set({
                user,
                token,
                isAuthenticated: !!user
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),

            updatePreferences: (newPreferences) => set((state) => ({
                preferences: { ...state.preferences, ...newPreferences }
            }))
        }),
        {
            name: 'user-storage', // unique name for localStorage
            partialize: (state) => ({
                token: state.token,
                preferences: state.preferences,
                user: state.user
            }), // Only persist these fields
        }
    )
);

export default useUserStore;
