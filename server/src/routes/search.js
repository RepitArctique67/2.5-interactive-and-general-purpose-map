const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.search);
router.get('/reverse', searchController.reverse);
router.get('/suggestions', searchController.suggestions);

module.exports = router;
