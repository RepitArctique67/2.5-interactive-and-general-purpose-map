import { create } from 'zustand';

/**
 * Store for managing layer state
 */
const useLayerStore = create((set, get) => ({
    // State
    layers: {}, // Map of layerId -> { id, visible, opacity, ... }
    activeLayerId: null,

    // Actions
    setLayers: (layersData) => {
        const layersMap = {};
        layersData.forEach(layer => {
            layersMap[layer.id] = {
                ...layer,
                visible: layer.visible ?? true,
                opacity: layer.opacity ?? 1.0
            };
        });
        set({ layers: layersMap });
    },

    addLayer: (layer) => set((state) => ({
        layers: {
            ...state.layers,
            [layer.id]: {
                ...layer,
                visible: layer.visible ?? true,
                opacity: layer.opacity ?? 1.0
            }
        }
    })),

    removeLayer: (layerId) => set((state) => {
        const newLayers = { ...state.layers };
        delete newLayers[layerId];
        return { layers: newLayers };
    }),

    toggleLayerVisibility: (layerId) => set((state) => {
        const layer = state.layers[layerId];
        if (!layer) return state;

        return {
            layers: {
                ...state.layers,
                [layerId]: {
                    ...layer,
                    visible: !layer.visible
                }
            }
        };
    }),

    setLayerOpacity: (layerId, opacity) => set((state) => {
        const layer = state.layers[layerId];
        if (!layer) return state;

        return {
            layers: {
                ...state.layers,
                [layerId]: {
                    ...layer,
                    opacity: Math.max(0, Math.min(1, opacity))
                }
            }
        };
    }),

    setActiveLayer: (layerId) => set({ activeLayerId: layerId }),

    // Selectors
    getVisibleLayers: () => {
        const state = get();
        return Object.values(state.layers).filter(l => l.visible);
    }
}));

export default useLayerStore;
