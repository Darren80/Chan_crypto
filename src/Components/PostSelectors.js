/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import './PostSelectors.css';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Button } from '@material-ui/core';
import img404 from '../1024px-No_image_available.svg.png';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { localforageInit } from './utils/initLocalforage';
import { Timeline } from './display/timeline.js';


import quicklink from "quicklink/dist/quicklink.mjs";
// const Modernizr = require("../modernizr");

require('vis/dist/vis.css');
const vis = require('vis');
const _ = require("underscore");
let saveData = false;

const corsProxy = "https://cors-proxy-0.herokuapp.com/";


export class PostSelectors extends React.Component {
  constructor(props) {
    super(props);
    this.getImage = this.getImage.bind(this);
    this.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
    this.progress = this.progress.bind(this);
    this.nsfwReveal = this.nsfwReveal.bind(this);
  }

  async componentDidMount() {

    if ("connection" in navigator) {
      if (navigator.connection.saveData === true) {
        saveData = true;
      } else {
        saveData = false;
      }
    }

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


    if ((this.props.postIndex !== prevProps.postIndex) || this.props.threadKey !== prevProps.threadKey) {
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

  async getImage(tim, ext, url) {

    // window.modernizr.on('webp', function (result) {
    //   console.log(result);
    // });



    let imageStr;
    let imageUrl;
    let that = this;

    if (!this.processing) {
      this.processing = true;

      // eslint-disable-next-line no-undef
      console.log("saveData: ", saveData, "Webp Support: ", Modernizr.webp)
      if (saveData) {
        alert("Save data");
        // eslint-disable-next-line no-undef
        if (Modernizr.webp) {
          imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed_webp/${tim}.webp`;
        } else {
          imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed/${tim}${ext}`;
        }
      } else {
        imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_lossless/${tim}${ext}`;
      }

      fetch(`${imageUrl}`).then(response => {

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

      let title = threadPosts[postIndex].posts[0].sub;
      let description = threadPosts[postIndex].posts[0].com;
      let rating = Math.fround(threadPosts[postIndex].rating);

      let tim = threadPosts[postIndex].posts[0].tim;
      let ext = threadPosts[postIndex].posts[0].ext;

      let preloadTim1 = threadPosts[postIndex === 0 ? threadPosts.length - 1 : postIndex].posts[0].tim;
      let preloadExt1 = threadPosts[postIndex === 0 ? threadPosts.length - 1 : postIndex].posts[0].ext;
      let preloadTim2 = threadPosts[postIndex === threadPosts.length - 1 ? 0 : postIndex].posts[0].tim;
      let preloadExt2 = threadPosts[postIndex === threadPosts.length - 1 ? 0 : postIndex].posts[0].ext;

      let hours = Math.abs(new Date(this.props.threadKey) - new Date(tim)) / 36e5;
      hours = hours.toFixed(1);
      let postCount = threadPosts[postIndex].posts[0].length;

      return (
        <div className="post" key={postIndex}>
          {backgroundImageStyles()}
          {progressPercent()}
          <h1>Thread #{postIndex + 1} | Replies: {postCount}</h1>
          <h2>{`${title || ''} ${rating}`}</h2>

          <p className="post-text" dangerouslySetInnerHTML={{ __html: description }}></p>

          <p className="post-image-link"><a href={`https://images.cryptostar.ga/file/lon1-static/images/${preloadTim1}${preloadExt1}`}></a></p>
          <p className="post-image-link"><a href={`https://images.cryptostar.ga/file/lon1-static/images/${preloadTim2}${preloadExt2}`}></a></p>
          {quicklink()}
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

          <Timeline {...this.props}
          />

          <button onClick={() => this.props.updateIndex(this.props.postIndex - 10)}>Left 10</button>
          <button onClick={() => this.props.updateIndex(this.props.postIndex - 1)}>Left</button>
          <a href={`https://boards.4channel.org/biz/thread/${getLink()}`} target="_blank" rel="noopener noreferrer">
            <button>Go</button>
          </a>
          <button onClick={() => this.props.updateIndex(this.props.postIndex + 1)}>Right</button>
          <button onClick={() => this.props.updateIndex(this.props.postIndex + 10)}>Right 10</button>
          {renderSelectors(0)}

        </div>


      </div>

    )
  }
}
