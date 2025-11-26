import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import layerService from '../services/layerService';
import useLayerStore from '../store/layerStore';

/**
 * Custom hook to fetch and manage layers
 * Combines server state (React Query) with UI state (Zustand)
 * @param {Object} filters - Optional filters for layers
 * @returns {Object} { layers, isLoading, error, refetch, ...actions }
 */
export const useLayers = (filters = {}) => {
    // Server State
    const { data: serverLayers, isLoading, error, refetch } = useQuery({
        queryKey: ['layers', filters],
        queryFn: async () => {
            const response = await layerService.getAll(filters);
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    // Client State
    const storeLayers = useLayerStore(state => state.layers);
    const toggleLayerVisibility = useLayerStore(state => state.toggleLayerVisibility);
    const setLayerOpacity = useLayerStore(state => state.setLayerOpacity);
    const setActiveLayer = useLayerStore(state => state.setActiveLayer);
    const activeLayerId = useLayerStore(state => state.activeLayerId);

    // Sync server data to store (initialize defaults)
    useEffect(() => {
        if (serverLayers && serverLayers.length > 0) {
            // Only add layers that aren't already in the store to preserve UI state
            // Or we can use setLayers which handles merging if we implement it carefully.
            // For now, let's just ensure all server layers exist in the store.
            // We'll use a smart merge in the store or here.

            // Actually, the store's setLayers replaces everything or merges?
            // My implementation of setLayers in layerStore.js replaces the map but keeps existing values if I logic it right.
            // Let's check layerStore.js implementation:
            // setLayers: (layersData) => { const layersMap = {}; layersData.forEach... } -> It rebuilds the map.
            // This might reset visibility if I'm not careful.

            // Better approach: Let's not auto-sync everything to store state if we just want to merge on read.
            // But for "toggleVisibility" to work, the layer needs to be in the store.

            // Let's iterate and add missing layers to store
            const missingLayers = serverLayers.filter(l => !storeLayers[l.id]);
            if (missingLayers.length > 0) {
                missingLayers.forEach(l => {
                    useLayerStore.getState().addLayer(l);
                });
            }
        }
    }, [serverLayers, storeLayers]);

    // Merge server data with store state for consumption
    const layers = useMemo(() => {
        if (!serverLayers) return [];
        return serverLayers.map(layer => {
            const storeLayer = storeLayers[layer.id];
            return {
                ...layer,
                visible: storeLayer?.visible ?? true,
                opacity: storeLayer?.opacity ?? 1.0,
                // Add other UI state here
            };
        });
    }, [serverLayers, storeLayers]);

    return {
        layers,
        activeLayerId,
        isLoading,
        error: error?.message || null,
        refetch,
        // Actions
        toggleVisibility: toggleLayerVisibility,
        setOpacity: setLayerOpacity,
        setActive: setActiveLayer
    };
};

export default useLayers;
