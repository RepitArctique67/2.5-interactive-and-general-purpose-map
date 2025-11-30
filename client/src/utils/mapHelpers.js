/**
 * Map helper functions
 */

/**
 * Converts a GeoJSON feature to a LngLat array [lng, lat]
 * @param {Object} feature - GeoJSON feature
 * @returns {Array} [lng, lat]
 */
export const getFeatureCenter = (feature) => {
    if (!feature || !feature.geometry) return [0, 0];

    const type = feature.geometry.type;
    const coords = feature.geometry.coordinates;

    if (type === 'Point') {
        return coords;
    }

    // Simple centroid for Polygon/LineString (approximate)
    // For production, use turf.centroid or similar
    if (type === 'Polygon') {
        const points = coords[0];
        let lng = 0, lat = 0;
        points.forEach(p => { lng += p[0]; lat += p[1]; });
        return [lng / points.length, lat / points.length];
    }

    return [0, 0];
};

/**
 * Generates a MapLibre style object for a layer
 * @param {Object} layer - Layer configuration object
 * @returns {Object} MapLibre layer style
 */
export const getLayerStyle = (layer) => {
    // Implementation can be expanded based on requirements
    return {
        'fill-color': layer.style?.color || '#3b82f6',
        'fill-opacity': layer.opacity || 0.6
    };
};
