import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for search functionality
 * @returns {Object} { results, isLoading, error, search, clearResults }
 */
export const useSearch = () => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (query) => {
        if (!query || query.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Assuming an endpoint exists for search/geocoding
            // If not, we might need to use a mock or external service directly
            // For now, we'll assume the backend proxies to a geocoder
            const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
            setResults(response.data || response); // Adjust based on API response structure
        } catch (err) {
            setError(err.message || 'Search failed');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return {
        results,
        isLoading,
        error,
        search,
        clearResults
    };
};

export default useSearch;
