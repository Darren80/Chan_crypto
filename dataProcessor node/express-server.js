const express = require('express');
const vhost = require('vhost');
const compression = require('compression')
const path = require('path');
const mime = require('mime-types')

const os = require('os');
const ms = require('ms');
// const fetch = require('node-fetch');
var cors = require('cors');
const _ = require("underscore");

const app = express();
const owaspApp = express();

const MongoClient = require('mongodb').MongoClient
let connectedClient;
let cryptoDB;

function loginToMongo() {
  return MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
    useNewUrlParser: true
  });
}

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(compression());
owaspApp.use(compression());

app.get('/', cors(corsOptions), async (req, res, next) => {
    console.log(os.homedir());
    next();
  });

app.use('/', express.static(path.join(__dirname, 'build'),
  {
    setHeaders: (res, path) => {
      let mimeType = mime.lookup(path);

      if (mimeType.includes('video') || mimeType.includes('image') || mimeType.includes('audio')) {
        res.setHeader('Cache-Control', `public, max-age=${ms('60')}, immutable`);
      } else {
        res.setHeader('Cache-Control', `public, max-age=${ms('5')}, immutable`);
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

app.get('/api', cors(corsOptions), async (req, res) => {

  if (!connectedClient) {
    connectedClient = await loginToMongo();
    cryptoDB = connectedClient.db('crypto');
  }

  let cursor = await cryptoDB.collection('computedThreads').find().sort({ date: -1 }).limit(1);

  let document = {};
  await cursor.forEach(doc => {
    document.threads = doc.threads;
    document.date = doc.date;
  });
  //Assuming threads is an array
  // document.threads = document.threads.slice(0, 45);

  res.set({
    'Cache-Control': 'public, max-age=60, immutable'
  });

  res.json(document);
});

const mainApp = express();

mainApp.use(vhost('*.cryptostar.ga', owaspApp));
mainApp.use(vhost('cryptostar.ga', app));
// mainApp.use(vhost('cryptostar.ga', app));

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

