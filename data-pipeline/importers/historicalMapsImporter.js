const BaseImporter = require('../utils/BaseImporter');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Historical Maps importer
 * Handles upload and processing of historical map images
 */
class HistoricalMapsImporter extends BaseImporter {
    constructor(config) {
        super(config);
        this.supportedFormats = config.supportedFormats || ['tiff', 'geotiff', 'png', 'jpeg', 'jpg'];
        this.maxFileSize = this.parseFileSize(config.maxFileSize || '100MB');
        this.uploadDir = path.join(__dirname, '../../uploads/historical-maps');
    }

    /**
     * Parse file size string to bytes
     */
    parseFileSize(sizeStr) {
        const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        const match = sizeStr.match(/^(\d+)(B|KB|MB|GB)$/i);
        if (!match) return 100 * 1024 * 1024; // Default 100MB
        return parseInt(match[1]) * units[match[2].toUpperCase()];
    }

    /**
     * Import historical map from file upload
     * @param {Object} params - Import parameters
     * @param {String} params.filePath - Path to uploaded file
     * @param {Object} params.metadata - Map metadata
     * @param {Array} params.gcps - Ground Control Points for georeferencing
     * @returns {Object} Processed map data
     */
    async import(params) {
        this.logStart(params);
        this.resetStats();

        try {
            const { filePath, metadata = {}, gcps = [] } = params;

            if (!filePath) {
                throw new Error('File path is required');
            }

            // Validate file
            await this.validateFile(filePath);

            // Extract metadata
            const fileMetadata = await this.extractMetadata(filePath);

            // Process georeferencing if GCPs provided
            let georeference = null;
            if (gcps.length >= 3) {
                georeference = this.processGeoreferencing(gcps);
            }

            // Create map record
            const mapData = {
                id: this.generateMapId(),
                fileName: path.basename(filePath),
                filePath: filePath,
                uploadDate: new Date().toISOString(),
                metadata: {
                    ...fileMetadata,
                    ...metadata,
                },
                georeference,
                status: georeference ? 'georeferenced' : 'uploaded',
            };

            this.stats.processedItems = 1;
            this.stats.totalItems = 1;

            this.logComplete();
            return mapData;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Validate uploaded file
     */
    async validateFile(filePath) {
        // Check if file exists
        try {
            const stats = await fs.stat(filePath);

            // Check file size
            if (stats.size > this.maxFileSize) {
                throw new Error(
                    `File size (${this.formatFileSize(stats.size)}) exceeds maximum allowed size (${this.formatFileSize(this.maxFileSize)})`
                );
            }

            // Check file extension
            const ext = path.extname(filePath).toLowerCase().slice(1);
            if (!this.supportedFormats.includes(ext)) {
                throw new Error(
                    `Unsupported file format: ${ext}. Supported formats: ${this.supportedFormats.join(', ')}`
                );
            }

            logger.info(`[${this.name}] File validation passed: ${filePath}`);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            }
            throw error;
        }
    }

    /**
     * Extract metadata from file
     */
    async extractMetadata(filePath) {
        const stats = await fs.stat(filePath);
        const ext = path.extname(filePath).toLowerCase().slice(1);

        const metadata = {
            format: ext,
            fileSize: stats.size,
            fileSizeFormatted: this.formatFileSize(stats.size),
            uploadedAt: stats.birthtime,
            modifiedAt: stats.mtime,
        };

        // For GeoTIFF files, we would extract additional geospatial metadata
        // This would require gdal or similar library
        if (ext === 'geotiff' || ext === 'tiff') {
            metadata.isGeoTiff = true;
            // Placeholder for GDAL metadata extraction
            logger.info(`[${this.name}] GeoTIFF detected. Full metadata extraction requires GDAL.`);
        }

        return metadata;
    }

    /**
     * Process georeferencing from Ground Control Points
     */
    processGeoreferencing(gcps) {
        if (gcps.length < 3) {
            throw new Error('At least 3 Ground Control Points are required for georeferencing');
        }

        // Validate GCP format
        gcps.forEach((gcp, index) => {
            if (!gcp.pixel || !gcp.line || !gcp.lon || !gcp.lat) {
                throw new Error(`Invalid GCP at index ${index}. Required: pixel, line, lon, lat`);
            }
        });

        // Calculate transformation parameters
        // This is a simplified implementation
        // Full implementation would use polynomial transformation or thin plate spline
        const bounds = this.calculateBounds(gcps);

        return {
            gcps,
            bounds,
            transformationType: 'affine',
            coordinateSystem: 'EPSG:4326',
            accuracy: this.calculateAccuracy(gcps),
        };
    }

    /**
     * Calculate geographic bounds from GCPs
     */
    calculateBounds(gcps) {
        const lons = gcps.map((gcp) => gcp.lon);
        const lats = gcps.map((gcp) => gcp.lat);

        return {
            minLon: Math.min(...lons),
            maxLon: Math.max(...lons),
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
        };
    }

    /**
     * Calculate georeferencing accuracy estimate
     */
    calculateAccuracy(gcps) {
        // Simplified accuracy calculation
        // In practice, this would involve residual analysis
        return {
            gcpCount: gcps.length,
            estimatedRMSE: 'Not calculated',
            quality: gcps.length >= 6 ? 'good' : gcps.length >= 4 ? 'fair' : 'poor',
        };
    }

    /**
     * Generate unique map ID
     */
    generateMapId() {
        return `hist_map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Import from external archive (David Rumsey, Library of Congress, etc.)
     */
    async importFromArchive(params) {
        const { archiveName, mapId, downloadUrl } = params;

        logger.info(`[${this.name}] Importing from archive: ${archiveName}, Map ID: ${mapId}`);

        // This would download the map from the archive
        // Placeholder implementation
        return {
            id: this.generateMapId(),
            source: archiveName,
            sourceMapId: mapId,
            downloadUrl,
            status: 'pending_download',
            importDate: new Date().toISOString(),
        };
    }

    /**
     * Transform method (required by base class)
     */
    async transform(data) {
        // Historical maps don't need transformation in the same way as other importers
        return data;
    }
}

module.exports = HistoricalMapsImporter;
