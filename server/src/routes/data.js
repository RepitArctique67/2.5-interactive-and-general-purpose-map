const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/features', dataController.getFeatures);
router.get('/nearby', dataController.getNearby);
router.post('/polygon', dataController.getInPolygon);
router.get('/heatmap', dataController.getHeatmap);
router.get('/stats', dataController.getStats);

module.exports = router;
