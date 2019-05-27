const express = require('express');
const router = express.Router();

const compression = require('compression');
const bodyParser = require("body-parser");

router.use(compression());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.send(200);
    } else {
        return next();
    }
});

module.exports = router;