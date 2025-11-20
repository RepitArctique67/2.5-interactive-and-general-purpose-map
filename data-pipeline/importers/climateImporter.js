const BaseImporter = require('../utils/BaseImporter');
const logger = require('../utils/logger');

/**
 * NOAA Climate Data importer
 * Imports historical weather data, climate normals, and extreme events
 */
class ClimateImporter extends BaseImporter {
    constructor(config) {
        super(config);
        this.apiKey = this.getApiKey();
    }

    /**
     * Import climate data from NOAA NCDC
     * @param {Object} params - Import parameters
     * @param {String} params.datasetId - Dataset ID (e.g., 'GHCND' for daily summaries)
     * @param {String} params.startDate - Start date (YYYY-MM-DD)
     * @param {String} params.endDate - End date (YYYY-MM-DD)
     * @param {String} params.locationId - Location ID (station ID)
     * @param {Array} params.datatypeIds - Data type IDs to retrieve
     * @returns {Object} Climate data with temporal and spatial information
     */
    async import(params) {
        if (!this.apiKey) {
            logger.warn(`[${this.name}] API key not available. Using mock data.`);
            return this.getMockClimateData(params);
        }

        this.logStart(params);
        this.resetStats();

        try {
            const { datasetId = 'GHCND', startDate, endDate, locationId, datatypeIds, limit = 1000 } = params;

            if (!startDate || !endDate) {
                throw new Error('Start date and end date are required');
            }

            const queryParams = {
                datasetid: datasetId,
                startdate: startDate,
                enddate: endDate,
                limit,
                units: 'metric',
            };

            if (locationId) {
                queryParams.locationid = locationId;
            }

            if (datatypeIds && datatypeIds.length > 0) {
                queryParams.datatypeid = datatypeIds.join(',');
            }

            const data = await this.makeRequest('/data', {
                method: 'GET',
                params: queryParams,
                headers: {
                    token: this.apiKey,
                },
            });

            const transformed = await this.transform(data);
            this.logComplete();
            return transformed;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Get available datasets
     */
    async getDatasets() {
        if (!this.apiKey) {
            return this.getMockDatasets();
        }

        try {
            const data = await this.makeRequest('/datasets', {
                method: 'GET',
                params: { limit: 100 },
                headers: {
                    token: this.apiKey,
                },
            });

            return data.results || [];
        } catch (error) {
            logger.error(`[${this.name}] Failed to fetch datasets:`, error);
            throw error;
        }
    }

    /**
     * Get available data types for a dataset
     */
    async getDataTypes(datasetId) {
        if (!this.apiKey) {
            return this.getMockDataTypes();
        }

        try {
            const data = await this.makeRequest('/datatypes', {
                method: 'GET',
                params: {
                    datasetid: datasetId,
                    limit: 100,
                },
                headers: {
                    token: this.apiKey,
                },
            });

            return data.results || [];
        } catch (error) {
            logger.error(`[${this.name}] Failed to fetch data types:`, error);
            throw error;
        }
    }

    /**
     * Search for weather stations
     */
    async searchStations(params = {}) {
        if (!this.apiKey) {
            return this.getMockStations();
        }

        try {
            const { datasetId, locationId, extent, limit = 100 } = params;

            const queryParams = { limit };

            if (datasetId) {
                queryParams.datasetid = datasetId;
            }

            if (locationId) {
                queryParams.locationid = locationId;
            }

            if (extent) {
                // extent should be [minLat, minLon, maxLat, maxLon]
                queryParams.extent = extent.join(',');
            }

            const data = await this.makeRequest('/stations', {
                method: 'GET',
                params: queryParams,
                headers: {
                    token: this.apiKey,
                },
            });

            return data.results || [];
        } catch (error) {
            logger.error(`[${this.name}] Failed to search stations:`, error);
            throw error;
        }
    }

    /**
     * Transform NOAA data to standardized format
     */
    async transform(data) {
        if (!data.results || data.results.length === 0) {
            logger.warn(`[${this.name}] No climate data found`);
            return {
                type: 'TimeSeries',
                data: [],
                metadata: {
                    source: 'NOAA NCDC',
                    count: 0,
                },
            };
        }

        this.stats.totalItems = data.results.length;
        const timeSeries = [];

        for (let i = 0; i < data.results.length; i++) {
            const record = data.results[i];

            timeSeries.push({
                date: record.date,
                station: record.station,
                datatype: record.datatype,
                value: record.value,
                attributes: record.attributes || '',
            });

            if (i % 100 === 0) {
                this.updateProgress(i, data.results.length);
            }
        }

        this.updateProgress(data.results.length, data.results.length);

        return {
            type: 'TimeSeries',
            data: timeSeries,
            metadata: {
                source: 'NOAA NCDC',
                attribution: this.config.attribution,
                importDate: new Date().toISOString(),
                count: timeSeries.length,
            },
        };
    }

    /**
     * Get mock climate data (for when API key is not available)
     */
    getMockClimateData(params) {
        logger.info(`[${this.name}] Returning mock climate data`);

        const { startDate, endDate } = params;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const data = [];

        // Generate mock daily temperature data
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            data.push({
                date: dateStr,
                station: 'MOCK_STATION_001',
                datatype: 'TMAX',
                value: Math.round(15 + Math.random() * 20), // 15-35°C
                attributes: 'mock',
            });

            data.push({
                date: dateStr,
                station: 'MOCK_STATION_001',
                datatype: 'TMIN',
                value: Math.round(5 + Math.random() * 15), // 5-20°C
                attributes: 'mock',
            });

            data.push({
                date: dateStr,
                station: 'MOCK_STATION_001',
                datatype: 'PRCP',
                value: Math.round(Math.random() * 50), // 0-50mm
                attributes: 'mock',
            });
        }

        return {
            type: 'TimeSeries',
            data,
            metadata: {
                source: 'NOAA NCDC (Mock Data)',
                attribution: 'Mock data for demonstration',
                importDate: new Date().toISOString(),
                count: data.length,
            },
        };
    }

    /**
     * Get mock datasets
     */
    getMockDatasets() {
        return [
            {
                id: 'GHCND',
                name: 'Daily Summaries',
                description: 'Global Historical Climatology Network - Daily',
            },
            {
                id: 'GSOM',
                name: 'Global Summary of the Month',
                description: 'Monthly climate summaries',
            },
            {
                id: 'GSOY',
                name: 'Global Summary of the Year',
                description: 'Annual climate summaries',
            },
        ];
    }

    /**
     * Get mock data types
     */
    getMockDataTypes() {
        return [
            { id: 'TMAX', name: 'Maximum temperature', units: '°C' },
            { id: 'TMIN', name: 'Minimum temperature', units: '°C' },
            { id: 'PRCP', name: 'Precipitation', units: 'mm' },
            { id: 'SNOW', name: 'Snowfall', units: 'mm' },
            { id: 'AWND', name: 'Average wind speed', units: 'm/s' },
        ];
    }

    /**
     * Get mock stations
     */
    getMockStations() {
        return [
            {
                id: 'MOCK_STATION_001',
                name: 'Mock Weather Station 1',
                latitude: 48.8566,
                longitude: 2.3522,
                elevation: 35,
            },
            {
                id: 'MOCK_STATION_002',
                name: 'Mock Weather Station 2',
                latitude: 40.7128,
                longitude: -74.006,
                elevation: 10,
            },
        ];
    }
}

module.exports = ClimateImporter;
