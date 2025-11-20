import { useQuery } from '@tanstack/react-query';
import layerService from '../services/layerService';

/**
 * Custom hook to fetch and manage layers
 * @param {Object} filters - Optional filters for layers
 * @returns {Object} { layers, isLoading, error, refetch }
 */
export const useLayers = (filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['layers', filters],
        queryFn: async () => {
            const response = await layerService.getAll(filters);
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });

    return {
        layers: data || [],
        isLoading,
        error: error?.message || null,
        refetch
    };
};

export default useLayers;
