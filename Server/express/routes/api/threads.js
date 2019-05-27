const router = require('express').Router();

const connectedClient = require("../../../config").connectedClient;
let cryptoDB = connectedClient.db('crypto');

(async () => {

})();

router.use(async (req, res, next) => {
    res.set({
        'Cache-Control': 'public, max-age=30, immutable'
    });

    if (!connectedClient) {
        throw new Error('mongoDB database not connected.')
    }

    next();
});

router.get('/', async (req, res, next) => {

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

router.get('/timeline', async (req, res) => {

    let past7days = new Date();
    let past14days = new Date();

    past7days.setDate(past7days.getDate() - 7);
    past14days.setDate(past14days.getDate() - 14);

    let computedCursor = await cryptoDB.collection('computedThreads').find({ date: { $gt: past14days.getTime() } }).project({ date: 1 }).limit(10000);

    let acrhivalDates = [];
    await computedCursor.forEach(date => {
        acrhivalDates.push(new Date(date.date));
    })

    res.json(acrhivalDates);

});

router.post('/timeline', async (req, res) => {

    let dateToFind = new Date(req.body.date);

    let computedCursor = await cryptoDB.collection('computedThreads').find({ date: dateToFind.getTime() }).limit(1);

    if (await computedCursor.count() === 0) {
        res.status(404).json('That item does not exist.');
    } else {
        await computedCursor.forEach(foundDoc => {
            res.json(foundDoc);
        });
    }
});

module.exports = router;