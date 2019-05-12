import React, { Component } from 'react';
require('vis/dist/vis.css');
const vis = require('vis');

export class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.createVisualisation = this.createVisualisation.bind(this);
        this.timescale = this.timescale.bind(this);
        this.monthDiff = this.monthDiff.bind(this);
    }

    componentDidMount() {
        this.createVisualisation();

        setInterval(() => {
            this.createVisualisation();
        }, 60 * 1000);
    }

    async createVisualisation() {

        // DOM element where the Timeline will be attached
        let container = document.getElementById('timeline');
        if (!container) { return }
        if (container.querySelector('.vis-timeline')) { return }


        let keys = [];

        let generateFakeKeys = () => {
            let startDate = new Date('2019-11-01T00:00:00');
            let keys = [];

            while (startDate.getFullYear() < 2020) {
                startDate.setMinutes(startDate.getMinutes() + 30);
                keys.push(startDate.getTime());
            }

            return keys;
        }

        let getKeys = async () => {
            try {
                const response = await fetch('https://cryptostar.ga/api/timeline');
                if (response.ok) {
                    const responseJson = await response.json();

                    return responseJson;
                }
            } catch (e) {
                console.log(e);
            }
        }

        //keys = await generateFakeKeys();
        keys = await getKeys();

        let data = keys.map((UNIX, i) => {

            let date = new Date(UNIX); let mins = ('0' + date.getMinutes()).slice(-2);

            let time24Hr = `${date.getHours()}:${mins}`;

            return { id: i, title: time24Hr, start: date, type: 'point' }
        });

        // Create a DataSet (allows two way data-binding)
        console.log(data);
        let items = new vis.DataSet(data)

        // Configuration for the Timeline
        let options = {
            height: '250px',
            stack: false,
            horizontalScroll: true,
            zoomKey: 'ctrlKey',
            zoomMin: 10400000,
            zoomMax: 3.1556952e+11,
            start: (() => {
                let zoom = this.props.timelineZoomLevel;
                return zoom ? zoom.start : null;
            })(),
            end: (() => {
                let zoom = this.props.timelineZoomLevel;
                return zoom ? zoom.end : null;
            })()
        };
        // Create a Timeline
        let timeline = new vis.Timeline(container, items, options);

        timeline.on('rangechanged', (properties) => {

            this.props.updateTimelineZoomLevel(properties);

            let startDate = new Date(keys[keys.length - 1]);
            let endDate = new Date(keys[0]);

            let monthDifference = this.monthDiff(startDate, endDate);

            let start = new Date(properties.start);
            let end = new Date(properties.end);
            let delta = end - start;
            let itemsPerMonth = 1;

            console.log(this.timescale(delta));

            switch (this.timescale(delta)) {
                case '1hour':
                    itemsPerMonth = 999999;
                    break;
                case '2hour':
                    itemsPerMonth = 999999;
                    break;
                case '1day':
                    itemsPerMonth = 999999;
                    break;
                case '2day':
                    itemsPerMonth = 192;
                    break;
                case '1week':
                    itemsPerMonth = 96;
                    break;
                case '2week':
                    itemsPerMonth = 48;
                    break;
                case '1month':
                    itemsPerMonth = 24;
                    break;
                case '2month':
                    itemsPerMonth = 12;
                    break;
                case '1year':
                    itemsPerMonth = 6;
                    break;
                case '2year':
                    itemsPerMonth = 3;
                    break;
                default:
                    itemsPerMonth = 1.5;
                    break;
            };

            let data = [];

            let nthItem = Math.floor(keys.length / (monthDifference * itemsPerMonth)) || 1;
            console.log(nthItem);

            let monthItems = keys.reduce((items, key, i) => {
                if (i % nthItem === 0) {
                    let keyDate = new Date(key);
                    let time24Hr = `${keyDate.getHours()}:${keyDate.getMinutes()}`;
                    let item = { id: key, title: `${time24Hr}`, start: keyDate, type: 'point', style: 'padding: 0.4rem' };
                    items.push(item);
                }
                return items;
            }, []);

            data.push(monthItems);
            console.log(data);

            data = data.flat();

            startDate.setUTCMonth(startDate.getUTCMonth() + 1);

            let items = new vis.DataSet(data);
            timeline.setItems(items);

        });

        timeline.on('select', async (properties) => {
            try {
                let response = await fetch('https://cryptostar.ga/api/timeline', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: properties.items[0]
                    })
                });

                if (response.ok) {
                    let responseJson = await response.json();
                    this.props.handleData('posts', responseJson.threads, properties.items[0]);
                }
            } catch (e) {
                console.log(e);
            }

            let key = Number(properties.items[0]);
            // 
        });
    }

    timescale(unixDelta) {
        let times = {
            halfHour: 3.6e+6 / 2,
            hour: 3.6e+6,
            halfDay: 8.64e+7 / 2,
            day: 8.64e+7,
            halfWeek: 6.048e+8 / 2,
            week: 6.048e+8,
            halfMonth: 2.628e+9 / 2,
            month: 2.628e+9,
            halfYear: 3.154e+10 / 2,
            year: 3.154e+10,
            halfDecade: 3.154e+11 / 2,
            decade: 3.154e+11
        }
        // console.log(unixDelta);

        if (unixDelta < times.halfDay) {
            return '1day';
        } else if (unixDelta < times.day && unixDelta > times.halfDay) {
            return '2day';
        } else if (unixDelta < times.halfWeek && unixDelta > times.day) {
            return '1week';
        } else if (unixDelta < times.week && unixDelta > times.halfWeek) {
            return '2week';
        } else if (unixDelta < times.halfMonth && unixDelta > times.week) {
            return '1month';
        } else if (unixDelta < times.month && unixDelta > times.halfMonth) {
            return '2month';
        } else if (unixDelta < times.halfYear && unixDelta > times.month) {
            return '1year';
        } else if (unixDelta < times.year && unixDelta > times.halfYear) {
            return '2year';
        } else if (unixDelta < times.halfDecade && unixDelta > times.year) {
            return '1decade';
        } else if (unixDelta < times.decade && unixDelta > times.halfDecade) {
            return '2decade';
        }
        return false;

    }

    monthDiff(startDate, endDate) {
        let year1 = startDate.getFullYear();
        let year2 = endDate.getFullYear();
        let month1 = startDate.getMonth();
        let month2 = endDate.getMonth();
        if (month1 === 0) { //Have to take into account
            month1++;
            month2++;
        }
        //excluding both month1 and month2

        // return (year2 - year1) * 12 + (month2 - month1) - 1;
        //include either of the months

        // return (year2 - year1) * 12 + (month2 - month1);
        //include both of the months

        return (year2 - year1) * 12 + (month2 - month1) + 1;
    }

    render() {
        return (
            <div>
                <h4>Archival Times</h4><h6>Press the Ctrl key and scroll to zoom</h6>
                <div id="timeline"></div>
            </div>
        )
    }
}