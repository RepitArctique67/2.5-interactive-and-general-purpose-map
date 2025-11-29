import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const addToRecent = (search) => {
        const newRecent = [search, ...recentSearches.filter(s => s.id !== search.id)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const searchLocation = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Using Nominatim API for demo purposes
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 5,
                    addressdetails: 1
                }
            });

            const formattedResults = response.data.map(item => ({
                id: item.place_id,
                name: item.display_name.split(',')[0],
                description: item.display_name.split(',').slice(1).join(',').trim(),
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type
            }));

            setResults(formattedResults);
        } catch (err) {
            setError('Failed to search location');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                searchLocation(query);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, searchLocation]);

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        recentSearches,
        addToRecent,
        clearRecent
    };
};

export default useSearch;
