
const board = 'biz';
const corsProxy = 'https://cors-proxy-0.herokuapp.com/';
const os = require('os')

let config = {
    catalogUrls: ["https://a.4cdn.org/" + board + "/catalog.json", corsProxy + "https://a.4cdn.org/" + board + "/catalog.json"],

    postUrls: ["https://a.4cdn.org/" + board + "/thread/", corsProxy + "https://a.4cdn.org/" + board + "/thread/"],

    imagesUrls: [`https://i.4cdn.org/biz/`, corsProxy + `https://i.4cdn.org/biz/`],

    imageOptimserEntryScript: '$HOME/startImgOpti.sh'
}

let paths = {
    images_ls: `${os.homedir()}/images/images-list.txt`
}

module.exports = {
    config,
    paths
};