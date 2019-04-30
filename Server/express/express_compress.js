const imagemin = require('imagemin');

//Lossless
const imageminOptipng = require('imagemin-optipng');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminGifsicle = require('imagemin-gifsicle');

//Lossy
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGiflossy = require('imagemin-giflossy');

const path = require('path');
const os = require('os');

let compress = {

  imageminLossless(filename) {
    return imagemin([`${os.homedir()}/tmp-images/${filename}`], `${os.homedir()}/images/`, {
      plugins: [imageminJpegtran({
        progressive: true
      }),
      imageminOptipng({
        optimizationLevel: 2
      }),
      imageminGifsicle({
        interlaced: true
      })]
    });
  },

  imageminLossy(filename) {
    return imagemin([`${os.homedir()}/tmp-images/${filename}`], `${os.homedir()}/images_c/`, {
      plugins: [imageminMozjpeg({
        quality: 80,
        progressive: true
      }),
      imageminPngquant({
        optimizationLevel: 2,
        quality: [0.95, 1]
      }),
      imageminGiflossy({
        interlaced: true,
        lossy: 30
      })]
    });
  }

};


module.exports = compress;