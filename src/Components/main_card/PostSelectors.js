/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import './PostSelectors.css';

import img404 from '../../images/No_image_available.svg.png';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { Timeline } from '../timeline/timeline.js';

import ReactGA from 'react-ga';

import { CardDetails } from './cardDetails';
import { GetImage } from './downloadImage';
// const Modernizr = require("../modernizr");

const _ = require("underscore");
let saveData = false;

let controller = new AbortController();
let signal = controller.signal;

let processing = 0;

const corsProxy = "https://cors-proxy-0.herokuapp.com/";


window.requestIdleCallback((idleDeadline) => {
  console.log(navigator.connection.effectiveType);
});

export class PostSelectors extends React.Component {
  constructor(props) {
    super(props);
    // this.getImage = this.getImage.bind(this);
    this.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
    this.nsfwReveal = this.nsfwReveal.bind(this);
  }

  async componentDidMount() {

    let i = Number(localStorage.getItem("currentPostIndex"));
    let prevThreadKey = Number(localStorage.getItem("threadKey"));

    if (isNaN(i)) {
      return;
    };

    if (prevThreadKey !== this.props.threadKey) {
      localStorage.setItem('currentPostIndex', '0');
      this.props.updateIndex(0);
    } else {
      this.props.updateIndex(i);
    }
  }

  async componentDidUpdate(prevProps) {

  }

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));

    bytes.forEach((b) => binary += String.fromCharCode(b));

    return window.btoa(binary);
  }

  // progress({ loaded, total }) {
  //   let percent = Math.round(loaded / total * 100);
  //   console.log(this.props.imgPercent);

  //   if (!percent) {
  //     this.props.updateImgPercent(0);
  //   } else {
  //     this.props.updateImgPercent(Math.round(loaded / total * 100));
  //   }
  // }

  // async getImage(tim, ext, url) {

  //   // window.modernizr.on('webp', function (result) {
  //   //   console.log(result);
  //   // });

  //   let imageStr;
  //   let imageUrl;
  //   let that = this;
  //   let type;

  //   //Abort a fetch request before a new one is made.
  //   if (processing) {
  //     controller.abort();
  //   }
  //   let imageUrls = Object.assign({}, this.props.imageUrls);
  //   // eslint-disable-next-line no-undef
  //   if (saveData || this.props.connectionSpeed < 3) {
  //     // eslint-disable-next-line no-undef
  //     if (Modernizr.webp && ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
  //       imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed_webp/${tim}.webp`;
  //       imageUrls.type = 'compressed_webp'
  //     } else {
  //       imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed/${tim}${ext}`;
  //       imageUrls.type = 'compressed';
  //     }
  //   } else {
  //     imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_lossless/${tim}${ext}`;
  //     imageUrls.type = 'lossless';
  //   }

  //   this.props.updateImageUrls(imageUrls);

  //   try {

  //     setTimeout(() => {
  //       this.props.showProgressBar(true);
  //     }, 1000);  

  //     processing++;
  //     controller = new AbortController();
  //     signal = controller.signal;

  //     let response = await fetch(`${imageUrl}`, {
  //       method: 'get',
  //       signal: signal
  //     });

  //     if (response.status === 404) {
  //       throw new Error('404');
  //     }

  //     let contentLength = response.headers.get('content-length');
  //     if (!contentLength) {
  //       contentLength = 0;
  //     }

  //     const total = parseInt(contentLength, 10);
  //     let loaded = 0;

  //     let timer1 = setInterval(() => {
  //       this.progress({ loaded, total });
  //     }, 500);

  //     try {

  //       response = new Response(
  //         new ReadableStream({
  //           start(controller) {
  //             const reader = response.body.getReader();

  //             read();
  //             function read() {

  //               reader.read().then(({ done, value }) => {
  //                 if (done) {
  //                   window.clearInterval(timer1);
  //                   that.props.updateImgPercent(0);
  //                   controller.close();
  //                   return;
  //                 }
  //                 loaded += value.byteLength;
  //                 controller.enqueue(value);
  //                 read();
  //               }).catch(error => {
  //                 console.error(error);
  //                 controller.error(error)
  //               });
  //             }
  //           }
  //         })
  //         , { signal });

  //     } catch (error) {

  //       throw error;

  //     }

  //     let blob = await response.blob();

  //     this.props.updateImage(URL.createObjectURL(blob));

  //     this.props.showProgressBar(false);

  //   } catch (error) {

  //     console.log(error.message);
  //     that.props.updateImgPercent(0);
  //     if (error.message === "404") {
  //       this.props.updateImage(`${img404}`);
  //     } else if (error.message === 'The user aborted a request.') {
  //       //Request Aborted
  //     } else {
  //       this.props.updateImage(`disconnected`);
  //     }

  //   } finally {

  //     processing--;
  //     return imageStr;

  //   }
  // }

  nsfwReveal() {
    console.log('Revealed');
    this.props.updateNsfw();
  }

  render() {
    let postIndex = this.props.postIndex;
    let threadPosts = this.props.threadPosts;

    if (!threadPosts[postIndex]) { this.props.updateIndex(0); };

    let getLink = (e) => {
      if (threadPosts[postIndex]) {
        return threadPosts[postIndex].posts[0].no;
      }
      return '';
    };


    return (
      <div className="biz-card">
        <div id="0" className="Preamble">


          <GetImage {...this.props} />

          <button onClick={() => this.props.updateIndex(this.props.postIndex - 10)}>Left 10</button>
          <button onClick={() => {
            this.props.updateIndex(this.props.postIndex - 1);
            ReactGA.event({
              category: 'User',
              action: 'Back'
            });
          }}>Left</button>
          <a href={`https://boards.4channel.org/biz/thread/${getLink()}`} target="_blank" rel="noopener noreferrer">
            <button>Go</button>
          </a>
          <button onClick={() => {
            this.props.updateIndex(this.props.postIndex + 1);
            ReactGA.event({
              category: 'User',
              action: 'Forward'
            });
          }}>Right</button>
          <button onClick={() => this.props.updateIndex(this.props.postIndex + 10)}>Right 10</button>

          <CardDetails
            threadPosts={this.props.threadPosts}
            postIndex={this.props.postIndex}

            threadImage={this.props.threadImage}
            imgPercent={this.props.imgPercent}

            connectionSpeed={this.props.connectionSpeed}
            isShowProgressBar={this.props.isShowProgressBar}

            updateImageUrls={this.props.updateImageUrls}
            imageUrls={this.props.imageUrls}

            isDownloading={this.props.isDownloading} />

          <Timeline {...this.props}
          />
        </div>
      </div>
    )
  }
}
