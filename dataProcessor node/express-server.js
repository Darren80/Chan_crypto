const express = require('express');
const path = require('path');
// const fetch = require('node-fetch');
const cors = require('cors')
const app = express();
const _ = require("underscore");

const MongoClient = require('mongodb').MongoClient
let connectedClient;

function loginToMongo() {
  return MongoClient.connect('mongodb://AdminDarren:AdminDarren\'sSecurePassword@localhost:27017/?ssl=true', {
    useNewUrlParser: true
  });
}

app.use(express.static(path.join(__dirname, 'build')));

let corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const server = app.listen(3000, () => console.log("Server started."));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/loaderio', function (req, res) {
  res.sendFile(path.join(__dirname, 'loaderio-33196ca9af06d56ed7516a874a8089d6.txt'));
});

app.get('/api', cors(corsOptions), async (req, res) => {

  if (!connectedClient) {
    connectedClient = await loginToMongo();
  }
  let db = connectedClient.db('crypto');
  let cursor = await db.collection('computedThreads').find().sort({ date: -1 }).limit(1);

  let document = {};
  await cursor.forEach(doc => {
    document.threads = doc.threads;
    document.date = doc.date;
  });
  //Assuming threads is an array
  document.threads = document.threads//.slice(0, 45);
  
  res.json(document);
});

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

