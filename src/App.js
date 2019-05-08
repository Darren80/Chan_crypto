import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { GetAllPosts } from './Components/GetAllPosts.js';
import { DataAnalyser } from './Components/DataAnalyser.js';
import { PostSelectors } from './Components/PostSelectors.js';

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
      deepaiApiKey: '',
      revealNsfw: false
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


  }

  componentDidMount() {
    // let timer1 = setInterval(this.fetchBoardCatalog, 30000);
    // this.setState({timer1: timer1});
    this.fetchBoardCatalog();

    if ("connection" in navigator) {
      setInterval(() => {
        this.setState({
          connectionSpeed: navigator.connection.downlink
        });
      }, 1000);
    }
    
  }

  async fetchBoardCatalog() {
    //Retrive the latest /biz/ catalog
    this.prepareData();
    return;
    let url = corsProxy + "https://a.4cdn.org/" + board + "/catalog.json";

    try {
      const response = await fetch(url);
      if (response.ok) {
        const jsonResponse = await response.json();
        this.setState({
          catalog: jsonResponse
        });

      }
    } catch (e) {
      console.log(e);
    }
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
    console.log("Set Image in State");

    this.setState({
      threadImage: img
    });
  }

  updateNsfw() {
    this.setState({
      revealNsfw: true
    })
  }

  updateTimelineZoomLevel(zoomLevel) {
    this.setState({
      timelineZoomLevel: zoomLevel
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
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

            updateIndex={this.updateIndex}
            postIndex={this.state.postIndex}

            updateNsfw={this.updateNsfw}
            revealNsfw={this.state.revealNsfw}

            updateTimelineZoomLevel={this.updateTimelineZoomLevel}
            timelineZoomLevel={this.state.timelineZoomLevel}

            handleData={this.handleData}
          />
          )}


        </header>
      </div>
    );
  }
}

export default App;
