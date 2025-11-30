const path = require('path');
const logger = require('../utils/logger');

// Import pipeline modules
// Note: In a production environment, these might be separate microservices
// For this monolith, we require them directly
const pipelineRoot = path.join(__dirname, '../../../data-pipeline');
const Scheduler = require(path.join(pipelineRoot, 'jobs/scheduler'));
const OSMImporter = require(path.join(pipelineRoot, 'importers/osmImporter'));
const config = require(path.join(pipelineRoot, 'config/sources.json'));

class PipelineService {
    constructor() {
        this.scheduler = new Scheduler();
        this.activeJobs = new Map();
    }

    /**
     * Initialize pipeline (start scheduler)
     */
    initialize() {
        try {
            this.scheduler.start();
            logger.info('Pipeline scheduler initialized');
        } catch (error) {
            logger.error('Failed to initialize pipeline scheduler:', error);
        }
    }

    /**
     * Trigger an import job manually
     */
    async triggerImport(source, params) {
        logger.info(`Triggering manual import for ${source}`, params);

        const jobId = `job_${Date.now()}`;
        this.activeJobs.set(jobId, { status: 'running', source, startTime: new Date() });

        // Run async
        this.runImport(jobId, source, params).catch(err => {
            logger.error(`Import job ${jobId} failed:`, err);
            this.activeJobs.set(jobId, { status: 'failed', error: err.message, endTime: new Date() });
        });

        return { jobId, status: 'started' };
    }

    /**
     * Run the import logic
     */
    async runImport(jobId, source, params) {
        let importer;

        if (source === 'openstreetmap') {
            importer = new OSMImporter(config.dataSources.openstreetmap);
        } else {
            throw new Error(`Unknown source: ${source}`);
        }

        const result = await importer.import(params);

        this.activeJobs.set(jobId, {
            status: 'completed',
            source,
            resultSummary: { count: result.features?.length || 0 },
            endTime: new Date()
        });
    }

    /**
     * Get job status
     */
    getJobStatus(jobId) {
        return this.activeJobs.get(jobId);
    }

    /**
     * Get all jobs
     */
    getAllJobs() {
        return Array.from(this.activeJobs.entries()).map(([id, data]) => ({ id, ...data }));
    }
}

module.exports = new PipelineService();
