const localforage = require('localforage');

export let localforageInit = {
    archiveStore() {
        return localforage.createInstance({
            driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
            name: '/biz/',
            version: 1.0,
            storeName: 'IndexDB', // Should be alphanumeric, with underscores.
            description: '/biz/ Archive'
        });
    },

    wordStore() {
        return localforage.createInstance({
            driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
            name: '/biz/',
            version: 1.0,
            storeName: 'words', // Should be alphanumeric, with underscores.
            description: 'All English Words'
        });
    },

    computedStore() {
        return localforage.createInstance({
            driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
            name: '/biz/',
            version: 1.0,
            storeName: 'computed', // Should be alphanumeric, with underscores.
            description: 'Processed posts'
        });
    },

    nsfwScoreStore() {
        return localforage.createInstance({
            driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
            name: '/biz/',
            version: 1.0,
            storeName: 'nsfw_store', // Should be alphanumeric, with underscores.
            description: 'Ratings for various images'
        });
    },

    async retriveNewestUNIXKey() {

        let archiveStore = localforageInit.archiveStore();

        return await archiveStore.keys().then(uNIXkeys => {
            // An array of all the keys.
            // Retrive the newest post (UTC Time).
            return Math.max(...uNIXkeys);
        }).catch(function (err) {
            console.log(err);
        });
    },

    async retriveAllUNIXKeys() {

        let archiveStore = localforageInit.archiveStore();
    
        return await archiveStore.keys().then(uNIXkeys => {
          // Return an array of all the keys.
          return uNIXkeys;
        }).catch(function (err) {
          console.log(err);
        });
      },

      async getItem(key) {

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
}