const fetch = require('node-fetch'),
  fs = require('fs'),
  request = require('request'),
  os = require('os'),
  analyser = require('./dataAnalyser'),
  shell = require('shelljs');

let connectedClient;



class Posts {

  constructor(partialThreads, client) {
    this._partialThreads = partialThreads;
    this.retrivalTime = 0;
    connectedClient = client;
  }

  get partialThreads() {
    return this._partialThreads
  }

  async getFullThreads() {
    await getAllPosts(this.partialThreads);
  }
}

async function getAllPosts(partialThreads) {

  // if (!Array.isArray(this.props.threads) || !this.props.threads.length) {
  //   // array does not exist, is not an array, or is empty
  //   return;
  // }

  let itemsProcessed = 0;
  let fullThreads = [];

  partialThreads.reverse().forEach((thread, index, array) => {

    //Limit polling to 1 every 0.5 seconds
    setTimeout(async () => {
      console.log(index + 1);

      getThreadImage(thread.tim, thread.ext);
      let threadPosts = await getThreadPosts(thread.no);

      fullThreads[index] = threadPosts;
      itemsProcessed++;

      if (array.length === itemsProcessed) {

        this.retrivalTime = Date.now();
        saveThreadToDB(this.retrivalTime, fullThreads);
        getAllPostsCallback(this.retrivalTime, fullThreads);

        //Optimise all images via lossless compression
        console.log('Executing script.');
        shell.exec('bash $HOME/startImgOpti.sh', (code, output, stderr) => {
          shell.echo(`exit code: ${code}`);
        });

      }

    }, index * 500);
  });
}
function getAllPostsCallback(dateOfSnapshot, fullThreads) {
  new analyser(dateOfSnapshot, fullThreads, connectedClient);
}

function saveThreadToDB(dateOfSnapshot, fullThreads) {

  let db = connectedClient.db('crypto');

  db.collection('archiveThreads').insertOne({
    date: dateOfSnapshot,
    threads: fullThreads
  });
}

async function getThreadPosts(threadNo) {
  let corsProxy = "https://cors-proxy-0.herokuapp.com/";
  let board = "biz";
  let url = corsProxy + "https://a.4cdn.org/" + board + "/thread/" + threadNo + ".json";

  try {
    const response = await fetch(url);
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse;
    }
  } catch (e) {
    console.log(e);
  }
}

async function getThreadImage(tim, ext) {

  let download = (uri, filename, callback) => {

    if (fs.existsSync(`${os.homedir()}/images/${filename}`)) {
      return;
    }

    request.head(uri, function (err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(`${os.homedir()}/tmp-images/${filename}`)).on('close', callback);
    });
  };
  
  download(`https://i.4cdn.org/biz/${tim}${ext}`, `${tim}${ext}`,() => {
    console.log('done');
  });
}

module.exports = Posts;

async function retriveNewestUNIXKey() {
  let db = connectedClient.db('crypto');

  let max = db.collection('archiveThreads').find().sort({ date: -1 }).limit(1);
  return max;
}

async function retriveNewestValue(key) {

  let db = connectedClient.db('crypto');

  let cursor = db.collection('computedThreads').find({ date: key }).limit(1);
  if (cursor.count() === 0) {
    cursor = db.collection('archiveThreads').find({ date: key }).limit(1);
  }
  let doc = cursor.forEach(doc => doc);
  console.log(doc);
  return doc;
}