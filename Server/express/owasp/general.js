const express = require('express');
const router = express.Router();

const compression = require('compression');

router.use(compression());

module.exports = router;