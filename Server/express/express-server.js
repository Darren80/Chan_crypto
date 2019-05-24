const express = require('express');
const vhost = require('vhost');
const compression = require('compression');
const bodyParser = require("body-parser");
const auth = require('./routes/auth');
const shell = require('shelljs');

const os = require('os');
const path = require('path');
const mime = require('mime-types');
const _ = require("underscore");
const config = require("../config");

const compress = require('./utils/compress');

const user = require('./utils/users').user;
require('./utils/passport');
// const fetch = require('node-fetch');


const app = express();
const owaspApp = express();

let connectedClient = config.connectedClient;
let cryptoDB;
let accountsDB;

(async () => {
  try {

    cryptoDB = connectedClient.db('crypto');
    accountsDB = connectedClient.db('accounts');
    console.log(process.argv);

  } catch (error) {
    console.log(error);
    process.exit(2);
  }
})();

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('./routes'));

owaspApp.use(compression());

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
        res.setHeader('Cache-Control', `public, max-age=${5}`);
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

owaspApp.use(express.static(path.join(os.homedir(), 'owasp_site/site')));
// owaspApp.get('/', async (req, res, next) => {
//   res.sendFile(path.join(os.homedir(), 'CheatSheetSeries-master/generated/site/index.html'));
// });

app.get('/loaderio', function (req, res) {
  res.status(404).send('<p>404 Not Found</p>');
  res.sendFile(path.join(__dirname, 'loaderio-33196ca9af06d56ed7516a874a8089d6.txt'));
});

app.get('/restart-server', auth.required, async (req, res, next) => {
  const { payload } = req;

  let cursor = await accountsDB.collection('users').find({ email: payload.email }).limit(1);
  if (await cursor.count() === 0) {
    return res.status(400).send('Account does not exist');
  } else {
    await cursor.forEach((account) => {
      if (account.permissions.restart) {
        //Restart this script
        res.send('Server restarted.');
        restartServer();
      } else {
        res.send('You do not have permission to restart the server.');
      }
    });
  }
});

app.get('/stop-server', auth.required, async (req, res, next) => {
  const { payload } = req;

  let cursor = await accountsDB.collection('users').find({ email: payload.email }).limit(1);
  if (await cursor.count() === 0) {
    return res.status(400).send('Account does not exist');
  } else {
    await cursor.forEach((account) => {
      if (account.permissions.stop) {
        //Restart this script
        res.send('Server stopeed.');
        stopServer();
      } else {
        res.send('You do not have permission to restart the server.');
      }
    });
  }
});

function restartServer() {
  console.log("Server Restarted");

  shell.exec('pm2 restart "Express Server"');

}

function stopServer() {
  console.log("Server Stopped");

  shell.exec('pm2 delete "Express Server"');
}

// app.get('/api/threads', async (req, res) => {

//   if (!config.connectedClient) {
//     throw new Error('mongoDB database not connected.')
//   }

//   let cursor = await cryptoDB.collection('computedThreads').find().sort({ date: -1 }).limit(1);

//   let document = {};
//   await cursor.forEach(doc => {
//     document.threads = doc.threads;
//     document.date = doc.date;
//   });
//   //Assuming threads is an array
//   // document.threads = document.threads.slice(0, 45);

//   res.json(document);
// });

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
});

const mainApp = express();

mainApp.use(vhost('owasp.cryptostar.ga', owaspApp));
mainApp.use(vhost('localhost', app));
mainApp.use(vhost('cryptostar.ga', app));

let server;

server = mainApp.listen(3000, () => console.log("Server started."));


process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  process.exit(0);

  // Stops the server from accepting new connections and finishes existing connections.
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

