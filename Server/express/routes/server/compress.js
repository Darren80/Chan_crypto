const express = require('express');
const router = express.Router();

const compress = require('../../utils/compress');

router.post('/compress', async (req, res, next) => {

    try {
        await compress.imageminLossless(req.body.filename);
        await compress.imageminLossy(req.body.filename);
        compress.convertToWebP(req.body.filename);
        res.send('Image optimised.');
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

module.exports = router;