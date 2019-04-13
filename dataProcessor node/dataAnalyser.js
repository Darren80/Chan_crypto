const analyser = require('./analyser.js');
const outliers = require('outliers');
const MongoClient = require('mongodb').MongoClient
const linkScore = require('./link-score');
const _ = require("underscore");

let connectedClient;

class DataAnalyser {
    constructor(retrivalTime, threadPosts, client) {
        this._threadPosts = threadPosts;
        this.retrivalTime = retrivalTime;
        connectedClient = client;
        this.startAnalyser();
    }

    get threadPosts() {
        if (!helper.preworkChecks(this._threadPosts)) {
            return false;
        }
        return this._threadPosts;
    }

    async updateThreadStateDEBUGMODE(threadPosts) {
        //Debug mode because algorithm metrics are exposed.
        let db = connectedClient.db('crypto');

        db.collection('computedThreads').updateOne({
            date: this.retrivalTime
        }, {
                $set: {
                    threads: threadPosts,
                    date: this.retrivalTime
                },
                $currentDate: { lastModified: true }
            }, {
                upsert: true
            });
    }

    async updateThreadStateAndMakeUserSafe(threadPosts) {
        //Ensure metrics used are not tied in with payload sent to the user.
        threadPosts.forEach((thread) => {
            delete thread.time_posted
            delete thread.links
            delete thread.tickers

            delete thread.rating
            delete thread.ratings
            thread.posts.forEach((post) => {
                delete post.Ωword_count
                delete post.Ωunique_word_count
                delete post.Ωunique_word_count_percent
            })
        })

        let db = connectedClient.db('crypto');

        db.collection('computedThreads').updateOne({
            date: this.retrivalTime
        }, {
                $set: {
                    threads: threadPosts,
                    date: this.retrivalTime
                },
                $currentDate: { lastModified: true }
            }, {
                upsert: true
            });
    }

    async startAnalyser() {

        // Deep-copy the array
        let threadPosts = JSON.parse(JSON.stringify(this.threadPosts));

        if (!this.threadPosts) {
            console.log("threadPosts is corrupted.")
            return;
        }

        // threadPosts = await analyser.fleschKincaid(threadPosts); //async //Unused
        // threadPosts = analyser.uniqueParticipants(threadPosts); //Unused

        // analyser.save(connectedClient);
        threadPosts = analyser.time(threadPosts);
        threadPosts = analyser.links(threadPosts);
        threadPosts = analyser.ticker(threadPosts);

        // Nudity Promise
        // let a = this.getNudityScores(threadPosts).then(nudityScoreArray => {
        //     threadPosts.forEach((thread, i) => {
        //         thread.nsfw_score = nudityScoreArray[i];
        //     });
        // })
        //     .catch(err => {
        //         console.error(err)
        //     });

        // Word counting Promise
        let b = analyser.postLength(threadPosts).then(wordCountArray => {
            threadPosts.forEach((thread, threadIndex) => {
                thread.posts.forEach((post, postIndex) => {

                    if (!wordCountArray[threadIndex][postIndex]) { return }
                    post.Ωword_count = wordCountArray[threadIndex][postIndex].Ωword_count;
                    post.Ωunique_word_count = wordCountArray[threadIndex][postIndex].Ωunique_word_count;
                    post.Ωunique_word_count_percent = wordCountArray[threadIndex][postIndex].Ωunique_word_count_percent;

                });
            });
        })
            .catch(err => {
                console.error(err)
            });

        Promise.all([b]).then(values => {
            // this.updateThreadStateDEBUGMODE(threadPosts);

            threadPosts = this.rate(threadPosts);
            threadPosts = _.sortBy(threadPosts, (thread) => thread.rating).reverse()

            this.updateThreadStateDEBUGMODE(threadPosts);
            // this.updateThreadStateAndMakeUserSafe(threadPosts);
            // console.log(threadPosts);
        })


        //this.filterLinks();
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

            //   if (rating < 0 && thread.nsfw_score > 0.35) {
            //     rating = rating * 45
            //   } else if (rating < 0) {
            //     rating = rating * 15
            //   }
            if (rating < 0) {
                rating = rating * 30
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
}

let helper = {
    preworkChecks(threadPosts) {

        // Bad data check
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
            console.log(`Array has missing values.`);
            console.log(threadPosts);

            //   let archiveStore = localforageInit.archiveStore();

            //   archiveStore.removeItem(this.props.threadKey).then(function () {
            //     console.log(`${this.props.threadKey} has been deleted!`);
            //   }).catch(function (err) {
            //     console.log(err);
            //   });

            return false;
        }

        return true;
    }
}

module.exports = DataAnalyser;