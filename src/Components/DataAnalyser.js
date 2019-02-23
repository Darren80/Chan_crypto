import React, { Component } from 'react';
import './DataAnalyser.css';
import { analyser } from './utils/analyser.js';
import { db } from './utils/saveToDatabase.js';
import { localforageInit } from './utils/initLocalforage';
import { linkScore } from './utils/link-score';

const _ = require("underscore");
const Chart = require('chart.js');
const outliers = require('outliers');

const linkify = require('linkifyjs');

const sanitizeHtml = require('sanitize-html');
const ReactDOMServer = require('react-dom/server');
const HtmlToReactParser = require('html-to-react').Parser;


var x;
var y;
var updateCounter = 0;

export class DataAnalyser extends React.Component {
  constructor(props) {
    super(props)
    this.startAnalyser = this.startAnalyser.bind(this);
    this.fileReader = this.fileReader.bind(this);
    this.storeAndUpdateThreadState = this.storeAndUpdateThreadState.bind(this);
    this.preworkChecks = this.preworkChecks.bind(this);
    this.getNudityScores = this.getNudityScores.bind(this);

    this.filterCreationDate = this.filterCreationDate.bind(this);
    this.rate = this.rate.bind(this);
    this.nsfwItemCompleted = this.nsfwItemCompleted.bind(this);

    this.iterateLinks = this.iterateLinks.bind(this);

  }

  componentDidMount() {
    if (Array.isArray(this.props.threadPosts) && this.props.threadPosts.length !== 0) {
      // this.startAnalyser();
    }
  }

  componentDidUpdate(prevProps) {

    if (!_.isEqual(prevProps.threadPosts, this.props.threadPosts)) {

      if ((Array.isArray(this.props.threadPosts) && this.props.threadPosts.length !== 0)) {

        if (!this.props.computed) {
          this.startAnalyser();
        }
      }
    }
  }

  async storeAndUpdateThreadState(threadPosts) {
    let computedStore = localforageInit.computedStore();

    await computedStore.setItem(this.props.threadKey, threadPosts).then(success => {
      //Successfully saved, update state.
      this.props.handleData("computed", threadPosts, this.props.threadKey);
    }).catch(error => {
      console.log(error);
    });
  }

  async preworkChecks(threadPosts) {

    // Bad data check
    if (!this.props.threadKey) {
      console.log(`threadKey is undefined`);
      return false;
    }
    if (!Array.isArray(threadPosts) || !threadPosts.length) {
      console.log(`threadPosts is not an array or empty`);
      return false;
    }
    let elementCheck = () => threadPosts.every(posts => {
      if (!posts) {
        return false;
      } else {
        return true;
      }
    });
    if (!elementCheck()) {
      console.log(`Array "${this.props.threadKey}" has missing values.`);

      let archiveStore = localforageInit.archiveStore();

      archiveStore.removeItem(this.props.threadKey).then(function () {
        console.log(`${this.props.threadKey} has been deleted!`);
      }).catch(function (err) {
        console.log(err);
      });

      return false;
    }

    return true;
  }

  async startAnalyser() {

    // Deep-copy the array
    let threadPosts = JSON.parse(JSON.stringify(this.props.threadPosts));

    if (!await this.preworkChecks(threadPosts)) {
      return;
    }

    db.connect();

    // threadPosts = await analyser.fleschKincaid(threadPosts); //async //Unused
    // threadPosts = analyser.uniqueParticipants(threadPosts); //Unused

    threadPosts = analyser.time(threadPosts);
    threadPosts = analyser.links(threadPosts);
    threadPosts = analyser.ticker(threadPosts);

    // Nudity Promise
    let a = this.getNudityScores(threadPosts).then(nudityScoreArray => {
      threadPosts.forEach((thread, i) => {
        thread.nsfw_score = nudityScoreArray[i];
      });
    })
      .catch(err => {
        console.error(err)
      });

    // Word counting Promise
    let b = analyser.postLength(threadPosts).then(wordCountArray => {
      threadPosts.forEach((thread, threadIndex) => {
        thread.posts.forEach((post, postIndex) => {

          if (!wordCountArray[threadIndex][postIndex]) { return }
          post.Ωword_count = wordCountArray[threadIndex][postIndex].Ωword_count;
          post.Ωunique_word_count = wordCountArray[threadIndex][postIndex].Ωword_count;
          post.Ωunique_word_count_percent = wordCountArray[threadIndex][postIndex].Ωword_count;

        });
      });
    })
      .catch(err => {
        console.error(err)
      });

      Promise.all([a, b]).then(values => {
        this.storeAndUpdateThreadState(threadPosts);
        threadPosts = this.rate(threadPosts);
      })

    
    //this.iterateLinks(threadPosts); //Do not run for now.
    console.log("Prepared");
    //this.filterLinks();

    //this.paintGraph();
  }

  async getNudityScores(threadPosts) {
    const testImg = `https://i.4cdn.org/biz/1544987182299.jpg`;

    let clonedArray = JSON.parse(JSON.stringify(threadPosts));
    let scoreArray = [];

    // Read from IndexDB ------------
    let scores = await localforageInit.nsfwScoreStore().getItem('images').then(results => {
      return results;
    }).catch(err => {
      console.log(err);
    });
    //-------------------------------
    if (!scores) { scores = [] };

    let allowedImageFileTypes = ['.jpeg', '.jpg', '.png', '.gif'];
    let itemsToProcess = 0;
    let itemsProcessed = 0;

    let promise = new Promise((resolve, reject) => {
      clonedArray.forEach((thread, index) => {
        itemsToProcess++;

        setTimeout(async () => {

          let nsfwItemCompleted = async () => {
            itemsProcessed++;
            if (itemsProcessed === itemsToProcess) {
              // Save to IndexDB ------------
              await localforageInit.nsfwScoreStore().setItem('images', scores).then(success => {
                resolve(scoreArray);
                console.log("saved");
              }).catch(err => {
                console.log(err);
              });
              //-----------------------------

            }
          }

          let imageUrl = `https://i.4cdn.org/biz/${thread.posts[0].tim}${thread.posts[0].ext}`;
          let exists = scores.find(url => url.imageUrl === imageUrl);

          if (exists && exists.nsfw_score >= 0) {
            scoreArray[index] = exists.nsfw_score;
            nsfwItemCompleted();
            return;
          } else if (!allowedImageFileTypes.includes(thread.posts[0].ext)) { //Image is not of an allowed file type.
            nsfwItemCompleted();
            return;
          }

          let port = `8080`;
          await fetch(`http://localhost:${port}/porn_image?url=${imageUrl}`).then(async (response) => {

            let find = /nsfw_score: (\d.\d*)/g
            let nsfw_score = parseFloat(find.exec(await response.text())[1]);

            scoreArray[index] = nsfw_score;
            scores.push({ imageUrl: imageUrl, nsfw_score: nsfw_score });

          }).catch(err => {

            scoreArray[index] = -1;
            scores.push({ imageUrl: imageUrl, nsfw_score: -1 });

            console.log(err);

          });
          nsfwItemCompleted();

        }, index * 500);
      });
    });
    return promise;
  }


  async nsfwItemCompleted(itemsToProcess, itemsProcessed) {

  }

  rate(threadPosts) {

    let normalise = (min, max, val) => {
      let delta = max - min;
      let result = (val - min) / delta;
      return result > 1 ? 1 : result;
    };

    // Rate based on time
    threadPosts.forEach(thread => {
      thread.rating = 0;
      thread.ratings = {};
    });

    let min = Math.min(...threadPosts.map(thread => thread.time_posted));
    let max = Math.max(...threadPosts.map(thread => thread.time_posted));

    threadPosts.forEach(thread => {
      thread.rating = thread.rating + normalise(max, min, thread.time_posted) * 0.8;
      thread.ratings.timeRating = normalise(max, min, thread.time_posted) * 0.8;
    });


    // Rate based on word count
    min = 8;
    max = Math.max(...threadPosts.map(thread => thread.posts[0].Ωunique_word_count));
    console.log(`Min word count: ${min} and Max word count: ${max}`);

    threadPosts.forEach(thread => {
      let rating = normalise(min, max, thread.posts[0].Ωunique_word_count);

      if (rating < 0 && thread.nsfw_score > 0.35) {
        rating = rating * 45
      } else if (rating < 0) {
        rating = rating * 15
      }

      thread.rating = thread.rating + rating;
      // console.log(`${rating}, Word Count ${thread.posts[0].Ωunique_word_count}`)
      thread.ratings.wordRating = rating;
    });
    // const cryptocurrencies = require('cryptocurrencies');
    // console.log(cryptocurrencies.symbols());

    //Rate based on ticker counter
    min = 0;
    max = Math.max(...threadPosts.map(thread => thread.tickers.length));

    threadPosts.forEach(thread => {
      let rating = normalise(min, max, thread.tickers.length) * 0.4;
      thread.rating = thread.rating + rating;
      // console.log(`${rating}, Word Count ${thread.posts[0].Ωunique_word_count}`)
      thread.ratings.ticker = rating;
    });

    // Rate based on web links
    min = Math.min(...threadPosts.map(thread => thread.links.length));

    let links = threadPosts.reduce((filtered, thread, i) => {

      let count = thread.links.reduce((counter, link) => {
        return counter + link.linksInPost.length;
      }, 0);
      if (count) { filtered.push(count) };

      return filtered;
    }, []);


    let sortNumber = (a, b) => {
      return a - b;
    }
    let outlierLinks = outliers(links.sort(sortNumber));
    //Average, sum then divide.
    let average = outlierLinks.reduce((sum, number, index, array) => {
      sum = sum + number;
      sum = array.length === index + 1 ? sum / array.length : sum;
      return sum;
    }, 0);

    // console.log(links.sort(sortNumber));
    // console.log(outliers(links.sort(sortNumber)));
    console.log(`Average: ${average}`);

    min = 0;
    max = average;

    threadPosts.forEach((thread, i) => {

      //Give a score that depends on the quality of links in each comment and the OP.

      // Give points for links in the all comments excluding OP.
      let linkWeight = linkScore.getAllWeight(thread);

      let linkRating = normalise(min, max, linkWeight) * 0.4;
      thread.rating = thread.rating + linkRating;
      thread.ratings.linkRating = linkRating;

      // Give points for links in the OP comment.
      let opLinkWeight = linkScore.getOPWeight(thread);

      let opLinkRating = normalise(0, 3, opLinkWeight) * 0.65;
      thread.rating = thread.rating + opLinkRating;
      thread.ratings.opLinkRating = opLinkRating;
    });

    min = 0;
    max = 3;

    threadPosts.forEach((thread, i) => {

    });

    return threadPosts;
  }

  iterateLinks(threadPosts) {
    let linkCards = [];
    threadPosts.forEach(thread => {
      if (thread.links.length !== 0) {
        linkCards.push(
          <div className="op" key={thread.posts[0].no}>
            <a href={`https://boards.4channel.org/biz/thread/${thread.posts[0].no}`} target="_blank" rel="noopener noreferrer">OP Poster: {thread.posts[0].Id}>>></a>
            <p className="id" dangerouslySetInnerHTML={{ __html: thread.posts[0].com }}></p>
            <p>{thread.posts[0].sub}</p>
          </div>
        );
      }
      //Note: using post numbers instead of IDs, not best practise.
      thread.links.forEach((link, i) => {
        if (thread.posts[0].no !== thread.posts[link.postNo].no) {

          let htmlToReactParser = new HtmlToReactParser();
          let reactElement = htmlToReactParser.parse(thread.posts[link.postNo].com);
          let reactHtml = ReactDOMServer.renderToStaticMarkup(reactElement);

          linkCards.push(
            <div className="child" key={thread.posts[link.postNo].no}>
              <p className="id">{link.postId}</p>
              <p className="" dangerouslySetInnerHTML={{ __html: thread.posts[link.postNo].com }}></p>
              <p className="">{thread.posts[link.postNo].sub}</p>
            </div>
          );
        }

      });
    });
    this.props.handleData("cards", linkCards);
  }

  filterCreationDate(threadPosts) {

  }

  // Used for putting the dictionary words into memory.
  fileReader() {

    let fileReader;
    let fileInput = document.querySelector('#myfiles');
    let files = fileInput.files;
    console.log(files);

    const readFile = (file) => {
      fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = function (e) {

        // The file's text will be printed here
        let words = fileReader.result.toString().split('\n');

        //Save the array
        let wordsStore = localforageInit.wordStore();

        wordsStore.setItem("allWords", words).then(async function (value) {
          console.log(await wordsStore.getItem("allWords"));
        }).catch(function (err) {
          console.log(err);
        });
      };
    }

    const error = (event, fileReader) => {
      fileReader.abort();
      console.log(event);
    };

    readFile(files[0]);
  }

  render() {

    return (
      <div>
        <div id='some-elem'></div>
        <div>
          <input id="myfiles" multiple type="file" className="file-picker" onChange={this.fileReader} />
        </div>
        <div className="link-posts">
          <h2>Links</h2>
          <div>{this.props.cards}</div>
        </div>
      </div>
    )
  }
}
