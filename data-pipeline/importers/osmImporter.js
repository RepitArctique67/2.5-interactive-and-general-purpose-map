const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { BatchProcessor } = require('../processors/batchProcessor');
const { GeoFeature } = require('../../server/src/models');
const logger = require('../../server/src/utils/logger');

/**
 * OpenStreetMap Importer
 * Imports OSM XML data into the database
 */
class OSMImporter {
    constructor(layerId) {
        this.layerId = layerId;
        this.batchProcessor = new BatchProcessor({ batchSize: 500 });
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
    }

    /**
     * Import OSM XML file
     * @param {String} filePath - Path to OSM XML file
     * @param {Object} options - Import options
     */
    async import(filePath, options = {}) {
        try {
            logger.info(`Starting OSM import from ${filePath}`);

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const osmData = this.parser.parse(fileContent);

            if (!osmData.osm) {
                throw new Error('Invalid OSM XML format');
            }

            const nodes = this.indexNodes(osmData.osm.node);
            const ways = osmData.osm.way || [];
            const relations = osmData.osm.relation || [];

            logger.info(`Found ${Object.keys(nodes).length} nodes, ${ways.length} ways, ${relations.length} relations`);

            // Process ways (polygons and lines)
            const features = [];

            // Filter relevant ways based on tags
            const relevantWays = ways.filter(way => this.isRelevant(way, options.tags));

            for (const way of relevantWays) {
                const feature = this.convertWayToFeature(way, nodes, options);
                if (feature) {
                    features.push(feature);
                }
            }

            logger.info(`Converted ${features.length} relevant features`);

            // Batch insert features
            const stats = await this.batchProcessor.process(features, async (feature) => {
                await GeoFeature.create(feature);
            });

            return stats;

        } catch (error) {
            logger.error('Error importing OSM data:', error);
            throw error;
        }
    }

    /**
     * Index nodes by ID for quick lookup
     */
    indexNodes(nodes = []) {
        const index = {};
        if (!Array.isArray(nodes)) nodes = [nodes];

        for (const node of nodes) {
            index[node['@_id']] = {
                lat: parseFloat(node['@_lat']),
                lon: parseFloat(node['@_lon']),
            };
        }
        return index;
    }

    /**
     * Check if element is relevant based on tags
     */
    isRelevant(element, targetTags = []) {
        if (!targetTags || targetTags.length === 0) return true;

        const tags = this.parseTags(element.tag);
        return targetTags.some(tag => tags[tag] !== undefined);
    }

    /**
     * Parse tags array into object
     */
    parseTags(tags = []) {
        const result = {};
        if (!Array.isArray(tags)) tags = [tags];

        for (const tag of tags) {
            result[tag['@_k']] = tag['@_v'];
        }
        return result;
    }

    /**
     * Convert OSM way to GeoFeature
     */
    convertWayToFeature(way, nodeIndex, options) {
        try {
            const nds = way.nd;
            if (!nds || nds.length < 2) return null;

            const coordinates = [];
            for (const nd of Array.isArray(nds) ? nds : [nds]) {
                const node = nodeIndex[nd['@_ref']];
                if (node) {
                    coordinates.push([node.lon, node.lat]);
                }
            }

            if (coordinates.length < 2) return null;

            const tags = this.parseTags(way.tag);

            // Determine geometry type
            const isClosed =
                coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
                coordinates[0][1] === coordinates[coordinates.length - 1][1];

            // Simple heuristic for polygon vs line
            // In real OSM, area=yes or specific tags define polygons
            const isPolygon = isClosed && (
                tags.building ||
                tags.landuse ||
                tags.natural ||
                tags.area === 'yes'
            );

            let geometry;
            let type;

            if (isPolygon) {
                geometry = {
                    type: 'Polygon',
                    coordinates: [coordinates],
                };
                type = 'polygon';
            } else {
                geometry = {
                    type: 'LineString',
                    coordinates: coordinates,
                };
                type = 'line';
            }

            return {
                layerId: this.layerId,
                name: tags.name || tags['name:en'] || `OSM Way ${way['@_id']}`,
                type: type,
                geometry: geometry,
                properties: {
                    osm_id: way['@_id'],
                    ...tags,
                },
                validFrom: options.validFrom || null,
                validTo: options.validTo || null,
            };

        } catch (error) {
            logger.warn(`Failed to convert way ${way['@_id']}: ${error.message}`);
            return null;
        }
    }
}

module.exports = OSMImporter;
