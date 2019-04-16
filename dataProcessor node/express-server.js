const express = require('express');
const vhost = require('vhost');
const compression = require('compression');
const path = require('path');
const mime = require('mime-types');
const bodyParser = require("body-parser");

const imagemin = require('imagemin');
const imageminOptipng = require('imagemin-optipng');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminGifsicle = require('imagemin-gifsicle');

require('jpegtran-bin');
const globby = require('globby');

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/compress', async (req, res, next) => {

  imagemin([`${os.homedir()}/tmp-images/${req.body.filename}`], `${os.homedir()}/images/`, {
    plugins: [imageminJpegtran({
      progressive: true
    }),
    imageminOptipng({
      optimizationLevel: 2
    }),
    imageminGifsicle({
      interlaced: true
    })]
  }).then((files) => {
    res.send('Image optimised.');
  }).catch(err => {
    res.sendStatus(404);
    console.log(err);
  });
});

app.use('/i', express.static(path.join(os.homedir(), 'images'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', `public, max-age=${31536000}, immutable`);
  }
}));

app.use('/', express.static(path.join(__dirname, 'build'),
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

app.get('/api', async (req, res) => {

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

mainApp.use(vhost('owasp.cryptostar.ga', owaspApp));
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

