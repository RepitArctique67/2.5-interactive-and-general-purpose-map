import { create } from 'zustand';

/**
 * Store for accessing the MapLibre instance globally
 * This replaces the complex Context approach for simple access
 */
const useMapStore = create((set, get) => ({
    map: null,
    setMapInstance: (map) => set({ map }),

    // Helper actions
    flyTo: (options) => {
        const { map } = get();
        if (map) {
            map.flyTo(options);
        }
    },

    fitBounds: (bounds, options) => {
        const { map } = get();
        if (map) {
            map.fitBounds(bounds, options);
        }
    }
}));

export const useMap = () => {
    const { map, setMapInstance, flyTo, fitBounds } = useMapStore();

    return {
        map,
        setMapInstance,
        flyTo,
        fitBounds
    };
};
