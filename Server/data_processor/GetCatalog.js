const shell = require('shelljs');
const process = require('process');

const Posts = require('./GetAllPosts');
const cUrls = require('./config').urls;


const fetch = require('node-fetch');
const crypto = require('crypto');
const _ = require("underscore");

const corsProxy = "https://cors-proxy-0.herokuapp.com/";
const board = "biz";
const MongoClient = require('mongodb').MongoClient
let connectedClient;

const analyser = require('./dataAnalyser');

loginToMongo();

if (process.pid && shell.which('renice')) {
    shell.exec(`renice -n 10 -p ${process.pid}`);
    console.log("Process re-niced");
}

function loginToMongo() {
    MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
        useNewUrlParser: true
    }, (err, client) => {
        if (err) {
            console.log(err);
            return;
        }
        connectedClient = client;
        // db.collection('archiveThreads').createIndex({ date: -1 }, { unique: true });
        // db.collection('computedThreads').createIndex({ date: -1 }, { unique: true });

        updateTXT();
        updater(0);
        // skipToStep2();
        // skipToStep3();
        // debug();
    });
}

async function debug() {
    let db = connectedClient.db('crypto');
    let max = db.collection('computedThreads').find().sort({ date: -1 }).limit(1);
    let threads;
    await max.forEach(doc => {
        threads = doc.threads;
    });

    let sorted = _.sortBy(threads, (thread) => { return thread.posts[0].Ωunique_word_count }).reverse();
    console.log(sorted);
}

async function skipToStep2() {
    let db = connectedClient.db('crypto');
    let max = db.collection('archiveThreads').find().sort({ date: -1 }).limit(1);
    let threads;
    await max.forEach(doc => {
        threads = doc;
    });

    new analyser(threads.date, threads.threads, connectedClient);
}

async function skipToStep3() {
    let db = connectedClient.db('crypto');
    let max = db.collection('computedThreads').find().sort({ date: -1 }).limit(1);
    let threads;
    await max.forEach(doc => {
        threads = doc;
    });

    new analyser(threads.date, threads.threads, connectedClient);
}

var date = Date.now();
function updater(delta) {
    console.log(`Time till next update ${delta} minutes.`);

    setTimeout(() => {
        fetchBoardCatalog();

        let updateDelta = utils.cryptoRandom(15, 30); //Generate a random time between 10 and 30 minutes to make the timing of retrivals more unpredicatable.
        date = Date.now() + (updateDelta * 60000);

        updater(updateDelta);
    }, delta * 60000);


}
function updateTXT() {
    setInterval(() => {
        console.log(`Time till next update ${(new Date(date) - new Date()) / 1000 / 60} minutes.`);
    }, 120000);
}

async function fetchBoardCatalog(i = 0) {
    //Retrive the latest /biz/ catalog, with fallback urls


    try {
        const response = await fetch(cUrls.catalogUrls[i]);

        if (response.ok) {
            const jsonResponse = await response.json();
            let catalog = jsonResponse;

            prepareCatalog(catalog);
        } else {
            throw new Error(`Error, response code = ${response.status}`);
        }
    } catch (e) {
        console.log(e);

        if (i === cUrls.catalogUrls.length - 1) { 
            return `All the url's tried failed, no more fallback url's avaliable: ${e}`;
        } else {
            fetchBoardCatalog(i + 1);
        }
    }
}

// module.exports = fetchBoardCatalog;

async function prepareCatalog(catalog) {

    //Filter out mod posts
    //Extract all threads from catalog pages
    //The threads don't contain every post so they will be named partialThreads
    let partialThreads = catalog.reduce((partialThreads, page) => {
        page.threads.forEach(thread => {
            if (thread.capcode === 'mod') { return }
            partialThreads.push(thread);
        });
        return partialThreads;
    }, []);


    // let db = connectedClient.db('crypto');

    // db.collection('catalogs').insertOne({
    //     date: Date.now,
    //     allThreads: allThreads
    // });

    let posts = new Posts(partialThreads, connectedClient);
    posts.getFullThreads();

}

//Utilites

let utils = {
    cryptoRandom(min, max) { // Generate a random time between min and max. min and max included.

        //Generate two cryptographically random, unsigned 32-bit integers
        let array = new Uint32Array(2);
        for (let i = 0; i < 2; i++) {
            let rand = crypto.randomBytes(4).toString('hex');
            array[i] = parseInt(rand, 16)
        }

        // keep all 32 bits of the the first, top 20 of the second for 52 random bits
        let mantissa = (array[0] * Math.pow(2, 20)) + (array[1] >>> 12)
        // shift all 52 bits to the right of the decimal point
        let result = mantissa * Math.pow(2, -52);

        if (!min || !max) {
            min = 0; max = 1;
        }
        //
        return Math.floor(result * (max - min + 1) + min);
    }
}