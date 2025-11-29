const pipelineService = require('../services/pipelineService');

const pipelineController = {
    /**
     * Trigger a manual import
     * POST /api/v1/pipeline/import/:source
     */
    async triggerImport(req, res, next) {
        try {
            const { source } = req.params;
            const params = req.body;

            const result = await pipelineService.triggerImport(source, params);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get job status
     * GET /api/v1/pipeline/status/:jobId
     */
    async getJobStatus(req, res, next) {
        try {
            const { jobId } = req.params;
            const status = pipelineService.getJobStatus(jobId);

            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Job not found'
                });
            }

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * List all jobs
     * GET /api/v1/pipeline/jobs
     */
    async listJobs(req, res, next) {
        try {
            const jobs = pipelineService.getAllJobs();

            res.json({
                success: true,
                data: jobs
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = pipelineController;
