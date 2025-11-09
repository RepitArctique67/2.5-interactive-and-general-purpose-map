const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Data route placeholder' });
});

module.exports = router;
