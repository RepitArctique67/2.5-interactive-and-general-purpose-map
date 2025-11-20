const BaseImporter = require('../utils/BaseImporter');
const logger = require('../utils/logger');
const xml2js = require('xml2js');

/**
 * OpenStreetMap data importer using Overpass API
 * Imports vector data including buildings, roads, natural features, and POIs
 */
class OSMImporter extends BaseImporter {
    constructor(config) {
        super(config);
        this.parser = new xml2js.Parser();
    }

    /**
     * Import OSM data for a bounding box
     * @param {Object} params - Import parameters
     * @param {Array} params.bbox - Bounding box [minLon, minLat, maxLon, maxLat]
     * @param {Array} params.tags - OSM tags to filter (e.g., ['building', 'highway'])
     * @param {String} params.elementType - Element type: 'node', 'way', 'relation', or 'all'
     * @returns {Object} GeoJSON FeatureCollection
     */
    async import(params) {
        this.logStart(params);
        this.resetStats();

        try {
            const { bbox, tags, elementType = 'all' } = params;

            if (!bbox || bbox.length !== 4) {
                throw new Error('Invalid bounding box. Expected [minLon, minLat, maxLon, maxLat]');
            }

            // Build Overpass QL query
            const query = this.buildOverpassQuery(bbox, tags, elementType);
            logger.debug(`[${this.name}] Overpass query: ${query}`);

            // Make request to Overpass API
            const data = await this.makeRequest('', {
                method: 'POST',
                data: query,
                headers: {
                    'Content-Type': 'text/plain',
                },
            });

            // Transform to GeoJSON
            const geojson = await this.transform(data);

            this.logComplete();
            return geojson;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Build Overpass QL query
     */
    buildOverpassQuery(bbox, tags, elementType) {
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

        let elements = [];
        if (elementType === 'all' || elementType === 'node') elements.push('node');
        if (elementType === 'all' || elementType === 'way') elements.push('way');
        if (elementType === 'all' || elementType === 'relation') elements.push('relation');

        let queries = [];

        if (tags && tags.length > 0) {
            // Query with specific tags
            tags.forEach((tag) => {
                elements.forEach((elem) => {
                    queries.push(`${elem}[${tag}](${bboxStr});`);
                });
            });
        } else {
            // Query all elements in bbox
            elements.forEach((elem) => {
                queries.push(`${elem}(${bboxStr});`);
            });
        }

        return `
      [out:json][timeout:60];
      (
        ${queries.join('\n        ')}
      );
      out geom;
    `;
    }

    /**
     * Transform OSM data to GeoJSON
     */
    async transform(osmData) {
        const features = [];

        if (!osmData.elements || osmData.elements.length === 0) {
            logger.warn(`[${this.name}] No elements found in OSM data`);
            return {
                type: 'FeatureCollection',
                features: [],
            };
        }

        this.stats.totalItems = osmData.elements.length;

        for (let i = 0; i < osmData.elements.length; i++) {
            const element = osmData.elements[i];
            const feature = this.elementToFeature(element);

            if (feature) {
                features.push(feature);
            }

            if (i % 100 === 0) {
                this.updateProgress(i, osmData.elements.length);
            }
        }

        this.updateProgress(osmData.elements.length, osmData.elements.length);

        return {
            type: 'FeatureCollection',
            features,
            metadata: {
                source: 'OpenStreetMap',
                attribution: this.config.attribution,
                importDate: new Date().toISOString(),
                count: features.length,
            },
        };
    }

    /**
     * Convert OSM element to GeoJSON feature
     */
    elementToFeature(element) {
        let geometry = null;
        const properties = {
            osmId: element.id,
            osmType: element.type,
            ...element.tags,
        };

        // Handle different element types
        if (element.type === 'node') {
            geometry = {
                type: 'Point',
                coordinates: [element.lon, element.lat],
            };
        } else if (element.type === 'way') {
            if (!element.geometry || element.geometry.length === 0) {
                return null;
            }

            const coordinates = element.geometry.map((node) => [node.lon, node.lat]);

            // Check if way is closed (polygon)
            const isClosed =
                coordinates.length > 3 &&
                coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
                coordinates[0][1] === coordinates[coordinates.length - 1][1];

            if (isClosed && this.isPolygonTag(element.tags)) {
                geometry = {
                    type: 'Polygon',
                    coordinates: [coordinates],
                };
            } else {
                geometry = {
                    type: 'LineString',
                    coordinates,
                };
            }
        } else if (element.type === 'relation') {
            // Handle relations (multipolygons, routes, etc.)
            // This is simplified - full relation handling is complex
            if (element.tags?.type === 'multipolygon') {
                geometry = this.buildMultiPolygon(element);
            }
        }

        if (!geometry) {
            return null;
        }

        return {
            type: 'Feature',
            id: `${element.type}/${element.id}`,
            geometry,
            properties,
        };
    }

    /**
     * Check if tags indicate a polygon feature
     */
    isPolygonTag(tags) {
        if (!tags) return false;

        const polygonTags = [
            'building',
            'landuse',
            'natural',
            'leisure',
            'amenity',
            'area',
            'boundary',
            'place',
        ];

        return polygonTags.some((tag) => tags.hasOwnProperty(tag));
    }

    /**
     * Build multipolygon geometry from relation
     */
    buildMultiPolygon(relation) {
        // Simplified implementation
        // Full implementation would need to handle member ways and build proper polygons
        if (!relation.members || relation.members.length === 0) {
            return null;
        }

        // This is a placeholder - proper multipolygon construction is complex
        logger.debug(`[${this.name}] Multipolygon construction not fully implemented`);
        return null;
    }

    /**
     * Import data by place name (geocode first, then import)
     */
    async importByPlace(placeName, tags) {
        logger.info(`[${this.name}] Importing data for place: ${placeName}`);

        // Use Nominatim to geocode place name
        const geocodeResult = await this.geocodePlace(placeName);

        if (!geocodeResult || !geocodeResult.boundingbox) {
            throw new Error(`Could not geocode place: ${placeName}`);
        }

        // Nominatim returns bbox as [minLat, maxLat, minLon, maxLon]
        const [minLat, maxLat, minLon, maxLon] = geocodeResult.boundingbox.map(parseFloat);
        const bbox = [minLon, minLat, maxLon, maxLat];

        return this.import({ bbox, tags });
    }

    /**
     * Geocode place name using Nominatim
     */
    async geocodePlace(placeName) {
        const nominatimUrl = 'https://nominatim.openstreetmap.org/search';

        try {
            const response = await this.httpClient.get(nominatimUrl, {
                params: {
                    q: placeName,
                    format: 'json',
                    limit: 1,
                },
            });

            if (response.data && response.data.length > 0) {
                return response.data[0];
            }

            return null;
        } catch (error) {
            logger.error(`[${this.name}] Geocoding failed:`, error);
            throw error;
        }
    }
}

module.exports = OSMImporter;
