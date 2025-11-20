import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing timeline-based feature filtering and animations
 * @param {Array} features - Array of features with temporal properties
 * @param {Object} config - Timeline configuration
 * @returns {Object} Timeline utilities and state
 */
export function useTimeline(features = [], config = {}) {
    const {
        initialYear = new Date().getFullYear(),
        minYear = 1900,
        maxYear = new Date().getFullYear(),
        dateField = 'year',
        startDateField = 'startYear',
        endDateField = 'endYear',
        animationSpeed = 1000, // ms per year
        interpolate = false,
    } = config;

    const [currentYear, setCurrentYear] = useState(initialYear);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState('forward');
    const animationIntervalRef = useState(null);

    /**
     * Filter features based on current timeline year
     */
    const filteredFeatures = useMemo(() => {
        if (!features || features.length === 0) return [];

        return features.filter(feature => {
            const properties = feature.properties || {};

            // Check if feature has a single year
            if (properties[dateField]) {
                const featureYear = parseInt(properties[dateField]);
                return featureYear <= currentYear;
            }

            // Check if feature has a date range
            if (properties[startDateField] && properties[endDateField]) {
                const startYear = parseInt(properties[startDateField]);
                const endYear = parseInt(properties[endDateField]);
                return currentYear >= startYear && currentYear <= endYear;
            }

            // Check if feature has only start date
            if (properties[startDateField]) {
                const startYear = parseInt(properties[startDateField]);
                return currentYear >= startYear;
            }

            // If no temporal data, always show
            return true;
        });
    }, [features, currentYear, dateField, startDateField, endDateField]);

    /**
     * Get features that appear in a specific year
     */
    const getFeaturesAtYear = useCallback((year) => {
        if (!features || features.length === 0) return [];

        return features.filter(feature => {
            const properties = feature.properties || {};

            if (properties[dateField]) {
                return parseInt(properties[dateField]) === year;
            }

            if (properties[startDateField] && properties[endDateField]) {
                const startYear = parseInt(properties[startDateField]);
                const endYear = parseInt(properties[endDateField]);
                return year >= startYear && year <= endYear;
            }

            if (properties[startDateField]) {
                return parseInt(properties[startDateField]) === year;
            }

            return false;
        });
    }, [features, dateField, startDateField, endDateField]);

    /**
     * Get features that changed between two years
     */
    const getChangedFeatures = useCallback((fromYear, toYear) => {
        const featuresAtFrom = new Set(getFeaturesAtYear(fromYear).map(f => f.id));
        const featuresAtTo = new Set(getFeaturesAtYear(toYear).map(f => f.id));

        const added = getFeaturesAtYear(toYear).filter(f => !featuresAtFrom.has(f.id));
        const removed = getFeaturesAtYear(fromYear).filter(f => !featuresAtTo.has(f.id));

        return { added, removed };
    }, [getFeaturesAtYear]);

    /**
     * Interpolate data for a feature at a specific year
     */
    const interpolateData = useCallback((feature, year) => {
        if (!interpolate || !feature.properties) return feature;

        const properties = feature.properties;

        // Check if feature has temporal data points
        if (!properties.timeSeriesData) return feature;

        const timeSeriesData = properties.timeSeriesData;

        // Find the two closest data points
        let before = null;
        let after = null;

        timeSeriesData.forEach(dataPoint => {
            if (dataPoint.year <= year) {
                if (!before || dataPoint.year > before.year) {
                    before = dataPoint;
                }
            }
            if (dataPoint.year >= year) {
                if (!after || dataPoint.year < after.year) {
                    after = dataPoint;
                }
            }
        });

        // If we have both points, interpolate
        if (before && after && before.year !== after.year) {
            const ratio = (year - before.year) / (after.year - before.year);
            const interpolatedProperties = { ...properties };

            // Interpolate numeric properties
            Object.keys(before).forEach(key => {
                if (key !== 'year' && typeof before[key] === 'number' && typeof after[key] === 'number') {
                    interpolatedProperties[key] = before[key] + (after[key] - before[key]) * ratio;
                }
            });

            return {
                ...feature,
                properties: interpolatedProperties,
            };
        }

        // If we only have one point, use it
        if (before) {
            return {
                ...feature,
                properties: { ...properties, ...before },
            };
        }

        return feature;
    }, [interpolate]);

    /**
     * Get interpolated features for current year
     */
    const interpolatedFeatures = useMemo(() => {
        if (!interpolate) return filteredFeatures;
        return filteredFeatures.map(feature => interpolateData(feature, currentYear));
    }, [filteredFeatures, currentYear, interpolate, interpolateData]);

    /**
     * Start timeline animation
     */
    const animateTimeline = useCallback((direction = 'forward', speed = animationSpeed) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setAnimationDirection(direction);

        const interval = setInterval(() => {
            setCurrentYear(prevYear => {
                let nextYear;

                if (direction === 'forward') {
                    nextYear = prevYear + 1;
                    if (nextYear > maxYear) {
                        clearInterval(interval);
                        setIsAnimating(false);
                        return maxYear;
                    }
                } else {
                    nextYear = prevYear - 1;
                    if (nextYear < minYear) {
                        clearInterval(interval);
                        setIsAnimating(false);
                        return minYear;
                    }
                }

                return nextYear;
            });
        }, speed);

        animationIntervalRef.current = interval;
    }, [isAnimating, minYear, maxYear, animationSpeed]);

    /**
     * Stop timeline animation
     */
    const stopAnimation = useCallback(() => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }
        setIsAnimating(false);
    }, []);

    /**
     * Jump to a specific year
     */
    const jumpToYear = useCallback((year) => {
        stopAnimation();
        const clampedYear = Math.max(minYear, Math.min(maxYear, year));
        setCurrentYear(clampedYear);
    }, [minYear, maxYear, stopAnimation]);

    /**
     * Step forward one year
     */
    const stepForward = useCallback(() => {
        setCurrentYear(prev => Math.min(prev + 1, maxYear));
    }, [maxYear]);

    /**
     * Step backward one year
     */
    const stepBackward = useCallback(() => {
        setCurrentYear(prev => Math.max(prev - 1, minYear));
    }, [minYear]);

    /**
     * Reset to initial year
     */
    const reset = useCallback(() => {
        stopAnimation();
        setCurrentYear(initialYear);
    }, [initialYear, stopAnimation]);

    /**
     * Get timeline statistics
     */
    const getStatistics = useCallback(() => {
        const stats = {
            totalFeatures: features.length,
            visibleFeatures: filteredFeatures.length,
            currentYear,
            minYear,
            maxYear,
            progress: ((currentYear - minYear) / (maxYear - minYear)) * 100,
        };

        // Count features by year
        const featuresByYear = {};
        for (let year = minYear; year <= maxYear; year++) {
            featuresByYear[year] = getFeaturesAtYear(year).length;
        }
        stats.featuresByYear = featuresByYear;

        return stats;
    }, [features, filteredFeatures, currentYear, minYear, maxYear, getFeaturesAtYear]);

    /**
     * Get years with significant changes
     */
    const getSignificantYears = useCallback((threshold = 5) => {
        const significantYears = [];

        for (let year = minYear + 1; year <= maxYear; year++) {
            const { added, removed } = getChangedFeatures(year - 1, year);
            const totalChanges = added.length + removed.length;

            if (totalChanges >= threshold) {
                significantYears.push({
                    year,
                    added: added.length,
                    removed: removed.length,
                    total: totalChanges,
                });
            }
        }

        return significantYears;
    }, [minYear, maxYear, getChangedFeatures]);

    /**
     * Create time-lapse data
     */
    const createTimeLapse = useCallback((yearStep = 1) => {
        const timeLapseData = [];

        for (let year = minYear; year <= maxYear; year += yearStep) {
            timeLapseData.push({
                year,
                features: getFeaturesAtYear(year),
                count: getFeaturesAtYear(year).length,
            });
        }

        return timeLapseData;
    }, [minYear, maxYear, getFeaturesAtYear]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
        };
    }, []);

    return {
        // State
        currentYear,
        isAnimating,
        animationDirection,
        filteredFeatures,
        interpolatedFeatures,

        // Year control
        setCurrentYear: jumpToYear,
        stepForward,
        stepBackward,
        reset,

        // Animation control
        animateTimeline,
        stopAnimation,

        // Data queries
        getFeaturesAtYear,
        getChangedFeatures,
        interpolateData,
        getStatistics,
        getSignificantYears,
        createTimeLapse,

        // Configuration
        minYear,
        maxYear,
    };
}

export default useTimeline;
