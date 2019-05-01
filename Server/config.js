
const board = 'biz';
const corsProxy = 'https://cors-proxy-0.herokuapp.com/';
const os = require('os');

let urls = {
    catalogUrls: ["https://a.4cdn.org/" + board + "/catalog.json", corsProxy + "https://a.4cdn.org/" + board + "/catalog.json"],

    postUrls: ["https://a.4cdn.org/" + board + "/thread/", corsProxy + "https://a.4cdn.org/" + board + "/thread/"],

    imagesUrls: [`https://i.4cdn.org/biz/`, corsProxy + `https://i.4cdn.org/biz/`]
}

let paths = {
    images_ls: `${os.homedir()}/images/images_list.txt`,//`${os.homedir()}/images/images-list.txt`,
    imageOptimserEntryScript: '$HOME/startImgOpti.sh'
}

module.exports = {
    urls,
    paths
};