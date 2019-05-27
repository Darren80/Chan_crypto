const express = require('express');
const router = express.Router();

router.use(require('./compress'));
router.use(require('./manager'));

module.exports = router;