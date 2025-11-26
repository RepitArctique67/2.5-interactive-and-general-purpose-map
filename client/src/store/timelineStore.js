import { create } from 'zustand';

/**
 * Store for managing timeline state
 */
const useTimelineStore = create((set) => ({
    // State
    currentYear: new Date().getFullYear(),
    minYear: 1900,
    maxYear: new Date().getFullYear(),
    isPlaying: false,
    playbackSpeed: 1000, // ms per year

    // Actions
    setCurrentYear: (year) => set((state) => ({
        currentYear: Math.max(state.minYear, Math.min(state.maxYear, year))
    })),

    setRange: (min, max) => set({ minYear: min, maxYear: max }),

    setPlaying: (isPlaying) => set({ isPlaying }),

    togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    // Helper to step forward/backward
    stepYear: (direction = 1) => set((state) => {
        const nextYear = state.currentYear + direction;
        if (nextYear > state.maxYear || nextYear < state.minYear) {
            return { isPlaying: false }; // Stop at bounds
        }
        return { currentYear: nextYear };
    })
}));

export default useTimelineStore;
