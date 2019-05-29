import img404 from '../../images/No_image_available.svg.png';
import React, { Component } from 'react';

let controller = new AbortController();
let signal = controller.signal;

let saveData = false;
let processing = 0;

export class GetImage extends Component {
    constructor(props) {
        super(props);
        this.getImage = this.getImage.bind(this);
        this.imageType = this.imageType.bind(this);
        this.readStream = this.readStream.bind(this);
    }

    async componentDidMount() {

        if ("connection" in navigator) {
            let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            if (connection.saveData === true) {
                saveData = true;
            } else {
                saveData = false;
            }
        }

        let postIndex = this.props.postIndex;
        let threadPosts = this.props.threadPosts;
        if (!threadPosts[postIndex]) { return };
        let tim = threadPosts[postIndex].posts[0].tim;
        let ext = threadPosts[postIndex].posts[0].ext;

        this.getImage(tim, ext, saveData);
    }

    async componentDidUpdate(prevProps) {

        let postIndex = this.props.postIndex;
        let threadPosts = this.props.threadPosts
        if (!threadPosts[postIndex]) { return };
        let tim = threadPosts[postIndex].posts[0].tim;
        let ext = threadPosts[postIndex].posts[0].ext;


        if ((this.props.postIndex !== prevProps.postIndex) || this.props.threadKey !== prevProps.threadKey) {
            this.getImage(tim, ext, saveData);
        }
    }

    progress({ loaded, total }) {
        let percent = Math.round(loaded / total * 100);

        if (!percent) {
            this.props.updateImgPercent(0);
        } else {
            this.props.updateImgPercent(Math.round(loaded / total * 100));
        }
    }

    imageType(tim, ext, saveData) {

        let imageUrl;
        let imageUrls = Object.assign({}, this.props.imageUrls);

        // eslint-disable-next-line no-undef
        if (saveData || this.props.connectionSpeed < 3) {
            // eslint-disable-next-line no-undef
            if (Modernizr.webp && ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed_webp/${tim}.webp`;
                imageUrls.type = 'compressed_webp'
            } else {
                imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_compressed/${tim}${ext}`;
                imageUrls.type = 'compressed';
            }
        } else {
            imageUrl = `https://images.cryptostar.ga/file/lon1-static/images_lossless/${tim}${ext}`;
            imageUrls.type = 'lossless';
        }

        this.props.updateImageUrls(imageUrls);
        return imageUrl
    }

    async getImage(tim, ext, saveData) {

        let that = this;

        //Abort a fetch request before a new one is made.
        if (processing) {
            controller.abort();
        }

        let imageUrl = this.imageType(tim, ext, saveData);

        try {

            this.props.imageIsDownloading(true);

            setTimeout(() => {
                this.props.showProgressBar(true);
            }, 900);

            processing++;

            controller = new AbortController();
            signal = controller.signal;

            let response = await fetch(`${imageUrl}`, {
                method: 'get',
                signal: signal
            });

            if (response.status === 404) {
                throw new Error('404');
            }

            let contentLength = response.headers.get('content-length');
            if (!contentLength) {
                contentLength = NaN;
            }

            contentLength = parseInt(contentLength, 10);

            response = this.readStream(response, contentLength);

            let blob = await response.blob();

            this.props.updateImage(URL.createObjectURL(blob));

            this.props.showProgressBar(false);

        } catch (error) {

            console.log(error.message);
            this.props.updateImgPercent(0);

            if (error.message === "404") {
                this.props.updateImage(`${img404}`);
            } else if (error.message === 'The user aborted a request.') {
                //Request Aborted
            } else {
                this.props.updateImage(`disconnected`);
            }

        } finally {

            this.props.imageIsDownloading(false);
            processing--;

        }
    }

    readStream(response, total) {
        let that = this;
        let loaded = 0;

        let timer1 = setInterval(() => {
            this.progress({ loaded, total });
        }, 500);

        try {

            response = new Response(
                new ReadableStream({
                    start(controller) {
                        const reader = response.body.getReader();

                        read();
                        function read() {

                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    window.clearInterval(timer1);
                                    that.props.updateImgPercent(0);
                                    controller.close();
                                    return;
                                }
                                loaded += value.byteLength;
                                controller.enqueue(value);
                                read();
                            }).catch(error => {
                                console.error(error);
                                controller.error(error)
                            });
                        }
                    }
                })
                , { signal });

            return response;

        } catch (error) {

            window.clearInterval(timer1);
            throw error;

        }
    }

    render() {
        return (
            <div>

            </div>
        )
    }
}
