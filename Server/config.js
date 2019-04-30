
const board = 'biz';
const corsProxy = 'https://cors-proxy-0.herokuapp.com/';


let config = {
    catalogUrls: ["https://a.4cdn.org/" + board + "/catalog.json", corsProxy + "https://a.4cdn.org/" + board + "/catalog.json"],

    postUrls: ["https://a.4cdn.org/" + board + "/thread/", corsProxy + "https://a.4cdn.org/" + board + "/thread/"],

    imagesUrls: [`https://i.4cdn.org/biz/`, corsProxy + `https://i.4cdn.org/biz/`],

    imageOptimserEntryScript: '$HOME/startImgOpti.sh'
}

module.exports = config;