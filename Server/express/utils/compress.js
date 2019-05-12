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
const shell = require('shelljs');

let compress = {

  imageminLossless(filename) {
    return imagemin([`${os.homedir()}/images/tmp-images/${filename}`], `${os.homedir()}/images/images_lossless/`, {
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
    return imagemin([`${os.homedir()}/images/tmp-images/${filename}`], `${os.homedir()}/images/images_compressed/`, {
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
  },

  convertToWebP(file) {
    let fileExtension = path.parse(file).ext;
    let fileName = path.parse(file).name;

    if (['.png', '.jpeg', '.jpg'].includes(fileExtension)) {
      shell.exec(`cwebp -q 80 ${os.homedir()}/images/tmp-images/${file} -o $HOME/images/images_compressed_webp/${fileName}.webp`);
    } else if ('.gif'.includes(fileExtension)) {
      shell.exec(`gif2webp -q 80 -mixed ${os.homedir()}/images/tmp-images/${file} -o $HOME/images/images_compressed_webp/${fileName}.webp`);
    } else {
      console.log(`File ${file} was not processed.`);
    }

  }

};


module.exports = compress;