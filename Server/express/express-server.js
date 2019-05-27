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
const connectedClient = require("../config").connectedClient;

const compress = require('./utils/compress');

const user = require('./utils/users').user;
require('./utils/passport');

// const fetch = require('node-fetch');

const app = express();
const owaspApp = express();

module.exports = {
  app,
  owaspApp
}

require('./generalUse');

let cryptoDB;
let accountsDB;

(async () => {
  try {

    cryptoDB = connectedClient.db('crypto');
    accountsDB = connectedClient.db('accounts');

  } catch (error) {
    console.log(error);
    process.exit(2);
  }
})();

app.use(require('./routes'));

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

app.use('/', auth.optional, express.static(path.join('/root/chan_crypto', 'build'),
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

const findUser = require('./utils/findUser');

owaspApp.use(express.static(path.join(os.homedir(), 'owasp_site/site')));

app.get('/loaderio', function (req, res) {
  res.status(404).send('<p>404 Not Found</p>');
  res.sendFile(path.join(__dirname, 'loaderio-33196ca9af06d56ed7516a874a8089d6.txt'));
});

app.use(require('./app/serverControl'));

// app.post('/server-control', auth.required, async (req, res, next) => {
//   const { payload } = req;

//   let account = await findUser(payload.email);

//   if (!account) {
//     return res.status(400).send('Account does not exist');
//   }

//   let noPerms = (action) => {
//     return `Permissions needed to: ${action} the server.`;
//   }

//   let intendedAction = req.body.action;

//   switch (intendedAction) {
//     case 'restart':
//       if (account.permissions.restart) {
//         res.send('Server restarted.');
//         restartServer();
//       } else {
//         res.send(noPerms('restart'));
//       }
//       break;

//     case 'stop':
//       if (account.permissions.stop) {
//         res.send('Server stopped.');
//         stopServer();
//       } else {
//         res.send(noPerms('stop'));
//       }
//       break;

//     default:
//       res.send('Choose an action to perform.');
//       break;
//   }
// });

// function restartServer() {
//   console.log("Server Restarted");

//   shell.exec('pm2 restart "Express Server"');
// }

// function stopServer() {
//   console.log("Server Stopped");

//   shell.exec('pm2 delete "Express Server"');
// }

const mainApp = express();

mainApp.use(vhost('owasp.cryptostar.ga', owaspApp));
mainApp.use(vhost('localhost', app));
mainApp.use(vhost('cryptostar.ga', app));

let server = mainApp.listen(3000, () => console.log("Server started."));

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

