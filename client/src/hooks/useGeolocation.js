import { useState, useCallback } from 'react';

/**
 * Custom hook for accessing user geolocation
 * @returns {Object} { location, error, isLoading, getCurrentLocation, watchLocation }
 */
export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
                setIsLoading(false);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, []);

    // Optional: Watch position
    const watchLocation = useCallback((callback) => {
        if (!navigator.geolocation) return null;

        return navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                setLocation(newLocation);
                if (callback) callback(newLocation);
            },
            (err) => setError(err.message),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, []);

    return {
        location,
        error,
        isLoading,
        getCurrentLocation,
        watchLocation
    };
};

export default useGeolocation;
