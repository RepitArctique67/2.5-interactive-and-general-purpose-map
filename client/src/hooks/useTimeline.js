import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useTimelineStore from '../store/timelineStore';

/**
 * Custom hook for managing timeline-based feature filtering and animations
 * @param {Array} features - Array of features with temporal properties
 * @param {Object} config - Timeline configuration
 * @returns {Object} Timeline utilities and state
 */
export function useTimeline(features = [], config = {}) {
    const {
        dateField = 'year',
        startDateField = 'startYear',
        endDateField = 'endYear',
        interpolate = false,
        enablePlayback = false, // Only the main Timeline component should enable this
    } = config;

    // Global State from Store
    const currentYear = useTimelineStore(state => state.currentYear);
    const minYear = useTimelineStore(state => state.minYear);
    const maxYear = useTimelineStore(state => state.maxYear);
    const isPlaying = useTimelineStore(state => state.isPlaying);
    const animationSpeed = useTimelineStore(state => state.playbackSpeed);

    const setCurrentYear = useTimelineStore(state => state.setCurrentYear);
    const setPlaying = useTimelineStore(state => state.setPlaying);
    const stepYear = useTimelineStore(state => state.stepYear);

    // Local state for animation direction (could be in store, but fine here for now)
    const [animationDirection, setAnimationDirection] = useState('forward');
    const animationIntervalRef = useRef(null);

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
     * Animation Effect
     * Only runs if enablePlayback is true (to avoid multiple drivers)
     */
    useEffect(() => {
        if (!enablePlayback) return;

        if (isPlaying) {
            animationIntervalRef.current = setInterval(() => {
                stepYear(animationDirection === 'forward' ? 1 : -1);
            }, animationSpeed);
        } else {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
        }

        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
        };
    }, [isPlaying, animationSpeed, animationDirection, enablePlayback, stepYear]);

    /**
     * Start timeline animation
     */
    const animateTimeline = useCallback((direction = 'forward') => {
        setAnimationDirection(direction);
        setPlaying(true);
    }, [setPlaying]);

    /**
     * Stop timeline animation
     */
    const stopAnimation = useCallback(() => {
        setPlaying(false);
    }, [setPlaying]);

    /**
     * Jump to a specific year
     */
    const jumpToYear = useCallback((year) => {
        stopAnimation();
        setCurrentYear(year);
    }, [setCurrentYear, stopAnimation]);

    /**
     * Reset to initial year
     */
    const reset = useCallback(() => {
        stopAnimation();
        setCurrentYear(minYear); // Or initialYear if we store it
    }, [minYear, setCurrentYear, stopAnimation]);

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

    return {
        // State
        currentYear,
        isPlaying,
        animationDirection,
        filteredFeatures,
        interpolatedFeatures,

        // Year control
        setCurrentYear: jumpToYear,
        stepForward: () => stepYear(1),
        stepBackward: () => stepYear(-1),
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
