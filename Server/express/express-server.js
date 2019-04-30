const express = require('express');
const vhost = require('vhost');
const compression = require('compression');
const path = require('path');
const mime = require('mime-types');
const bodyParser = require("body-parser");

const compress = require('./utils/compress');


require('jpegtran-bin');
const globby = require('globby');

const os = require('os');
// const fetch = require('node-fetch');
const _ = require("underscore");

const app = express();
const owaspApp = express();

const MongoClient = require('mongodb').MongoClient
let connectedClient;
let cryptoDB;

(async () => { //Login to mongoDB
  connectedClient = await MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
    useNewUrlParser: true
  });
  cryptoDB = connectedClient.db('crypto');
})();

app.use((req, res, next) => {
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

app.use(compression());
owaspApp.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/compress', async (req, res, next) => {

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

app.use('/', express.static(path.join('/root/chan_crypto', 'build'),
  {
    setHeaders: (res, path) => {
      let mimeType = mime.lookup(path);

      if (mimeType.includes('html')) {
        res.setHeader('Cache-Control', `public, max-age=${10}`);
      } else if (mimeType.includes('video') || mimeType.includes('image') || mimeType.includes('audio')) {
        res.setHeader('Cache-Control', `public, max-age=${31536000}, immutable`);
      } else {
        res.setHeader('Cache-Control', `public, max-age=${31536000}, immutable`);
      }
    }
  }));


// owaspApp.use(function (req, res, next) {
//   console.log(req);

//   next();
// })

owaspApp.use(express.static(path.join(os.homedir(), 'CheatSheetSeries-master/generated/site')));
// owaspApp.get('/', async (req, res, next) => {
//   res.sendFile(path.join(os.homedir(), 'CheatSheetSeries-master/generated/site/index.html'));
// });

app.get('/loaderio', function (req, res) {
  res.sendFile(path.join(__dirname, 'loaderio-33196ca9af06d56ed7516a874a8089d6.txt'));
});

app.all('/api/threads', async (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=30, immutable'
  });
  next();
})
app.all('/api/timeline', async (req, res, next) => {
  res.set({
    'Cache-Control': 'public, max-age=30, immutable'
  });
  next();
})

app.get('/api/threads', async (req, res) => {

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

app.get('/api/timeline', async (req, res) => {

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

app.post('/api/timeline', async (req, res) => {

  let dateToFind = new Date(req.body.date);

  let computedCursor = await cryptoDB.collection('computedThreads').find({ date: dateToFind.getTime() }).limit(1);

  if (await computedCursor.count() === 0) {
    res.status(404).json('That item does not exist.');
  } else {
    await computedCursor.forEach(foundDoc => {
      res.json(foundDoc);
    });
  }
})

const mainApp = express();

mainApp.use(vhost('owasp.cryptostar.ga', owaspApp));
mainApp.use(vhost('cryptostar.ga', app));

const server = mainApp.listen(3000, () => console.log("Server started."));

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');

  // Stops the server from accepting new connections and finishes existing connections.
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

