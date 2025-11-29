/**
 * Metadata Generator
 * Generates automated metadata and descriptions for map features
 */
class MetadataGenerator {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Generate metadata for a feature
     * @param {Object} feature - GeoJSON feature
     * @returns {Object} Enriched metadata
     */
    generate(feature) {
        const props = feature.properties || {};
        const metadata = {
            generatedAt: new Date().toISOString(),
            tags: this.generateTags(feature),
            qualityScore: this.calculateQualityScore(feature),
            description: this.generateDescription(feature)
        };

        return metadata;
    }

    /**
     * Generate tags based on properties
     */
    generateTags(feature) {
        const tags = new Set();
        const props = feature.properties || {};

        // Add type-based tags
        if (props.building) tags.add('building');
        if (props.highway) tags.add('road');
        if (props.natural) tags.add('natural');
        if (props.amenity) tags.add(props.amenity);

        // Add geometry-based tags
        tags.add(feature.geometry.type.toLowerCase());

        return Array.from(tags);
    }

    /**
     * Calculate data quality score (0-100)
     */
    calculateQualityScore(feature) {
        let score = 100;
        const props = feature.properties || {};

        // Penalize missing name
        if (!props.name) score -= 20;

        // Penalize missing specific attributes
        if (props.building && !props['building:levels']) score -= 10;

        return Math.max(0, score);
    }

    /**
     * Generate natural language description
     */
    generateDescription(feature) {
        const props = feature.properties || {};
        const name = props.name || 'Unnamed feature';
        const type = props.amenity || props.building || props.natural || 'feature';

        return `${name} is a ${type} located at [coordinates].`;
    }
}

module.exports = MetadataGenerator;
