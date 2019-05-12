const linkify = require('linkifyjs');
const cryptocurrencies = require('cryptocurrencies');
const top400Tickers = ['BTC', 'XRP', 'ETH', 'LTC', 'EOS', 'BCH', 'USDT', 'TRX', 'XLM', 'BNB', 'BSV', 'ADA', 'XMR', 'IOTA', 'DASH', 'NEO', 'MKR', 'ETC', 'XEM', 'ZEC', 'USDC', 'WAVES', 'XTZ', 'DOGE', 'VET', 'TUSD', 'ONT', 'BTG', 'QTUM', 'LINK', 'OMG', 'DCR', 'HOT', 'REP', 'BAT', 'ZRX', 'ZIL', 'LSK', 'PAX', 'BCN', 'NANO', 'BCD', 'DGB', 'BTS', 'NPXS', 'ICX', 'AE', 'XVG', 'STEEM', 'SC', 'GUSD', 'STRAT', 'BTM', 'DAI', 'R', 'IOST', 'KMD', 'PPT', 'SNT', 'ETN', 'CNX', 'REPO', 'GNT', 'MAID', 'AOA', 'THETA', 'ARDR', 'FCT', 'HT', 'HC', 'ODE', 'INB', 'XIN', 'ARK', 'LRC', 'WTC', 'QNT', 'LKY', 'PIVX', 'VERI', 'CRO', 'MANA', 'RDD', 'EURS', 'GXC', 'PAI', 'MCO', 'AION', 'KCS', 'NEXO', 'ETP', 'DGD', 'XZC', 'ELA', 'RVN', 'POWR', 'BNT', 'WAX', 'DENT', 'MONA', 'WAN', 'ELF', 'MOAC', 'POLY', 'B2G', 'SAN', 'PAY', 'DGTX', 'LOOM', 'CENNZ', 'NULS', 'ZEN', 'NXT', 'QKC', 'NAS', 'TOMO', 'FUN', 'APL', 'WICC', 'SYS', 'AGI', 'BTCP', 'ENG', 'QASH', 'MGO', 'EDR', 'BCZERO', 'DCN', 'GBYTE', 'ENJ', 'GBC', 'GAS', 'RLC', 'OSA', 'EDO', 'RNT', 'KNC', 'PART', 'CMT', 'DRGN', 'STORJ', 'MITH', 'MFT', 'KIN', 'NXS', 'BRD', 'CHX', 'XPX', 'QBIT', 'IOTX', 'SALT', 'GVT', 'CVC', 'CND', 'XYO', 'EDG', 'SUB', 'CTXC', 'UNO', 'GRS', 'C20', 'BOS', 'AUTO', 'NEBL', 'INO', 'HYC', 'REQ', 'TCT', 'GTO', 'GETX', 'STORM', 'BIX', 'SRN', 'MDA', 'TRUE', 'PLC', 'SXDT', 'PPC', 'VTC', 'LOC', 'ETHOS', 'OCN', 'BFT', 'VEE', 'GNO', 'BZNT', 'WGR', 'PZM', 'SKY', 'EMC', 'DATA', 'CNUS', 'TKY', 'NSD', 'BLOCK', 'LML', 'TEL', 'POE', 'QRL', 'IGNIS', 'SMT', 'MAN', 'TPAY', 'DDD', 'PMA', 'RDN', 'MTL', 'ECOREAL', 'ANT', 'REN', 'CRPT', 'OST', 'STACS', 'NEC', 'RHOC', 'DMT', 'UTK', 'SLS', 'DEX', 'TEN', 'VITAE', 'HEDG', 'NCASH', 'MLN', 'CS', 'MEDX', 'BCO', 'NAV', 'RUFF', 'EVR', 'SLT', 'TKN', 'DLT', 'NMC', 'SMART', 'VIBE', 'LCC', 'DROP', 'SBD', 'FSN', 'INS', 'EMC2', 'QSP', 'GOT', 'PLR', 'HYN', 'NKN', 'APIS', 'EVN', 'SAFEX', 'PPP', 'FIII', 'EVN', 'LEND', 'SWM', 'GTC', 'BRZC', 'MOC', 'WINGS', 'BLZ', 'ADX', 'ECA', 'AMB', 'MXM', 'BURST', 'UBQ', 'CPT', 'NLG', 'CWV', 'LRN', 'NRG', 'AOG', 'XWC', 'MDS', 'SDA', 'BCV', 'TIOX', 'LEO', 'HPB', 'WABI', 'NIX', 'COSS', 'XDN', 'COSM', 'FLO', 'SPHTX', 'MWAT', 'BEAM', 'BAX', 'SNGLS', 'PHX', 'KEY', 'ITC', 'VIA', 'TNB', 'WPR', 'ABT', 'SNM', 'MXC', 'LA', 'ABT', 'NEU', 'BAY', 'DNT', 'MET', 'NOAH', 'LAMB', 'CSC', 'SCRL', 'IHT', 'META', 'FAIR', 'WCT', 'ZIP', 'HUM', 'MOD', 'BITCNY', 'EDR', 'CLOAK', 'RFR', 'PRO', 'TNT', 'VITE', 'PLY', 'POA', 'FOAM', 'BTO', 'HYDRO', 'WWB', 'AMO', 'KAT', 'XSN', 'BPT', 'QNTU', 'MED', 'RCN', 'ACT', 'QLC', 'JNT', 'CLAM', 'DTA', 'CPC', 'EVX', 'TRIO', 'SOC', 'XAS', 'GAME', 'CBC', 'ZCL', 'TMC', 'CVNT', 'CVT', 'DX', 'TRAC', 'ATCC', 'OIO', 'LBC', 'MOBI', 'MTH', 'QCH', 'LGO', 'PRG', 'CDT', 'ARN', 'POLIS', 'RBLX', 'ROX', 'TTC', '$PAC', 'PST', 'DBET', 'SSP', 'LOKI', 'NPX', 'FTM', 'INT', 'DEC', 'NMR', 'DGX', 'LYL', 'LYM', 'PAI', 'KAN', 'RTH', 'APPC', 'DERO', 'TIX', 'CRYP', 'BITUSD', 'CNN', 'LBA', 'MER', 'LINDA', 'XCP', 'VIB', 'YOYOW', 'NTY', 'POT']
// const fleschKincaid = require('flesch-kincaid');

const _ = require("underscore");

var allWords;

export let analyser = {

    async postLength(threadPosts) {

        return new Promise(async (resolve, reject) => {

            let wordCountArray = [];
            for (let [index, thread] of threadPosts.entries()) {
                wordCountArray[index] = [];
                for (let post of thread.posts) {

                    if (post.Ωword_count && post.Ωunique_word_count && post.Ωunique_word_count_percent) { continue };

                    let comText = helper.removeHTML(post.com);
                    let subText = helper.removeHTML(post.sub);

                    //Use the Omega Ω symbol to push items to the bottom of the list. Ω comes after z.
                    let Ωword_count = helper.countWords(comText) + helper.countWords(subText);
                    let Ωunique_word_count = await helper.countUniqueRealWords(comText + " " + subText);
                    let Ωunique_word_count_percent = Math.round(Ωunique_word_count / Ωword_count * 100);

                    wordCountArray[index].push({
                        'Ωword_count': Ωword_count, 
                        'Ωunique_word_count': Ωunique_word_count,
                        'Ωunique_word_count_percent': Ωunique_word_count_percent
                    });

                }

                let percentDone = Math.round(((index + 1) / 150) * 100);
                if (percentDone % 10 === 0) {
                    console.log(`${percentDone}%`); //Percent done.
                }

            };

            resolve(wordCountArray);

        }).catch(error => {
            console.log(error);
        });
    },

    ticker(threadPosts) {

        //TODO: Limit symbols to 3 per post
        //TODO: Limit to the top 400 cryptocurrencies

        for (let [index, thread] of threadPosts.entries()) {
            let matchesInThread = [];
            for (let post of thread.posts) {
                let comText = helper.removeHTML(post.com);
                let subText = helper.removeHTML(post.sub);

                let tickerSymbolRegExp = /([A-Z]){2,}/g;
                let counter = 0;
                let matches;
                while ((matches = tickerSymbolRegExp.exec(comText + " " + subText)) !== null) {

                    if (top400Tickers.includes(matches[0])) {
                        matchesInThread.push(matches[0]);
                        counter++;
                    }

                    if (counter === 2) {
                        break;
                    };

                };
            }
            thread.tickers = matchesInThread;
            // if (matchesInThread.length) { console.log(matchesInThread, index); }
        }
        console.log(threadPosts);
        return threadPosts;
    },

    uniqueParticipants(threadPosts) {

        threadPosts.forEach(thread => {

            thread.ids = thread.posts.length;
            thread.uniqueIDs = thread.posts[0].unique_ips;
            thread.uniqueIDsPercent = Math.round(thread.uniqueIDs / thread.posts.length * 100);
        });

        return threadPosts;
    },

    // async fleschKincaid(threadPosts) {

    //     return await new Promise((resolve, reject) => {
    //         for (let [index, thread] of threadPosts.entries()) {

    //             let cleanText = ".";
    //             if (typeof thread.posts[0].com === "string" && typeof thread.posts[0].sub === "string") {

    //                 cleanText = thread.posts[0].sub.replace(/<br>/g, ". ") + "  " + thread.posts[0].com.replace(/<br>/g, ". ");
    //                 cleanText = helper.removeHTML(cleanText).replace(/[>]/g, " ");

    //             } else if (typeof thread.posts[0].com === "string") {

    //                 cleanText = thread.posts[0].com.replace(/<br>/g, ". ");
    //                 cleanText = helper.removeHTML(cleanText).replace(/[>]/g, " ");

    //             } else if (typeof thread.posts[0].sub === "string") {

    //                 cleanText = thread.posts[0].sub.replace(/<br>/g, ". ");
    //                 cleanText = helper.removeHTML(cleanText).replace(/[>]/g, " ");

    //             }

    //             let links = linkify.find(cleanText);
    //             links.forEach(link => {
    //                 cleanText = cleanText.split(link.value).join("");
    //             });

    //             let rating;
    //             try {
    //                 rating = fleschKincaid.rate(cleanText);
    //             } catch (error) {
    //                 console.log(`error at ${index}: ${error}`);
    //                 rating = "none";
    //             }

    //             thread.fleschRating = rating;

    //         };
    //         resolve(threadPosts);
    //     }).catch(error => {
    //         console.log(error);
    //     });
    // },

    links(threadPosts) {

        threadPosts.forEach(thread => {
            thread.links = [];
            thread.posts.forEach((post, i) => {
                let arrayOfLinks = linkify.find(post.com + " " + post.sub);
                if (arrayOfLinks.length !== 0) {
                    thread.links.push({
                        postNo: i,
                        postId: post.id,
                        linksInPost: arrayOfLinks
                    })
                }
            });
        });
        return threadPosts;
    },

    time(threadPosts) {

            threadPosts.forEach((thread, i) => {
                threadPosts[i].time_posted = thread.posts[0].time;
            });
            return threadPosts;
    },

    generateCryptoRandomNumber(min, max) {
        return helper.crypto(min, max);
    }
};

let retrive = {

}

export let helper = {

    //Remove html from HTML text
    removeHTML(html) { 
        let div = document.createElement("div");
        div.innerHTML = html;
        let text = div.innerText || div.textContent || "";

        //Remove ALL punctuation from a sentence in order for the word counter to work.
        text = text.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, " ");
        return text;
    },

    crypto(min, max) { // Generate a random time between min and max. min and max included.

        //Generate two cryptographically random, unsigned 32-bit integers
        let array = new Uint32Array(2);
        window.crypto.getRandomValues(array);

        // keep all 32 bits of the the first, top 20 of the second for 52 random bits
        let mantissa = (array[0] * Math.pow(2, 20)) + (array[1] >>> 12)
        // shift all 52 bits to the right of the decimal point
        let result = mantissa * Math.pow(2, -52);

        if (!min || !max) {
            min = 0; max = 1;
        }
        //
        return Math.floor(result * (max - min + 1) + min);
    },

    countWords(str, unique) {
        str = str.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
        str = str.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
        str = str.replace(/\n /, "\n"); // exclude newline with a start spacing

        if (unique) { //Count only words that are unique
            return new Set(str.split(' ').filter(function (str) { return str != ""; })).size;
        } else {
            return str.split(' ').filter(function (str) { return str != ""; }).length;
        }
        //return s.split(' ').filter(String).length; - this can also be used
    },

    async countUniqueRealWords(str) {
        str = str.replace(/(^\s*)|(\s*$)/gi, "");//exclude start and end white-space
        str = str.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
        str = str.replace(/\n /, "\n"); // exclude newline with a start spacing

        let counter = 0;
        if (!allWords) {
            // let wordsStore = localforageInit.wordStore();
            // await wordsStore.getItem("allWords").then((words) => {
            //     allWords = words.map(word => word.toLowerCase().trim());
            // }).catch(function (err) {
            //     // This code runs if there were any errors
            //     console.log(err);
            //     return err;
            // });
        }

        str.split(' ').forEach((str, i, array) => {

            str = str.toLowerCase();
            if (allWords.includes(str) && str !== "") {
                counter++;
            }
        });
        return counter;
    }

}