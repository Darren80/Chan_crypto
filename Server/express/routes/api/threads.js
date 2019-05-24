const router = require('express').Router();
const config = require("../../../config");

const MongoClient = require('mongodb').MongoClient
let connectedClient;
let cryptoDB;

(async () => {

    cryptoDB = config.connectedClient.db('crypto');

})();

router.use(async (req, res, next) => {
    res.set({
        'Cache-Control': 'public, max-age=30, immutable'
    });

    if (!config.connectedClient) {
        throw new Error('mongoDB database not connected.')
    }

    next();
});

router.get('/', async (req, res, next) => {

    if (!connectedClient) {
        throw new Error('mongoDB database not connected.')
    }

    let cursor = await cryptoDB.collection('computedThreads').find().sort({ date: -1 }).limit(1);

    let document = {};
    await cursor.forEach(doc => {
        document.threads = doc.threads;
        document.date = doc.date;
    });
    //Assuming threads is an array
    // document.threads = document.threads.slice(0, 45);

    res.json(document);
});



module.exports = router;