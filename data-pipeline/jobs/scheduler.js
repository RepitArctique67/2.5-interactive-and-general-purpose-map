const cron = require('node-cron');
const logger = require('../utils/logger');
const config = require('../config/sources.json');

// Import job handlers
const DataUpdater = require('./dataUpdater');
const CacheWarmer = require('./cacheWarmer');
const QualityChecker = require('./qualityChecker');
const ReportGenerator = require('./reportGenerator');

/**
 * Job Scheduler
 * Manages scheduled tasks for the data pipeline
 */
class Scheduler {
    constructor() {
        this.jobs = new Map();
        this.handlers = {
            dataUpdater: new DataUpdater(),
            cacheWarmer: new CacheWarmer(),
            qualityChecker: new QualityChecker(),
            reportGenerator: new ReportGenerator()
        };
    }

    /**
     * Initialize and start all configured jobs
     */
    start() {
        logger.info('[Scheduler] Starting job scheduler...');

        const jobConfig = config.scheduledJobs;

        Object.keys(jobConfig).forEach(jobName => {
            const settings = jobConfig[jobName];

            if (settings.enabled) {
                this.scheduleJob(jobName, settings.schedule, settings.description);
            }
        });
    }

    /**
     * Schedule a specific job
     */
    scheduleJob(name, cronExpression, description) {
        if (!this.handlers[name]) {
            logger.warn(`[Scheduler] No handler found for job: ${name}`);
            return;
        }

        logger.info(`[Scheduler] Scheduling ${name} (${description}) with schedule: ${cronExpression}`);

        const task = cron.schedule(cronExpression, async () => {
            logger.info(`[Scheduler] Starting job: ${name}`);
            try {
                await this.handlers[name].run();
                logger.info(`[Scheduler] Job completed: ${name}`);
            } catch (error) {
                logger.error(`[Scheduler] Job failed: ${name}`, error);
            }
        });

        this.jobs.set(name, task);
    }

    /**
     * Stop all jobs
     */
    stop() {
        logger.info('[Scheduler] Stopping all jobs...');
        this.jobs.forEach(job => job.stop());
        this.jobs.clear();
    }
}

module.exports = Scheduler;
