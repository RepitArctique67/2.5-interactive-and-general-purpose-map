const logger = require('../../server/src/utils/logger');

/**
 * Batch Processor
 * Utility for processing large datasets in batches with progress tracking
 */
class BatchProcessor {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 100;
        this.concurrency = options.concurrency || 1;
        this.onProgress = options.onProgress || null;
        this.onError = options.onError || null;

        this.stats = {
            total: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            startTime: null,
            endTime: null,
            errors: [],
        };
    }

    /**
     * Process items in batches
     * @param {Array} items - Items to process
     * @param {Function} processor - Async function to process each item
     * @returns {Object} Processing statistics
     */
    async process(items, processor) {
        this.stats.total = items.length;
        this.stats.startTime = Date.now();
        this.stats.processed = 0;
        this.stats.succeeded = 0;
        this.stats.failed = 0;
        this.stats.errors = [];

        logger.info(`Starting batch processing of ${this.stats.total} items`);
        logger.info(`Batch size: ${this.batchSize}, Concurrency: ${this.concurrency}`);

        const batches = this.createBatches(items, this.batchSize);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchNumber = i + 1;
            const totalBatches = batches.length;

            logger.info(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);

            await this.processBatch(batch, processor, batchNumber);

            // Report progress
            if (this.onProgress) {
                this.onProgress({
                    ...this.stats,
                    currentBatch: batchNumber,
                    totalBatches,
                    progress: (this.stats.processed / this.stats.total) * 100,
                });
            }
        }

        this.stats.endTime = Date.now();
        const duration = (this.stats.endTime - this.stats.startTime) / 1000;

        logger.info(`Batch processing complete in ${duration.toFixed(2)}s`);
        logger.info(`Succeeded: ${this.stats.succeeded}, Failed: ${this.stats.failed}`);

        return this.stats;
    }

    /**
     * Create batches from items array
     */
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Process a single batch
     */
    async processBatch(batch, processor, batchNumber) {
        if (this.concurrency === 1) {
            // Sequential processing
            for (const item of batch) {
                await this.processItem(item, processor, batchNumber);
            }
        } else {
            // Parallel processing with concurrency limit
            const chunks = this.createBatches(batch, this.concurrency);

            for (const chunk of chunks) {
                await Promise.all(
                    chunk.map(item => this.processItem(item, processor, batchNumber))
                );
            }
        }
    }

    /**
     * Process a single item
     */
    async processItem(item, processor, batchNumber) {
        try {
            await processor(item, this.stats.processed);
            this.stats.succeeded++;
        } catch (error) {
            this.stats.failed++;

            const errorInfo = {
                item: item.id || item.name || 'unknown',
                batch: batchNumber,
                error: error.message,
                stack: error.stack,
            };

            this.stats.errors.push(errorInfo);

            logger.warn(`Failed to process item: ${errorInfo.item}`, error);

            if (this.onError) {
                this.onError(errorInfo);
            }
        } finally {
            this.stats.processed++;
        }
    }

    /**
     * Get processing statistics
     */
    getStats() {
        return {
            ...this.stats,
            duration: this.stats.endTime
                ? (this.stats.endTime - this.stats.startTime) / 1000
                : null,
            successRate: this.stats.total > 0
                ? (this.stats.succeeded / this.stats.total) * 100
                : 0,
        };
    }

    /**
     * Reset statistics
     */
    reset() {
        this.stats = {
            total: 0,
            processed: 0,
            succeeded: 0,
            failed: 0,
            startTime: null,
            endTime: null,
            errors: [],
        };
    }
}

/**
 * Process items with retry logic
 */
class RetryBatchProcessor extends BatchProcessor {
    constructor(options = {}) {
        super(options);
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    async processItem(item, processor, batchNumber) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                await processor(item, this.stats.processed);
                this.stats.succeeded++;
                return;
            } catch (error) {
                lastError = error;

                if (attempt < this.maxRetries) {
                    logger.warn(`Retry ${attempt + 1}/${this.maxRetries} for item: ${item.id || item.name}`);
                    await this.delay(this.retryDelay * (attempt + 1));
                }
            }
        }

        // All retries failed
        this.stats.failed++;

        const errorInfo = {
            item: item.id || item.name || 'unknown',
            batch: batchNumber,
            error: lastError.message,
            attempts: this.maxRetries + 1,
        };

        this.stats.errors.push(errorInfo);

        if (this.onError) {
            this.onError(errorInfo);
        }

        this.stats.processed++;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = {
    BatchProcessor,
    RetryBatchProcessor,
};
