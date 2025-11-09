const express = require('express');
const router = express.Router();
const layerController = require('../controllers/layerController');
const { authenticate, authorize } = require('../middleware/auth');
const { layerValidators } = require('../middleware/validation');

// Routes publiques
router.get('/', layerController.getAll);
router.get('/:id', layerController.getById);
router.get('/:id/features', layerController.getFeatures);

// Routes protégées (admin)
router.post('/',
    authenticate,
    authorize('admin'),
    layerValidators.create,
    layerController.create
);

router.put('/:id',
    authenticate,
    authorize('admin'),
    layerValidators.update,
    layerController.update
);

router.delete('/:id',
    authenticate,
    authorize('admin'),
    layerController.delete
);

module.exports = router;
