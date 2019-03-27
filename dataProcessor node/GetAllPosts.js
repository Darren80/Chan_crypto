const fetch = require('node-fetch'),
      fs = require('fs'),
      path = require('path'),
      analyser = require('./dataAnalyser');

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
      console.log(index);

      let threadPosts = await getThreadPosts(thread.no);
      fullThreads[index] = threadPosts;
      itemsProcessed++;

      if (array.length === itemsProcessed) {

        this.retrivalTime = Date.now();
        saveThreadToDB(this.retrivalTime, fullThreads);
        getAllPostsCallback(this.retrivalTime, fullThreads);
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