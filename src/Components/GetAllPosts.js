import React, { Component } from 'react';
import { localforageInit } from './utils/initLocalforage';
import { analyser } from './utils/analyser';

export class GetAllPosts extends React.Component {
  constructor(props) {
    super(props);
    this.getThreadPosts = this.getThreadPosts.bind(this);
    this.retriveNewestUNIXKey = this.retriveNewestUNIXKey.bind(this);
    this.retriveNewestValue = this.retriveNewestValue.bind(this);
    this.update = this.update.bind(this);

    this.getAllPosts = this.getAllPosts.bind(this);
    this.getAllPostsCallback = this.getAllPostsCallback.bind(this);
  }

  async componentDidMount() {

    let uNIXkey = await this.retriveNewestUNIXKey();
    let uNIXvalue = await this.retriveNewestValue(uNIXkey);
    if (uNIXkey) {
        this.getAllPostsCallback(Number(uNIXkey), uNIXvalue);
      }
    await this.update(990);

  }

  async update(delta) {

    if (delta > 35791) { delta = 35791 }

    setTimeout(async () => {

      await this.props.refreshCatalog();
      this.getAllPosts();

      this.update(analyser.generateCryptoRandomNumber(5, 30)); //Generate a random time between 10 and 30 minutes to make the timing of retrivals more unpredicatable.
      console.log(`Time till next update ${delta} minutes`);

    }, delta * 60000);
  }

  getAllPostsCallback(key, allThreadPosts) {
    this.props.handleData('posts', allThreadPosts, key);
  }

  async getAllPosts() {

    let key = `${Date.now()}`;
    let archiveStore = localforageInit.archiveStore();

    if (!Array.isArray(this.props.threads) || !this.props.threads.length) {
      // array does not exist, is not an array, or is empty
      return;
    }

    let itemsProcessed = 0;
    let allThreadPosts = [];

    this.props.threads.reverse().forEach((thread, index, array) => {

      //Limit polling to 1 every 1 second
      setTimeout(async () => {
        console.log(index);

        let threadPosts = await this.getThreadPosts(thread.no);
        allThreadPosts[index] = threadPosts;
        itemsProcessed++;

        if (array.length === itemsProcessed) {

          await archiveStore.setItem(key, allThreadPosts).then(success => {
            //Success
          }).catch(error => {
            console.log(error);
          });

          this.getAllPostsCallback(key, allThreadPosts);
        }

      }, index * 500);
    });

  }

  async retriveNewestUNIXKey() {

    let archiveStore = localforageInit.archiveStore();

    return await archiveStore.keys().then(uNIXkeys => {
      return Math.max(...uNIXkeys);
    }).catch(function (err) {
      console.log(err);
    });
  }

  async retriveNewestValue(key) {

    let archiveStore = localforageInit.archiveStore();
    let computedStore = localforageInit.computedStore();

    return await computedStore.getItem(key).then(async value => {
      if (!value) {
        value = await archiveStore.getItem(key);
      }
      return value;
    }).catch(function (err) {
      console.log(err);
    });
  }

  async getThreadPosts(threadNo) {
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

  render() {
    return (
      <div></div>
    )
  }
}
