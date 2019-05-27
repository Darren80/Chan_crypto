const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/threads', require('./threads'));

module.exports = router;