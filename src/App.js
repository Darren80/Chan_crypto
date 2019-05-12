import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { PostSelectors } from './Components/main_card/PostSelectors.js';
import { Preload } from './Components/preload';

const _ = require("underscore");

const corsProxy = "https://cors-proxy-0.herokuapp.com/";
const board = "biz";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      postIndex: 0,
      threadImage: '',
      imgDownloadPercent: 0,
      showProgressBar: false,
      revealNsfw: false,
      connectionSpeed: 999,
      imageUrls: {
        preloadImages: [],
        type: 'lossless'
      }
    };
    this.fetchBoardCatalog = this.fetchBoardCatalog.bind(this);
    this.prepareData = this.prepareData.bind(this);
    this.refreshCatalog = this.refreshCatalog.bind(this);
    this.handleData = this.handleData.bind(this);

    this.updateImage = this.updateImage.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
    this.updateImgDownloadPercent = this.updateImgDownloadPercent.bind(this);
    this.updateNsfw = this.updateNsfw.bind(this);
    this.updateTimelineZoomLevel = this.updateTimelineZoomLevel.bind(this);
    this._showOfflineMessage = this._showOfflineMessage.bind(this);
    this._hideOfflineMessage = this._hideOfflineMessage.bind(this);
    this.updateImageUrls = this.updateImageUrls.bind(this);
    this.showProgressBar = this.showProgressBar.bind(this);
    

  }

  componentDidMount() {
    // let timer1 = setInterval(this.fetchBoardCatalog, 30000);
    // this.setState({timer1: timer1});
    this.fetchBoardCatalog();

    if ("connection" in navigator) {
      setInterval(() => {
        if (this.state.connectionSpeed === navigator.connection.downlink) {
          return;
        }
        this.setState({
          connectionSpeed: navigator.connection.downlink || 0
        });
      }, 1000);
    }
  }

  componentDidUpdate() {
    let connectionMessage = document.getElementsByClassName("connectionMessage");
    connectionMessage[0].style.height = `${document.body.scrollHeight}px`;
  }

  async fetchBoardCatalog() {
    //Retrive the latest /biz/ catalog
    this.prepareData();
  }

  async prepareData() {

    let url = "https://cryptostar.ga/api/threads";
    try {
      const response = await fetch(url);
      if (response.ok) {
        const responseJson = await response.json();
        this.setState({
          loaded: 1,
          threadPosts: responseJson.threads,
          threadKey: responseJson.date
        });
        console.log(responseJson);
      }
    } catch (e) {

    }

    let crypto = () => {
      //Generate two cryptographically random, unsigned 32-bit integers
      let array = new Uint32Array(2);
      window.crypto.getRandomValues(array);

      // keep all 32 bits of the the first, top 20 of the second for 52 random bits
      let mantissa = (array[0] * Math.pow(2, 20)) + (array[1] >>> 12)
      // shift all 52 bits to the right of the decimal point
      let result = mantissa * Math.pow(2, -52);

      return result;
    };

    let randomCryptoRandomFromInterval = (min, max) => { // min and max included
      return Math.floor(crypto() * (max - min + 1) + min);
    }

  }

  async refreshCatalog() {
    await this.fetchBoardCatalog();
  }



  _showOfflineMessage() {
    let offlineMsg = document.getElementById("offline-message");

    document.getElementsByTagName("html")[0].setAttribute("line-status", 'online');

    offlineMsg.setAttribute("aria-hidden", "false");

    offlineMsg.textContent = 'You are offline';
    offlineMsg.classList.add('offline'); offlineMsg.classList.remove('online');

    let connectionMessage = document.getElementsByClassName("connectionMessage");

    connectionMessage[0].style.height = `${document.body.scrollHeight}px`;
    console.log(`${document.body.scrollHeight}px`);

    setTimeout(function () {
      offlineMsg.focus();
    }, 400);
  }

  _hideOfflineMessage() {
    let offlineMsg = document.getElementById("offline-message");


    document.getElementsByTagName("html")[0].setAttribute("offline", 'offline');

    offlineMsg.textContent = 'You are online';

    offlineMsg.classList.add('online'); offlineMsg.classList.remove('offline');
    offlineMsg.setAttribute("aria-hidden", "true");

    setTimeout(function () {
      offlineMsg.classList.remove('online');
    }, 2000);
  }

  handleData(type, data, key) {
    if (type === "posts") {
      this.setState({
        threadPosts: data,
        threadKey: key,
        threadImage: ''
      });
    } else if (type === "cards") {
      this.setState({
        cards: data
      });
    } else if (type === "computed") {
      console.log("computeds");

      data = _.sortBy(data, 'nsfw_score').reverse();
      console.log(data);
      this.setState({
        threadPosts: data,
        threadKey: key
      });
    }

  }

  updateIndex(index) {
    if (index < 0) { index = this.state.threadPosts.length - 1 };

    if (index > this.state.threadPosts.length - 1) { index = 0 };

    localStorage.setItem("currentPostIndex", index);

    this.setState({
      postIndex: index,
      threadImage: '',
      revealNsfw: false
    });
  }
  updateImgDownloadPercent(percent) {
    this.setState({
      imgDownloadPercent: percent
    });
  }
  updateImage(img) {
    this.setState({
      threadImage: img
    });
  }

  showProgressBar(boolean) {

    setTimeout(() => {
      this.setState({
        showProgressBar: boolean
      });
    }, 500)
  }

  updateNsfw() {
    this.setState({
      revealNsfw: true
    });
  }

  updateImageUrls(imageUrls) {
    this.setState({
      imageUrls: imageUrls
    });
  }

  updateTimelineZoomLevel(zoomLevel) {
    this.setState({
      timelineZoomLevel: zoomLevel
    })
  }

  render() {
    window.addEventListener("offline", this._showOfflineMessage, false);
    window.addEventListener("online", this._hideOfflineMessage, false);

    return (
      <div className="App">
        <header className="App-header">
          <div className="connectionMessage">
            <div aria-hidden="true" tabindex="-1" id="offline-message">You are XXXXXXX</div>
          </div>
          {/* <GetAllPosts
            threads={this.state.threads}
            handleData={this.handleData}
            refreshCatalog={this.refreshCatalog}
          /> */}

          {/* <DataAnalyser
            threadPosts={this.state.threadPosts}
            threadKey={this.state.threadKey}

            computed={this.state.computed}
            cards={this.state.cards}
            handleData={this.handleData}
            deepaiApiKey={this.state.deepaiApiKey}
          /> */}

          {this.state.loaded && (<PostSelectors

            connectionSpeed={this.state.connectionSpeed}

            threadPosts={this.state.threadPosts}
            threadKey={this.state.threadKey}

            updateImgPercent={this.updateImgDownloadPercent}
            imgPercent={this.state.imgDownloadPercent}

            updateImage={this.updateImage}
            threadImage={this.state.threadImage}

            updateImageUrls={this.updateImageUrls}
            imageUrls={this.state.imageUrls}

            updateIndex={this.updateIndex}
            postIndex={this.state.postIndex}

            updateNsfw={this.updateNsfw}
            revealNsfw={this.state.revealNsfw}

            updateTimelineZoomLevel={this.updateTimelineZoomLevel}
            timelineZoomLevel={this.state.timelineZoomLevel}

            showProgressBar={this.showProgressBar}
            isShowProgressBar={this.state.showProgressBar}

            handleData={this.handleData}
          />
          )}

          <Preload imagesObj={this.state.imageUrls} />




        </header>
      </div>
    );
  }
}

export default App;
