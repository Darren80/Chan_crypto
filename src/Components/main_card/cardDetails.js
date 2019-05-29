import React, { Component } from 'react';

//Material UI
import LinearProgress from '@material-ui/core/LinearProgress';
import { Button } from '@material-ui/core';



let saveData = false;

export class CardDetails extends React.Component {
    constructor(props) {
        super(props);
        this.constructCard = this.constructCard.bind(this);
        this.progressBar = this.progressBar.bind(this);
        this.cardImage = this.cardImage.bind(this);
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
    }

    progressBar() {
        if (!this.props.isShowProgressBar) {
            return;
        }

        if (this.props.isDownloading) {

            if (this.props.imgPercent === 0) {
                return <LinearProgress
                    className="linear-progress"
                    color="secondary"
                />
            } else if (this.props.imgPercent > 0) {
                return <LinearProgress
                    className="linear-progress"
                    color="secondary"
                    variant="determinate"
                    value={this.props.imgPercent}
                />
            }
            return <></>
        }

        // if (this.props.threadImage === 'disconnected') {
        //     return <div>
        //         <p>Check your connection and try again.</p>
        //         <button onClick={() => this.forceUpdate()}>Retry</button>
        //     </div>
        // } 

    }

    cardImage() {
        let postIndex = this.props.postIndex;
        let threadPosts = this.props.threadPosts;

        let style = {
            backgroundImage: `url(${this.props.threadImage})`
        }
        if (threadPosts[postIndex].nsfw_score > 0.43) {
            if (this.props.revealNsfw === true) {
                return (
                    <div className="post-image fade-in" style={style}>
                    </div>
                )
            } else {
                return (
                    <div className="nsfw">
                        <Button onClick={this.nsfwReveal} className="">
                            <h5>Content Warning: This image may contain sensitive content</h5>
                            <p>Click to view</p>
                        </Button>
                    </div>
                )
            }
        } else {
            return (
                <div className="post-image" style={style}>
                </div>
            )
        }

    }

    constructCard() {
        let postIndex = this.props.postIndex;
        let threadPosts = this.props.threadPosts;

        let title = threadPosts[postIndex].posts[0].sub;
        let description = threadPosts[postIndex].posts[0].com;
        let rating = Math.fround(threadPosts[postIndex].rating);

        let tim = threadPosts[postIndex].posts[0].tim;
        let ext = threadPosts[postIndex].posts[0].ext;
        let crntImage = `${tim}${ext}`;

        let getThread = (relativeIndex) => {
            if (postIndex + relativeIndex < 0) {
                //if value is -3 will not go further back than 150.
                return threadPosts[threadPosts.length - 1];
            } else if (postIndex + relativeIndex > threadPosts.length - 1) {
                return threadPosts[0]
            } else {
                return threadPosts[postIndex + relativeIndex];
            }
        }

        let bwImage = `${getThread(-1).posts[0].tim}${getThread(-1).posts[0].ext}`;
        let bwImage2 = `${getThread(-2).posts[0].tim}${getThread(-2).posts[0].ext}`

        let fwImage = `${getThread(1).posts[0].tim}${getThread(1).posts[0].ext}`;
        let fwImage2 = `${getThread(2).posts[0].tim}${getThread(2).posts[0].ext}`;

        let hours = Math.abs(new Date(this.props.threadKey) - new Date(tim)) / 36e5;
        
        hours = hours.toFixed(1);
        let postCount = threadPosts[postIndex].posts.length;

        let imageUrls = this.props.imageUrls;
        if (!imageUrls.preloadImages.includes(bwImage)) {
            this.props.updateImageUrls({
                ...imageUrls,
                preloadImages: [bwImage, fwImage, bwImage2, fwImage2]
            });
        }


        return (
            <div className="post" key={postIndex}>
                {this.cardImage()}
                {this.progressBar()}

                <p className="post-image-link">{this.props.connectionSpeed}Mb/s</p>
                <p>{`https://images.cryptostar.ga/file/lon1-static/images_lossless/${tim}${ext}`}</p>
                <h1>Thread #{postIndex + 1} | Replies: {postCount}</h1>
                <h2>{`${title || ''} ${rating}`}</h2>

                <p className="post-text" dangerouslySetInnerHTML={{ __html: description }}></p>

            </div>
        );
    };

    render() {
        return (
            <div>
                {this.constructCard()}
            </div>
        )
    }
}