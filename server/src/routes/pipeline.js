const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');
const auth = require('../middleware/auth');

// Protect all pipeline routes with auth middleware
// In a real app, we'd check for admin role
router.use(auth);

router.post('/import/:source', pipelineController.triggerImport);
router.get('/status/:jobId', pipelineController.getJobStatus);
router.get('/jobs', pipelineController.listJobs);

module.exports = router;
