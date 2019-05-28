const express = require('express');
const vhost = require('vhost');
const fetch = require('node-fetch');

const os = require('os');
const path = require('path');
const mime = require('mime-types');

const auth = require('./routes/auth');
require('./config/passport');

const app = express();

app.use(require('./general/app'));
app.use(require('./routes'));

app.use('/', auth.optional, express.static(path.join(os.homedir(), 'chan_crypto', 'build'),
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

app.get('/loaderio', (req, res) => {
  // res.status(404).send('<p>404 Not Found</p>');
  res.sendFile(path.join(__dirname, 'loaderio-33196ca9af06d56ed7516a874a8089d6.txt'));
});

const owaspApp = express();

owaspApp.use(require('./general/owasp'));
owaspApp.use(express.static(path.join(os.homedir(), 'owasp_site/site')));

const mainApp = express();

mainApp.use(vhost('owasp.cryptostar.ga', owaspApp));
mainApp.use(vhost('localhost', app));
mainApp.use(vhost('cryptostar.ga', app));

let server = mainApp.listen(3000, () => console.log("Server started."));

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');

  setTimeout(() => {
    //If server is not finished after 3 seconds, exit anyway.
    process.exit(0);
  }, 3000);

  // Stops the server from accepting new connections and finishes existing connections.
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

