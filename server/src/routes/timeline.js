const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', timelineController.getAll);
router.get('/nearby', timelineController.getNearby);
router.get('/:id', timelineController.getById);

// Protected routes
router.post('/', authenticate, authorize('admin', 'contributor'), timelineController.create);
router.put('/:id', authenticate, authorize('admin', 'contributor'), timelineController.update);
router.delete('/:id', authenticate, authorize('admin'), timelineController.delete);

module.exports = router;
