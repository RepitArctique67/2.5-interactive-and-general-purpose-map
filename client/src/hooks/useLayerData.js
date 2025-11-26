import { useQueries } from '@tanstack/react-query';
import layerService from '../services/layerService';

/**
 * Custom hook to fetch data for active layers
 * @param {Array} layers - List of layer objects
 * @param {Array} activeLayerIds - List of active layer IDs
 * @param {number} currentYear - Current year for temporal filtering
 * @returns {Object} { layerData, isLoading, errors }
 */
export const useLayerData = (layers = [], activeLayerIds = [], currentYear) => {
    const queries = useQueries({
        queries: activeLayerIds.map(layerId => {
            const layer = layers.find(l => l.id === layerId);
            return {
                queryKey: ['layerFeatures', layerId, currentYear],
                queryFn: async () => {
                    const response = await layerService.getFeatures(layerId, { year: currentYear });
                    return {
                        id: layerId,
                        geojsonData: response.data,
                        ...layer
                    };
                },
                enabled: !!layer,
                staleTime: 5 * 60 * 1000, // 5 minutes
            };
        })
    });

    const isLoading = queries.some(query => query.isLoading);
    const errors = queries.filter(query => query.error).map(query => query.error);

    // Combine successful results
    const layerData = queries
        .filter(query => query.data)
        .map(query => query.data);

    return {
        layerData,
        isLoading,
        errors
    };
};

export default useLayerData;
