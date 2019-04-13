/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import './PostSelectors.css';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Button } from '@material-ui/core';
import img404 from '../1024px-No_image_available.svg.png';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { localforageInit } from './utils/initLocalforage';
import { Timeline } from './display/timeline.js';

require('vis/dist/vis.css');
const vis = require('vis');
const _ = require("underscore");

const corsProxy = "https://cors-proxy-0.herokuapp.com/";


export class PostSelectors extends React.Component {
  constructor(props) {
    super(props);
    this.getImage = this.getImage.bind(this);
    this.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
    this.progress = this.progress.bind(this);
    this.nsfwReveal = this.nsfwReveal.bind(this);
    this.createVisualisation = this.createVisualisation.bind(this);
  }

  async componentDidMount() {

    let postIndex = this.props.postIndex;
    let threadPosts = this.props.threadPosts;
    if (!threadPosts[postIndex]) { return };
    let tim = threadPosts[postIndex].posts[0].tim;
    let ext = threadPosts[postIndex].posts[0].ext;

    let i = Number(localStorage.getItem("currentPostIndex"));
    if (isNaN(i)) {
      return;
    };
    if (i !== this.props.postIndex) {
      this.props.updateIndex(i);
    } else {
      this.getImage(tim, ext);
    }


  }

  async componentDidUpdate(prevProps) {

    let postIndex = this.props.postIndex;
    let threadPosts = this.props.threadPosts
    if (!threadPosts[postIndex]) { return };
    let tim = threadPosts[postIndex].posts[0].tim;
    let ext = threadPosts[postIndex].posts[0].ext;


    if (this.props.postIndex !== prevProps.postIndex) {
      this.getImage(tim, ext);
    }
  }



  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
  }

  progress({ loaded, total }) {
    let percent = Math.round(loaded / total * 100);
    console.log(this.props.imgPercent);

    if (isNaN(percent)) {
      this.props.updateImgPercent(0);
    } else {
      this.props.updateImgPercent(Math.round(loaded / total * 100));
    }
  }

  processing = false;
  downloading = false;

  async getImage(tim, ext) {
    let imageStr;
    let that = this;

    if (!this.processing) {
      this.processing = true;

      fetch(`https://cryptostar.ga/i/${tim}${ext}`).then(response => {

        if (response.status === 404) {
          throw new Error("404");
        }

        let contentLength = response.headers.get('content-length');
        if (!contentLength) {
          contentLength = 0;
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        let timer1 = setInterval(() => {
          this.progress({ loaded, total });
        }, 500);
        that.downloading = true;

        return new Response(
          new ReadableStream({
            start(controller) {
              const reader = response.body.getReader();

              read();
              function read() {

                reader.read().then(({ done, value }) => {
                  if (done) {
                    window.clearInterval(timer1);
                    that.props.updateImgPercent(0);
                    that.downloading = false;
                    controller.close();
                    return;
                  }
                  loaded += value.byteLength;
                  controller.enqueue(value);
                  read();
                }).catch(error => {
                  console.error(error);
                  controller.error(error)
                });
              }
            }
          })
        );
      }).then(response =>
        response.blob()
      ).then(data => {
        this.props.updateImage(URL.createObjectURL(data));
      }).catch(err => {
        this.processing = false;
        that.downloading = false;
        that.props.updateImgPercent(0);
        if (err.message === "404") {
          this.props.updateImage(`${img404}`);
        }
      });
    }
    this.processing = false;
    return imageStr;
  }

  nsfwReveal() {
    console.log('Revealed');
    this.props.updateNsfw();
  }

  async createVisualisation() {

    // DOM element where the Timeline will be attached
    let container = document.getElementById('timeline');
    if (!container) { return }
    if (container.querySelector('.vis-timeline')) { return }


    // let keys = await localforageInit.retriveAllUNIXKeys();
    let startDate = new Date('2019-01-01T00:00:00');
    let keys = [];

    while (startDate.getFullYear() < 2020) {
      startDate.setDate(startDate.getDate() + 1);
      keys.push(startDate.getTime());
    }

    let data = keys.map((UNIX, i) => {
      UNIX = parseInt(UNIX);

      let date = new Date(UNIX);
      let time24Hr = `${date.getHours()}:${date.getMinutes()}`;

      return { id: i, content: time24Hr, title: `#${i}`, start: new Date(UNIX), type: 'point' }
    });

    // Create a DataSet (allows two way data-binding)
    let items = new vis.DataSet(data)

    // Configuration for the Timeline
    let options = {
      height: '250px',
      stack: false,
      horizontalScroll: true,
      zoomKey: 'ctrlKey',
      zoomMin: 3600000,
      zoomMax: 3.1556952e+11
    };
    // Create a Timeline
    let times = {
      hour: 3.6e+6,
      day: 8.64e+7,
      week: 6.048e+8,
      month: 2.628e+9,
      year: 3.154e+10,
      decade: 3.154e+11
    }
    let timeline = new vis.Timeline(container, items, options);
    timeline.on('rangechanged', (properties) => {

      let startDate = new Date('2019-01-01T00:00:00');
      let setKeys = (range) => {
        let month1Keys = keys.filter(key => {
          let keyDate = new Date(key);
          if (keyDate.getUTCMonth() === startDate.getUTCMonth() && keyDate.getUTCFullYear() === startDate.getUTCFullYear()) {
            console.log("1");
            return key;
          }
          return false;
        });

        let length = Math.floor(month1Keys.length / 5);
        month1Keys = month1Keys.filter((key, i) => {
          if (i % length === 0) {
            return true;
          }
        });

        // Convert the UNIX timestamps into vis timeline items.
        let data = month1Keys.map((key, i) => {
          let keyDate = new Date(parseInt(key));

          let time24Hr = `${keyDate.getHours()}:${keyDate.getMinutes()}`;
          return { id: i, content: time24Hr, title: `#${i}`, start: keyDate, type: 'point' }
        });

        console.log(data);
        
        let items = new vis.DataSet(data);
        timeline.setItems(items);
      }

      console.log('selected items: ' + properties.items);
      let start = new Date(properties.start);
      let end = new Date(properties.end);
      let delta = end - start;
      if (delta < times.day) {
        console.log("hours");
      } else if (delta < times.week && delta > times.day) {
        console.log("day");
      } else if (delta < times.month && delta > times.week) {
        console.log("week");
      } else if (delta < times.year && delta > times.month) {
        setKeys("month");
        console.log("month");
      } else if (delta < times.decade && delta > times.year) {
        console.log("year");
      }


    });
    timeline.on('select', (properties) => {

    });
  }

  render() {
    let postIndex = this.props.postIndex;
    let threadPosts = this.props.threadPosts;



    if (!threadPosts[postIndex]) { this.props.updateIndex(0); };

    let progressPercent = () => {
      if (!this.downloading && !this.props.threadImage) {
        return <LinearProgress
          className="linear-progress"
          color="secondary"
        />
      } else if (this.downloading) {
        return <LinearProgress
          className="linear-progress"
          color="secondary"
          variant="determinate"
          value={this.props.imgPercent}
        />
      } else if (this.props.threadImage) {
        return <></>
      }
    }

    let backgroundImageStyles = () => {
      let style = {
        backgroundImage: `url(${this.props.threadImage})`
      }
      if (threadPosts[postIndex].nsfw_score > 0.43) {
        if (this.props.revealNsfw === true) {
          return (
            <div className="post-image fade-in" style={style}>
            </div>
          )
        } else {
          return (
            <div className="nsfw">
              <Button onClick={this.nsfwReveal} className="">
                <h5>Content Warning: This image may contain sensitive content</h5>
                <p>Click to view</p>
              </Button>
            </div>
          )
        }
      } else {
        return (
          <div className="post-image" style={style}>
          </div>
        )
      }
    }

    let renderSelectors = (e, direction) => {

      console.log(threadPosts[postIndex]);
      let title = threadPosts[postIndex].posts[0].sub;
      let description = threadPosts[postIndex].posts[0].com;
      let rating = Math.fround(threadPosts[postIndex].rating);
      let tim = threadPosts[postIndex].posts[0].tim;
      let ext = threadPosts[postIndex].posts[0].ext;

      let hours = Math.abs(new Date(this.props.threadKey) - new Date(tim)) / 36e5;
      hours = hours.toFixed(1);
      let postCount = threadPosts[postIndex].posts[0].length;

      return (
        <div className="post" key={postIndex}>
          {backgroundImageStyles()}
          {progressPercent()}
          <h1>Thread #{postIndex + 1} | Replies: {postCount}</h1>
          <h2>{`${title || ''} ${rating}`}</h2>
          <p className="post-image-link">{`https://i.4cdn.org/biz/${tim}${ext}`}</p>
          <p className="post-text" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
      );
    };

    let getLink = (e) => {
      if (threadPosts[postIndex]) {
        return threadPosts[postIndex].posts[0].no;
      }
      return '';
    };


    return (
      <div className="biz-card">
        <div id="0" className="Preamble">
          <button onClick={() => this.props.updateIndex(this.props.postIndex - 10)}>Left 10</button>
          <button onClick={() => this.props.updateIndex(this.props.postIndex - 1)}>Left</button>
          <a href={`https://boards.4channel.org/biz/thread/${getLink()}`} target="_blank" rel="noopener noreferrer">
            <button>Go</button>
          </a>
          <button onClick={() => this.props.updateIndex(this.props.postIndex + 1)}>Right</button>
          <button onClick={() => this.props.updateIndex(this.props.postIndex + 10)}>Right 10</button>
          {renderSelectors(0)}

        </div>
        <Timeline {...this.props}
        />

      </div>

    )
  }
}
