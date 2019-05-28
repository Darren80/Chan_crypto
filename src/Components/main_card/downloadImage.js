import img404 from '../../images/No_image_available.svg.png';

let controller = new AbortController();
let signal = controller.signal;

let processing = 0;

export default {
    async getImage(tim, ext, saveData) {

        // window.modernizr.on('webp', function (result) {
        //   console.log(result);
        // });

        let imageStr;
        let imageUrl;
        let that = this;
        let type;

        //Abort a fetch request before a new one is made.
        if (processing) {
            controller.abort();
        }
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

        try {

            setTimeout(() => {
                this.props.showProgressBar(true);
            }, 1000);

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
                contentLength = 0;
            }

            const total = parseInt(contentLength, 10);
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

            } catch (error) {

                throw error;

            }

            let blob = await response.blob();

            this.props.updateImage(URL.createObjectURL(blob));

            this.props.showProgressBar(false);

        } catch (error) {

            console.log(error.message);
            that.props.updateImgPercent(0);
            if (error.message === "404") {
                this.props.updateImage(`${img404}`);
            } else if (error.message === 'The user aborted a request.') {
                //Request Aborted
            } else {
                this.props.updateImage(`disconnected`);
            }

        } finally {

            processing--;
            return imageStr;

        }
    }
}