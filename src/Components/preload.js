import React, { Component } from 'react';
import quicklink from "quicklink/dist/quicklink.mjs";

export class Preload extends Component {
    constructor(props) {
        super(props);
        this.quicklinks = this.quicklinks.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.imagesObj !== prevProps.imagesObj) {
            this.quicklinks();
        }
    }

    quicklinks() {
        let imagesObj = this.props.imagesObj;

        if (!Array.isArray(imagesObj.preloadImages)) {
            return;
        }

        let type = imagesObj.type;

        let images = imagesObj.preloadImages.map(filename => {
            let filenameNoExtension = filename.replace(/\.[^/.]+$/, "");
            if (type === 'compressed_webp') {
                return `https://images.cryptostar.ga/file/lon1-static/images_compressed_webp/${filenameNoExtension}.webp`;
            } else if (type === 'compressed') {
                return `https://images.cryptostar.ga/file/lon1-static/images_compressed/${filename}`;
            } else if (type === 'lossless') {
                return `https://images.cryptostar.ga/file/lon1-static/images_lossless/${filename}`;
            }
            return ''; //`https://images.cryptostar.ga/file/lon1-static/images_lossless/${filename}`;
        })
        console.log(images);
        quicklink({
            urls: [...images],
            priority: true,
            origins: true
        });
    }

    render() {
        return (
            <div></div>
        )
    }
}