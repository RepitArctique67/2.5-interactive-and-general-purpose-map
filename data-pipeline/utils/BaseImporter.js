const axios = require('axios');
const logger = require('./logger');

/**
 * Base class for all data importers
 * Provides common functionality for API requests, rate limiting, error handling, and progress tracking
 */
class BaseImporter {
    constructor(config) {
        this.config = config;
        this.name = config.name || 'Unknown Importer';
        this.apiEndpoint = config.apiEndpoint;
        this.rateLimit = config.rateLimit || { requestsPerMinute: 60 };
        this.maxRetries = config.rateLimit?.maxRetries || 3;
        this.requestQueue = [];
        this.lastRequestTime = 0;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalItems: 0,
            processedItems: 0,
        };

        // Create axios instance with default config
        this.httpClient = axios.create({
            baseURL: this.apiEndpoint,
            timeout: config.timeout || 30000,
            headers: {
                'User-Agent': 'MapPlatform-DataPipeline/1.0',
                ...config.headers,
            },
        });

        // Add request interceptor for rate limiting
        this.httpClient.interceptors.request.use(
            async (config) => {
                await this.enforceRateLimit();
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for logging
        this.httpClient.interceptors.response.use(
            (response) => {
                this.stats.successfulRequests++;
                logger.debug(`[${this.name}] Request successful: ${response.config.url}`);
                return response;
            },
            (error) => {
                this.stats.failedRequests++;
                logger.error(`[${this.name}] Request failed: ${error.message}`);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Enforce rate limiting based on configuration
     */
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        let minInterval = 0;
        if (this.rateLimit.requestsPerSecond) {
            minInterval = 1000 / this.rateLimit.requestsPerSecond;
        } else if (this.rateLimit.requestsPerMinute) {
            minInterval = 60000 / this.rateLimit.requestsPerMinute;
        } else if (this.rateLimit.requestsPerHour) {
            minInterval = 3600000 / this.rateLimit.requestsPerHour;
        }

        if (timeSinceLastRequest < minInterval) {
            const waitTime = minInterval - timeSinceLastRequest;
            logger.debug(`[${this.name}] Rate limiting: waiting ${waitTime}ms`);
            await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
        this.stats.totalRequests++;
    }

    /**
     * Sleep utility for rate limiting
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, options = {}, retryCount = 0) {
        try {
            const response = await this.httpClient.request({
                url,
                ...options,
            });
            return response.data;
        } catch (error) {
            if (retryCount < this.maxRetries) {
                const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                logger.warn(
                    `[${this.name}] Request failed, retrying in ${backoffTime}ms (attempt ${retryCount + 1}/${this.maxRetries})`
                );
                await this.sleep(backoffTime);
                return this.makeRequest(url, options, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Update progress tracking
     */
    updateProgress(processed, total) {
        this.stats.processedItems = processed;
        this.stats.totalItems = total;
        const percentage = total > 0 ? ((processed / total) * 100).toFixed(2) : 0;
        logger.info(`[${this.name}] Progress: ${processed}/${total} (${percentage}%)`);
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate:
                this.stats.totalRequests > 0
                    ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2)
                    : 0,
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalItems: 0,
            processedItems: 0,
        };
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.apiEndpoint && !this.config.uploadBased) {
            throw new Error(`[${this.name}] API endpoint is required`);
        }
        if (this.config.apiKeyRequired && !this.getApiKey()) {
            logger.warn(`[${this.name}] API key is required but not provided. Importer will be disabled.`);
            return false;
        }
        return true;
    }

    /**
     * Get API key from environment variable
     */
    getApiKey() {
        if (this.config.apiKeyEnvVar) {
            return process.env[this.config.apiKeyEnvVar];
        }
        return null;
    }

    /**
     * Abstract method to be implemented by subclasses
     */
    async import(params) {
        throw new Error(`[${this.name}] import() method must be implemented by subclass`);
    }

    /**
     * Abstract method to transform data to standard format
     */
    async transform(data) {
        throw new Error(`[${this.name}] transform() method must be implemented by subclass`);
    }

    /**
     * Log import start
     */
    logStart(params) {
        logger.info(`[${this.name}] Starting import with params:`, params);
    }

    /**
     * Log import completion
     */
    logComplete() {
        const stats = this.getStats();
        logger.info(`[${this.name}] Import completed. Stats:`, stats);
    }

    /**
     * Log import error
     */
    logError(error) {
        logger.error(`[${this.name}] Import failed:`, error);
    }
}

module.exports = BaseImporter;
